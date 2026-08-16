import React, { useState, useEffect } from 'react';
import { Users, Store, Star, TrendingUp } from 'lucide-react';
import { AdminSidebar, Spinner } from '../components/Shared';
import api from '../api/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(res => setStats(res.data.data))
      .catch(() => setError('Unable to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    {
      icon: <Users size={22} />,
      value: stats.totalUsers,
      label: 'Total Users',
      iconBg: 'rgba(23,133,130,0.12)',
      iconColor: 'var(--color-accent)',
    },
    {
      icon: <Store size={22} />,
      value: stats.totalStores,
      label: 'Total Stores',
      iconBg: 'rgba(191,161,129,0.15)',
      iconColor: 'var(--color-gold)',
    },
    {
      icon: <Star size={22} />,
      value: stats.totalRatings,
      label: 'Total Ratings',
      iconBg: 'rgba(10,24,40,0.08)',
      iconColor: 'var(--color-primary)',
    },
  ] : [];

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <div className="dashboard-content">
        
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Platform overview and key metrics</p>
        </div>

        {loading && <Spinner />}
        {error && <div className="alert alert-error"><span>{error}</span></div>}

        {stats && (
          <div className="stat-grid">
            {cards.map((c, i) => (
              <div key={i} className="stat-card">
                <div
                  className="stat-icon"
                  style={{ background: c.iconBg, color: c.iconColor }}
                >
                  {c.icon}
                </div>
                <div className="stat-value">{c.value.toLocaleString()}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="card" style={{ padding: '1.5rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={18} color="var(--color-accent)" />
            <h3 style={{ fontFamily: 'var(--font-family)', fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
              Quick Navigation
            </h3>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            Use the sidebar to manage <strong>Users</strong> and <strong>Stores</strong>.
            Click on any row to view full details.
          </p>
        </div>
      </div>
    </div>
  );
}