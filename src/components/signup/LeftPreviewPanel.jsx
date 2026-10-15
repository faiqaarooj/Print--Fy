import React, { useState, useEffect } from 'react';
import { signupSampleData } from '../../lib/signupSampleData';
import './LeftPreviewPanel.css';

/**
 * LeftPreviewPanel - Interactive Preview Dashboard showing Print-Fy live queue metrics.
 * Features:
 * - Live animated simulated printing progress with shimmer
 * - Interactive job selection / click to view details
 * - Pulsing status radar badge on the active production printer
 * - Smooth anti-gravity hover lift & glow transitions
 */
export default function LeftPreviewPanel() {
  const {
    printQueue,
    nextUp,
    printingNow,
    queueTimeline,
    labReport,
    onTimeRate,
    liveQueue,
  } = signupSampleData;

  // Interactive state
  const [activeJobId, setActiveJobId] = useState('now');
  const [liveProgress, setLiveProgress] = useState(printingNow.progressPercent);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Subtle real-time live pulse for printing progress
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveProgress((prev) => (prev >= 98 ? 64 : prev + 1));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="left-preview-panel" aria-label="Live Print Queue Preview">
      {/* Row 1: Print Queue (167px) + Next Up (390px) */}
      <div className="preview-row-1">
        {/* Card 1: Print Queue */}
        <div
          className={`preview-card preview-card-queue interactive-card ${
            hoveredCard === 'queue' ? 'card-hovered' : ''
          }`}
          onMouseEnter={() => setHoveredCard('queue')}
          onMouseLeave={() => setHoveredCard(null)}
          tabIndex={0}
          role="region"
          aria-label="Print Queue status"
          data-node-id="101:13018"
        >
          <div className="queue-top">
            <div className="queue-icon-box">
              <img src="/assets/printer_icon.svg" alt="" />
            </div>
            <div className="queue-meta">
              <span className="badge-purple">{printQueue.title}</span>
              <span className="queue-count">{printQueue.count}</span>
            </div>
          </div>
          <div className="queue-footer">
            <span className="queue-total">{printQueue.totalTime}</span>
            <span className="live-chip">● Live</span>
          </div>
        </div>

        {/* Card 2: Next Up */}
        <div
          className={`preview-card preview-card-nextup interactive-card ${
            activeJobId === 'next' ? 'card-active-glow' : ''
          } ${hoveredCard === 'next' ? 'card-hovered' : ''}`}
          onMouseEnter={() => setHoveredCard('next')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => setActiveJobId('next')}
          tabIndex={0}
          role="button"
          aria-label={`Next up file: ${nextUp.fileName}`}
          data-node-id="101:13027"
        >
          <div className="nextup-header">
            <div className="nextup-header-left">
              <img src="/assets/file_icon.svg" alt="" className="nextup-icon" />
              <span className="badge-purple">{nextUp.badge}</span>
            </div>
            <div className="time-pill">
              <img src="/assets/clock_icon.svg" alt="" />
              <span>{nextUp.time}</span>
            </div>
          </div>
          <p className="nextup-title">{nextUp.fileName}</p>
          <p className="nextup-details">{nextUp.specifications}</p>
        </div>
      </div>

      {/* Row 2: Printing Now (431px) */}
      <div
        className={`preview-card preview-card-printing interactive-card ${
          activeJobId === 'now' ? 'card-active-glow' : ''
        } ${hoveredCard === 'printing' ? 'card-hovered' : ''}`}
        onMouseEnter={() => setHoveredCard('printing')}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => setActiveJobId('now')}
        tabIndex={0}
        role="button"
        aria-label={`Printing now: ${printingNow.fileName}, ${liveProgress}% completed`}
        data-node-id="101:13040"
      >
        <div className="printing-header">
          <div className="nextup-header-left">
            <img src="/assets/printer_icon1.svg" alt="" className="nextup-icon" />
            <span className="badge-green">{printingNow.badge}</span>
          </div>
          <span className="printing-remaining">{printingNow.timeRemaining}</span>
        </div>
        <p className="printing-title">{printingNow.fileName}</p>
        <div className="printing-progress-row">
          <span className="progress-pct">{liveProgress}%</span>
          <div className="progress-track">
            <div
              className="progress-fill animated-shimmer"
              style={{ width: `${liveProgress}%` }}
            />
          </div>
          <span className="printing-eta">{printingNow.eta}</span>
        </div>
      </div>

      {/* Row 3: Queue Timeline (403px, offset right) */}
      <div className="preview-row-3">
        <div
          className={`preview-card preview-card-timeline interactive-card ${
            hoveredCard === 'timeline' ? 'card-hovered' : ''
          }`}
          onMouseEnter={() => setHoveredCard('timeline')}
          onMouseLeave={() => setHoveredCard(null)}
          tabIndex={0}
          role="region"
          aria-label="Queue Timeline"
          data-node-id="101:13052"
        >
          <img
            src="/assets/timeline_cmyk.png"
            alt=""
            className="timeline-bg-img"
          />
          <div className="timeline-overlay" />
          <div className="timeline-content">
            <div className="timeline-header">
              <img src="/assets/clock_icon1.svg" alt="" className="nextup-icon" />
              <span className="badge-purple">{queueTimeline.badge}</span>
            </div>
            <p className="timeline-heading">{queueTimeline.heading}</p>
            <p className="timeline-summary">{queueTimeline.summary}</p>
          </div>
        </div>
      </div>

      {/* Row 4: Lab Report (341px) + On-Time Rate (219px) */}
      <div className="preview-row-4">
        {/* Card 5: Lab Report */}
        <div
          className={`preview-card preview-card-lab interactive-card ${
            activeJobId === 'later' ? 'card-active-glow' : ''
          } ${hoveredCard === 'lab' ? 'card-hovered' : ''}`}
          onMouseEnter={() => setHoveredCard('lab')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => setActiveJobId('later')}
          tabIndex={0}
          role="button"
          aria-label={`Lab Report: ${labReport.title}`}
          data-node-id="101:13061"
        >
          <div className="lab-title-row">
            <img src="/assets/file_icon.svg" alt="" className="nextup-icon" />
            <p className="lab-title">{labReport.title}</p>
          </div>
          <p className="lab-details">{labReport.details}</p>
          <div className="lab-divider" />
          <div className="lab-stats-row">
            <div className="stat-item">
              <span className="stat-label">{labReport.startsLabel}</span>
              <span className="stat-val">{labReport.startTime}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{labReport.durationLabel}</span>
              <span className="stat-val">{labReport.durationTime}</span>
            </div>
          </div>
        </div>

        {/* Card 6: On-Time Rate */}
        <div
          className={`preview-card preview-card-ontime interactive-card ${
            hoveredCard === 'ontime' ? 'card-hovered' : ''
          }`}
          onMouseEnter={() => setHoveredCard('ontime')}
          onMouseLeave={() => setHoveredCard(null)}
          tabIndex={0}
          role="region"
          aria-label={`On time rate ${onTimeRate.rate}`}
          data-node-id="101:13073"
        >
          <div className="ontime-header">
            <img src="/assets/check_icon.svg" alt="" className="nextup-icon" />
            <span className="badge-purple">{onTimeRate.badge}</span>
          </div>
          <div className="ontime-body">
            <span className="ontime-rate">{onTimeRate.rate}</span>
            <div className="ontime-progress-track">
              <div
                className="ontime-progress-fill"
                style={{ width: `${onTimeRate.progressPercent}%` }}
              />
            </div>
          </div>
          <span className="ontime-footer">{onTimeRate.timeframe}</span>
        </div>
      </div>

      {/* Row 5: Production Printer Live queue (575px, full width) */}
      <div
        className={`preview-card preview-card-livequeue interactive-card ${
          hoveredCard === 'livequeue' ? 'card-hovered' : ''
        }`}
        onMouseEnter={() => setHoveredCard('livequeue')}
        onMouseLeave={() => setHoveredCard(null)}
        tabIndex={0}
        role="region"
        aria-label="Production Printer live schedule"
        data-node-id="101:13083"
      >
        <img
          src="/assets/printer_bg.png"
          alt=""
          className="livequeue-bg-img"
        />
        <div className="livequeue-overlay" />
        <div className="livequeue-content">
          <div className="livequeue-top">
            <div className="livequeue-meta">
              <span className="livequeue-printer">{liveQueue.printerName}</span>
              <h2 className="livequeue-heading">{liveQueue.heading}</h2>
            </div>
            <div className="status-running-pill">
              <span className="status-running-pulse">
                <span className="pulse-dot" />
                <span className="pulse-ring" />
              </span>
              <span>{liveQueue.statusBadge}</span>
            </div>
          </div>

          <div className="livequeue-table-box">
            {/* Row 1: NOW */}
            <div
              className={`table-row interactive-table-row ${
                activeJobId === 'now' ? 'row-active' : ''
              }`}
              onClick={() => setActiveJobId('now')}
            >
              <span className="table-tag">{liveQueue.currentJob.tag}</span>
              <span className="table-name">{liveQueue.currentJob.name}</span>
              <span className="table-time">{liveQueue.currentJob.time}</span>
            </div>
            <div className="now-progress-track">
              <div
                className="now-progress-fill animated-shimmer"
                style={{ width: `${liveProgress}%` }}
              />
            </div>

            {/* Row 2: NEXT */}
            <div
              className={`table-row interactive-table-row ${
                activeJobId === 'next' ? 'row-active' : ''
              }`}
              onClick={() => setActiveJobId('next')}
            >
              <span className="table-tag">{liveQueue.nextJob.tag}</span>
              <span className="table-name">{liveQueue.nextJob.name}</span>
              <span className="table-time">{liveQueue.nextJob.time}</span>
            </div>

            {/* Row 3: LATER */}
            <div
              className={`table-row interactive-table-row ${
                activeJobId === 'later' ? 'row-active' : ''
              }`}
              onClick={() => setActiveJobId('later')}
            >
              <span className="table-tag">{liveQueue.laterJob.tag}</span>
              <span className="table-name">{liveQueue.laterJob.name}</span>
              <span className="table-time">{liveQueue.laterJob.time}</span>
            </div>

            {/* Row 4: ESTIMATED */}
            <div className="table-footer-row">
              <span className="table-footer-label">
                {liveQueue.estimatedCompletionLabel}
              </span>
              <span className="table-footer-eta">
                {liveQueue.estimatedCompletionTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
