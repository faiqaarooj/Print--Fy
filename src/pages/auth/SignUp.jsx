import React from 'react';
import BarsBackground from '../../components/backgrounds/BarsBackground';
import LeftPreviewPanel from '../../components/signup/LeftPreviewPanel';
import SignUpCard from '../../components/signup/SignUpCard';
import './SignUp.css';

/**
 * SignUp Page Component
 * Route: /signup
 */
export default function SignUp({ onNavigateHome, onNavigateLogin, onNavigateDashboard }) {
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="signup-page-root" data-node-id="101:12757">
      {/* Background Layers (Layer 1 Base, Layer 2 Glow, Layer 3 Bars) */}
      <BarsBackground />

      {/* Header with Top-Left Brand Logo & Back Button */}
      <header className="signup-header">
        <a
          href="/"
          onClick={handleLogoClick}
          className="brand-container signup-logo-link"
          aria-label="Print-Fy Homepage"
        >
          <img
            src="/logo/printfy-logo.svg"
            alt="Print-Fy"
            className="brand-logo-img"
          />
          <span className="brand-title">Print-Fy</span>
        </a>

        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else if (onNavigateHome) {
              onNavigateHome();
            } else {
              window.location.href = '/';
            }
          }}
          className="auth-back-btn"
          aria-label="Go back to previous page"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back</span>
        </button>
      </header>

      {/* Main Content (Layer 4) */}
      <main className="signup-main-container">
        {/* Left Preview Component (Desktop only >= 1024px) */}
        <div className="signup-col-left" data-node-id="101:13017">
          <LeftPreviewPanel />
        </div>

        {/* Right Sign Up Card */}
        <div className="signup-col-right" data-node-id="101:12934">
          <SignUpCard
            onNavigateLogin={onNavigateLogin}
            onNavigateDashboard={onNavigateDashboard}
          />
        </div>
      </main>
    </div>
  );
}
