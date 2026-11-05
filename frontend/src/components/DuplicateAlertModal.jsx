import React from 'react';
import { AlertTriangle, ThumbsUp, ArrowRight, X, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

export default function DuplicateAlertModal({ candidates, onSupportExisting, onIgnoreAndProceed, onClose }) {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header" style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#92400e' }}>
                Similar Complaints Detected
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#b45309' }}>
                Our AI duplicate engine identified existing open tickets matching your description.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" aria-label="Close">
            <X size={18} color="#92400e" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            To avoid duplicate maintenance dispatches and resolve issues faster, we recommend supporting the existing ticket. Supporting directly adds <strong>+10 priority points</strong> to the repair queue!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {candidates.map((cand) => {
              const scorePct = cand.similarity_percentage || Math.round((cand.similarity_score || 0.75) * 100);

              return (
                <div
                  key={cand.complaint_id}
                  style={{
                    border: '1.5px solid #fde68a',
                    background: '#fffdf5',
                    borderRadius: '12px',
                    padding: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    transition: 'box-shadow 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span
                          style={{
                            background: '#f59e0b',
                            color: '#ffffff',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Sparkles size={11} />
                          {scorePct}% SIMILARITY
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {cand.category}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {cand.title}
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        <MapPin size={13} />
                        <span>{cand.location}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSupportExisting(cand.complaint_id)}
                      className="btn btn-primary btn-sm"
                      style={{
                        padding: '0.5rem 0.85rem',
                        background: '#2563eb',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                      }}
                    >
                      <ThumbsUp size={14} />
                      <span>Support This Issue</span>
                    </button>
                  </div>

                  {/* AI Similarity Metric Badges */}
                  {cand.metrics && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(245, 158, 11, 0.2)',
                        fontSize: '0.72rem',
                        color: '#92400e',
                      }}
                    >
                      <span>RapidFuzz Lexical: <strong>{Math.round(cand.metrics.lexical_score * 100)}%</strong></span>
                      <span>•</span>
                      <span>TF-IDF Semantic: <strong>{Math.round(cand.metrics.semantic_score * 100)}%</strong></span>
                      <span>•</span>
                      <span>Location: <strong>{Math.round(cand.metrics.location_score * 100)}%</strong></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onIgnoreAndProceed}
          >
            My issue is different (Submit Anyway)
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Review My Draft
          </button>
        </div>
      </div>
    </div>
  );
}
