import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import {
  Sliders,
  ShieldAlert,
  Users,
  Clock,
  Sparkles,
  Calculator,
  HelpCircle,
  Flame,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import PriorityExplainModal from '../components/PriorityExplainModal';

export default function PriorityManagement() {
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explainComplaint, setExplainComplaint] = useState(null);

  // Interactive Simulator State
  const [simSeverity, setSimSeverity] = useState('HIGH');
  const [simSupporters, setSimSupporters] = useState(4);
  const [simHours, setSimHours] = useState(12);

  const SEVERITY_WEIGHTS = {
    LOW: 1.0,
    MEDIUM: 2.0,
    HIGH: 3.5,
    CRITICAL: 5.0,
  };

  const simSeverityPts = (SEVERITY_WEIGHTS[simSeverity] || 1.0) * 25.0;
  const simSupportPts = simSupporters * 10.0;
  const simUrgencyPts = simHours * 1.5;
  const simTotalScore = simSeverityPts + simSupportPts + simUrgencyPts;

  useEffect(() => {
    api.get('/complaints/?ordering=-priority_score')
      .then((res) => setComplaints(res.data))
      .catch(() => toast.error('Failed to load priority queue'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Explainable Priority Engine & Sandbox
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Inspect why complaints rank where they do, audit formula weights, and simulate priority scoring in real time.
        </p>
      </div>

      {/* Interactive Simulator Section */}
      <div
        className="card"
        style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
          border: '1.5px solid #bfdbfe',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calculator size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Live Algorithm Simulator</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Adjust variables to test how CampusCare prioritizes institutional complaints
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Severity slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                <span>Severity Level:</span>
                <span style={{ color: '#2563eb' }}>{simSeverity} ({SEVERITY_WEIGHTS[simSeverity]}x)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSimSeverity(lvl)}
                    className={`btn btn-sm ${simSeverity === lvl ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0' }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Supporters slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                <span>Community Upvotes / Supporters:</span>
                <span style={{ color: '#2563eb' }}>{simSupporters} students</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={simSupporters}
                onChange={(e) => setSimSupporters(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>0</span>
                <span>15 students</span>
                <span>30 students</span>
              </div>
            </div>

            {/* Hours pending slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                <span>Time Pending Resolution:</span>
                <span style={{ color: '#2563eb' }}>{simHours} hours</span>
              </div>
              <input
                type="range"
                min="0"
                max="72"
                value={simHours}
                onChange={(e) => setSimHours(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>0 hrs</span>
                <span>36 hrs</span>
                <span>72 hrs</span>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
              color: 'white',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85 }}>
              Simulated Priority Score
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.4rem 0 1rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>
                {simTotalScore.toFixed(1)}
              </span>
              <span style={{ fontSize: '1.25rem', opacity: 0.85 }}>pts</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.85 }}>Base Severity Contribution:</span>
                <strong>+{simSeverityPts.toFixed(1)} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.85 }}>Community Upvotes (+10/ea):</span>
                <strong>+{simSupportPts.toFixed(1)} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.85 }}>Urgency Elapsed (+1.5/hr):</span>
                <strong>+{simUrgencyPts.toFixed(1)} pts</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Priority Queue Ranking */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Current Campus Live Priority Ranking
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Real tickets currently active in the database ranked in descending order of urgency score.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {complaints.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setExplainComplaint(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                background: '#ffffff',
                cursor: 'pointer',
              }}
              className="card-interactive"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: index === 0 ? '#fee2e2' : '#f1f5f9',
                    color: index === 0 ? '#dc2626' : 'var(--text-secondary)',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                  }}
                >
                  #{index + 1}
                </div>

                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    📍 {item.location} • Category: {item.category} • Supporters: {item.supporters_count}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    background: item.priority_score >= 80 ? '#fee2e2' : '#eff6ff',
                    color: item.priority_score >= 80 ? '#b91c1c' : '#1d4ed8',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                  }}
                >
                  {item.priority_score.toFixed(1)} pts
                </span>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {explainComplaint && (
        <PriorityExplainModal
          complaint={explainComplaint}
          onClose={() => setExplainComplaint(null)}
        />
      )}
    </div>
  );
}
