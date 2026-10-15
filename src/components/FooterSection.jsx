import React, { useState } from 'react';
import './FooterSection.css';

export default function FooterSection({ onNavigateSection, onNavigateContact }) {
  const [activeModal, setActiveModal] = useState(null); // 'status' | 'privacy' | null

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    if (targetId === 'contact' && onNavigateContact) {
      onNavigateContact();
      return;
    }
    if (onNavigateSection) {
      onNavigateSection(targetId);
      return;
    }
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = `#${targetId}`;
    }
  };

  return (
    <footer className="figma-footer" aria-label="Print-fy official footer">
      <div className="figma-footer-container">
        {/* Top Section: Brand + Navigation Columns */}
        <div className="figma-footer-main">
          {/* Brand Info Column */}
          <div className="footer-brand-column">
            <div className="footer-logo-wrapper">
              <img
                src="/logo/printfy-logo.svg"
                alt="PIF Printfy Logo"
                className="footer-logo-image"
              />
            </div>
            <p className="footer-tagline">
              Campus printing, without the queue. Upload anywhere.
              <br />
              Collect when it's ready.
            </p>

            {/* Direct PIF Contact Details */}
            <div className="footer-pif-contacts">
              <a href="mailto:Prinfy@gmail.com" className="footer-pif-link">
                <svg className="pif-contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>Prinfy@gmail.com</span>
              </a>
              <a href="tel:0339990001" className="footer-pif-link">
                <svg className="pif-contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Contact us at 0339990001</span>
              </a>
            </div>
          </div>

          {/* Nav Links Columns */}
          <div className="footer-nav-groups">
            {/* Explore Column */}
            <div className="footer-nav-col">
              <span className="footer-col-header">EXPLORE</span>
              <ul className="footer-link-list">
                <li>
                  <a
                    href="#about"
                    onClick={(e) => handleLinkClick(e, 'about')}
                    className="footer-link-item"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    onClick={(e) => handleLinkClick(e, 'features')}
                    className="footer-link-item"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    onClick={(e) => {
                      e.preventDefault();
                      const faqEl = document.getElementById('faq') || document.getElementById('pricing-faq');
                      if (faqEl) {
                        faqEl.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        handleLinkClick(e, 'faq');
                      }
                    }}
                    className="footer-link-item"
                  >
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="footer-nav-col">
              <span className="footer-col-header">SUPPORT</span>
              <ul className="footer-link-list">
                <li>
                  <a
                    href="#contact"
                    onClick={(e) => handleLinkClick(e, 'contact')}
                    className="footer-link-item"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('status')}
                    className="footer-link-button"
                  >
                    System status
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="footer-link-button"
                  >
                    Privacy
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="figma-footer-bottom">
          <div className="footer-copyright-text">
            © 2026 Print-Fy Campus Print by Faiqa Arooj
          </div>
        </div>
      </div>

      {/* 
      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="footer-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="footer-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="privacy-modal-title"
          >
            <div className="modal-header-row">
              <h3 id="privacy-modal-title" className="modal-heading">
                Campus Student Privacy Policy
              </h3>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setActiveModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="privacy-body-text">
              <p>
                <strong>Zero Document Retention:</strong> Your uploaded files are encrypted with AES-256 and stored only in temporary memory until physically collected at the campus kiosk.
              </p>
              <p>
                <strong>Instant Auto-Purge:</strong> The moment your print run finishes or expires after 4 hours, files are permanently erased from the network.
              </p>
              <p>
                <strong>No Data Selling or Advertising:</strong> Print-fy is built exclusively for university ecosystems. We never share student coursework, research, or identity with third parties.
              </p>
            </div>

            <div className="modal-footer-action">
              <button
                type="button"
                className="modal-primary-btn"
                onClick={() => setActiveModal(null)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
