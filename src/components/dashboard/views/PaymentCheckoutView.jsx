import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  FileTextIcon,
  ShieldCheckIcon,
  RefreshCwIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  DownloadIcon,
  CreditCardIcon,
  PrinterIcon,
} from '../DashboardIcons';

/**
 * Transparent Campus Printing Rates Section
 * Strictly implements Figma node 143:19251
 * Shown when user has not yet uploaded or selected a document,
 * or when they click "View Printing Rates".
 */
export function TransparentCampusRatesSection({
  onUploadClick,
  pendingDocument,
  onProceedToCheckout,
}) {
  const rateCards = [
    {
      id: 'mono',
      tierTag: 'Standard Mono',
      icon: FileTextIcon,
      title: 'Standard B&W',
      price: 'Rs. 10',
      priceUnit: '/ page',
      description:
        'Crisp monochrome output tailored for course handouts, research papers, and assignments.',
      checklist: [
        'High-speed 1200 DPI laser toner',
        '80 GSM acid-free recycled paper',
        'Duplex (Double-sided) available',
      ],
      speed: 'Speed: < 2s / sheet',
      mode: 'Default Mode',
      isPopular: false,
    },
    {
      id: 'color',
      tierTag: 'Studio Vibrant',
      icon: PrinterIcon,
      title: 'Vibrant Full Color',
      price: 'Rs. 15',
      priceUnit: '/ page',
      description:
        'Precision CMYK calibration for project graphics, diagrams, and poster presentations.',
      checklist: [
        'Full spectrum Pantone matched ink',
        '90 GSM non-bleed premium finish',
        'Edge-to-edge borderless options',
      ],
      speed: 'Speed: < 4s / sheet',
      mode: 'High Fidelity',
      isPopular: true,
    },
    {
      id: 'bulk',
      tierTag: 'High Volume',
      icon: FileTextIcon,
      title: 'Bulk & Thesis',
      price: '10% OFF',
      priceUnit: 'over 200 pgs',
      description:
        'Engineered for semester dissertations, bulk labs, and high-volume departmental print runs.',
      checklist: [
        'Automatic volume-tier rebate',
        'Complimentary soft binding > 300 pgs',
        'Priority thermal print channel',
      ],
      speed: 'Packaging: Shrink wrapped',
      mode: 'Thesis Spec',
      isPopular: false,
    },
  ];

  return (
    <div className="campus-rates-view-root" data-node-id="143:19251">
      {/* Hero Header */}
      <div className="rates-hero-header">
        <div className="rates-tag-pill">
          Instant Auto-Calculation &amp; Campus Station Sync
        </div>
        <h1 className="rates-headline">Transparent Campus Printing Rates</h1>
        <p className="rates-subtitle">
          Affordable on-demand cloud printing with instant cost estimations. Upload your
          assignments, slides, or thesis and dispatch immediately to any campus kiosk.
        </p>
      </div>

      {/* 3 Pricing Cards Grid */}
      <div className="rates-cards-grid">
        {rateCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`rate-card-item ${card.isPopular ? 'popular' : ''}`}
            >
              {card.isPopular && <span className="popular-ribbon">POPULAR</span>}

              <div className="rate-card-header-line">
                <span className="rate-tier-pill">{card.tierTag}</span>
                <div className="rate-card-icon-wrap">
                  <Icon size={20} color={card.isPopular ? '#ffffff' : '#551ee7'} />
                </div>
              </div>

              <h3 className="rate-card-title">{card.title}</h3>

              <div className="rate-card-price-row">
                <span className="rate-price-big">{card.price}</span>
                <span className="rate-price-unit">{card.priceUnit}</span>
              </div>

              <p className="rate-card-desc">{card.description}</p>

              <ul className="rate-card-checklist">
                {card.checklist.map((item, idx) => (
                  <li key={idx}>
                    <span className="rate-check-bullet">
                      <CheckIcon size={11} color={card.isPopular ? '#ffffff' : '#551ee7'} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="rate-card-footer">
                <span>{card.speed}</span>
                <span>{card.mode}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Central Upload CTA Button */}
      <div className="rates-cta-row">
        <button
          type="button"
          onClick={onUploadClick}
          className="rates-upload-cta-btn"
          aria-label="Upload Your Document"
        >
          <span>Upload Your Document</span>
          <ArrowRightIcon size={18} color="#ffffff" />
        </button>

        {pendingDocument && onProceedToCheckout && (
          <button
            type="button"
            onClick={onProceedToCheckout}
            className="back-to-settings-link-btn"
            style={{ textAlign: 'center' }}
          >
            ← Return to checkout for "{pendingDocument.name}"
          </button>
        )}
      </div>

      {/* Bottom Accepted Methods Banner (Figma Node 143:19251) */}
      <div className="rates-accepted-methods-bar">
        <div className="rates-methods-left">
          <CreditCardIcon size={18} color="#ffffff" />
          <span>Accepted Direct Payment Methods: EasyPaisa, JazzCash, Debit &amp; Credit Cards</span>
        </div>
        <div className="rates-methods-right">
          <span className="kiosks-online-dot" />
          <span>14 Kiosks Online • Zero Transaction Fees</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Payment Module Component
 */
export default function PaymentCheckoutView({
  pendingDocument,
  queueCount = 0,
  onPayAndSubmit,
  onBackToUpload,
}) {
  const [selectedMethod, setSelectedMethod] = useState('desk'); // 'desk' | 'qr'
  const [phoneNumber, setPhoneNumber] = useState('03010010007');
  const [isQrRefreshed, setIsQrRefreshed] = useState(false);
  const [showRatesOverlay, setShowRatesOverlay] = useState(false);

  // If no document is pending/uploaded, or user explicitly requested pricing view
  if (!pendingDocument || showRatesOverlay) {
    return (
      <TransparentCampusRatesSection
        onUploadClick={onBackToUpload}
        pendingDocument={pendingDocument}
        onProceedToCheckout={pendingDocument ? () => setShowRatesOverlay(false) : null}
      />
    );
  }

  const docName = pendingDocument?.name || 'Document.pdf';
  const docPages = Math.max(1, Number(pendingDocument?.pages) || 1);
  const copies = Math.max(1, Number(pendingDocument?.copies) || 1);
  const isColor = pendingDocument?.colorMode === 'Color';
  const rate = isColor ? 15 : 10;
  // It only calculates the amount which needs to be paid for this specific document and copies
  const totalAmount = docPages * copies * rate;
  const pickupTime = pendingDocument?.pickupTime || '10:00 AM';

  const handleRefreshQr = () => {
    setIsQrRefreshed(true);
    setTimeout(() => setIsQrRefreshed(false), 800);
  };

  const handleConfirmPayment = (methodOverride) => {
    const isDesk = (methodOverride ? methodOverride.toLowerCase().includes('desk') : selectedMethod === 'desk');
    const methodUsed =
      methodOverride ||
      (selectedMethod === 'desk'
        ? 'Pay at Desk (Pending)'
        : 'JazzCash / Instant QR');

    // ONLY calculate the amount which needs to be paid:
    // If online (JazzCash / QR), amountDue is 0 (paid immediately).
    // If desk (Cash), amountDue is totalAmount to be collected at the counter.
    onPayAndSubmit({
      ...pendingDocument,
      cost: totalAmount,
      amountDue: isDesk ? totalAmount : 0,
      name: docName,
      pages: docPages,
      copies,
      pickupTime,
      paymentMethod: methodUsed,
      paymentStatus: isDesk ? 'Unpaid' : 'Paid',
    });
  };

  return (
    <div className="payment-checkout-view" data-node-id="118:16469">
      {/* Top Stepper */}
      <div className="upload-stepper-header-row">
        <div className="workflow-stepper-track">
          {/* Step 1: Completed */}
          <div
            className="stepper-step-node completed"
            onClick={onBackToUpload}
            style={{ cursor: 'pointer' }}
          >
            <span className="step-number-bubble check">
              <CheckIcon size={12} color="#ffffff" />
            </span>
            <span className="step-title-text">1. Upload &amp; Options</span>
          </div>
          <div className="stepper-connector-line completed" />

          {/* Step 2: Active */}
          <div className="stepper-step-node active">
            <span className="step-number-bubble">2</span>
            <span className="step-title-text">2. Payment &amp; Confirmation</span>
          </div>
          <div className="stepper-connector-line" />

          {/* Step 3: Pending */}
          <div className="stepper-step-node">
            <span className="step-number-bubble">3</span>
            <span className="step-title-text">3. Print in Queue</span>
          </div>
        </div>

        {/* Current Queue Status Badge & View Rates Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setShowRatesOverlay(true)}
            className="back-to-settings-link-btn"
            style={{ color: '#551ee7', fontWeight: 600, margin: 0 }}
          >
            📊 View Campus Rates
          </button>
          <div className="current-queue-badge">
            <ClockIcon size={16} color="#551ee7" />
            <span>
              Current Queue: <strong>{queueCount === 0 ? 'Clear (0 ahead)' : `${queueCount} job${queueCount > 1 ? 's' : ''} in queue`}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Payment Workspace */}
      <div className="payment-two-column-workspace">
        {/* Left Column: Method Selection */}
        <div className="payment-left-methods-column">
          <div className="payment-heading-row">
            <div className="heading-title-group">
              <h2 className="payment-section-title">Select Payment Method</h2>
              <p className="payment-section-subtext">
                Choose your preferred transaction option to release prints to production
              </p>
            </div>
            <div className="encryption-guarantee-pill">
              <ShieldCheckIcon size={14} color="#5e5c6e" />
              <span>256-bit Secure Encryption</span>
            </div>
          </div>

          {/* METHOD 1: Pay at Desk (Counter / Cash) — Strictly matches Figma 140:19151 & 120:17427 */}
          <div
            className={`payment-method-card ${selectedMethod === 'desk' ? 'selected' : ''}`}
            onClick={() => setSelectedMethod('desk')}
          >
            <div className="method-card-header">
              <div className="method-radio-and-title">
                <span className={`custom-radio-circle ${selectedMethod === 'desk' ? 'checked' : ''}`} />
                <div className="method-label-group">
                  <div className="method-title-line">
                    <h4 className="method-name">Pay at Desk (Cash / Counter)</h4>
                    <span className="on-payment-badge">ON-PAYMENT</span>
                  </div>
                  <p className="method-description">
                    Pay at Central Library Desk A when you arrive for collection
                  </p>
                </div>
              </div>

              <div className="cash-indicator-side">
                <span className="pay-amount-label">Available balance</span>
                <span className="cash-highlight">CASH</span>
              </div>
            </div>

            {/* Inner Details Box strictly implementing Figma Nodes 140:19151 and 120:17427 */}
            {selectedMethod === 'desk' && (
              <motion.div
                className="desk-payment-pill-card"
                data-node-id="120:17427"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Row 1: Payment Status: Unpaid + PENDING AT DESK (Figma 140:19151) */}
                <div className="desk-status-badge-row">
                  <span className="status-label-unpaid">Payment Status: Unpaid</span>
                  <span className="pending-desk-red-pill">PENDING AT DESK</span>
                </div>

                {/* Row 2: Payable Amount: {totalAmount} rupees (Figma 120:17427) */}
                <div className="desk-payable-amount-row">
                  <span>Payable Amount:</span>
                  <span className="payable-rupees-purple-pill">{totalAmount} rupees</span>
                </div>

                {/* Row 3: Download your code to receive the document + Green download button */}
                <div className="desk-download-code-row">
                  <span>Download your code to receive the document</span>
                  <button
                    type="button"
                    className="desk-code-action-btn"
                    title="Download order receipt slip"
                    onClick={() => {
                      alert(`Order Voucher Ready!\nDocument: ${docName}\nAmount Due: Rs. ${totalAmount}\nDesk: Central Library Desk A`);
                    }}
                  >
                    <DownloadIcon size={18} color="#ffffff" />
                  </button>
                </div>

                {/* Verification Notice */}
                <div className="cash-instructions-callout">
                  <ShieldCheckIcon size={14} color="#551ee7" />
                  <span>
                    Pay at the desk when you arrive. The job status remains <strong>Unpaid</strong> until
                    the operator records it. Printing will initiate once you tap <strong>"I'm Here"</strong> at the desk.
                  </span>
                </div>

                {/* Submit CTA */}
                <button
                  type="button"
                  onClick={() => handleConfirmPayment('Pay at Desk (Pending)')}
                  className="confirm-cash-submit-btn"
                >
                  <span>Confirm Order (Pay Rs. {totalAmount} at Desk) &amp; Enter Queue →</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* METHOD 2: JazzCash / Instant QR Code */}
          <div
            className={`payment-method-card ${selectedMethod === 'qr' ? 'selected' : ''}`}
            onClick={() => setSelectedMethod('qr')}
          >
            <div className="method-card-header">
              <div className="method-radio-and-title">
                <span className={`custom-radio-circle ${selectedMethod === 'qr' ? 'checked' : ''}`} />
                <div className="method-label-group">
                  <div className="method-title-line">
                    <h4 className="method-name">JazzCash / Instant QR Code</h4>
                    <span className="popular-badge">INSTANT ONLINE</span>
                  </div>
                  <p className="method-description">
                    Pay securely with JazzCash, EasyPaisa, NayaPay
                  </p>
                </div>
              </div>

              <div className="provider-badges-cluster">
                <span className="provider-tag">Jazzcash</span>
                <span className="provider-tag">EasyPaisa</span>
                <span className="provider-tag">NayaPay</span>
              </div>
            </div>

            {/* Inner QR & Number Box (visible when selected) */}
            {selectedMethod === 'qr' && (
              <motion.div
                className="qr-interactive-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* QR Code Graphic Box */}
                <div className="qr-code-display-box">
                  <div className="qr-image-wrapper">
                    <svg
                      viewBox="0 0 100 100"
                      className={`stylized-qr-svg ${isQrRefreshed ? 'spinning' : ''}`}
                    >
                      <rect width="100" height="100" fill="#ffffff" rx="6" />
                      <rect x="8" y="8" width="26" height="26" fill="#191c1e" rx="3" />
                      <rect x="12" y="12" width="18" height="18" fill="#ffffff" rx="2" />
                      <rect x="16" y="16" width="10" height="10" fill="#551ee7" rx="1" />

                      <rect x="66" y="8" width="26" height="26" fill="#191c1e" rx="3" />
                      <rect x="70" y="12" width="18" height="18" fill="#ffffff" rx="2" />
                      <rect x="74" y="16" width="10" height="10" fill="#551ee7" rx="1" />

                      <rect x="8" y="66" width="26" height="26" fill="#191c1e" rx="3" />
                      <rect x="12" y="70" width="18" height="18" fill="#ffffff" rx="2" />
                      <rect x="16" y="74" width="10" height="10" fill="#551ee7" rx="1" />

                      <rect x="42" y="12" width="6" height="6" fill="#191c1e" />
                      <rect x="52" y="18" width="6" height="6" fill="#191c1e" />
                      <rect x="42" y="28" width="6" height="6" fill="#191c1e" />
                      <rect x="12" y="42" width="6" height="6" fill="#191c1e" />
                      <rect x="24" y="48" width="6" height="6" fill="#191c1e" />
                      <rect x="42" y="42" width="16" height="16" fill="#551ee7" rx="2" />
                      <rect x="66" y="42" width="6" height="6" fill="#191c1e" />
                      <rect x="78" y="48" width="6" height="6" fill="#191c1e" />
                      <rect x="42" y="66" width="6" height="6" fill="#191c1e" />
                      <rect x="52" y="76" width="6" height="6" fill="#191c1e" />
                      <rect x="66" y="66" width="8" height="8" fill="#191c1e" />
                      <rect x="78" y="78" width="8" height="8" fill="#191c1e" />
                    </svg>
                  </div>
                  <div className="qr-active-indicator">
                    <span className="qr-green-dot" />
                    <span>Dynamic QR Active</span>
                  </div>
                </div>

                {/* Right side of QR Panel */}
                <div className="qr-phone-action-side">
                  <button
                    type="button"
                    onClick={handleRefreshQr}
                    className="reload-qr-btn"
                  >
                    <RefreshCwIcon size={13} />
                    <span>Reload QR</span>
                  </button>

                  <div className="pay-number-group">
                    <label className="pay-number-label">or Pay on this Number:</label>
                    <div className="phone-input-action-row">
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="phone-number-field"
                      />
                      <button
                        type="button"
                        onClick={() => handleConfirmPayment('JazzCash Online')}
                        className="pay-number-btn"
                      >
                        Pay
                      </button>
                    </div>
                  </div>

                  <div className="instant-receipt-guarantee">
                    <ShieldCheckIcon size={14} color="#551ee7" />
                    <span>Instant receipt &amp; automated queue placement</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Back link */}
          <button
            type="button"
            onClick={onBackToUpload}
            className="back-to-settings-link-btn"
          >
            ← Back to print settings &amp; document configuration
          </button>
        </div>

        {/* Right Column: Order Summary & Pay Action */}
        <div className="payment-right-summary-column">
          {/* Deep Purple Card (Figma Node 118:16469) */}
          <div className="order-summary-purple-card">
            <div className="order-doc-header">
              <div className="order-doc-icon-wrap">
                <FileTextIcon size={20} color="#551ee7" />
              </div>
              <div className="order-doc-title-block">
                <div className="doc-headline-and-dpi">
                  <h4 className="order-doc-title">{docName}</h4>
                  <span className="verified-dpi-badge">Verified 300 DPI</span>
                </div>
                <p className="order-doc-subspecs">
                  {isColor ? 'Color' : 'B&W'} • {pendingDocument?.duplexMode === 'Double' || pendingDocument?.duplex === 'Double-sided' ? 'Double-sided' : 'Single-sided'} • 80 GSM
                </p>
              </div>
            </div>

            <div className="order-pricing-lines-list">
              <div className="order-pricing-row">
                <span>Total Document Pages</span>
                <strong>{docPages} page{docPages > 1 ? 's' : ''}</strong>
              </div>
              <div className="order-pricing-row">
                <span>Number of Copies</span>
                <strong>{copies} cop{copies > 1 ? 'ies' : 'y'}</strong>
              </div>
              <div className="order-pricing-row">
                <span>Rate per Page</span>
                <span>Rs. {rate}/page ({isColor ? 'Color' : 'B&W'})</span>
              </div>
              <div className="order-pricing-row">
                <span>Calculation</span>
                <span>{docPages} pages × {copies} × Rs. {rate}</span>
              </div>
            </div>

            <div className="order-total-amount-line">
              <span>Total Amount</span>
              <strong className="final-total-price">Rs. {totalAmount}</strong>
            </div>

            {/* Scheduled Pickup Banner with chosen time */}
            <div className="scheduled-pickup-notice-bar">
              <ClockIcon size={14} color="#551ee7" />
              <span>
                Scheduled Pickup: <strong>Today at {pickupTime}</strong> at Central Library Hub
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => handleConfirmPayment()}
            className="pay-and-submit-queue-btn"
          >
            <span>
              {selectedMethod === 'desk'
                ? `Confirm Rs. ${totalAmount} (Pay at Desk) & Enter Queue`
                : `Pay Rs. ${totalAmount} Online & Submit to Queue`}
            </span>
            <ArrowRightIcon size={16} color="#ffffff" />
          </button>

          {/* Guaranteed Safe Checkout Notice */}
          <div className="guaranteed-safe-box">
            <ShieldCheckIcon size={16} color="#551ee7" />
            <p>
              <strong>Guaranteed safe checkout.</strong> Instant receipt and automatic placement in the live queue.
            </p>
          </div>

          {/* Order Diagnostics Breakdown */}
          <div className="order-diagnostics-card">
            <span className="diagnostics-header-title">ORDER DIAGNOSTICS</span>
            <div className="diagnostic-line">
              <span>Binding</span>
              <strong>Standard Corner Staple</strong>
            </div>
            <div className="diagnostic-line">
              <span>Paper Weight</span>
              <strong>Standard 80 GSM Bond</strong>
            </div>
            <div className="diagnostic-line">
              <span>Paper Orientation</span>
              <strong>Portrait (Auto-fit)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
