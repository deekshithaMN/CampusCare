import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  User,
  ThumbsUp,
  CheckCircle2,
  Clock,
  PlayCircle,
  FileText,
  ShieldAlert,
  HelpCircle,
  Building2,
  Send,
  History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function ComplaintDetailsModal({
  complaint,
  onClose,
  onUpdated,
  onShowPriorityModal,
}) {
  const { user, isStaff } = useAuth();
  const toast = useToast();

  const [statusVal, setStatusVal] = useState(complaint?.status || 'PENDING');
  const [staffVal, setStaffVal] = useState(complaint?.assigned_staff?.id || '');
  const [notesVal, setNotesVal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [staffList, setStaffList] = useState([]);

  const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    if (complaint) {
      setStatusVal(complaint.status);
      setStaffVal(complaint.assigned_staff?.id || '');
    }

    if (isStaff) {
      api.get('/auth/staff/')
        .then((res) => setStaffList(res.data))
        .catch(() => {});
    }
  }, [complaint, isStaff]);

  if (!complaint) return null;

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        status: statusVal,
        notes: notesVal || `Status updated to ${statusVal} by ${user?.username}`,
      };
      if (staffVal) {
        payload.assigned_staff_id = staffVal;
      }

      const res = await api.patch(`/complaints/${complaint.id}/status/`, payload);
      toast.success(`Complaint status transitioned to ${statusVal}`);
      if (onUpdated) onUpdated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update complaint status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupportToggle = async () => {
    try {
      const res = await api.post(`/complaints/${complaint.id}/support/`);
      toast.success(res.data.message || 'Support registered!');
      if (onUpdated) {
        onUpdated({
          ...complaint,
          supporters_count: res.data.supporters_count,
          priority_score: res.data.new_priority_score,
          priority_breakdown: res.data.breakdown,
          has_supported: res.data.action === 'added',
        });
      }
    } catch (err) {
      toast.error('Could not support complaint');
    }
  };

  const imageUrl = complaint.image
    ? complaint.image.startsWith('http')
      ? complaint.image
      : `${mediaBase}${complaint.image}`
    : null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-pending">PENDING REVIEW</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-in_progress">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="badge badge-resolved">RESOLVED</span>;
      default:
        return <span className="badge badge-low">{status}</span>;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-${complaint.severity.toLowerCase()}`}>
              {complaint.category}
            </span>
            {getStatusBadge(complaint.status)}
            <button
              onClick={() => {
                if (onShowPriorityModal) onShowPriorityModal(complaint);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
              }}
              title="View priority score formula"
            >
              <span>Score: {complaint.priority_score.toFixed(1)} pts</span>
              <HelpCircle size={12} />
            </button>
          </div>

          <button onClick={onClose} className="btn-icon" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Title & Metadata */}
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {complaint.title}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              fontSize: '0.825rem',
              color: 'var(--text-muted)',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={15} color="#2563eb" />
              <strong style={{ color: 'var(--text-primary)' }}>{complaint.location}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={15} />
              <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={15} />
              <span>Reported by: <strong>{complaint.student?.username || 'Student'}</strong></span>
            </div>
          </div>

          {/* Description */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '1.15rem',
              fontSize: '0.925rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: '1.25rem',
              whiteSpace: 'pre-line',
            }}
          >
            {complaint.description}
          </div>

          {/* Uploaded Photograph (if available) */}
          {imageUrl && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Sanitized Photographic Evidence
              </div>
              <div
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  maxHeight: '340px',
                  border: '1px solid var(--border-subtle)',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={imageUrl}
                  alt={complaint.title}
                  style={{ width: '100%', maxHeight: '340px', objectFit: 'contain' }}
                />
              </div>
            </div>
          )}

          {/* Staff Assignment & Resolution Box (if Staff or Admin) */}
          {isStaff && (
            <div
              style={{
                border: '1.5px solid #bfdbfe',
                background: '#f8faff',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.85rem' }}>
                Maintenance Operations & Status Dispatch
              </h4>

              <form onSubmit={handleStatusSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Update Status</label>
                    <select
                      className="form-select"
                      value={statusVal}
                      onChange={(e) => setStatusVal(e.target.value)}
                    >
                      <option value="PENDING">Pending Review</option>
                      <option value="IN_PROGRESS">In Progress (Dispatched)</option>
                      <option value="RESOLVED">Resolved (Completed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Assign Staff Member</label>
                    <select
                      className="form-select"
                      value={staffVal}
                      onChange={(e) => setStaffVal(e.target.value)}
                    >
                      <option value="">Auto-Assign (Self: {user?.username})</option>
                      {staffList.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.username} {st.department ? `(${st.department})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Resolution Remarks / Dispatch Log</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Replaced leaking valve and cleared hallway floor."
                    value={notesVal}
                    onChange={(e) => setNotesVal(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', padding: '0.6rem' }}
                >
                  <Send size={15} />
                  <span>{submitting ? 'Updating...' : 'Save Status & Log Update'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Audit Trail Timeline */}
          {complaint.status_logs && complaint.status_logs.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
                <History size={16} color="#2563eb" />
                <span>Status Change Audit History</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {complaint.status_logs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      padding: '0.65rem 0.85rem',
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>
                      <CheckCircle2 size={15} color="#16a34a" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        Status: <span style={{ color: '#2563eb' }}>{log.old_status}</span> → <span style={{ color: '#16a34a' }}>{log.new_status}</span>
                      </div>
                      {log.notes && (
                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                          "{log.notes}"
                        </div>
                      )}
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                        By {log.changed_by_username || 'Staff'} • {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            onClick={handleSupportToggle}
            className={`btn btn-sm ${complaint.has_supported ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '9999px', display: 'flex', gap: '0.4rem' }}
          >
            <ThumbsUp size={14} />
            <span>{complaint.has_supported ? 'Supported' : 'Support Issue'}</span>
            <span
              style={{
                background: complaint.has_supported ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {complaint.supporters_count}
            </span>
          </button>

          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
