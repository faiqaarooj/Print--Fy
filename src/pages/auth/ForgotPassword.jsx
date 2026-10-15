import React, { useState } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import { api } from '../../lib/api';
import './ForgotPassword.css';

/**
 * Forgot Password Page Component
 * Route: /forgot-password
 * Figma Frame Node: 402:26945
 */
export default function ForgotPassword({
  onNavigateHome,
  onNavigateVerifyOtp,
  onNavigateLogin,
}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setNoticeMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.forgotPassword({ email: email.trim() });
    } catch {
      // Regardless of failure/success, proceed with the exact same neutral response
      // to avoid account enumeration
    } finally {
      setIsSubmitting(false);
      // Neutral message specification
      setNoticeMessage("If an account exists for that email, we've sent a code.");

      // Navigate to /verify-otp with router state { email }, never in URL
      setTimeout(() => {
        if (onNavigateVerifyOtp) {
          onNavigateVerifyOtp({ email: email.trim() });
        } else {
          window.location.href = '/verify-otp';
        }
      }, 1200);
    }
  };

  return (
    <AuthLayout cardMaxWidth="559px" onNavigateHome={onNavigateHome}>
      <div className="forgot-card" data-node-id="402:26945">
        <div className="forgot-content-wrapper">
          <h1 className="forgot-title">Forgot Password</h1>

          {/* Neutral confirmation notice */}
          {noticeMessage && (
            <div
              className="forgot-neutral-notice"
              role="status"
              aria-live="polite"
            >
              {noticeMessage}
            </div>
          )}

          {/* Validation Error Banner */}
          {errorMessage && (
            <div
              className="forgot-error-banner"
              role="alert"
              aria-live="assertive"
            >
              {errorMessage}
            </div>
          )}

          <form className="forgot-form" onSubmit={handleSubmit} noValidate>
            <div className="forgot-field-group">
              <label htmlFor="forgot-email" className="forgot-label">
                Enter Your Email
              </label>
              <input
                id="forgot-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="forgot-input"
                placeholder="name@example.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="forgot-resend-row">
              <span className="forgot-resend-text">
                Haven’t receive code ?{' '}
                <button
                  type="submit"
                  className="auth-pink-link"
                  disabled={isSubmitting}
                >
                  Click here to resend
                </button>
              </span>
            </div>

            <button
              type="submit"
              className="forgot-submit-btn"
              disabled={isSubmitting}
            >
              <img
                src="/assets/btn_gradient.png"
                alt=""
                className="login-btn-bg-img"
                aria-hidden="true"
              />
              <span className="login-btn-text">
                {isSubmitting ? 'Sending...' : 'Next'}
              </span>
            </button>

            <div className="forgot-back-row">
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateLogin) onNavigateLogin();
                  else window.location.href = '/login';
                }}
                className="forgot-back-link"
              >
                ← Back to Log In
              </a>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
