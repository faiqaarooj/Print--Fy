import { useState, useEffect, useRef } from 'react';
import ProblemCarousel from './ProblemCarousel';
import { WorkflowDemoSection } from './WorkflowSection';
import './FeaturesSection.css';

export default function FeaturesSection({ onGetStarted }) {
  const sectionRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`features-wrapper ${isRevealed ? 'is-revealed' : ''}`}
      id="features"
      ref={sectionRef}
    >
      {/* Anchor targets */}
      <span id="screen3" className="features-anchor" aria-hidden="true" />
      <span id="workflow" className="features-anchor" aria-hidden="true" />

      {/* Phase 3: Interactive Demo Section ("TRY ONE COMPLETE PRINT FLOW.") on Cosmic Purple Canvas */}
      <section className="features-demo-container" aria-label="Product Demo">
        {/* Background Architecture */}
        <div className="features-bg-effects" aria-hidden="true">
          <img
            src="/screen3/3background.svg"
            alt=""
            className="features-bg-stars"
          />
          <div className="features-ambient-glow" />
        </div>

        <div className="features-demo-stage">
          <WorkflowDemoSection />
        </div>
      </section>

      {/* Phase 4: Queue Storytelling ("Still waiting in line?") on Pure White Canvas */}
      <div className="features-story-stage">
        <ProblemCarousel onStartUpload={onGetStarted} />
      </div>
    </div>
  );
}
