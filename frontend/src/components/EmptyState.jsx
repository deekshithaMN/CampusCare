import React from 'react';
import { Layers } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Layers,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
}) {
  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '4rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'var(--primary-blue-light)',
          color: 'var(--primary-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          boxShadow: '0 2px 10px rgba(37, 99, 235, 0.15)',
        }}
      >
        <Icon size={28} />
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.5, marginBottom: actionLabel ? '1.5rem' : 0 }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
