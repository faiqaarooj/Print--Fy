import { useState, useEffect, useRef } from 'react';
import './WorkflowSection.css';

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Upload your file',
    desc: 'Choose your document, printer, and print settings.',
    targetId: 'step-02',
  },
  {
    num: '02',
    title: 'Track your print',
    desc: 'See your queue position and estimated waiting time.',
    targetId: 'step-03',
  },
  {
    num: '03',
    title: 'Collect on time',
    desc: 'Get notified when your document is ready.',
    targetId: 'live-queue-demo',
  },
];

const INITIAL_QUEUE_JOBS = [
  {
    id: 1,
    title: 'Studio critique.pdf',
    meta: '12 pages · Duplex · B&W',
    status: 'Printing',
    statusType: 'printing',
  },
  {
    id: 2,
    title: 'Research notes.docx',
    meta: '6 pages · Single-sided · B&W',
    status: 'Next',
    statusType: 'next',
  },
  {
    id: 3,
    title: 'Seminar handout.pdf',
    meta: '3 pages · Color',
    status: 'Queued',
    statusType: 'queued',
  },
];

// ============================================================================
// PART 1: THREE-STEP PRINTING WORKFLOW WITH 3D CURLED PAPER GLIDER
// ============================================================================
export function WorkflowStepsSection() {
  const stepsContainerRef = useRef(null);
  const cardRefs = [useRef(null), useRef(null), useRef(null)];
  const [activeStep, setActiveStep] = useState(0);
  const [paperCoords, setPaperCoords] = useState({ x: 40, y: 2, rot: -8 });
  const [isManualSelection, setIsManualSelection] = useState(false);

  // Position paper sheet directly at the targeted card
  const positionPaperForStep = (idx) => {
    const cardEl = cardRefs[idx]?.current;
    const containerEl = stepsContainerRef.current;
    if (!cardEl || !containerEl) return;

    const cardRect = cardEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();

    const isDesktop = window.innerWidth > 992;
    if (isDesktop) {
      // Horizontal desktop: center paper above the selected card along the S-curve
      const cardCenter = cardRect.left - containerRect.left + cardRect.width / 2;
      const x = cardCenter - 31; // half of paper width (62px / 2)
      const y = idx === 1 ? 26 : idx === 2 ? 6 : 2;
      const rot = idx === 0 ? -8 : idx === 1 ? 3 : 8;
      setPaperCoords({ x, y, rot });
    } else {
      // Vertical mobile/tablet: float paper right beside or directly over the clicked card
      const x = Math.max(12, cardRect.left - containerRect.left + 24);
      const y = cardRect.top - containerRect.top - 55;
      const rot = idx === 0 ? -6 : idx === 1 ? 3 : 6;
      setPaperCoords({ x, y, rot });
    }
  };

  // Re-position on mount, step change, and window resize
  useEffect(() => {
    // Initial delay to ensure DOM dimensions are computed
    const timer = setTimeout(() => {
      positionPaperForStep(activeStep);
    }, 50);

    const handleResize = () => {
      positionPaperForStep(activeStep);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeStep]);

  // Smooth scroll-linked tracking when not explicitly clicking
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (isManualSelection) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!stepsContainerRef.current) return;
          const rect = stepsContainerRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          const totalDistance = windowHeight + rect.height;
          const currentDistance = windowHeight - rect.top;
          const progress = Math.max(0, Math.min(1, currentDistance / totalDistance));

          let step = 0;
          if (progress < 0.42) {
            step = 0;
          } else if (progress < 0.72) {
            step = 1;
          } else {
            step = 2;
          }

          setActiveStep(step);
          positionPaperForStep(step);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isManualSelection]);

  // Handle clicking each card: the paper page moves smoothly to the card that was clicked!
  const handleStepClick = (idx) => {
    setIsManualSelection(true);
    setActiveStep(idx);
    positionPaperForStep(idx);

    // Release lock after animation so natural scrolling can resume
    setTimeout(() => {
      setIsManualSelection(false);
    }, 3200);
  };

  return (
    <div className="workflow-steps-wrapper" id="workflow-steps" aria-label="Workflow Steps">
      {/* Section Headings */}
      <div className="workflow-intro-stage">
        <h2 className="workflow-main-headline">
          Upload. Track. Collect. Done.
        </h2>
        <p className="workflow-supporting-text">
          Send your document. Follow its progress. Collect it on time.
        </p>
      </div>

      {/* Spacious Three-Step Interactive Container with S-Curve Paper Glider */}
      <div className="workflow-steps-stage" ref={stepsContainerRef}>
        
        {/* SVG S-Curve Path & Smooth Gliding Paper Sheet */}
        <div className="workflow-paper-track" aria-hidden="true">
          <svg
            className="workflow-scurve-svg"
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
          >
            <path
              d="M 50 60 Q 280 10, 500 60 T 950 60"
              className="workflow-path-line"
            />
          </svg>

          {/* 3D Paper Sheet with Curled Corner: Glides smoothly to whichever card is clicked */}
          <div
            className={`workflow-gliding-paper ${activeStep === 2 ? 'is-settled' : ''}`}
            style={{
              '--paper-x': `${paperCoords.x}px`,
              '--paper-y': `${paperCoords.y}px`,
              '--paper-rot': `${paperCoords.rot}deg`,
            }}
          >
            <div className="paper-sheet-3d">
              {/* Dynamic step micro badge on the paper */}
              <div className="paper-step-badge">
                {activeStep === 0 && <span className="badge-txt">01 · FILE</span>}
                {activeStep === 1 && <span className="badge-txt">02 · QUEUE</span>}
                {activeStep === 2 && <span className="badge-txt">03 · READY ✓</span>}
              </div>

              {/* Subtle faux document preview lines */}
              <div className="paper-doc-lines">
                <span className="doc-line doc-line-title" />
                <span className="doc-line doc-line-short" />
                <span className="doc-line doc-line-long" />
                <span className="doc-line doc-line-mid" />
              </div>
              {/* 3D Curled Corner Geometry */}
              <div className="paper-curl-corner" />
            </div>
          </div>
        </div>

        {/* Three Clean Steps (Clicking moves the paper sheet directly to that card) */}
        <div className="workflow-steps-grid">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isCurrent = activeStep === idx;
            return (
              <div
                key={step.num}
                ref={cardRefs[idx]}
                id={`workflow-step-${idx}`}
                className={`workflow-step-card ${isCurrent ? 'is-highlighted' : ''}`}
                onClick={() => handleStepClick(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleStepClick(idx);
                  }
                }}
              >
                <div className="workflow-step-header">
                  <span className="workflow-step-num">{step.num}</span>
                  <span className="workflow-step-divider">—</span>
                  <h3 className="workflow-step-title">{step.title}</h3>
                </div>
                <p className="workflow-step-desc">{step.desc}</p>
                <div className="workflow-step-action-hint">
                  <span>{isCurrent ? '● Active' : 'Click to move sheet here'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PART 2: INTERACTIVE LIVE QUEUE & UPLOAD DEMO (After Rhythm of Campus Card)
// ============================================================================
export function WorkflowDemoSection() {
  const [activeTab, setActiveTab] = useState(1); // 1: Document details, 2: Demo queue, 3: Ready to collect
  const [copiesCount, setCopiesCount] = useState(1);
  const [printStyle, setPrintStyle] = useState('Black & white');
  const [sidesSelection, setSidesSelection] = useState('Double-sided');
  const [paperSelection, setPaperSelection] = useState('A4');
  const [openDropdown, setOpenDropdown] = useState(null);

  // Dynamic sample price calculation (Matches screenshot default: 12 pages * 10 = Rs. 120)
  const calculateTotal = () => {
    const pageCount = 12;
    const ratePerPage = printStyle === 'Full color' ? 30 : 10;
    return pageCount * ratePerPage * copiesCount;
  };

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const handleNextStep = () => {
    if (activeTab < 3) {
      setActiveTab((prev) => prev + 1);
    } else {
      setActiveTab(1);
    }
  };

  return (
    <div className="demo-flow-section" id="live-queue-demo" aria-label="Interactive Print Flow Demo">
      {/* Header above prototype */}
      <div className="demo-flow-header">
        <div className="demo-flow-heading-group">
          <span className="demo-flow-eyebrow">Preview heading</span>
          <h2 className="demo-flow-headline">TRY ONE COMPLETE PRINT FLOW.</h2>
          <p className="demo-flow-subtitle">
            The queue view and upload settings speak the same language: clear files, clear choices, clear status.
          </p>
        </div>

        {/* Live estimates card */}
        <div className="demo-flow-live-badge">
          <svg className="demo-badge-sparkle-icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L14.39 8.26L21 9.27L16 13.97L17.45 20.46L12 17.1L6.55 20.46L8 13.97L3 9.27L9.61 8.26L12 2Z"
              stroke="#7c3aed"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="demo-badge-text">
            <span>Live estimates refresh as printers finish</span>
            <span>each job.</span>
          </div>
        </div>
      </div>

      {/* Main Dual-Panel Prototype Frame */}
      <div className="demo-card-frame">
        {/* Left Purple Sidebar */}
        <aside className="demo-sidebar">
          <div className="demo-sidebar-top">
            <h3 className="demo-sidebar-brand">Printfy</h3>

            <nav className="demo-sidebar-nav" aria-label="Demo Steps">
              <button
                type="button"
                className={`demo-nav-item ${activeTab === 1 ? 'is-active' : ''}`}
                onClick={() => setActiveTab(1)}
              >
                <span className="demo-nav-number">1</span>
                <span className="demo-nav-label">Document details</span>
              </button>

              <button
                type="button"
                className={`demo-nav-item ${activeTab === 2 ? 'is-active' : ''}`}
                onClick={() => setActiveTab(2)}
              >
                <span className="demo-nav-number">2</span>
                <span className="demo-nav-label">Demo queue</span>
              </button>

              <button
                type="button"
                className={`demo-nav-item ${activeTab === 3 ? 'is-active' : ''}`}
                onClick={() => setActiveTab(3)}
              >
                <span className="demo-nav-number">3</span>
                <span className="demo-nav-label">Ready to collect</span>
              </button>
            </nav>
          </div>

          <div className="demo-sidebar-footer">
            <p className="demo-sidebar-note">Interactive prototype · no payment required</p>
          </div>
        </aside>

        {/* Right White Main Stage */}
        <main className="demo-main-stage">
          {/* TAB 1: DOCUMENT DETAILS (Exact Match to Screenshot) */}
          {activeTab === 1 && (
            <div className="demo-tab-content">
              <div className="demo-stage-header">
                <div className="demo-stage-title-wrap">
                  <span className="demo-stage-tag">STUDENT PRINT JOB</span>
                  <h4 className="demo-stage-title">Document details</h4>
                </div>
                <span className="demo-stage-location-pill">Campus Library</span>
              </div>

              {/* Document Info Card */}
              <div className="demo-doc-card">
                <div className="demo-doc-left">
                  <div className="demo-doc-icon-box">PDF</div>
                  <div className="demo-doc-info">
                    <span className="demo-doc-name">Assignment.pdf</span>
                    <span className="demo-doc-meta">12 pages · 2.4 MB</span>
                  </div>
                </div>
                <span className="demo-doc-privacy-pill">Private</span>
              </div>

              {/* 2x2 Form Selection Grid */}
              <div className="demo-form-grid">
                {/* Copies */}
                <div className="demo-select-field">
                  <label className="demo-field-label">Copies</label>
                  <div
                    className={`demo-dropdown-box ${openDropdown === 'copies' ? 'is-open' : ''}`}
                    onClick={() => toggleDropdown('copies')}
                  >
                    <span className="demo-dropdown-value">{copiesCount}</span>
                    <svg className="demo-dropdown-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openDropdown === 'copies' && (
                    <div className="demo-select-popover">
                      {[1, 2, 3, 5, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          className={`demo-option-item ${copiesCount === num ? 'is-selected' : ''}`}
                          onClick={() => {
                            setCopiesCount(num);
                            setOpenDropdown(null);
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Print Style */}
                <div className="demo-select-field">
                  <label className="demo-field-label">Print style</label>
                  <div
                    className={`demo-dropdown-box ${openDropdown === 'style' ? 'is-open' : ''}`}
                    onClick={() => toggleDropdown('style')}
                  >
                    <span className="demo-dropdown-value">{printStyle}</span>
                    <svg className="demo-dropdown-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openDropdown === 'style' && (
                    <div className="demo-select-popover">
                      {['Black & white', 'Full color'].map((style) => (
                        <button
                          key={style}
                          type="button"
                          className={`demo-option-item ${printStyle === style ? 'is-selected' : ''}`}
                          onClick={() => {
                            setPrintStyle(style);
                            setOpenDropdown(null);
                          }}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sides */}
                <div className="demo-select-field">
                  <label className="demo-field-label">Sides</label>
                  <div
                    className={`demo-dropdown-box ${openDropdown === 'sides' ? 'is-open' : ''}`}
                    onClick={() => toggleDropdown('sides')}
                  >
                    <span className="demo-dropdown-value">{sidesSelection}</span>
                    <svg className="demo-dropdown-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openDropdown === 'sides' && (
                    <div className="demo-select-popover">
                      {['Double-sided', 'Single-sided'].map((side) => (
                        <button
                          key={side}
                          type="button"
                          className={`demo-option-item ${sidesSelection === side ? 'is-selected' : ''}`}
                          onClick={() => {
                            setSidesSelection(side);
                            setOpenDropdown(null);
                          }}
                        >
                          {side}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Paper */}
                <div className="demo-select-field">
                  <label className="demo-field-label">Paper</label>
                  <div
                    className={`demo-dropdown-box ${openDropdown === 'paper' ? 'is-open' : ''}`}
                    onClick={() => toggleDropdown('paper')}
                  >
                    <span className="demo-dropdown-value">{paperSelection}</span>
                    <svg className="demo-dropdown-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openDropdown === 'paper' && (
                    <div className="demo-select-popover">
                      {['A4', 'Letter', 'A3'].map((paper) => (
                        <button
                          key={paper}
                          type="button"
                          className={`demo-option-item ${paperSelection === paper ? 'is-selected' : ''}`}
                          onClick={() => {
                            setPaperSelection(paper);
                            setOpenDropdown(null);
                          }}
                        >
                          {paper}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Total & Submit Button */}
              <div className="demo-stage-action-bar">
                <span className="demo-sample-total">
                  Sample total: Rs. {calculateTotal()}
                </span>
                <button
                  type="button"
                  className="demo-submit-pill-btn"
                  onClick={() => setActiveTab(2)}
                >
                  <span>Add to demo queue</span>
                  <span className="demo-arrow-icon">↗</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DEMO QUEUE */}
          {activeTab === 2 && (
            <div className="demo-tab-content">
              <div className="demo-stage-header">
                <div className="demo-stage-title-wrap">
                  <span className="demo-stage-tag">STUDENT PRINT JOB</span>
                  <h4 className="demo-stage-title">Demo queue</h4>
                </div>
                <span className="demo-stage-location-pill">Library North · 2 ahead</span>
              </div>

              {/* Queue Status Progress Banner */}
              <div className="demo-queue-summary-card">
                <div className="demo-queue-summary-header">
                  <div>
                    <span className="demo-queue-pos-label">Your position in queue</span>
                    <h5 className="demo-queue-pos-number">#2 in line</h5>
                  </div>
                  <div className="demo-queue-eta-badge">
                    <span>Est. wait: ~3 mins</span>
                  </div>
                </div>
                <div className="demo-queue-progress-bar">
                  <div className="demo-queue-progress-fill" style={{ width: '68%' }} />
                </div>
              </div>

              {/* Queue List Preview */}
              <div className="demo-queue-jobs-stream">
                <div className="demo-queue-row is-printing">
                  <div className="demo-queue-row-left">
                    <span className="demo-queue-order-num">1</span>
                    <div>
                      <span className="demo-queue-filename">Research_Draft_v2.pdf</span>
                      <span className="demo-queue-fileinfo">18 pages · Duplex · B&amp;W</span>
                    </div>
                  </div>
                  <span className="demo-queue-status-tag tag-printing">Printing</span>
                </div>

                <div className="demo-queue-row is-active-user-job">
                  <div className="demo-queue-row-left">
                    <span className="demo-queue-order-num">2</span>
                    <div>
                      <span className="demo-queue-filename">Assignment.pdf (Your Job)</span>
                      <span className="demo-queue-fileinfo">12 pages · {sidesSelection} · {printStyle}</span>
                    </div>
                  </div>
                  <span className="demo-queue-status-tag tag-next">Next up</span>
                </div>

                <div className="demo-queue-row">
                  <div className="demo-queue-row-left">
                    <span className="demo-queue-order-num">3</span>
                    <div>
                      <span className="demo-queue-filename">Lab_Report_Final.pdf</span>
                      <span className="demo-queue-fileinfo">6 pages · Color</span>
                    </div>
                  </div>
                  <span className="demo-queue-status-tag tag-queued">Queued</span>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="demo-stage-action-bar">
                <button
                  type="button"
                  className="demo-back-link-btn"
                  onClick={() => setActiveTab(1)}
                >
                  ← Edit document details
                </button>
                <button
                  type="button"
                  className="demo-submit-pill-btn"
                  onClick={() => setActiveTab(3)}
                >
                  <span>Simulate print completion</span>
                  <span className="demo-arrow-icon">↗</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: READY TO COLLECT */}
          {activeTab === 3 && (
            <div className="demo-tab-content">
              <div className="demo-stage-header">
                <div className="demo-stage-title-wrap">
                  <span className="demo-stage-tag">STUDENT PRINT JOB</span>
                  <h4 className="demo-stage-title">Ready to collect</h4>
                </div>
                <span className="demo-stage-location-pill pill-success">Locker 04 · Ready</span>
              </div>

              {/* Ready Confirmation Banner */}
              <div className="demo-ready-card">
                <div className="demo-ready-icon-circle">✓</div>
                <div className="demo-ready-text-wrap">
                  <h5 className="demo-ready-headline">Your document is printed and waiting!</h5>
                  <p className="demo-ready-subtext">Collect within 2 hours using your pickup code below.</p>
                </div>
              </div>

              {/* Pickup Verification Grid */}
              <div className="demo-pickup-details-grid">
                <div className="demo-pickup-cell">
                  <span className="demo-cell-label">Pickup Locker Code</span>
                  <span className="demo-cell-code">PF-8492</span>
                </div>
                <div className="demo-pickup-cell">
                  <span className="demo-cell-label">Location</span>
                  <span className="demo-cell-value">Library North · Express Bay 2</span>
                </div>
              </div>

              {/* Simulated Notification Box */}
              <div className="demo-sms-notice">
                <div className="demo-sms-header">
                  <span className="demo-sms-dot" />
                  <span className="demo-sms-title">Instant Notification Sent</span>
                </div>
                <p className="demo-sms-body">
                  &ldquo;Printfy Alert: Job Assignment.pdf is ready in Locker 04. Code: PF-8492.&rdquo;
                </p>
              </div>

              {/* Bottom Reset Demo Button */}
              <div className="demo-stage-action-bar">
                <button
                  type="button"
                  className="demo-submit-pill-btn"
                  onClick={() => setActiveTab(1)}
                >
                  <span>Try another print (Reset demo)</span>
                  <span className="demo-arrow-icon">↺</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Default export renders both components sequentially
export default function WorkflowSection() {
  return (
    <section className="workflow-section" id="workflow">
      <WorkflowStepsSection />
      <WorkflowDemoSection />
    </section>
  );
}
