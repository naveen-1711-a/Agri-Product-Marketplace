import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyEquipment, deleteEquipment, toggleEquipmentAvailability, getSellerEquipmentStats } from '../../services/equipmentApi';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiToggleLeft, FiToggleRight, FiMapPin, FiClock, FiCalendar, FiTrendingUp } from 'react-icons/fi';

const CATEGORY_ICONS = {
  'Tractor': '🚜', 'Rotavator': '🌾', 'Seed Drill': '🌱', 'Harvester': '🚜',
  'Water Pump': '🚿', 'Sprayer': '🌿', 'Farm Tools': '🛠', 'Trailer': '🚛',
  'Cultivator': '🌾', 'Power Tiller': '🚜', 'Other': '⚙️',
};

const STATUS_STYLES = {
  pending: { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: '⏳ Pending' },
  approved: { bg: '#f0fdf4', color: '#15803d', border: '#86efac', label: '✅ Approved' },
  rejected: { bg: '#fff5f5', color: '#dc2626', border: '#fecaca', label: '❌ Rejected' },
};

export default function SellerEquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [eqRes, statsRes] = await Promise.all([getMyEquipment(), getSellerEquipmentStats()]);
      setEquipment(eqRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteEquipment(id);
      setEquipment((prev) => prev.filter((e) => e._id !== id));
      toast.success('Equipment deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleEquipmentAvailability(id);
      setEquipment((prev) =>
        prev.map((e) => e._id === id ? { ...e, isAvailable: res.data.data.isAvailable } : e)
      );
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const imageBase = `${window.location.protocol}//${window.location.hostname}:5000/uploads/`;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: '0 0 0.25rem' }}>🚜 My Equipment</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Manage your rental listings</p>
        </div>
        <Link to="/seller/equipment/new" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'linear-gradient(135deg, #15803d, #166534)', color: 'white', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(21,128,61,0.3)', fontSize: '0.9rem' }}>
          <FiPlus /> Add Equipment
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total', value: stats.total, icon: '📦', color: '#1d4ed8', bg: '#eff6ff' },
            { label: 'Available', value: stats.available, icon: '✅', color: '#15803d', bg: '#f0fdf4' },
            { label: 'Pending', value: stats.pending, icon: '⏳', color: '#b45309', bg: '#fffbeb' },
            { label: 'Total Views', value: stats.totalViews, icon: '👁', color: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Rentals', value: stats.totalRentals, icon: '🔄', color: '#0891b2', bg: '#ecfeff' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${bg}`, borderRadius: '16px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Equipment List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
          <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
          <p>Loading equipment...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : equipment.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem', background: 'white', borderRadius: '20px', border: '2px dashed #e5e7eb' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚜</div>
          <h3 style={{ color: '#374151', fontWeight: 700, margin: '0 0 0.5rem' }}>No equipment listed yet</h3>
          <p style={{ color: '#9ca3af', margin: '0 0 1.5rem' }}>Add your first equipment to start renting</p>
          <Link to="/seller/equipment/new" style={{ padding: '0.75rem 2rem', background: '#15803d', color: 'white', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>
            + Add Equipment
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {equipment.map((item) => {
            const st = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
            const imgSrc = item.images?.[0] ? `${imageBase}${item.images[0]}` : null;
            return (
              <div key={item._id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: 0 }}>
                {/* Image */}
                <div style={{ width: '140px', flexShrink: 0, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', position: 'relative', overflow: 'hidden' }}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2.5rem' }}>
                      {CATEGORY_ICONS[item.category]}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ background: '#f0fdf4', color: '#15803d', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                          {CATEGORY_ICONS[item.category]} {item.category}
                        </span>
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                          {st.label}
                        </span>
                      </div>
                      <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{item.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontSize: '0.8rem' }}>
                        <FiMapPin style={{ color: '#15803d', fontSize: '0.75rem' }} />
                        {item.village}{item.district && `, ${item.district}`}
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right' }}>
                      {item.pricePerDay > 0 && (
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>₹{item.pricePerDay.toLocaleString()}<span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#6b7280' }}>/day</span></div>
                      )}
                      {item.pricePerHour > 0 && (
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#b45309' }}>₹{item.pricePerHour.toLocaleString()}<span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#6b7280' }}>/hr</span></div>
                      )}
                    </div>
                  </div>

                  {/* Rejection reason */}
                  {item.status === 'rejected' && item.rejectionReason && (
                    <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.5rem 0.75rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#dc2626' }}>
                      ❌ Reason: {item.rejectionReason}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', color: '#6b7280', fontSize: '0.75rem' }}>
                      <span>👁 {item.views}</span>
                      <span>🔄 {item.totalRentals} rentals</span>
                      <span>🗓 {new Date(item.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {/* Availability Toggle */}
                      <button
                        onClick={() => handleToggle(item._id)}
                        title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid', borderColor: item.isAvailable ? '#86efac' : '#fca5a5', background: item.isAvailable ? '#f0fdf4' : '#fff5f5', color: item.isAvailable ? '#15803d' : '#dc2626', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        {item.isAvailable ? <><FiToggleRight /> Available</> : <><FiToggleLeft /> Unavailable</>}
                      </button>
                      <Link to={`/equipment/${item._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#374151', fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none' }}>
                        <FiEye /> View
                      </Link>
                      <Link to={`/seller/equipment/edit/${item._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none' }}>
                        <FiEdit2 /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id, item.name)}
                        disabled={deletingId === item._id}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff5f5', color: '#dc2626', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', opacity: deletingId === item._id ? 0.7 : 1 }}
                      >
                        <FiTrash2 /> {deletingId === item._id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
