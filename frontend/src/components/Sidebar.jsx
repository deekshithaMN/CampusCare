import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  LayoutDashboard,
  PlusCircle,
  Compass,
  BookmarkCheck,
  ListFilter,
  UserCheck,
  BarChart3,
  Sliders,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, isStaff, isStudent, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN' || user?.is_superuser;

  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split('_')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 49,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Wrench size={18} />
            </div>
            {!collapsed && (
              <div>
                <span style={{ letterSpacing: '-0.02em' }}>CampusCare</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    marginLeft: '6px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  PRO
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="btn-icon"
              style={{ color: '#94a3b8' }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Sidebar Navigation */}
        <div className="sidebar-body">
          {/* Quick Action: Report Issue Button */}
          {!collapsed ? (
            <NavLink
              to="/submit"
              onClick={closeMobile}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.65rem',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              <PlusCircle size={16} />
              <span>Report New Issue</span>
            </NavLink>
          ) : (
            <NavLink
              to="/submit"
              onClick={closeMobile}
              className="btn btn-primary btn-icon"
              title="Report New Issue"
              style={{ margin: '0 auto', width: '40px', height: '40px' }}
            >
              <PlusCircle size={18} />
            </NavLink>
          )}

          {/* Section: Main Workspace */}
          <div className="sidebar-nav-group">
            {!collapsed && <div className="sidebar-section-title">Overview</div>}

            <NavLink
              to="/dashboard"
              onClick={closeMobile}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="Dashboard"
            >
              <LayoutDashboard size={18} className="icon" />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>

            <NavLink
              to="/feed"
              onClick={closeMobile}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="Explore Complaints"
            >
              <Compass size={18} className="icon" />
              {!collapsed && <span>Explore Feed</span>}
            </NavLink>

            <NavLink
              to="/my-complaints"
              onClick={closeMobile}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title="My Reports"
            >
              <BookmarkCheck size={18} className="icon" />
              {!collapsed && <span>My Reports</span>}
            </NavLink>
          </div>

          {/* Section: Operations (Staff & Admin) */}
          {(isStaff || isAdmin) && (
            <div className="sidebar-nav-group">
              {!collapsed && <div className="sidebar-section-title">Operations</div>}

              <NavLink
                to="/staff/queue"
                onClick={closeMobile}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                title="Dispatch Queue"
              >
                <ListFilter size={18} className="icon" />
                {!collapsed && <span>Dispatch Queue</span>}
              </NavLink>

              <NavLink
                to="/my-assigned"
                onClick={closeMobile}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                title="Assigned to Me"
              >
                <UserCheck size={18} className="icon" />
                {!collapsed && <span>Assigned to Me</span>}
              </NavLink>

              <NavLink
                to="/priority"
                onClick={closeMobile}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                title="Priority Engine"
              >
                <Sliders size={18} className="icon" />
                {!collapsed && <span>Priority Engine</span>}
              </NavLink>

              <NavLink
                to="/analytics"
                onClick={closeMobile}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                title="Analytics & KPI"
              >
                <BarChart3 size={18} className="icon" />
                {!collapsed && <span>Analytics</span>}
              </NavLink>
            </div>
          )}

          {/* Section: Administration */}
          {isAdmin && (
            <div className="sidebar-nav-group">
              {!collapsed && <div className="sidebar-section-title">Administration</div>}

              <NavLink
                to="/admin/users"
                onClick={closeMobile}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                title="User & Staff Directory"
              >
                <Users size={18} className="icon" />
                {!collapsed && <span>Campus Directory</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Sidebar Footer (Profile + Controls) */}
        <div className="sidebar-footer">
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="btn-icon"
              style={{ color: '#94a3b8', margin: '0 auto' }}
              title="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          )}

          <div className="sidebar-user-card">
            <div className="user-avatar">{getInitials(user?.username)}</div>
            {!collapsed && (
              <div className="user-info">
                <div className="user-name">{user?.username || 'User'}</div>
                <div className="user-role-tag">
                  {user?.role === 'STAFF' ? (
                    <>
                      <Wrench size={11} color="#60a5fa" />
                      <span>Staff ({user?.department || 'General'})</span>
                    </>
                  ) : user?.role === 'ADMIN' ? (
                    <>
                      <ShieldCheck size={11} color="#fbbf24" />
                      <span>Admin</span>
                    </>
                  ) : (
                    <>
                      <Building2 size={11} color="#a7f3d0" />
                      <span>Student</span>
                    </>
                  )}
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="btn-icon"
                style={{ color: '#94a3b8', padding: '4px' }}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
