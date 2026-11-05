import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Shield,
  Wrench,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X
} from 'lucide-react';

export default function Header({ setMobileOpen, onSearchQuery }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [searchValue, setSearchValue] = useState('');

  // Sample real-time contextual notifications for campus platform
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Water Tap Dispatched',
      message: 'Science Block plumbing issue assigned to Marcus Facilities.',
      time: '10m ago',
      read: false,
      type: 'dispatch',
    },
    {
      id: 2,
      title: 'Priority Boosted',
      message: '3 peer students supported your Electrical report.',
      time: '1h ago',
      read: false,
      type: 'priority',
    },
  ]);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    if (onSearchQuery) {
      onSearchQuery(e.target.value);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/feed?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/feed') return 'Explore Complaints';
    if (path === '/submit') return 'Report Maintenance Issue';
    if (path === '/my-complaints') return 'My Reported Issues';
    if (path === '/staff/queue') return 'Staff Dispatch Queue';
    if (path === '/my-assigned') return 'Assigned to Me';
    if (path === '/priority') return 'Explainable Priority Engine';
    if (path === '/analytics') return 'Analytics & Reports';
    if (path === '/admin/users') return 'Campus User Directory';
    return 'CampusCare';
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="btn-icon mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          style={{ display: 'none', color: 'var(--text-primary)' }}
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="header-breadcrumbs">
          <span style={{ color: 'var(--text-muted)' }}>Workspace</span>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span className="breadcrumb-current">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Universal Search Input */}
        <div className="header-search">
          <Search size={15} className="header-search-icon" />
          <input
            type="text"
            placeholder="Search issues, blocks (e.g. Science)..."
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        {/* Role Badge Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: user?.role === 'STAFF' ? '#eff6ff' : user?.role === 'ADMIN' ? '#fef3c7' : '#ecfdf5',
            color: user?.role === 'STAFF' ? '#1d4ed8' : user?.role === 'ADMIN' ? '#b45309' : '#047857',
            border: `1px solid ${
              user?.role === 'STAFF' ? '#bfdbfe' : user?.role === 'ADMIN' ? '#fde68a' : '#a7f3d0'
            }`,
          }}
        >
          {user?.role === 'STAFF' ? (
            <Wrench size={13} />
          ) : user?.role === 'ADMIN' ? (
            <Shield size={13} />
          ) : (
            <GraduationCap size={13} />
          )}
          <span>{user?.role || 'STUDENT'}</span>
        </div>

        {/* Notifications Popover Toggle */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-icon"
            style={{ position: 'relative', padding: '0.55rem' }}
            title="Notifications"
          >
            <Bell size={18} color="var(--text-secondary)" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 0 2px #ffffff',
                }}
              />
            )}
          </button>

          {/* Notifications Flyout Drawer */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: '320px',
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-subtle)',
                zIndex: 60,
                overflow: 'hidden',
                animation: 'slideUp 0.15s ease-out',
              }}
            >
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Campus Activity</div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--border-light)',
                      background: n.read ? '#ffffff' : '#f8fafc',
                      display: 'flex',
                      gap: '0.65rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        background: n.type === 'dispatch' ? '#dcfce7' : '#e0e7ff',
                        color: n.type === 'dispatch' ? '#16a34a' : '#4338ca',
                        marginTop: '2px',
                      }}
                    >
                      {n.type === 'dispatch' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: '0.6rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderTop: '1px solid var(--border-light)',
                }}
              >
                <button
                  onClick={() => setShowNotifications(false)}
                  style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
