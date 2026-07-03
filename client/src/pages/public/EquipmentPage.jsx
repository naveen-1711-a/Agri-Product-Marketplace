import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getEquipmentList, getCategories } from '../../services/equipmentApi';
import { FiSearch, FiFilter, FiMapPin, FiEye, FiX } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUrl';

const CATEGORY_ICONS = {
  'Tractor': '🚜', 'Rotavator': '🌾', 'Seed Drill': '🌱', 'Harvester': '🚜',
  'Water Pump': '🚿', 'Sprayer': '🌿', 'Farm Tools': '🛠', 'Trailer': '🚛',
  'Cultivator': '🌾', 'Power Tiller': '🚜', 'Other': '⚙️',
};

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: '-views', label: 'Most Viewed' },
];

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [filters, setFilters] = useState({
    search: '', category: '', village: '', district: '',
    minPrice: '', maxPrice: '', available: '', sort: '-createdAt',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchEquipment = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...filters };
      // Remove empty params
      Object.keys(params).forEach((k) => params[k] === '' && delete params[k]);
      const res = await getEquipmentList(params);
      setEquipment(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipment(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchEquipment]);
  useEffect(() => {
    getCategories().then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  const handleFilterChange = (key, val) => setFilters((p) => ({ ...p, [key]: val }));
  const clearFilters = () => setFilters({ search: '', category: '', village: '', district: '', minPrice: '', maxPrice: '', available: '', sort: '-createdAt' });

  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort' && k !== 'search').length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%)' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #15803d 0%, #166534 50%, #14532d 100%)',
        padding: '3rem 1.5rem 2rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%', background: '#ffffff',
              width: `${80 + i * 40}px`, height: `${80 + i * 40}px`,
              top: `${10 + i * 12}%`, left: `${5 + i * 15}%`,
              animation: `float ${3 + i}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚜</div>
          <h1 style={{ color: 'white', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.5rem' }}>
            Equipment Rental Marketplace
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', margin: '0 0 1.5rem' }}>
            Rent agricultural equipment directly from local farmers & owners
          </p>

          {/* Search Bar */}
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '1.2rem' }} />
            <input
              type="text"
              placeholder="Search equipment, village, district..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{
                width: '100%', padding: '0.875rem 1rem 0.875rem 3rem',
                borderRadius: '50px', border: 'none',
                fontSize: '0.95rem', outline: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0', marginBottom: '1rem', scrollbarWidth: 'none' }}>
          <button
            onClick={() => handleFilterChange('category', '')}
            style={{
              padding: '0.4rem 1rem', borderRadius: '20px', border: '2px solid',
              borderColor: !filters.category ? '#15803d' : '#e5e7eb',
              background: !filters.category ? '#15803d' : 'white',
              color: !filters.category ? 'white' : '#374151',
              fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🌍 All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterChange('category', filters.category === cat ? '' : cat)}
              style={{
                padding: '0.4rem 1rem', borderRadius: '20px', border: '2px solid',
                borderColor: filters.category === cat ? '#15803d' : '#e5e7eb',
                background: filters.category === cat ? '#15803d' : 'white',
                color: filters.category === cat ? 'white' : '#374151',
                fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
            <strong style={{ color: '#15803d' }}>{pagination.total}</strong> equipment found
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
            >
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.875rem', borderRadius: '8px',
                border: `2px solid ${activeFiltersCount > 0 ? '#15803d' : '#e5e7eb'}`,
                background: activeFiltersCount > 0 ? '#f0fdf4' : 'white',
                color: activeFiltersCount > 0 ? '#15803d' : '#374151',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              <FiFilter /> Filters {activeFiltersCount > 0 && <span style={{ background: '#15803d', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>{activeFiltersCount}</span>}
            </button>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff5f5', color: '#dc2626', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FiX /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>Village</label>
              <input value={filters.village} onChange={(e) => handleFilterChange('village', e.target.value)} placeholder="Enter village..." style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>District</label>
              <input value={filters.district} onChange={(e) => handleFilterChange('district', e.target.value)} placeholder="Enter district..." style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>Min Price/Day (₹)</label>
              <input type="number" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} placeholder="0" style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>Max Price/Day (₹)</label>
              <input type="number" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} placeholder="99999" style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>Availability</label>
              <select value={filters.available} onChange={(e) => handleFilterChange('available', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: 'white' }}>
                <option value="">All</option>
                <option value="true">Available Now</option>
              </select>
            </div>
          </div>
        )}

        {/* Equipment Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', height: '320px', animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ background: '#f3f4f6', height: '180px' }} />
                <div style={{ padding: '1rem' }}>
                  <div style={{ background: '#f3f4f6', height: '16px', borderRadius: '8px', marginBottom: '0.5rem' }} />
                  <div style={{ background: '#f3f4f6', height: '12px', borderRadius: '8px', width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : equipment.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: '#374151', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>No equipment found</h3>
            <p style={{ color: '#6b7280', margin: '0 0 1.5rem' }}>Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} style={{ padding: '0.75rem 1.5rem', background: '#15803d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {equipment.map((item) => <EquipmentCard key={item._id} item={item} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => fetchEquipment(i + 1)}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px', border: '1px solid',
                  borderColor: pagination.page === i + 1 ? '#15803d' : '#e5e7eb',
                  background: pagination.page === i + 1 ? '#15803d' : 'white',
                  color: pagination.page === i + 1 ? 'white' : '#374151',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes float { from { transform: translateY(0); } to { transform: translateY(-15px); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}

function EquipmentCard({ item }) {
  const imageUrl = getImageUrl(item.images?.[0]);

  return (
    <Link to={`/equipment/${item._id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid #e5e7eb', transition: 'all 0.25s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(21,128,61,0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: '180px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', overflow: 'hidden' }}>
          {imageUrl ? (
            <img src={imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3.5rem' }}>
              {CATEGORY_ICONS[item.category] || '🚜'}
            </div>
          )}
          {/* Badges */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem' }}>
            <span style={{ background: item.isAvailable ? '#15803d' : '#dc2626', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>
              {item.isAvailable ? '✓ Available' : '✗ Rented'}
            </span>
            {item.isVerified && (
              <span style={{ background: '#1d4ed8', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>
                ✓ Verified
              </span>
            )}
          </div>
          <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.5)', borderRadius: '20px', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'white', fontSize: '0.7rem' }}>
            <FiEye /> {item.views}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
            <span style={{ background: '#f0fdf4', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
              {CATEGORY_ICONS[item.category]} {item.category}
            </span>
          </div>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
            {item.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
            <FiMapPin style={{ color: '#15803d' }} />
            {item.village}{item.district && `, ${item.district}`}
          </div>

          {/* Price */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {item.pricePerDay > 0 && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.3rem 0.6rem' }}>
                <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Per Day</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#15803d' }}>₹{item.pricePerDay.toLocaleString()}</div>
              </div>
            )}
            {item.pricePerHour > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.3rem 0.6rem' }}>
                <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Per Hour</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#b45309' }}>₹{item.pricePerHour.toLocaleString()}</div>
              </div>
            )}
          </div>

          {/* Owner */}
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#15803d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                {item.seller?.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 600 }}>{item.seller?.name}</span>
            </div>
            {item.totalRentals > 0 && (
              <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>🔄 {item.totalRentals} rentals</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
