import { useState, useEffect, useRef } from 'react';
import FooterSection from './FooterSection';
import './PricingPage.css';

// ============================================================================
// Data: Student Printing Options & Rates
// ============================================================================
const STUDENT_CARDS = [
  {
    id: 'bw',
    name: 'Black & White',
    rate: '$0.05',
    unit: '/ page',
    shortDesc: 'Essays, lecture notes, and everyday coursework.',
    isFeatured: false,
    buttonText: 'Login into Print-fy',
    panelLabel: 'Standard campus spec',
    panelHighlight: 'Crisp 600 DPI laser printing on 75gsm recycled paper',
    features: [
      'Single or double-sided (duplex discount)',
      'Standard Letter (A4) and Legal supported',
      'Instant release at any campus station',
      'Real-time queue tracking & ETA notifications',
      'PDF, DOCX, PPTX & image formats accepted',
    ],
  },
  {
    id: 'colour',
    name: 'Full Colour',
    rate: '$0.25',
    unit: '/ page',
    shortDesc: 'Presentations, charts, project portfolios, and design briefs.',
    isFeatured: true,
    buttonText: 'Login into Print-fy',
    panelLabel: 'High-density color',
    panelHighlight: 'Vibrant color reproduction with precision color calibration',
    features: [
      'High-res photo & presentation rendering',
      'Rich color fidelity for diagrams & charts',
      'Heavyweight 90gsm paper option available',
      'Instant print preview with color separation check',
      'Dedicated high-speed color kiosk routing',
    ],
  },
  {
    id: 'bulk',
    name: 'Bulk & Thesis',
    rate: 'From $0.03',
    unit: '/ page',
    shortDesc: 'Dissertations, research papers, and large volume documents.',
    isFeatured: false,
    buttonText: 'Login into Print-fy',
    panelLabel: 'Volume discount rule',
    panelHighlight: '20% off at 50+ pages · 35% off at 150+ pages',
    features: [
      'Progressive volume tier discounts applied automatically',
      'Spiral & thermal binding add-on at campus library desks',
      'High-capacity queue priority for 50+ page runs',
      'Free digital draft proof before full batch print',
      'Packaging & collection envelope included',
    ],
  },
];

// ============================================================================
// Data: University Institutional Plans
// ============================================================================
const UNIVERSITY_CARDS = [
  {
    id: 'pilot',
    name: 'Pilot',
    rate: 'Request a quote',
    unit: '',
    shortDesc: 'Start with a single department or library branch before rolling out campus-wide.',
    isFeatured: false,
    buttonText: 'Contact Us',
    panelLabel: 'Evaluation deployment',
    panelHighlight: 'Up to 2 connected hardware stations · 60-day guided evaluation',
    features: [
      'Up to 2 connected print stations',
      'Basic usage analytics & reporting',
      'Standard email support',
      'Self-serve student onboarding',
      'Hardware compatibility audit included',
    ],
  },
  {
    id: 'campus',
    name: 'Campus',
    rate: 'Request a quote',
    unit: '',
    shortDesc: 'Connect your campus printing with document uploads, live queues, and team tools.',
    isFeatured: true,
    buttonText: 'Contact Us',
    panelLabel: 'Full institution solution',
    panelHighlight: 'All campus student hubs & academic buildings connected',
    features: [
      'Unlimited students and faculty accounts',
      'All campus print stations connected',
      'Campus printer integration & SSO (SAML / Google / Azure)',
      'Admin tools & real-time usage reporting',
      'Priority technical support & dedicated onboarding specialist',
    ],
  },
  {
    id: 'multi-campus',
    name: 'Multi-Campus',
    rate: 'Request a quote',
    unit: '',
    shortDesc: 'For university systems with multiple campuses, distributed facilities, and custom SLAs.',
    isFeatured: false,
    buttonText: 'Contact Us',
    panelLabel: 'Distributed fleet scale',
    panelHighlight: 'Cross-campus roaming print with centralized governance',
    features: [
      'Multi-location fleet synchronization',
      'Centralized billing & sub-department accounts',
      'Custom SLAs & dedicated partner manager',
      'Custom integrations & campus ERP / LMS support',
      'Student ID card tap (NFC / RFID) kiosk integration',
    ],
  },
];

// ============================================================================
// Data: Audience-Specific FAQ Items
// ============================================================================
const STUDENT_FAQS = [
  {
    question: 'How is my printing cost calculated?',
    answer:
      'Your cost is calculated based on exact page count, color mode (Black & White vs. Full Colour), and duplex preferences. The total is calculated and displayed upfront before you confirm and pay—no hidden service fees or surprise charges.',
  },
  {
    question: 'Does double-sided printing change the price?',
    answer:
      'Yes. Duplex (double-sided) printing reduces paper consumption and is discounted compared to two separate single-sided sheets. Your per-sheet discount is automatically factored into your preview total.',
  },
  {
    question: 'Are bulk discounts available?',
    answer:
      'Yes. Documents exceeding 50 pages automatically trigger tiered volume discounts starting at 20% off, and 35% off for runs over 150 pages. Perfect for thesis print runs, reading binders, and large project dossiers.',
  },
  {
    question: 'When do I pay?',
    answer:
      'You pay securely online right after customizing your options (color, paper, duplex) and approving your print preview. Once paid, your job is immediately dispatched to your chosen campus station queue.',
  },
  {
    question: 'What happens if my print job fails?',
    answer:
      'If a campus printer runs out of toner, experiences a paper jam, or halts unexpectedly, your account is immediately refunded or credited, and you can re-route your file to any other idle campus kiosk with a single tap.',
  },
];

const UNIVERSITY_FAQS = [
  {
    question: 'Can we start with one department or library?',
    answer:
      'Yes. Our Pilot tier is specifically designed for evaluating Printfy in a single departmental lab, faculty library, or student union branch without requiring an initial campus-wide commitment.',
  },
  {
    question: 'Can we connect our existing university printers?',
    answer:
      'Yes. Printfy operates seamlessly on top of standard commercial multi-function printer (MFP) fleets—including Ricoh, HP, Canon, Xerox, and Konica Minolta—via standard IPP/network print servers and cloud connectors.',
  },
  {
    question: 'How does campus Single Sign-On (SSO) work?',
    answer:
      'Printfy integrates directly with your campus identity provider using SAML 2.0, Google Workspace, Azure AD, or Shibboleth/InCommon, allowing students and staff to authenticate securely using their existing university accounts.',
  },
  {
    question: 'What determines our custom institutional quote?',
    answer:
      'Campus proposals reflect your active print station footprint, student body enrollment, campus SSO authentication requirements, and desired support SLAs. Reach out to our campus team for a custom quote within 24 hours.',
  },
  {
    question: 'How fast is campus deployment and onboarding?',
    answer:
      'Our dedicated implementation team assists your campus IT with identity provider SSO integration, network driver configuration, and student portal customization. Most deployments go live in 1 to 2 weeks.',
  },
];

export default function PricingPage({
  initialAudience = 'students',
  onBack,
  onStartUpload,
  onContact,
}) {
  const [audience, setAudience] = useState(initialAudience);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // University Enquiry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Campus');
  const [submittedMessage, setSubmittedMessage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    institution: '',
    email: '',
    role: '',
    fleetSize: '1-5 locations',
    notes: '',
  });

  // Public Navbar Pricing Dropdown State
  const [isPricingDropdownOpen, setIsPricingDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync initial audience prop if changed from parent
  useEffect(() => {
    if (initialAudience) {
      setAudience(initialAudience);
    }
  }, [initialAudience]);

  // Sync route on mount & listen to browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (
        path === '/pricing/universities' ||
        hash === '#pricing/universities' ||
        hash === '#campus-pricing'
      ) {
        setAudience('universities');
      } else if (
        path === '/pricing/students' ||
        path === '/pricing' ||
        hash === '#pricing/students' ||
        hash === '#pricing'
      ) {
        setAudience('students');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Handle outside click for navbar dropdown & ESC for modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsPricingDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPricingDropdownOpen(false);
        setIsModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Switch audience and update URL route
  const handleAudienceChange = (newAudience) => {
    if (newAudience === audience) return;
    setAudience(newAudience);
    setExpandedFaq(null);

    const targetPath =
      newAudience === 'universities'
        ? '/pricing/universities'
        : '/pricing/students';
    const targetHash =
      newAudience === 'universities'
        ? '#pricing/universities'
        : '#pricing/students';

    try {
      window.history.pushState({}, '', targetPath);
    } catch {
      window.location.hash = targetHash;
    }
  };

  // Toggle FAQ item with keyboard accessibility
  const toggleFaq = (index) => {
    setExpandedFaq((prev) => (prev === index ? null : index));
  };

  // Open Enquiry Modal with preselected plan
  const openEnquiry = (planName) => {
    setSelectedPlan(planName);
    setIsModalOpen(true);
    setSubmittedMessage(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmittedMessage(
      `Quote requested for the ${selectedPlan} plan. Our university team will contact ${formData.email || 'you'} within one business day.`
    );
    setToastMessage(`✓ Enquiry sent for ${selectedPlan} plan`);
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmittedMessage(null);
    }, 2800);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Determine current active content
  const isStudents = audience === 'students';
  const headingText = isStudents
    ? 'Clear prices. Ready when you are.'
    : 'Printing that fits your campus.';
  const descriptionText = isStudents
    ? 'Choose your print options and see your total before paying.'
    : 'Explore deployment options for one print location, a whole campus, or multiple campuses.';
  const activeCards = isStudents ? STUDENT_CARDS : UNIVERSITY_CARDS;
  const activeFaqs = isStudents ? STUDENT_FAQS : UNIVERSITY_FAQS;
  const pricingNote = isStudents
    ? 'Prices exclude VAT and local taxes. Actual campus per-page rates may vary by partner university guidelines. Totals are confirmed upfront prior to payment.'
    : 'Custom institutional quotes reflect your campus fleet size, location density, and SSO infrastructure. No long-term commitments required for pilot evaluations.';

  return (
    <div className="pricing-clean-page">
      {/* ====================================================================
          1. Public Navbar (Connected to Pricing Views)
          ==================================================================== */}
      <header className="pricing-navbar">
        <div className="pricing-container nav-container-flex">
          {/* Brand Logo */}
          <div
            className="pricing-nav-brand"
            onClick={() => onBack && onBack()}
            role="button"
            tabIndex={0}
            aria-label="Printfy home"
          >
            <img
              src="/logo/printfy-logo.svg"
              alt="Print-Fy"
              className="nav-brand-logo"
            />
            <span className="nav-brand-name">Print-Fy</span>
            <span className="nav-brand-badge">Pricing</span>
          </div>

          {/* Links */}
          <nav className="pricing-nav-links" aria-label="Main Navigation">
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => onBack && onBack('about')}
            >
              About
            </button>
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => onBack && onBack('features')}
            >
              Features
            </button>

            {/* Pricing with Dropdown */}
            <div className="nav-pricing-wrap" ref={dropdownRef}>
              <button
                type="button"
                className={`nav-link-btn nav-pricing-btn is-active`}
                onClick={() => setIsPricingDropdownOpen((prev) => !prev)}
                aria-expanded={isPricingDropdownOpen}
                aria-haspopup="true"
              >
                <span>Pricing</span>
                <svg
                  className={`nav-chevron-icon ${isPricingDropdownOpen ? 'is-rotated' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 4.5L6 8L9.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {isPricingDropdownOpen && (
                <div className="nav-pricing-menu" role="menu">
                  <button
                    type="button"
                    className={`nav-dropdown-item ${isStudents ? 'is-selected' : ''}`}
                    role="menuitem"
                    onClick={() => {
                      setIsPricingDropdownOpen(false);
                      handleAudienceChange('students');
                    }}
                  >
                    <div className="dropdown-item-top">
                      <span className="dropdown-item-title">For Students</span>
                      {isStudents && <span className="dropdown-check">✓</span>}
                    </div>
                    <span className="dropdown-item-sub">
                      Print rates &amp; bulk thesis options
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`nav-dropdown-item ${!isStudents ? 'is-selected' : ''}`}
                    role="menuitem"
                    onClick={() => {
                      setIsPricingDropdownOpen(false);
                      handleAudienceChange('universities');
                    }}
                  >
                    <div className="dropdown-item-top">
                      <span className="dropdown-item-title">For Universities</span>
                      {!isStudents && <span className="dropdown-check">✓</span>}
                    </div>
                    <span className="dropdown-item-sub">
                      Campus fleet plans &amp; deployment
                    </span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Nav Actions */}
          <div className="pricing-nav-actions">
            <button
              type="button"
              className="nav-back-btn"
              onClick={() => onBack && onBack()}
              aria-label="Back to home page"
            >
              <span className="back-arrow" aria-hidden="true">←</span>
              <span>Back to Home</span>
            </button>
            <button
              type="button"
              className="nav-primary-action-btn"
              onClick={() => {
                if (isStudents) {
                  onStartUpload ? onStartUpload() : onBack && onBack();
                } else {
                  openEnquiry('Campus');
                }
              }}
            >
              {isStudents ? 'Start Printing' : 'Contact Sales'}
            </button>
          </div>
        </div>
      </header>

      {/* Global Toast if Enquiry Sent */}
      {toastMessage && (
        <div className="pricing-toast-banner" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ====================================================================
          2. Page Hero: Heading & Short Introduction
          ==================================================================== */}
      <section className="pricing-hero-section">
        <div className="pricing-container">
          <div className="pricing-hero-content">
            <h1 className="pricing-main-heading">{headingText}</h1>
            <p className="pricing-main-description">{descriptionText}</p>
          </div>

          {/* ================================================================
              3. Left-Aligned Segmented Switch: “Students” | “Universities”
              Positioned above the pricing cards, aligned with their left edge
              ================================================================ */}
          <div
            className="pricing-switch-wrapper"
            role="tablist"
            aria-label="Choose pricing audience"
          >
            <div className="segmented-switch">
              <button
                type="button"
                role="tab"
                id="tab-students"
                aria-selected={isStudents}
                aria-controls="pricing-cards-panel"
                className={`switch-segment ${isStudents ? 'is-active' : ''}`}
                onClick={() => handleAudienceChange('students')}
              >
                <span>Students</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-universities"
                aria-selected={!isStudents}
                aria-controls="pricing-cards-panel"
                className={`switch-segment ${!isStudents ? 'is-active' : ''}`}
                onClick={() => handleAudienceChange('universities')}
              >
                <span>Universities</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. Three Pricing Cards Section (Desktop: 3 columns, Mobile: stacked)
          ==================================================================== */}
      <section
        className="pricing-cards-section"
        id="pricing-cards-panel"
        role="tabpanel"
        aria-labelledby={isStudents ? 'tab-students' : 'tab-universities'}
      >
        <div className="pricing-container">
          <div className="pricing-cards-grid">
            {activeCards.map((card) => (
              <article
                key={card.id}
                className={`pricing-card ${card.isFeatured ? 'is-featured' : ''}`}
              >
                {/* Card Header */}
                <div className="card-top-content">
                  <div className="card-title-row">
                    <h2 className="card-title">{card.name}</h2>
                    {card.isFeatured && (
                      <span className="card-featured-tag">Recommended</span>
                    )}
                  </div>

                  <p className="card-short-desc">{card.shortDesc}</p>

                  {/* Rate / Price Display */}
                  <div className="card-price-row">
                    <span className="card-price-value">{card.rate}</span>
                    {card.unit && <span className="card-price-unit">{card.unit}</span>}
                  </div>

                  {/* Pale Lavender Small Content Panel (Reference Style) */}
                  <div className="card-lavender-panel">
                    <span className="lavender-panel-label">{card.panelLabel}</span>
                    <p className="lavender-panel-text">{card.panelHighlight}</p>
                  </div>
                </div>

                {/* Aligned Action Button */}
                <div className="card-action-wrap">
                  <button
                    type="button"
                    className={`card-btn ${card.isFeatured ? 'is-solid' : 'is-outlined'}`}
                    onClick={() => {
                      if (isStudents) {
                        onStartUpload ? onStartUpload() : onBack && onBack();
                      } else {
                        openEnquiry(card.name);
                      }
                    }}
                    aria-label={`${card.buttonText} for ${card.name}`}
                  >
                    <span>{card.buttonText}</span>
                    <span className="btn-diagonal-arrow" aria-hidden="true">↗</span>
                  </button>
                </div>

                {/* Thin Card Divider */}
                <div className="card-divider" aria-hidden="true" />

                {/* Concise Feature List with small checkmarks */}
                <div className="card-features-block">
                  <span className="features-block-label">
                    {isStudents ? 'Included options:' : 'Included features:'}
                  </span>
                  <ul className="features-list">
                    {card.features.map((feat, idx) => (
                      <li key={idx} className="feature-item">
                        <span className="check-icon" aria-hidden="true">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M3.5 8.5L6.5 11.5L12.5 4.5"
                              stroke="#6d28d9"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span className="feature-text">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          {/* Short Pricing Note below cards */}
          <div className="pricing-note-wrap">
            <p className="pricing-note-text">{pricingNote}</p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. Audience-Specific FAQ Accordion Section
          Clean two-column layout: Left (~30%) Heading & Action, Right (~70%) Accordion
          ==================================================================== */}
      <section className="pricing-faq-section" id="faq" aria-labelledby="faq-main-heading">
        <div className="pricing-container">
          <div className="faq-two-col-layout">
            
            {/* Left Column (~30%): Left-aligned Heading & Outlined Contact Button */}
            <div className="faq-left-col">
              <h2 id="faq-main-heading" className="faq-heading">
                Answers to your top questions
              </h2>

              <div className="faq-contact-wrap">
                <button
                  type="button"
                  className="faq-contact-btn"
                  onClick={() => {
                    if (isStudents) {
                      if (onContact) {
                        onContact();
                      } else {
                        window.location.hash = '#contact';
                      }
                    } else {
                      openEnquiry('Campus');
                    }
                  }}
                  aria-label={isStudents ? 'Contact support' : 'Contact our campus team'}
                >
                  <span>{isStudents ? 'Contact support' : 'Contact our campus team'}</span>
                  <span className="faq-contact-arrow" aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            {/* Right Column (~70%): Plain Accordion Rows with Purple Plus/Minus */}
            <div className="faq-right-col">
              <div className="faq-accordion-list" role="region" aria-label="Frequently Asked Questions">
                {activeFaqs.map((faq, index) => {
                  const isExpanded = expandedFaq === index;
                  return (
                    <div
                      key={index}
                      className={`faq-accordion-item ${isExpanded ? 'is-open' : ''}`}
                    >
                      <button
                        type="button"
                        className="faq-question-btn"
                        onClick={() => toggleFaq(index)}
                        aria-expanded={isExpanded}
                        aria-controls={`faq-answer-${index}`}
                        id={`faq-btn-${index}`}
                      >
                        <span className="faq-question-text">{faq.question}</span>
                        <span
                          className={`faq-toggle-icon ${isExpanded ? 'is-expanded' : ''}`}
                          aria-hidden="true"
                        >
                          {isExpanded ? (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path
                                d="M2.5 7H11.5"
                                stroke="#7c3aed"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path
                                d="M7 2.5V11.5M2.5 7H11.5"
                                stroke="#7c3aed"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                        </span>
                      </button>

                      <div
                        id={`faq-answer-${index}`}
                        role="region"
                        aria-labelledby={`faq-btn-${index}`}
                        className={`faq-answer-container ${isExpanded ? 'is-visible' : ''}`}
                      >
                        <div className="faq-answer-inner">
                          <p className="faq-answer-text">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ====================================================================
          6. University Enquiry Modal (When clicking "Request a quote")
          ==================================================================== */}
      {isModalOpen && (
        <div
          className="pricing-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="pricing-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-plan-title"
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="modal-header">
              <span className="modal-eyebrow">PRINTFY FOR UNIVERSITIES</span>
              <h3 id="modal-plan-title" className="modal-title">
                Request a Campus Quote
              </h3>
              <p className="modal-subtitle">
                Deploy seamless, queue-free printing across your campus locations.
              </p>
            </div>

            {submittedMessage ? (
              <div className="modal-success-box">
                <span className="modal-success-icon">✓</span>
                <h4>Thank You!</h4>
                <p>{submittedMessage}</p>
              </div>
            ) : (
              <form className="modal-form" onSubmit={handleFormSubmit}>
                {/* Preselected Plan Switcher */}
                <div className="form-group">
                  <label htmlFor="plan-select">Selected Plan</label>
                  <select
                    id="plan-select"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="modal-input"
                  >
                    <option value="Pilot">Pilot — Single department or library branch</option>
                    <option value="Campus">Campus — Entire university &amp; SSO</option>
                    <option value="Multi-Campus">Multi-Campus — Multi-location fleet system</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inst-name">University / Institution</label>
                    <input
                      id="inst-name"
                      type="text"
                      required
                      placeholder="e.g. Stanford University"
                      className="modal-input"
                      value={formData.institution}
                      onChange={(e) =>
                        setFormData({ ...formData, institution: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="work-email">Official Email</label>
                    <input
                      id="work-email"
                      type="email"
                      required
                      placeholder="name@university.edu"
                      className="modal-input"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fleet-locations">Estimated Print Stations</label>
                    <select
                      id="fleet-locations"
                      value={formData.fleetSize}
                      onChange={(e) =>
                        setFormData({ ...formData, fleetSize: e.target.value })
                      }
                      className="modal-input"
                    >
                      <option value="1-2 locations">1-2 stations (Pilot trial)</option>
                      <option value="3-10 locations">3-10 campus stations</option>
                      <option value="10+ locations">10+ stations across campus</option>
                      <option value="Multi-campus system">Multi-campus university fleet</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="user-role">Your Role</label>
                    <input
                      id="user-role"
                      type="text"
                      placeholder="e.g. IT Director / Facilities"
                      className="modal-input"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="form-notes">Special Requirements / Notes (Optional)</label>
                  <textarea
                    id="form-notes"
                    rows="2"
                    placeholder="Tell us about existing printer hardware, campus card tap, or student portal..."
                    className="modal-input modal-textarea"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="modal-submit-btn">
                    <span>Submit Quote Request</span>
                    <span className="btn-diagonal-arrow">→</span>
                  </button>
                  <span className="modal-privacy-note">
                    🔒 Strict privacy. No spam. Tailored to your campus specifications.
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          7. Unified Figma Footer
          ==================================================================== */}
      <FooterSection onNavigateSection={onBack} onNavigateContact={onContact} />
    </div>
  );
}
