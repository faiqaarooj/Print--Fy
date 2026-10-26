import React from 'react';
import {
  ClockIcon,
  PrinterIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  CancelIcon,
} from '../../components/dashboard/DashboardIcons';

/**
 * Status mapping and styling copied from the student side:
 * - Labels: src/components/dashboard/views/PrintQueueView.jsx (lines 93-109: getGenericStatusLabel)
 *   and src/components/dashboard/views/DashboardOverviewView.jsx (lines 298-305)
 * - Colours: src/components/dashboard/views/views.css (lines 2813-2830, 3112-3138)
 *   and src/pages/dashboard/StudentDashboard.css (lines 463-485)
 *
 * NOTE: The student portal files do NOT export these labels/color helpers,
 * so they are copied here into the operator folder per Step 3 instructions.
 */
export function getStatusMeta(status) {
  switch (status) {
    case 'queued':
      return {
        label: 'Waiting',
        Icon: ClockIcon,
        chipClass: 'operator-chip-queued',
      };
    case 'almost_your_turn':
      return {
        label: 'Next up',
        Icon: ClockIcon,
        chipClass: 'operator-chip-almost-your-turn',
      };
    case 'waiting_for_student':
      return {
        label: 'Waiting at desk',
        Icon: ClockIcon,
        chipClass: 'operator-chip-waiting-for-student',
      };
    case 'printing':
      return {
        label: 'Printing',
        Icon: PrinterIcon,
        chipClass: 'operator-chip-printing',
      };
    case 'ready':
    case 'ready_for_pickup':
      return {
        label: 'Ready for pickup',
        Icon: CheckCircleIcon,
        chipClass: 'operator-chip-ready',
      };
    case 'failed':
      return {
        label: 'Failed',
        Icon: AlertTriangleIcon,
        chipClass: 'operator-chip-failed',
      };
    case 'collected':
      return {
        label: 'Collected',
        Icon: CheckCircleIcon,
        chipClass: 'operator-chip-collected',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        Icon: CancelIcon,
        chipClass: 'operator-chip-cancelled',
      };
    default:
      return {
        label: 'Waiting',
        Icon: ClockIcon,
        chipClass: 'operator-chip-queued',
      };
  }
}

/**
 * Derives the ended summary ("Collected by {name}", "Cancelled by student", or "Cancelled by {name}")
 * and ended time from lastAction and statusUpdatedAt.
 */
export function getEndedSummary(job) {
  if (!job) return null;
  const isEnded = job.status === 'collected' || job.status === 'cancelled';
  if (!isEnded) return null;

  const endedTime =
    job.lastAction?.time ||
    (job.statusUpdatedAt
      ? new Date(job.statusUpdatedAt).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })
      : null);

  if (job.status === 'collected') {
    const who = job.lastAction?.byName || 'Desk Operator';
    return {
      text: `Collected by ${who}`,
      time: endedTime,
    };
  }

  // Cancelled
  const isStudent =
    job.lastAction?.byName === 'Student' ||
    job.cancelReason?.toLowerCase().includes('student') ||
    job.lastAction?.label?.toLowerCase().includes('student');

  if (isStudent) {
    return {
      text: 'Cancelled by student',
      time: endedTime,
    };
  }

  const who = job.lastAction?.byName || 'Desk Operator';
  return {
    text: `Cancelled by ${who}`,
    time: endedTime,
  };
}

/**
 * Derives the plain "next step" line under the status chip.
 * Rules:
 * - queued: "Waiting for payment" or "Waiting for the student to confirm arrival" (based on data)
 * - waiting_for_student: "Student is at the desk"
 * - printing: "Printing now"
 * - ready_for_pickup: "Print done, waiting for pickup"
 * - failed: "Print failed, retry or flag it"
 * - collected / cancelled: "Collected by {name}" or "Cancelled by student" or "Cancelled by {name}" + ended time
 */
export function getNextStepText(job) {
  if (!job) return '';
  const { status, paymentStatus, amountDue } = job;
  const isUnpaid = paymentStatus === 'unpaid' || (amountDue != null && amountDue > 0);

  const ended = getEndedSummary(job);
  if (ended) {
    return ended.time ? `${ended.text} · ${ended.time}` : ended.text;
  }

  switch (status) {
    case 'queued':
    case 'almost_your_turn':
      if (isUnpaid) {
        return 'Waiting for payment';
      }
      return 'Waiting for the student to confirm arrival';
    case 'waiting_for_student':
      return 'Student is at the desk';
    case 'printing':
      return 'Printing now';
    case 'ready':
    case 'ready_for_pickup':
      return 'Print done, waiting for pickup';
    case 'failed':
      return 'Print failed, retry or flag it';
    default:
      return '';
  }
}

/**
 * OperatorStatusChip:
 * Always displays BOTH icon + words (never colour only).
 * Includes the plain "next step" message right under the chip.
 * When compact is true, renders an inline chip without outer cell/next-step (used in dropdown header).
 * In standard mode, displays the new "Last action: {label} · {byName} · {time}" line beside the chip (hidden if null).
 */
export default function OperatorStatusChip({ job, compact = false }) {
  if (!job) return null;
  const { label, Icon, chipClass } = getStatusMeta(job.status);

  if (compact) {
    return (
      <span className={`operator-chip ${chipClass} operator-chip-compact`} aria-label={`Status: ${label}`}>
        <Icon size={12} className="operator-chip-icon" />
        <span className="operator-chip-label">{label}</span>
      </span>
    );
  }

  const nextStep = getNextStepText(job);

  return (
    <div className="operator-status-cell">
      <div className="operator-status-header-row">
        <div className={`operator-chip ${chipClass}`} aria-label={`Status: ${label}`}>
          <Icon size={14} className="operator-chip-icon" />
          <span className="operator-chip-label">{label}</span>
        </div>
        {job.lastAction && (
          <span className="operator-last-action-text" title={`Updated: ${job.statusUpdatedAt || 'just now'}`}>
            Last action: {job.lastAction.label} · {job.lastAction.byName} · {job.lastAction.time}
          </span>
        )}
      </div>
      {nextStep && <p className="operator-next-step-text">{nextStep}</p>}
    </div>
  );
}
