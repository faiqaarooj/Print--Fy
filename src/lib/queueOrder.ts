/**
 * Queue ordering pure function.
 * Used exclusively for DEMO_MODE inside src/mocks.
 * In real mode, the Laravel API delivers the queue pre-ordered with positions pre-assigned.
 */

export const ACTIVE_JOB_STATUSES = [
  'queued',
  'almost_your_turn',
  'waiting_for_student',
  'printing',
] as const;

export type ActiveJobStatus = (typeof ACTIVE_JOB_STATUSES)[number];

export type JobStatus =
  | ActiveJobStatus
  | 'ready'
  | 'ready_for_pickup'
  | 'failed'
  | 'collected'
  | 'cancelled';

export interface QueueJob {
  id: string | number;
  slot: string; // e.g. "2026-10-13T09:00:00" or "9:00 AM"
  submittedAt: string | number;
  status: JobStatus;
  position?: number;
  isUserJob?: boolean;
  fileName?: string;
  name?: string;
  genericAlias?: string; // e.g. "Student A" (mock only)
  pages?: number;
  colorMode?: string;
  duplex?: string;
  canArrive?: boolean;
  canCancel?: boolean;
  paymentStatus?: 'paid' | 'unpaid' | string;
  amountDue?: number | null;
  estimatedWaitMinutes?: number | null;
  progress?: number | null;
}


/**
 * Checks if a status is considered active for queue position calculation.
 */
export function isActiveJobStatus(status: string): boolean {
  if (!status) return false;
  const s = String(status).toLowerCase().trim();
  return (
    ACTIVE_JOB_STATUSES.includes(s as ActiveJobStatus) ||
    s === 'waiting' ||
    s === 'pending' ||
    s === 'queued' ||
    s === 'printing' ||
    s === 'almost_your_turn' ||
    s === 'waiting_for_student'
  );
}

/**
 * Parses a slot representation into a comparable timestamp in milliseconds.
 */
export function parseSlotTime(slotStr: string): number {
  if (!slotStr) return 0;

  // If slotStr is a full ISO date string
  const parsedDate = new Date(slotStr);
  if (!isNaN(parsedDate.getTime()) && slotStr.includes('-')) {
    return parsedDate.getTime();
  }

  // If slotStr is a time string like "9:00 AM" or "02:30 PM"
  const timeMatch = slotStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3]?.toUpperCase();

    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    const today = new Date();
    today.setHours(hour, minute, 0, 0);
    return today.getTime();
  }

  return 0;
}

/**
 * Pure function: Sorts queue jobs and assigns sequential position numbers to active jobs only.
 * Sort Order:
 * 1. Booked arrival slot (earliest first)
 * 2. Submitted time (earliest first)
 * 3. ID (ascending)
 */
export function sortAndPositionQueue(jobs: QueueJob[]): QueueJob[] {
  // 1. Separate active from non-active jobs
  const activeJobs = jobs.filter(
    (j) => isActiveJobStatus(j.status) || (j.isUserJob && j.status !== 'cancelled' && j.status !== 'collected')
  );
  const nonActiveJobs = jobs.filter(
    (j) => !isActiveJobStatus(j.status) && (!j.isUserJob || j.status === 'cancelled' || j.status === 'collected')
  );

  // 2. Sort active jobs strictly by: slot -> submittedAt -> id
  activeJobs.sort((a, b) => {
    const slotDiff = parseSlotTime(a.slot) - parseSlotTime(b.slot);
    if (slotDiff !== 0) return slotDiff;

    const aSubmitted = new Date(a.submittedAt).getTime() || 0;
    const bSubmitted = new Date(b.submittedAt).getTime() || 0;
    const subDiff = aSubmitted - bSubmitted;
    if (subDiff !== 0) return subDiff;

    return String(a.id).localeCompare(String(b.id));
  });

  // 3. Assign 1-based sequential position to active jobs only
  const positionedActiveJobs = activeJobs.map((job, index) => ({
    ...job,
    position: index + 1,
  }));

  // Non-active jobs retain no active queue position
  const positionedNonActiveJobs = nonActiveJobs.map((job) => ({
    ...job,
    position: undefined,
  }));

  const allJobs = [...positionedActiveJobs, ...positionedNonActiveJobs];
  return deriveQueueEstimates(allJobs, 3);
}

/**
 * Pure function: Derives queue estimates and ensures consistent wait times that add up.
 * Rule:
 * - Position 1: 0 ahead -> 0 mins wait (or printing)
 * - Position P: ahead = P - 1, estimated wait = ahead * avgMinutesPerJob
 * If avgMinutesPerJob = 3:
 * - Position 1: 0 min
 * - Position 2: 3 mins
 * - Position 3: 6 mins
 * - Position 4: 9 mins
 * - Position 5 (User): 12 mins (4 jobs ahead * 3 mins = 12 mins)
 */
export function deriveQueueEstimates(
  jobs: QueueJob[],
  avgMinutesPerJob: number = 3
): QueueJob[] {
  return jobs.map((job) => {
    if (job.position == null) {
      return job;
    }
    const ahead = Math.max(0, job.position - 1);
    const calculatedWait = ahead * avgMinutesPerJob;

    return {
      ...job,
      estimatedWaitMinutes:
        job.estimatedWaitMinutes !== undefined
          ? job.estimatedWaitMinutes
          : calculatedWait,
    };
  });
}

