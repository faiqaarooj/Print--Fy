import React from 'react';
import './AboutSection.css';

export default function AboutSection({ onExploreFeatures, onGetStarted }) {
  const handleScrollToFeatures = (e) => {
    e.preventDefault();
    if (onExploreFeatures) {
      onExploreFeatures();
      return;
    }
    const target = document.getElementById('features') || document.getElementById('workflow') || document.getElementById('live-queue-demo');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToDemo = (e) => {
    e.preventDefault();
    const target = document.getElementById('live-queue-demo') || document.getElementById('workflow');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="about-section"
      id="about"
      aria-labelledby="about-main-heading"
    >
      {/* Anchor for How It Works navigation links from Hero and Navbar */}
      <span id="how-it-works" className="about-anchor" aria-hidden="true" />

      <div className="about__container">
        {/* Left Column: Bold Headline, Subtitle, and Dual Pill Buttons */}
        <div className="about__content-col">
          {/* Main heading: exactly two lines */}
          <h2 id="about-main-heading" className="about__headline">
            <span className="about__headline-line">FROM CLICK</span>
            <span className="about__headline-line">TO COLLECTED</span>
          </h2>

          {/* Subtitle */}
          <p className="about__subtitle">
            Print-Fy Is Built For How Professionals & Students Actually Work
          </p>

          {/* Dual Action Buttons */}
          <div className="about__cta-group">
            <a
              href="#features"
              className="about__cta-primary"
              onClick={handleScrollToFeatures}
              aria-label="Explore the features of Printfy"
            >
              <span>Explore The Features</span>
              <span className="about__arrow" aria-hidden="true">→</span>
            </a>

            <a
              href="#live-queue-demo"
              className="about__cta-secondary"
              onClick={handleScrollToDemo}
              aria-label="View the demo of Printfy"
            >
              <span>View The Demo</span>
              <span className="about__arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Right Column: Dithered Stippled Printer Illustration */}
        <div className="about__visual-col">
          <div className="about__printer-frame">
            <img
              src="/screen3/printer.svg"
              alt="Dithered retro printer with paper ejecting"
              className="about__printer-img"
              loading="lazy"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
