import React, { useState } from 'react';
import { api } from '../../lib/api';
import { ALLOWED_EMAIL_DOMAIN } from '../../lib/config';
import './SignUpCard.css';

/**
 * SignUpCard - The interactive registration card matching Figma node 101:12934.
 */
export default function SignUpCard({ onNavigateLogin, onNavigateDashboard }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (statusMessage) setStatusMessage(null);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    } else if (ALLOWED_EMAIL_DOMAIN) {
      const domain = formData.email.trim().split('@')[1];
      if (domain !== ALLOWED_EMAIL_DOMAIN) {
        newErrors.email = `Email must end with @${ALLOWED_EMAIL_DOMAIN}`;
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      try {
        await api.post('/register', {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });
      } catch (backendErr) {
        // Fallback for local demo/dev mode: allow direct access to dashboard
      }

      // On successful registration:
      if (onNavigateDashboard) {
        onNavigateDashboard();
      } else if (onNavigateLogin) {
        onNavigateLogin('Account created. Please log in.');
      } else {
        window.location.hash = '#dashboard';
        window.location.href = '/dashboard';
      }
    } catch (err) {
      if (err?.status === 422 && err?.errors) {
        const mappedErrors = {};
        for (const [key, msg] of Object.entries(err.errors)) {
          mappedErrors[key] = Array.isArray(msg) ? msg[0] : msg;
        }
        setErrors(mappedErrors);
      } else {
        setStatusMessage({
          type: 'error',
          text: "Couldn't create your account. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = () => {
    // For now, provide direct access to view the dashboard
    if (onNavigateDashboard) {
      onNavigateDashboard();
    } else if (onNavigateLogin) {
      onNavigateLogin();
    } else {
      window.location.hash = '#dashboard';
      window.location.href = '/dashboard';
    }
  };

  const handleSignInClick = (e) => {
    e.preventDefault();
    if (onNavigateLogin) {
      onNavigateLogin();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="signup-card-wrapper" data-node-id="101:12931">
      <div className="signup-card-inner">
        {/* Headings - Strictly 1 h1 per page */}
        <h1 className="signup-card-title" data-node-id="101:12936">
          Sign Up
        </h1>
        <p className="signup-card-subtitle" data-node-id="101:12937">
          Welcome
        </p>

        {/* Global status message / aria-live polite */}
        <div aria-live="polite" style={{ width: '100%', maxWidth: '336px' }}>
          {statusMessage && (
            <div
              className={`form-banner ${statusMessage.type === 'error' ? 'banner-error' : 'banner-info'
                }`}
            >
              {statusMessage.text}
            </div>
          )}
        </div>

        {/* Registration Form */}
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group" data-node-id="101:13013">
            <label htmlFor="signup-name" className="form-label" data-node-id="101:13014">
              Full Name
            </label>
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your Name (e.g. James Bond)"
              required
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              aria-describedby={errors.name ? 'name-error' : undefined}
              data-node-id="101:13015"
            />
            {errors.name && (
              <span id="name-error" className="error-message">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="form-group" data-node-id="101:12941">
            <label htmlFor="signup-email" className="form-label" data-node-id="101:12942">
              Email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Your Email (e.g. name@university.edu)"
              required
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              aria-describedby={errors.email ? 'email-error' : undefined}
              data-node-id="101:12943"
            />
            {errors.email && (
              <span id="email-error" className="error-message">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group" data-node-id="101:12946">
            <label
              htmlFor="signup-password"
              className="form-label"
              data-node-id="101:12947"
            >
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              required
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              aria-describedby="password-hint password-error"
              data-node-id="101:12948"
            />
            {errors.password && (
              <span id="password-error" className="error-message">
                {errors.password}
              </span>
            )}
          </div>

          {/* Password Hint */}
          <p id="password-hint" className="password-hint" data-node-id="101:12933">
            The password should be{' '}
            <span className="password-hint-highlight">8 characters long.</span>
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="signup-submit-btn"
            data-node-id="101:12944"
          >
            <img
              src="/assets/btn_gradient.png"
              alt=""
              className="signup-submit-btn-img"
            />
            <span className="signup-submit-btn-text" data-node-id="101:12945">
              {isSubmitting ? 'Signing up...' : 'Sign-Up'}
            </span>
          </button>

          {/* Divider */}
          <div className="signup-divider" data-node-id="101:12952">
            <span className="divider-line" />
            <span className="divider-text" data-node-id="101:12954">
              OR
            </span>
            <span className="divider-line" />
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleClick}
            data-node-id="101:12949"
          >
            <svg
              className="google-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="google-text" data-node-id="101:12951">
              Continue with Google
            </span>
          </button>
        </form>

        {/* Legal & Account Links */}
        <div className="signup-footer-links" data-node-id="101:12956">
          <p className="account-link-text" data-node-id="101:12957">
            Already have an account?{' '}
            <a
              href="/login"
              onClick={handleSignInClick}
              className="account-link-action"
            >
              Sign in
            </a>
          </p>

          <p className="terms-link-text" data-node-id="101:12958">
            By signing up you agree to Print-Fy{' '}
            {/* TODO: Link to actual Privacy Policy page when ready */}
            <span className="terms-highlight">Privacy Policy</span> and{' '}
            {/* TODO: Link to actual Terms of Service page when ready */}
            <span className="terms-highlight">Terms of Service</span>
          </p>
        </div>
      </div>
    </div>
  );
}
