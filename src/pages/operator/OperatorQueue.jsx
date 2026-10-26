import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { api } from '../../lib/api';
import { DEMO_MODE } from '../../lib/config';
import {
  BellIcon,
  AlertTriangleIcon,
  SearchIcon,
  XIcon,
  ShieldCheckIcon,
} from '../../components/dashboard/DashboardIcons';
import { getMockOperatorJobs } from '../../mocks/operatorQueue';
import { getJobTransitions } from './jobTransitions';
import OperatorStatusChip from './OperatorStatusChip';
import OperatorActionsDropdown from './OperatorActionsDropdown';
import OperatorActionDialog from './OperatorActionDialog';
import OperatorDocumentModal from './OperatorDocumentModal';
import '../../components/dashboard/views/views.css';
import './operator.css';

/**
 * Filter tabs specification per Step 3:
 * - All (excludes ended)
 * - Queued (queued + almost_your_turn + waiting_for_student)
 * - Printing (printing)
 * - Ready (ready + ready_for_pickup)
 * - Pending Payment (paymentStatus === 'unpaid', excludes ended)
 * - Failed (failed)
 * - Ended (collected + cancelled)
 */
export const OPERATOR_TABS = [
  { id: 'all', label: 'All' },
  { id: 'queued', label: 'Queued' },
  { id: 'printing', label: 'Printing' },
  { id: 'ready', label: 'Ready' },
  { id: 'pending_payment', label: 'Pending Payment' },
  { id: 'failed', label: 'Failed' },
  { id: 'ended', label: 'Ended' },
];

// MOCK:
// TODO: backend: "ended" is decided by the server, never by the
// client. The live list endpoint must exclude collected and cancelled,
// the ended endpoint must return only today's jobs for this desk and
// require operator role, and nothing is deleted: payments and the
// audit log are kept. Undo from Ended must go through the state
// machine and be audit logged.
// TODO: backend: file deletion follows the retention rule, not this
// screen.
export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isJobEndedToday(job) {
  const isEnded = job.status === 'collected' || job.status === 'cancelled';
  if (!isEnded) return false;
  if (!job.statusUpdatedAt) return false;
  const updatedAt = new Date(job.statusUpdatedAt);
  if (isNaN(updatedAt.getTime())) return false;
  return isSameDay(updatedAt, new Date());
}

/**
 * Matches a job to a filter tab ID.
 * RULES (existing statuses only)
 * - Live view (All and every filter tab except Ended) never shows collected or cancelled jobs.
 * - When a job becomes collected or cancelled, it disappears from the live view automatically
 *   and appears in the Ended tab.
 * - failed jobs stay in the live view until an operator acts on them.
 * - The Ended tab shows only jobs whose ended time is today. Use statusUpdatedAt, don't add fields.
 */
export function isJobInTab(job, tabId) {
  const status = job.status;
  const isEnded = status === 'collected' || status === 'cancelled';

  // Rule: Live view (All and every filter tab except Ended) never shows collected or cancelled jobs.
  if (tabId !== 'ended' && isEnded) {
    return false;
  }

  switch (tabId) {
    case 'all':
      return !isEnded;
    case 'queued':
      // queued + almost_your_turn + waiting_for_student
      return status === 'queued' || status === 'almost_your_turn' || status === 'waiting_for_student';
    case 'printing':
      return status === 'printing';
    case 'ready':
      // ready + ready_for_pickup
      return status === 'ready' || status === 'ready_for_pickup';
    case 'pending_payment':
      // Unpaid and not ended
      return (job.paymentStatus === 'unpaid' || (job.amountDue != null && job.amountDue > 0)) && !isEnded;
    case 'failed':
      // failed jobs stay in the live view until an operator acts on them.
      return status === 'failed';
    case 'ended':
      // The Ended tab shows only jobs whose ended time is today. Use statusUpdatedAt, don't add fields.
      return isEnded && isJobEndedToday(job);
    default:
      return !isEnded;
  }
}

export default function OperatorQueue({ onNavigateHome, onLogout }) {
  const [operatorUser, setOperatorUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Queue state
  const [jobs, setJobs] = useState(() => getMockOperatorJobs());
  const [activeTab, setActiveTab] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stationOnline, setStationOnline] = useState(true);

  // Step 5b: State for fading cards, open Actions menus, pending removals, bell notifications, and aria-live announcements
  const [fadingJobIds, setFadingJobIds] = useState(() => new Set());
  const [pendingRemovalJobIds, setPendingRemovalJobIds] = useState(() => new Set());
  const [openMenuJobId, setOpenMenuJobId] = useState(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [bellList, setBellList] = useState([]);
  const [showBellPanel, setShowBellPanel] = useState(false);
  const [unreadBellCount, setUnreadBellCount] = useState(0);

  const bellRef = useRef(null);

  // Fetch operator profile from api.getMe()
  useEffect(() => {
    let mounted = true;
    api.getMe()
      .then((user) => {
        if (mounted) {
          setOperatorUser(user);
          setIsAuthLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsAuthLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Debounce search input (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  // ROUTE GUARD (UX only): role from api.getMe()
  // TODO: backend must enforce role === operator on every operator endpoint.
  // MOCK: In DEMO_MODE only, skip the check so I can preview the screen
  const isAuthorized = DEMO_MODE || operatorUser?.role === 'operator';

  if (!isAuthLoading && !isAuthorized) {
    return (
      <div className="operator-unauthorized-container">
        <div className="operator-unauthorized-card" role="alert">
          <AlertTriangleIcon size={36} color="#ba1a1a" />
          <h2>Not authorised</h2>
          <p>You must have operator privileges to access the Print Queue management desk.</p>
          <button
            type="button"
            className="operator-back-btn"
            onClick={onNavigateHome}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    if (onLogout) {
      onLogout();
    } else if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setDebouncedSearch('');
  };

  // Derive tab counts across all jobs
  const tabCounts = useMemo(() => {
    const counts = {};
    OPERATOR_TABS.forEach((tab) => {
      counts[tab.id] = jobs.filter((job) => isJobInTab(job, tab.id)).length;
    });
    return counts;
  }, [jobs]);

  // Filter jobs by active tab and search query
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Tab check
      const matchesTab = isJobInTab(job, activeTab);
      // In live view, retain card briefly while fading out or if pending removal while its menu was open
      const isFadingFromLive = activeTab !== 'ended' && (fadingJobIds.has(job.id) || pendingRemovalJobIds.has(job.id));

      if (!matchesTab && !isFadingFromLive) {
        return false;
      }

      // 2. Search check: matching fileName, studentLabel, and id (case-insensitive)
      if (!debouncedSearch.trim()) {
        return true;
      }

      const q = debouncedSearch.trim().toLowerCase();
      const fileName = (job.fileName || '').toLowerCase();
      const studentLabel = (job.studentLabel || job.name || job.genericAlias || '').toLowerCase();
      const id = String(job.id || '').toLowerCase();

      return fileName.includes(q) || studentLabel.includes(q) || id.includes(q);
    });
  }, [jobs, activeTab, debouncedSearch, fadingJobIds, pendingRemovalJobIds]);

  // Group filtered jobs by slot time (preserving slot grouping)
  const slotGroups = useMemo(() => {
    const groups = {};
    filteredJobs.forEach((job) => {
      const slotKey = job.slot || 'Other Slots';
      if (!groups[slotKey]) {
        groups[slotKey] = [];
      }
      groups[slotKey].push(job);
    });
    return groups;
  }, [filteredJobs]);

  // Derive display initials and name
  const displayName = operatorUser?.name || 'Hub Operator';
  const displayInitials = operatorUser?.name
    ? operatorUser.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'HO';

  // Helper mapping transitions to student portal button classes: primary, secondary, danger
  const getButtonVariant = (btn) => {
    if (btn.id === 'mark_failed' || btn.kind === 'cancel') {
      return 'danger';
    }
    if (btn.id === 'move_to_top' || btn.id === 'flag_for_review') {
      return 'secondary';
    }
    return 'primary';
  };

  // Toast notification state (8-second duration with Undo, adhering to student portal pattern)
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (message, onUndo) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, onUndo });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 8000);
  };

  // Dialog state for Step 6 modals
  const [activeDialog, setActiveDialog] = useState(null);

  // Step 7: Document preview modal state
  const [previewJob, setPreviewJob] = useState(null);

  const handleViewDocument = (job) => {
    setPreviewJob(job);
  };

  const handleDownloadDocument = (job) => {
    if (job?.fileUrl) {
      const a = document.createElement('a');
      a.href = job.fileUrl;
      a.download = job.fileName || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      showToast(`Download unavailable in demo mode: ${job.fileName || 'document'}`);
    }
  };

  // MOCK:
  // TODO: backend must verify the PIN hash, limit attempts, store the reasons and write an audit row.
  // TODO: backend: every transition via the state machine with role, payment, version and audit row.
  const handleActionClick = (action, job) => {
    if (action.id === 'copy_job_id') {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(String(job.id)).catch(() => {});
      }
      showToast(`Job ID ${job.id} copied to clipboard`, null);
      return;
    }

    // "Mark Printing, Mark Ready and Retry act at once with a toast."
    if (
      action.id === 'mark_printing' ||
      action.id === 'mark_ready' ||
      action.id === 'retry_print' ||
      action.id === 'retry'
    ) {
      executeJobMove(action, job);
      return;
    }

    // All other moves require their respective dialogs (Mark as Paid, Mark Failed, Cancel Job, Undo, Move to Top, Mark Collected)
    const sameSlotJobs = jobs.filter((j) => j.slot === job.slot);
    setActiveDialog({
      action,
      job,
      slotJobs: sameSlotJobs,
    });
  };

  // MOCK:
  // TODO: backend must verify the PIN hash, limit attempts, store the reasons and write an audit row.
  // TODO: backend: every transition via the state machine with role, payment, version and audit row.
  // Bell popover outside click dismiss
  useEffect(() => {
    if (!showBellPanel) return;
    const handleOutsideClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowBellPanel(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showBellPanel]);

  // Step 5b Behaviour 1, 2 & 4: Card removal animation & protection
  const triggerJobRemoval = useCallback((jobId) => {
    // Behaviour 4: Don't remove a card while its Actions menu or any dialog for that job is open.
    if (openMenuJobId === jobId) {
      setPendingRemovalJobIds((prev) => new Set(prev).add(jobId));
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Remove immediately without animation
      setFadingJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      setPendingRemovalJobIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    } else {
      // Short fade-out (250ms)
      setFadingJobIds((prev) => new Set(prev).add(jobId));
      setTimeout(() => {
        setFadingJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        setPendingRemovalJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      }, 250);
    }
  }, [openMenuJobId]);

  const handleMenuOpenChange = useCallback((jobId, isOpen) => {
    if (isOpen) {
      setOpenMenuJobId(jobId);
    } else {
      setOpenMenuJobId(null);
      // If this job was pending removal because it became ended while the menu was open, remove it right after closing
      if (pendingRemovalJobIds.has(jobId)) {
        triggerJobRemoval(jobId);
      }
    }
  }, [pendingRemovalJobIds, triggerJobRemoval]);

  // Behaviour 3 & 8: Simulated student cancellation via backend trigger or refresh
  const handleSimulateStudentCancel = (specificJobId = null) => {
    // Find matching job or first active, non-ended job
    const liveJobs = jobs.filter((j) => !['collected', 'cancelled'].includes(j.status));
    if (liveJobs.length === 0) {
      showToast('No active jobs to cancel in live queue');
      return;
    }

    const jobToCancel = (specificJobId ? liveJobs.find((j) => String(j.id) === String(specificJobId)) : null) || liveJobs[0];
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    const isoNow = now.toISOString();

    // Rule 4: If the job changed under an open dialog, show "This job just changed" and close the dialog
    if (activeDialog?.job?.id === jobToCancel.id) {
      showToast('This job just changed');
      setActiveDialog(null);
    }

    // Rule 4: If menu is open for this job, close it or defer removal
    if (openMenuJobId === jobToCancel.id) {
      setOpenMenuJobId(null);
    }

    // Behaviour 3: announce in aria-live region:
    // "{fileName} was cancelled by the student and moved to Ended"
    const announcementText = `${jobToCancel.fileName} was cancelled by the student and moved to Ended`;
    setLiveAnnouncement(announcementText);

    // Behaviour 3: Add to bell list
    setBellList((prev) => [
      {
        id: `notif-${Date.now()}`,
        text: announcementText,
        time: formattedTime,
        unread: true,
      },
      ...prev,
    ]);
    setUnreadBellCount((c) => c + 1);

    // Snapshot for Toast Undo (restores to queued)
    const previousJobSnapshot = { ...jobToCancel };

    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.id !== jobToCancel.id) return j;
        return {
          ...j,
          status: 'cancelled',
          cancelReason: 'Cancelled by student',
          statusUpdatedAt: isoNow,
          lastAction: {
            label: 'Cancelled by student',
            byName: 'Student',
            time: formattedTime,
          },
        };
      })
    );

    // Trigger removal with short fade (skipped when prefers-reduced-motion)
    triggerJobRemoval(jobToCancel.id);

    // Show toast with Undo restoring to queued
    showToast(`${jobToCancel.fileName} cancelled and moved to Ended`, () => {
      handleToastUndo(jobToCancel.id, {
        ...previousJobSnapshot,
        status: 'queued',
      });
    });
  };

  const handleSimulateRefresh = () => {
    showToast('Queue refreshed · All active desk jobs up to date');
  };

  // MOCK: Expose demo triggers programmatically on the backend / window / events (not on the screen UI)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__operatorDemo = {
        studentCancels: handleSimulateStudentCancel,
        simulateRefresh: handleSimulateRefresh,
      };

      const handleDemoEvent = (e) => {
        if (e.detail?.action === 'student_cancels') {
          handleSimulateStudentCancel(e.detail?.jobId);
        } else if (e.detail?.action === 'refresh') {
          handleSimulateRefresh();
        }
      };

      window.addEventListener('printfy:demo:operator', handleDemoEvent);
      return () => {
        window.removeEventListener('printfy:demo:operator', handleDemoEvent);
        delete window.__operatorDemo;
      };
    }
  });

  // MOCK:
  // TODO: backend must verify the PIN hash, limit attempts, store the reasons and write an audit row.
  // TODO: backend: every transition via the state machine with role, payment, version and audit row.
  const handleDialogConfirm = (payload) => {
    setActiveDialog(null);
    executeJobMove(payload.action, payload.job, payload);
  };

  // MOCK:
  // TODO: backend: "ended" is decided by the server, never by the
  // client. The live list endpoint must exclude collected and cancelled,
  // the ended endpoint must return only today's jobs for this desk and
  // require operator role, and nothing is deleted: payments and the
  // audit log are kept. Undo from Ended must go through the state
  // machine and be audit logged.
  // TODO: backend: file deletion follows the retention rule, not this
  // screen.
  const executeJobMove = (action, job, payload = {}) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    const isoNow = now.toISOString();

    // Snapshot before mutation for Toast Undo
    const previousJobSnapshot = { ...job };

    // Determine target status
    let nextStatus = action.target !== null ? action.target : job.status;
    let nextPaymentStatus = job.paymentStatus;
    let nextAmountDue = job.amountDue;
    let nextFlagged = job.flaggedForReview;
    let nextFailureReason = job.failureReason;
    let nextCancelReason = job.cancelReason;

    if (action.id === 'mark_paid') {
      nextPaymentStatus = 'paid';
      nextAmountDue = 0;
    } else if (action.id === 'undo_payment') {
      nextPaymentStatus = 'unpaid';
      nextAmountDue = payload.amountDue || previousJobSnapshot.amountDue || 80;
    } else if (action.id === 'flag_for_review') {
      nextFlagged = true;
    } else if (action.id === 'mark_failed') {
      nextStatus = 'failed';
      nextFailureReason = payload.failureReason || 'Other';
    } else if (action.id === 'retry_print' || action.id === 'retry') {
      nextStatus = 'queued';
      nextFailureReason = null;
    } else if (action.id === 'cancel_job' || action.id === 'cancel') {
      nextStatus = 'cancelled';
      nextCancelReason = payload.cancelReason || 'Cancelled by operator';
    } else if (action.id === 'mark_collected') {
      nextStatus = 'collected';
    } else if (action.id === 'undo_collected') {
      nextStatus = 'ready_for_pickup';
    } else if (action.id === 'undo_cancel') {
      nextStatus = 'queued';
    }

    const lastActionObj = {
      label: action.label,
      byName: displayName,
      time: formattedTime,
    };

    if (action.id === 'move_to_top') {
      // Reorder jobs in same slot
      setJobs((prevJobs) => {
        const slotJobs = prevJobs.filter((j) => j.slot === job.slot);
        const otherJobs = prevJobs.filter((j) => j.slot !== job.slot);
        const remainingInSlot = slotJobs.filter((j) => j.id !== job.id);
        const updatedTargetJob = {
          ...job,
          statusUpdatedAt: isoNow,
          lastAction: lastActionObj,
        };
        const reorderedSlot = [updatedTargetJob, ...remainingInSlot];
        return [...otherJobs, ...reorderedSlot];
      });

      showToast(`Moved ${job.fileName} to top of ${job.slot} slot`, () => {
        setJobs((prevJobs) =>
          prevJobs.map((j) => (j.id === job.id ? previousJobSnapshot : j))
        );
      });
      return;
    }

    // Update job in state (never hard-delete mock jobs, only filter by status)
    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.id !== job.id) return j;
        return {
          ...j,
          status: nextStatus,
          paymentStatus: nextPaymentStatus,
          amountDue: nextAmountDue,
          flaggedForReview: nextFlagged,
          failureReason: nextFailureReason,
          cancelReason: nextCancelReason,
          statusUpdatedAt: isoNow,
          lastAction: lastActionObj,
        };
      })
    );

    // Behaviour 1 & 2:
    // If moving to collected:
    // remove card from live list with a short fade (skipped when prefers-reduced-motion is set).
    // Show toast: "{fileName} collected and moved to Ended. Undo" for 8 seconds.
    // Undo restores the job to ready_for_pickup and its place in the list.
    if (nextStatus === 'collected') {
      triggerJobRemoval(job.id);
      showToast(`${job.fileName} collected and moved to Ended`, () => {
        handleToastUndo(job.id, {
          ...previousJobSnapshot,
          status: 'ready_for_pickup',
        });
      });
      return;
    }

    // If cancelled:
    // same, with "{fileName} cancelled and moved to Ended. Undo" (restores to queued).
    if (nextStatus === 'cancelled') {
      triggerJobRemoval(job.id);
      showToast(`${job.fileName} cancelled and moved to Ended`, () => {
        handleToastUndo(job.id, {
          ...previousJobSnapshot,
          status: 'queued',
        });
      });
      return;
    }

    // For undos executed from Ended tab (or other undos):
    // Clear any fading/pending removal state
    setFadingJobIds((prev) => {
      const next = new Set(prev);
      next.delete(job.id);
      return next;
    });
    setPendingRemovalJobIds((prev) => {
      const next = new Set(prev);
      next.delete(job.id);
      return next;
    });

    // Default toast for other moves
    showToast(`${action.label} applied`, () => {
      handleToastUndo(job.id, previousJobSnapshot);
    });
  };



  // MOCK:
  // TODO: backend: every transition via the state machine with role, payment, version and audit row.
  const handleToastUndo = (jobId, previousJobSnapshot) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    const isoNow = now.toISOString();

    // Clear any fading/pending removal state for this job so it's fully restored in the live view immediately
    setFadingJobIds((prev) => {
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });
    setPendingRemovalJobIds((prev) => {
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });

    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...previousJobSnapshot,
          statusUpdatedAt: isoNow,
          lastAction: {
            label: 'Undone',
            byName: displayName,
            time: formattedTime,
          },
        };
      })
    );

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(null);
  };

  return (
    <div className="operator-layout-root" data-name="Operator Job Queue — Desk A">
      {/* ====================================================================
          Top Navigation Bar (Figma Node 273:1501)
          ==================================================================== */}
      <header className="operator-top-nav" aria-label="Operator Navigation">
        <div className="operator-brand-nav-group">
          {/* Logo & Brand Link */}
          <div className="operator-brand-link">
            <img
              src="/logo/printfy-logo.svg"
              alt="Print-Fy Logo"
              className="operator-brand-logo-img"
            />
            <span className="operator-brand-text">Print-Fy</span>
          </div>

          {/* Navigation link: Dashboard only */}
          <nav className="operator-nav-links" aria-label="Main Operator Menu">
            <button
              type="button"
              className="operator-nav-link-item is-active"
              aria-current="page"
            >
              Dashboard
            </button>
          </nav>
        </div>

        {/* Right side: Bell icon with popover & unread badge, Operator identity, Sign Out */}
        <div className="operator-account-group">
          <div className="operator-bell-wrapper" ref={bellRef}>
            <button
              type="button"
              className="operator-bell-btn"
              aria-label={`Notifications${unreadBellCount > 0 ? `, ${unreadBellCount} unread` : ''}`}
              title="Notifications"
              onClick={() => {
                setShowBellPanel(!showBellPanel);
                if (unreadBellCount > 0) {
                  setUnreadBellCount(0);
                  setBellList((prev) => prev.map((item) => ({ ...item, unread: false })));
                }
              }}
            >
              <BellIcon size={20} color="#ffffff" />
              {unreadBellCount > 0 && (
                <span className="operator-bell-badge-dot" aria-hidden="true" />
              )}
            </button>

            {showBellPanel && (
              <div className="operator-bell-popover" role="dialog" aria-label="Recent notifications">
                <div className="operator-bell-popover-header">
                  <h4 className="operator-bell-title">Desk Notifications</h4>
                  <button
                    type="button"
                    className="operator-bell-close-btn"
                    onClick={() => setShowBellPanel(false)}
                    aria-label="Close notifications"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
                {bellList.length === 0 ? (
                  <div className="operator-bell-empty">
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <ul className="operator-bell-list">
                    {bellList.map((item) => (
                      <li key={item.id} className={`operator-bell-item ${item.unread ? 'is-unread' : ''}`}>
                        <p className="operator-bell-item-text">{item.text}</p>
                        <span className="operator-bell-item-time">{item.time}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="operator-identity-block">
            <div className="operator-avatar-pill" aria-hidden="true">
              {displayInitials}
            </div>
            <div className="operator-identity-details">
              <span className="operator-identity-name">{displayName}</span>
              <span className="operator-identity-subtitle">Campus print operations</span>
            </div>
          </div>

          <button
            type="button"
            className="operator-signout-btn"
            onClick={handleSignOut}
            title="Sign Out"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ====================================================================
          Station Queue Workspace
          ==================================================================== */}
      <main className="operator-workspace">
        {/* Header section with breadcrumb, title and station toggle controls */}
        <section className="operator-heading-section">
          {/* Screen reader live region for background job status updates */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {liveAnnouncement}
          </div>

          <div className="operator-heading-row">
            <div className="operator-heading-copy">
              <p className="operator-breadcrumb">Desk A / Job Queue</p>
              <h1 className="operator-page-title">Job Queue — Desk A</h1>
            </div>

            <div className="operator-station-controls">
              {/* Interactive Station switch toggle */}
              <div className="operator-station-availability">
                <div className="operator-availability-copy">
                  <span className="operator-availability-label">Station Online/Offline</span>
                  <span className="operator-availability-value">
                    {stationOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <button
                  type="button"
                  className={`operator-toggle-switch ${!stationOnline ? 'is-offline' : ''}`}
                  onClick={() => setStationOnline(!stationOnline)}
                  aria-label={`Toggle station availability, currently ${stationOnline ? 'Online' : 'Offline'}`}
                >
                  <div className="operator-toggle-thumb" />
                </button>
              </div>

              {/* Report Issue button */}
              <button
                type="button"
                className="operator-report-issue-btn"
                title="Report issue with Desk A printer"
              >
                Report Issue
              </button>
            </div>
          </div>

          {/* Search box & Filter tabs row */}
          <div className="operator-search-filters-row">
            {/* Search box matching fileName, studentLabel, and id (debounced, with clear button) */}
            <div className="operator-search-box">
              <SearchIcon size={18} className="operator-search-icon" />
              <input
                type="text"
                className="operator-search-input"
                placeholder="Search by document, student or job..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search jobs"
              />
              {searchInput && (
                <button
                  type="button"
                  className="operator-search-clear-btn"
                  onClick={handleClearSearch}
                  aria-label="Clear search query"
                  title="Clear search"
                >
                  <XIcon size={14} />
                </button>
              )}
            </div>

            {/* Filter tabs with counts: All (excludes ended), Queued, Printing, Ready, Pending Payment, Failed, Ended */}
            <nav className="operator-filters-group" role="tablist" aria-label="Filter queue jobs">
              {OPERATOR_TABS.map((tab) => {
                const isSelected = activeTab === tab.id;
                const count = tabCounts[tab.id] || 0;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-controls={`panel-${tab.id}`}
                    aria-selected={isSelected}
                    className={`operator-filter-pill-btn ${isSelected ? 'is-active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="operator-filter-label">{tab.label}</span>
                    <span className="operator-filter-count-badge">{count}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Operational Guidance Notice */}
          <div className="operator-safety-guidance">
            <ShieldCheckIcon size={16} className="operator-safety-icon" />
            <span>
              No tap = no print. Student taps "I'm Here — Start My Print" to begin; payment must be recorded. Moving a job only changes queue order.
            </span>
          </div>
        </section>

        {/* Station Jobs Area */}
        <section
          className="operator-station-jobs"
          aria-label="Job Queue Area"
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {/* Header count context */}
          <div className="operator-jobs-list-context">
            <h2 className="operator-jobs-context-title">Jobs at this station</h2>
            <span className="operator-jobs-context-count">
              Showing {filteredJobs.length} of {activeTab === 'ended' ? (tabCounts.ended || 0) : jobs.filter((j) => !['collected', 'cancelled'].includes(j.status)).length} jobs
            </span>
          </div>

          {/* 6-Column Headers Row */}
          <div className="operator-column-headers" aria-hidden="true">
            <div className="operator-col-header-item col-timings">
              <span className="operator-col-header-title">Timings</span>
              <span className="operator-col-header-subtitle">Slot · Arrival</span>
            </div>

            <div className="operator-col-header-item col-date">
              <span className="operator-col-header-title">Date</span>
              <span className="operator-col-header-subtitle">Submitted</span>
            </div>

            <div className="operator-col-header-item col-payment">
              <span className="operator-col-header-title">Payment</span>
              <span className="operator-col-header-subtitle">Status · Amount</span>
            </div>

            <div className="operator-col-header-item col-status">
              <span className="operator-col-header-title">Status</span>
              <span className="operator-col-header-subtitle">State & Next step</span>
            </div>

            <div className="operator-col-header-item col-document">
              <span className="operator-col-header-title">Document</span>
              <span className="operator-col-header-subtitle">Name · Specs</span>
            </div>

            <div className="operator-col-header-item col-actions">
              <span className="operator-col-header-title">Actions</span>
              <span className="operator-col-header-subtitle">Operator control</span>
            </div>
          </div>

          {/* Jobs List (Slot Grouped) or Empty Results Message */}
          {filteredJobs.length === 0 ? (
            <div className="operator-empty-jobs-state" role="status">
              <AlertTriangleIcon size={32} className="operator-empty-icon" />
              {debouncedSearch.trim() ? (
                <>
                  <h3 className="operator-empty-title">
                    No jobs match "{debouncedSearch}"
                  </h3>
                  <p className="operator-empty-desc">
                    Try checking for spelling errors or searching with a different file name, student name, or job ID.
                  </p>
                  <button
                    type="button"
                    className="operator-empty-clear-btn"
                    onClick={handleClearSearch}
                  >
                    Clear Search
                  </button>
                </>
              ) : activeTab === 'ended' ? (
                <>
                  <h3 className="operator-empty-title">Nothing has ended yet today</h3>
                  <p className="operator-empty-desc">
                    Jobs marked as collected or cancelled today will appear here.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="operator-empty-title">No jobs in this category</h3>
                  <p className="operator-empty-desc">
                    There are currently no print jobs under the selected filter tab.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="operator-slot-groups-list">
              {Object.entries(slotGroups).map(([slotTime, slotJobs]) => (
                <div key={slotTime} className="operator-slot-group-card">
                  {/* Slot Group Header Bar */}
                  <div className="operator-slot-header-bar">
                    <div className="operator-slot-heading-pill-wrap">
                      <span className="operator-slot-time-pill">{slotTime}</span>
                      <h3 className="operator-slot-title-text">Booked arrival slot</h3>
                    </div>
                    <span className="operator-slot-helper-text">
                      {slotJobs.length} {slotJobs.length === 1 ? 'job' : 'jobs'} in slot · Submitted order within slot
                    </span>
                  </div>

                  {/* Slot Jobs Stack */}
                  <div className="operator-slot-jobs-stack">
                    {slotJobs.map((job, jobIndex) => {
                      const isPaid = job.paymentStatus === 'paid';
                      const isTopInSlot = jobIndex === 0;
                      const { buttons } = getJobTransitions(job, { isTopInSlot });
                      const formattedTime = job.submittedAt
                        ? new Date(job.submittedAt).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : '—';

                      return (
                        <article
                          key={job.id}
                          className={`operator-job-row-card ${fadingJobIds.has(job.id) ? 'is-fading-out' : ''}`}
                          aria-label={`Job ${job.fileName} by ${job.studentLabel || job.name || 'Student'}`}
                        >
                          <div className="operator-job-row-content">
                            {/* Cell 1: Timings */}
                            <div className="operator-cell-timings-box">
                              <span className="operator-cell-timings-time">{job.slot}</span>
                              <span className="operator-cell-timings-arrival">
                                {job.canArrive ? 'Arrival: Confirmed' : 'Arrival: Not confirmed'}
                              </span>
                            </div>

                            {/* Cell 2: Date */}
                            <div className="operator-cell-date-box">
                              <span className="operator-cell-date-main">—</span>
                              <span className="operator-cell-date-submitted">
                                Submitted: {formattedTime}
                              </span>
                            </div>

                            {/* Cell 3: Payment */}
                            <div className="operator-cell-payment-box">
                              <span className="operator-cell-payment-title">
                                {isPaid ? 'Paid' : 'Unpaid'}
                              </span>
                              <div className="operator-payment-pill-container">
                                <span
                                  className={`operator-payment-amount-pill ${
                                    isPaid ? 'is-paid' : 'is-unpaid'
                                  }`}
                                >
                                  {isPaid
                                    ? 'Rs. 10'
                                    : `Rs. ${job.amountDue != null ? job.amountDue : 80}`}
                                </span>
                                <span className="operator-payment-method-label">
                                  {isPaid ? 'JazzCash' : 'Cash at desk'}
                                </span>
                              </div>
                            </div>

                            {/* Cell 4: Status Chip + Plain Next Step Line */}
                            <div className="operator-cell-status-box">
                              <OperatorStatusChip job={job} />
                            </div>

                            {/* Cell 5: Document Information */}
                            <div className="operator-cell-document-box">
                              <h4 className="operator-document-title">{job.fileName}</h4>
                              <p className="operator-document-specs">
                                {job.colorMode || 'B&W'} · {job.pages || 1} pages
                                {job.duplex ? ` · ${job.duplex}` : ''}
                                {job.studentLabel || job.name ? ` · ${job.studentLabel || job.name}` : ''}
                              </p>
                              {job.status === 'failed' && (
                                <p className="operator-document-error">Reason: Paper Jam / Feed error</p>
                              )}
                              <div className="operator-card-doc-access-bar">
                                <button
                                  type="button"
                                  className="operator-doc-action-btn view-btn"
                                  title="View document in modal"
                                  onClick={() => handleViewDocument(job)}
                                >
                                  View Document
                                </button>
                                <button
                                  type="button"
                                  className="operator-doc-action-btn download-btn"
                                  title="Download original document file"
                                  onClick={() => handleDownloadDocument(job)}
                                >
                                  Download
                                </button>
                              </div>
                            </div>

                            {/* Cell 6: Actions (Visible Buttons + Actions Dropdown from jobTransitions.js) */}
                            <div className="operator-cell-actions-box">
                              {activeTab !== 'ended' && buttons.length > 0 && (
                                <div className="operator-actions-button-stack">
                                  {buttons.map((btn) => {
                                    const variant = getButtonVariant(btn);
                                    return (
                                      <div key={btn.id} className="operator-action-button-item">
                                        <button
                                          type="button"
                                          disabled={btn.disabled}
                                          className={`operator-btn ${variant} btn-${variant} operator-btn-${variant} ${
                                            btn.disabled ? 'is-disabled' : ''
                                          }`}
                                          onClick={() => !btn.disabled && handleActionClick(btn, job)}
                                        >
                                          {btn.label}
                                        </button>
                                        {btn.disabled && btn.disabledReason && (
                                          <p className="operator-btn-disabled-reason">{btn.disabledReason}</p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              <OperatorActionsDropdown
                                job={job}
                                onAction={(actionItem) => handleActionClick(actionItem, job)}
                                onOpenChange={(isOpen) => handleMenuOpenChange(job.id, isOpen)}
                              />
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Queue Summary Strip (from Figma frame) */}
        <footer className="operator-summary-strip" aria-label="Queue summary details">
          <p className="operator-summary-text">
            <strong>{jobs.filter((j) => !['collected', 'cancelled'].includes(j.status)).length} live jobs</strong> · {tabCounts.queued || 0} queued · {tabCounts.printing || 0} printing · {tabCounts.ready || 0} ready for pickup.
          </p>
          <p className="operator-summary-meta">
            Desk A totals · Showing {filteredJobs.length} of {activeTab === 'ended' ? (tabCounts.ended || 0) : jobs.filter((j) => !['collected', 'cancelled'].includes(j.status)).length} jobs. Mock sample amounts and schedule timestamps are illustrative only.
          </p>
        </footer>

        {/* Floating Toast Notification (8s duration, student portal pattern with Undo) */}
        {toast && (
          <div
            className="dashboard-floating-toast operator-floating-toast"
            role="status"
            aria-live="polite"
          >
            <span className="operator-toast-message">{toast.message}.</span>
            {toast.onUndo && (
              <button
                type="button"
                className="operator-toast-undo-btn"
                onClick={toast.onUndo}
              >
                Undo
              </button>
            )}
          </div>
        )}

        {/* Step 6: Operator Action Dialogs (Mark as Paid, Mark Failed, Cancel Job, Undo, Move to Top, Mark Collected) */}
        <OperatorActionDialog
          isOpen={Boolean(activeDialog)}
          action={activeDialog?.action}
          job={activeDialog?.job}
          slotJobs={activeDialog?.slotJobs || []}
          onConfirm={handleDialogConfirm}
          onClose={() => setActiveDialog(null)}
        />

        {/* Step 7: Operator Document Modal (View Document & Download) */}
        <OperatorDocumentModal
          isOpen={Boolean(previewJob)}
          job={previewJob}
          onClose={() => setPreviewJob(null)}
          onShowToast={showToast}
        />
      </main>
    </div>
  );
}
