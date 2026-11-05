import React from 'react';

export function CardSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="skeleton" style={{ width: '80px', height: '24px' }} />
            <div className="skeleton" style={{ width: '60px', height: '24px' }} />
          </div>
          <div className="skeleton" style={{ width: '70%', height: '22px' }} />
          <div className="skeleton" style={{ width: '100%', height: '40px' }} />
          <div className="skeleton" style={{ width: '100%', height: '140px', borderRadius: '8px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
            <div className="skeleton" style={{ width: '100px', height: '18px' }} />
            <div className="skeleton" style={{ width: '80px', height: '30px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div className="skeleton" style={{ width: '50px', height: '32px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ flex: 1, height: '22px' }} />
            <div className="skeleton" style={{ width: '100px', height: '22px' }} />
            <div className="skeleton" style={{ width: '80px', height: '22px' }} />
            <div className="skeleton" style={{ width: '110px', height: '32px', borderRadius: '6px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricSkeleton({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: '90px', height: '16px' }} />
            <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
          </div>
          <div className="skeleton" style={{ width: '70px', height: '38px', margin: '0.5rem 0' }} />
          <div className="skeleton" style={{ width: '120px', height: '14px' }} />
        </div>
      ))}
    </div>
  );
}
