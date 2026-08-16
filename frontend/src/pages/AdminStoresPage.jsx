import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, ChevronUp, ChevronDown, X } from 'lucide-react';
import { AdminSidebar, Spinner, EmptyState } from '../components/Shared';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
export default function AdminStoresPage() {
  const {
    showToast
  } = useToast();
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [selectedRaters, setSelectedRaters] = useState([]);
  const [ratersLoading, setRatersLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    address: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerName: ''
  });
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sortBy,
        sortDir,
        page,
        pageSize: 10
      };
      if (name) params.name = name;
      if (email) params.email = email;
      if (address) params.address = address;
      const res = await api.get('/stores', {
        params
      });
      setStores(res.data.data.items);
      setPagination({
        page: res.data.data.page,
        totalPages: res.data.data.totalPages,
        total: res.data.data.total
      });
    } catch {
      showToast('Failed to load stores.', 'error');
    } finally {
      setLoading(false);
    }
  }, [name, email, address, sortBy, sortDir, page]);
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);
  const handleSort = col => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');else {
      setSortBy(col);
      setSortDir('asc');
    }
    setPage(1);
  };
  const SortIcon = ({
    col
  }) => {
    if (sortBy !== col) return <ChevronUp size={12} className="sort-icon" />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };
  const handleStoreClick = async s => {
    setSelected(s);
    setRatersLoading(true);
    try {
      const res = await api.get(`/stores/${s.id}/raters`);
      setSelectedRaters(res.data.data);
    } catch {
      setSelectedRaters([]);
    } finally {
      setRatersLoading(false);
    }
  };
  const openAddModal = () => {
    setAddForm({
      name: '',
      address: '',
      ownerEmail: '',
      ownerPassword: '',
      ownerName: ''
    });
    setAddErrors({});
    setShowAddModal(true);
  };
  const handleDeleteStore = async (e, storeId, storeName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${storeName}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(storeId);
    try {
      await api.delete(`/stores/${storeId}`);
      showToast(`Store "${storeName}" deleted successfully.`);
      if (selected?.id === storeId) setSelected(null);
      fetchStores();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to delete store.', 'error');
    } finally {
      setDeletingId(null);
    }
  };
  const handleAddStore = async e => {
    e.preventDefault();
    const errs = {};
    if (!addForm.name.trim()) errs.name = 'Store name is required.';
    if (!addForm.address.trim()) errs.address = 'Address is required.';
    if (!addForm.ownerEmail.trim()) {
      errs.ownerEmail = 'Store Owner email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.ownerEmail.trim())) {
      errs.ownerEmail = 'Enter a valid owner email address.';
    }
    if (addForm.ownerPassword && (addForm.ownerPassword.length < 8 || addForm.ownerPassword.length > 16 || !/[A-Z]/.test(addForm.ownerPassword) || !/[^a-zA-Z0-9]/.test(addForm.ownerPassword))) {
      errs.ownerPassword = 'Password must be 8–16 chars with uppercase and special char.';
    }
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setAddLoading(true);
    try {
      await api.post('/stores', addForm);
      showToast('Store created successfully!');
      setShowAddModal(false);
      fetchStores();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to create store.';
      const field = err?.response?.data?.field;
      if (field) setAddErrors(e => ({
        ...e,
        [field]: msg
      }));else showToast(msg, 'error');
    } finally {
      setAddLoading(false);
    }
  };
  const RatingDisplay = ({ value }) => {
    if (!value) return <span style={{ color: 'var(--color-text-muted)' }}>No ratings</span>;
    return <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>★ {Number(value).toFixed(1)}</span>;
  };
  return <div className="dashboard-layout">
      <AdminSidebar />
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">Stores</h1>
            <p className="page-subtitle">{pagination.total} registered stores</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal} id="add-store-btn">
            <Plus size={16} /> Add Store
          </button>
        </div>

        <div className="filter-row">
          {[['name', name, setName, 'Filter by name…'], ['email', email, setEmail, 'Filter by email…'], ['address', address, setAddress, 'Filter by address…']].map(([field, val, setter, ph]) => <div key={field} className="search-bar" style={{
          flex: 1,
          minWidth: 160
        }}>
              <Search size={14} color="var(--color-text-muted)" />
              <input placeholder={ph} value={val} onChange={e => {
            setter(e.target.value);
            setPage(1);
          }} />
            </div>)}
        </div>

        {loading ? <Spinner /> : <>
            {stores.length === 0 ? <EmptyState message="No stores found." icon="🏪" /> : <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      {[['name', 'Name'], ['email', 'Email'], ['address', 'Address'], ['avg_rating', 'Rating']].map(([col, label]) => <th key={col} className={sortBy === col ? 'sorted' : ''} onClick={() => handleSort(col)}>
                          {label} <SortIcon col={col} />
                        </th>)}
                      <th style={{
                  textAlign: 'right',
                  paddingRight: '1.5rem'
                }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map(s => <tr key={s.id} onClick={() => handleStoreClick(s)} style={{
                  cursor: 'pointer'
                }}>
                        <td><strong>{s.name}</strong></td>
                        <td style={{
                  color: 'var(--color-text-secondary)'
                }}>{s.email}</td>
                        <td style={{
                  color: 'var(--color-text-secondary)',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{s.address}</td>
                        <td><RatingDisplay value={s.avg_rating} /></td>
                        <td style={{
                  textAlign: 'right'
                }}>
                          <button className="btn btn-ghost btn-sm" style={{
                    color: 'var(--color-error)'
                  }} onClick={e => handleDeleteStore(e, s.id, s.name)} disabled={deletingId === s.id} title="Delete Store">
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>}
            {pagination.totalPages > 1 && <div className="pagination">
                <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({
            length: pagination.totalPages
          }, (_, i) => i + 1).map(p => <button key={p} className={`pagination-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>)}
                <button className="pagination-btn" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>}
          </>}
      </div>

      {selected && <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{
        maxWidth: 600
      }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selected.name}</h2>
              <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
                <button className="btn btn-secondary btn-sm" style={{
            color: 'var(--color-error)'
          }} onClick={e => handleDeleteStore(e, selected.id, selected.name)}>
                  🗑️ Delete Store
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><X size={16} /></button>
              </div>
            </div>
            <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
              <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)'
          }}>{selected.email}</p>
              <p style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)'
          }}>{selected.address}</p>
              <div className="card card-glow" style={{
            padding: '1rem',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
                <div>
                  <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)'
              }}>AVERAGE RATING</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                    {selected.avg_rating ? `★ ${Number(selected.avg_rating).toFixed(1)}` : '—'}
                  </p>
                </div>
                <div>
                  <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)'
              }}>TOTAL RATINGS</p>
                  <p style={{
                fontSize: '1.75rem',
                fontWeight: 800
              }}>{selected.total_ratings}</p>
                </div>
              </div>
            </div>
            <h3 style={{
          marginBottom: '0.75rem',
          fontSize: 'var(--font-size-base)'
        }}>Raters</h3>
            {ratersLoading ? <Spinner /> : selectedRaters.length === 0 ? <p style={{
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-sm)'
        }}>No ratings submitted yet.</p> : <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>Name</th><th>Email</th><th>Rating</th><th>Date</th></tr></thead>
                  <tbody>
                    {selectedRaters.map(r => <tr key={r.user_id}>
                        <td>{r.name}</td>
                        <td style={{
                  color: 'var(--color-text-secondary)'
                }}>{r.email}</td>
                        <td><span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>★ {r.rating_value}</span></td>
                        <td style={{
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--font-size-xs)'
                }}>{new Date(r.rated_at).toLocaleDateString()}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>}
          </div>
        </div>}

      {showAddModal && <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" style={{
        maxWidth: 520
      }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Store</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddStore}>
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input
                  type="text"
                  className={`form-input${addErrors.name ? ' error' : ''}`}
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Downtown Gourmet Store"
                />
                {addErrors.name && <p className="form-error">{addErrors.name}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Store Address</label>
                <input
                  type="text"
                  className={`form-input${addErrors.address ? ' error' : ''}`}
                  value={addForm.address}
                  onChange={e => setAddForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="123 Main Street, City"
                />
                {addErrors.address && <p className="form-error">{addErrors.address}</p>}
              </div>

              <div style={{
          background: 'rgba(23,133,130,0.06)',
          border: '1px solid rgba(23,133,130,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginTop: '1.25rem',
          marginBottom: '0.75rem'
        }}>
                <h4 style={{
            fontSize: 'var(--font-size-sm)',
            marginBottom: '0.5rem',
            color: 'var(--color-primary-light)'
          }}>
                  👤 Store Owner Credentials
                </h4>
                <p style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            marginBottom: '0.75rem'
          }}>
                  Enter the email of an existing Store Owner or provide a password to automatically create a dedicated Store Owner account.
                </p>

                <div className="form-group">
                  <label className="form-label">Store Owner Email</label>
                  <input type="email" className={`form-input${addErrors.ownerEmail ? ' error' : ''}`} value={addForm.ownerEmail} onChange={e => setAddForm(f => ({
              ...f,
              ownerEmail: e.target.value
            }))} placeholder="owner@example.com" />
                  {addErrors.ownerEmail && <p className="form-error">{addErrors.ownerEmail}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Store Owner Password (for new owner)</label>
                  <input type="password" className={`form-input${addErrors.ownerPassword ? ' error' : ''}`} value={addForm.ownerPassword} onChange={e => setAddForm(f => ({
              ...f,
              ownerPassword: e.target.value
            }))} placeholder="e.g. Owner@123 (8–16 chars, uppercase & special)" />
                  {addErrors.ownerPassword && <p className="form-error">{addErrors.ownerPassword}</p>}
                </div>

                <div className="form-group" style={{
            marginBottom: 0
          }}>
                  <label className="form-label">Owner Full Name (optional)</label>
                  <input type="text" className="form-input" value={addForm.ownerName} onChange={e => setAddForm(f => ({
              ...f,
              ownerName: e.target.value
            }))} placeholder="Owner's full name" />
                </div>
              </div>

              <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end',
          marginTop: '1.25rem'
        }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className={`btn btn-primary${addLoading ? ' btn-loading' : ''}`} disabled={addLoading} id="submit-add-store">
                  {addLoading ? 'Creating…' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
}