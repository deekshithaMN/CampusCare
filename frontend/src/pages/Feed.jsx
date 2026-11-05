import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ComplaintCard from '../components/ComplaintCard';
import { CardSkeleton, TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import PriorityExplainModal from '../components/PriorityExplainModal';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';
import { useToast } from '../context/ToastContext';
import {
  Filter,
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function Feed({ filterMyReports = false, filterAssignedToMe = false }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [sortBy, setSortBy] = useState('-priority_score');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [explainComplaint, setExplainComplaint] = useState(null);
  const [detailsComplaint, setDetailsComplaint] = useState(null);

  const { user, isAuthenticated, isStaff } = useAuth();
  const toast = useToast();

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (sortBy) params.ordering = sortBy;

      const res = await api.get('/complaints/', { params });
      let data = res.data;

      // Filter My Reports if requested
      if (filterMyReports && user) {
        data = data.filter((c) => c.student?.id === user.id || c.student?.email === user.email);
      }

      // Filter Assigned To Me if requested
      if (filterAssignedToMe && user) {
        data = data.filter((c) => c.assigned_staff?.id === user.id || c.assigned_staff?.email === user.email);
      }

      // Client-side search & severity filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        data = data.filter((c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
        );
      }

      if (severityFilter) {
        data = data.filter((c) => c.severity === severityFilter);
      }

      setComplaints(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load complaints feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [categoryFilter, statusFilter, severityFilter, sortBy, filterMyReports, filterAssignedToMe]);

  const handleSupport = async (id) => {
    try {
      const res = await api.post(`/complaints/${id}/support/`);
      toast.success(res.data.message || 'Support action recorded');
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

  const getPageTitle = () => {
    if (filterMyReports) return 'My Reported Complaints';
    if (filterAssignedToMe) return 'Complaints Assigned to You';
    return 'Explore Campus Complaints';
  };

  const getPageSubtitle = () => {
    if (filterMyReports) return 'Track repair statuses and student community support for your submissions.';
    if (filterAssignedToMe) return 'Maintenance tickets currently assigned to your dispatch queue.';
    return 'Live campus maintenance requests prioritized by explainable multi-factor scoring.';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Title & View Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {getPageTitle()}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {getPageSubtitle()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* View mode toggle */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className="btn-icon"
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none',
                color: viewMode === 'grid' ? '#0f172a' : '#64748b',
              }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className="btn-icon"
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                boxShadow: viewMode === 'table' ? 'var(--shadow-xs)' : 'none',
                color: viewMode === 'table' ? '#0f172a' : '#64748b',
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          <button onClick={fetchComplaints} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
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
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search keyword or room..."
              className="form-input"
              style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.85rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchComplaints()}
            />
          </div>

          {/* Category Dropdown */}
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.85rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="HVAC">HVAC / Climate</option>
            <option value="STRUCTURAL">Structural</option>
            <option value="FURNITURE">Furniture</option>
            <option value="CLEANLINESS">Cleanliness</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Status Dropdown */}
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

          {/* Severity Dropdown */}
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.85rem' }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <ArrowUpDown size={14} />
          <span>Sort:</span>
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.85rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="-priority_score">Highest Priority</option>
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        viewMode === 'grid' ? <CardSkeleton count={6} /> : <TableSkeleton rows={6} />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints matching criteria"
          description="Try clearing your search query or selecting a different category filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setCategoryFilter('');
            setStatusFilter('');
            setSeverityFilter('');
          }}
        />
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {complaints.map((item) => (
            <ComplaintCard
              key={item.id}
              complaint={item}
              onSupport={handleSupport}
              onViewDetails={setDetailsComplaint}
              onShowExplain={setExplainComplaint}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Priority</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Issue & Location</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Supporters</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                  onClick={() => setDetailsComplaint(c)}
                  className="card-interactive"
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExplainComplaint(c);
                      }}
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        background: c.priority_score >= 80 ? '#fee2e2' : '#eff6ff',
                        color: c.priority_score >= 80 ? '#b91c1c' : '#1d4ed8',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {c.priority_score.toFixed(1)} pts
                    </button>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {c.location}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className="badge badge-low">{c.category}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={`badge badge-${c.status.toLowerCase()}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontWeight: 700 }}>{c.supporters_count}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailsComplaint(c);
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Details
                    </button>
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
