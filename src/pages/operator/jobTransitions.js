/**
 * src/pages/operator/jobTransitions.js
 *
 * Operator Queue State Transitions & Action Permissions.
 *
 * CONFIRM: the Figma flow is student taps "I'm Here" (confirms
 * arrival), operator taps Mark Printing, but the student code moves
 * check-in straight to printing. Needs a decision.
 *
 * TODO: this file is a UI mirror only. The server state machine
 * decides what is allowed and ideally returns the allowed moves per
 * job.
 */

// Permitted operator job statuses.
// The operator cannot set any status not listed here.
export const ALLOWED_OPERATOR_STATUSES = Object.freeze([
  'queued',
  'almost_your_turn',
  'waiting_for_student',
  'printing',
  'ready',
  'ready_for_pickup',
  'failed',
  'collected',
  'cancelled',
]);

/**
 * Validates whether a target status is allowed in the operator domain.
 * The operator cannot set any status not listed here.
 *
 * @param {string} status - Candidate status
 * @returns {boolean}
 */
export function isValidOperatorStatus(status) {
  return ALLOWED_OPERATOR_STATUSES.includes(status);
}

/**
 * Normalizes input job parameter whether passed as object or individual fields.
 */
function normalizeJobInput(jobOrStatus, maybePaymentStatus, maybeArrivalConfirmedAt, context = {}) {
  if (typeof jobOrStatus === 'object' && jobOrStatus !== null) {
    return {
      status: jobOrStatus.status,
      paymentStatus: jobOrStatus.paymentStatus,
      arrivalConfirmedAt: jobOrStatus.arrivalConfirmedAt || (jobOrStatus.canArrive ? 'mock-confirmed' : null),
      isTurn: jobOrStatus.isTurn ?? context.isTurn ?? true,
      isTopInSlot: jobOrStatus.isTopInSlot ?? context.isTopInSlot ?? false,
      flaggedForReview: jobOrStatus.flaggedForReview ?? false,
      id: jobOrStatus.id,
      ...jobOrStatus,
      ...context,
    };
  }
  return {
    status: jobOrStatus,
    paymentStatus: maybePaymentStatus,
    arrivalConfirmedAt: maybeArrivalConfirmedAt,
    isTurn: context.isTurn ?? true,
    isTopInSlot: context.isTopInSlot ?? false,
    flaggedForReview: context.flaggedForReview ?? false,
    ...context,
  };
}

/**
 * Evaluates visible action buttons and menu items for a given job.
 *
 * Returns:
 * {
 *   buttons: Array<{ id, label, target, kind: 'forward'|'undo'|'cancel', needs: { confirm, reason, pin }, disabled, disabledReason }>,
 *   menuItems: Array<{ id, label, target, kind: 'forward'|'undo'|'cancel', needs: { confirm, reason, pin }, disabled, disabledReason }>
 * }
 *
 * @param {Object|string} jobOrStatus - Job object or status string
 * @param {string} [maybePaymentStatus] - Optional payment status if first param is string
 * @param {string|null} [maybeArrivalConfirmedAt] - Optional arrival confirmation timestamp
 * @param {Object} [context] - Optional additional context (e.g. isTurn, isTopInSlot)
 * @returns {{ buttons: Array, menuItems: Array }}
 */
export function getJobTransitions(jobOrStatus, maybePaymentStatus, maybeArrivalConfirmedAt, context = {}) {
  // Handle flexible signature variations
  const extraCtx = typeof maybePaymentStatus === 'object' && maybePaymentStatus !== null
    ? maybePaymentStatus
    : (typeof maybeArrivalConfirmedAt === 'object' && maybeArrivalConfirmedAt !== null ? maybeArrivalConfirmedAt : context);

  const job = normalizeJobInput(jobOrStatus, maybePaymentStatus, maybeArrivalConfirmedAt, extraCtx);

  const { status, paymentStatus, arrivalConfirmedAt } = job;
  const isPaid = paymentStatus === 'paid';
  const isUnpaid = !isPaid;
  const hasArrival = Boolean(arrivalConfirmedAt);
  // Default to true if not specified to allow execution in demo mode, but false if explicitly set to false
  const isTurn = job.isTurn !== false;

  const buttons = [];
  const menuItems = [];

  // Helper move constructors
  const copyJobIdMove = {
    id: 'copy_job_id',
    label: 'Copy job ID',
    target: null,
    kind: 'forward',
    disabled: false,
    disabledReason: null,
    needs: { confirm: false, reason: false, pin: false },
  };

  const cancelJobMove = {
    id: 'cancel_job',
    label: 'Cancel job',
    target: 'cancelled',
    kind: 'cancel',
    disabled: false,
    disabledReason: null,
    needs: { confirm: true, reason: true, pin: false },
  };

  // RULE 1: Unpaid Jobs
  // [Mark as Paid (Cash)], [Mark Printing disabled: "Payment + student arrival required. Recording cash does not confirm arrival."]; menu: Cancel job
  if (isUnpaid && status !== 'cancelled' && status !== 'collected') {
    buttons.push({
      id: 'mark_paid',
      label: 'Mark as Paid (Cash)',
      target: null, // paymentStatus becomes 'paid'
      kind: 'forward',
      disabled: false,
      disabledReason: null,
      needs: { confirm: true, reason: false, pin: false },
    });

    buttons.push({
      id: 'mark_printing',
      label: 'Mark Printing',
      target: 'printing',
      kind: 'forward',
      disabled: true,
      disabledReason: 'Payment + student arrival required. Recording cash does not confirm arrival.',
      needs: { confirm: false, reason: false, pin: false },
    });

    menuItems.push(cancelJobMove);
    menuItems.push(copyJobIdMove);

    return { buttons, menuItems };
  }

  // RULE 2: Paid + queued / almost_your_turn / waiting_for_student
  // [Move to Top (same slot only)], [Mark Printing: enabled only when paid AND arrivalConfirmedAt is set AND it is this job's turn; otherwise disabled with the exact missing condition]; menu: Undo payment, Cancel job
  if (isPaid && (status === 'queued' || status === 'almost_your_turn' || status === 'waiting_for_student')) {
    buttons.push({
      id: 'move_to_top',
      label: 'Move to Top (same slot only)',
      target: null, // reorders priority within slot
      kind: 'forward',
      disabled: Boolean(job.isTopInSlot),
      disabledReason: job.isTopInSlot ? 'Job is already at the top of this slot.' : null,
      needs: { confirm: true, reason: true, pin: false },
    });

    let printingDisabledReason = null;
    if (!isPaid) {
      printingDisabledReason = 'Payment required before printing.';
    } else if (!hasArrival && !isTurn) {
      printingDisabledReason = "Student arrival required and it is not this job's turn.";
    } else if (!hasArrival) {
      printingDisabledReason = 'Student arrival required before printing can begin.';
    } else if (!isTurn) {
      printingDisabledReason = "It is not this job's turn to print.";
    }

    const canPrint = isPaid && hasArrival && isTurn;

    buttons.push({
      id: 'mark_printing',
      label: 'Mark Printing',
      target: 'printing',
      kind: 'forward',
      disabled: !canPrint,
      disabledReason: printingDisabledReason,
      needs: { confirm: false, reason: false, pin: false },
    });

    // Undo payment is permitted prior to printing
    // Rule: Undo payment is blocked once status is printing or later.
    menuItems.push({
      id: 'undo_payment',
      label: 'Undo payment',
      target: null, // paymentStatus reverts to 'unpaid'
      kind: 'undo',
      disabled: false,
      disabledReason: null,
      needs: { confirm: true, reason: false, pin: false },
    });

    menuItems.push(cancelJobMove);
    menuItems.push(copyJobIdMove);

    return { buttons, menuItems };
  }

  // RULE 3: printing
  // [Mark Ready], [Mark Failed]; menu: Undo Mark Printing (to queued), Cancel job
  // (Undo payment is blocked once status is printing or later)
  if (status === 'printing') {
    buttons.push({
      id: 'mark_ready',
      label: 'Mark Ready',
      target: 'ready_for_pickup',
      kind: 'forward',
      disabled: false,
      disabledReason: null,
      needs: { confirm: false, reason: false, pin: false },
    });

    buttons.push({
      id: 'mark_failed',
      label: 'Mark Failed',
      target: 'failed',
      kind: 'forward',
      disabled: false,
      disabledReason: null,
      needs: { confirm: false, reason: true, pin: false },
    });

    menuItems.push({
      id: 'undo_mark_printing',
      label: 'Undo Mark Printing',
      target: 'queued',
      kind: 'undo',
      disabled: false,
      disabledReason: null,
      needs: { confirm: true, reason: false, pin: false },
    });

    menuItems.push(cancelJobMove);
    menuItems.push(copyJobIdMove);

    return { buttons, menuItems };
  }

  // RULE 4: ready_for_pickup (and ready)
  // [Mark Collected] (needs PIN); menu: Undo Mark Ready (to printing)
  if (status === 'ready' || status === 'ready_for_pickup') {
    buttons.push({
      id: 'mark_collected',
      label: 'Mark Collected',
      target: 'collected',
      kind: 'forward',
      disabled: false,
      disabledReason: null,
      needs: { confirm: false, reason: false, pin: true },
    });

    menuItems.push({
      id: 'undo_mark_ready',
      label: 'Undo Mark Ready',
      target: 'printing',
      kind: 'undo',
      disabled: false,
      disabledReason: null,
      needs: { confirm: true, reason: false, pin: false },
    });

    menuItems.push(copyJobIdMove);

    return { buttons, menuItems };
  }

  // RULE 5: failed
  // [Retry Print] (to queued), [Flag for Review] (sets flaggedForReview, status stays failed); menu: Cancel job, Undo Mark Failed (to printing)
  if (status === 'failed') {
    buttons.push({
      id: 'retry_print',
      label: 'Retry Print',
      target: 'queued',
      kind: 'forward',
      disabled: false,
      disabledReason: null,
      needs: { confirm: false, reason: false, pin: false },
    });

    buttons.push({
      id: 'flag_for_review',
      label: 'Flag for Review',
      target: 'failed', // status stays failed, sets flaggedForReview: true
      kind: 'forward',
      disabled: Boolean(job.flaggedForReview),
      disabledReason: job.flaggedForReview ? 'Already flagged for supervisor review.' : null,
      needs: { confirm: false, reason: true, pin: false },
    });

    menuItems.push(cancelJobMove);

    menuItems.push({
      id: 'undo_mark_failed',
      label: 'Undo Mark Failed',
      target: 'printing',
      kind: 'undo',
      disabled: false,
      disabledReason: null,
      needs: { confirm: true, reason: false, pin: false },
    });

    menuItems.push(copyJobIdMove);

    return { buttons, menuItems };
  }

  // RULE 6: collected
  // menu: Undo Collected (to ready_for_pickup)
  if (status === 'collected') {
    menuItems.push({
      id: 'undo_collected',
      label: 'Undo Collected',
      target: 'ready_for_pickup',
      kind: 'undo',
      disabled: false,
      disabledReason: null,
      needs: { confirm: true, reason: false, pin: false },
    });

    menuItems.push(copyJobIdMove);

    return { buttons, menuItems };
  }

  // RULE 7: cancelled
  // menu: Undo Cancel (to queued)
  if (status === 'cancelled') {
    menuItems.push({
      id: 'undo_cancel',
      label: 'Undo Cancel',
      target: 'queued',
      kind: 'undo',
      disabled: false,
      disabledReason: null,
      needs: { confirm: true, reason: false, pin: false },
    });

    menuItems.push(copyJobIdMove);

    return { buttons, menuItems };
  }

  // Default fallback for any unspecified state
  menuItems.push(copyJobIdMove);
  return { buttons, menuItems };
}

/**
 * Convenience helper returning only visible buttons for a job.
 */
export function getVisibleButtons(job, context) {
  return getJobTransitions(job, context).buttons;
}

/**
 * Convenience helper returning only menu items for a job.
 */
export function getMenuItems(job, context) {
  return getJobTransitions(job, context).menuItems;
}

/* ==========================================================================
   EXAMPLE UNIT TEST CASES (5 Scenarios Describing Allowed Moves)
   ==========================================================================

   Example Case 1: Unpaid job in queue awaiting payment at desk
   --------------------------------------------------------------------------
   Input:
     getJobTransitions({
       id: 'job-01',
       status: 'queued',
       paymentStatus: 'unpaid',
       arrivalConfirmedAt: null,
     })
   Expected Buttons:
     [
       { id: 'mark_paid', label: 'Mark as Paid (Cash)', target: null, kind: 'forward', needs: { confirm: true, reason: false, pin: false } },
       { id: 'mark_printing', label: 'Mark Printing', target: 'printing', kind: 'forward', disabled: true, disabledReason: 'Payment + student arrival required. Recording cash does not confirm arrival.' }
     ]
   Expected Menu Items:
     [
       { id: 'cancel_job', label: 'Cancel job', target: 'cancelled', kind: 'cancel', needs: { confirm: true, reason: true, pin: false } },
       { id: 'copy_job_id', label: 'Copy job ID', target: null, kind: 'forward' }
     ]

   Example Case 2: Paid queued job where student has arrived and it IS this job's turn
   --------------------------------------------------------------------------
   Input:
     getJobTransitions({
       id: 'job-02',
       status: 'queued',
       paymentStatus: 'paid',
       arrivalConfirmedAt: '2026-10-16T10:00:00Z',
       isTurn: true,
     })
   Expected Buttons:
     [
       { id: 'move_to_top', label: 'Move to Top (same slot only)', target: null, kind: 'forward', disabled: false },
       { id: 'mark_printing', label: 'Mark Printing', target: 'printing', kind: 'forward', disabled: false, disabledReason: null }
     ]
   Expected Menu Items:
     [
       { id: 'undo_payment', label: 'Undo payment', target: null, kind: 'undo', needs: { confirm: true, reason: false, pin: false } },
       { id: 'cancel_job', label: 'Cancel job', target: 'cancelled', kind: 'cancel', needs: { confirm: true, reason: true, pin: false } },
       { id: 'copy_job_id', label: 'Copy job ID', target: null, kind: 'forward' }
     ]

   Example Case 3: Paid queued job where student has arrived but it is NOT this job's turn
   --------------------------------------------------------------------------
   Input:
     getJobTransitions({
       id: 'job-03',
       status: 'almost_your_turn',
       paymentStatus: 'paid',
       arrivalConfirmedAt: '2026-10-16T10:00:00Z',
       isTurn: false,
     })
   Expected Buttons:
     [
       { id: 'move_to_top', label: 'Move to Top (same slot only)', target: null, kind: 'forward', disabled: false },
       { id: 'mark_printing', label: 'Mark Printing', target: 'printing', kind: 'forward', disabled: true, disabledReason: "It is not this job's turn to print." }
     ]
   Expected Menu Items:
     [
       { id: 'undo_payment', label: 'Undo payment', target: null, kind: 'undo', needs: { confirm: true, reason: false, pin: false } },
       { id: 'cancel_job', label: 'Cancel job', target: 'cancelled', kind: 'cancel', needs: { confirm: true, reason: true, pin: false } },
       { id: 'copy_job_id', label: 'Copy job ID', target: null, kind: 'forward' }
     ]

   Example Case 4: Printing job currently active on the printer
   --------------------------------------------------------------------------
   Input:
     getJobTransitions({
       id: 'job-04',
       status: 'printing',
       paymentStatus: 'paid',
       arrivalConfirmedAt: '2026-10-16T09:45:00Z',
     })
   Expected Buttons:
     [
       { id: 'mark_ready', label: 'Mark Ready', target: 'ready_for_pickup', kind: 'forward', needs: { confirm: false, reason: false, pin: false } },
       { id: 'mark_failed', label: 'Mark Failed', target: 'failed', kind: 'forward', needs: { confirm: false, reason: true, pin: false } }
     ]
   Expected Menu Items:
     [
       { id: 'undo_mark_printing', label: 'Undo Mark Printing', target: 'queued', kind: 'undo', needs: { confirm: true, reason: false, pin: false } },
       { id: 'cancel_job', label: 'Cancel job', target: 'cancelled', kind: 'cancel', needs: { confirm: true, reason: true, pin: false } },
       { id: 'copy_job_id', label: 'Copy job ID', target: null, kind: 'forward' }
     ]
   Note: Undo payment is strictly blocked once status is printing or later.

   Example Case 5: Job ready for pickup awaiting student collection with PIN
   --------------------------------------------------------------------------
   Input:
     getJobTransitions({
       id: 'job-05',
       status: 'ready_for_pickup',
       paymentStatus: 'paid',
     })
   Expected Buttons:
     [
       { id: 'mark_collected', label: 'Mark Collected', target: 'collected', kind: 'forward', needs: { confirm: false, reason: false, pin: true } }
     ]
   Expected Menu Items:
     [
       { id: 'undo_mark_ready', label: 'Undo Mark Ready', target: 'printing', kind: 'undo', needs: { confirm: true, reason: false, pin: false } },
       { id: 'copy_job_id', label: 'Copy job ID', target: null, kind: 'forward' }
     ]
   ========================================================================== */
