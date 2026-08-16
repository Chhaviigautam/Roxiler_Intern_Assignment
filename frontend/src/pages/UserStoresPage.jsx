import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronUp, ChevronDown, Store } from 'lucide-react';
import { UserSidebar, StarRating, Spinner, EmptyState } from '../components/Shared';
import api from '../api/api';
import { useToast } from '../context/ToastContext';

export default function UserStoresPage() {
  const { showToast } = useToast();
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const handleSearchChange = val => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sortBy, sortDir, page, pageSize: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get('/stores', { params });
      setStores(res.data.data.items);
      setPagination({
        page: res.data.data.page,
        totalPages: res.data.data.totalPages,
        total: res.data.data.total,
      });
    } catch {
      showToast('Failed to load stores.', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortBy, sortDir, page]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSort = col => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp size={12} className="sort-icon" />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const openRateModal = store => {
    setRatingModal(store);
    setRatingValue(store.my_rating || 0);
  };

  const handleSubmitRating = async () => {
    if (!ratingModal || ratingValue === 0) return;
    setRatingLoading(true);
    try {
      await api.post(`/stores/${ratingModal.id}/ratings`, { ratingValue });
      showToast(ratingModal.my_rating ? 'Rating updated!' : 'Rating submitted!');
      setRatingModal(null);
      fetchStores();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to submit rating.', 'error');
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <UserSidebar />

      <div className="dashboard-content">
        
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 className="page-title">Browse Stores</h1>
          <p className="page-subtitle">Discover and rate your favourite stores</p>
        </div>

        <div className="search-bar" style={{ maxWidth: 440, marginBottom: '1.5rem' }}>
          <Search size={16} color="var(--color-text-muted)" />
          <input
            placeholder="Search by name or address…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>

        {loading ? <Spinner /> : (
          <>
            {stores.length === 0 ? (
              <EmptyState
                message={debouncedSearch ? 'No stores match your search.' : 'No stores registered yet.'}
                icon="🏪"
              />
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      {[['name', 'Store Name'], ['address', 'Address'], ['avg_rating', 'Overall Rating']].map(([col, label]) => (
                        <th
                          key={col}
                          className={sortBy === col ? 'sorted' : ''}
                          onClick={() => handleSort(col)}
                          style={{ cursor: 'pointer' }}
                        >
                          {label} <SortIcon col={col} />
                        </th>
                      ))}
                      <th>My Rating</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map(s => (
                      <tr key={s.id}>
                        
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: 'rgba(23,133,130,0.1)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <Store size={14} color="var(--color-accent)" />
                            </div>
                            <strong>{s.name}</strong>
                          </div>
                        </td>

                        <td style={{
                          color: 'var(--color-text-muted)',
                          maxWidth: 220,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }} title={s.address}>
                          {s.address}
                        </td>

                        <td>
                          {s.avg_rating ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>
                                ★ {Number(s.avg_rating).toFixed(1)}
                              </span>
                              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                ({s.total_ratings})
                              </span>
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)' }}>No ratings yet</span>
                          )}
                        </td>

                        <td>
                          {s.my_rating ? (
                            <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>★ {s.my_rating}</span>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                          )}
                        </td>

                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openRateModal(s)}
                            id={`rate-store-${s.id}`}
                          >
                            {s.my_rating ? '✏ Edit' : '★ Rate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`pagination-btn${p === page ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button className="pagination-btn" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </>
        )}

        {ratingModal && (
          <div className="modal-overlay" onClick={() => setRatingModal(null)}>
            <div className="modal" style={{ maxWidth: 380, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '1.4rem', marginBottom: '0.4rem' }}>
                {ratingModal.my_rating ? 'Update Your Rating' : 'Rate This Store'}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: '1.75rem' }}>
                {ratingModal.name}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <StarRating value={ratingValue} onChange={setRatingValue} size="lg" />
              </div>
              {ratingValue > 0 && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: '1.25rem' }}>
                  You selected:{' '}
                  <strong style={{ color: 'var(--color-gold)' }}>★ {ratingValue}</strong>
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setRatingModal(null)}>Cancel</button>
                <button
                  className={`btn btn-primary${ratingLoading ? ' btn-loading' : ''}`}
                  onClick={handleSubmitRating}
                  disabled={ratingValue === 0 || ratingLoading}
                  id="submit-rating-btn"
                >
                  {ratingLoading ? 'Saving…' : ratingModal.my_rating ? 'Update Rating' : 'Submit Rating'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}