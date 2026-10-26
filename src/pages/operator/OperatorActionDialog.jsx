import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  XIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  PrinterIcon,
} from '../../components/dashboard/DashboardIcons';
import { getStatusMeta } from './OperatorStatusChip';

/**
 * Step 6 Operator Action Dialog:
 *
 * Implements dialogs with the student portal's modal classes and pattern
 * (backdrop, dialog, header, footer).
 *
 * Plain language, every dialog has Cancel, primary button names the action (never "OK"),
 * focus moves in, Escape closes, Enter confirms.
 *
 * Types of dialogs:
 * 1. Mark as Paid: "Mark Rs. {amountDue} as paid for {studentLabel}?"
 * 2. Mark Failed: fixed reasons (Paper jam, Out of paper, Printer error, File problem, Other). No free text. Saves failureReason.
 * 3. Cancel job: "Cancel {fileName} for {studentLabel}? The student will see it as cancelled." plus fixed reasons.
 * 4. Undo (any): shows "From: {status} To: {status}" and a fixed reason dropdown (Clicked the wrong job, Student changed their mind, Print problem, Other). The dropdown shows its selection on its face.
 * 5. Move to Top: same slot only. Fixed reasons (Student has a class, Quick small print, Operator error, Other). Confirm text: "This moves {fileName} above {n} jobs in the {slot} slot."
 * 6. Mark Collected: 4-digit PIN entry. The operator types what the student shows. Never read, display or store the real PIN. Accept any 4 digits, marked // MOCK:.
 *
 * TODO: backend must verify the PIN hash, limit attempts, store the reasons and write an audit row.
 */

// Fixed failure reasons (No free text)
export const FAILURE_REASONS = [
  'Paper jam',
  'Out of paper',
  'Printer error',
  'File problem',
  'Other',
];

// Fixed cancellation reasons
export const CANCEL_REASONS = [
  'Student requested cancellation',
  'Student did not arrive',
  'Unpaid / Abandoned',
  'File unprintable',
  'Other',
];

// Fixed undo reasons
export const UNDO_REASONS = [
  'Clicked the wrong job',
  'Student changed their mind',
  'Print problem',
  'Other',
];

// Fixed move to top reasons
export const MOVE_TO_TOP_REASONS = [
  'Student has a class',
  'Quick small print',
  'Operator error',
  'Other',
];

export default function OperatorActionDialog({
  isOpen,
  action,
  job,
  slotJobs = [],
  onConfirm,
  onClose,
}) {
  const [selectedReason, setSelectedReason] = useState('');
  const [pinDigits, setPinDigits] = useState('');
  const [pinError, setPinError] = useState('');

  const initialFocusRef = useRef(null);
  const primaryBtnRef = useRef(null);

  const actionId = action?.id || '';
  const actionKind = action?.kind || '';
  const isUndo = actionKind === 'undo' || actionId.startsWith('undo_');

  // Determine dialog mode
  let dialogType = 'confirm';
  if (actionId === 'mark_paid') {
    dialogType = 'mark_paid';
  } else if (actionId === 'mark_failed') {
    dialogType = 'mark_failed';
  } else if (actionId === 'cancel_job' || actionKind === 'cancel') {
    dialogType = 'cancel_job';
  } else if (isUndo) {
    dialogType = 'undo';
  } else if (actionId === 'move_to_top') {
    dialogType = 'move_to_top';
  } else if (actionId === 'mark_collected') {
    dialogType = 'mark_collected';
  }

  // Reset form inputs whenever modal opens with a new action or job
  useEffect(() => {
    if (!isOpen) return;

    if (dialogType === 'mark_failed') {
      setSelectedReason(FAILURE_REASONS[0]);
    } else if (dialogType === 'cancel_job') {
      setSelectedReason(CANCEL_REASONS[0]);
    } else if (dialogType === 'undo') {
      setSelectedReason(UNDO_REASONS[0]);
    } else if (dialogType === 'move_to_top') {
      setSelectedReason(MOVE_TO_TOP_REASONS[0]);
    } else {
      setSelectedReason('');
    }

    setPinDigits('');
    setPinError('');
  }, [isOpen, dialogType]);

  // Primary action confirmation handler
  const handleConfirm = useCallback(() => {
    if (!action || !job) return;

    // PIN Validation for Mark Collected
    if (dialogType === 'mark_collected') {
      // Clean digits
      const sanitizedPin = pinDigits.replace(/\D/g, '');
      if (sanitizedPin.length !== 4) {
        setPinError('Please enter a complete 4-digit PIN');
        return;
      }

      // MOCK: Accept any 4 digits
      // TODO: backend must verify the PIN hash, limit attempts, store the reasons and write an audit row.
      onConfirm({
        action,
        job,
        pin: sanitizedPin,
      });
      return;
    }

    // Capture specific reasons for failure, cancel, undo, and move
    const payload = {
      action,
      job,
    };

    if (dialogType === 'mark_failed') {
      payload.failureReason = selectedReason;
    } else if (dialogType === 'cancel_job') {
      payload.cancelReason = selectedReason;
    } else if (dialogType === 'undo') {
      payload.undoReason = selectedReason;
    } else if (dialogType === 'move_to_top') {
      payload.moveReason = selectedReason;
    }

    onConfirm(payload);
  }, [action, job, dialogType, pinDigits, selectedReason, onConfirm]);

  // Keyboard navigation & auto-focus
  useEffect(() => {
    if (!isOpen) return;

    // Focus moves in immediately
    const focusTimer = setTimeout(() => {
      if (initialFocusRef.current) {
        initialFocusRef.current.focus();
      } else if (primaryBtnRef.current) {
        primaryBtnRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        // Prevent accidental double trigger if focus is already on a button
        if (e.target.tagName !== 'BUTTON') {
          e.preventDefault();
          handleConfirm();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handleConfirm]);

  if (!isOpen || !job || !action) return null;

  const studentLabel = job.studentLabel || job.name || 'Student';
  const fileName = job.fileName || 'document.pdf';
  const amountDue = job.amountDue != null ? job.amountDue : 80;

  // Calculate {n} for "Move to Top": how many jobs are ahead of it in the same slot
  const currentSlotIndex = slotJobs.findIndex((j) => j.id === job.id);
  const jobsAheadInSlot = Math.max(1, currentSlotIndex);
  const slotName = job.slot || 'current';

  // Format Status for Undo Dialog: "From: {status} To: {status}"
  const fromMeta = getStatusMeta(job.status);
  const targetStatus = action.target || (actionId === 'undo_payment' ? 'unpaid' : 'queued');
  const toMeta = getStatusMeta(targetStatus);

  const fromLabel = actionId === 'undo_payment' ? 'Paid' : fromMeta.label;
  const toLabel = actionId === 'undo_payment' ? 'Unpaid' : toMeta.label;

  // Handle PIN input change (digits only, max 4)
  const handlePinChange = (e) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, '').slice(0, 4);
    setPinDigits(digitsOnly);
    if (digitsOnly.length === 4) {
      setPinError('');
    }
  };

  return createPortal(
    <div
      className="dashboard-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="cancel-confirmation-modal-card operator-modal-dialog-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="operator-dialog-title"
      >
        {/* ====================================================================
            Modal Header
            ==================================================================== */}
        <div className="operator-modal-header">
          <div className="operator-modal-title-cluster">
            {dialogType === 'cancel_job' || dialogType === 'mark_failed' ? (
              <div className="operator-modal-icon-bubble is-danger" aria-hidden="true">
                <AlertTriangleIcon size={20} color="#ba1a1a" />
              </div>
            ) : dialogType === 'mark_collected' ? (
              <div className="operator-modal-icon-bubble is-primary" aria-hidden="true">
                <ShieldCheckIcon size={20} color="#551ee7" />
              </div>
            ) : (
              <div className="operator-modal-icon-bubble is-purple" aria-hidden="true">
                <PrinterIcon size={20} color="#551ee7" />
              </div>
            )}
            <div>
              <h3 id="operator-dialog-title" className="operator-modal-heading">
                {dialogType === 'mark_paid' && 'Record Cash Payment'}
                {dialogType === 'mark_failed' && 'Mark Print as Failed'}
                {dialogType === 'cancel_job' && 'Cancel Print Job'}
                {dialogType === 'undo' && (action.label || 'Undo Last Action')}
                {dialogType === 'move_to_top' && 'Move Job to Top'}
                {dialogType === 'mark_collected' && 'Verify Pickup PIN'}
              </h3>
              <p className="operator-modal-subheading">
                {fileName} · {studentLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="operator-modal-close-icon-btn"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* ====================================================================
            Modal Body (By Dialog Type)
            ==================================================================== */}
        <div className="cancel-modal-body operator-modal-body">
          {/* DIALOG 1: Mark as Paid */}
          {dialogType === 'mark_paid' && (
            <div className="operator-modal-content-stack">
              <p className="operator-modal-lead-text">
                Mark Rs. {amountDue} as paid for {studentLabel}?
              </p>
              <div className="operator-modal-info-banner">
                <span>
                  Recording cash at the desk marks the balance as settled so printing can begin once the student arrives.
                </span>
              </div>
            </div>
          )}

          {/* DIALOG 2: Mark Failed (Fixed reasons, no free text, saves failureReason) */}
          {dialogType === 'mark_failed' && (
            <div className="operator-modal-content-stack">
              <p className="operator-modal-lead-text">
                Select the failure reason for {fileName}:
              </p>
              <div className="operator-modal-field-group">
                <label htmlFor="operator-failure-reason-select" className="operator-modal-field-label">
                  Reason for failure
                </label>
                <select
                  id="operator-failure-reason-select"
                  ref={initialFocusRef}
                  className="operator-modal-select-field"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                >
                  {FAILURE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="cancel-modal-warning">
                This marks the job as failed and prompts the student to check their document or retry.
              </div>
            </div>
          )}

          {/* DIALOG 3: Cancel Job */}
          {dialogType === 'cancel_job' && (
            <div className="operator-modal-content-stack">
              <p className="operator-modal-lead-text">
                Cancel {fileName} for {studentLabel}? The student will see it as cancelled.
              </p>
              <div className="operator-modal-field-group">
                <label htmlFor="operator-cancel-reason-select" className="operator-modal-field-label">
                  Reason for cancellation
                </label>
                <select
                  id="operator-cancel-reason-select"
                  ref={initialFocusRef}
                  className="operator-modal-select-field"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                >
                  {CANCEL_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="cancel-modal-warning">
                This removes the print job from active queue processing and notifies the student.
              </div>
            </div>
          )}

          {/* DIALOG 4: Undo (Any) */}
          {dialogType === 'undo' && (
            <div className="operator-modal-content-stack">
              {/* Shows "From: {status} To: {status}" */}
              <div className="operator-undo-status-transition-box">
                <div className="operator-undo-status-chip-group">
                  <span className="operator-undo-status-tag-label">From:</span>
                  <span className="operator-undo-status-chip from-chip">{fromLabel}</span>
                </div>
                <div className="operator-undo-transition-arrow" aria-hidden="true">
                  <ArrowRightIcon size={16} />
                </div>
                <div className="operator-undo-status-chip-group">
                  <span className="operator-undo-status-tag-label">To:</span>
                  <span className="operator-undo-status-chip to-chip">{toLabel}</span>
                </div>
              </div>

              {/* Fixed reason dropdown showing selection on its face */}
              <div className="operator-modal-field-group">
                <label htmlFor="operator-undo-reason-select" className="operator-modal-field-label">
                  Reason for undoing
                </label>
                <select
                  id="operator-undo-reason-select"
                  ref={initialFocusRef}
                  className="operator-modal-select-field"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                >
                  {UNDO_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* DIALOG 5: Move to Top (Same slot only) */}
          {dialogType === 'move_to_top' && (
            <div className="operator-modal-content-stack">
              <p className="operator-modal-lead-text">
                This moves <strong>{fileName}</strong> above {jobsAheadInSlot} {jobsAheadInSlot === 1 ? 'job' : 'jobs'} in the {slotName} slot.
              </p>
              <div className="operator-modal-field-group">
                <label htmlFor="operator-move-reason-select" className="operator-modal-field-label">
                  Priority reason
                </label>
                <select
                  id="operator-move-reason-select"
                  ref={initialFocusRef}
                  className="operator-modal-select-field"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                >
                  {MOVE_TO_TOP_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="operator-modal-info-banner">
                <span>
                  Moving a job only adjusts printing priority within the same booked arrival slot.
                </span>
              </div>
            </div>
          )}

          {/* DIALOG 6: Mark Collected (4-digit PIN entry) */}
          {dialogType === 'mark_collected' && (
            <div className="operator-modal-content-stack">
              <p className="operator-modal-lead-text">
                Ask {studentLabel} for the 4-digit collection PIN shown on their screen:
              </p>

              <div className="operator-pin-input-box">
                <input
                  id="operator-pin-input"
                  ref={initialFocusRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="••••"
                  className="operator-pin-input-field"
                  value={pinDigits}
                  onChange={handlePinChange}
                  autoComplete="off"
                  aria-label="4-digit pickup PIN"
                />
                <span className="operator-pin-digit-counter">
                  {pinDigits.length} / 4 digits entered
                </span>
              </div>

              {pinError && (
                <p className="operator-pin-error-text" role="alert">
                  {pinError}
                </p>
              )}

              <p className="operator-pin-guidance-note">
                The operator types what the student shows. Never read, display or store the real PIN.
              </p>
            </div>
          )}
        </div>

        {/* ====================================================================
            Modal Footer
            Every dialog has Cancel; primary button names the action (never "OK")
            ==================================================================== */}
        <div className="cancel-modal-footer operator-modal-footer">
          <button
            type="button"
            className="cancel-modal-dismiss-btn operator-modal-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          {/* DIALOG 1: Mark as Paid */}
          {dialogType === 'mark_paid' && (
            <button
              ref={primaryBtnRef}
              type="button"
              className="operator-btn primary operator-modal-action-btn"
              onClick={handleConfirm}
            >
              Mark as Paid
            </button>
          )}

          {/* DIALOG 2: Mark Failed */}
          {dialogType === 'mark_failed' && (
            <button
              ref={primaryBtnRef}
              type="button"
              className="cancel-modal-confirm-btn operator-modal-danger-btn"
              onClick={handleConfirm}
            >
              Mark Failed
            </button>
          )}

          {/* DIALOG 3: Cancel Job */}
          {dialogType === 'cancel_job' && (
            <button
              ref={primaryBtnRef}
              type="button"
              className="cancel-modal-confirm-btn operator-modal-danger-btn"
              onClick={handleConfirm}
            >
              Cancel Job
            </button>
          )}

          {/* DIALOG 4: Undo */}
          {dialogType === 'undo' && (
            <button
              ref={primaryBtnRef}
              type="button"
              className="operator-btn primary operator-modal-action-btn"
              onClick={handleConfirm}
            >
              {action.label || 'Confirm Undo'}
            </button>
          )}

          {/* DIALOG 5: Move to Top */}
          {dialogType === 'move_to_top' && (
            <button
              ref={primaryBtnRef}
              type="button"
              className="operator-btn primary operator-modal-action-btn"
              onClick={handleConfirm}
            >
              Move to Top
            </button>
          )}

          {/* DIALOG 6: Mark Collected (Disabled until 4 digits typed) */}
          {dialogType === 'mark_collected' && (
            <button
              ref={primaryBtnRef}
              type="button"
              disabled={pinDigits.length !== 4}
              className={`operator-btn primary operator-modal-action-btn ${
                pinDigits.length !== 4 ? 'is-disabled' : ''
              }`}
              onClick={handleConfirm}
            >
              Mark Collected
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
