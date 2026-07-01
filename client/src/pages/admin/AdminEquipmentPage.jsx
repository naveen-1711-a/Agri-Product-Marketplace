import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetAllEquipment, adminUpdateEquipmentStatus, adminDeleteEquipment, adminGetEquipmentStats } from '../../services/equipmentApi';
import toast from 'react-hot-toast';
import { FiSearch, FiCheckCircle, FiXCircle, FiTrash2, FiRefreshCw, FiPlus, FiEdit2 } from 'react-icons/fi';

const CATEGORY_ICONS = {
  'Tractor': '🚜', 'Rotavator': '🌾', 'Seed Drill': '🌱', 'Harvester': '🚜',
  'Water Pump': '🚿', 'Sprayer': '🌿', 'Farm Tools': '🛠', 'Trailer': '🚛',
  'Cultivator': '🌾', 'Power Tiller': '🚜', 'Other': '⚙️',
};

const STATUS_CONFIG = {
  pending: { bg: '#fffbeb', color: '#b45309', label: '⏳ Pending' },
  approved: { bg: '#f0fdf4', color: '#15803d', label: '✅ Approved' },
  rejected: { bg: '#fff5f5', color: '#dc2626', label: '❌ Rejected' },
};

export default function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Rejection modal state
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, name: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const [eqRes, statsRes] = await Promise.all([
        adminGetAllEquipment(params),
        adminGetEquipmentStats(),
      ]);
      setEquipment(eqRes.data.data);
      setPagination(eqRes.data.pagination);
      setStats(statsRes.data.data);
    } catch {
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [search, statusFilter]);

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await adminUpdateEquipmentStatus(id, { status: 'approved' });
      setEquipment((prev) => prev.map((e) => e._id === id ? { ...e, status: 'approved' } : e));
      toast.success('Equipment approved ✅');
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(null); }
  };

  const openRejectModal = (id, name) => {
    setRejectModal({ open: true, id, name });
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error('Please provide a rejection reason');
    setActionLoading(rejectModal.id + '_reject');
    try {
      await adminUpdateEquipmentStatus(rejectModal.id, { status: 'rejected', rejectionReason: rejectReason });
      setEquipment((prev) => prev.map((e) => e._id === rejectModal.id ? { ...e, status: 'rejected', rejectionReason: rejectReason } : e));
      toast.success('Equipment rejected');
      setRejectModal({ open: false, id: null, name: '' });
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"?`)) return;
    setActionLoading(id + '_delete');
    try {
      await adminDeleteEquipment(id);
      setEquipment((prev) => prev.filter((e) => e._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
    finally { setActionLoading(null); }
  };

  const imageBase = `${window.location.protocol}//${window.location.hostname}:5000/uploads/`;

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: '0 0 0.25rem' }}>🚜 Equipment Management</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Approve, reject, and manage rental listings</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to="/admin/equipment/new"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #15803d, #166534)', color: 'white', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(21,128,61,0.3)' }}
          >
            <FiPlus /> Add Equipment
          </Link>
          <button onClick={() => load(1)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', border: '1px solid #e5e7eb', borderRadius: '10px', background: 'white', cursor: 'pointer', color: '#374151', fontWeight: 600, fontSize: '0.8rem' }}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total', value: stats.total, icon: '📦', color: '#374151', bg: '#f9fafb', border: '#e5e7eb' },
            { label: 'Pending Review', value: stats.pending, icon: '⏳', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Approved', value: stats.approved, icon: '✅', color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
            { label: 'Rejected', value: stats.rejected, icon: '❌', color: '#dc2626', bg: '#fff5f5', border: '#fecaca' },
          ].map(({ label, value, icon, color, bg, border }) => (
            <div key={label} onClick={() => setStatusFilter(label === 'Total' ? '' : label.toLowerCase().split(' ')[0])}
              style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '1.25rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, village, district..." style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.5rem 0.875rem', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', background: 'white', cursor: 'pointer' }}>
          <option value="">All Statuses</option>
          <option value="pending">⏳ Pending</option>
          <option value="approved">✅ Approved</option>
          <option value="rejected">❌ Rejected</option>
        </select>
        <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: 'auto' }}>
          <strong style={{ color: '#15803d' }}>{pagination.total}</strong> total
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
            <p>Loading...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : equipment.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
            <p>No equipment found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Equipment', 'Category', 'Location', 'Price', 'Seller', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipment.map((item, idx) => {
                  const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                  const imgSrc = item.images?.[0] ? `${imageBase}${item.images[0]}` : null;
                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      {/* Equipment */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', background: '#f0fdf4', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            {imgSrc ? <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : CATEGORY_ICONS[item.category]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#111827', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</div>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: '#f0fdf4', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {CATEGORY_ICONS[item.category]} {item.category}
                        </span>
                      </td>
                      {/* Location */}
                      <td style={{ padding: '0.75rem 1rem', color: '#4b5563', fontSize: '0.8rem' }}>
                        {item.village || '—'}{item.district && `, ${item.district}`}
                      </td>
                      {/* Price */}
                      <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                        {item.pricePerDay > 0 && <div style={{ fontWeight: 700, color: '#15803d' }}>₹{item.pricePerDay}/day</div>}
                        {item.pricePerHour > 0 && <div style={{ fontSize: '0.75rem', color: '#b45309' }}>₹{item.pricePerHour}/hr</div>}
                      </td>
                      {/* Seller */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.8rem' }}>{item.seller?.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{item.seller?.phone}</div>
                      </td>
                      {/* Status */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: st.bg, color: st.color, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {st.label}
                        </span>
                        {item.status === 'rejected' && item.rejectionReason && (
                          <div style={{ fontSize: '0.68rem', color: '#9ca3af', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }} title={item.rejectionReason}>
                            {item.rejectionReason}
                          </div>
                        )}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'nowrap' }}>
                          {item.status !== 'approved' && (
                            <button onClick={() => handleApprove(item._id)} disabled={!!actionLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.3rem 0.6rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', borderRadius: '6px', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              <FiCheckCircle /> Approve
                            </button>
                          )}
                          {item.status !== 'rejected' && (
                            <button onClick={() => openRejectModal(item._id, item.name)} disabled={!!actionLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.3rem 0.6rem', background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              <FiXCircle /> Reject
                            </button>
                          )}
                          <Link to={`/admin/equipment/edit/${item._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.3rem 0.6rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', fontWeight: 600, fontSize: '0.72rem', textDecoration: 'none' }}>
                            <FiEdit2 />
                          </Link>
                          <button onClick={() => handleDelete(item._id, item.name)} disabled={!!actionLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.3rem 0.6rem', background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '6px', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' }}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.25rem' }}>
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} onClick={() => load(i + 1)} style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid', borderColor: pagination.page === i + 1 ? '#15803d' : '#e5e7eb', background: pagination.page === i + 1 ? '#15803d' : 'white', color: pagination.page === i + 1 ? 'white' : '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem' }}>❌ Reject Equipment</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 1.25rem' }}>
              You are rejecting: <strong style={{ color: '#111827' }}>{rejectModal.name}</strong>
            </p>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
              Reason for rejection <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Images are unclear, price is unrealistic, duplicate listing..."
              rows={3}
              style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: '1.25rem' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectModal({ open: false, id: null, name: '' })} style={{ padding: '0.625rem 1.25rem', border: '1px solid #e5e7eb', borderRadius: '10px', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleReject} disabled={!!actionLoading} style={{ padding: '0.625rem 1.25rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
