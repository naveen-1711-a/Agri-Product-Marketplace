import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUploadCloud, FiX, FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'Organic Vegetables', 'Fruits', 'Homemade Foods', 'Traditional Snacks',
  'Pickles', 'Honey', 'Millets', 'Handicrafts', 'Village Special Products',
  'Seeds', 'Medicine', 'Fertilizer'
];

const EMPTY = { name: '', description: '', category: '', price: '', stock: '', unit: 'kg', tags: '' };

export default function SellerProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/seller/my-products?limit=100`).then(({ data }) => {
      const p = (data.products || []).find(x => x._id === id);
      if (!p) { toast.error('Product not found'); navigate('/seller/products'); return; }
      setForm({ name: p.name, description: p.description, category: p.category, price: p.price, stock: p.stock, unit: p.unit || 'kg', tags: p.tags?.join(', ') || '' });
      setExistingImages(p.images || []);
    }).finally(() => setFetching(false));
  }, [id]);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length + existingImages.length > 5) {
      toast.error('Max 5 images allowed'); return;
    }
    setImages(prev => [...prev, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...urls]);
  };

  const removeNewImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const removeExisting = (i) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { toast.error('Select a category'); return; }
    if (images.length === 0 && existingImages.length === 0) { toast.error('Please upload at least one product image'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (!isEdit) fd.append('villageName', user.villageName || '');
      images.forEach(img => fd.append('images', img));

      if (isEdit) {
        await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated! Awaiting re-approval.');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product submitted for approval!');
      }
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (fetching) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/seller/products')} className="text-gray-500 hover:text-gray-700">
          <FiArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
      </div>

      {isEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5 text-sm text-yellow-800">
          ⚠️ Editing this product will reset it to <strong>pending</strong> status and require re-approval.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Product Images (Max 5)</h3>
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map((url, i) => (
              <div key={i} className="relative w-24 h-24">
                <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                <button type="button" onClick={() => removeExisting(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  <FiX size={11} />
                </button>
              </div>
            ))}
            {previews.map((url, i) => (
              <div key={i} className="relative w-24 h-24">
                <img src={url} alt="" className="w-full h-full object-cover rounded-xl border-2 border-primary-300" />
                <button type="button" onClick={() => removeNewImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  <FiX size={11} />
                </button>
              </div>
            ))}
            {(existingImages.length + images.length) < 5 && (
              <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                <FiUploadCloud className="text-gray-400 mb-1" size={20} />
                <span className="text-xs text-gray-400">Upload</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">JPG, PNG, WebP • Max 5MB each</p>
        </div>

        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-700">Product Information</h3>
          <div>
            <label className="label">Product Name *</label>
            <input className="input" placeholder="e.g. Fresh Organic Tomatoes" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none" rows={4} placeholder="Describe your product, how it's made, freshness, etc."
              value={form.description} onChange={set('description')} required />
          </div>
          <div>
            <label className="label">Category *</label>
            <select className="input" value={form.category} onChange={set('category')} required>
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Price (₹) *</label>
              <input type="number" className="input" placeholder="0" min="1" value={form.price} onChange={set('price')} required />
            </div>
            <div>
              <label className="label">Stock *</label>
              <input type="number" className="input" placeholder="0" min="0" value={form.stock} onChange={set('stock')} required />
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="input" value={form.unit} onChange={set('unit')}>
                {['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'bundle', 'pack', 'bottle', 'box'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Tags (comma separated, optional)</label>
            <input className="input" placeholder="e.g. organic, fresh, village" value={form.tags} onChange={set('tags')} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/seller/products')} className="btn-outline flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : isEdit ? 'Update Product' : 'Submit for Approval'
            }
          </button>
        </div>
      </form>
    </div>
  );
}
