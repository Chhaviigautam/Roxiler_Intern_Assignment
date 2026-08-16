import React, { useState, useEffect } from 'react';
import { Star, Users } from 'lucide-react';
import { OwnerSidebar, Spinner, EmptyState, StarRating } from '../components/Shared';
import api from '../api/api';
import { useToast } from '../context/ToastContext';

export default function OwnerDashboard() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [raters, setRaters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRaters = async storeId => {
    try {
      const ratersRes = await api.get(`/stores/${storeId}/raters`);
      setRaters(ratersRes.data.data);
    } catch {
      setRaters([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashRes = await api.get('/dashboard/owner');
        const dash = dashRes.data.data;
        setData(dash);
        if (dash.store) {
          setSelectedStore(dash.store);
          fetchRaters(dash.store.id);
        }
      } catch {
        showToast('Failed to load dashboard.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStoreChange = storeId => {
    const found = data?.stores?.find(s => s.id === storeId);
    if (found) {
      setSelectedStore(found);
      fetchRaters(found.id);
    }
  };

  if (loading) return (
    <div className="dashboard-layout">
      <OwnerSidebar />
      <div className="dashboard-content"><Spinner /></div>
    </div>
  );

  if (!selectedStore) {
    return (
      <div className="dashboard-layout">
        <OwnerSidebar />
        <div className="dashboard-content">
          <EmptyState message="No store assigned to your account yet. Please contact an administrator." icon="🏪" />
        </div>
      </div>
    );
  }

  const avgNum = selectedStore.avg_rating ? parseFloat(selectedStore.avg_rating) : 0;

  return (
    <div className="dashboard-layout">
      <OwnerSidebar />

      <div className="dashboard-content">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">{selectedStore.name}</h1>
            <p className="page-subtitle">Store Performance Overview</p>
          </div>

          {data?.stores?.length > 1 && (
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                Switch Store
              </label>
              <select
                className="form-select"
                value={selectedStore.id}
                onChange={e => handleStoreChange(e.target.value)}
                style={{ minWidth: 160 }}
              >
                {data.stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '2rem' }}>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(191,161,129,0.15)', color: 'var(--color-gold)' }}>
              <Star size={22} />
            </div>
            <div className="stat-value" style={{ color: 'var(--color-gold)' }}>
              {selectedStore.avg_rating ? Number(selectedStore.avg_rating).toFixed(1) : '—'}
            </div>
            <div className="stat-label">Average Rating</div>
            {avgNum > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <StarRating value={Math.round(avgNum)} readonly size="sm" />
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(23,133,130,0.12)', color: 'var(--color-accent)' }}>
              <Users size={22} />
            </div>
            <div className="stat-value">{selectedStore.total_raters || 0}</div>
            <div className="stat-label">Total Raters</div>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-main)' }}>
            Customers Who Rated Your Store
          </h2>

          {raters.length === 0 ? (
            <div className="card" style={{ padding: '2rem' }}>
              <EmptyState message="No ratings submitted yet for your store." icon="⭐" />
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {raters.map(r => (
                    <tr key={r.user_id}>
                      <td><strong>{r.name}</strong></td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{r.email}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                            {'★'.repeat(r.rating_value)}
                            {'☆'.repeat(5 - r.rating_value)}
                          </span>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                            {r.rating_value}/5
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {new Date(r.rated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}