import { QueueJob } from '../lib/queueOrder';

/**
 * MOCK OPERATOR QUEUE DATA
 *
 * TODO: backend: operator endpoint returning all jobs with full details.
 *
 * NOTE: This mock is isolated for the Operator desk view only.
 * Does not read/write to localStorage and does not interfere with the student queue mock.
 */

// TODO: backend: operator endpoint returning all jobs with full details.
export const MOCK_OPERATOR_JOBS: QueueJob[] = [
  {
    id: 'job-op-01', // MOCK:
    position: 1, // MOCK:
    name: 'Ahmed Khan', // MOCK:
    fileName: 'Assignment_3_Report.pdf', // MOCK:
    pages: 12, // MOCK:
    colorMode: 'B&W', // MOCK:
    duplex: 'Double-sided', // MOCK:
    slot: '9:00 AM', // MOCK:
    submittedAt: '2026-10-16T08:15:00Z', // MOCK:
    status: 'queued', // MOCK:
    paymentStatus: 'paid', // MOCK:
    amountDue: 0, // MOCK:
    canArrive: false, // MOCK:
  },
  {
    id: 'job-op-02', // MOCK:
    position: 2, // MOCK:
    name: 'Sara Ali', // MOCK:
    fileName: 'Lecture_Notes.pdf', // MOCK:
    pages: 8, // MOCK:
    colorMode: 'Color', // MOCK:
    duplex: 'Single-sided', // MOCK:
    slot: '9:30 AM', // MOCK:
    submittedAt: '2026-10-16T08:30:00Z', // MOCK:
    status: 'queued', // MOCK:
    paymentStatus: 'unpaid', // MOCK:
    amountDue: 80, // MOCK:
    canArrive: false, // MOCK:
  },
  {
    id: 'job-op-03', // MOCK:
    position: 3, // MOCK:
    name: 'Hassan Raza', // MOCK:
    fileName: 'Research_Notes.docx', // MOCK:
    pages: 20, // MOCK:
    colorMode: 'B&W', // MOCK:
    duplex: 'Double-sided', // MOCK:
    slot: '10:00 AM', // MOCK:
    submittedAt: '2026-10-16T08:45:00Z', // MOCK:
    status: 'printing', // MOCK:
    paymentStatus: 'paid', // MOCK:
    amountDue: 0, // MOCK:
    canArrive: true, // MOCK:
  },
  {
    id: 'job-op-04', // MOCK:
    position: 4, // MOCK:
    name: 'Ayesha Malik', // MOCK:
    fileName: 'Seminar_Handout.pdf', // MOCK:
    pages: 10, // MOCK:
    colorMode: 'Color', // MOCK:
    duplex: 'Double-sided', // MOCK:
    slot: '11:00 AM', // MOCK:
    submittedAt: '2026-10-16T09:00:00Z', // MOCK:
    status: 'ready_for_pickup', // MOCK:
    paymentStatus: 'paid', // MOCK:
    amountDue: 0, // MOCK:
    canArrive: true, // MOCK:
  },
  {
    id: 'job-op-05', // MOCK:
    position: 5, // MOCK:
    name: 'Bilal Tariq', // MOCK:
    fileName: 'Economics_Problem_Set.pdf', // MOCK:
    pages: 12, // MOCK:
    colorMode: 'B&W', // MOCK:
    duplex: 'Single-sided', // MOCK:
    slot: '12:00 PM', // MOCK:
    submittedAt: '2026-10-16T09:15:00Z', // MOCK:
    status: 'failed', // MOCK:
    paymentStatus: 'paid', // MOCK:
    amountDue: 0, // MOCK:
    canArrive: false, // MOCK:
  },
  {
    id: 'job-op-06', // MOCK:
    position: 6, // MOCK:
    name: 'Zainab Noor', // MOCK:
    fileName: 'Thesis_Draft_Final.pdf', // MOCK:
    pages: 35, // MOCK:
    colorMode: 'B&W', // MOCK:
    duplex: 'Double-sided', // MOCK:
    slot: '12:30 PM', // MOCK:
    submittedAt: '2026-10-16T09:30:00Z', // MOCK:
    status: 'almost_your_turn', // MOCK:
    paymentStatus: 'paid', // MOCK:
    amountDue: 0, // MOCK:
    canArrive: false, // MOCK:
  },
  {
    id: 'job-op-07', // MOCK:
    position: 7, // MOCK:
    name: 'Hamza Farooq', // MOCK:
    fileName: 'Computer_Vision_Slides.pdf', // MOCK:
    pages: 16, // MOCK:
    colorMode: 'Color', // MOCK:
    duplex: 'Single-sided', // MOCK:
    slot: '1:00 PM', // MOCK:
    submittedAt: '2026-10-16T09:45:00Z', // MOCK:
    status: 'waiting_for_student', // MOCK:
    paymentStatus: 'unpaid', // MOCK:
    amountDue: 160, // MOCK:
    canArrive: false, // MOCK:
  },
  {
    id: 'job-op-08', // MOCK:
    position: 8, // MOCK:
    name: 'Mahnoor Aslam', // MOCK:
    fileName: 'Project_Specification.pdf', // MOCK:
    pages: 6, // MOCK:
    colorMode: 'B&W', // MOCK:
    duplex: 'Double-sided', // MOCK:
    slot: '1:30 PM', // MOCK:
    submittedAt: '2026-10-16T10:00:00Z', // MOCK:
    status: 'ready', // MOCK:
    paymentStatus: 'paid', // MOCK:
    amountDue: 0, // MOCK:
    canArrive: true, // MOCK:
  },
  {
    id: 'job-op-09', // MOCK:
    position: 9, // MOCK:
    name: 'Omer Javed', // MOCK:
    studentLabel: 'Omer Javed', // MOCK:
    fileName: 'Calculus_Worksheet_04.pdf', // MOCK:
    pages: 4, // MOCK:
    colorMode: 'B&W', // MOCK:
    duplex: 'Single-sided', // MOCK:
    slot: '2:00 PM', // MOCK:
    submittedAt: null, // MOCK:
    status: 'queued', // MOCK:
    paymentStatus: 'paid', // MOCK:
    amountDue: 0, // MOCK:
    canArrive: false, // MOCK:
  },
  {
    id: 'job-op-10', // MOCK:
    position: 10, // MOCK:
    name: 'Daniyal Sheikh', // MOCK:
    studentLabel: 'Daniyal Sheikh', // MOCK:
    fileName: 'Lab_Report_Final.pdf', // MOCK:
    pages: 8, // MOCK:
    colorMode: 'B&W', // MOCK:
    duplex: 'Double-sided', // MOCK:
    slot: '2:30 PM', // MOCK:
    submittedAt: '2026-10-16T10:15:00Z', // MOCK:
    status: 'collected', // MOCK:
    paymentStatus: 'paid', // MOCK:
    amountDue: 0, // MOCK:
    canArrive: false, // MOCK:
  },
  {
    id: 'job-op-11', // MOCK:
    position: 11, // MOCK:
    name: 'Fatima Zahra', // MOCK:
    studentLabel: 'Fatima Zahra', // MOCK:
    fileName: 'Design_Proposal.pdf', // MOCK:
    pages: 14, // MOCK:
    colorMode: 'Color', // MOCK:
    duplex: 'Single-sided', // MOCK:
    slot: '3:00 PM', // MOCK:
    submittedAt: '2026-10-16T10:30:00Z', // MOCK:
    status: 'cancelled', // MOCK:
    paymentStatus: 'unpaid', // MOCK:
    amountDue: 140, // MOCK:
    canArrive: false, // MOCK:
  },
];

/**
 * Returns the operator jobs. In DEMO_MODE, returns mock list.
 * TODO: backend: operator endpoint returning all jobs with full details.
 */
export function getMockOperatorJobs(): QueueJob[] {
  return [...MOCK_OPERATOR_JOBS];
}

/**
 * MOCK: Simulates student cancellation on the backend (not on the screen UI).
 * TODO: backend: "ended" is decided by the server, never by the
 * client. The live list endpoint must exclude collected and cancelled,
 * the ended endpoint must return only today's jobs for this desk and
 * require operator role, and nothing is deleted: payments and the
 * audit log are kept. Undo from Ended must go through the state
 * machine and be audit logged.
 * TODO: backend: file deletion follows the retention rule, not this
 * screen.
 */
export function mockStudentCancelJob(jobId?: string): {
  success: boolean;
  cancelledJob: QueueJob | null;
} {
  const targetId = jobId || MOCK_OPERATOR_JOBS.find(j => j.status !== 'collected' && j.status !== 'cancelled')?.id;
  const job = MOCK_OPERATOR_JOBS.find(j => j.id === targetId);
  if (job) {
    job.status = 'cancelled';
    job.statusUpdatedAt = new Date().toISOString();
    job.cancelReason = 'Cancelled by student';
    job.lastAction = {
      label: 'Cancelled by student',
      byName: 'Student',
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('printfy:demo:operator', {
        detail: { action: 'student_cancels', jobId: targetId, job }
      }));
    }
    return { success: true, cancelledJob: job };
  }
  return { success: false, cancelledJob: null };
}

