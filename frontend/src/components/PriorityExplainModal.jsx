import React from 'react';
import { X, Award, ShieldAlert, Users, Clock, Info, CheckCircle2 } from 'lucide-react';

export default function PriorityExplainModal({ complaint, onClose }) {
  if (!complaint) return null;

  const breakdown = complaint.priority_breakdown || {};
  const score = complaint.priority_score || 0;

  // Components
  const severityPts = breakdown.severity_component ?? 0;
  const supportPts = breakdown.support_component ?? 0;
  const urgencyPts = breakdown.urgency_component ?? 0;

  // Max scale representation for visual bars (normalized against typical score ~150)
  const maxScore = Math.max(score, 120);
  const severityPct = Math.min(100, Math.round((severityPts / maxScore) * 100));
  const supportPct = Math.min(100, Math.round((supportPts / maxScore) * 100));
  const urgencyPct = Math.min(100, Math.round((urgencyPts / maxScore) * 100));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Explainable Priority Engine
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Mathematical multi-factor urgency breakdown
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Main Hero Score Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
              color: 'white',
              borderRadius: '14px',
              padding: '1.4rem 1.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.3)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, fontWeight: 700 }}>
                Dynamic Priority Ranking
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
                  {score.toFixed(1)}
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, opacity: 0.85 }}>pts</span>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.35rem' }}>
                Ticket: <strong>{complaint.title}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge badge-${complaint.severity.toLowerCase()}`}>
                {complaint.severity} SEVERITY
              </span>
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>
                Category: <strong>{complaint.category}</strong>
              </div>
            </div>
          </div>

          {/* Component Factors Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Factor 1: Severity */}
            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1rem 1.15rem',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShieldAlert size={18} color="#dc2626" />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Base Severity Impact</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({breakdown.severity_level || complaint.severity} × 25)
                    </span>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '1rem' }}>
                  +{severityPts.toFixed(1)} pts
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${severityPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #f87171, #dc2626)',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>

            {/* Factor 2: Community Support */}
            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1rem 1.15rem',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Users size={18} color="#2563eb" />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Peer Community Support</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({breakdown.supporters_count ?? complaint.supporters_count ?? 0} upvotes × 10)
                    </span>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '1rem' }}>
                  +{supportPts.toFixed(1)} pts
                </div>
              </div>

              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${supportPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #60a5fa, #2563eb)',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>

            {/* Factor 3: Time Pending */}
            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1rem 1.15rem',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Clock size={18} color="#f59e0b" />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Urgency Over Time</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({breakdown.hours_pending ?? 0} hrs elapsed × 1.5)
                    </span>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1rem' }}>
                  +{urgencyPts.toFixed(1)} pts
                </div>
              </div>

              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${urgencyPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Transparent Formula Callout */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '0.9rem 1.1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
              <Info size={14} color="#2563eb" />
              <span>Auditable CampusCare Formula:</span>
            </div>
            <code
              style={{
                display: 'block',
                marginTop: '6px',
                fontSize: '0.825rem',
                fontFamily: 'monospace',
                color: '#0f172a',
                background: '#ffffff',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            >
              Score = (SeverityWeight × 25) + (Supporters × 10) + (HoursPending × 1.5)
            </code>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
