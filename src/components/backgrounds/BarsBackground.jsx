import React from 'react';
import './BarsBackground.css';

/**
 * Reusable BarsBackground component for Auth pages (SignUp, Login, ForgotPassword, OTP, ResetPassword).
 * Renders 3 layers strictly below content:
 * Layer 1: Base cosmic background + starfield
 * Layer 2: Atmospheric vertical glow (mix-blend-lighten SVG)
 * Layer 3: Vertical pills cluster (5 rounded gradient bars with glowing center)
 *
 * For centered Auth pages (variant="spread"), two bar clusters flank the centered card
 * across the viewport as seen in the Figma design (node 402:26447 / Frame 13920).
 */
export default function BarsBackground({ variant = 'single' }) {
  const isSpread = variant === 'spread' || variant === 'dual' || variant === 'auth';

  return (
    <div className={`bars-bg-root ${isSpread ? 'bars-bg-spread-mode' : ''}`} aria-hidden="true">
      {/* Layer 1: Base Background */}
      <div className="bars-bg-deep" />
      <img
        src="/background/stars.svg"
        alt=""
        className="bars-bg-stars"
        loading="lazy"
        decoding="async"
      />

      {/* Layer 2: Atmospheric Glow */}
      <img
        src="/assets/glow.svg"
        alt=""
        className="bars-bg-glow"
        loading="lazy"
        decoding="async"
      />

      {/* Layer 3: Vertical Bars (Frame 13920 / Group 71: 5 pills per cluster) */}
      {isSpread ? (
        <div className="bars-spread-wrapper">
          {/* Left Cluster: Group 71 (Pills 1-5) */}
          <div className="bars-cluster-container bars-cluster-left">
            <div className="bar-pill bar-pill-1" data-node-id="402:26450" />
            <div className="bar-pill bar-pill-2" data-node-id="402:26451" />
            <div className="bar-pill bar-pill-3" data-node-id="402:26452" />
            <div className="bar-pill bar-pill-4" data-node-id="402:26448" />
            <div className="bar-pill bar-pill-5" data-node-id="402:26449" />
          </div>

          {/* Right Cluster: Group 73 (Pills 1-5) */}
          <div className="bars-cluster-container bars-cluster-right">
            <div className="bar-pill bar-pill-1" data-node-id="402:26450" />
            <div className="bar-pill bar-pill-2" data-node-id="402:26451" />
            <div className="bar-pill bar-pill-3" data-node-id="402:26452" />
            <div className="bar-pill bar-pill-4" data-node-id="402:26448" />
            <div className="bar-pill bar-pill-5" data-node-id="402:26449" />
          </div>
        </div>
      ) : (
        <div className="bars-cluster-container">
          <div className="bar-pill bar-pill-1" data-node-id="402:26450" />
          <div className="bar-pill bar-pill-2" data-node-id="402:26451" />
          <div className="bar-pill bar-pill-3" data-node-id="402:26452" />
          <div className="bar-pill bar-pill-4" data-node-id="402:26448" />
          <div className="bar-pill bar-pill-5" data-node-id="402:26449" />
        </div>
      )}
    </div>
  );
}
