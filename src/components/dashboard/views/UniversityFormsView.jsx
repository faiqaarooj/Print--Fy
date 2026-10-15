import React, { useState, useEffect } from 'react';
import {
  FileTextIcon,
  SearchIcon,
  DownloadIcon,
  PrinterIcon,
  ArrowRightIcon,
} from '../DashboardIcons';
import { api } from '../../../lib/api';
import { DEMO_MODE } from '../../../lib/config';

/**
 * UNIVERSITY FORMS SCREEN
 * Matches Figma Node 255:1013
 *
 * BACKEND TODOs:
 * - GET /forms - Returns official printable university documents
 * - POST /forms/{id}/print-job - Creates print queue job from selected form
 * - Admin UI endpoints (to be built later):
 *   - POST /admin/forms (create form)
 *   - PUT /admin/forms/{id} (update form)
 *   - DELETE /admin/forms/{id} (delete form)
 *   - POST /admin/forms/{id}/upload-file (file upload)
 */

export default function UniversityFormsView({
  onSelectFormForPrint,
  onShowToast,
}) {
  const [forms, setForms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All forms');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormId, setSelectedFormId] = useState('form-leave-app');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getForms().then((data) => {
      if (mounted) {
        setForms(data);
        if (data.length > 0 && !selectedFormId) {
          setSelectedFormId(data[0].id);
        }
        setIsLoading(false);
      }
    }).catch(() => {
      if (mounted) setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const categories = ['All forms', 'Leave', 'Certificates', 'Clearance'];

  const filteredForms = forms.filter((form) => {
    const matchesCategory =
      selectedCategory === 'All forms' || form.category === selectedCategory;
    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeForm = forms.find((f) => f.id === selectedFormId) || forms[0];

  const handleDownloadForm = (form) => {
    if (DEMO_MODE) {
      onShowToast?.("Demo: the university admin will add this form's file.");
      return;
    }
    if (!form.fileUrl) {
      return; // Disabled in real mode
    }
    const a = document.createElement('a');
    a.href = form.fileUrl;
    a.download = `${form.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintForm = async (form) => {
    if (DEMO_MODE) {
      onShowToast?.("Demo: the university admin will add this form's file.");
      // Also proceed to send form to payment flow so user can test full experience!
      if (onSelectFormForPrint) {
        onSelectFormForPrint({
          id: `form-job-${Date.now()}`,
          name: `${form.title}.pdf`,
          pages: form.pages || 1,
          colorMode: 'B&W',
          duplexMode: 'Single',
          cost: (form.pages || 1) * 10,
          pickupTime: '10:00 AM',
        });
      }
      return;
    }

    if (!form.fileUrl) {
      return;
    }

    try {
      const response = await api.createFormPrintJob(form.id);
      if (onSelectFormForPrint && response?.jobId) {
        onSelectFormForPrint({
          id: response.jobId,
          name: `${form.title}.pdf`,
          pages: form.pages || 1,
          cost: (form.pages || 1) * 10,
        });
      }
    } catch (err) {
      onShowToast?.(err.message || 'Failed to dispatch form print job');
    }
  };

  return (
    <div className="university-forms-root" data-node-id="255:1013">
      {/* 1. Header Banner */}
      <div className="forms-page-headline-block">
        <div className="headline-text-group">
          <div className="title-and-badge-row">
            <h1 className="forms-main-heading">Campus paperwork, simplified.</h1>
            <span className="forms-count-badge">
              {forms.length} ready-to-print forms
            </span>
          </div>
          <p className="forms-subheading-text">
            Find a form, fill in your details, and download or print it with Print-Fy.
          </p>
        </div>

        {/* Search & Filter Strip */}
        <div className="forms-search-filter-strip">
          <div className="forms-search-box">
            <SearchIcon size={18} color="#71717a" />
            <input
              type="text"
              placeholder="Search university forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="forms-search-input"
              aria-label="Search university forms"
            />
          </div>

          <div className="forms-category-pills" role="tablist" aria-label="Form Categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill-btn ${
                  selectedCategory === cat ? 'active' : ''
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Available Forms + Template Preview) */}
      <div className="forms-workspace-two-columns">
        {/* Left Column: Form Cards Grid */}
        <div className="available-forms-left-panel">
          <div className="forms-panel-header">
            <h2 className="panel-title">Available Forms</h2>
            <span className="panel-count-label">
              Showing all {filteredForms.length}
            </span>
          </div>

          {filteredForms.length === 0 ? (
            <div className="forms-empty-search-state">
              <FileTextIcon size={32} color="#a1a1aa" />
              <p>No university forms match your search criteria.</p>
            </div>
          ) : (
            <div className="forms-cards-catalog-grid">
              {filteredForms.map((form) => {
                const isSelected = form.id === selectedFormId;
                const isRealDisabled = !DEMO_MODE && !form.fileUrl;

                return (
                  <div
                    key={form.id}
                    onClick={() => setSelectedFormId(form.id)}
                    className={`form-catalog-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="card-top-header">
                      <div className="form-card-icon-bubble">
                        <FileTextIcon size={18} color="#6d28d9" />
                      </div>
                      <span className={`form-category-tag tag-${form.category.toLowerCase()}`}>
                        {form.category}
                      </span>
                    </div>

                    <h3 className="form-card-title">{form.title}</h3>
                    <p className="form-card-desc">{form.description}</p>
                    <span className="form-card-format-meta">{form.format}</span>

                    {/* Card Actions */}
                    <div className="form-card-action-bar">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFormId(form.id);
                        }}
                        className={`form-card-preview-btn ${isSelected ? 'viewing' : ''}`}
                      >
                        {isSelected ? 'Viewing' : 'Preview'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadForm(form);
                        }}
                        disabled={isRealDisabled}
                        className="form-card-download-btn"
                        title={isRealDisabled ? 'File not added yet' : 'Download Form'}
                      >
                        <DownloadIcon size={13} color={isRealDisabled ? '#a1a1aa' : '#551ee7'} />
                        <span>{isRealDisabled ? 'File not added yet' : 'Download'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintForm(form);
                        }}
                        disabled={isRealDisabled}
                        className="form-card-print-btn"
                        title={isRealDisabled ? 'File not added yet' : 'Print Form'}
                      >
                        <PrinterIcon size={13} color={isRealDisabled ? '#a1a1aa' : '#6d28d9'} />
                        <span>{isRealDisabled ? 'File not added yet' : 'Print'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="forms-footer-disclaimer-notice">
            <span className="disclaimer-icon">ℹ</span>
            <p>
              Print-Fy provides blank templates. Submit completed forms to the relevant
              university office for approval.
            </p>
          </div>
        </div>

        {/* Right Column: Template Preview Panel */}
        <div className="form-template-preview-right-panel">
          <div className="preview-panel-header">
            <h2 className="panel-title">Template Preview</h2>
            <span className="preview-type-badge">Blank template</span>
          </div>

          {activeForm && (
            <div className="preview-sheet-frame">
              {/* Paper Visual Representation */}
              <div className="paper-mockup-sheet">
                <div className="paper-office-header">
                  <span className="office-title-text">
                    {activeForm.previewDetails?.office || 'STUDENT AFFAIRS OFFICE'}
                  </span>
                  <h3 className="paper-form-headline">{activeForm.title.toUpperCase()}</h3>
                  <div className="paper-headline-underline" />
                </div>

                <div className="paper-subject-section">
                  <p><strong>To:</strong> The Head of Department</p>
                  <p><strong>Subject:</strong> {activeForm.previewDetails?.subject || 'Request'}</p>
                </div>

                <div className="paper-form-fields-grid">
                  {(activeForm.previewDetails?.fields || []).map((fieldName, idx) => (
                    <div key={idx} className="paper-field-line-item">
                      <span className="field-label-text">{fieldName}</span>
                      <div className="field-dotted-line" />
                    </div>
                  ))}
                </div>

                <div className="paper-footer-signatures-row">
                  <div className="signature-slot">
                    <div className="sig-underline" />
                    <span>Student signature</span>
                  </div>
                  <div className="signature-slot">
                    <div className="sig-underline" />
                    <span>Application date</span>
                  </div>
                </div>

                <span className="paper-page-bottom-index">
                  {activeForm.title} • Page 1 of {activeForm.pages}
                </span>
              </div>

              <div className="preview-bottom-actions-cluster">
                <span className="preview-page-indicator-text">
                  Page 1 of {activeForm.pages} • Full template preview
                </span>

                <div className="preview-buttons-row">
                  <button
                    type="button"
                    onClick={() => handleDownloadForm(activeForm)}
                    disabled={!DEMO_MODE && !activeForm.fileUrl}
                    className="preview-download-btn"
                  >
                    <DownloadIcon size={15} color="#191c1e" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePrintForm(activeForm)}
                    disabled={!DEMO_MODE && !activeForm.fileUrl}
                    className="preview-print-cta-btn"
                  >
                    <PrinterIcon size={15} color="#ffffff" />
                    <span>Print Form</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="preview-help-caption">
            Download to fill in your details, or print a blank copy and complete it by hand.
          </p>
        </div>
      </div>
    </div>
  );
}
