import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Lock,
  Mail,
  AlertCircle,
  LogIn,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'STAFF') {
        navigate('/staff/queue');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server. Make sure "python manage.py runserver" is running at http://127.0.0.1:8000.');
      } else {
        setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ zIndex: 1 }}>
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
              Smarter campus repairs through community intelligence.
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Say goodbye to lost maintenance paper slips and duplicate reports. CampusCare equips students and facility teams with explainable priority queues.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.25)', color: '#60a5fa' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Duplicate Prevention</div>
                  <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
                    RapidFuzz & TF-IDF vectors catch duplicate complaints in real time.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.25)', color: '#60a5fa' }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Explainable Priority Algorithm</div>
                  <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
                    Auditable score factors base severity, peer upvotes, and elapsed hours.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.25)', color: '#60a5fa' }}>
                  <Zap size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Full Operational Dispatch</div>
                  <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
                    Technician assignment, status history audit logs, and analytics.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ zIndex: 1, borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
          CampusCare Maintenance Platform v1.2 • DeepMind Inspired UX
        </div>
      </div>

      {/* Right Column: Clean SaaS Auth Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          background: 'var(--bg-canvas)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Sign in to your account
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Enter your campus credentials to access the portal
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="name@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
            >
              <LogIn size={16} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Demo Credentials for Judges */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px dashed var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              <Sparkles size={14} color="#f59e0b" />
              <span style={{ fontWeight: 700 }}>One-Click Hackathon Evaluator Login:</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillDemoCredentials('student@campus.edu', 'demo1234')}
              >
                Demo Student
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillDemoCredentials('staff@campus.edu', 'demo1234')}
              >
                Demo Staff
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Need a new account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
