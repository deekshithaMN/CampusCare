import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  ThumbsUp,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { MetricSkeleton, CardSkeleton } from '../components/SkeletonLoader';
import ComplaintCard from '../components/ComplaintCard';
import PriorityExplainModal from '../components/PriorityExplainModal';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';
import { useToast } from '../context/ToastContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    myReports: 0,
    supported: 0,
    resolved: 0,
  });
  const [explainComplaint, setExplainComplaint] = useState(null);
  const [detailsComplaint, setDetailsComplaint] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/');
      const allComplaints = res.data;
      setComplaints(allComplaints);

      const myReports = allComplaints.filter((c) => c.student?.id === user?.id || c.student?.email === user?.email).length;
      const supported = allComplaints.filter((c) => c.has_supported).length;
      const resolved = allComplaints.filter((c) => c.status === 'RESOLVED').length;

      setStats({
        total: allComplaints.length,
        myReports,
        supported,
        resolved,
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSupport = async (id) => {
    try {
      const res = await api.post(`/complaints/${id}/support/`);
      toast.success(res.data.message || 'Updated support');
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? {
          ...c,
          supporters_count: res.data.supporters_count,
          priority_score: res.data.new_priority_score,
          priority_breakdown: res.data.breakdown,
          has_supported: res.data.action === 'added',
        } : c))
      );
    } catch (err) {
      toast.error('Could not support complaint');
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '2rem 2.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ zIndex: 1, maxWidth: '600px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#93c5fd',
              marginBottom: '0.75rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Sparkles size={12} />
            <span>CAMPUS FACILITIES LIVE PORTAL</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {getTimeGreeting()}, {user?.username || 'Student'}!
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Report broken campus infrastructure, support peer complaints to prevent duplicate tickets, and track live repair progress.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Link to="/submit" className="btn btn-primary btn-sm" style={{ padding: '0.6rem 1.2rem', gap: '0.5rem' }}>
              <PlusCircle size={16} />
              <span>Report Issue Now</span>
            </Link>
            <Link to="/feed" className="btn btn-secondary btn-sm" style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span>Explore Campus Feed</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div
          style={{
            zIndex: 1,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            textAlign: 'right',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#93c5fd', fontWeight: 700 }}>
            Active Campus Resolution Rate
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, margin: '0.25rem 0' }}>
            {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 85}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
            {stats.resolved} of {stats.total} total reports resolved
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      {loading ? (
        <MetricSkeleton count={4} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div className="metric-card primary">
            <div className="metric-header">
              <span className="metric-label">Campus Reports</span>
              <div className="metric-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Building2 size={20} />
              </div>
            </div>
            <div className="metric-value">{stats.total}</div>
            <div className="metric-footer">
              <span style={{ color: '#2563eb', fontWeight: 700 }}>Total Open Tickets</span>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-header">
              <span className="metric-label">My Submissions</span>
              <div className="metric-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Clock size={20} />
              </div>
            </div>
            <div className="metric-value">{stats.myReports}</div>
            <div className="metric-footer">
              <span style={{ color: '#b45309', fontWeight: 700 }}>Logged by you</span>
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-header">
              <span className="metric-label">Supported by You</span>
              <div className="metric-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <ThumbsUp size={20} />
              </div>
            </div>
            <div className="metric-value">{stats.supported}</div>
            <div className="metric-footer">
              <span style={{ color: '#16a34a', fontWeight: 700 }}>+10 pts priority contribution</span>
            </div>
          </div>

          <div className="metric-card danger">
            <div className="metric-header">
              <span className="metric-label">Resolved Issues</span>
              <div className="metric-icon-wrap" style={{ background: '#fee2e2', color: '#dc2626' }}>
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="metric-value">{stats.resolved}</div>
            <div className="metric-footer">
              <span style={{ color: '#dc2626', fontWeight: 700 }}>Work verified completed</span>
            </div>
          </div>
        </div>
      )}

      {/* High-Impact & Urgent Campus Complaints */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              High-Priority Campus Issues
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Top complaints ranked by severity, affected student upvotes, and elapsed time.
            </p>
          </div>

          <Link to="/feed" className="btn btn-secondary btn-sm">
            <span>View All ({complaints.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : complaints.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <CheckCircle2 size={40} color="#16a34a" style={{ margin: '0 auto 0.75rem' }} />
            <h3>No Active Complaints</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Campus facilities are fully operational!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
            {complaints.slice(0, 3).map((item) => (
              <ComplaintCard
                key={item.id}
                complaint={item}
                onSupport={handleSupport}
                onViewDetails={setDetailsComplaint}
                onShowExplain={setExplainComplaint}
                isAuthenticated={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {explainComplaint && (
        <PriorityExplainModal
          complaint={explainComplaint}
          onClose={() => setExplainComplaint(null)}
        />
      )}

      {detailsComplaint && (
        <ComplaintDetailsModal
          complaint={detailsComplaint}
          onClose={() => setDetailsComplaint(null)}
          onUpdated={(updated) => {
            setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          }}
          onShowPriorityModal={(c) => {
            setDetailsComplaint(null);
            setExplainComplaint(c);
          }}
        />
      )}
    </div>
  );
}
