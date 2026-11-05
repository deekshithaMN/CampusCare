import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, PlusCircle, LayoutDashboard, ListFilter, LogOut, LogIn, UserCheck } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <Wrench size={26} color="#2563eb" />
          <span>CampusCare</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Feed
          </Link>

          {isAuthenticated && (
            <Link to="/submit" className={`nav-link ${isActive('/submit') ? 'active' : ''}`}>
              <PlusCircle size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Report Issue
            </Link>
          )}

          {isStaff && (
            <>
              <Link to="/staff/queue" className={`nav-link ${isActive('/staff/queue') ? 'active' : ''}`}>
                <ListFilter size={16} style={{ display: 'inline', marginRight: '4px' }} />
                Staff Queue
              </Link>
              <Link to="/staff/dashboard" className={`nav-link ${isActive('/staff/dashboard') ? 'active' : ''}`}>
                <LayoutDashboard size={16} style={{ display: 'inline', marginRight: '4px' }} />
                Analytics
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.75rem' }}>
              <span className={`badge ${user.role === 'STAFF' ? 'badge-high' : 'badge-low'}`}>
                {user.role}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {user.username}
              </span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Log Out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                <LogIn size={15} />
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserCheck size={15} />
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
