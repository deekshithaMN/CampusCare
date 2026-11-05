import React, { useState } from 'react';
import {
  MapPin,
  ThumbsUp,
  HelpCircle,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Flame,
  Wrench,
  Zap,
  Wind,
  Home,
  Armchair,
  Sparkles,
  HelpCircle as QuestionIcon
} from 'lucide-react';

export default function ComplaintCard({
  complaint,
  onSupport,
  onViewDetails,
  onShowExplain,
  isAuthenticated,
}) {
  const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || 'http://127.0.0.1:8000';

  const imageUrl = complaint.image
    ? complaint.image.startsWith('http')
      ? complaint.image
      : `${mediaBase}${complaint.image}`
    : null;

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'PLUMBING': return <Wrench size={14} color="#0284c7" />;
      case 'ELECTRICAL': return <Zap size={14} color="#eab308" />;
      case 'HVAC': return <Wind size={14} color="#06b6d4" />;
      case 'STRUCTURAL': return <Home size={14} color="#8b5cf6" />;
      case 'FURNITURE': return <Armchair size={14} color="#f97316" />;
      case 'CLEANLINESS': return <Sparkles size={14} color="#10b981" />;
      default: return <QuestionIcon size={14} color="#64748b" />;
    }
  };

  const getStatusDotClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-dot pending';
      case 'IN_PROGRESS': return 'status-dot in_progress';
      case 'RESOLVED': return 'status-dot resolved';
      default: return 'status-dot';
    }
  };

  const isUrgent = complaint.priority_score >= 80;

  return (
    <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header Row */}
      <div
        style={{
          padding: '1.25rem 1.4rem 0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            {getCategoryIcon(complaint.category)}
            <span>{complaint.category}</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
            }}
          >
            <span className={getStatusDotClass(complaint.status)} />
            <span>{complaint.status.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Priority Score Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onShowExplain) onShowExplain(complaint);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            background: isUrgent ? '#fee2e2' : '#eff6ff',
            color: isUrgent ? '#b91c1c' : '#1d4ed8',
            border: `1px solid ${isUrgent ? '#fecaca' : '#bfdbfe'}`,
            transition: 'all 0.15s ease',
          }}
          title="Click to view explainable math score"
        >
          {isUrgent && <Flame size={12} color="#dc2626" />}
          <span>{complaint.priority_score.toFixed(1)} pts</span>
          <HelpCircle size={12} style={{ opacity: 0.7 }} />
        </button>
      </div>

      {/* Card Content Body */}
      <div
        style={{
          padding: '0.5rem 1.4rem 1.25rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          cursor: 'pointer',
        }}
        onClick={() => {
          if (onViewDetails) onViewDetails(complaint);
        }}
      >
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.35,
          }}
        >
          {complaint.title}
        </h3>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {complaint.description}
        </p>

        {/* Thumbnail Preview if photo attached */}
        {imageUrl && (
          <div
            style={{
              height: '140px',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#0f172a',
              marginTop: '0.25rem',
            }}
          >
            <img
              src={imageUrl}
              alt="Evidence"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Location & Metadata Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginTop: 'auto',
            paddingTop: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={13} color="#2563eb" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{complaint.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={13} />
            <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
          </div>
          {complaint.assigned_staff && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2563eb' }}>
              <User size={13} />
              <span>{complaint.assigned_staff.username}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div
        style={{
          padding: '0.75rem 1.4rem',
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bg-canvas)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onSupport) onSupport(complaint.id);
          }}
          disabled={!isAuthenticated || complaint.status === 'RESOLVED'}
          className={`btn btn-sm ${complaint.has_supported ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            borderRadius: '9999px',
            fontSize: '0.78rem',
            padding: '0.35rem 0.75rem',
          }}
        >
          <ThumbsUp size={13} />
          <span>{complaint.has_supported ? 'Supported' : 'Support Issue'}</span>
          <span
            style={{
              background: complaint.has_supported ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
              padding: '0.05rem 0.4rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            {complaint.supporters_count}
          </span>
        </button>

        <button
          onClick={() => {
            if (onViewDetails) onViewDetails(complaint);
          }}
          className="btn-icon"
          style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '2px' }}
        >
          <span>View Details</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
