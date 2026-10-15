import React, { useState } from 'react';
import FooterSection from './FooterSection';
import './ContactPage.css';

export default function ContactPage({ onBack, onNavigateCampusPlans }) {
  const [formData, setFormData] = useState({
    reason: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    institution: '',
    campusSize: '',
    countryCode: '+92',
    phone: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please complete all required fields (First name, Email, and Message).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Simulate sending contact request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        reason: '',
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        institution: '',
        campusSize: '',
        countryCode: '+92',
        phone: '',
        message: '',
      });
    }, 1200);
  };

  return (
    <div className="contact-page-wrapper">
      {/* Ambient Cosmic Purple Backdrop with Deep Black Contrast */}
      <div className="contact-page-ambient" aria-hidden="true">
        <div className="ambient-orb orb-primary" />
        <div className="ambient-orb orb-secondary" />
        <div className="ambient-grid-overlay" />
      </div>

      {/* Top Navigation Bar */}
      <header className="contact-page-navbar">
        <div className="contact-nav-container">
          <div className="contact-nav-brand" onClick={() => onBack && onBack()}>
            <img
              src="/logo/printfy-logo.svg"
              alt="Print-Fy"
              className="contact-brand-logo"
            />
            <span className="contact-brand-sub">Campus Print Platform</span>
          </div>

          <div className="contact-nav-actions">
            <button
              type="button"
              className="contact-nav-back-btn"
              onClick={() => onBack && onBack()}
            >
              ← Back to Home
            </button>
            <button
              type="button"
              className="contact-nav-plan-btn"
              onClick={() => {
                if (onNavigateCampusPlans) {
                  onNavigateCampusPlans();
                } else if (onBack) {
                  onBack('pricing');
                }
              }}
            >
              Explore Campus Plans
            </button>
          </div>
        </div>
      </header>

      {/* Main Two-Column Stage */}
      <main className="contact-page-main">
        <div className="contact-main-grid">
          {/* Left Column: Heading, Subtitle & Direct Contacts */}
          <aside className="contact-left-col">
            <span className="contact-eyebrow">CONTACT</span>
            <h1 className="contact-main-heading">Contact Us</h1>
            <p className="contact-lead-subtext">
              A real person on our team will get back to you shortly.
            </p>

            <div className="contact-left-divider" />

            <div className="contact-left-sidebar-card">
              <h3 className="sidebar-card-title">Need immediate help?</h3>
              <p className="sidebar-card-text">
                Have questions about your campus station, refund request, or student queue? Reach our active support desk directly:
              </p>

              <div className="sidebar-contact-links">
                <a href="mailto:Prinfy@gmail.com" className="sidebar-direct-link">
                  <span className="link-icon">✉</span>
                  <span>Prinfy@gmail.com</span>
                </a>
                <a href="tel:0339990001" className="sidebar-direct-link">
                  <span className="link-icon">📞</span>
                  <span>Contact us at 0339990001</span>
                </a>
              </div>

              <div className="sidebar-plan-cta">
                <span className="sidebar-plan-question">Looking for university deployment?</span>
                <button
                  type="button"
                  className="sidebar-plan-link-btn"
                  onClick={() => {
                    if (onNavigateCampusPlans) {
                      onNavigateCampusPlans();
                    } else if (onBack) {
                      onBack('pricing');
                    }
                  }}
                >
                  See campus plans →
                </button>
              </div>
            </div>
          </aside>

          {/* Right Column: High-Contrast Pure White Enterprise Card */}
          <section className="contact-right-col" aria-label="Contact form">
            <div className="contact-white-card">
              {isSuccess ? (
                <div className="form-success-state" role="alert">
                  <div className="success-badge-icon">✓</div>
                  <h3 className="success-heading">Thank you for reaching out!</h3>
                  <p className="success-message">
                    Your inquiry has been routed to our campus partnerships & customer support team. We will contact you at your provided email shortly.
                  </p>
                  <button
                    type="button"
                    className="success-reset-btn"
                    onClick={() => setIsSuccess(false)}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="contact-enterprise-form" onSubmit={handleSubmit}>
                  {errorMsg && (
                    <div className="form-error-toast" role="alert">
                      <span>⚠️</span> {errorMsg}
                    </div>
                  )}

                  {/* REASON: Customer Support & Enterprise topics */}
                  <div className="form-field-block">
                    <label htmlFor="form-reason" className="field-mini-label">
                      REASON
                    </label>
                    <div className="field-select-wrap">
                      <select
                        id="form-reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleInputChange}
                        className="field-underlined-select"
                      >
                        <option value="" disabled>Select a reason</option>
                        <option value="customer-support">Customer Support & Student Helpdesk</option>
                        <option value="hardware-jam">Print Station Hardware & Jam Assistance</option>
                        <option value="refund-billing">Student Balance, Refunds & Queue Issue</option>
                        <option value="campus-quote">University Campus Deployment & Custom Quote</option>
                        <option value="sso-integration">Campus IT, SSO & SAML Integration</option>
                        <option value="department-license">Department Volume Licensing</option>
                        <option value="general">General Campus Inquiry & Feedback</option>
                      </select>
                      <span className="select-arrow" aria-hidden="true">▾</span>
                    </div>
                  </div>

                  {/* FIRST NAME | LAST NAME */}
                  <div className="form-two-col-row">
                    <div className="form-field-block">
                      <label htmlFor="form-first-name" className="field-mini-label">
                        FIRST NAME
                      </label>
                      <input
                        id="form-first-name"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="eg. Clara"
                        className="field-underlined-input"
                        required
                      />
                    </div>

                    <div className="form-field-block">
                      <label htmlFor="form-last-name" className="field-mini-label">
                        LAST NAME
                      </label>
                      <input
                        id="form-last-name"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="eg. Rockmore"
                        className="field-underlined-input"
                      />
                    </div>
                  </div>

                  {/* BUSINESS EMAIL | ROLE / OPTIONAL */}
                  <div className="form-two-col-row">
                    <div className="form-field-block">
                      <label htmlFor="form-email" className="field-mini-label">
                        BUSINESS / CAMPUS EMAIL
                      </label>
                      <input
                        id="form-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="name@university.edu"
                        className="field-underlined-input"
                        required
                      />
                    </div>

                    <div className="form-field-block">
                      <label htmlFor="form-role" className="field-mini-label">
                        ROLE / OPTIONAL
                      </label>
                      <input
                        id="form-role"
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        placeholder="Your role at the campus"
                        className="field-underlined-input"
                      />
                    </div>
                  </div>

                  {/* COMPANY / UNIVERSITY | CAMPUS SIZE */}
                  <div className="form-two-col-row">
                    <div className="form-field-block">
                      <label htmlFor="form-institution" className="field-mini-label">
                        CAMPUS / INSTITUTION
                      </label>
                      <input
                        id="form-institution"
                        type="text"
                        name="institution"
                        value={formData.institution}
                        onChange={handleInputChange}
                        placeholder="Your university or campus"
                        className="field-underlined-input"
                      />
                    </div>

                    <div className="form-field-block">
                      <label htmlFor="form-campus-size" className="field-mini-label">
                        CAMPUS SIZE
                      </label>
                      <div className="field-select-wrap">
                        <select
                          id="form-campus-size"
                          name="campusSize"
                          value={formData.campusSize}
                          onChange={handleInputChange}
                          className="field-underlined-select"
                        >
                          <option value="" disabled>Select size</option>
                          <option value="1-5k">Under 5,000 students</option>
                          <option value="5-15k">5,000 – 15,000 students</option>
                          <option value="15-30k">15,000 – 30,000 students</option>
                          <option value="30k+">30,000+ students (Multi-campus)</option>
                        </select>
                        <span className="select-arrow" aria-hidden="true">▾</span>
                      </div>
                    </div>
                  </div>

                  {/* PHONE NUMBER */}
                  <div className="form-field-block">
                    <label htmlFor="form-phone" className="field-mini-label">
                      PHONE NUMBER
                    </label>
                    <div className="phone-input-split">
                      <div className="phone-country-code-wrap">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleInputChange}
                          className="field-underlined-select phone-code-select"
                          aria-label="Country calling code"
                        >
                          <option value="+92">PK (+92)</option>
                          <option value="+1">US (+1)</option>
                          <option value="+44">UK (+44)</option>
                          <option value="+971">UAE (+971)</option>
                          <option value="+61">AU (+61)</option>
                        </select>
                        <span className="select-arrow" aria-hidden="true">▾</span>
                      </div>
                      <input
                        id="form-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="123-456-789"
                        className="field-underlined-input phone-number-input"
                      />
                    </div>
                  </div>

                  {/* MESSAGE */}
                  <div className="form-field-block">
                    <label htmlFor="form-message" className="field-mini-label">
                      MESSAGE
                    </label>
                    <textarea
                      id="form-message"
                      name="message"
                      rows="3"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your team, your goals, and what you want to create."
                      className="field-underlined-textarea"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="form-submit-row">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="talk-team-submit-btn"
                    >
                      <span>{isSubmitting ? 'Submitting...' : 'Talk to the team'}</span>
                      <span className="btn-arrow-icon">→</span>
                    </button>
                  </div>

                  {/* Legal Fineprint */}
                  <p className="form-legal-fineprint">
                    Print-Fy will process your data for the purpose of maintaining a professional contact, for the management of pre-contractual measures, and where appropriate, the conclusion of an agreement with you, based on our legitimate interest. Your data will not be communicated to third parties and will be transferred outside the EU under the terms of our privacy policy.
                    <br />
                    <em>All required fields must be completed before submitting.</em>
                  </p>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Unified Official Footer */}
      <FooterSection
        onNavigateSection={onBack}
        onNavigateContact={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </div>
  );
}
