import { useState, useEffect, useRef } from 'react';
import './HeroSection.css';

const PRODUCT_MESSAGES = [
  'Upload your files',
  'Track your print',
  'Collect when ready'
];

const HERO_PARTICLES = [
  { id: 1, top: '8%', left: '10%', size: '18px', delay: '0s', dur: '4.2s' },
  { id: 2, top: '16%', right: '28%', size: '14px', delay: '1.4s', dur: '5.1s' },
  { id: 3, top: '22%', left: '20%', size: '20px', delay: '0.7s', dur: '4.6s' },
  { id: 4, top: '30%', right: '12%', size: '15px', delay: '2.2s', dur: '5.8s' },
  { id: 5, top: '44%', left: '14%', size: '17px', delay: '1.1s', dur: '4.4s' },
  { id: 6, top: '50%', right: '22%', size: '16px', delay: '2.5s', dur: '5.3s' },
  { id: 7, top: '62%', left: '28%', size: '19px', delay: '0.4s', dur: '4.8s' },
  { id: 8, top: '70%', right: '32%', size: '15px', delay: '1.8s', dur: '5.6s' },
  { id: 9, top: '28%', left: '6%', size: '21px', delay: '2.0s', dur: '4.3s' },
  { id: 10, top: '14%', right: '8%', size: '16px', delay: '0.9s', dur: '5.0s' },
];

export default function HeroSection({
  onStartUpload,
  onHowItWorks,
  onSignUp,
  onNavigatePricing,
  onNavigateCampusPricing,
  onNavigateContact,
  onNavigateFeatures,
  onNavigateDashboard,
}) {
  const heroRef = useRef(null);
  const mascotRef = useRef(null);

  // Typing Product Story state
  const [msgIndex, setMsgIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Pricing Dropdown state & outside click handler
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const pricingRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pricingRef.current && !pricingRef.current.contains(e.target)) {
        setIsPricingOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPricingOpen(false);
      }
    };

    if (isPricingOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPricingOpen]);

  // 1. Typing / Rotating Product Story logic
  useEffect(() => {
    const currentFullText = PRODUCT_MESSAGES[msgIndex];
    const typingSpeed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        const nextChunk = currentFullText.substring(0, displayText.length + 1);
        setDisplayText(nextChunk);

        if (nextChunk === currentFullText) {
          setTimeout(() => setIsDeleting(true), 1600);
        }
      } else {
        const nextChunk = currentFullText.substring(0, displayText.length - 1);
        setDisplayText(nextChunk);

        if (nextChunk === '') {
          setIsDeleting(false);
          setMsgIndex((prev) => (prev + 1) % PRODUCT_MESSAGES.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, msgIndex]);

  // 2. High-Performance rAF Cursor Interaction & Parallax
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    let rafId = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let proximityGlow = 0;

    const handleMouseMove = (e) => {
      const rect = heroEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized coordinates from -1 to 1
      targetX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
      targetY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

      // Calculate proximity to Mascot center
      if (mascotRef.current) {
        const mascotRect = mascotRef.current.getBoundingClientRect();
        const mascotCenterX = mascotRect.left + mascotRect.width / 2;
        const mascotCenterY = mascotRect.top + mascotRect.height / 2;
        const dist = Math.hypot(e.clientX - mascotCenterX, e.clientY - mascotCenterY);
        const maxDist = 450;
        proximityGlow = Math.max(0, Math.min(1, 1 - dist / maxDist));
      }
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
      proximityGlow = 0;
    };

    // Smooth lerp rendering loop
    const renderLoop = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      heroEl.style.setProperty('--mouse-x', currentX.toFixed(4));
      heroEl.style.setProperty('--mouse-y', currentY.toFixed(4));
      heroEl.style.setProperty('--proximity-glow', proximityGlow.toFixed(3));

      rafId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    heroEl.addEventListener('mouseleave', handleMouseLeave);
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      heroEl.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="hero-section" ref={heroRef}>
      {/* Background Effects: Deep Cosmic Gradient, Starfield Parallax, Hero Glow & Shooting Stars */}
      <div className="background-effects" aria-hidden="true">
        {/* Rich Cosmic Purple Gradient Mesh */}
        <div className="bg-gradient-mesh" />

        {/* Radiant Center Glow behind Mascot & Stage */}
        <div className="hero-center-glow" />

        {/* Atmospheric Glow SVG Layer */}
        <img
          src="/background/glow.svg"
          alt=""
          className="bg-glow-layer"
        />

        {/* Brightened Starfield Layer */}
        <img
          src="/background/stars.svg"
          alt=""
          className="bg-stars-layer"
        />

        {/* Diagonal Shooting Star / Meteor Streaks */}
        <img
          src="/background/arrow.svg"
          alt=""
          className="hero-shooting-star shooting-star-1"
        />
        <img
          src="/background/arrow.svg"
          alt=""
          className="hero-shooting-star shooting-star-2"
        />
        <img
          src="/background/arrow.svg"
          alt=""
          className="hero-shooting-star shooting-star-3"
        />

        {/* Sparkling 4-point Star Particles */}
        <div className="hero-particles-layer">
          {HERO_PARTICLES.map((p) => (
            <img
              key={p.id}
              src="/background/particles.svg"
              alt=""
              className="hero-particle-svg"
              style={{
                top: p.top,
                left: p.left,
                right: p.right,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.dur,
              }}
            />
          ))}
        </div>

        {/* Seamless Soft Fade Transition to Next Section */}
        <div className="hero-bottom-transition" />
      </div>

      {/* Header / Navbar */}
      <header className="navbar">
        {/* Brand Logo */}
        <div className="brand-container">
          <img
            src="/logo/printfy-logo.svg"
            alt="Print-Fy"
            className="brand-logo-img"
          />
          <span className="brand-title">Print-Fy</span>
        </div>

        {/* Announcement Glass Bar */}
        <div className="announcement-pill">
          <div className="announcement-left">
            <img
              src="/background/icon-announce.svg"
              alt="Live Status"
              className="announcement-badge-icon"
            />
            <span className="announcement-msg">
              Never Stand in the Printing Line Again.
            </span>
          </div>

          <div className="announcement-actions">
            <a href="#about" className="announcement-get-link">
              Get Started
            </a>
            <button
              type="button"
              className="announcement-auth-btn"
              onClick={() => (onSignUp ? onSignUp() : alert('Moving to SignUp/Login...'))}
            >
              SignUp/Login
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="nav-menu" aria-label="Main Navigation">
          <a
            href="#dashboard"
            className="nav-item"
            onClick={(e) => {
              if (onNavigateDashboard) {
                e.preventDefault();
                onNavigateDashboard();
              }
            }}
          >
            Dashboard
          </a>
          <a href="#about" className="nav-item">About</a>
          <a
            href="#features"
            className="nav-item"
            onClick={(e) => {
              if (onNavigateFeatures) {
                e.preventDefault();
                onNavigateFeatures();
              }
            }}
          >
            Features
          </a>

          {/* Pricing with Dropdown */}
          <div className="nav-pricing-wrap" ref={pricingRef}>
            <button
              type="button"
              className={`nav-item nav-pricing-btn ${isPricingOpen ? 'is-active' : ''}`}
              onClick={() => setIsPricingOpen((prev) => !prev)}
              aria-expanded={isPricingOpen}
              aria-haspopup="true"
              aria-label="Pricing Menu"
            >
              <span>Pricing</span>
              <svg
                className={`nav-chevron-icon ${isPricingOpen ? 'is-rotated' : ''}`}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isPricingOpen && (
              <div className="nav-pricing-dropdown" role="menu">
                <a
                  href="/pricing/students"
                  className="nav-dropdown-option"
                  role="menuitem"
                  onClick={(e) => {
                    setIsPricingOpen(false);
                    e.preventDefault();
                    if (onNavigatePricing) {
                      onNavigatePricing('students');
                    } else {
                      const el = document.getElementById('pricing-students') || document.getElementById('pricing');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <span className="dropdown-opt-label">For Students</span>
                  <span className="dropdown-opt-desc">Print rates &amp; bulk options</span>
                </a>

                <a
                  href="/pricing/universities"
                  className="nav-dropdown-option"
                  role="menuitem"
                  onClick={(e) => {
                    setIsPricingOpen(false);
                    e.preventDefault();
                    if (onNavigatePricing) {
                      onNavigatePricing('universities');
                    } else if (onNavigateCampusPricing) {
                      onNavigateCampusPricing();
                    } else {
                      const el = document.getElementById('pricing-universities') || document.getElementById('pricing');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <span className="dropdown-opt-label">For Universities</span>
                  <span className="dropdown-opt-desc">Campus plans &amp; deployment</span>
                </a>
              </div>
            )}
          </div>

          <a
            href="#contact"
            className="nav-item"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigateContact) {
                onNavigateContact();
              } else {
                const contactEl = document.getElementById('contact');
                if (contactEl) {
                  contactEl.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.hash = '#contact';
                }
              }
            }}
          >
            Contact
          </a>
          <a
            href="#faq"
            className="nav-item"
            onClick={(e) => {
              e.preventDefault();
              const faqEl = document.getElementById('faq') || document.getElementById('pricing-faq');
              if (faqEl) {
                faqEl.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.hash = '#faq';
              }
            }}
          >
            FAQ
          </a>
        </nav>
      </header>

      {/* Main Hero Content Stage */}
      <div className="hero-stage">
        {/* Mascot Centerpiece with Anti-Gravity Float & Cursor Look/Tilt Reaction */}
        <div className="mascot-stage" ref={mascotRef}>
          {/* Reactive Proximity Aura */}
          <div className="mascot-ambient-aura" />

          {/* Floating Anti-Gravity Rig */}
          <div className="mascot-float-rig">
            {/* 3D Cursor Leaning & Tilting Rig */}
            <div className="mascot-tilt-rig">
              <img
                src="/mascot/mascot.svg"
                alt="Print-Fy Intelligent Assistant Mascot"
                className="mascot-visual"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Product Story Typing Display */}
        <div className="product-story">
          <h1 className="product-headline">
            <span className="typing-phrase">{displayText}</span>
            <span className="typing-cursor" aria-hidden="true">|</span>
          </h1>
          <p className="product-subtext">
            Send your print jobs from your dorm, classroom, or on the go — track queue progress live and collect when ready.
          </p>
        </div>

        {/* CTA Action Buttons */}
        <div className="hero-action-group">
          <button
            type="button"
            className="cta-primary-btn"
            onClick={() => (onStartUpload ? onStartUpload() : alert('Starting Upload Workflow...'))}
          >
            <span className="cta-btn-text">Start Uploading</span>
            <span className="cta-btn-arrow" aria-hidden="true">→</span>
          </button>

          <a
            href="#how-it-works"
            className="cta-secondary-link"
            onClick={(e) => {
              if (onHowItWorks) {
                e.preventDefault();
                onHowItWorks();
              }
            }}
          >
            <span>How It Works</span>
            <span className="cta-link-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
