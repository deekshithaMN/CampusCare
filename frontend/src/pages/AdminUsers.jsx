import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Wrench,
  GraduationCap,
  Search,
  Filter,
  Building2,
  Mail,
  Calendar
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/auth/users/')
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error(err);
        toast.error('Could not load user directory');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const studentsCount = users.filter((u) => u.role === 'STUDENT').length;
  const staffCount = users.filter((u) => u.role === 'STAFF').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Campus User & Staff Directory
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Overview of campus student reporters, maintenance specialists, and administrative access.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="metric-card primary">
          <div className="metric-header">
            <span className="metric-label">Total Users</span>
            <div className="metric-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="metric-value">{users.length}</div>
          <div className="metric-footer">
            <span style={{ color: '#2563eb', fontWeight: 700 }}>Active campus accounts</span>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-header">
            <span className="metric-label">Students</span>
            <div className="metric-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="metric-value">{studentsCount}</div>
          <div className="metric-footer">
            <span style={{ color: '#16a34a', fontWeight: 700 }}>Authorized to submit reports</span>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-header">
            <span className="metric-label">Maintenance Staff</span>
            <div className="metric-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Wrench size={20} />
            </div>
          </div>
          <div className="metric-value">{staffCount}</div>
          <div className="metric-footer">
            <span style={{ color: '#b45309', fontWeight: 700 }}>Dispatched technicians</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
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
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              className="form-input"
              style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.85rem' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="STAFF">Maintenance Staff</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try broadening your search term or selecting 'All Roles'."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>User Profile</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Email Address</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Role</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Department / Discipline</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.username}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={13} color="#64748b" />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <span
                      className={`badge ${
                        u.role === 'STAFF' ? 'badge-high' : u.role === 'ADMIN' ? 'badge-critical' : 'badge-low'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', color: 'var(--text-secondary)' }}>
                    {u.department ? (
                      <span style={{ fontWeight: 600 }}>{u.department}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Campus Wide</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
