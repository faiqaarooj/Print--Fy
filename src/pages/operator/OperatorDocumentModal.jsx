import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  XIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
} from '../../components/dashboard/DashboardIcons';

// MOCK:
// TODO: backend: operator-only endpoint returning a
// short-lived signed URL + mime type, logs who opened which file.
export async function getFileLink(jobId) {
  // The data has NO file URL. Returning nothing for now.
  // In production, this calls GET /api/operator/jobs/:id/file-link
  // returning { url: string, mimeType: string, expiresAt: string }
  // and logs operator file view in the audit trail.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 250);
  });
}

/**
 * Determine file type safely from filename or MIME type.
 * Security Directive: Never render files as HTML.
 */
function getFileTypeCategory(fileName, mimeType) {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'other';
  }
  const ext = (fileName || '').split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(ext)) {
    return 'image';
  }
  if (ext === 'pdf') {
    return 'pdf';
  }
  // All other types including HTML/TXT/DOCX are classified as 'other'
  return 'other';
}

export default function OperatorDocumentModal({
  isOpen,
  job,
  onClose,
  onShowToast,
}) {
  // Keep file link strictly in component state only:
  // never in the URL, storage, console or analytics.
  const [fileData, setFileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Request the link only when the modal opens
  const fetchLink = useCallback(async () => {
    if (!job?.id) return;
    setIsLoading(true);
    setIsExpired(false);

    try {
      const result = await getFileLink(job.id);
      if (result && result.url) {
        setFileData(result);
      } else {
        setFileData(null);
      }
    } catch {
      // If link expired or retrieval failed:
      setIsExpired(true);
      setFileData(null);
    } finally {
      setIsLoading(false);
    }
  }, [job?.id]);

  useEffect(() => {
    if (isOpen && job) {
      fetchLink();
    } else {
      // Clear link from state when modal closes
      setFileData(null);
      setIsLoading(false);
      setIsExpired(false);
    }
  }, [isOpen, job, fetchLink]);

  // Focus trap & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const fileName = job.fileName || 'Document';
  const fileType = getFileTypeCategory(fileName, fileData?.mimeType);

  const handleDownload = () => {
    if (fileData?.url) {
      const a = document.createElement('a');
      a.href = fileData.url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      if (onShowToast) {
        onShowToast(`Download unavailable in demo mode: ${fileName}`);
      }
    }
  };

  const handleOpenBrowser = () => {
    if (fileData?.url) {
      window.open(fileData.url, '_blank', 'noopener,noreferrer');
    } else {
      if (onShowToast) {
        onShowToast(`Open in Browser unavailable in demo mode: ${fileName}`);
      }
    }
  };

  return createPortal(
    <div
      className="dashboard-modal-backdrop operator-doc-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="operator-doc-modal-title"
    >
      <div
        className="cancel-confirmation-modal-card operator-modal-dialog-card operator-doc-modal-card"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        {/* Modal Header: file name at the top, student modal pattern */}
        <div className="operator-modal-header operator-doc-modal-header">
          <div className="operator-modal-header-copy">
            <div className="operator-modal-icon-bubble is-purple" aria-hidden="true">
              <FileTextIcon size={20} color="#551ee7" />
            </div>
            <div className="operator-doc-header-text-group">
              <h3 id="operator-doc-modal-title" className="operator-modal-heading" title={fileName}>
                {fileName}
              </h3>
              <p className="operator-modal-subheading">
                {job.pages ? `${job.pages} pages` : '1 page'}
                {job.colorMode ? ` · ${job.colorMode}` : ''}
                {job.studentLabel || job.name ? ` · ${job.studentLabel || job.name}` : ''}
              </p>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className="operator-modal-close-icon-btn"
            onClick={onClose}
            aria-label="Close document modal"
            title="Close"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Modal Body: Loading state, Expired state, Demo state, Image preview, PDF preview, or Other types */}
        <div className="operator-modal-body operator-doc-modal-body">
          {isLoading ? (
            <div className="operator-preview-state-container operator-preview-loading" role="status">
              <div className="operator-preview-spinner" aria-hidden="true" />
              <p className="operator-preview-loading-text">Requesting secure preview link...</p>
            </div>
          ) : isExpired ? (
            <div className="operator-preview-state-container operator-preview-expired-box" role="alert">
              <AlertTriangleIcon size={36} color="#dc2626" />
              <p className="operator-preview-expired-title">Link expired. Try again</p>
              <p className="operator-preview-expired-desc">
                The short-lived signed link has timed out for security.
              </p>
              <button
                type="button"
                className="operator-doc-retry-btn"
                onClick={fetchLink}
              >
                <RefreshCwIcon size={14} />
                <span>Retry</span>
              </button>
            </div>
          ) : !fileData?.url ? (
            /* Demo mode state when getFileLink returns nothing */
            <div className="operator-preview-state-container operator-preview-demo-box">
              <div className="operator-preview-file-icon-wrap" aria-hidden="true">
                <FileTextIcon size={44} color="#6e44ff" />
              </div>
              <span className="operator-preview-demo-badge">Demo Mode</span>
              <h4 className="operator-preview-demo-filename">{fileName}</h4>
              <p className="operator-preview-demo-title">Preview unavailable in demo mode</p>
              <p className="operator-preview-demo-desc">
                Document data contains no file URL. In production, this requests a short-lived signed URL from the operator-only endpoint.
              </p>
            </div>
          ) : fileType === 'image' ? (
            /* Scaled Images */
            <div className="operator-preview-media-container operator-preview-image-wrap">
              <img
                src={fileData.url}
                alt={fileName}
                className="operator-preview-scaled-image"
              />
            </div>
          ) : fileType === 'pdf' ? (
            /* Embedded PDF */
            <div className="operator-preview-media-container operator-preview-pdf-wrap">
              <iframe
                src={fileData.url}
                title={fileName}
                className="operator-preview-pdf-frame"
              />
            </div>
          ) : (
            /* Other types: plain text message, never render as HTML */
            <div className="operator-preview-state-container operator-preview-unsupported-box">
              <FileTextIcon size={40} color="#79747e" />
              <p className="operator-preview-unsupported-title">
                Preview not available for this file type. Use Download.
              </p>
              <p className="operator-preview-unsupported-file">{fileName}</p>
            </div>
          )}
        </div>

        {/* Modal Footer: Download, Open in Browser, Close */}
        <div className="operator-modal-footer operator-doc-modal-footer">
          <div className="operator-doc-modal-footer-actions">
            {/* Download button */}
            <button
              type="button"
              className="operator-doc-footer-btn is-download"
              onClick={handleDownload}
            >
              <DownloadIcon size={16} />
              <span>Download</span>
            </button>

            {/* Open in Browser uses a new tab with rel='noopener noreferrer' */}
            {fileData?.url ? (
              <a
                href={fileData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="operator-doc-footer-btn is-open-browser"
              >
                <ExternalLinkIcon size={16} />
                <span>Open in Browser</span>
              </a>
            ) : (
              <button
                type="button"
                className="operator-doc-footer-btn is-open-browser"
                onClick={handleOpenBrowser}
              >
                <ExternalLinkIcon size={16} />
                <span>Open in Browser</span>
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            className="operator-modal-cancel-btn operator-doc-close-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
