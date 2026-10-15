import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadIcon,
  CopyIcon,
  PrinterIcon,
  ClockIcon,
  ReceiptIcon,
  CancelIcon,
  CheckCircleIcon,
  FileTextIcon,
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowUpRightIcon,
} from '../DashboardIcons';

export default function DashboardOverviewView({
  documents = [],
  activeJob,
  activePercent = 0,
  onCopyPin,
  copiedPin,
  onOpenUpload,
  onCancelJob,
  onOpenReceipt,
  onPrintAgain,
  onDeleteDocument,
  onNavigateForms,
}) {
  // Fold/Unfold state for the 2 parallel boxes
  const [isRecentFolded, setIsRecentFolded] = useState(false);
  const [isSavedFolded, setIsSavedFolded] = useState(false);

  // Derived metrics
  const completedDocs = documents.filter(
    (d) => d.status === 'Collected' || d.status === 'Ready for Pickup'
  );
  const totalSpent = documents.reduce(
    (sum, d) => sum + (d.status !== 'Cancelled' ? Number(d.cost || 0) : 0),
    0
  );
  // Requirement 7: "Collected on First Notification" shows "-" when the student has no jobs
  const successRateText = documents.length === 0 ? '-' : `${completedDocs.length > 0 ? 96 : 0}%`;

  // Separate recent activity and saved documents
  const recentActivities = documents.filter((d) => d.id !== activeJob?.id);
  const savedDocuments = documents.filter(
    (d) => d.status === 'Saved' || d.status === 'Collected'
  );

  return (
    <div className="dashboard-overview-view" data-node-id="174:805">
      {/* Student Overview Header (Node 174:805) - Duplicate upload button removed */}
      <div className="student-overview-header">
        <div className="greeting-wrapper">
          <h2 className="greeting-headline">Welcome back, {activeJob?.userName || 'Faiqa'}</h2>
          <p className="greeting-subtext">Here’s what’s happening with your prints today.</p>
        </div>
      </div>

      {/* Quick Stats Grid (Node 174:805) */}
      <div className="quick-stats-grid">
        <div className="stat-metric-card">
          <span className="stat-card-label">Documents Printed</span>
          <span className="stat-card-value">
            {completedDocs.length + (activeJob?.printedPages > 0 ? 1 : 0)}
          </span>
          <span className="stat-card-tag">This Semester</span>
        </div>

        <div className="stat-metric-card">
          <span className="stat-card-label">Collected on First Notification</span>
          <span className="stat-card-value">{successRateText}</span>
          <span className="stat-card-tag">Success Rate</span>
        </div>

        <div className="stat-metric-card">
          <span className="stat-card-label">Total Spent</span>
          <span className="stat-card-value">Rs. {totalSpent}</span>
          <span className="stat-card-tag">This Semester</span>
        </div>
      </div>

      {/* Active Print Job Section */}
      <section className="active-print-section">
        <div className="section-title-row">
          <h3 className="section-title-text">Active Print Job</h3>
          {activeJob && (
            <div
              className={`status-pill ${
                activeJob.status === 'Ready for Pickup' ? 'active-ready' : 'pending-desk'
              }`}
            >
              <span>{activeJob.status}</span>
            </div>
          )}
        </div>

        {activeJob ? (
          <div className="active-job-card-root">
            {/* Card Header */}
            <div className="job-card-top-row">
              <div className="job-turn-info">
                <div
                  className={`active-pulsing-dot ${
                    activeJob.status === 'Ready for Pickup' ? 'dot-ready' : ''
                  }`}
                />
                <div className="job-turn-text">
                  <div className="turn-headline-group">
                    <h4 className="turn-headline">
                      {activeJob.status === 'Ready for Pickup'
                        ? 'Ready at Kiosk'
                        : 'Your Turn is Active'}
                    </h4>
                    <span className="status-pill active-up">
                      {activeJob.status === 'Ready for Pickup' ? 'Complete' : "You're up"}
                    </span>
                  </div>
                  <p className="turn-description">
                    {activeJob.status === 'Ready for Pickup'
                      ? 'Collect your paper at the Central Library dispenser'
                      : 'Your document is currently being printed in real time'}
                  </p>
                </div>
              </div>

              <div className="job-pickup-cluster">
                {/* Pickup PIN Box (Retained & Elevated) */}
                <div
                  className="pickup-pin-container"
                  onClick={() => onCopyPin(activeJob.pin)}
                  title="Click to copy Pickup PIN"
                  role="button"
                  tabIndex={0}
                >
                  <div className="pin-text-block">
                    <span className="pin-label">Pickup PIN</span>
                    <span className="pin-code">{activeJob.pin}</span>
                  </div>
                  <button
                    type="button"
                    className="pin-copy-btn"
                    aria-label="Copy PIN code"
                  >
                    <CopyIcon size={14} color="#551ee7" />
                  </button>
                  {copiedPin && <span className="pin-copied-badge">Copied!</span>}
                </div>

                <div className="desk-paused-badge">
                  <PrinterIcon size={12} color="#551ee7" />
                  <span>{activeJob.tray || 'Tray 1'}</span>
                </div>
              </div>
            </div>

            {/* Progress & Document Details */}
            <div className="job-card-progress-row">
              <div className="job-document-meta">
                <h5 className="job-file-name">{activeJob.name}</h5>
                <p className="job-specs-summary">
                  {activeJob.pages} Pages • {activeJob.colorMode} • {activeJob.duplex} •{' '}
                  <span className="tray-badge">{activeJob.tray}</span>
                </p>
              </div>

              <div className="job-live-progress-block">
                <div className="progress-summary-row">
                  <div className="printed-pages-indicator">
                    <span
                      className={`progress-green-dot ${
                        activeJob.status === 'Ready for Pickup' ? 'done' : ''
                      }`}
                    />
                    <span className="progress-pages-text">
                      Page {activeJob.printedPages} of {activeJob.pages} printed
                    </span>
                  </div>
                  <span className="progress-percent-text">{activePercent}% Complete</span>
                </div>

                <div className="progress-track-bar">
                  <motion.div
                    className="progress-fill-portion"
                    animate={{ width: `${activePercent}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>

                <div className="progress-meta-footer">
                  <span className="spooling-speed">
                    Spooling speed: {activeJob.speed || 68} ppm
                  </span>
                  <div className="resume-time-notice">
                    <ClockIcon size={13} color="#551ee7" />
                    <span>
                      {activeJob.status === 'Ready for Pickup'
                        ? 'Ready for Pickup'
                        : 'Printing now...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="job-card-actions-row">
              <button
                type="button"
                onClick={onOpenReceipt}
                className="job-receipt-btn"
              >
                <ReceiptIcon size={14} color="#191c1e" />
                <span>View Receipt & PIN</span>
              </button>

              <button
                type="button"
                onClick={onCancelJob}
                className="job-cancel-btn"
              >
                <CancelIcon size={14} color="#ba1a1a" />
                <span>Cancel Job</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty Active Print Job Card (Node 174:805) */
          <div className="empty-active-print-card" data-node-id="174:812">
            <div className="empty-active-text-block">
              <h4 className="empty-active-headline">No active print jobs.</h4>
              <p className="empty-active-subtext">Upload something to get started.</p>
            </div>
            <button
              type="button"
              onClick={onOpenUpload}
              className="empty-upload-action-btn"
            >
              <span>Upload New Document</span>
              <ArrowUpRightIcon size={15} color="#ffffff" />
            </button>
          </div>
        )}
      </section>

      {/* TWO PARALLEL BOXES: Left: Recent Activity | Right: Saved Documents */}
      <section className="two-parallel-boxes-grid">
        {/* Box 1: Recent Activity (Foldable & Deletable) */}
        <div className="parallel-box-card">
          <div className="parallel-box-header">
            <div className="parallel-box-title-group">
              <h3 className="parallel-box-title">Recent Activity</h3>
              <span className="parallel-box-count">
                {recentActivities.length} {recentActivities.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsRecentFolded(!isRecentFolded)}
              className="fold-toggle-btn"
              title={isRecentFolded ? 'Unfold section' : 'Fold section'}
            >
              <span>{isRecentFolded ? 'Unfold' : 'Fold'}</span>
              {isRecentFolded ? (
                <ChevronDownIcon size={16} />
              ) : (
                <ChevronUpIcon size={16} />
              )}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {!isRecentFolded && (
              <motion.div
                className="parallel-box-body"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                {recentActivities.length > 0 ? (
                  <div className="parallel-items-stack">
                    {recentActivities.map((item) => (
                      <div key={item.id} className="parallel-item-row">
                        <div className="parallel-item-icon">
                          <FileTextIcon size={20} color="#551ee7" />
                        </div>
                        <div className="parallel-item-details">
                          <div className="parallel-item-title-row">
                            <h5 className="parallel-item-name" title={item.name}>
                              {item.name}
                            </h5>
                            <span
                              className={`activity-status-badge ${
                                item.status === 'Collected'
                                  ? 'collected'
                                  : item.status === 'Cancelled'
                                  ? 'deleted'
                                  : 'saved'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="parallel-item-meta">
                            {item.colorMode} · {item.pages} p · PIN: {item.pin}
                          </p>
                          <span className="parallel-item-time">{item.uploadedAt}</span>
                        </div>

                        {/* Actions: Print Again + Cross Delete Button */}
                        <div className="parallel-item-actions">
                          {item.status !== 'Collected' && (
                            <button
                              type="button"
                              onClick={() => onPrintAgain(item)}
                              className="parallel-reprint-btn"
                              title="Print Again"
                            >
                              Print
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteDocument(item.id)}
                            className="delete-item-cross-btn"
                            title="Delete this activity"
                            aria-label={`Delete ${item.name}`}
                          >
                            <XIcon size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Empty State for Recent Activity (Node 174:805) */
                  <div className="parallel-empty-placeholder">
                    <h5>You haven’t printed anything yet.</h5>
                    <p>Your activity will show up here.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Box 2: Saved Documents (Foldable & Deletable) */}
        <div className="parallel-box-card">
          <div className="parallel-box-header">
            <div className="parallel-box-title-group">
              <h3 className="parallel-box-title">Saved Documents</h3>
              <span className="parallel-box-count">
                {savedDocuments.length} {savedDocuments.length === 1 ? 'doc' : 'docs'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsSavedFolded(!isSavedFolded)}
              className="fold-toggle-btn"
              title={isSavedFolded ? 'Unfold section' : 'Fold section'}
            >
              <span>{isSavedFolded ? 'Unfold' : 'Fold'}</span>
              {isSavedFolded ? (
                <ChevronDownIcon size={16} />
              ) : (
                <ChevronUpIcon size={16} />
              )}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {!isSavedFolded && (
              <motion.div
                className="parallel-box-body"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                {savedDocuments.length > 0 ? (
                  <div className="parallel-items-stack">
                    {savedDocuments.map((doc) => (
                      <div key={`saved-${doc.id}`} className="parallel-item-row">
                        <div className="parallel-item-icon">
                          <FileTextIcon size={20} color="#551ee7" />
                        </div>
                        <div className="parallel-item-details">
                          <h5 className="parallel-item-name" title={doc.name}>
                            {doc.name}
                          </h5>
                          <p className="parallel-item-meta">
                            {doc.pages} pages · {doc.colorMode} · PIN: {doc.pin}
                          </p>
                        </div>
                        <div className="parallel-item-actions">
                          <button
                            type="button"
                            onClick={() => onPrintAgain(doc)}
                            className="parallel-reprint-btn"
                            title="Print Again"
                          >
                            Print Again →
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteDocument(doc.id)}
                            className="delete-item-cross-btn"
                            title="Delete saved document"
                            aria-label={`Delete ${doc.name}`}
                          >
                            <XIcon size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Empty State for Saved Documents (Node 174:805) */
                  <div className="parallel-empty-placeholder">
                    <h5>Nothing saved yet.</h5>
                    <p>
                      Choose "Keep it saved for next time" when uploading to reprint
                      instantly later.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* University Forms Banner (Node 174:805) */}
      <section className="university-forms-banner-card" data-node-id="174:820">
        <div className="forms-banner-text-block">
          <h3 className="forms-banner-title">University Forms</h3>
          <p className="forms-banner-subtext">
            Get the Forms printed online without going to the desk.
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateForms}
          className="forms-download-cta-btn"
          aria-label="Download and print university forms"
        >
          <span>Download and print them now</span>
          <ArrowUpRightIcon size={16} color="#ffffff" />
        </button>
      </section>
    </div>
  );
}
