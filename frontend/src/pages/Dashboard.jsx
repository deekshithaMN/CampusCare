import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { MetricSkeleton } from '../components/SkeletonLoader';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListChecks,
  Flame,
  TrendingUp,
  Percent,
  Layers,
  MapPin,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/complaints/dashboard-stats/');
        setStats(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load analytics metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <MetricSkeleton count={4} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3>No analytics data available</h3>
      </div>
    );
  }

  const { summary, category_distribution, urgent_complaints } = stats;
  const resolutionRate = summary.total > 0 ? Math.round((summary.resolved / summary.total) * 100) : 0;

  // Category color map
  const getCatColor = (index) => {
    const colors = ['#2563eb', '#0284c7', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];
    return colors[index % colors.length];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Campus Facilities Analytics & Throughput
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Real-time institutional maintenance metrics, resolution rate, and category distribution.
        </p>
      </div>

      {/* Stripe-style KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="metric-card primary">
          <div className="metric-header">
            <span className="metric-label">Total Reports</span>
            <div className="metric-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <ListChecks size={20} />
            </div>
          </div>
          <div className="metric-value">{summary.total}</div>
          <div className="metric-footer">
            <span style={{ color: '#2563eb', fontWeight: 700 }}>100% of campus volume</span>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-header">
            <span className="metric-label">Pending Review</span>
            <div className="metric-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="metric-value">{summary.pending}</div>
          <div className="metric-footer">
            <span style={{ color: '#b45309', fontWeight: 700 }}>Awaiting dispatch triage</span>
          </div>
        </div>

        <div className="metric-card primary">
          <div className="metric-header">
            <span className="metric-label">In Progress</span>
            <div className="metric-icon-wrap" style={{ background: '#e0e7ff', color: '#4338ca' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="metric-value">{summary.in_progress}</div>
          <div className="metric-footer">
            <span style={{ color: '#4338ca', fontWeight: 700 }}>Staff actively repairing</span>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-header">
            <span className="metric-label">Resolution Rate</span>
            <div className="metric-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="metric-value">{resolutionRate}%</div>
          <div className="metric-footer">
            <span style={{ color: '#16a34a', fontWeight: 700 }}>{summary.resolved} resolved tickets</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Category Breakdown Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Complaints by Category</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Proportion of campus maintenance requests</p>
            </div>
            <BarChart3 size={20} color="#2563eb" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {Object.entries(category_distribution).map(([cat, count], idx) => {
              const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
              const barColor = getCatColor(idx);

              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cat}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                      {count} reports ({pct}%)
                    </span>
                  </div>

                  <div style={{ height: '9px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: barColor,
                        borderRadius: '9999px',
                        transition: 'width 0.5s ease-out',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Highest Priority Active Issues Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flame size={22} color="#dc2626" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Urgent Priority Queue</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active tickets with highest algorithm score</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {urgent_complaints && urgent_complaints.length > 0 ? (
              urgent_complaints.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.9rem 1.1rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    background: '#ffffff',
                    transition: 'box-shadow 0.15s ease',
                  }}
                  className="card-interactive"
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📍 {item.location} • {item.category}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      marginLeft: '0.75rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.priority_score.toFixed(1)} pts
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No urgent tickets active
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
