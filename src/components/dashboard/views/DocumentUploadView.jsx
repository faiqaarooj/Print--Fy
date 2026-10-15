import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadIcon,
  ClockIcon,
  FileTextIcon,
  XIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
} from '../DashboardIcons';

export default function DocumentUploadView({
  uploadedList = [],
  onAddUpload,
  onRemoveUpload,
  onUpdatePages,
  queueCount = 0,
  onSubmitToPayment,
}) {
  const [copies, setCopies] = useState(1);
  const [printCategory, setPrintCategory] = useState('Print'); // 'Print' | 'Photocopy'
  const [colorMode, setColorMode] = useState('B&W'); // 'B&W' | 'Color'
  const [duplexMode, setDuplexMode] = useState('Single'); // 'Single' | 'Double'
  const [isBindingEnabled, setIsBindingEnabled] = useState(true);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(''); // User must choose arrival time
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Exact pricing: B&W = Rs. 10 / page, Color = Rs. 15 / page
  // It only calculates the amount which needs to be paid for the uploaded pages and copies
  const ratePerPage = colorMode === 'Color' ? 15 : 10;
  const numCopies = Math.max(1, Number(copies) || 1);
  const totalPages = uploadedList.reduce((acc, doc) => acc + (Number(doc.pages) || 1), 0);
  const realTimePrice = totalPages * numCopies * ratePerPage;

  // Campus pickup slots: strictly till 3:30 PM only
  const availableCampusSlots = [
    '9:00 AM',
    '9:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '1:00 PM',
    '1:30 PM',
    '2:00 PM',
    '2:30 PM',
    '3:00 PM',
    '3:30 PM',
  ];

  const handleSelectAsap = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const maxMinutes = 15 * 60 + 30; // 3:30 PM
    if (totalMinutes > maxMinutes) {
      setSelectedTimeSlot('3:30 PM (Desk closes at 3:30 PM)');
      setCustomTimeInput('3:30 PM');
      return;
    }
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const asapSlot = `${hours}:${formattedMinutes} ${ampm} (ASAP)`;
    setSelectedTimeSlot(asapSlot);
    setCustomTimeInput(asapSlot);
  };

  const handleCustomTimeChange = (timeString) => {
    if (!timeString) return;
    const [h, m] = timeString.split(':');
    const hour = parseInt(h, 10);
    const minute = parseInt(m, 10);

    // Enforce campus counter closes at 3:30 PM
    if (hour > 15 || (hour === 15 && minute > 30)) {
      setSelectedTimeSlot('3:30 PM (Counter closes at 3:30 PM)');
      setCustomTimeInput('3:30 PM');
      return;
    }

    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    const formattedTime = `${formattedHour}:${m} ${ampm}`;
    setSelectedTimeSlot(formattedTime);
    setCustomTimeInput(formattedTime);
  };

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const estimatedPages = Math.max(1, Math.min(180, Math.round(file.size / (1024 * 65))));
      const newUpload = {
        id: `upl-${Date.now()}-${Math.random()}`,
        name: file.name,
        pages: estimatedPages,
        sizeMb: (file.size / (1024 * 1024)).toFixed(1) || '2.4',
        colorMode,
        duplexMode,
        copies: numCopies,
        binding: isBindingEnabled,
        pickupTime: selectedTimeSlot,
      };
      onAddUpload(newUpload);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer?.files);
  };

  const handleFileChange = (e) => {
    handleFiles(e.target?.files);
  };

  return (
    <div className="document-upload-view" data-node-id="111:14114">
      {/* Top Workflow Stepper Header */}
      <div className="upload-stepper-header-row">
        <div className="workflow-stepper-track">
          {/* Step 1: Active */}
          <div className="stepper-step-node active">
            <span className="step-number-bubble">1</span>
            <span className="step-title-text">1. Upload & Options</span>
          </div>
          <div className="stepper-connector-line active" />

          {/* Step 2 */}
          <div className="stepper-step-node">
            <span className="step-number-bubble">2</span>
            <span className="step-title-text">2. Payment & Confirmation</span>
          </div>
          <div className="stepper-connector-line" />

          {/* Step 3 */}
          <div className="stepper-step-node">
            <span className="step-number-bubble">3</span>
            <span className="step-title-text">3. Print in Queue</span>
          </div>
        </div>

        {/* Current Queue Status Badge (Figma Node 111:14114) */}
        <div className="current-queue-badge">
          <ClockIcon size={16} color="#551ee7" />
          <span>
            Current Queue: <strong>{queueCount === 0 ? 'Clear (0 jobs ahead)' : `${queueCount} job${queueCount > 1 ? 's' : ''} in queue`}</strong>
          </span>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="upload-two-column-workspace">
        {/* Left Column: Drag & Drop + Print Options */}
        <div className="upload-left-config-column">
          {/* 1. Drag & Drop Card */}
          <div
            className={`upload-drop-zone-card ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="upload-file-input"
              className="hidden-file-input"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleFileChange}
            />
            <label htmlFor="upload-file-input" className="drop-zone-content-label">
              <div className="drop-cloud-icon-circle">
                <UploadIcon size={24} color="#6e44ff" />
              </div>
              <p className="drop-primary-headline">
                Drag & drop your file here, or <span className="browse-link-text">browse</span>
              </p>
              <span className="drop-supported-formats">
                PDF, DOC, DOCX, JPG, PNG • 20MB
              </span>
            </label>
          </div>

          {/* 2. Print Configuration Options Card */}
          <div className="print-options-card">
            {/* Number of Copies */}
            <div className="config-option-row">
              <div className="config-label-group">
                <span className="config-title">Number of Copies</span>
              </div>
              <div className="number-stepper-control">
                <button
                  type="button"
                  onClick={() => setCopies((prev) => Math.max(1, (Number(prev) || 1) - 1))}
                  className="stepper-btn"
                  aria-label="Decrease copies"
                  title="Decrease copies"
                >
                  <MinusIcon size={14} />
                </button>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={copies}
                  onChange={(e) => {
                    const rawVal = e.target.value;
                    if (rawVal === '') {
                      setCopies('');
                      return;
                    }
                    const num = parseInt(rawVal, 10);
                    if (!isNaN(num)) {
                      setCopies(Math.max(1, Math.min(999, num)));
                    }
                  }}
                  onBlur={() => {
                    if (!copies || Number(copies) < 1) {
                      setCopies(1);
                    }
                  }}
                  className="stepper-number-input"
                  aria-label="Number of copies"
                  title="Type your own number of copies"
                />
                <button
                  type="button"
                  onClick={() => setCopies((prev) => Math.min(999, (Number(prev) || 0) + 1))}
                  className="stepper-btn"
                  aria-label="Increase copies"
                  title="Increase copies"
                >
                  <PlusIcon size={14} />
                </button>
              </div>
            </div>

            <div className="config-divider-line" />

            {/* Print Type: Print/Photocopy & B&W/Color */}
            <div className="config-option-row wrap-responsive">
              <div className="config-label-group">
                <span className="config-title">Print Type</span>
                <span className="config-description">Choose black & white or color.</span>
              </div>
              <div className="button-group-cluster">
                <div className="pill-toggle-switch">
                  <button
                    type="button"
                    onClick={() => setPrintCategory('Print')}
                    className={`pill-toggle-btn ${printCategory === 'Print' ? 'active' : ''}`}
                  >
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintCategory('Photocopy')}
                    className={`pill-toggle-btn ${printCategory === 'Photocopy' ? 'active' : ''}`}
                  >
                    Photocopy
                  </button>
                </div>

                <div className="pill-toggle-switch">
                  <button
                    type="button"
                    onClick={() => setColorMode('B&W')}
                    className={`pill-toggle-btn ${colorMode === 'B&W' ? 'active' : ''}`}
                  >
                    B&W
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode('Color')}
                    className={`pill-toggle-btn ${colorMode === 'Color' ? 'active' : ''}`}
                  >
                    Color
                  </button>
                </div>
              </div>
            </div>

            <div className="config-divider-line" />

            {/* Sides: Single vs Double */}
            <div className="config-option-row">
              <div className="config-label-group">
                <span className="config-title">Sides</span>
                <span className="config-description">
                  Duplex or standard simplex configuration
                </span>
              </div>
              <div className="pill-toggle-switch">
                <button
                  type="button"
                  onClick={() => setDuplexMode('Single')}
                  className={`pill-toggle-btn ${duplexMode === 'Single' ? 'active' : ''}`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setDuplexMode('Double')}
                  className={`pill-toggle-btn ${duplexMode === 'Double' ? 'active' : ''}`}
                >
                  Double
                </button>
              </div>
            </div>

            <div className="config-divider-line" />

            {/* Binding: Switch */}
            <div className="config-option-row">
              <div className="config-label-group">
                <span className="config-title">Binding</span>
                <span className="config-description">Keep the pages bind in one file.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsBindingEnabled(!isBindingEnabled)}
                className={`ios-toggle-switch ${isBindingEnabled ? 'enabled' : ''}`}
                aria-label="Toggle binding"
              >
                <span className="ios-toggle-thumb" />
              </button>
            </div>

            <div className="config-divider-line" />

            {/* When will you arrive? - Alternative Flexible Picker */}
            <div className="arrival-window-section">
              <div className="arrival-header-row">
                <div className="config-label-group">
                  <span className="config-title">When will you arrive?</span>
                  <span className="config-description">
                    Pick any time freely, select presets, or choose ASAP
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAsap}
                  className="asap-express-pill-btn"
                  title="Pick ASAP (~15 mins)"
                >
                  ⚡ ASAP (~15m)
                </button>
              </div>

              {/* Chosen Time Status Badge */}
              {selectedTimeSlot ? (
                <div className="chosen-time-active-box">
                  <div className="chosen-time-info">
                    <ClockIcon size={14} color="#551ee7" />
                    <span>Selected Arrival: <strong>{selectedTimeSlot}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTimeSlot('');
                      setCustomTimeInput('');
                    }}
                    className="clear-chosen-time-btn"
                    title="Change arrival time"
                  >
                    Change <XIcon size={12} />
                  </button>
                </div>
              ) : (
                <div className="no-time-chosen-hint">
                  <span>No arrival time selected yet. Pick or type a time below:</span>
                </div>
              )}

              {/* 1. Direct Alternative Time Picker & Manual Input */}
              <div className="alternative-custom-time-cluster">
                <div className="time-picker-input-group">
                  <label htmlFor="native-time-input" className="time-input-label">
                    <ClockIcon size={13} color="#551ee7" />
                    <span>Time Clock:</span>
                  </label>
                  <input
                    type="time"
                    id="native-time-input"
                    min="08:00"
                    max="15:30"
                    className="native-time-picker-visible"
                    onChange={(e) => handleCustomTimeChange(e.target.value)}
                    title="Pick time (Campus counter open till 3:30 PM)"
                  />
                </div>

                <div className="time-text-input-group">
                  <span className="or-divider-tag">OR</span>
                  <input
                    type="text"
                    placeholder="Type time (e.g. 10:15 AM, 2:30 PM till 3:30 PM)..."
                    value={customTimeInput}
                    onChange={(e) => {
                      setCustomTimeInput(e.target.value);
                      setSelectedTimeSlot(e.target.value);
                    }}
                    className="custom-text-time-field"
                    title="Write your own custom arrival time (till 3:30 PM)"
                  />
                </div>
              </div>

              {/* 2. Quick Presets: Campus Slots Till 3:30 PM Only */}
              <div className="time-presets-accordion">
                <div className="presets-category-label">Available Campus Slots (Till 3:30 PM):</div>
                <div className="time-slots-grid">
                  {availableCampusSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setSelectedTimeSlot(slot);
                        setCustomTimeInput(slot);
                      }}
                      className={`time-slot-btn ${selectedTimeSlot === slot ? 'selected' : ''}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Uploaded Documents List & Real-Time Price */}
        <div className="upload-right-summary-column">
          <div className="uploaded-docs-heading-pill">
            <span>Uploaded Documents</span>
          </div>

          <div className="uploaded-docs-card-list">
            <AnimatePresence>
              {uploadedList.length > 0 ? (
                uploadedList.map((doc, idx) => (
                  <motion.div
                    key={doc.id || idx}
                    className="uploaded-doc-item-row"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="doc-item-icon-box">
                      <FileTextIcon size={20} color="#551ee7" />
                    </div>
                    <div className="doc-item-info-block">
                      <h5 className="doc-item-title">{doc.name}</h5>
                      <div className="doc-item-pages-control">
                        <span>Pages:</span>
                        <div className="doc-pages-stepper-mini">
                          <button
                            type="button"
                            className="doc-pages-mini-btn"
                            onClick={() => onUpdatePages && onUpdatePages(doc.id, Math.max(1, (Number(doc.pages) || 1) - 1))}
                            title="Decrease pages"
                            aria-label="Decrease pages"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={doc.pages}
                            onChange={(e) => onUpdatePages && onUpdatePages(doc.id, e.target.value)}
                            className="doc-pages-mini-input"
                            title="Specify exact pages to print"
                            aria-label="Number of pages"
                          />
                          <button
                            type="button"
                            className="doc-pages-mini-btn"
                            onClick={() => onUpdatePages && onUpdatePages(doc.id, (Number(doc.pages) || 1) + 1)}
                            title="Increase pages"
                            aria-label="Increase pages"
                          >
                            +
                          </button>
                        </div>
                        <span className="doc-size-muted">• {doc.sizeMb || '2.4'} MB</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveUpload(doc.id)}
                      className="delete-doc-cross-btn"
                      title="Remove file"
                      aria-label={`Remove ${doc.name}`}
                    >
                      <XIcon size={14} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="no-uploads-yet-placeholder">
                  <p>Drop your assignment or syllabus to start</p>
                  <span>Supports PDF, DOCX up to 20MB</span>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Validation Guidance Hint */}
          {uploadedList.length > 0 && !selectedTimeSlot && (
            <div className="time-required-alert-banner">
              <ClockIcon size={15} color="#92400e" />
              <span>Please pick your arrival time above (till 3:30 PM) to continue to payment.</span>
            </div>
          )}

          {/* Primary CTA: Submit your Document */}
          <button
            type="button"
            onClick={() => {
              if (uploadedList.length === 0 || !selectedTimeSlot) return;
              onSubmitToPayment(selectedTimeSlot, {
                copies: numCopies,
                colorMode,
                duplexMode,
                binding: isBindingEnabled,
                cost: realTimePrice,
              });
            }}
            className={`submit-document-master-btn ${
              uploadedList.length > 0 && selectedTimeSlot ? 'ready' : 'disabled'
            }`}
            disabled={uploadedList.length === 0 || !selectedTimeSlot}
            aria-disabled={uploadedList.length === 0 || !selectedTimeSlot}
          >
            <span>
              {uploadedList.length === 0
                ? 'Drop or browse a file above'
                : !selectedTimeSlot
                ? 'Choose arrival time (till 3:30 PM)'
                : `Proceed to Payment (${selectedTimeSlot}) →`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
