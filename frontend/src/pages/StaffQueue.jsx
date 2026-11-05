import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TableSkeleton, MetricSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import PriorityExplainModal from '../components/PriorityExplainModal';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';
import {
  ListFilter,
  CheckCircle2,
  Clock,
  PlayCircle,
  UserCheck,
  AlertCircle,
  Search,
  Filter,
  Send,
  MessageSquare,
  Wrench,
  Flame,
  ArrowUpDown
} from 'lucide-react';

export default function StaffQueue() {
  const { user } = useAuth();
  const toast = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [explainComplaint, setExplainComplaint] = useState(null);
  const [detailsComplaint, setDetailsComplaint] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const params = { ordering: '-priority_score' };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const [complaintsRes, staffRes] = await Promise.all([
        api.get('/complaints/', { params }),
        api.get('/auth/staff/').catch(() => ({ data: [] })),
      ]);

      let data = complaintsRes.data;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        data = data.filter((c) =>
          c.title.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
        );
      }

      setComplaints(data);
      setStaffList(staffRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dispatch queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter, categoryFilter]);

  const handleQuickStatusChange = async (complaintId, newStatus, staffId = null) => {
    setSubmittingStatus(true);
    try {
      const payload = {
        status: newStatus,
        notes: resolutionNotes || `Status updated to ${newStatus} by ${user.username}`,
      };
      if (staffId) {
        payload.assigned_staff_id = staffId;
      } else if (!complaintId.assigned_staff) {
        payload.assigned_staff_id = user.id;
      }

      await api.patch(`/complaints/${complaintId}/status/`, payload);
      toast.success(`Complaint status changed to ${newStatus}`);
      setSelectedComplaint(null);
      setResolutionNotes('');
      fetchQueue();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update complaint status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const pendingCount = complaints.filter((c) => c.status === 'PENDING').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Maintenance Dispatch & Triage Queue
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Assign maintenance teams, log repair updates, and manage campus facilities workflow.
        </p>
      </div>

      {/* KPI Triage Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="metric-card warning">
          <div className="metric-header">
            <span className="metric-label">Needs Triage</span>
            <div className="metric-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="metric-value">{pendingCount}</div>
          <div className="metric-footer">
            <span style={{ color: '#b45309', fontWeight: 700 }}>Pending Review</span>
          </div>
        </div>

        <div className="metric-card primary">
          <div className="metric-header">
            <span className="metric-label">In Repair</span>
            <div className="metric-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <PlayCircle size={20} />
            </div>
          </div>
          <div className="metric-value">{inProgressCount}</div>
          <div className="metric-footer">
            <span style={{ color: '#2563eb', fontWeight: 700 }}>Actively Dispatched</span>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-header">
            <span className="metric-label">Completed</span>
            <div className="metric-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="metric-value">{resolvedCount}</div>
          <div className="metric-footer">
            <span style={{ color: '#16a34a', fontWeight: 700 }}>Resolved</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search keyword or room..."
              className="form-input"
              style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.85rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchQueue()}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.85rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="STRUCTURAL">Structural</option>
            <option value="FURNITURE">Furniture</option>
            <option value="CLEANLINESS">Cleanliness</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <button onClick={fetchQueue} className="btn btn-secondary btn-sm">
          Refresh Queue
        </button>
      </div>

      {/* Dispatch Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="Dispatch queue empty"
          description="All reported campus maintenance tickets have been processed or resolved."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Priority</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Issue & Location</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Assigned Staff</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Workflow Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: '1px solid var(--border-light)' }}
                  className="card-interactive"
                  onClick={() => setDetailsComplaint(c)}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExplainComplaint(c);
                      }}
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        background: c.priority_score >= 80 ? '#fee2e2' : '#eff6ff',
                        color: c.priority_score >= 80 ? '#b91c1c' : '#1d4ed8',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      title="Inspect math formula"
                    >
                      {c.priority_score >= 80 && <Flame size={12} color="#dc2626" />}
                      <span>{c.priority_score.toFixed(1)} pts</span>
                    </button>
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📍 {c.location} • By {c.student?.username}
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className="badge badge-low">{c.category}</span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={`badge badge-${c.status.toLowerCase()}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }} onClick={(e) => e.stopPropagation()}>
                    {c.assigned_staff ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', fontWeight: 600 }}>
                        <UserCheck size={14} color="#16a34a" />
                        <span>{c.assigned_staff.username}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleQuickStatusChange(c.id, 'IN_PROGRESS', user.id)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                      >
                        Assign to Me
                      </button>
                    )}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      {c.status === 'PENDING' && (
                        <button
                          onClick={() => handleQuickStatusChange(c.id, 'IN_PROGRESS')}
                          disabled={submittingStatus}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <PlayCircle size={13} />
                          <span>Start Work</span>
                        </button>
                      )}

                      {c.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => setDetailsComplaint(c)}
                          className="btn btn-sm"
                          style={{ background: '#16a34a', color: 'white', fontSize: '0.75rem' }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Resolve</span>
                        </button>
                      )}

                      {c.status === 'RESOLVED' && (
                        <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.78rem' }}>
                          ✓ Completed
                        </span>
                      )}

                      <button
                        onClick={() => setDetailsComplaint(c)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          onUpdated={() => fetchQueue()}
          onShowPriorityModal={(c) => {
            setDetailsComplaint(null);
            setExplainComplaint(c);
          }}
        />
      )}
    </div>
  );
}
