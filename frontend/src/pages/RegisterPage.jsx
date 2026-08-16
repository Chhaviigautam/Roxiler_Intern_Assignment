import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, User, Mail, Lock, MapPin, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const {
    showToast
  } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 20 || form.name.trim().length > 60) errs.name = 'Name must be between 20 and 60 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email address.';
    if (!form.address.trim() || form.address.trim().length > 400) errs.address = 'Address is required and must not exceed 400 characters.';
    if (form.password.length < 8 || form.password.length > 16) errs.password = 'Password must be 8–16 characters.';else if (!/[A-Z]/.test(form.password)) errs.password = 'Password must include at least one uppercase letter.';else if (!/[^a-zA-Z0-9]/.test(form.password)) errs.password = 'Password must include at least one special character.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        password: form.password
      });
      showToast('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      const serverError = err?.response?.data?.error || 'Registration failed.';
      const field = err?.response?.data?.field;
      if (field) {
        setErrors(prev => ({
          ...prev,
          [field]: serverError
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: serverError
        }));
      }
    } finally {
      setLoading(false);
    }
  };
  const Field = ({
    id,
    label,
    icon,
    type,
    field,
    placeholder,
    children
  }) => <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div style={{
      position: 'relative'
    }}>
        <span style={{
        position: 'absolute',
        left: '0.875rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--color-text-muted)',
        display: 'flex'
      }}>
          {icon}
        </span>
        {children || <input id={id} type={type || 'text'} className={`form-input${errors[field] ? ' error' : ''}`} style={{
        paddingLeft: '2.5rem'
      }} placeholder={placeholder} value={form[field]} onChange={e => setForm(f => ({
        ...f,
        [field]: e.target.value
      }))} />}
      </div>
      {errors[field] && <p className="form-error">{errors[field]}</p>}
    </div>;
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
      <div className="auth-card" style={{
      maxWidth: 500
    }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Star size={28} fill="white" color="white" />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join StoreRate to discover and rate stores</p>
        </div>

        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '0.625rem 0.875rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)'
        }}>
          <span style={{
            background: 'var(--color-primary)',
            color: 'white',
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
            fontWeight: 600,
            fontSize: '0.7rem'
          }}>
            Normal User
          </span>
          <span>Self-registration for rating stores. (Store Owner & Admin accounts are created by Administrators).</span>
        </div>

        {errors.general && <div className="alert alert-error"><span>{errors.general}</span></div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name <span style={{
              color: 'var(--color-text-muted)',
              fontSize: '0.7rem'
            }}>({form.name.trim().length}/60)</span></label>
            <div style={{
            position: 'relative'
          }}>
              <User size={16} style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }} />
              <input id="reg-name" type="text" className={`form-input${errors.name ? ' error' : ''}`} style={{
              paddingLeft: '2.5rem'
            }} placeholder="Your full name (20–60 characters)" value={form.name} onChange={e => setForm(f => ({
              ...f,
              name: e.target.value
            }))} maxLength={60} />
            </div>
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div style={{
            position: 'relative'
          }}>
              <Mail size={16} style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }} />
              <input id="reg-email" type="email" className={`form-input${errors.email ? ' error' : ''}`} style={{
              paddingLeft: '2.5rem'
            }} placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({
              ...f,
              email: e.target.value
            }))} />
            </div>
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-address">Address</label>
            <div style={{
            position: 'relative'
          }}>
              <MapPin size={16} style={{
              position: 'absolute',
              left: '0.875rem',
              top: '0.875rem',
              color: 'var(--color-text-muted)'
            }} />
              <textarea id="reg-address" className={`form-input${errors.address ? ' error' : ''}`} style={{
              paddingLeft: '2.5rem',
              minHeight: 80
            }} placeholder="Your full address" value={form.address} onChange={e => setForm(f => ({
              ...f,
              address: e.target.value
            }))} maxLength={400} />
            </div>
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{
            position: 'relative'
          }}>
              <Lock size={16} style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }} />
              <input id="reg-password" type={showPass ? 'text' : 'password'} className={`form-input${errors.password ? ' error' : ''}`} style={{
              paddingLeft: '2.5rem',
              paddingRight: '2.5rem'
            }} placeholder="8–16 chars, uppercase & special" value={form.password} onChange={e => setForm(f => ({
              ...f,
              password: e.target.value
            }))} maxLength={16} />
              <button type="button" style={{
              position: 'absolute',
              right: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)'
            }} onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
            <div style={{
            position: 'relative'
          }}>
              <Lock size={16} style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }} />
              <input id="reg-confirm-password" type={showPass ? 'text' : 'password'} className={`form-input${errors.confirmPassword ? ' error' : ''}`} style={{
              paddingLeft: '2.5rem'
            }} placeholder="Repeat your password" value={form.confirmPassword} onChange={e => setForm(f => ({
              ...f,
              confirmPassword: e.target.value
            }))} maxLength={16} />
            </div>
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" id="register-submit" className={`btn btn-primary btn-full${loading ? ' btn-loading' : ''}`} disabled={loading} style={{
          padding: '0.875rem',
          marginTop: '0.5rem'
        }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{
        textAlign: 'center',
        marginTop: '1.5rem',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-muted)'
      }}>
          Already have an account?{' '}
          <Link to="/login" style={{
          color: 'var(--color-primary-light)',
          fontWeight: 600
        }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}