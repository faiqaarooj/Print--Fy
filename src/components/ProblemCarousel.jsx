import { useState, useEffect, useRef } from 'react';
import './ProblemCarousel.css';

const QUEUE_STORY_SLIDES = [
  {
    id: 'waiting',
    num: '01',
    tabLabel: '01 The waiting',
    eyebrow: 'CAMPUS QUEUE DETOUR',
    titleLine1: 'Still waiting',
    titleLine2: 'in line?',
    bullets: [
      'Crowded campus counters, peak morning rushes, and sudden printer jams turn a quick print into a 25-minute detour.',
      'Rushing across campus between classes only to find the printer is busy or 15 jobs deep.',
      'Standing by the counter guessing when your assignment will finally be printed and handed over.',
    ],
    primaryCta: 'Start uploading',
    secondaryCta: 'See live queue demo',
    image: '/screen3/waiting.svg',
    alt: 'Students waiting in line at the campus printer counter',
  },
  {
    id: 'click',
    num: '02',
    tabLabel: '02 The click',
    eyebrow: 'MOBILE SUBMISSION',
    titleLine1: 'Your print shop.',
    titleLine2: 'In your pocket.',
    bullets: [
      'Choose your document, preferred station, and custom print specs directly from your phone or laptop.',
      'No thumb drives, no public desktop logins, and no exposed campus credentials.',
      'Set copies, color, duplex, and binding options in seconds with upfront transparent pricing.',
    ],
    primaryCta: 'Start uploading',
    secondaryCta: 'View print options',
    image: '/screen3/click.svg',
    alt: 'Student uploading document instantly on mobile device',
  },
  {
    id: 'journey',
    num: '03',
    tabLabel: '03 The journey',
    eyebrow: 'BACKGROUND PROCESSING',
    titleLine1: 'Your file goes ahead.',
    titleLine2: 'You carry on.',
    bullets: [
      "Your document joins the printer's queue while you get back to lectures, study groups, or coffee.",
      'Real-time queue tracking displays your exact place in line and estimated completion time.',
      'Printers warm up and produce your work with precision before you even step into the print shop.',
    ],
    primaryCta: 'Start uploading',
    secondaryCta: 'Track demo queue',
    image: '/screen3/journey.svg',
    alt: 'Document transmitting smoothly to the campus printer',
  },
  {
    id: 'collection',
    num: '04',
    tabLabel: '04 The collection',
    eyebrow: 'EFFORTLESS PICKUP',
    titleLine1: 'Ready on cue.',
    titleLine2: 'Just walk up & collect.',
    bullets: [
      'Receive an instant notification the second your pages are finished, bound, and ready.',
      'Arrive once, scan your verification QR code at the desk, grab your work, and go.',
      'Zero waiting time. No friction. Less waiting, more living.',
    ],
    primaryCta: 'Start uploading',
    secondaryCta: 'Try print flow',
    image: '/screen3/collection.svg',
    alt: 'Neatly organized documents ready for quick collection',
  },
];

export function QueueStorySection({ onStartUpload, onHowItWorks }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  // Auto-advance through the story every 7 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % QUEUE_STORY_SLIDES.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? QUEUE_STORY_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % QUEUE_STORY_SLIDES.length);
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartXRef.current = null;
  };

  const handlePrimaryClick = () => {
    if (onStartUpload) {
      onStartUpload();
      return;
    }
    const demoEl = document.getElementById('live-queue-demo') || document.getElementById('workflow');
    if (demoEl) {
      demoEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert('Navigating to Upload Workflow...');
    }
  };

  const handleSecondaryClick = () => {
    if (onHowItWorks) {
      onHowItWorks();
      return;
    }
    const demoEl = document.getElementById('live-queue-demo') || document.getElementById('workflow');
    if (demoEl) {
      demoEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentSlide = QUEUE_STORY_SLIDES[activeIdx];

  return (
    <section
      className="queue-story-section"
      id="queue-story"
      aria-label="Campus Queue Storytelling"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="queue-story-container">
        {/* Main 2-Column Story Stage on Pure White Canvas */}
        <div className="queue-story-stage">
          
          {/* Left Column: Bold Headline, Context Bullets, and Action Button */}
          <div className="queue-story-left">
            <span className="queue-story-eyebrow">
              {currentSlide.eyebrow}
            </span>

            <h2 className="queue-story-headline">
              <span className="queue-story-headline-line">{currentSlide.titleLine1}</span>{' '}
              <span className="queue-story-headline-line">{currentSlide.titleLine2}</span>
            </h2>

            {/* Bullet points explaining the detour of physical queues */}
            <ul className="queue-story-bullets" role="list">
              {currentSlide.bullets.map((bullet, idx) => (
                <li key={idx} className="queue-story-bullet-item">
                  <span className="queue-story-bullet-dot" aria-hidden="true" />
                  <span className="queue-story-bullet-text">{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Action Buttons Row */}
            <div className="queue-story-actions">
              {/* Primary Purple Action Button */}
              <button
                type="button"
                className="queue-story-btn-primary"
                onClick={handlePrimaryClick}
                aria-label={`${currentSlide.primaryCta} - start print job`}
              >
                <span>{currentSlide.primaryCta}</span>
                <span className="queue-story-btn-arrow" aria-hidden="true">→</span>
              </button>

              {/* Secondary Ghost Button */}
              <button
                type="button"
                className="queue-story-btn-secondary"
                onClick={handleSecondaryClick}
                aria-label={`${currentSlide.secondaryCta} - learn more`}
              >
                <span>{currentSlide.secondaryCta}</span>
                <span className="queue-story-secondary-arrow" aria-hidden="true">↗</span>
              </button>
            </div>
          </div>

          {/* Right Column: Illustration of students waiting in line with soft lavender backdrop accent */}
          <div className="queue-story-right">
            <div className="queue-story-visual-wrap">
              {/* Soft Lavender Backdrop Accent */}
              <div className="queue-story-backdrop-accent" aria-hidden="true" />

              {/* 3D Scene Illustration */}
              <div className={`queue-story-img-stage stage-${currentSlide.id}`} key={currentSlide.id}>
                <img
                  src={currentSlide.image}
                  alt={currentSlide.alt}
                  className={`queue-story-img img-${currentSlide.id}`}
                  loading="lazy"
                  draggable={false}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Story Progress Navigator (Subtle 4-Stage Pill Bar) */}
        <nav className="queue-story-nav" aria-label="Queue story phases">
          {QUEUE_STORY_SLIDES.map((slide, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={slide.id}
                type="button"
                className={`queue-story-tab ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveIdx(idx)}
                aria-current={isActive ? 'true' : 'false'}
              >
                <span className="queue-story-tab-text">{slide.tabLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
}

// Export both names for backwards compatibility
export default QueueStorySection;
export { QueueStorySection as ProblemCarousel };
