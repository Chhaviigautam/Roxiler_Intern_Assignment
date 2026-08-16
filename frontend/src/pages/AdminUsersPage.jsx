import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, ChevronUp, ChevronDown, X } from 'lucide-react';
import { AdminSidebar, RoleBadge, Spinner, EmptyState } from '../components/Shared';
import api from '../api/api';
import { useToast } from '../context/ToastContext';
const ROLES = ['', 'admin', 'normal_user', 'store_owner'];
const ROLE_LABELS = {
  '': 'All Roles',
  admin: 'Admin',
  normal_user: 'Normal User',
  store_owner: 'Store Owner'
};
export default function AdminUsersPage() {
  const {
    showToast
  } = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'normal_user'
  });
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const fetchUsers = useCallback(async () => {
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
      if (role) params.role = role;
      const res = await api.get('/users', {
        params
      });
      setUsers(res.data.data.items);
      setPagination({
        page: res.data.data.page,
        totalPages: res.data.data.totalPages,
        total: res.data.data.total
      });
    } catch {
      showToast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  }, [name, email, address, role, sortBy, sortDir, page]);
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
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
    return sortDir === 'asc' ? <ChevronUp size={12} className="sort-icon" /> : <ChevronDown size={12} className="sort-icon" />;
  };
  const handleUserClick = async u => {
    try {
      const res = await api.get(`/users/${u.id}`);
      setSelected(res.data.data);
    } catch {
      setSelected(u);
    }
  };
  const handleAddUser = async e => {
    e.preventDefault();
    const errs = {};
    if (addForm.name.trim().length < 20 || addForm.name.trim().length > 60) errs.name = 'Name must be 20–60 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email.trim())) errs.email = 'Enter a valid email address.';
    if (!addForm.address.trim()) errs.address = 'Address is required.';
    if (addForm.password.length < 8 || addForm.password.length > 16 || !/[A-Z]/.test(addForm.password) || !/[^a-zA-Z0-9]/.test(addForm.password)) errs.password = 'Password must be 8–16 chars with uppercase and special character.';
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setAddLoading(true);
    try {
      await api.post('/users', addForm);
      showToast('User created successfully!');
      setShowAddModal(false);
      setAddForm({
        name: '',
        email: '',
        address: '',
        password: '',
        role: 'normal_user'
      });
      setAddErrors({});
      fetchUsers();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to create user.';
      const field = err?.response?.data?.field;
      if (field) setAddErrors(e => ({
        ...e,
        [field]: msg
      }));else showToast(msg, 'error');
    } finally {
      setAddLoading(false);
    }
  };
  return <div className="dashboard-layout">
      <AdminSidebar />
      <div className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">{pagination.total} total users</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} id="add-user-btn">
            <Plus size={16} /> Add User
          </button>
        </div>

        <div className="filter-row">
          <div className="search-bar" style={{
          flex: 1,
          minWidth: 180
        }}>
            <Search size={14} color="var(--color-text-muted)" />
            <input placeholder="Filter by name…" value={name} onChange={e => {
            setName(e.target.value);
            setPage(1);
          }} />
            {name && <button onClick={() => {
            setName('');
            setPage(1);
          }} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            display: 'flex'
          }}><X size={14} /></button>}
          </div>
          <div className="search-bar" style={{
          flex: 1,
          minWidth: 180
        }}>
            <Search size={14} color="var(--color-text-muted)" />
            <input placeholder="Filter by email…" value={email} onChange={e => {
            setEmail(e.target.value);
            setPage(1);
          }} />
          </div>
          <div className="search-bar" style={{
          flex: 1,
          minWidth: 180
        }}>
            <Search size={14} color="var(--color-text-muted)" />
            <input placeholder="Filter by address…" value={address} onChange={e => {
            setAddress(e.target.value);
            setPage(1);
          }} />
          </div>
          <select className="form-select" style={{
          width: 160
        }} value={role} onChange={e => {
          setRole(e.target.value);
          setPage(1);
        }}>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>

        {loading ? <Spinner /> : <>
            {users.length === 0 ? <EmptyState message={name || email || address || role ? 'No users match your filters.' : 'No users found.'} icon="👥" /> : <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      {[['name', 'Name'], ['email', 'Email'], ['address', 'Address'], ['role', 'Role']].map(([col, label]) => <th key={col} className={sortBy === col ? 'sorted' : ''} onClick={() => handleSort(col)}>
                          {label} <SortIcon col={col} />
                        </th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => <tr key={u.id} onClick={() => handleUserClick(u)}>
                        <td><strong>{u.name}</strong></td>
                        <td style={{
                  color: 'var(--color-text-secondary)'
                }}>{u.email}</td>
                        <td style={{
                  color: 'var(--color-text-secondary)',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} title={u.address}>{u.address}</td>
                        <td><RoleBadge role={u.role} /></td>
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
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">User Details</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>
            <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
              {[['Name', selected.name], ['Email', selected.email], ['Address', selected.address]].map(([k, v]) => <div key={k}>
                  <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              marginBottom: '0.2rem'
            }}>{k}</p>
                  <p style={{
              fontWeight: 500
            }}>{v}</p>
                </div>)}
              <div>
                <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              marginBottom: '0.2rem'
            }}>Role</p>
                <RoleBadge role={selected.role} />
              </div>
              {selected.role === 'store_owner' && selected.store && <div className="card card-glow" style={{
            marginTop: '0.5rem'
          }}>
                <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                marginBottom: '0.25rem'
              }}>OWNED STORE</p>
                  <p style={{ fontWeight: 700 }}>{selected.store.name}</p>
                  <p style={{
                  marginTop: '0.25rem',
                  color: 'var(--color-gold)',
                  fontWeight: 700,
                  fontSize: '1.2rem'
                }}>
                    ★ {selected.store.avg_rating ? Number(selected.store.avg_rating).toFixed(1) : 'No ratings yet'}
                  </p>
                </div>}
            </div>
          </div>
        </div>}

      {showAddModal && <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New User</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddUser}>
              {['name', 'email', 'address', 'password'].map(field => <div className="form-group" key={field}>
                  <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} className={`form-input${addErrors[field] ? ' error' : ''}`} value={addForm[field]} onChange={e => setAddForm(f => ({
              ...f,
              [field]: e.target.value
            }))} placeholder={field === 'name' ? '20–60 characters' : field === 'password' ? '8–16 chars, 1 uppercase, 1 special' : ''} />
                  {addErrors[field] && <p className="form-error">{addErrors[field]}</p>}
                </div>)}
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={addForm.role} onChange={e => setAddForm(f => ({
              ...f,
              role: e.target.value
            }))}>
                  <option value="normal_user">Normal User</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
            marginTop: '1rem'
          }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className={`btn btn-primary${addLoading ? ' btn-loading' : ''}`} disabled={addLoading} id="submit-add-user">
                  {addLoading ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
}