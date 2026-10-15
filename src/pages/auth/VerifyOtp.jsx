import React, { useState, useRef, useEffect } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import { api } from '../../lib/api';
import './VerifyOtp.css';

/**
 * Verification OTP Page Component
 * Route: /verify-otp
 * Figma Frame Node: 402:26728
 */
export default function VerifyOtp({
  onNavigateHome,
  onNavigateResetPassword,
  onNavigateForgotPassword,
  locationState,
}) {
  const email = locationState?.email || '';

  // Redirect to /forgot-password if no email in router state
  useEffect(() => {
    if (!email) {
      if (onNavigateForgotPassword) {
        onNavigateForgotPassword();
      } else {
        window.location.href = '/forgot-password';
      }
    }
  }, [email, onNavigateForgotPassword]);

  const [digits, setDigits] = useState(['', '', '', '', '']);
  const inputRefs = useRef([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Resend countdown state (30 seconds)
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const char = cleaned.slice(-1);

    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    // Auto-advance
    if (char && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back and clear previous
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        setDigits(nextDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const nextDigits = [...digits];
        nextDigits[index] = '';
        setDigits(nextDigits);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    if (!pasted) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 5; i++) {
      nextDigits[i] = pasted[i] || '';
    }
    setDigits(nextDigits);

    // Focus last filled box
    const targetIdx = Math.min(pasted.length, 4);
    inputRefs.current[targetIdx]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const fullCode = digits.join('');
    if (fullCode.length < 5) {
      setErrorMessage('Please enter all 5 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.verifyOtp({ email, code: fullCode });
      const resetToken = res?.reset_token || res?.data?.reset_token || 'temp_session_token';

      // Keep token in React memory / router state ONLY. Never in URL or localStorage.
      if (onNavigateResetPassword) {
        onNavigateResetPassword({ reset_token: resetToken, email });
      } else {
        window.location.href = '/reset-password';
      }
    } catch (err) {
      const msg = err?.message || 'Invalid or expired code. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage('');
    setInfoMessage('');

    try {
      await api.forgotPassword({ email });
      setInfoMessage('A new verification code has been dispatched.');
      setResendCooldown(30);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to resend code. Please try again later.');
    }
  };

  return (
    <AuthLayout cardMaxWidth="559px" onNavigateHome={onNavigateHome}>
      <div className="otp-card" data-node-id="402:26728">
        <div className="otp-content-wrapper">
          <h1 className="otp-title">Verification OTP</h1>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="otp-error-banner" role="alert" aria-live="assertive">
              {errorMessage}
            </div>
          )}
          {infoMessage && (
            <div className="otp-info-banner" role="status" aria-live="polite">
              {infoMessage}
            </div>
          )}

          <form className="otp-form" onSubmit={handleSubmit}>
            <fieldset
              className="otp-group-container"
              role="group"
              aria-labelledby="otp-group-label"
            >
              <legend id="otp-group-label" className="otp-label">
                Enter 5 Digits Number
              </legend>

              <div className="otp-boxes-row" onPaste={handlePaste}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    aria-label={`Digit ${idx + 1} of 5`}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="otp-digit-input"
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </fieldset>

            <div className="otp-resend-row">
              <span className="otp-resend-text">
                Haven’t receive code ?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  className="auth-pink-link"
                  disabled={resendCooldown > 0 || isSubmitting}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Click here to resend'}
                </button>
              </span>
            </div>

            <button
              type="submit"
              className="otp-submit-btn"
              disabled={isSubmitting || digits.join('').length < 5}
            >
              <img
                src="/assets/btn_gradient.png"
                alt=""
                className="login-btn-bg-img"
                aria-hidden="true"
              />
              <span className="login-btn-text">
                {isSubmitting ? 'Verifying...' : 'Next'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
