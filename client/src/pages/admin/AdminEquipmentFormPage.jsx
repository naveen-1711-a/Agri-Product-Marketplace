/**
 * AdminEquipmentFormPage
 * Reuses the same form UI as the seller form but:
 *  - navigates back to /admin/equipment
 *  - admin listings are auto-approved on the backend
 *  - admin can edit any listing (not just own)
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEquipment, updateEquipment, getCategories } from '../../services/equipmentApi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiMapPin, FiArrowLeft, FiSave, FiInfo, FiShield } from 'react-icons/fi';
import { FiUploadCloud, FiCheckCircle } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUrl';

const EMPTY = {
  name: '', category: '', description: '',
  pricePerHour: '', pricePerDay: '',
  village: '', district: '', state: 'Tamil Nadu',
  mapLink: '', latitude: '', longitude: '', contactPhone: '',
};

const Section = ({ title, icon, children }) => (
  <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span>{icon}</span> {title}
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

export default function AdminEquipmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileRef = useRef();

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
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
          name: eq.name || '', category: eq.category || '',
          description: eq.description || '',
          pricePerHour: eq.pricePerHour || '', pricePerDay: eq.pricePerDay || '',
          village: eq.village || '', district: eq.district || '',
          state: eq.state || 'Tamil Nadu', mapLink: eq.mapLink || '',
          latitude: eq.latitude || '', longitude: eq.longitude || '',
          contactPhone: eq.contactPhone || '',
        });
        setExistingImages(eq.images || []);
      } catch {
        toast.error('Failed to load equipment');
        navigate('/admin/equipment');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files);
    if (existingImages.length + newFiles.length + picked.length > 8) {
      toast.error('Max 8 images'); return;
    }
    setNewFiles((p) => [...p, ...picked]);
    setPreviews((p) => [...p, ...picked.map((f) => URL.createObjectURL(f))]);
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
        toast.success('Equipment updated & auto-approved ✅');
      } else {
        await createEquipment(fd);
        toast.success('Equipment added & auto-approved ✅');
      }
      navigate('/admin/equipment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };


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
  };
  const focusGreen = (e) => (e.target.style.borderColor = '#15803d');
  const blurGray = (e) => (e.target.style.borderColor = '#e5e7eb');



  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/admin/equipment')} style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>
          <FiArrowLeft />
        </button>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            {isEdit ? '✏️ Edit Equipment (Admin)' : '🚜 Add Equipment (Admin)'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>
            Admin listings are <strong style={{ color: '#15803d' }}>auto-approved & verified</strong> — no review needed
          </p>
        </div>
      </div>

      {/* Admin notice */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: '12px', padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <FiShield style={{ color: '#15803d', fontSize: '1.25rem', flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontWeight: 700, color: '#15803d', fontSize: '0.875rem' }}>Admin Privilege Active</p>
          <p style={{ margin: 0, color: '#166534', fontSize: '0.8rem' }}>This listing will be instantly approved and marked as Verified 🛡️</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Section title="Basic Information" icon="📋">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Equipment Name" required>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. John Deere Tractor" style={inputStyle} onFocus={focusGreen} onBlur={blurGray} />
            </Field>
            <Field label="Category" required>
              <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, background: 'white', cursor: 'pointer' }} onFocus={focusGreen} onBlur={blurGray}>
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the equipment..." style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusGreen} onBlur={blurGray} />
          </Field>
          <Field label="Contact Phone" hint="Phone number customers can call/WhatsApp">
            <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="e.g. 9876543210" style={inputStyle} onFocus={focusGreen} onBlur={blurGray} />
          </Field>
        </Section>

        {/* Pricing */}
        <Section title="Rental Pricing" icon="💰">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Price Per Day (₹)">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 700 }}>₹</span>
                <input type="number" name="pricePerDay" value={form.pricePerDay} onChange={handleChange} min="0" placeholder="0" style={{ ...inputStyle, paddingLeft: '1.75rem' }} onFocus={focusGreen} onBlur={blurGray} />
              </div>
            </Field>
            <Field label="Price Per Hour (₹)">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 700 }}>₹</span>
                <input type="number" name="pricePerHour" value={form.pricePerHour} onChange={handleChange} min="0" placeholder="0" style={{ ...inputStyle, paddingLeft: '1.75rem' }} onFocus={focusGreen} onBlur={blurGray} />
              </div>
            </Field>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location" icon="📍">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Field label="Village">
              <input name="village" value={form.village} onChange={handleChange} placeholder="e.g. Kalavai" style={inputStyle} onFocus={focusGreen} onBlur={blurGray} />
            </Field>
            <Field label="District">
              <input name="district" value={form.district} onChange={handleChange} placeholder="e.g. Vellore" style={inputStyle} onFocus={focusGreen} onBlur={blurGray} />
            </Field>
            <Field label="State">
              <input name="state" value={form.state} onChange={handleChange} style={inputStyle} onFocus={focusGreen} onBlur={blurGray} />
            </Field>
          </div>
          <Field label="Google Maps Link">
            <div style={{ position: 'relative' }}>
              <FiMapPin style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input name="mapLink" value={form.mapLink} onChange={handleChange} placeholder="https://maps.google.com/?q=..." style={{ ...inputStyle, paddingLeft: '2.25rem' }} onFocus={focusGreen} onBlur={blurGray} />
            </div>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Latitude">
              <input type="number" step="any" name="latitude" value={form.latitude} onChange={handleChange} placeholder="e.g. 12.9715987" style={inputStyle} onFocus={focusGreen} onBlur={blurGray} />
            </Field>
            <Field label="Longitude">
              <input type="number" step="any" name="longitude" value={form.longitude} onChange={handleChange} placeholder="e.g. 77.5945627" style={inputStyle} onFocus={focusGreen} onBlur={blurGray} />
            </Field>
          </div>
        </Section>

        {/* Images */}
        <Section title="Equipment Photos" icon="📸">
          {existingImages.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Current Photos</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {existingImages.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img src={getImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e5e7eb' }} />
                    <button type="button" onClick={() => removeExisting(i)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {previews.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>New Photos</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #86efac' }} />
                    <button type="button" onClick={() => removeNew(i)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(existingImages.length + newFiles.length) < 8 && (
            <>
              <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', border: '2px dashed #86efac', borderRadius: '12px', background: '#f0fdf4', color: '#15803d', cursor: 'pointer', width: '100%', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                <FiUpload /> Upload Photos ({existingImages.length + newFiles.length}/8)
              </button>
            </>
          )}
        </Section>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/admin/equipment')} style={{ padding: '0.75rem 1.5rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', background: loading ? '#86efac' : 'linear-gradient(135deg, #15803d, #166534)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 12px rgba(21,128,61,0.3)' }}>
            <FiSave /> {loading ? 'Saving...' : isEdit ? 'Update Equipment' : 'Add Equipment'}
          </button>
        </div>
      </form>
    </div>
  );
}
