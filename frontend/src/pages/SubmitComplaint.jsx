import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DuplicateAlertModal from '../components/DuplicateAlertModal';
import { useToast } from '../context/ToastContext';
import {
  Send,
  Upload,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  X,
  MapPin,
  Wrench,
  Zap,
  Wind,
  Home,
  Armchair,
  HelpCircle,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';

const CATEGORIES = [
  { id: 'PLUMBING', label: 'Plumbing', icon: Wrench, color: '#0284c7' },
  { id: 'ELECTRICAL', label: 'Electrical', icon: Zap, color: '#eab308' },
  { id: 'HVAC', label: 'HVAC / Climate', icon: Wind, color: '#06b6d4' },
  { id: 'STRUCTURAL', label: 'Structural', icon: Home, color: '#8b5cf6' },
  { id: 'FURNITURE', label: 'Furniture', icon: Armchair, color: '#f97316' },
  { id: 'CLEANLINESS', label: 'Cleanliness', icon: Sparkles, color: '#10b981' },
  { id: 'OTHER', label: 'Other', icon: HelpCircle, color: '#64748b' },
];

const SEVERITIES = [
  { id: 'LOW', label: 'Low', desc: 'Cosmetic / Minor issue', weight: '1.0x (+25 pts)', color: '#0284c7', bg: '#eff6ff' },
  { id: 'MEDIUM', label: 'Medium', desc: 'Affects daily routine', weight: '2.0x (+50 pts)', color: '#d97706', bg: '#fffbeb' },
  { id: 'HIGH', label: 'High', desc: 'Active disruption / leak', weight: '3.5x (+87.5 pts)', color: '#ea580c', bg: '#fff7ed' },
  { id: 'CRITICAL', label: 'Critical', desc: 'Safety hazard / urgent', weight: '5.0x (+125 pts)', color: '#dc2626', bg: '#fef2f2' },
];

const LANDMARKS = [
  'Science Block - 1st Floor Restroom',
  'Library - 2nd Floor Reading Hall',
  'Engineering Hall - Room 101',
  'Auditorium Main Stage',
  'Hostel Block A - Ground Floor',
  'Dining Hall / Cafeteria',
];

export default function SubmitComplaint() {
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'PLUMBING',
    location: '',
    description: '',
    severity: 'MEDIUM',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Duplicate engine state
  const [duplicateCandidates, setDuplicateCandidates] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [scanningDuplicates, setScanningDuplicates] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Debounced duplicate detection
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title.trim().length >= 6 && formData.location.trim().length >= 3) {
        checkDuplicates();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, formData.category, formData.location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5 MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const checkDuplicates = async () => {
    setScanningDuplicates(true);
    try {
      const res = await api.post('/complaints/check-duplicate/', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
      });

      if (res.data.duplicates_found && res.data.candidates.length > 0) {
        setDuplicateCandidates(res.data.candidates);
        setShowDuplicateModal(true);
      }
    } catch (err) {
      console.warn('Duplicate check non-blocking note:', err);
    } finally {
      setScanningDuplicates(false);
    }
  };

  const handleSupportExisting = async (existingId) => {
    try {
      await api.post(`/complaints/${existingId}/support/`);
      toast.success('Successfully supported existing issue! Duplicate report prevented.');
      setShowDuplicateModal(false);
      navigate('/feed');
    } catch (err) {
      toast.error('Failed to support existing issue');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.location.trim() || !formData.description.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('location', formData.location.trim());
      data.append('description', formData.description.trim());
      data.append('severity', formData.severity);
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await api.post('/complaints/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Maintenance report submitted successfully!');
      navigate('/feed');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to submit complaint. Please check your connection.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Report a Maintenance Issue
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Your report will be automatically prioritized, analyzed for duplicates, and dispatched to campus maintenance.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            padding: '0.85rem 1.15rem',
            borderRadius: '10px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Step 1: Category Picker */}
        <div>
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>1. Issue Category</span>
            <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>Select discipline</span>
          </label>

          <div className="category-grid">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`category-tile ${isSelected ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isSelected ? '#ffffff' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cat.color,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="cat-label">{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Severity Selector */}
        <div>
          <label className="form-label">
            <span>2. Severity Level</span>
            <span className="form-label-hint">Determines initial base priority calculation</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
            {SEVERITIES.map((sev) => {
              const isSelected = formData.severity === sev.id;

              return (
                <div
                  key={sev.id}
                  onClick={() => setFormData({ ...formData, severity: sev.id })}
                  style={{
                    border: isSelected ? `2px solid ${sev.color}` : '1.5px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    background: isSelected ? sev.bg : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? sev.color : 'var(--text-primary)' }}>
                      {sev.label}
                    </span>
                    {isSelected && <CheckCircle2 size={15} color={sev.color} />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {sev.desc}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: sev.color, marginTop: '6px' }}>
                    {sev.weight}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Location */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <span>3. Specific Location</span>
            <span className="form-label-hint">Building, floor, and room number</span>
          </label>
          <div style={{ position: 'relative' }}>
            <MapPin size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              name="location"
              required
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="e.g. Science Block - 1st Floor Men's Restroom"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          {/* Quick Landmark Chips */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Quick fill:</span>
            {LANDMARKS.map((mark) => (
              <button
                key={mark}
                type="button"
                onClick={() => setFormData({ ...formData, location: mark })}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {mark}
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Title & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <span>4. Issue Title</span>
              <span className="form-label-hint">Concise summary</span>
            </label>
            <input
              type="text"
              name="title"
              required
              className="form-input"
              placeholder="e.g. Broken water tap flooding 1st floor restroom"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <span>5. Detailed Description</span>
              <span className="form-label-hint">Include scope of damage, safety concerns, or specifics</span>
            </label>
            <textarea
              name="description"
              rows={4}
              required
              className="form-textarea"
              placeholder="Describe what is broken, what equipment is affected, and any safety precautions needed..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Real-time AI Duplicate Scanner Status Indicator */}
        {scanningDuplicates && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#2563eb' }}>
            <Sparkles size={14} className="animate-spin" />
            <span>Scanning active campus reports for duplicate tickets...</span>
          </div>
        )}

        {/* Step 5: Drag-and-Drop Photo Uploader */}
        <div>
          <label className="form-label">
            <span>6. Photographic Evidence (Optional)</span>
            <span className="form-label-hint">Images are automatically stripped of private GPS/EXIF data</span>
          </label>

          {!imagePreview ? (
            <div
              className={`dropzone ${isDragging ? 'active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              />
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                }}
              >
                <Upload size={22} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Click to upload or drag and drop photo
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Supports JPEG, PNG, or WebP (Max 5 MB)
              </div>
            </div>
          ) : (
            <div
              style={{
                border: '1.5px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: '#f8fafc',
              }}
            >
              <img
                src={imagePreview}
                alt="Upload preview"
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {imageFile?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {(imageFile?.size / (1024 * 1024)).toFixed(2)} MB • Ready for OpenCV Sanitization
                </div>
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="btn btn-outline btn-sm"
                style={{ color: '#dc2626' }}
              >
                <X size={15} />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }}
        >
          <Send size={18} />
          <span>{submitting ? 'Vectorizing & Submitting...' : 'Submit Maintenance Report'}</span>
        </button>
      </form>

      {/* Duplicate Alert Modal */}
      {showDuplicateModal && (
        <DuplicateAlertModal
          candidates={duplicateCandidates}
          onSupportExisting={handleSupportExisting}
          onIgnoreAndProceed={() => setShowDuplicateModal(false)}
          onClose={() => setShowDuplicateModal(false)}
        />
      )}
    </div>
  );
}
