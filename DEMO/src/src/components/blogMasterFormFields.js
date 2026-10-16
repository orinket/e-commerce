'use client';

import { TagInput } from 'rsuite';
import JoditEditorComponent from './JoditEditor';

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
];

export const ROBOTS_OPTIONS = [
  { value: 'index', label: 'index' },
  { value: 'noindex', label: 'noindex' },
];

export const ARTICLE_TYPE_OPTIONS = [
  { value: 'BlogPosting', label: 'BlogPosting' },
  { value: 'NewsArticle', label: 'NewsArticle' },
];

export function SectionCard({ title, subtitle, children, className = '' }) {
  const showHeader = title || subtitle;
  return (
    <div className={`blog-master-section-card border rounded-3 p-3 p-lg-4 mb-0 bg-white shadow-sm ${className}`}>
      {showHeader ? (
        <div className="mb-3">
          {title ? <h3 className="h6 mb-1">{title}</h3> : null}
          {subtitle ? <div className="text-muted small">{subtitle}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function PreviewPill({ label, value }) {
  return (
    <div className="d-flex justify-content-between align-items-center rounded-3 border px-3 py-2 bg-light-subtle">
      <span className="small text-muted">{label}</span>
      <span className="small fw-semibold text-dark">{value}</span>
    </div>
  );
}

export function FieldError({ message }) {
  if (!message) return null;
  return <div className="text-danger small mt-1">{message}</div>;
}

export function TextField({ label, value, onChange, placeholder, error, type = 'text', readOnly = false }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        value={value || ''}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
      />
      <FieldError message={error} />
    </div>
  );
}

export function TextareaField({ label, value, onChange, placeholder, rows = 3, error, readOnly = false }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <textarea
        className={`form-control ${error ? 'is-invalid' : ''}`}
        value={value || ''}
        rows={rows}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
      />
      <FieldError message={error} />
    </div>
  );
}

export function SelectField({ label, value, onChange, options, error }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <select className={`form-select ${error ? 'is-invalid' : ''}`} value={value || ''} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  );
}

export function ToggleField({ label, checked, onChange }) {
  return (
    <label className="form-check form-switch mb-3 d-flex align-items-center gap-2">
      <input className="form-check-input mt-0" type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="form-check-label">{label}</span>
    </label>
  );
}

export function ImageField({ label, value, onChange, onUpload, uploading, helper }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input className="form-control mb-2" value={value || ''} placeholder="Paste image URL" onChange={(e) => onChange(e.target.value)} />
      <input
        type="file"
        className="form-control"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
      {helper ? <div className="text-muted small mt-1">{helper}</div> : null}
      {uploading ? <div className="text-primary small mt-1">Uploading...</div> : null}
      {value ? (
        <div className="mt-2">
          <img src={value} alt={label} className="img-fluid rounded border" style={{ maxHeight: 140, objectFit: 'cover' }} />
        </div>
      ) : null}
    </div>
  );
}
