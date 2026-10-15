import React, { useState } from 'react';
import './PricingIntroSection.css';

const STUDENT_TIERS = [
  {
    id: 'bw',
    tag: 'Standard Mono',
    tagClass: 'tag-mono',
    title: 'Standard B&W',
    priceMain: 'Rs. 10',
    priceUnit: '/ page',
    isPopular: false,
    description:
      'Crisp monochrome output tailored for course handouts, research papers, and assignments.',
    features: [
      'High-speed 1200 DPI laser toner',
      '80 GSM acid-free recycled paper',
      'Duplex (Double-sided) available',
    ],
    footerLeft: 'Speed: < 2s / sheet',
    footerRight: 'Default Mode',
  },
  {
    id: 'color',
    tag: 'Studio Vibrant',
    tagClass: 'tag-vibrant',
    title: 'Vibrant Full Color',
    priceMain: 'Rs. 15',
    priceUnit: '/ page',
    isPopular: true,
    description:
      'Precision CMYK calibration for project graphics, diagrams, and poster presentations.',
    features: [
      'Full spectrum Pantone matched ink',
      '90 GSM non-bleed premium finish',
      'Edge-to-edge borderless options',
    ],
    footerLeft: 'Speed: < 4s / sheet',
    footerRight: 'High Fidelity',
  },
  {
    id: 'bulk',
    tag: 'High Volume',
    tagClass: 'tag-volume',
    title: 'Bulk & Thesis',
    priceMain: '10% OFF',
    priceUnit: 'over 200 pgs',
    isPopular: false,
    description:
      'Engineered for semester dissertations, bulk labs, and high-volume departmental print runs.',
    features: [
      'Automatic volume-tier rebate',
      'Complimentary soft binding > 300 pgs',
      'Priority thermal print channel',
    ],
    footerLeft: 'Packaging: Shrink wrapped',
    footerRight: 'Thesis Spec',
  },
];

const UNIVERSITY_TIERS = [
  {
    id: 'pilot',
    tag: 'Pilot Deployment',
    tagClass: 'tag-mono',
    title: 'Pilot',
    priceMain: 'Request a quote',
    priceUnit: '',
    isPopular: false,
    description:
      'Start with a single department or library branch before rolling out campus-wide.',
    features: [
      'Up to 2 connected print stations',
      'Basic usage analytics & reporting',
      'Standard email support',
      'Self-serve student onboarding',
    ],
    footerLeft: 'Trial: 60-Day Evaluation',
    footerRight: 'Department Spec',
  },
  {
    id: 'campus',
    tag: 'Campus Wide',
    tagClass: 'tag-vibrant',
    title: 'Campus',
    priceMain: 'Request a quote',
    priceUnit: '',
    isPopular: true,
    description:
      'Connect your entire campus printing with document uploads, live queues, and team tools.',
    features: [
      'Unlimited students and faculty',
      'All campus print stations connected',
      'Campus printer integration & SSO',
      'Admin tools & usage reporting',
      'Priority technical support',
    ],
    footerLeft: 'SSO: SAML / Google / Azure',
    footerRight: 'Institution Spec',
  },
  {
    id: 'multi-campus',
    tag: 'Enterprise Fleet',
    tagClass: 'tag-volume',
    title: 'Multi-Campus',
    priceMain: 'Request a quote',
    priceUnit: '',
    isPopular: false,
    description:
      'For university systems with multiple campuses, distributed facilities, and custom SLAs.',
    features: [
      'Multi-location fleet synchronization',
      'Centralized billing & sub-accounts',
      'Custom SLAs & dedicated manager',
      'Custom integrations & ERP support',
    ],
    footerLeft: 'SLA: Custom 24/7 Support',
    footerRight: 'Multi-Campus Spec',
  },
];

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
      'Yes. Documents exceeding 200 pages automatically trigger tiered volume discounts starting at 10% off. Perfect for thesis print runs, research portfolios, and departmental project dossiers.',
  },
  {
    question: 'When do I pay for my print run?',
    answer:
      'You pay securely online right after customizing your options (color, paper, duplex) and approving your print preview. Once paid, your job is immediately dispatched to your chosen campus station queue.',
  },
  {
    question: 'What happens if a campus printer jams or runs out of paper?',
    answer:
      'If a campus printer halts unexpectedly, your account is immediately refunded or credited, and you can re-route your file to any other idle campus kiosk with a single tap.',
  },
];

const UNIVERSITY_FAQS = [
  {
    question: 'Can we start with one department or library?',
    answer:
      'Yes. Our Pilot tier is specifically designed for evaluating Print-fy in a single departmental lab, faculty library, or student union branch without requiring an initial campus-wide commitment.',
  },
  {
    question: 'Can we connect our existing university printers?',
    answer:
      'Yes. Print-fy operates seamlessly on top of standard commercial multi-function printer (MFP) fleets—including Ricoh, HP, Canon, Xerox, and Konica Minolta—via network print servers and cloud connectors.',
  },
  {
    question: 'How does campus Single Sign-On (SSO) work?',
    answer:
      'Our team integrates directly with your university identity provider (SAML 2.0, Microsoft Azure AD / Entra ID, Google Workspace) so students and faculty authenticate securely using their existing university IDs.',
  },
  {
    question: 'What determines our custom institutional quote?',
    answer:
      'Campus proposals reflect your active print station footprint, student body enrollment, hardware infrastructure, and desired support SLAs. Reach out via our Contact section for a tailored quote within 24 hours.',
  },
  {
    question: 'How fast is campus deployment and onboarding?',
    answer:
      'Our dedicated implementation team assists your campus IT with SSO setup, fleet configuration, and student portal customization. Most deployments go live in 1 to 2 weeks.',
  },
];

export default function PricingIntroSection({
  onLogin,
  onContact,
  audience: controlledAudience,
  onAudienceChange,
}) {
  const [internalAudience, setInternalAudience] = useState('students');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const audience = controlledAudience || internalAudience;

  const handleAudienceChange = (newAudience) => {
    setInternalAudience(newAudience);
    setExpandedFaq(null);
    if (onAudienceChange) {
      onAudienceChange(newAudience);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq((prev) => (prev === index ? null : index));
  };

  const handleLoginClick = () => {
    if (onLogin) {
      onLogin();
    } else {
      alert('Moving to Print-fy Login / Sign Up...');
    }
  };

  const handleContactClick = () => {
    if (onContact) {
      onContact();
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = '#contact';
      }
    }
  };

  const isStudents = audience === 'students';
  const activeTiers = isStudents ? STUDENT_TIERS : UNIVERSITY_TIERS;
  const activeFaqs = isStudents ? STUDENT_FAQS : UNIVERSITY_FAQS;

  return (
    <>
      <section className="pricing-intro-section" id="pricing" aria-label="Printfy Rates & Pricing">
      {/* Subtle cosmic background layer matching landing page theme */}
      <div className="pricing-starfield" aria-hidden="true">
        <img
          src="/screen3/3background.svg"
          alt=""
          className="pricing-stars-bg"
        />
        <div className="pricing-ambient-glow" />
      </div>

      <div className="pricing-intro-container">
        {/* Section Header: Centered */}
        <div className="pricing-intro-header">
          <span className="pricing-eyebrow">TRANSPARENT CAMPUS RATES</span>
          <h2 className="pricing-intro-heading">PRICING</h2>
          <p className="pricing-intro-subtext">
            {isStudents
              ? 'Know your price before you print. Instant uploads, no subscriptions, pay only for what you print.'
              : 'Bring smarter printing to your whole campus. Seamless printer integration, SSO, and admin controls.'}
          </p>

          {/* Professional On/Off Segmented Switch in the Main Frame */}
          <div className="pricing-toggle-wrap">
            <div
              className="pricing-onoff-switch"
              role="tablist"
              aria-label="Select audience view"
            >
              <button
                type="button"
                role="tab"
                id="tab-btn-students"
                aria-selected={isStudents}
                aria-controls="pricing-cards-grid"
                className={`toggle-tab-btn ${isStudents ? 'is-active' : ''}`}
                onClick={() => handleAudienceChange('students')}
              >
                Students
              </button>
              <button
                type="button"
                role="tab"
                id="tab-btn-universities"
                aria-selected={!isStudents}
                aria-controls="pricing-cards-grid"
                className={`toggle-tab-btn ${!isStudents ? 'is-active' : ''}`}
                onClick={() => handleAudienceChange('universities')}
              >
                Universities
              </button>
            </div>
          </div>
        </div>

        {/* Three All-White Pricing Cards Grid */}
        <div
          className="pricing-white-cards-grid"
          id="pricing-cards-grid"
          role="tabpanel"
          aria-labelledby={isStudents ? 'tab-btn-students' : 'tab-btn-universities'}
        >
          {activeTiers.map((tier) => (
            <article
              key={tier.id}
              className={`white-pricing-card ${tier.isPopular ? 'is-popular' : ''}`}
            >
              {/* Floating "POPULAR" badge */}
              {tier.isPopular && (
                <div className="card-popular-badge">POPULAR</div>
              )}

              {/* Clean Pill Tag Header (No icons) */}
              <div className="card-head-row">
                <span className={`card-pill-tag ${tier.tagClass}`}>{tier.tag}</span>
              </div>

              {/* Card Main Title */}
              <h3 className="card-main-title">{tier.title}</h3>

              {/* Price Row */}
              <div className="card-price-display">
                <span className={`price-amount ${tier.isPopular && isStudents ? 'is-purple' : ''}`}>
                  {tier.priceMain}
                </span>
                {tier.priceUnit && (
                  <span className="price-unit">{tier.priceUnit}</span>
                )}
              </div>

              {/* Subtitle / Description */}
              <p className="card-description-text">{tier.description}</p>

              {/* Checkmarked Feature List */}
              <ul className="card-feature-list">
                {tier.features.map((feat, idx) => (
                  <li key={idx} className="card-feature-item">
                    <span className="card-check-icon" aria-hidden="true">
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="#7c3aed" strokeWidth="1.5" />
                        <path
                          d="M5 8.2L7 10.2L11 5.8"
                          stroke="#7c3aed"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="card-feature-label">{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button: "Login into Print-fy" for Students / "Contact Us" for Universities */}
              <div className="card-btn-container">
                {isStudents ? (
                  <button
                    type="button"
                    className={`card-upload-btn ${tier.isPopular ? 'is-solid' : 'is-outlined'}`}
                    onClick={handleLoginClick}
                  >
                    <span>Login into Print-fy</span>
                    <span className="btn-arrow" aria-hidden="true">↗</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`card-upload-btn ${tier.isPopular ? 'is-solid' : 'is-outlined'}`}
                    onClick={handleContactClick}
                  >
                    <span>Contact Us</span>
                    <span className="btn-arrow" aria-hidden="true">→</span>
                  </button>
                )}
              </div>

              {/* Bottom Metadata Bar */}
              <div className="card-footer-strip">
                <span className="footer-meta-left">{tier.footerLeft}</span>
                <span className="footer-meta-right">{tier.footerRight}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* ====================================================================
        6. FAQs — resolve questions
        ==================================================================== */}
    <section
      className="landing-faq-section"
      id="faq"
      aria-label="Frequently Asked Questions"
    >
      <div className="landing-faq-container">
        <div className="pricing-white-faq-panel">
          <div className="faq-panel-header">
            <span className="faq-panel-badge">
              {isStudents ? 'STUDENT FAQ' : 'CAMPUS FAQ'}
            </span>
            <h2 className="faq-panel-title">
              {isStudents
                ? 'Frequently Asked Questions'
                : 'Campus Fleet & Integration FAQs'}
            </h2>
            <p className="faq-panel-desc">
              {isStudents
                ? 'Everything you need to know about rates, duplex savings, formats, and printer pickup.'
                : 'Details for administrators regarding hardware fleets, SAML/SSO security, and volume licensing.'}
            </p>
          </div>

          <div
            className="faq-white-accordion-list"
            role="region"
            aria-label={isStudents ? 'Student questions' : 'University questions'}
          >
            {activeFaqs.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div
                  key={index}
                  className={`faq-white-accordion-item ${isExpanded ? 'is-open' : ''}`}
                >
                  <button
                    type="button"
                    className="faq-white-question-btn"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isExpanded}
                    aria-controls={`pricing-faq-answer-${index}`}
                    id={`pricing-faq-btn-${index}`}
                  >
                    <span className="faq-white-question-text">{faq.question}</span>
                    <span
                      className={`faq-white-toggle-icon ${isExpanded ? 'is-expanded' : ''}`}
                      aria-hidden="true"
                    >
                      {isExpanded ? '−' : '+'}
                    </span>
                  </button>

                  <div
                    id={`pricing-faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`pricing-faq-btn-${index}`}
                    className={`faq-white-answer-container ${isExpanded ? 'is-visible' : ''}`}
                  >
                    <div className="faq-white-answer-inner">
                      <p className="faq-white-answer-text">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  </>
);
}
