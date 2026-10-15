import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarNav from '../../components/dashboard/SidebarNav';
import {
  BellIcon,
  AlertTriangleIcon,
  XIcon,
  CopyIcon,
  ReceiptIcon,
  CheckIcon,
} from '../../components/dashboard/DashboardIcons';
import DashboardOverviewView from '../../components/dashboard/views/DashboardOverviewView';
import DocumentUploadView from '../../components/dashboard/views/DocumentUploadView';
import PaymentCheckoutView from '../../components/dashboard/views/PaymentCheckoutView';
import PrintQueueView from '../../components/dashboard/views/PrintQueueView';
import UniversityFormsView from '../../components/dashboard/views/UniversityFormsView';
import { api } from '../../lib/api';
import '../../components/dashboard/views/views.css';
import './StudentDashboard.css';

const STORAGE_KEY = 'printfy_student_documents';

export default function StudentDashboard({ onNavigateHome, onUploadDocument, onLogout }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash.includes('queue')) return 'queue';
    if (hash.includes('forms')) return 'forms';
    if (hash.includes('payment')) return 'payment';
    if (hash.includes('upload')) return 'upload';
    return 'dashboard';
  }); // 'dashboard' | 'upload' | 'payment' | 'queue' | 'forms'

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '';
      if (hash.includes('queue')) setActiveTab('queue');
      else if (hash.includes('forms')) setActiveTab('forms');
      else if (hash.includes('payment')) setActiveTab('payment');
      else if (hash.includes('upload')) setActiveTab('upload');
      else if (hash.includes('dashboard') && !hash.includes('tab=')) setActiveTab('dashboard');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [deskNotice, setDeskNotice] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: 'Faiqa Arooj',
    initials: 'FA',
    studentId: 'STU-884920',
    role: null,
    title: null,
  });

  useEffect(() => {
    let mounted = true;
    api.getMe().then((u) => {
      if (mounted && u) setUserProfile(u);
    }).catch(() => {});

    api.getDeskInfo().then((d) => {
      if (mounted && d?.notice) setDeskNotice(d.notice);
    }).catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const [copiedPin, setCopiedPin] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);

  // Upload Screen (111:14114) documents queue: Starts 100% empty (no static / dummy files)
  const [pendingUploadDocs, setPendingUploadDocs] = useState([]);

  // Payment Screen (118:16469) target document
  const [pendingCheckoutDoc, setPendingCheckoutDoc] = useState(null);

  // Student documents store: default to [] or load from localStorage
  // This satisfies "build a dashboard where nothing is here !" when fresh
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((d) => d.id !== 'doc-init-1' && d.id !== 'upl-init-1');
        }
      }
    } catch (e) {
      console.warn('Failed to load user documents from localStorage', e);
    }
    return []; // Empty by default matching Figma node 174:805
  });

  // Save documents back to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (e) {
      console.warn('Failed to save user documents to localStorage', e);
    }
  }, [documents]);

  // Scroll detection to smoothly shrink navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  // Find active print job (if any)
  const activeJob = documents.find((doc) => doc.isActive && doc.status !== 'Collected');

  // Real-time printing ticker simulation (only runs when job is actively printing)
  useEffect(() => {
    const isPrinting =
      activeJob &&
      (activeJob.status === 'Printing' || activeJob.status === 'printing');
    if (!isPrinting) {
      return;
    }

    const interval = setInterval(() => {
      setDocuments((prevDocs) =>
        prevDocs.map((doc) => {
          if (doc.id !== activeJob.id) return doc;

          const nextPrinted = doc.printedPages + 1;
          const isComplete = nextPrinted >= doc.pages;
          const newStatus = isComplete ? 'Ready for Pickup' : 'Printing';

          if (isComplete && doc.status !== 'Ready for Pickup') {
            showToast(`Print ready! Use PIN ${doc.pin} at Central Library Kiosk.`);
          }

          return {
            ...doc,
            printedPages: Math.min(nextPrinted, doc.pages),
            status: newStatus,
            speed: Math.floor(64 + Math.random() * 8),
          };
        })
      );
    }, 2400);

    return () => clearInterval(interval);
  }, [activeJob?.id, activeJob?.status, activeJob?.printedPages, activeJob?.pages]);

  const handleCopyPin = (pin) => {
    const code = pin || activeJob?.pin || '4829';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedPin(true);
    showToast(`PIN ${code} copied to clipboard!`);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // Re-print existing document
  const handlePrintAgain = (doc) => {
    const freshPin = String(Math.floor(1000 + Math.random() * 9000));
    const newJob = {
      ...doc,
      id: `doc-${Date.now()}`,
      status: 'Printing',
      printedPages: 0,
      pin: freshPin,
      uploadedAt: 'Just now',
      isActive: true,
    };

    setDocuments((prev) => [
      newJob,
      ...prev.map((d) => ({ ...d, isActive: false })),
    ]);
    setActiveTab('dashboard');
    showToast(`Reprint queued for "${doc.name}"! Pickup PIN: ${freshPin}`);
  };

  // Cancel currently active job
  const handleCancelJob = () => {
    if (!activeJob) return;
    if (window.confirm(`Cancel active print job for "${activeJob.name}"?`)) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === activeJob.id
            ? { ...doc, status: 'Cancelled', isActive: false }
            : doc
        )
      );
      showToast(`Print job cancelled. Refund of Rs. ${activeJob.cost} processed.`);
    }
  };

  // Delete document / activity item using the cross 'X' button
  const handleDeleteDocument = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast('Item deleted successfully.');
  };

  // Add document to upload queue on Upload Screen (111:14114)
  const handleAddUpload = (newUpload) => {
    setPendingUploadDocs((prev) => [...prev, newUpload]);
    showToast(`Added "${newUpload.name}" to upload list`);
  };

  // Remove document from upload queue
  const handleRemoveUpload = (id) => {
    setPendingUploadDocs((prev) => prev.filter((d) => d.id !== id));
    showToast('File removed from upload queue');
  };

  // Update document pages on Upload Screen (111:14114) so user can specify exact pages to calculate
  const handleUpdateUploadPages = (id, newPages) => {
    const val = Math.max(1, parseInt(newPages, 10) || 1);
    setPendingUploadDocs((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, pages: val } : doc))
    );
  };

  // Proceed from Upload Screen (111:14114) to Payment Screen (118:16469)
  const handleSubmitToPayment = (chosenTime, options = {}) => {
    if (pendingUploadDocs.length === 0) {
      showToast('Please upload or drop at least one document first.');
      return;
    }
    const timeToUse = chosenTime || pendingUploadDocs[0]?.pickupTime;
    if (!timeToUse) {
      showToast('Please select your arrival time first.');
      return;
    }
    const targetDoc = {
      ...pendingUploadDocs[0],
      ...options,
      pickupTime: timeToUse,
    };
    setPendingCheckoutDoc(targetDoc);
    setActiveTab('payment');
    showToast(`Arrival time set to ${timeToUse}. Proceeding to payment.`);
  };

  // Finalize payment from Payment Screen (118:16469) and send to live print queue
  const handlePayAndSubmit = (checkoutDetails) => {
    const freshPin = String(Math.floor(1000 + Math.random() * 9000));
    const isDeskPayment =
      checkoutDetails.paymentStatus === 'Unpaid' ||
      checkoutDetails.paymentStatus === 'unpaid' ||
      checkoutDetails.paymentMethod?.toLowerCase().includes('desk') ||
      checkoutDetails.paymentMethod?.toLowerCase().includes('cash');

    const realPages = Math.max(1, Number(checkoutDetails.pages || 1));
    const realRate = checkoutDetails.colorMode === 'Color' ? 15 : 10;
    const realCopies = Math.max(1, Number(checkoutDetails.copies || 1));
    const realCost = checkoutDetails.cost != null ? checkoutDetails.cost : realPages * realCopies * realRate;
    const slotTime = checkoutDetails.pickupTime || '9:00 AM';

    // It should ONLY calculate the amount which needs to be paid:
    // If online payment (JazzCash / QR), amountDue is 0 (already paid).
    // If desk payment (Cash), amountDue is the remaining payable cost.
    const payableAmount = isDeskPayment ? realCost : 0;

    const newJob = {
      id: `doc-${Date.now()}`,
      name: checkoutDetails.name || 'Document.pdf',
      fileName: checkoutDetails.name || 'Document.pdf',
      pages: realPages,
      printedPages: 0,
      status: 'queued',
      colorMode: checkoutDetails.colorMode || 'B&W',
      tray: 'Tray 1',
      duplex: checkoutDetails.duplexMode || checkoutDetails.duplex || 'Single-sided',
      copies: realCopies,
      pin: freshPin,
      pickupTime: slotTime,
      slot: slotTime,
      uploadedAt: 'Today, Just now',
      cost: realCost,
      amountDue: payableAmount,
      paymentMethod: checkoutDetails.paymentMethod || (isDeskPayment ? 'Cash at Desk' : 'Paid Online'),
      paymentStatus: isDeskPayment ? 'unpaid' : 'paid',
      speed: 68,
      isActive: true,
    };

    setDocuments((prev) => [
      newJob,
      ...prev.map((d) => ({ ...d, isActive: false })),
    ]);

    // Clear staging uploads
    setPendingUploadDocs([]);
    setPendingCheckoutDoc(null);

    // DIRECTLY ENTER THE LIVE PRINT QUEUE (Figma Node 149:20727)
    setActiveTab('queue');
    if (isDeskPayment) {
      showToast(`Order placed in queue! Pay Rs. ${newJob.amountDue} at Desk A to unlock your print.`);
    } else {
      showToast(`Payment confirmed! Pickup PIN: ${freshPin}. You are now in the live queue.`);
    }
  };

  const activePercent = activeJob
    ? Math.min(100, Math.round((activeJob.printedPages / activeJob.pages) * 100))
    : 0;

  return (
    <div className="student-dashboard-root" data-node-id="174:805">
      {/* 1. Left Vertical Collapsible Sidebar / Mobile Bottom Dock */}
      <SidebarNav
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          if (tabId === 'payment' && pendingUploadDocs.length === 0 && !pendingCheckoutDoc) {
            showToast('Please upload a document and select arrival time first.');
            return;
          }
          setActiveTab(tabId);
        }}
        onNavigateHome={onNavigateHome}
        onLogout={onLogout}
      />

      {/* 2. Main Content Area */}
      <div className="dashboard-main-area">
        {/* Top Header with Scroll-Driven Shrinking Navbar */}
        <header className={`dashboard-top-header ${isScrolled ? 'scrolled' : ''}`}>
          <div className="dashboard-header-left">
            <h1 className="dashboard-view-title" data-node-id="206:964">
              {activeTab === 'upload'
                ? 'Upload your Document'
                : activeTab === 'payment'
                ? 'Payment & Confirmation'
                : activeTab === 'queue'
                ? 'Live Print Queue'
                : activeTab === 'forms'
                ? 'University Forms'
                : 'Dashboard'}
            </h1>
          </div>

          <div className="dashboard-header-right">
            {/* Notification Bell */}
            <div className="dashboard-notification-wrapper">
              <button
                type="button"
                onClick={() => {
                  setShowNotificationPanel(!showNotificationPanel);
                  if (unreadNotifications > 0) setUnreadNotifications(0);
                }}
                className="dashboard-header-icon-btn"
                aria-label="View notifications"
                title="Notifications"
              >
                <BellIcon size={20} color="#191c1e" />
                {unreadNotifications > 0 && <span className="notification-badge-dot" />}
              </button>

              {/* Notification Popover Panel */}
              <AnimatePresence>
                {showNotificationPanel && (
                  <motion.div
                    className="notifications-popover"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="notifications-popover-header">
                      <h4>Notifications</h4>
                      <button
                        type="button"
                        onClick={() => setShowNotificationPanel(false)}
                        className="notifications-close-btn"
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                    <ul className="notifications-list">
                      {activeJob ? (
                        <li className="notification-item unread">
                          <span className="notif-dot" />
                          <div>
                            <p className="notif-text">
                              Your pickup PIN for <strong>{activeJob.name}</strong> is{' '}
                              <strong>{activeJob.pin}</strong>.
                            </p>
                            <span className="notif-time">Live Status: {activeJob.status}</span>
                          </div>
                        </li>
                      ) : (
                        <li className="notification-item">
                          <span className="notif-dot read" />
                          <div>
                            <p className="notif-text">
                              Central Library printer station online. Ready for jobs.
                            </p>
                            <span className="notif-time">5 mins ago</span>
                          </div>
                        </li>
                      )}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Element (Node 206:969) */}
            <div className="dashboard-profile-section" data-node-id="206:969">
              <div className="dashboard-avatar-container" data-node-id="206:970">
                <div className="dashboard-avatar-fallback" style={{ display: 'flex' }}>
                  {userProfile.initials || 'FA'}
                </div>
              </div>
              <div className="dashboard-identity-text" data-node-id="206:971">
                <span className="dashboard-user-name" data-node-id="206:972">
                  {userProfile.name || 'Student'}
                </span>
                {(userProfile.title || userProfile.role) && (
                  <span className="dashboard-user-role" data-node-id="206:973">
                    {userProfile.title || userProfile.role}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="dashboard-body-container">
          {/* Operator Warning Banner: Appears only when API desk notice exists */}
          <AnimatePresence>
            {deskNotice && !isBannerDismissed && (
              <motion.div
                className="operator-warning-banner"
                role="status"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="warning-banner-icon-box">
                  <AlertTriangleIcon size={18} color="#ffffff" />
                </div>
                <p className="warning-banner-text">
                  <strong>⚠ Desk Notice:</strong> {deskNotice}
                </p>
                <button
                  type="button"
                  onClick={() => setIsBannerDismissed(true)}
                  className="warning-banner-dismiss-btn"
                  aria-label="Dismiss warning"
                >
                  <XIcon size={14} color="#92400e" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VIEW ROUTING BASED ON SELECTED TAB */}
          {activeTab === 'dashboard' ? (
            /* Screen 1: Dashboard Overview (Figma Node 174:805 + 2 parallel foldable boxes with delete X buttons) */
            <DashboardOverviewView
              documents={documents}
              activeJob={activeJob}
              activePercent={activePercent}
              onCopyPin={handleCopyPin}
              copiedPin={copiedPin}
              onOpenUpload={() => setActiveTab('upload')}
              onCancelJob={handleCancelJob}
              onOpenReceipt={() => setShowReceiptModal(true)}
              onPrintAgain={handlePrintAgain}
              onDeleteDocument={handleDeleteDocument}
              onNavigateForms={() => setActiveTab('forms')}
            />
          ) : activeTab === 'queue' ? (
            /* Screen 4: Live Print Queue View (Figma Node 149:20727) */
            <PrintQueueView
              userJob={activeJob}
              onUserJobUpdate={(updatedJob) => {
                setDocuments((prevDocs) => {
                  const exists = prevDocs.some((doc) => doc.id === updatedJob.id);
                  if (exists) {
                    return prevDocs.map((doc) =>
                      doc.id === updatedJob.id ? { ...doc, ...updatedJob } : doc
                    );
                  }
                  return [
                    {
                      id: updatedJob.id,
                      name: updatedJob.name || updatedJob.fileName || 'Thesis_Final_Draft.pdf',
                      pages: updatedJob.pages || 12,
                      printedPages: updatedJob.printedPages || 1,
                      status: updatedJob.status === 'printing' ? 'Printing' : updatedJob.status,
                      colorMode: updatedJob.colorMode || 'B&W',
                      duplex: updatedJob.duplex || 'Double-sided',
                      pin: updatedJob.pin || '4829',
                      isActive: true,
                      uploadedAt: 'Today, 9:45 AM',
                      ...updatedJob,
                    },
                    ...prevDocs,
                  ];
                });
              }}
              onJoinQueue={() => setActiveTab('upload')}
              onCancelJob={handleCancelJob}
            />
          ) : activeTab === 'upload' ? (
            /* Screen 2: Upload Document View (Figma Node 111:14114) */
            <DocumentUploadView
              uploadedList={pendingUploadDocs}
              onAddUpload={handleAddUpload}
              onRemoveUpload={handleRemoveUpload}
              onUpdatePages={handleUpdateUploadPages}
              queueCount={documents.filter((d) => d.isActive && d.status !== 'Cancelled' && d.status !== 'Collected').length}
              onSubmitToPayment={handleSubmitToPayment}
            />
          ) : activeTab === 'payment' ? (
            /* Screen 3: Payment Checkout View (Figma Node 118:16469 & 143:19251) */
            <PaymentCheckoutView
              pendingDocument={pendingCheckoutDoc || pendingUploadDocs[0]}
              queueCount={documents.filter((d) => d.isActive && d.status !== 'Cancelled' && d.status !== 'Collected').length}
              onPayAndSubmit={handlePayAndSubmit}
              onBackToUpload={() => setActiveTab('upload')}
            />
          ) : activeTab === 'forms' ? (
            /* Screen 5: University Forms View (Figma Node 255:1013) */
            <UniversityFormsView
              onSelectFormForPrint={(formDoc) => {
                setPendingCheckoutDoc(formDoc);
                setActiveTab('payment');
                showToast(`Form "${formDoc.name}" ready for printing checkout.`);
              }}
              onShowToast={showToast}
            />
          ) : null}
        </main>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="dashboard-floating-toast"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal (Displays Document Details + Active Pickup PIN) */}
      <AnimatePresence>
        {showReceiptModal && (
          <div className="dashboard-modal-backdrop" onClick={() => setShowReceiptModal(false)}>
            <motion.div
              className="receipt-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="receipt-modal-header">
                <h4>Print Transaction Receipt</h4>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="modal-close-btn"
                >
                  <XIcon size={16} />
                </button>
              </div>

              <div className="receipt-modal-body">
                <div className="receipt-line">
                  <span>Document:</span>
                  <strong>{activeJob?.name || 'Document.pdf'}</strong>
                </div>
                <div className="receipt-line">
                  <span>Pages:</span>
                  <span>{activeJob?.pages || 12} Pages ({activeJob?.colorMode || 'B&W'})</span>
                </div>
                <div className="receipt-line">
                  <span>Rate:</span>
                  <span>{activeJob?.colorMode === 'Color' ? 'Rs. 15.00 / page' : 'Rs. 10.00 / page'}</span>
                </div>
                <div className="receipt-line">
                  <span>Station:</span>
                  <span>Central Library - {activeJob?.tray || 'Tray 1'}</span>
                </div>
                <div className="receipt-divider" />
                <div className="receipt-line total">
                  <span>Total Amount:</span>
                  <strong>Rs. {activeJob?.cost || 10}.00</strong>
                </div>
                <div className="receipt-line pin">
                  <span>Pickup PIN:</span>
                  <div className="receipt-pin-cluster">
                    <span className="receipt-pin-code">{activeJob?.pin || '4829'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPin(activeJob?.pin)}
                      className="receipt-copy-pin-btn"
                      title="Copy PIN"
                    >
                      <CopyIcon size={14} color="#551ee7" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="receipt-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="receipt-close-action-btn"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
