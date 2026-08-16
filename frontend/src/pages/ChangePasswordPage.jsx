import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ChangePasswordPage() {
  const {
    showToast
  } = useToast();
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required.';
    if (form.newPassword.length < 8 || form.newPassword.length > 16) errs.newPassword = 'New password must be 8–16 characters.';else if (!/[A-Z]/.test(form.newPassword)) errs.newPassword = 'Must include at least one uppercase letter.';else if (!/[^a-zA-Z0-9]/.test(form.newPassword)) errs.newPassword = 'Must include at least one special character.';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      showToast('Password updated successfully! Please log in again.');
      await logout();
      navigate('/login');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to update password.';
      const field = err?.response?.data?.field;
      if (field) setErrors(e => ({
        ...e,
        [field]: msg
      }));else showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };
  const back = () => {
    if (user?.role === 'admin') navigate('/admin/dashboard');else if (user?.role === 'store_owner') navigate('/owner/dashboard');else navigate('/stores');
  };
  return <div className="auth-page">
      <div className="auth-card" style={{
      maxWidth: 440
    }}>
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: 'rgba(23,133,130,0.12)', border: '1.5px solid rgba(23,133,130,0.25)' }}>
            <ShieldCheck size={24} color="var(--color-accent)" />
          </div>
          <h1 className="auth-title">Change Password</h1>
          <p className="auth-subtitle">Update your account password securely</p>
        </div>

        <form onSubmit={handleSubmit}>
          {['currentPassword', 'newPassword', 'confirmPassword'].map(field => {
          const labels = {
            currentPassword: 'Current Password',
            newPassword: 'New Password',
            confirmPassword: 'Confirm New Password'
          };
          const placeholders = {
            currentPassword: 'Your current password',
            newPassword: '8–16 chars, uppercase & special',
            confirmPassword: 'Repeat new password'
          };
          return <div className="form-group" key={field}>
                <label className="form-label" htmlFor={field}>{labels[field]}</label>
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
                  <input id={field} type={showPass ? 'text' : 'password'} className={`form-input${errors[field] ? ' error' : ''}`} style={{
                paddingLeft: '2.5rem',
                paddingRight: field === 'currentPassword' ? '2.5rem' : undefined
              }} placeholder={placeholders[field]} value={form[field]} onChange={e => setForm(f => ({
                ...f,
                [field]: e.target.value
              }))} maxLength={16} />
                  {field === 'currentPassword' && <button type="button" style={{
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
                    </button>}
                </div>
                {errors[field] && <p className="form-error">{errors[field]}</p>}
              </div>;
        })}

          <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '0.75rem'
        }}>
            <button type="button" className="btn btn-secondary" onClick={back} style={{
            flex: 1
          }}>Back</button>
            <button type="submit" id="change-password-submit" className={`btn btn-primary${loading ? ' btn-loading' : ''}`} disabled={loading} style={{
            flex: 2
          }}>
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>;
}