import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../lib/api';
import './AIStudioView.css';

export default function AIStudioView({
  pendingDocument,
  onApplyOptimization,
  onProceedToPrint,
}) {
  const [selectedFileName, setSelectedFileName] = useState(
    pendingDocument?.name || 'Operating_Systems_Project.pdf'
  );
  const [pageCount, setPageCount] = useState(
    pendingDocument?.pages || 14
  );
  const [colorMode, setColorMode] = useState(
    pendingDocument?.colorMode || 'B&W'
  );
  const [duplexMode, setDuplexMode] = useState(
    pendingDocument?.duplex || 'Single-sided'
  );

  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rushData, setRushData] = useState(null);

  // Copilot Chat State
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hi Faiqa! I'm your Print-Fy AI Copilot. I've analyzed your document. Ask me for exam summaries, tough formula breakdowns, or how to optimize print costs!",
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Load Analysis
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const data = await api.analyzeDocument({
        fileName: selectedFileName,
        pages: pageCount,
        colorMode,
        duplex: duplexMode,
      });
      setAnalysis(data);
    } catch (e) {
      console.warn('AI analysis fallback', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load Rush Prediction
  useEffect(() => {
    runAnalysis();
    api.getRushPrediction().then((res) => {
      if (res) setRushData(res);
    }).catch(() => {});
  }, [selectedFileName, pageCount, colorMode, duplexMode]);

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput('');
    setIsTyping(true);

    try {
      const res = await api.askStudyCopilot(textToSend, selectedFileName);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res?.reply || "I've reviewed this topic. Make sure to review the core formulas before your campus exam!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "Here is your quick summary: Review definitions, state constraints, and the Banker's algorithm invariants.",
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ai-studio-root">
      {/* Cinematic Hero Header */}
      <motion.div
        className="ai-hero-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="ai-badge-row">
          <span className="ai-hackathon-pill">⚡ HACKATHON INNOVATION</span>
          <span className="ai-model-tag">ENGINE: PrintFy-CampusNeuro v2.6</span>
        </div>
        <h1 className="ai-headline">
          Autonomous Print Optimizer <span className="highlight-yellow">&amp; Study Copilot</span>
        </h1>
        <p className="ai-subtitle">
          Engineered for university students. Cut print costs up to 50%, generate 1-page exam cheat sheets with 1 click, and forecast campus printer rush hours with zero guesswork.
        </p>

        {/* Quick Sample Selector */}
        <div className="ai-document-selector">
          <span className="selector-label">Active Document:</span>
          {[
            'Operating_Systems_Project.pdf',
            'Distributed_Systems_Midterm.pdf',
            'Deep_Learning_Lecture_Slides.pdf',
          ].map((sample) => (
            <button
              key={sample}
              type="button"
              className={`doc-pill-btn ${selectedFileName === sample ? 'active' : ''}`}
              onClick={() => {
                setSelectedFileName(sample);
                setPageCount(sample.includes('Deep') ? 24 : 14);
              }}
            >
              {sample}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Grid: 2 Columns */}
      <div className="ai-grid-layout">
        {/* LEFT COLUMN: Smart Cost Optimizer & Rush Prediction */}
        <div className="ai-col-left">
          {/* Smart Shrink & Cost Card */}
          <motion.div
            className="ai-card cost-optimizer-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="card-header-bar">
              <div className="card-title-group">
                <span className="card-icon">💡</span>
                <h3>Smart-Shrink Cost Analyzer</h3>
              </div>
              {analysis && (
                <span className="savings-pill">
                  Save Rs. {analysis.estimatedSavingsRs}
                </span>
              )}
            </div>

            {analysis ? (
              <div className="analysis-content">
                <div className="stats-comparison-grid">
                  <div className="stat-box original">
                    <span className="stat-label">Standard Print</span>
                    <span className="stat-val">{analysis.originalPages} Pages</span>
                    <span className="stat-sub">Rs. {analysis.standardCost}</span>
                  </div>
                  <div className="stat-arrow">→</div>
                  <div className="stat-box optimized">
                    <span className="stat-label">AI Optimized</span>
                    <span className="stat-val highlight-yellow">{analysis.optimizedPages} Pages</span>
                    <span className="stat-sub">Rs. {analysis.optimizedCost}</span>
                  </div>
                  <div className="stat-box eco">
                    <span className="stat-label">Eco Impact</span>
                    <span className="stat-val">{analysis.paperSavedSheets} Sheets Saved</span>
                    <span className="stat-sub">-{analysis.co2ReductionGrams}g CO₂</span>
                  </div>
                </div>

                <div className="recommendations-list">
                  <h4 className="rec-title">AI Print Recommendations:</h4>
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className={`rec-item ${rec.recommended ? 'recommended' : ''}`}>
                      <div className="rec-check">✓</div>
                      <div className="rec-info">
                        <strong>{rec.title}</strong>
                        <p>{rec.description}</p>
                      </div>
                      {rec.savingsRs > 0 && (
                        <span className="rec-savings">+Rs. {rec.savingsRs} saved</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="ai-actions-row">
                  <button
                    type="button"
                    className="ai-apply-btn"
                    onClick={() => {
                      if (onApplyOptimization) {
                        onApplyOptimization({
                          pages: analysis.optimizedPages,
                          cost: analysis.optimizedCost,
                          colorMode: 'B&W',
                          duplex: 'Double-sided',
                        });
                      }
                      alert(`✅ AI Optimization applied! Reduced to ${analysis.optimizedPages} pages. Your print fee is now Rs. ${analysis.optimizedCost}.`);
                    }}
                  >
                    <span>Apply AI 2-Up Optimization</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="loading-state">Analyzing document layout and toner density...</div>
            )}
          </motion.div>

          {/* Campus Kiosk Rush Predictor Card */}
          <motion.div
            className="ai-card rush-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="card-header-bar">
              <div className="card-title-group">
                <span className="card-icon">⏱️</span>
                <h3>Campus Kiosk Rush Predictor</h3>
              </div>
              {rushData && (
                <span
                  className="traffic-pill"
                  style={{
                    backgroundColor: `${rushData.statusColor}22`,
                    color: rushData.statusColor,
                    borderColor: rushData.statusColor,
                  }}
                >
                  {rushData.currentTrafficStatus}
                </span>
              )}
            </div>

            {rushData && (
              <div className="rush-content">
                <p className="rush-advice">
                  🎯 Recommended Walk-up Slot: <strong className="highlight-yellow">{rushData.recommendedBestSlot}</strong> ({rushData.rushReason})
                </p>

                <div className="forecast-bars">
                  {rushData.hourlyForecast.map((slot, i) => (
                    <div key={i} className="forecast-col">
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${slot.congestionPercentage}%`,
                            backgroundColor:
                              slot.congestionPercentage > 70
                                ? '#e53e3e'
                                : slot.congestionPercentage > 40
                                ? '#f4c453'
                                : '#48bb78',
                          }}
                        />
                      </div>
                      <span className="bar-label">{slot.timeSlot.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
                <div className="counter-close-note">
                  ⚠️ Central Library Desk counter closes strictly at {rushData.campusCloseTime}.
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* RIGHT COLUMN: AI Exam Cheat Sheet & Interactive Copilot */}
        <div className="ai-col-right">
          {/* Exam Cheat Sheet Preview */}
          {analysis?.aiCheatSheet && (
            <motion.div
              className="ai-card cheatsheet-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="card-header-bar">
                <div className="card-title-group">
                  <span className="card-icon">📝</span>
                  <h3>1-Page AI Exam Revision Sheet</h3>
                </div>
                <span className="sheet-badge">Ready to Print</span>
              </div>
              <div className="cheat-sheet-preview">
                <div className="cs-header">
                  <strong>{analysis.aiCheatSheet.title}</strong>
                  <p>{analysis.aiCheatSheet.coreSummary}</p>
                </div>
                <ul className="cs-points">
                  {analysis.aiCheatSheet.highYieldPoints.map((pt, idx) => (
                    <li key={idx}>
                      <span className="bullet">📌</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* Interactive Study Copilot Chat */}
          <motion.div
            className="ai-card copilot-chat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <div className="card-header-bar">
              <div className="card-title-group">
                <span className="card-icon">🤖</span>
                <h3>Interactive Study Copilot</h3>
              </div>
              <span className="online-indicator">Online</span>
            </div>

            <div className="chat-messages-container">
              {messages.map((m, idx) => (
                <div key={idx} className={`chat-bubble-row ${m.sender}`}>
                  <div className="chat-bubble">
                    <p style={{ whiteSpace: 'pre-line' }}>{m.text}</p>
                    <span className="bubble-time">{m.timestamp}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-bubble-row ai">
                  <div className="chat-bubble typing-bubble">
                    <span>AI Copilot is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggested Queries */}
            <div className="suggested-queries-bar">
              {[
                'Top 3 Exam Questions',
                'Summarize Document',
                'Calculate 2-Up Savings',
              ].map((query) => (
                <button
                  key={query}
                  type="button"
                  className="query-pill"
                  onClick={() => handleSendMessage(query)}
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              className="chat-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                placeholder="Ask your Copilot about formulas, definitions, or exam tips..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="chat-input-field"
              />
              <button type="submit" className="chat-send-btn">
                Send
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
