import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Lock,
  Mail,
  User,
  Building2,
  UserCheck,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  GraduationCap
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STUDENT',
    department: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate(formData.role === 'STAFF' ? '/staff/queue' : '/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server. Make sure "python manage.py runserver" is running at http://127.0.0.1:8000.');
      } else {
        const errData = err.response.data;
        if (typeof errData === 'object' && errData !== null) {
          const messages = Object.entries(errData).map(([field, msgs]) => {
            const text = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
            return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${text}`;
          });
          setError(messages.join(' | '));
        } else {
          setError('Registration failed. Please check your credentials.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
        background: '#ffffff',
      }}
      className="auth-split-grid"
    >
      {/* Left Column: SaaS Branding Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #172554 100%)',
          color: '#ffffff',
          padding: '4rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <div className="brand-icon">
              <Wrench size={20} />
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              CampusCare
            </span>
          </div>

          <div style={{ maxWidth: '480px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
              Join the institutional campus maintenance network.
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Register as a student to log repairs and support peer tickets, or as maintenance staff to triage issues and maintain campus uptime.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <GraduationCap size={18} color="#60a5fa" />
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Students upvote issues to accelerate resolution</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Wrench size={18} color="#f59e0b" />
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Staff manage specialized discipline queues (HVAC, Electrical, Plumbing)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={18} color="#10b981" />
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Sanitized EXIF photo uploads protecting student privacy</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
          CampusCare Maintenance Platform v1.2
        </div>
      </div>

      {/* Right Column: Register Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          background: 'var(--bg-canvas)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Create your account
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Choose your role to get started with CampusCare
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Role Radio Picker */}
            <div>
              <label className="form-label">Select Your Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div
                  onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                  style={{
                    border: formData.role === 'STUDENT' ? '2px solid #2563eb' : '1.5px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    background: formData.role === 'STUDENT' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <GraduationCap size={18} color={formData.role === 'STUDENT' ? '#2563eb' : '#64748b'} style={{ margin: '0 auto 4px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: formData.role === 'STUDENT' ? '#2563eb' : 'var(--text-primary)' }}>
                    Student
                  </div>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, role: 'STAFF' })}
                  style={{
                    border: formData.role === 'STAFF' ? '2px solid #2563eb' : '1.5px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    background: formData.role === 'STAFF' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <Wrench size={18} color={formData.role === 'STAFF' ? '#2563eb' : '#64748b'} style={{ margin: '0 auto 4px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: formData.role === 'STAFF' ? '#2563eb' : 'var(--text-primary)' }}>
                    Maintenance Staff
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name or Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="username"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="e.g. emma_student"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Campus Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="emma@campus.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {formData.role === 'STAFF' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Department / Discipline</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    name="department"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="e.g. Electrical, Plumbing, HVAC"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password (min 6 characters)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
            >
              <UserCheck size={16} />
              <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
