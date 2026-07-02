import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEquipment, addEquipmentReview } from '../../services/equipmentApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiMapPin, FiPhone, FiShare2, FiStar, FiEye, FiArrowLeft,
  FiCheckCircle, FiXCircle, FiExternalLink, FiCopy, FiClock, FiCalendar,
  FiUser, FiMessageSquare,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageUrl';

const CATEGORY_ICONS = {
  'Tractor': '🚜', 'Rotavator': '🌾', 'Seed Drill': '🌱', 'Harvester': '🚜',
  'Water Pump': '🚿', 'Sprayer': '🌿', 'Farm Tools': '🛠', 'Trailer': '🚛',
  'Cultivator': '🌾', 'Power Tiller': '🚜', 'Other': '⚙️',
};

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getEquipment(id);
        setEquipment(res.data.data);
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating || 0);
      } catch {
        toast.error('Equipment not found');
        navigate('/equipment');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);


  const phone = equipment?.contactPhone || equipment?.seller?.phone;

  const handleCall = () => {
    if (phone) window.location.href = `tel:${phone}`;
    else toast.error('No phone number available');
  };

  const handleWhatsApp = () => {
    if (!phone) return toast.error('No phone number available');
    const msg = encodeURIComponent(`Hi, I'm interested in renting your ${equipment.name} listed on EPM.`);
    window.open(`https://wa.me/91${phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  const handleCopyPhone = () => {
    if (!phone) return toast.error('No phone number available');
    navigator.clipboard.writeText(phone);
    toast.success('Phone number copied!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: equipment.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const handleMapsOpen = () => {
    if (equipment.mapLink) {
      window.open(equipment.mapLink, '_blank');
    } else if (equipment.latitude && equipment.longitude) {
      window.open(`https://maps.google.com/?q=${equipment.latitude},${equipment.longitude}`, '_blank');
    } else {
      const query = encodeURIComponent(`${equipment.village}, ${equipment.district}`);
      window.open(`https://maps.google.com/?q=${query}`, '_blank');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to review');
    setSubmittingReview(true);
    try {
      const res = await addEquipmentReview(id, reviewForm);
      setReviews((prev) => [res.data.data, ...prev]);
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>Loading equipment details...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!equipment) return null;

  const images = equipment.images || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingBottom: '3rem' }}>
      {/* Back Button */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <button onClick={() => navigate('/equipment')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#15803d', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
            <FiArrowLeft /> Back to Equipment
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>

          {/* LEFT COLUMN */}
          <div>
            {/* Image Gallery */}
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ position: 'relative', height: '380px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
                {images.length > 0 ? (
                  <img
                    src={getImageUrl(images[activeImage])}
                    alt={equipment.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '5rem' }}>
                    {CATEGORY_ICONS[equipment.category] || '🚜'}
                  </div>
                )}
                {/* Status badge */}
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ background: equipment.isAvailable ? '#15803d' : '#dc2626', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                    {equipment.isAvailable ? '✓ Available' : '✗ Currently Rented'}
                  </span>
                  {equipment.isVerified && (
                    <span style={{ background: '#1d4ed8', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                      🛡️ Verified
                    </span>
                  )}
                </div>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '20px', padding: '0.3rem 0.75rem', color: 'white', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FiEye /> {equipment.views} views
                </div>
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', overflowX: 'auto' }}>
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={getImageUrl(img)}
                      alt=""
                      onClick={() => setActiveImage(i)}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: activeImage === i ? '2px solid #15803d' : '2px solid transparent', opacity: activeImage === i ? 1 : 0.7, transition: 'all 0.2s' }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Equipment Info */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ background: '#f0fdf4', color: '#15803d', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-block', marginBottom: '0.5rem' }}>
                    {CATEGORY_ICONS[equipment.category]} {equipment.category}
                  </span>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: '0 0 0.25rem' }}>{equipment.name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    <FiMapPin style={{ color: '#15803d' }} />
                    {equipment.village}{equipment.district && `, ${equipment.district}`}{equipment.state && `, ${equipment.state}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleShare} style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#374151' }} title="Share">
                    <FiShare2 />
                  </button>
                </div>
              </div>

              {/* Ratings */}
              {reviews.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FiStar key={s} style={{ color: s <= avgRating ? '#f59e0b' : '#e5e7eb', fill: s <= avgRating ? '#f59e0b' : 'none' }} />
                    ))}
                  </div>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{avgRating}</span>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>({reviews.length} reviews)</span>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>• {equipment.totalRentals} rentals</span>
                </div>
              )}

              {/* Pricing */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {equipment.pricePerDay > 0 && (
                  <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: '12px', padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      <FiCalendar /> Per Day
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#15803d' }}>₹{equipment.pricePerDay.toLocaleString()}</div>
                  </div>
                )}
                {equipment.pricePerHour > 0 && (
                  <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      <FiClock /> Per Hour
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#b45309' }}>₹{equipment.pricePerHour.toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              {equipment.description && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>📝 Description</h3>
                  <p style={{ color: '#4b5563', lineHeight: 1.7, margin: 0 }}>{equipment.description}</p>
                </div>
              )}
            </div>

            {/* Location */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiMapPin style={{ color: '#15803d' }} /> Location
              </h3>
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{equipment.village || 'Village not specified'}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>{equipment.district}, {equipment.state}</div>
                </div>
                <button
                  onClick={handleMapsOpen}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#15803d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  <FiExternalLink /> Open in Maps
                </button>
              </div>
              {(equipment.latitude && equipment.longitude) && (
                <div style={{ background: '#e5e7eb', borderRadius: '12px', padding: '0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  📍 GPS: {equipment.latitude.toFixed(6)}, {equipment.longitude.toFixed(6)}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiStar style={{ color: '#f59e0b' }} /> Reviews ({reviews.length})
              </h3>

              {/* Add Review Form */}
              {user && user.role === 'customer' && (
                <form onSubmit={handleSubmitReview} style={{ background: '#f9fafb', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '1px solid #e5e7eb' }}>
                  <p style={{ fontWeight: 600, color: '#111827', marginTop: 0, marginBottom: '0.75rem' }}>Write a Review</p>
                  <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setReviewForm((p) => ({ ...p, rating: s }))}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: s <= reviewForm.rating ? '#f59e0b' : '#d1d5db', transition: 'color 0.2s' }}>
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                    placeholder="Share your experience..."
                    rows={3}
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button type="submit" disabled={submittingReview} style={{ marginTop: '0.5rem', padding: '0.5rem 1.25rem', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', opacity: submittingReview ? 0.7 : 1 }}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>No reviews yet. Be the first!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {reviews.map((r) => (
                    <div key={r._id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#15803d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                            {r.reviewer?.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{r.reviewer?.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} style={{ color: s <= r.rating ? '#f59e0b' : '#e5e7eb', fontSize: '0.8rem' }}>★</span>
                          ))}
                        </div>
                      </div>
                      {r.comment && <p style={{ margin: 0, color: '#4b5563', fontSize: '0.875rem', lineHeight: 1.6 }}>{r.comment}</p>}
                      <p style={{ margin: '0.25rem 0 0', color: '#9ca3af', fontSize: '0.75rem' }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN – Contact Card */}
          <div style={{ position: 'sticky', top: '1rem', alignSelf: 'flex-start' }}>
            {/* Owner Card */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem' }}>Equipment Owner</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #15803d, #166534)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, flexShrink: 0 }}>
                  {equipment.seller?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{equipment.seller?.name}</div>
                  {equipment.seller?.villageName && (
                    <div style={{ color: '#6b7280', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiMapPin style={{ fontSize: '0.7rem' }} /> {equipment.seller.villageName}
                    </div>
                  )}
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                    Member since {new Date(equipment.seller?.createdAt).getFullYear()}
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <button onClick={handleCall} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', background: 'linear-gradient(135deg, #15803d, #166534)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(21,128,61,0.3)' }}>
                  <FiPhone /> Call Owner
                </button>
                <button onClick={handleWhatsApp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', background: '#25d366', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}>
                  <FaWhatsapp style={{ fontSize: '1.1rem' }} /> WhatsApp
                </button>
                <button onClick={handleCopyPhone} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                  <FiCopy /> Copy Number
                </button>
              </div>

              {phone && (
                <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.8rem', margin: '0.75rem 0 0' }}>📞 {phone}</p>
              )}
            </div>

            {/* Quick Info */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem' }}>Quick Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { label: 'Category', value: `${CATEGORY_ICONS[equipment.category]} ${equipment.category}` },
                  { label: 'Status', value: equipment.isAvailable ? '✅ Available' : '❌ Rented' },
                  { label: 'Total Rentals', value: `🔄 ${equipment.totalRentals}` },
                  { label: 'Total Views', value: `👁 ${equipment.views}` },
                  { label: 'Listed On', value: new Date(equipment.createdAt).toLocaleDateString('en-IN') },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{value}</span>
                  </div>
                ))}
              </div>

              <button onClick={handleMapsOpen} style={{ marginTop: '1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                <FiMapPin /> View on Google Maps
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
