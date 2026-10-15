import { sortAndPositionQueue, QueueJob } from '../lib/queueOrder';

/**
 * SAMPLE QUEUE DATA FOR DEMO_MODE
 *
 * PRIVACY DIRECTIVE:
 * TODO: The Laravel API must never send other students' personal details,
 * student IDs, avatars, or file names. In the client, only position,
 * slot time, and generic status ('Waiting', 'Next up') are exposed.
 *
 * Mock data uses only generic placeholders ("Student A", "Student B")
 * and no performance statistics or real names.
 */

const QUEUE_STORAGE_KEY = 'printfy_live_queue_jobs';

function loadStoredQueue(): QueueJob[] {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load queue from storage', e);
  }
  return [];
}

function saveStoredQueue(jobs: QueueJob[]) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(jobs));
    }
  } catch (e) {
    console.warn('Failed to save queue to storage', e);
  }
}

// Live dynamic queue: starts empty by default, only contains jobs actually added
let dynamicMockJobs: QueueJob[] = loadStoredQueue();

/**
 * Returns sorted live queue, integrating the user's active job if provided.
 * Mock data is completely removed; only shows the specific jobs added.
 */
export function getMockQueue(userJob?: Partial<QueueJob> | null): QueueJob[] {
  dynamicMockJobs = loadStoredQueue();
  let combined = [...dynamicMockJobs];

  if (userJob && userJob.id) {
    const rawStatus = String(userJob.status || 'queued').toLowerCase().trim();
    const normalizedStatus: JobStatus = (
      rawStatus === 'printing' ? 'printing' :
      rawStatus === 'almost_your_turn' ? 'almost_your_turn' :
      rawStatus === 'waiting_for_student' ? 'waiting_for_student' :
      rawStatus === 'ready' || rawStatus === 'ready for pickup' || rawStatus === 'ready_for_pickup' ? 'ready' :
      'queued'
    );

    const isPaid = String(userJob.paymentStatus || '').toLowerCase() === 'paid';
    const realPages = Math.max(1, Number(userJob.pages) || 1);
    const realRate = userJob.colorMode === 'Color' ? 15 : 10;
    const realCopies = Math.max(1, Number(userJob.copies) || 1);
    const totalJobCost = userJob.cost != null ? userJob.cost : realPages * realCopies * realRate;

    // ONLY calculate the amount which needs to be paid:
    // If already paid -> amountDue is strictly 0
    // If unpaid -> amountDue is strictly remaining payable amount
    const calculatedAmountDue = isPaid ? 0 : (userJob.amountDue != null ? userJob.amountDue : totalJobCost);

    const userQueueJob: QueueJob = {
      id: userJob.id,
      slot: userJob.slot || (userJob as any).pickupTime || '10:00 AM',
      submittedAt: userJob.submittedAt || new Date().toISOString(),
      status: normalizedStatus,
      isUserJob: true,
      fileName: userJob.fileName || userJob.name || 'Document.pdf',
      name: userJob.name || userJob.fileName || 'Document.pdf',
      genericAlias: 'You',
      pages: realPages,
      colorMode: userJob.colorMode || 'B&W',
      duplex: userJob.duplex || (userJob as any).duplexMode || 'Single-sided',
      canArrive: userJob.canArrive !== undefined ? userJob.canArrive : false,
      canCancel: userJob.canCancel !== undefined ? userJob.canCancel : true,
      paymentStatus: isPaid ? 'paid' : 'unpaid',
      amountDue: calculatedAmountDue,
      estimatedWaitMinutes: userJob.estimatedWaitMinutes != null ? userJob.estimatedWaitMinutes : null,
      progress: userJob.progress ?? null,
    };

    // Remove any previous record of this job and save new record
    combined = combined.filter((j) => String(j.id) !== String(userJob.id));
    combined.push(userQueueJob);
    dynamicMockJobs = combined;
    saveStoredQueue(dynamicMockJobs);
  }

  return sortAndPositionQueue(combined);
}

/**
 * Simulates server-side slot update for DEMO_MODE.
 * The server reapplies the ordering and returns the new position.
 */
export function mockChangeSlot(jobId: string | number, newSlot: string, userJob?: Partial<QueueJob> | null): {
  success: boolean;
  job: QueueJob;
  queue: QueueJob[];
} {
  const currentQueue = getMockQueue(userJob);
  const target = currentQueue.find((j) => String(j.id) === String(jobId));

  if (!target) {
    throw new Error('Print job not found in queue');
  }

  const updatedTarget: QueueJob = {
    ...target,
    slot: newSlot,
  };

  // Update dynamicMockJobs in memory and storage so polling retains the updated slot
  dynamicMockJobs = dynamicMockJobs.map((j) =>
    String(j.id) === String(jobId) ? { ...j, slot: newSlot } : j
  );
  saveStoredQueue(dynamicMockJobs);

  const reordered = sortAndPositionQueue(
    currentQueue.map((j) => (String(j.id) === String(jobId) ? updatedTarget : j))
  );

  const updatedJobWithPosition = reordered.find((j) => String(j.id) === String(jobId))!;

  return {
    success: true,
    job: updatedJobWithPosition,
    queue: reordered,
  };
}

/**
 * Simulates desk check-in for DEMO_MODE ("I'm Here - Start My Print").
 * Sets job to printing status, moves it to top position, sets payment to paid, and updates queue.
 */
export function mockCheckInAtDesk(jobId: string | number): {
  success: boolean;
  job: QueueJob;
  queue: QueueJob[];
} {
  dynamicMockJobs = dynamicMockJobs.map((j) => {
    if (String(j.id) === String(jobId) || j.isUserJob) {
      return {
        ...j,
        status: 'printing' as const,
        slot: 'Now',
        isUserJob: true,
        canArrive: false,
        canCancel: false,
        paymentStatus: 'paid' as const,
        amountDue: 0,
        progress: 15,
      };
    }
    // Demote any previously printing job to ready
    if (j.status === 'printing') {
      return { ...j, status: 'almost_your_turn' as const, progress: null };
    }
    return j;
  });

  saveStoredQueue(dynamicMockJobs);
  const reordered = sortAndPositionQueue(dynamicMockJobs);
  const updatedJob =
    reordered.find((j) => String(j.id) === String(jobId) || j.isUserJob) || reordered[0];

  return {
    success: true,
    job: updatedJob,
    queue: reordered,
  };
}

/**
 * Simulates job cancellation for DEMO_MODE.
 */
export function mockCancelJob(jobId: string | number): {
  success: boolean;
  message: string;
  queue: QueueJob[];
} {
  dynamicMockJobs = dynamicMockJobs.filter((j) => String(j.id) !== String(jobId) && !j.isUserJob);
  saveStoredQueue(dynamicMockJobs);
  const reordered = sortAndPositionQueue(dynamicMockJobs);
  return {
    success: true,
    message: 'Print job cancelled successfully',
    queue: reordered,
  };
}

