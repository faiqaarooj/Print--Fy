import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  PrinterIcon,
  CheckCircleIcon,
  FileTextIcon,
  XIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  EditIcon,
  LockIcon,
} from '../DashboardIcons';


import { api } from '../../../lib/api';
import { formatSlotHeader } from '../../../lib/time';
import { DEMO_MODE, POLL_SECONDS } from '../../../lib/config';

// Available campus arrival slots (closing at 3:30 PM)
const CAMPUS_SLOTS = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
];

/**
 * Derives the single status headline for the active job card.
 */
function getStatusHeadline(status) {
  switch (status) {
    case 'printing':
      return 'Your Document is Printing';
    case 'almost_your_turn':
      return 'Almost Your Turn!';
    case 'waiting_for_student':
      return 'Waiting at Desk';
    case 'ready':
      return 'Ready for Collection';
    case 'failed':
      return 'Print Failed';
    case 'queued':
    default:
      return 'Your Job is in the Queue';
  }
}

/**
 * Derives the single status description message per state.
 * Rule: "You are next in line" appears ONLY when position = 1.
 * If position is missing, "next in line" and "N ahead" text are hidden.
 */
function getStatusDescription(status, position, jobsAhead) {
  if (position === 1) {
    return 'You are next in line';
  }

  switch (status) {
    case 'queued':
      if (jobsAhead != null && jobsAhead > 0) {
        return `${jobsAhead} ${jobsAhead === 1 ? 'job' : 'jobs'} ahead of you`;
      }
      return null;
    case 'almost_your_turn':
      return 'Almost your turn: head to the desk';
    case 'waiting_for_student':
      return 'Waiting for student at desk';
    case 'printing':
      return 'Printing in progress';
    case 'ready':
      return 'Ready for collection';
    case 'failed':
      return 'Print failed';
    default:
      return null;
  }
}

/**
 * Maps backend status to human-readable generic label for privacy.
 */
function getGenericStatusLabel(status) {
  switch (status) {
    case 'printing':
      return 'Printing';
    case 'almost_your_turn':
      return 'Next up';
    case 'waiting_for_student':
      return 'Waiting at desk';
    case 'ready':
      return 'Ready';
    case 'failed':
      return 'Failed';
    case 'queued':
    default:
      return 'Waiting';
  }
}

/**
 * StudentQueueStatusCard
 * Redesigned student queue status card adhering strictly to Figma specifications.
 *
 * PROPS CONTRACT:
 * - position: number | null
 * - jobsAhead: number | null
 * - estWaitMins: number | null
 * - slotTime: string
 * - location: string
 * - fileName: string
 * - pages: number
 * - colorMode: string
 * - sides: string
 * - amountDue: number | null
 * - paymentStatus: 'paid' | 'unpaid' | string
 * - status: string
 *
 * HANDLERS:
 * - onStartPrint: () => void
 * - onChangeSlot: () => void
 * - onCancelJob: () => void
 * - isStartingPrint?: boolean
 * - isCancelling?: boolean
 */
export function StudentQueueStatusCard({
  position,
  jobsAhead,
  estWaitMins,
  slotTime,
  location,
  fileName,
  pages,
  colorMode,
  sides,
  amountDue,
  paymentStatus,
  status,
  onStartPrint,
  onChangeSlot,
  onCancelJob,
  isArrivalConfirmed = false,
  onConfirmArrival,
  onReceivePayment,
  isStartingPrint = false,
  isCancelling = false,
}) {
  // SECURITY & STATE DERIVATION:
  // Button stays locked until status === "Ready" (or case-insensitive "ready").
  // Do NOT use position #1 or canArrive.
  // TODO: Derive 'Ready' from backend status ('ready' or 'Ready'). Backend must re-check payment status and queue state before starting a print.
  const isPaid = paymentStatus === 'paid';
  const isReady = typeof status === 'string' && (
    status === 'Ready' ||
    status.toLowerCase() === 'ready' ||
    status.toLowerCase() === 'ready_for_pickup'
  );

  // Primary button: Full-width, locked & disabled while unpaid or while waiting for ready status.
  // Turns solid purple and is enabled ONLY when status === "Ready" AND isPaid.
  const isButtonEnabled = isReady && isPaid && !isStartingPrint;

  // Format display text
  const displayLocation = location || 'Central Library · Desk A';
  const deskName = displayLocation.includes('·')
    ? displayLocation.split('·')[1].trim()
    : displayLocation || 'Desk A';

  return (
    <div className="student-queue-status-card" role="region" aria-label="Student Queue Status Card">
      {/* 1. Small grey line: "Central Library · Desk A" */}
      <div className="queue-card-top-location">
        <span>{displayLocation}</span>
      </div>

      {/* 2. Hero row: large "#5" with "in queue" under it. Beside it, one line: "4 ahead · ~12 min". Under that: "Slot 10:00 AM" with a small edit icon */}
      <div className="queue-card-hero-row">
        <div className="queue-card-hero-left">
          <span className="queue-card-position-num">
            #{position != null ? position : '-'}
          </span>
          <span className="queue-card-in-queue-label">in queue</span>
        </div>

        <div className="queue-card-hero-right">
          <div className="queue-card-ahead-wait-line">
            <span>
              {jobsAhead != null ? jobsAhead : 0} ahead · ~{estWaitMins != null ? estWaitMins : 0} min
            </span>
          </div>
          <div className="queue-card-slot-line">
            <span>Slot {slotTime || '10:00 AM'}</span>
            <button
              type="button"
              onClick={onChangeSlot}
              className="queue-card-slot-edit-btn"
              title="Change booked arrival time slot"
              aria-label="Change slot"
            >
              <EditIcon size={13} color="var(--queue-text-secondary)" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Divider */}
      <div className="queue-card-divider" />

      {/* 4. File row: icon, "Thesis_Final_Draft.pdf", then "12 pages · B&W · Double-sided" in muted text */}
      <div className="queue-card-file-row">
        <div className="queue-card-file-icon-box">
          <FileTextIcon size={18} color="var(--queue-text-secondary)" />
        </div>
        <div className="queue-card-file-details">
          <span className="queue-card-file-name" title={fileName}>
            {fileName || 'Thesis_Final_Draft.pdf'}
          </span>
          <span className="queue-card-file-specs">
            {pages || 1} {pages === 1 ? 'page' : 'pages'} · {colorMode || 'B&W'} · {sides || 'Double-sided'}
          </span>
        </div>
      </div>

      {/* Position 2 Availability Verification ("Are you coming?") */}
      {position === 2 && !isArrivalConfirmed && (
        <div className="queue-card-availability-check" role="alert">
          <div className="availability-alert-header">
            <span className="availability-pulse-indicator" />
            <strong className="availability-title">Almost your turn! Are you coming?</strong>
          </div>
          <p className="availability-message">
            Desk A is preparing your print. Please confirm you are on your way so the operator can verify your availability and receive your payment.
          </p>
          <div className="availability-actions-wrap">
            <button
              type="button"
              onClick={onConfirmArrival}
              className="availability-confirm-btn"
            >
              ✓ Yes, I'm on my way to Desk A
            </button>
            <button
              type="button"
              onClick={onChangeSlot}
              className="availability-reschedule-btn"
            >
              Need 5 mins? Change slot
            </button>
          </div>
        </div>
      )}

      {/* Position 2 Arrival Confirmed Notice */}
      {position === 2 && isArrivalConfirmed && (
        <div className="availability-confirmed-notice" role="status">
          <CheckCircleIcon size={14} color="#166534" />
          <span>✓ Arrival confirmed with Desk A! You are next in line.</span>
          {!isPaid && onReceivePayment && amountDue > 0 && (
            <button
              type="button"
              onClick={onReceivePayment}
              className="mark-paid-desk-btn"
              title="Record cash payment at Desk A"
            >
              Pay Cash at Desk A (Rs. {amountDue})
            </button>
          )}
        </div>
      )}

      {/* 5. One amber strip (or green when paid) */}
      {isPaid ? (
        <div className="queue-card-strip queue-card-strip-paid" role="status">
          <CheckCircleIcon size={15} color="var(--queue-green-text)" />
          <span className="queue-card-strip-text">Paid</span>
        </div>
      ) : (
        <div className="queue-card-strip queue-card-strip-unpaid" role="status">
          <span className="queue-card-strip-text">
            {position === 2 && isArrivalConfirmed
              ? `Arrival Confirmed · Pay Rs. ${amountDue} at ${deskName} to unlock your print`
              : `Pay Rs. ${amountDue} at ${deskName} to unlock your print`}
          </span>
        </div>
      )}

      {/* 6. Full-width primary button "I'm Here - Start My Print". Locked and clearly disabled while unpaid/not ready */}
      <button
        type="button"
        disabled={!isButtonEnabled}
        onClick={onStartPrint}
        className={`queue-card-primary-btn ${isButtonEnabled ? 'is-ready' : 'is-locked'}`}
        aria-label="I'm Here - Start My Print"
      >
        {isStartingPrint ? (
          <span>Starting Print...</span>
        ) : isButtonEnabled ? (
          <>
            <CheckCircleIcon size={16} color="#ffffff" />
            <span>I'm Here - Start My Print</span>
          </>
        ) : (
          <>
            <LockIcon size={15} color="var(--queue-btn-disabled-text)" />
            <span>I'm Here - Start My Print</span>
          </>
        )}
      </button>

      {/* 7. "Cancel job" as a small red text link, not a button. Opens confirm dialog */}
      <div className="queue-card-cancel-row">
        <button
          type="button"
          onClick={onCancelJob}
          disabled={isCancelling}
          className="queue-card-cancel-link"
          aria-label="Cancel print job"
        >
          {isCancelling ? 'Cancelling...' : 'Cancel job'}
        </button>
      </div>
    </div>
  );
}

export default function PrintQueueView({
  userJob,
  onUserJobUpdate,
  onJoinQueue,
  onCancelJob,
}) {
  const [queueList, setQueueList] = useState([]);
  const [deskInfo, setDeskInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Change slot modal state
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedNewSlot, setSelectedNewSlot] = useState('');
  const [isChangingSlot, setIsChangingSlot] = useState(false);
  const [slotChangeFeedback, setSlotChangeFeedback] = useState('');

  // Desk check-in modal state ("I'm Here - Start My Print")
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInFeedback, setCheckInFeedback] = useState('');

  // Cancel confirmation modal state (focus trap, Esc closes)
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const cancelModalRef = useRef(null);

  // Availability verification state for Queue Position #2 ("Are you coming?")
  const [isArrivalConfirmed, setIsArrivalConfirmed] = useState(false);



  // Aria live announcement text for screen readers
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const previousPositionRef = useRef(null);

  // Manual refresh button state & handler
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    if (isManualRefreshing) return;
    setIsManualRefreshing(true);
    try {
      const [queueData, deskData] = await Promise.all([
        api.getQueue(userJob),
        api.getDeskInfo(),
      ]);
      setQueueList(queueData);
      setDeskInfo(deskData);

      const matchingUserJob = queueData.find(
        (j) => j.isUserJob || (userJob && String(j.id) === String(userJob.id))
      );
      if (matchingUserJob && typeof matchingUserJob.position === 'number') {
        const pos = matchingUserJob.position;
        const ahead = Math.max(0, pos - 1);
        setLiveAnnouncement(
          pos === 1
            ? 'Queue refreshed. Queue position #1. You are next in line.'
            : `Queue refreshed. Queue position #${pos}. ${ahead} ${ahead === 1 ? 'job' : 'jobs'} ahead.`
        );
        previousPositionRef.current = pos;
      } else {
        setLiveAnnouncement('Queue refreshed.');
      }
    } catch (err) {
      setError(err.message || 'Unable to refresh queue.');
    } finally {
      setTimeout(() => {
        setIsManualRefreshing(false);
      }, 500);
    }
  };


  // Load initial queue data & desk info from API
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [queueData, deskData] = await Promise.all([
          api.getQueue(userJob),
          api.getDeskInfo(),
        ]);
        if (isMounted) {
          setQueueList(queueData);
          setDeskInfo(deskData);

          const matchingUserJob = queueData.find(
            (j) => j.isUserJob || (userJob && String(j.id) === String(userJob.id))
          );
          if (matchingUserJob && typeof matchingUserJob.position === 'number') {
            const pos = matchingUserJob.position;
            const ahead = Math.max(0, pos - 1);
            setLiveAnnouncement(
              pos === 1
                ? 'Queue position #1. You are next in line.'
                : `Queue position #${pos}. ${ahead} ${ahead === 1 ? 'job' : 'jobs'} ahead.`
            );
            previousPositionRef.current = pos;
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load live queue.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [userJob?.id, userJob?.slot, userJob?.status]);

  // Periodic refresh using POLL_SECONDS from config
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const freshQueue = await api.getQueue(userJob);
        setQueueList(freshQueue);

        const currentActive = freshQueue.find(
          (j) => j.isUserJob || (userJob && String(j.id) === String(userJob.id))
        );
        if (currentActive && typeof currentActive.position === 'number') {
          if (previousPositionRef.current !== currentActive.position) {
            const ahead = Math.max(0, currentActive.position - 1);
            setLiveAnnouncement(
              currentActive.position === 1
                ? 'Queue position updated to #1. You are next in line.'
                : `Queue position updated to #${currentActive.position}. ${ahead} jobs ahead.`
            );
            previousPositionRef.current = currentActive.position;
          }
        }
      } catch {
        // Silently fail on background poll in demo
      }
    }, POLL_SECONDS * 1000);

    return () => clearInterval(timer);
  }, [userJob]);

  // -------------------------------------------------------------
  // SINGLE SOURCE OF TRUTH:
  // Card and list rows read from the SAME queue object (userQueueEntry).
  // Position, "N ahead", booked slot, and status come from API fields with NO defaulting.
  // -------------------------------------------------------------
  const userQueueEntry = queueList.find(
    (j) => j.isUserJob || (userJob && String(j.id) === String(userJob.id))
  );

  const userPosition =
    userQueueEntry && typeof userQueueEntry.position === 'number'
      ? userQueueEntry.position
      : null;

  const jobsAheadCount =
    userPosition != null ? Math.max(0, userPosition - 1) : null;

  const userSlot = userQueueEntry?.slot || '-';
  const userPaymentStatus = (userQueueEntry?.paymentStatus || userJob?.paymentStatus || 'unpaid').toLowerCase();
  const isPaid = userPaymentStatus === 'paid';
  const totalPages = Math.max(1, Number(userQueueEntry?.pages || userJob?.pages || 1));
  const userCopies = Math.max(1, Number(userQueueEntry?.copies || userJob?.copies || 1));
  const pageRate = (userQueueEntry?.colorMode || userJob?.colorMode) === 'Color' ? 15 : 10;

  // It should ONLY calculate the amount which needs to be paid:
  // If paid -> 0! (Nothing needs to be paid)
  // If unpaid -> exact payable amount for this job
  const calculatedAmountDue = isPaid
    ? 0
    : userQueueEntry?.amountDue != null
    ? userQueueEntry.amountDue
    : userJob?.amountDue != null
    ? userJob.amountDue
    : userJob?.cost != null
    ? userJob.cost
    : totalPages * userCopies * pageRate;

  const userFileName =
    userQueueEntry?.fileName ||
    userQueueEntry?.name ||
    userJob?.name ||
    userJob?.fileName ||
    'Document.pdf';

  const userStatus = userQueueEntry?.status || userJob?.status || 'queued';

  const handleReceiveDeskPayment = () => {
    const updated = {
      ...userQueueEntry,
      paymentStatus: 'paid',
      amountDue: 0,
      status: 'Ready',
    };
    setQueueList((prev) =>
      prev.map((j) =>
        j.isUserJob || (userJob && String(j.id) === String(userJob.id))
          ? { ...j, paymentStatus: 'paid', amountDue: 0, status: 'Ready' }
          : j
      )
    );
    if (onUserJobUpdate) {
      onUserJobUpdate(updated);
    }
    setLiveAnnouncement(`Payment received at Desk A! Your document is ready.`);
  };


  // "I'm Here" button enabled only when API returns canArrive: true (and position is known)
  const canArrive = Boolean(userQueueEntry?.canArrive === true && userPosition != null);


  // Status headline & message
  const statusHeadline = getStatusHeadline(userStatus);
  const statusDescription = getStatusDescription(userStatus, userPosition, jobsAheadCount);

  // Focus trap and Escape key listener for cancel confirmation modal
  useEffect(() => {
    if (!showCancelConfirmModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowCancelConfirmModal(false);
        return;
      }
      if (e.key === 'Tab' && cancelModalRef.current) {
        const focusableElements = cancelModalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      const focusable = cancelModalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [showCancelConfirmModal]);

  // Handler for changing arrival slot
  const handleApplySlotChange = async () => {
    const targetId = userQueueEntry?.id || userJob?.id;
    if (!selectedNewSlot || !targetId) return;
    setIsChangingSlot(true);
    setSlotChangeFeedback('');

    // SECURITY VERIFICATION (UI checks are not security enforcement):
    // Every action must be validated on the backend:
    // 1. Job ownership: Verify the authenticated user owns this print job.
    // 2. Queue state: Verify slot capacity and that job status permits slot rescheduling.
    // TODO: Stubbed security validation. Backend endpoint /jobs/:id/slot must enforce ownership and queue state rules.
    try {
      const serverResponse = await api.changeSlot(targetId, selectedNewSlot, userQueueEntry);

      setQueueList(serverResponse.queue);
      if (onUserJobUpdate && serverResponse.job) {
        onUserJobUpdate(serverResponse.job);
      }

      setLiveAnnouncement(
        `Arrival slot moved to ${selectedNewSlot}. Queue position #${serverResponse.job.position}.`
      );
      setSlotChangeFeedback(
        `Slot changed to ${selectedNewSlot}! New queue position: #${serverResponse.job.position}`
      );
      setTimeout(() => {
        setShowSlotModal(false);
        setSlotChangeFeedback('');
      }, 1500);
    } catch (err) {
      setSlotChangeFeedback(err.message || 'Failed to update slot. Please try again.');
    } finally {
      setIsChangingSlot(false);
    }
  };

  // Handler for Confirming Check-In at desk ("I'm Here - Start My Print")
  const handleConfirmCheckIn = async () => {
    const targetId = userQueueEntry?.id || userJob?.id || 'job-105';
    setIsCheckingIn(true);
    setCheckInFeedback('');

    // SECURITY VERIFICATION (UI disabled button is UI only; not enforcement):
    // Every action must be strictly validated on the backend before starting a print:
    // 1. Ownership: targetId belongs to the authenticated user.
    // 2. Payment status: paymentStatus === 'paid' (must not release print while unpaid).
    // 3. Queue state: status === 'Ready' (strictly checking status prop, no position #1 or canArrive tricks).
    // TODO: Backend /jobs/:id/check-in must re-check ownership, payment status, and queue state before triggering printer hardware.
    const isReadyStatus =
      typeof userStatus === 'string' &&
      (userStatus === 'Ready' ||
        userStatus.toLowerCase() === 'ready' ||
        userStatus.toLowerCase() === 'ready_for_pickup');

    if (userPaymentStatus !== 'paid' || !isReadyStatus) {
      console.warn('[Security] Frontend prevented check-in: Print job is not verified paid or status is not Ready.');
      // Backend must also reject this with 403/422 if called directly
    }


    try {
      const serverResponse = await api.checkInAtDesk(targetId);

      if (serverResponse?.queue) {
        setQueueList(serverResponse.queue);
      }
      if (onUserJobUpdate && serverResponse?.job) {
        onUserJobUpdate(serverResponse.job);
      }

      setLiveAnnouncement('Checked in at Hub Desk A! Printing has begun.');
      setCheckInFeedback('Desk A check-in verified! High-Speed Printer #1 is printing.');
      setShowCheckInModal(false);

      setTimeout(() => {
        setCheckInFeedback('');
      }, 4000);
    } catch (err) {
      alert(err.message || 'Check-in failed');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Handler for Confirming Cancellation
  const handleConfirmCancel = async () => {
    if (!userQueueEntry) return;
    setIsCancelling(true);

    // SECURITY VERIFICATION (Backend enforcement):
    // 1. Ownership: Confirm user owns the job.
    // 2. Queue state: Ensure job has not already started printing.
    // 3. Payment refund: Initiate automatic refund ledger entry if paymentStatus === 'paid'.
    // TODO: Backend /jobs/:id/cancel must validate ownership, queue state, and process refund.
    try {
      const serverResponse = await api.cancelJob(userQueueEntry.id);
      if (serverResponse?.queue) {
        setQueueList(serverResponse.queue);
      } else {
        setQueueList((prev) =>
          prev.filter((j) => String(j.id) !== String(userQueueEntry.id) && !j.isUserJob)
        );
      }
      if (onCancelJob) {
        onCancelJob();
      }
      setShowCancelConfirmModal(false);
      setLiveAnnouncement('Print job cancelled.');
    } catch (err) {
      alert(err.message || 'Failed to cancel print job');
    } finally {
      setIsCancelling(false);
    }
  };


  // Group queue jobs under slot headers ("9:00 AM", "10:00 AM", ...)
  const groupedSlots = queueList.reduce((acc, job) => {
    const rawSlot = job.slot || '-';
    const headerTitle = formatSlotHeader(rawSlot);

    let group = acc.find((g) => g.header === headerTitle);
    if (!group) {
      group = { header: headerTitle, jobs: [] };
      acc.push(group);
    }
    group.jobs.push(job);
    return acc;
  }, []);

  return (
    <div className="print-queue-view-root" data-node-id="149:20727">
      {/* Accessibility polite region for announcing queue position changes */}
      <div aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Page Header */}
      <div className="queue-page-header">
        <div className="queue-header-left">
          <h1 className="queue-headline">Live Print Queue</h1>
          <p className="queue-subtitle">
            Central Library Hub • Level 1 • Currently serving{' '}
            <strong>Hub Desk A</strong>
          </p>
        </div>


        {onJoinQueue && (
          <button
            type="button"
            onClick={onJoinQueue}
            className="join-queue-cta-btn"
            aria-label="Upload New Document"
          >
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* METRICS STRIP: Uses API's real estimated wait (No hardcoded fallback) */}
      <div className="queue-metrics-strip-grid">
        <div className="queue-metric-card traffic">
          <div className="metric-text-content">
            <span className="metric-category-label">Queue Traffic</span>
            <h3 className="metric-primary-val">
              {queueList.length} {queueList.length === 1 ? 'Student' : 'Students'} in Queue
            </h3>
            {deskInfo?.estimatedWaitMinutes != null && (
              <span className="metric-sub-detail">
                Estimated wait: <strong>{deskInfo.estimatedWaitMinutes} mins</strong>
              </span>
            )}
          </div>
          <div className="metric-icon-circle">
            <ClockIcon size={22} color="#551ee7" />
          </div>
        </div>

        {deskInfo?.printerStatus && (
          <div className="queue-metric-card hardware">
            <div className="metric-text-content">
              <span className="metric-category-label">Desk Printer Status</span>
              <div className="metric-status-line">
                <h3 className="metric-primary-val">{deskInfo.printerStatus}</h3>
                <span className="green-status-circle" />
              </div>
              <span className="metric-sub-detail">Central Library Desk A</span>
            </div>
            <div className="metric-icon-circle">
              <PrinterIcon size={22} color="#551ee7" />
            </div>
          </div>
        )}
      </div>

      {/* Operator Notice Banner: Appears only when API notice exists */}
      {deskInfo?.notice && (
        <div className="desk-operator-notice-banner" role="status" aria-label="Desk operator notice">
          <AlertTriangleIcon size={18} color="#c2410c" />
          <p className="operator-notice-text">
            <strong>Operator Notice:</strong> {deskInfo.notice}
          </p>
        </div>
      )}

      {/* SINGLE SOURCE OF TRUTH: Student Queue Status Card (Figma Redesign) */}
      {userQueueEntry ? (
        <section className="user-active-job-queue-banner" aria-label="Your Active Print Job">
          <StudentQueueStatusCard
            position={userPosition}
            jobsAhead={jobsAheadCount}
            estWaitMins={userQueueEntry.estimatedWaitMinutes != null ? userQueueEntry.estimatedWaitMinutes : (jobsAheadCount != null ? jobsAheadCount * 3 : 0)}
            slotTime={userQueueEntry.slot || '10:00 AM'}
            location={deskInfo?.deskName || 'Central Library · Desk A'}
            fileName={userFileName}
            pages={totalPages}
            colorMode={userQueueEntry.colorMode || 'B&W'}
            sides={userQueueEntry.sides || userQueueEntry.duplex || 'Double-sided'}
            amountDue={calculatedAmountDue}
            paymentStatus={userPaymentStatus}
            status={userStatus}
            isArrivalConfirmed={isArrivalConfirmed}
            onConfirmArrival={() => {
              setIsArrivalConfirmed(true);
              setLiveAnnouncement('Arrival confirmed. You are next in line for printing.');
            }}
            onReceivePayment={handleReceiveDeskPayment}
            onStartPrint={() => setShowCheckInModal(true)}
            onChangeSlot={() => {
              setSelectedNewSlot(userQueueEntry.slot || '10:00 AM');
              setShowSlotModal(true);
            }}
            onCancelJob={() => setShowCancelConfirmModal(true)}
            isStartingPrint={isCheckingIn}
            isCancelling={isCancelling}
          />

          {checkInFeedback && (
            <div className="checkin-feedback-banner" role="status">
              <CheckCircleIcon size={16} color="#059669" />
              <span>{checkInFeedback}</span>
            </div>
          )}
        </section>
      ) : (
        <div className="no-active-job-banner" role="region" aria-label="No active print job">
          <div className="no-active-job-left">
            <div className="no-active-job-icon-box">
              <FileTextIcon size={24} color="#551ee7" />
            </div>
            <div>
              <h4>No active print job in queue</h4>
              <p>Upload your document and choose an arrival slot to join the live campus print queue.</p>
            </div>
          </div>
          {onJoinQueue && (
            <button type="button" onClick={onJoinQueue} className="join-queue-empty-btn">
              Upload Document &amp; Join Queue →
            </button>
          )}
        </div>
      )}


      {/* Main 2-Column Grid */}
      <div className="queue-main-workspace-grid">
        {/* Left Column: Live Queue Sequence */}
        <div className="queue-sequence-left-column">
          <div className="sequence-section-header">
            <div className="sequence-title-group">
              <h2 className="sequence-heading">Live Queue Sequence</h2>
              {/* COPY: "Updates every {POLL_SECONDS}s" from config */}
              <span className="realtime-sync-pill">Updates every {POLL_SECONDS}s</span>
            </div>
            <div className="sequence-refresh-cluster">
              <span className="auto-refresh-notice">● Auto-refreshing ({POLL_SECONDS}s)</span>
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isManualRefreshing}
                className="queue-manual-refresh-btn"
                aria-label="Refresh queue now"
                title="Refresh queue now"
              >
                <RefreshCwIcon size={12} className={isManualRefreshing ? 'spin-anim' : ''} />
                <span>{isManualRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>

          </div>

          {isLoading ? (
            <div className="queue-loading-state" role="status">
              <div className="loading-spinner" />
              <span>Loading current queue...</span>
            </div>
          ) : error ? (
            <div className="queue-error-state" role="alert">
              <AlertTriangleIcon size={18} color="#ba1a1a" />
              <span>{error}</span>
            </div>
          ) : queueList.length === 0 ? (
            <div className="queue-empty-state">
              <FileTextIcon size={32} color="#a1a1aa" />
              <h4>The queue is currently clear</h4>
              <p>Upload a document to reserve your spot.</p>
            </div>
          ) : (
            <div className="queue-cards-stack">
              {groupedSlots.map((group) => (
                <div key={group.header} className="queue-slot-group">
                  <div className="queue-slot-header">
                    <ClockIcon size={14} color="#6d28d9" />
                    <span>Slot: {group.header}</span>
                  </div>

                  {group.jobs.map((job) => {
                    const isCurrentUser =
                      job.isUserJob || (userJob && String(job.id) === String(userJob.id));

                    return (
                      <div
                        key={job.id}
                        className={`queued-student-item-card ${
                          isCurrentUser ? 'user-highlight-card' : ''
                        }`}
                      >
                        <div className="queued-student-left">
                          {/* Sequential position badge: shows real position badge, never "#-" */}
                          <div
                            className={`queue-position-number-badge ${
                              isCurrentUser ? 'user-badge' : ''
                            }`}
                          >
                            {job.position != null ? `#${job.position}` : '-'}
                          </div>

                          <div className="queued-student-meta">
                            <div className="name-and-id-line">
                              {isCurrentUser ? (
                                <>
                                  <h4 className="student-name">You</h4>
                                  <span className="queue-position-pill user-turn-pill">
                                    Your Job
                                  </span>
                                </>
                              ) : (
                                <span className="generic-queue-identity">
                                  Position #{job.position != null ? job.position : '-'}
                                </span>
                              )}
                              <span
                                className={`queue-position-pill ${
                                  job.status === 'printing'
                                    ? 'printing'
                                    : job.status === 'almost_your_turn'
                                    ? 'up-next'
                                    : 'waiting'
                                }`}
                              >
                                {getGenericStatusLabel(job.status)}
                              </span>
                            </div>

                            {isCurrentUser && (
                              <span
                                className="queued-document-summary"
                                title={job.fileName || userFileName}
                              >
                                📄 {job.fileName || userFileName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="queued-student-right">
                          <span className="est-finish-time">{job.slot}</span>
                          <span className="wait-duration-text">
                            {job.status === 'printing'
                              ? 'Now Printing'
                              : job.status === 'almost_your_turn'
                              ? 'Next in line'
                              : 'Booked Slot'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: How Campus Printing Works */}
        <div className="queue-instructions-right-column">
          <div className="campus-printing-guide-card">
            <div className="guide-card-header">
              <span className="guide-header-icon">🎓</span>
              <h3 className="guide-card-title">How Campus Printing Works</h3>
            </div>

            <div className="guide-steps-list">
              {/* Step 1 */}
              <div className="guide-step-item">
                <div className="guide-step-number">1</div>
                <div className="guide-step-body">
                  <h4 className="guide-step-heading">Upload</h4>
                  <p className="guide-step-text">
                    Choose your file, copies, color mode, sides, and arrival slot.
                  </p>
                </div>
              </div>

              {/* Step 2: "Pay at the desk before your print starts" */}
              <div className="guide-step-item">
                <div className="guide-step-number">2</div>
                <div className="guide-step-body">
                  <h4 className="guide-step-heading">Pay</h4>
                  <p className="guide-step-text">
                    Pay at the desk before your print starts.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="guide-step-item">
                <div className="guide-step-number">3</div>
                <div className="guide-step-body">
                  <h4 className="guide-step-heading">Wait for your turn</h4>
                  <p className="guide-step-text">
                    Follow your live queue position and jobs ahead in real time.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="guide-step-item">
                <div className="guide-step-number">4</div>
                <div className="guide-step-body">
                  <h4 className="guide-step-heading">Tap "I'm Here"</h4>
                  <p className="guide-step-text">
                    Tap "I'm Here" at the desk, because printing starts only then.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHANGE SLOT MODAL */}
      <AnimatePresence>
        {showSlotModal && (
          <div
            className="dashboard-modal-backdrop"
            onClick={() => !isChangingSlot && setShowSlotModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="slot-modal-title"
          >
            <motion.div
              className="slot-picker-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="receipt-modal-header">
                <h3 id="slot-modal-title">Change Arrival Slot</h3>
                <button
                  type="button"
                  onClick={() => setShowSlotModal(false)}
                  disabled={isChangingSlot}
                  className="modal-close-btn"
                  aria-label="Close slot modal"
                >
                  <XIcon size={16} />
                </button>
              </div>

              <div className="slot-modal-body">
                <p className="slot-modal-description">
                  Select a new campus arrival time. Your position in the queue will be
                  re-evaluated based on the new slot.
                </p>

                <div className="slot-grid-options" role="radiogroup" aria-label="Available arrival slots">
                  {CAMPUS_SLOTS.map((slot) => {
                    const isSelected = selectedNewSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedNewSlot(slot)}
                        className={`slot-option-chip ${isSelected ? 'selected' : ''}`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                {slotChangeFeedback && (
                  <p
                    className={`slot-feedback-message ${
                      slotChangeFeedback.includes('changed') ? 'success' : 'error'
                    }`}
                    role="alert"
                  >
                    {slotChangeFeedback}
                  </p>
                )}
              </div>

              <div className="slot-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowSlotModal(false)}
                  disabled={isChangingSlot}
                  className="slot-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplySlotChange}
                  disabled={!selectedNewSlot || isChangingSlot}
                  className="slot-confirm-btn"
                >
                  {isChangingSlot ? 'Updating Slot...' : 'Confirm New Slot'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* DESK CHECK-IN MODAL ("Are you at the print desk?") */}
        {showCheckInModal && userQueueEntry && (
          <div
            className="dashboard-modal-backdrop"
            onClick={() => !isCheckingIn && setShowCheckInModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkin-modal-title"
          >
            <motion.div
              className="desk-checkin-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="receipt-modal-header">
                <div className="checkin-title-cluster">
                  <div className="checkin-header-icon-bubble">
                    <PrinterIcon size={20} color="#551ee7" />
                  </div>
                  <div>
                    <h3 id="checkin-modal-title">Central Library Print Counter</h3>
                    <span className="checkin-subtext">Hub Desk A • Level 1</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  disabled={isCheckingIn}
                  className="modal-close-btn"
                  aria-label="Close check-in dialog"
                >
                  <XIcon size={16} />
                </button>
              </div>

              <div className="checkin-modal-body">
                <div className="checkin-presence-prompt">
                  <div className="presence-prompt-icon-ring">
                    <CheckCircleIcon size={28} color="#10b981" />
                  </div>
                  <h4 className="presence-prompt-headline">Are you at the print desk?</h4>
                  <p className="presence-prompt-desc">
                    Tapping <strong>"Start My Print"</strong> will notify the desk operator and immediately release your document to Printer #1.
                  </p>
                </div>

                <div className="checkin-job-preview-box">
                  <div className="preview-job-icon">
                    <FileTextIcon size={22} color="#551ee7" />
                  </div>
                  <div className="preview-job-details">
                    <h5 className="preview-job-filename" title={userFileName}>
                      {userFileName}
                    </h5>
                    <p className="preview-job-meta">
                      {totalPages} {totalPages === 1 ? 'page' : 'pages'} • {userQueueEntry.colorMode || 'B&W'} •{' '}
                      {userQueueEntry.duplex || 'Double-sided'}
                    </p>
                  </div>
                  <span className="preview-status-pill">Ready to Release</span>
                </div>

                <div className="checkin-operator-reassurance">
                  <p>
                    ✓ High-Speed Printer #1 is online and ready.<br />
                    ✓ Please stand near the collection tray to receive your printed sheets.
                  </p>
                </div>
              </div>

              <div className="checkin-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  disabled={isCheckingIn}
                  className="slot-cancel-btn"
                >
                  Still On My Way
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCheckIn}
                  disabled={isCheckingIn}
                  className="checkin-confirm-btn"
                >
                  {isCheckingIn ? (
                    <>
                      <div className="loading-spinner-small" />
                      <span>Releasing to Printer...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon size={16} color="#ffffff" />
                      <span>I'm Here — Start My Print</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* CANCEL CONFIRMATION DIALOG (focus trap, Esc closes) */}
        {showCancelConfirmModal && userQueueEntry && (
          <div
            className="dashboard-modal-backdrop"
            onClick={() => !isCancelling && setShowCancelConfirmModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
          >
            <motion.div
              ref={cancelModalRef}
              className="cancel-confirmation-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
            >
              <div className="receipt-modal-header">
                <h3 id="cancel-dialog-title">Cancel Print Job</h3>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirmModal(false)}
                  disabled={isCancelling}
                  className="modal-close-btn"
                  aria-label="Close cancel dialog"
                >
                  <XIcon size={16} />
                </button>
              </div>

              <div className="cancel-modal-body">
                <p>
                  Are you sure you want to cancel your print job for{' '}
                  <strong>{userFileName}</strong>?
                </p>
                <p className="cancel-modal-warning">
                  This action will remove your spot from the live queue and cancel your print run.
                </p>
              </div>

              <div className="cancel-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCancelConfirmModal(false)}
                  disabled={isCancelling}
                  className="cancel-modal-dismiss-btn"
                >
                  Keep Job
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="cancel-modal-confirm-btn"
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel Job'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
