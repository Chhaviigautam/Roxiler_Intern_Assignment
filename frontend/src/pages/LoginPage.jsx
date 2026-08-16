import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Mail, Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = role => {
    setSelectedRole(role);
    setError('');
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('Admin@1234');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const roleMeta = {
    user: {
      title: 'User Portal',
      subtitle: 'Sign in to rate and discover stores',
      badge: 'Normal User'
    },
    owner: {
      title: 'Store Owner Portal',
      subtitle: 'Sign in to manage your store & view ratings',
      badge: 'Store Owner'
    },
    admin: {
      title: 'Admin Portal',
      subtitle: 'Platform management and system statistics',
      badge: 'System Admin'
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'store_owner') navigate('/owner/dashboard');
      else navigate('/stores');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Invalid email or password.';
      setError(msg);
    }
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="auth-page" style={{ position: 'relative' }}>
      
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          background: theme === 'dark' ? 'rgba(23,133,130,0.15)' : 'rgba(10,24,40,0.08)',
          border: theme === 'dark' ? '1px solid rgba(23,133,130,0.3)' : '1px solid rgba(10,24,40,0.15)',
          borderRadius: '50%',
          width: 38,
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: theme === 'dark' ? '#4db8b5' : '#0A1828',
          transition: 'all 0.2s ease',
          zIndex: 99,
        }}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="auth-card" style={{ maxWidth: 460, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Star size={24} color="var(--color-primary)" fill="none" strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">{roleMeta[selectedRole].title}</h1>
          <p className="page-subtitle" style={{marginBottom: 0}}>{roleMeta[selectedRole].subtitle}</p>
        </div>

        <div style={{
          display: 'flex',
          background: theme === 'dark' ? '#1a2535' : '#F3F4F6',
          padding: '0.25rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '2rem',
          border: '1px solid var(--border-color)'
        }}>
          {[
            { id: 'user', label: 'User' },
            { id: 'owner', label: 'Store Owner' },
            { id: 'admin', label: 'Admin' }
          ].map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRoleSelect(r.id)}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: selectedRole === r.id
                  ? (theme === 'dark' ? '#2d4a6b' : '#FFFFFF')
                  : 'transparent',
                color: selectedRole === r.id
                  ? (theme === 'dark' ? '#E6EDF3' : 'var(--color-text-main)')
                  : (theme === 'dark' ? '#8B949E' : 'var(--color-text-muted)'),
                fontWeight: selectedRole === r.id ? 700 : 600,
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedRole === r.id
                  ? (theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)')
                  : 'none'
              }}
              onMouseEnter={e => {
                if (selectedRole !== r.id) {
                  e.currentTarget.style.color = theme === 'dark' ? '#E6EDF3' : 'var(--color-text-main)';
                  e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
                }
              }}
              onMouseLeave={e => {
                if (selectedRole !== r.id) {
                  e.currentTarget.style.color = theme === 'dark' ? '#8B949E' : 'var(--color-text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">
          <span>{error}</span>
        </div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }} />
              <input 
                id="login-email" 
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem' }} 
                placeholder="owner@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                autoComplete="email" 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }} />
              <input 
                id="login-password" 
                type={showPass ? 'text' : 'password'} 
                className="form-input" 
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                autoComplete="current-password" 
              />
              <button 
                type="button" 
                style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)'
                }} 
                onClick={() => setShowPass(s => !s)}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary btn-full${isLoading ? ' btn-loading' : ''}`} 
            disabled={isLoading} 
            style={{ marginTop: '1rem', padding: '0.875rem', fontWeight: 600 }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '2rem',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          fontWeight: 500
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            color: 'var(--color-text-main)',
            fontWeight: 700,
            textDecoration: 'none'
          }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}