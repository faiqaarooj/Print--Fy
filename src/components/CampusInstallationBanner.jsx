import React from 'react';
import { motion } from 'framer-motion';
import './CampusInstallationBanner.css';

/**
 * CampusInstallationBanner Component
 * Figma Node: 383:24217, 395:25491, 395:25492, 395:25495
 * Displays the campus installation callout banner with custom printer artwork,
 * "FOR CAMPUS INSTALLATION" headline, and "Contact Our Team →" action.
 */
export default function CampusInstallationBanner({ onContact }) {
  const handleContactClick = (e) => {
    e.preventDefault();
    if (onContact) {
      onContact();
    } else {
      window.location.hash = '#contact';
      try {
        window.history.pushState({}, '', '/contact');
      } catch {
        // Fallback
      }
    }
  };

  return (
    <section
      className="campus-installation-section"
      data-node-id="395:25491"
      aria-label="For Campus Installation"
    >
      <div className="campus-installation-container">
        {/* Left Column: Interactive 3D/Physical Printer Artwork (Figma Node 383:24217) */}
        <div className="campus-printer-column" aria-hidden="true">
          <motion.div
            className="printer-artwork-canvas"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="printer-assembly" data-node-id="383:24217">
              {/* Bottom Support Feet (Layer 1) */}
              <div className="printer-feet-container" data-node-id="383:24218">
                <div className="printer-foot printer-foot-left" data-node-id="383:24219" />
                <div className="printer-foot printer-foot-right" data-node-id="383:24220" />
              </div>

              {/* Lower Body & Output Bay (Layer 2) */}
              <div className="printer-lower-body" data-node-id="383:24221">
                <div className="printer-lower-gradient" />
                <div className="printer-output-cavity" data-node-id="383:24222" />
              </div>

              {/* Upper Main Shell & Control Panel (Layer 3) */}
              <div className="printer-upper-body" data-node-id="383:24223">
                <div className="printer-upper-gradient" />

                {/* Top Feed Intake Slot */}
                <div className="printer-feed-slot" data-node-id="383:24224" />

                {/* Status Screen: PRINTFY READY */}
                <div className="printer-lcd-screen" data-node-id="383:24225">
                  <span className="printer-lcd-text" data-node-id="383:24226">
                    PRINTFY READY
                  </span>
                </div>

                {/* Hardware Push Buttons */}
                <div className="printer-buttons-cluster" data-node-id="383:24227">
                  <div className="printer-hardware-btn" data-node-id="383:24228" />
                  <div className="printer-hardware-btn" data-node-id="383:24229" />
                  <div className="printer-hardware-btn" data-node-id="383:24230" />
                </div>
              </div>

              {/* Printed Sheet: LET'S TALK with Anti-Gravity Float Effect (Layer 4) */}
              <motion.div
                className="printer-paper-sheet"
                data-node-id="383:24231"
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="paper-headline" data-node-id="383:24232">
                  <span className="paper-headline-text" data-node-id="383:24233">
                    LET’S
                  </span>
                </div>
                <div className="paper-headline" data-node-id="383:24234">
                  <span className="paper-headline-text" data-node-id="383:24235">
                    TALK.
                  </span>
                </div>

                {/* Purple Print-Fy "P" Badge */}
                <div className="paper-brand-badge" data-node-id="383:24236">
                  <span className="paper-brand-letter" data-node-id="383:24237">
                    P
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Callout Copy & Action (Figma Nodes 395:25492, 395:25495) */}
        <div className="campus-copy-column">
          <motion.div
            className="campus-copy-wrapper"
            data-node-id="395:25492"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="campus-headline" data-node-id="395:25493">
              FOR CAMPUS INSTALLATION
            </h2>
            <p className="campus-description" data-node-id="395:25494">
              We’ll install the software into your printing station.
            </p>

            <div className="campus-action-wrapper" data-node-id="395:25495">
              <button
                type="button"
                className="campus-contact-btn"
                onClick={handleContactClick}
                aria-label="Contact our team for campus installation"
              >
                <span>Contact Our Team</span>
                <span className="campus-btn-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
