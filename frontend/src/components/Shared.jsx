import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Star, Users, Store, LayoutDashboard, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button className="theme-toggle-btn" onClick={toggleTheme} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      {isDark
        ? <><Sun size={13} /><span>Light Mode</span></>
        : <><Moon size={13} /><span>Dark Mode</span></>}
    </button>
  );
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully.');
    navigate('/login');
  };

  const roleLabel = user?.role === 'admin'
    ? 'Admin'
    : user?.role === 'store_owner'
    ? 'Store Owner'
    : 'User';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
          <div className="sidebar-logo-icon">
            <Star size={14} color="white" fill="white" />
          </div>
          StoreEcho
        </Link>

        {user && (
          <div className="navbar-right">
            <span className="navbar-role-badge">{roleLabel}</span>
            <button className="btn btn-ghost btn-sm"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              onClick={() => navigate('/change-password')}>
              <Settings size={14} /> Settings
            </button>
            <button className="btn btn-ghost btn-sm"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export const RoleBadge = ({ role }) => {
  const cls = role === 'admin'
    ? 'badge-admin'
    : role === 'store_owner'
    ? 'badge-store-owner'
    : 'badge-normal-user';
  const label = role === 'admin' ? 'Admin' : role === 'store_owner' ? 'Store Owner' : 'User';
  return <span className={`badge ${cls}`}>{label}</span>;
};

export const StarRating = ({ value, onChange, readonly = false, size = 'md' }) => {
  const [hovered, setHovered] = React.useState(0);
  const fontSize = size === 'sm' ? '1.1rem' : size === 'lg' ? '2rem' : '1.4rem';

  return (
    <div className="stars" style={{ fontSize }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`star ${i <= (hovered || value) ? 'filled' : 'empty'}`}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
          onMouseEnter={() => !readonly && setHovered(i)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(i)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const isActive = path => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully.');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <aside className="sidebar">
      
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Star size={14} color="white" fill="white" />
          </div>
          StoreEcho
        </div>
      </div>

      <div className="sidebar-user-section">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-name">{user?.name || 'Administrator'}</div>
        <div className="sidebar-user-role">Role: Administrator</div>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`sidebar-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/admin/dashboard')}
        >
          <LayoutDashboard size={16} /> Dashboard
        </div>
        <div
          className={`sidebar-item ${isActive('/admin/users') ? 'active' : ''}`}
          onClick={() => navigate('/admin/users')}
        >
          <Users size={16} /> Users
        </div>
        <div
          className={`sidebar-item ${isActive('/admin/stores') ? 'active' : ''}`}
          onClick={() => navigate('/admin/stores')}
        >
          <Store size={16} /> Stores
        </div>
        <div
          className={`sidebar-item ${isActive('/change-password') ? 'active' : ''}`}
          onClick={() => navigate('/change-password')}
        >
          <Settings size={16} /> Settings
        </div>
      </nav>

      <div className="sidebar-footer">
        <div style={{ padding: '0.5rem 0 0.75rem' }}>
          <ThemeToggle />
        </div>
        <div className="sidebar-item" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </div>
      </div>
    </aside>
  );
};

export const OwnerSidebar = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = path => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully.');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'SO';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Star size={14} color="white" fill="white" />
          </div>
          StoreEcho
        </div>
      </div>

      <div className="sidebar-user-section">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-name">{user?.name || 'Store Owner'}</div>
        <div className="sidebar-user-role">Role: Owner</div>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`sidebar-item ${isActive('/owner/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/owner/dashboard')}
        >
          <LayoutDashboard size={16} /> Dashboard
        </div>
        <div
          className={`sidebar-item ${isActive('/change-password') ? 'active' : ''}`}
          onClick={() => navigate('/change-password')}
        >
          <Settings size={16} /> Settings
        </div>
      </nav>

      <div className="sidebar-footer">
        <div style={{ padding: '0.5rem 0 0.75rem' }}>
          <ThemeToggle />
        </div>
        <div className="sidebar-item" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </div>
      </div>
    </aside>
  );
};

export const UserSidebar = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = path => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully.');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Star size={14} color="white" fill="white" />
          </div>
          StoreEcho
        </div>
      </div>

      <div className="sidebar-user-section">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-name">{user?.name || 'User'}</div>
        <div className="sidebar-user-role">Role: User</div>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`sidebar-item ${isActive('/stores') ? 'active' : ''}`}
          onClick={() => navigate('/stores')}
        >
          <Store size={16} /> Browse Stores
        </div>
        <div
          className={`sidebar-item ${isActive('/change-password') ? 'active' : ''}`}
          onClick={() => navigate('/change-password')}
        >
          <Settings size={16} /> Settings
        </div>
      </nav>

      <div className="sidebar-footer">
        <div style={{ padding: '0.5rem 0 0.75rem' }}>
          <ThemeToggle />
        </div>
        <div className="sidebar-item" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </div>
      </div>
    </aside>
  );
};

export const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
    <div style={{
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: '3px solid rgba(23,133,130,0.15)',
      borderTopColor: 'var(--color-accent)',
      animation: 'spin 0.75s linear infinite'
    }} />
  </div>
);

export const EmptyState = ({ message, icon }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon || '📭'}</div>
    <h3 style={{ fontFamily: 'var(--font-family)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
      {message}
    </h3>
  </div>
);