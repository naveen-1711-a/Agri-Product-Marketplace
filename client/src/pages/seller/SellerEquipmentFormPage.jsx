import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEquipment, updateEquipment, getCategories } from '../../services/equipmentApi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiMapPin, FiArrowLeft, FiSave, FiInfo } from 'react-icons/fi';

const EMPTY = {
  name: '', category: '', description: '',
  pricePerHour: '', pricePerDay: '',
  village: '', district: '', state: 'Tamil Nadu',
  mapLink: '', latitude: '', longitude: '', contactPhone: '',
};

const Section = ({ title, icon, children }) => (
  <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span> {title}
    </h3>
    {children}
  </div>
);

const Field = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
      {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0.2rem 0 0' }}>{hint}</p>}
  </div>
);

export default function SellerEquipmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileRef = useRef();

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // filenames kept from server
  const [newFiles, setNewFiles] = useState([]);             // File objects to upload
  const [previews, setPreviews] = useState([]);             // preview URLs for newFiles
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await api.get(`/equipment/${id}`);
        const eq = res.data.data;
        setForm({
          name: eq.name || '',
          category: eq.category || '',
          description: eq.description || '',
          pricePerHour: eq.pricePerHour || '',
          pricePerDay: eq.pricePerDay || '',
          village: eq.village || '',
          district: eq.district || '',
          state: eq.state || 'Tamil Nadu',
          mapLink: eq.mapLink || '',
          latitude: eq.latitude || '',
          longitude: eq.longitude || '',
          contactPhone: eq.contactPhone || '',
        });
        setExistingImages(eq.images || []);
      } catch {
        toast.error('Failed to load equipment');
        navigate('/seller/equipment');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files);
    const total = existingImages.length + newFiles.length + picked.length;
    if (total > 8) { toast.error('Max 8 images allowed'); return; }
    setNewFiles((p) => [...p, ...picked]);
    const urls = picked.map((f) => URL.createObjectURL(f));
    setPreviews((p) => [...p, ...urls]);
  };

  const removeExisting = (idx) => setExistingImages((p) => p.filter((_, i) => i !== idx));
  const removeNew = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setNewFiles((p) => p.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.category) return toast.error('Category is required');
    if (!form.pricePerDay && !form.pricePerHour) return toast.error('Set at least one price');

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      newFiles.forEach((f) => fd.append('images', f));
      if (isEdit) fd.append('keepImages', JSON.stringify(existingImages));

      if (isEdit) {
        await updateEquipment(id, fd);
        toast.success('Equipment updated! Pending re-approval.');
      } else {
        await createEquipment(fd);
        toast.success('Equipment submitted for approval!');
      }
      navigate('/seller/equipment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const imageBase = `${window.location.protocol}//${window.location.hostname}:5000/uploads/`;

  if (fetching) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
          <p>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }



  const inputStyle = {
    width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/seller/equipment')}
          style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#374151' }}
        >
          <FiArrowLeft />
        </button>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            {isEdit ? '✏️ Edit Equipment' : '🚜 Add New Equipment'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>
            {isEdit ? 'Update details — will be re-submitted for approval' : 'Fill in details — Admin will review before publishing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Section title="Basic Information" icon="📋">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Equipment Name" required>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. John Deere Tractor 5050D" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#15803d')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
            </Field>
            <Field label="Category" required>
              <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, background: 'white', cursor: 'pointer' }} onFocus={(e) => (e.target.style.borderColor = '#15803d')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}>
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Description" hint="Describe the equipment, its condition, and any special features">
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="e.g. Well maintained tractor, suitable for paddy field ploughing. Engine overhauled 2024..." style={{ ...inputStyle, resize: 'vertical' }} onFocus={(e) => (e.target.style.borderColor = '#15803d')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
          </Field>
          <Field label="Contact Phone" hint="Leave blank to use your profile phone number">
            <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="e.g. 9876543210" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#15803d')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
          </Field>
        </Section>

        {/* Pricing */}
        <Section title="Rental Pricing" icon="💰">
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#15803d', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <FiInfo style={{ flexShrink: 0, marginTop: '2px' }} /> Set at least one price (per hour or per day). Both are optional but at least one is required.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Price Per Day (₹)">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 700, fontSize: '0.875rem' }}>₹</span>
                <input type="number" name="pricePerDay" value={form.pricePerDay} onChange={handleChange} min="0" placeholder="0" style={{ ...inputStyle, paddingLeft: '1.75rem' }} onFocus={(e) => (e.target.style.borderColor = '#15803d')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
              </div>
            </Field>
            <Field label="Price Per Hour (₹)">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 700, fontSize: '0.875rem' }}>₹</span>
                <input type="number" name="pricePerHour" value={form.pricePerHour} onChange={handleChange} min="0" placeholder="0" style={{ ...inputStyle, paddingLeft: '1.75rem' }} onFocus={(e) => (e.target.style.borderColor = '#15803d')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
              </div>
            </Field>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location" icon="📍">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Field label="Village">
              <input name="village" value={form.village} onChange={handleChange} placeholder="e.g. Kalavai" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#15803d')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
            </Field>
            <Field label="District">
              <input name="district" value={form.district} onChange={handleChange} placeholder="e.g. Vellore" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#15803d')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
            </Field>
            <Field label="State">
              <input name="state" value={form.state} onChange={handleChange} placeholder="e.g. Tamil Nadu" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#15803d')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
            </Field>
          </div>
          <Field label="Google Maps Link" hint="Paste the 'Share link' from Google Maps to show exact location">
            <div style={{ position: 'relative' }}>
              <FiMapPin style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input name="mapLink" value={form.mapLink} onChange={handleChange} placeholder="https://maps.google.com/?q=..." style={{ ...inputStyle, paddingLeft: '2.25rem' }} onFocus={(e) => (e.target.style.borderColor = '#15803d')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
            </div>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Latitude" hint="Optional GPS coordinate">
              <input type="number" step="any" name="latitude" value={form.latitude} onChange={handleChange} placeholder="e.g. 12.9715987" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#15803d')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
            </Field>
            <Field label="Longitude" hint="Optional GPS coordinate">
              <input type="number" step="any" name="longitude" value={form.longitude} onChange={handleChange} placeholder="e.g. 77.5945627" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = '#15803d')} onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
            </Field>
          </div>
        </Section>

        {/* Images */}
        <Section title="Equipment Photos" icon="📸">
          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 1rem' }}>
            Upload up to 8 images. Clear, well-lit photos increase rental enquiries significantly.
          </p>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Current Photos</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {existingImages.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img src={`${imageBase}${img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e5e7eb' }} />
                    <button type="button" onClick={() => removeExisting(i)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New previews */}
          {previews.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>New Photos</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #86efac' }} />
                    <button type="button" onClick={() => removeNew(i)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload button */}
          {(existingImages.length + newFiles.length) < 8 && (
            <>
              <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', border: '2px dashed #86efac', borderRadius: '12px', background: '#f0fdf4', color: '#15803d', cursor: 'pointer', width: '100%', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = '#15803d'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#86efac'; }}
              >
                <FiUpload style={{ fontSize: '1.2rem' }} />
                Click to upload photos ({existingImages.length + newFiles.length}/8 used)
              </button>
            </>
          )}
        </Section>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/seller/equipment')} style={{ padding: '0.75rem 1.5rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', background: loading ? '#86efac' : 'linear-gradient(135deg, #15803d, #166534)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem', boxShadow: loading ? 'none' : '0 4px 12px rgba(21,128,61,0.3)' }}>
            <FiSave /> {loading ? 'Saving...' : isEdit ? 'Update Equipment' : 'Submit Equipment'}
          </button>
        </div>
      </form>
    </div>
  );
}
