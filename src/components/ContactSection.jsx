import React, { useState, useRef } from 'react';
import './ContactSection.css';

export default function ContactSection({ standalone = false, onBackToHome }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    printerLocation: '',
    message: '',
  });
  const [attachedFile, setAttachedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleFileRemove = (e) => {
    e.stopPropagation();
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in your name, campus email, and message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Simulate sending ticket
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        topic: '',
        printerLocation: '',
        message: '',
      });
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 6000);
    }, 1200);
  };

  return (
    <section id="contact" className={`contact-section-wrap ${standalone ? 'is-standalone-page' : ''}`}>
      <div className="contact-stars-overlay" aria-hidden="true" />

      <div className="contact-container">
        {standalone && (
          <div className="contact-standalone-topbar">
            <button
              type="button"
              className="contact-back-btn"
              onClick={onBackToHome}
            >
              ← Back to Overview
            </button>
            <span className="contact-badge-pill">Campus Support Center</span>
          </div>
        )}

        <div className="contact-card">
          <header className="contact-header">
            <h2 className="contact-title">Contact Us</h2>
            <p className="contact-subtitle">
              Reach the Print-Fy campus team or submit a customer support request.
            </p>
          </header>

          {submitSuccess && (
            <div className="contact-success-banner" role="alert">
              <span className="success-icon">✓</span>
              <div>
                <strong>Message received! Support Ticket #PF-9412 created.</strong>
                <p>Our campus printing response team will reply to your campus email shortly.</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="contact-error-banner" role="alert">
              <span>⚠️</span> {errorMessage}
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            {/* Row 1: Name & Campus email */}
            <div className="form-row-two-col">
              <div className="form-field-group">
                <label htmlFor="contact-name" className="field-label">
                  Your name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Amara Kim"
                  className="contact-input"
                  required
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="contact-email" className="field-label">
                  Campus email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@university.edu"
                  className="contact-input"
                  required
                />
              </div>
            </div>

            {/* Row 2: Topic & Printer or location */}
            <div className="form-row-two-col">
              <div className="form-field-group">
                <label htmlFor="contact-topic" className="field-label">
                  Topic
                </label>
                <div className="select-wrapper">
                  <select
                    id="contact-topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    className="contact-input contact-select"
                  >
                    <option value="" disabled>Select a reason or topic</option>
                    <option value="customer-support">Customer Support & Student Helpdesk</option>
                    <option value="hardware-jam">Printer hardware or paper jam</option>
                    <option value="refund-balance">Refund or balance deduction</option>
                    <option value="campus-deployment">University campus deployment & quote</option>
                    <option value="sso-login">Account login & university SSO</option>
                    <option value="location-access">Campus kiosk location inquiry</option>
                    <option value="other">General inquiry / feedback</option>
                  </select>
                  <span className="select-chevron" aria-hidden="true">▾</span>
                </div>
              </div>

              <div className="form-field-group">
                <label htmlFor="contact-location" className="field-label">
                  Printer or location
                </label>
                <input
                  id="contact-location"
                  type="text"
                  name="printerLocation"
                  value={formData.printerLocation}
                  onChange={handleInputChange}
                  placeholder="e.g. Library North · P-04"
                  className="contact-input"
                />
              </div>
            </div>

            {/* Row 3: What happened? */}
            <div className="form-field-group full-width">
              <label htmlFor="contact-message" className="field-label">
                What happened?
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us what you expected, what you saw, and whether the job is still in your queue."
                className="contact-input contact-textarea"
                required
              />
            </div>

            {/* Row 4: Attachment Box */}
            <div
              className={`file-upload-box ${attachedFile ? 'has-file' : ''}`}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current && fileInputRef.current.click();
                }
              }}
              aria-label="Upload screenshot or receipt attachment"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden-file-input"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileChange}
              />

              <div className="upload-left-content">
                <svg
                  className="paperclip-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
                {attachedFile ? (
                  <span className="file-name-text">
                    Attached: <strong>{attachedFile.name}</strong> ({(attachedFile.size / 1024).toFixed(0)} KB)
                  </span>
                ) : (
                  <span className="upload-placeholder-text">
                    Add a screenshot or receipt · PNG, JPG, or PDF
                  </span>
                )}
              </div>

              {attachedFile ? (
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={handleFileRemove}
                  title="Remove attached file"
                >
                  ✕
                </button>
              ) : (
                <span className="upload-optional-tag">OPTIONAL</span>
              )}
            </div>

            {/* Row 5: Footer & Submit */}
            <div className="contact-form-footer">
              <p className="contact-privacy-note">
                Your message is linked to your account only so we can investigate the job.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="contact-send-btn"
              >
                <span>{isSubmitting ? 'Sending...' : 'Send message'}</span>
                <svg
                  className="send-arrow-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
