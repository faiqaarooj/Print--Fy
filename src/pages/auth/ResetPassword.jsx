import React, { useState, useEffect } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import { api } from '../../lib/api';
import './ResetPassword.css';

/**
 * Change / Reset Password Page Component
 * Route: /reset-password
 * Figma Frame Node: 402:26066
 */
export default function ResetPassword({
  onNavigateHome,
  onNavigateLogin,
  onNavigateForgotPassword,
  locationState,
}) {
  const resetToken = locationState?.reset_token || '';

  // Redirect to /forgot-password if no reset token in router state
  useEffect(() => {
    if (!resetToken) {
      if (onNavigateForgotPassword) {
        onNavigateForgotPassword();
      } else {
        window.location.href = '/forgot-password';
      }
    }
  }, [resetToken, onNavigateForgotPassword]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setConfirmError('');
    setGeneralError('');

    let hasError = false;

    if (!password) {
      setPasswordError('Please enter a new password.');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your new password.');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      // Never log password values
      await api.resetPassword({
        reset_token: resetToken,
        password,
        password_confirmation: confirmPassword,
      });

      // On success navigate to /login with the message "Password changed. Please log in."
      if (onNavigateLogin) {
        onNavigateLogin({ message: 'Password changed. Please log in.' });
      } else {
        window.location.href = '/login';
      }
    } catch (err) {
      setGeneralError(err?.message || "Couldn't change password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout cardMaxWidth="559px" onNavigateHome={onNavigateHome}>
      <div className="reset-card" data-node-id="402:26066">
        <div className="reset-content-wrapper">
          <h1 className="reset-title">Change Your Password</h1>

          {generalError && (
            <div className="reset-error-banner" role="alert" aria-live="assertive">
              {generalError}
            </div>
          )}

          <form className="reset-form" onSubmit={handleSubmit} noValidate>
            {/* New Password Field */}
            <div className="reset-field-group">
              <label htmlFor="reset-new-password" className="reset-label">
                New Password
              </label>
              <input
                id="reset-new-password"
                type="password"
                name="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="reset-input"
                placeholder="••••••••"
                aria-describedby={passwordError ? 'reset-pwd-error' : undefined}
                disabled={isSubmitting}
              />
              {passwordError && (
                <span id="reset-pwd-error" className="reset-field-error">
                  {passwordError}
                </span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="reset-field-group">
              <label htmlFor="reset-confirm-password" className="reset-label">
                Confirm Password
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                name="confirm_password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="reset-input"
                placeholder="••••••••"
                aria-describedby={confirmError ? 'reset-confirm-error' : undefined}
                disabled={isSubmitting}
              />
              {confirmError && (
                <span id="reset-confirm-error" className="reset-field-error">
                  {confirmError}
                </span>
              )}
            </div>

            {/* Helper Text matching Figma */}
            <p className="reset-hint-text">
              The password should be 8 characters long.
            </p>

            <button
              type="submit"
              className="reset-submit-btn"
              disabled={isSubmitting}
            >
              <img
                src="/assets/btn_gradient.png"
                alt=""
                className="login-btn-bg-img"
                aria-hidden="true"
              />
              <span className="login-btn-text">
                {isSubmitting ? 'Updating...' : 'Confirm'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
