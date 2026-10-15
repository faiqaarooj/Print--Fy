import { useState, useEffect } from 'react';
import './FeaturesPage.css';

const queueSteps = ['Queued', 'Preparing', 'Printing', 'Ready'];

function PrintReleaseDemo() {
  const [released, setReleased] = useState(false);

  return (
    <div className={`release-demo demo-surface ${released ? 'is-released' : ''}`}>
      <div className="printer">
        <div className="printer-slot" />
        <div className="paper">
          <span>RESEARCH NOTES</span>
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="printer-body">
          <span className="printer-light" />
          <b>{released ? 'PRINTING' : 'STANDING BY'}</b>
        </div>
      </div>
      <button
        type="button"
        className="action-button"
        onClick={() => setReleased(!released)}
        aria-label={released ? 'Reset print release demo' : 'Release print job'}
      >
        {released ? 'Print released ✓' : "I’m here — release print"}
      </button>
    </div>
  );
}

function PrivacyDemo() {
  const [save, setSave] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    if (save) setDeleted(false);
  }, [save]);

  return (
    <div className="privacy-demo demo-surface">
      <div className={`file-card ${deleted ? 'is-deleted' : ''}`}>
        <span>ECONOMICS_FINAL.PDF</span>
        <strong>24 pages · Double-sided</strong>
        <div className="file-lines">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="privacy-controls">
        <button
          type="button"
          className={`toggle ${save ? 'is-on' : ''}`}
          aria-pressed={save}
          onClick={() => setSave(!save)}
        >
          <span />
          Save for next time
        </button>
        <button
          type="button"
          className="text-button"
          disabled={deleted}
          onClick={() => setDeleted(true)}
        >
          {deleted ? 'File deleted permanently' : 'Delete now'}
        </button>
      </div>
    </div>
  );
}

function QueueDemo() {
  const [step, setStep] = useState(0);

  return (
    <div className="queue-demo demo-surface">
      <div className="queue-topline">
        <span>LIBRARY · DESK 02</span>
        <b>{step === 3 ? 'COLLECT NOW' : 'LIVE QUEUE'}</b>
      </div>
      <div className="queue-number">
        <small>YOUR POSITION</small>
        <strong>
          {step === 0 ? '03' : step === 1 ? '02' : step === 2 ? '01' : '—'}
        </strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${(step + 1) * 25}%` }} />
      </div>
      <div className="step-labels">
        {queueSteps.map((label, index) => (
          <button
            type="button"
            key={label}
            className={index === step ? 'active' : ''}
            onClick={() => setStep(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="next-button"
        onClick={() => setStep((step + 1) % 4)}
      >
        Advance live status →
      </button>
    </div>
  );
}

function UpdatesDemo() {
  const messages = [
    'Desk operating normally.',
    'Black toner replaced. Printing resumed.',
    'Desk closes at 6:00 PM today.',
  ];
  const [message, setMessage] = useState(0);

  return (
    <div className="updates-demo demo-surface">
      <div className="broadcast">
        <div className="broadcast-head">
          <span>MESSAGE FROM DESK 02</span>
          <b>NOW</b>
        </div>
        <p key={message}>{messages[message]}</p>
        <small>Broadcast to 14 students waiting in queue</small>
      </div>
      <div className="message-options">
        {messages.map((item, index) => (
          <button
            type="button"
            key={item}
            className={message === index ? 'active' : ''}
            onClick={() => setMessage(index)}
            aria-label={`Show message ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function FormsDemo() {
  const forms = [
    {
      name: 'Leave application',
      code: 'LV–01',
      fields: ['From date', 'To date', 'Reason'],
    },
    {
      name: 'Bonafide certificate',
      code: 'BF–04',
      fields: ['Student ID', 'Program', 'Purpose'],
    },
    {
      name: 'Clearance form',
      code: 'CL–12',
      fields: ['Department', 'Semester', 'Signature'],
    },
  ];
  const [active, setActive] = useState(0);
  const form = forms[active];

  return (
    <div className="forms-demo demo-surface">
      <div className="form-list">
        <span>SELECT A TEMPLATE</span>
        {forms.map((item, index) => (
          <button
            type="button"
            key={item.code}
            className={active === index ? 'active' : ''}
            onClick={() => setActive(index)}
          >
            <b>{item.code}</b>
            {item.name}
          </button>
        ))}
      </div>
      <div className="form-sheet" key={form.code}>
        <small>CAMPUS ADMINISTRATION</small>
        <h3>{form.name}</h3>
        <em>{form.code}</em>
        {form.fields.map((field) => (
          <label key={field}>
            {field}
            <span />
          </label>
        ))}
        <button
          type="button"
          onClick={() => alert(`Sending ${form.name} (${form.code}) to print queue...`)}
        >
          Print blank form
        </button>
      </div>
    </div>
  );
}

const FEATURE_ITEMS = [
  {
    number: '01',
    title: 'PRINT ONLY WHEN YOU’RE THERE',
    body: 'Your print starts when you tap “I’m here” at the desk. No unclaimed pages, no wasted paper or toner.',
    visual: <PrintReleaseDemo />,
  },
  {
    number: '02',
    title: 'PRIVATE BY DEFAULT',
    body: 'Your files are wiped clean after printing unless you explicitly choose to save them for next time.',
    visual: <PrivacyDemo />,
  },
  {
    number: '03',
    title: 'LIVE QUEUE',
    body: 'See your place in line and the live status of your job from anywhere on campus. No more standing around.',
    visual: <QueueDemo />,
  },
  {
    number: '04',
    title: 'LIVE DESK UPDATES',
    body: 'If the desk closes or ink runs out, the operator sends one message and everyone waiting sees it instantly.',
    visual: <UpdatesDemo />,
  },
  {
    number: '05',
    title: 'OFFICIAL FORMS ON DEMAND',
    body: 'Print standard campus forms, leave applications, and clearance sheets with one tap right at the counter.',
    visual: <FormsDemo />,
  },
];

export default function FeaturesPage({
  onBack,
  onStartUpload,
  onPricing,
  onContact,
}) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="features-page-wrapper">
      {/* Top Navbar with Rich Purple Gradient */}
      <header className="features-page-header">
        <div
          className="features-page-brand"
          onClick={() => onBack && onBack()}
          role="button"
          tabIndex={0}
        >
          <img
            src="/logo/printfy-logo.svg"
            alt="Print-Fy Logo"
            className="features-brand-logo"
          />
          <span className="features-brand-title">
            Print<span className="features-brand-accent">-</span>Fy
          </span>
          <span className="features-brand-badge">Features</span>
        </div>

        <nav className="features-page-nav" aria-label="Features navigation">
          <button
            type="button"
            className="features-nav-link"
            onClick={() => onBack && onBack()}
          >
            Home
          </button>
          <a href="#features-list" className="features-nav-link is-active">
            Features
          </a>
          <button
            type="button"
            className="features-nav-link"
            onClick={() => onPricing && onPricing('students')}
          >
            Pricing
          </button>
          <button
            type="button"
            className="features-nav-link"
            onClick={() => onContact && onContact()}
          >
            Contact
          </button>
        </nav>

        <div className="features-header-actions">
          <button
            type="button"
            className="features-back-btn"
            onClick={() => onBack && onBack()}
          >
            ← Home
          </button>
          <button
            type="button"
            className="features-upload-cta"
            onClick={() => (onStartUpload ? onStartUpload() : onBack && onBack('workflow'))}
          >
            Start Uploading →
          </button>
        </div>
      </header>

      {/* Main Feature Hero */}
      <section className="features-hero" id="top">
        <div className="features-hero-kicker">Campus printing, reworked</div>
        <h1 className="features-hero-h1">
          PRINT LESS.
          <br />
          <span className="features-hero-outline">KNOW MORE.</span>
        </h1>
        <div className="features-hero-footer">
          <p>
            A smarter queue between your screen and the printer. Release jobs in
            person, follow every update, and leave no file behind.
          </p>
          <a href="#features-list" className="features-scroll-link">
            See every interactive demo ↓
          </a>
        </div>
        <div className="features-hero-marquee" aria-hidden="true">
          <div>
            QUEUED · PRIVATE · READY · SECURE · NO MORE WAITING · INSTANT PICKUP ·
            QUEUED · PRIVATE · READY · SECURE · NO MORE WAITING · INSTANT PICKUP ·
          </div>
        </div>
      </section>

      {/* Intro Transition Section */}
      <section className="features-intro" id="how-it-works">
        <span>THE OLD WAY / THE NEW WAY</span>
        <p>
          Printing shouldn’t mean waiting beside a machine. We made every
          uncertain moment visible.
        </p>
      </section>

      {/* 5 Interactive Feature Showcases */}
      <section className="features-showcase-list" id="features-list">
        {FEATURE_ITEMS.map((feature, index) => (
          <article className="features-item-card" key={feature.number}>
            <div className="features-item-copy">
              <span className="features-item-badge">{feature.number}</span>
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
              <small>INTERACTIVE DEMO · TRY IT ON THE RIGHT →</small>
            </div>
            <div className="features-item-visual">{feature.visual}</div>
            <span className="features-side-index">
              {String(index + 1).padStart(2, '0')}
            </span>
          </article>
        ))}
      </section>

      {/* Bottom Conversion Footer */}
      <footer className="features-page-footer">
        <h2>
          READY WHEN
          <br />
          YOU ARE.
        </h2>
        <p>Upload now. Print when you arrive at the counter.</p>
        <div className="features-footer-actions">
          <button
            type="button"
            className="features-footer-upload-btn"
            onClick={() => (onStartUpload ? onStartUpload() : onBack && onBack('workflow'))}
          >
            Start uploading files →
          </button>
          <a href="#top" className="features-back-top-link">
            Back to top ↑
          </a>
        </div>
      </footer>
    </div>
  );
}
