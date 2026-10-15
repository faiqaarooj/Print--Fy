import React from 'react';
import './CtaBannerSection.css';

export default function CtaBannerSection({ onUpload }) {
  const handleUploadClick = () => {
    // If an upload demo or workflow section exists on the page, scroll to it or trigger upload action
    const uploadInput = document.getElementById('demo-file-input');
    const demoSection = document.getElementById('live-queue-demo') || document.getElementById('workflow');

    if (onUpload) {
      onUpload();
    } else if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
      if (uploadInput) {
        setTimeout(() => uploadInput.click(), 400);
      }
    }
  };

  return (
    <section className="cta-banner-section" aria-label="Call to action banner">
      <div className="cta-banner-container">
        {/* Left: Heading and Supporting Description */}
        <div className="cta-banner-content">
          <h2 className="cta-banner-heading">
            YOUR NEXT PRINT RUN STARTS <br className="cta-heading-break" />HERE.
          </h2>
          <p className="cta-banner-subtext">
            Upload before you leave class. We&apos;ll tell you exactly when to collect.
          </p>
        </div>

        {/* Right: Upload a document button */}
        <div className="cta-banner-action">
          <button
            type="button"
            className="cta-upload-btn"
            onClick={handleUploadClick}
            aria-label="Upload a document and start print run"
          >
            <span>Sign Up Now </span>
            <svg
              className="cta-btn-arrow"
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
