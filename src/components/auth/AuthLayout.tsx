import React from 'react';
import BarsBackground from '../backgrounds/BarsBackground';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  cardMaxWidth?: string;
  onNavigateHome?: () => void;
}

/**
 * Shared AuthLayout for Print-Fy authentication screens.
 * - Top-left brand logo.
 * - Reverse back arrow button to return to previous page.
 * - Centered card bounded by Figma frame dimensions.
 * - Viewport: min-h-dvh with padding-block clamp(2rem, 6vw, 5rem). Never 100vh.
 * - Layers back to front: base, glow, bars (spread across viewport), content.
 * - No horizontal scrolling at any width.
 */
export default function AuthLayout({
  children,
  cardMaxWidth = '559px',
  onNavigateHome,
}: AuthLayoutProps) {
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleBackClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="auth-layout-root">
      {/* Background layers: Base, Atmospheric Glow, and Dual Vertical Bars */}
      <BarsBackground variant="spread" />

      {/* Top Header with Brand Logo & Reverse Back Arrow Button */}
      <header className="auth-header">
        <a
          href="/"
          onClick={handleLogoClick}
          className="auth-logo-link brand-container"
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
          onClick={handleBackClick}
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

      {/* Main Centered Content */}
      <main className="auth-main-container">
        <div
          className="auth-card-shell"
          style={{ maxWidth: cardMaxWidth }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
