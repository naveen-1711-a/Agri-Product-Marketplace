import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUploadCloud, FiX, FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Organic Vegetables', 'Fruits', 'Homemade Foods', 'Traditional Snacks',
  'Pickles', 'Honey', 'Millets', 'Handicrafts', 'Village Special Products',
  'Seeds', 'Medicine', 'Fertilizer'
];

const EMPTY = { name: '', description: '', category: '', price: '', stock: '', unit: 'kg', tags: '', sellerName: '', villageName: '' };

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`).then(({ data }) => {
      const p = data.product;
      if (!p) { toast.error('Product not found'); navigate('/admin/products'); return; }
      setForm({ 
        name: p.name, description: p.description, category: p.category, 
        price: p.price, stock: p.stock, unit: p.unit || 'kg', 
        tags: p.tags?.join(', ') || '',
        sellerName: p.sellerName || '', villageName: p.villageName || ''
      });
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
      images.forEach(img => fd.append('images', img));

      if (isEdit) {
        await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        // Since admin edits it, we might want to auto-approve it again. We do this in controller but it defaults to pending for update.
        // Let's explicitly auto-approve it back.
        await api.put(`/products/admin/${id}/status`, { status: 'approved' });
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product added and approved automatically!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (fetching) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/admin/products')} className="text-gray-500 hover:text-gray-700">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <p className="text-sm text-gray-500">Products added by admins are automatically approved.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Product Images (Max 5)</h3>
          <div className="flex flex-wrap gap-4 mb-3">
            {existingImages.map((url, i) => (
              <div key={i} className="relative w-28 h-28">
                <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm" />
                <button type="button" onClick={() => removeExisting(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                  <FiX size={12} />
                </button>
              </div>
            ))}
            {previews.map((url, i) => (
              <div key={i} className="relative w-28 h-28">
                <img src={url} alt="" className="w-full h-full object-cover rounded-xl border-2 border-primary-400 shadow-sm" />
                <button type="button" onClick={() => removeNewImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                  <FiX size={12} />
                </button>
              </div>
            ))}
            {(existingImages.length + images.length) < 5 && (
              <label className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors group">
                <FiUploadCloud className="text-gray-400 mb-2 group-hover:text-primary-500 transition-colors" size={24} />
                <span className="text-xs text-gray-500 font-medium">Click to upload</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">Supported formats: JPG, PNG, WebP • Maximum 5MB per image</p>
        </div>

        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h3 className="font-semibold text-gray-700 border-b pb-3">Product Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Product Name *</label>
              <input className="input" placeholder="e.g. Fresh Organic Tomatoes" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={set('category')} required>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none" rows={4} placeholder="Describe the product quality, origin, benefits, etc."
              value={form.description} onChange={set('description')} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="label">Price (₹) *</label>
              <input type="number" className="input" placeholder="0" min="1" value={form.price} onChange={set('price')} required />
            </div>
            <div>
              <label className="label">Available Stock *</label>
              <input type="number" className="input" placeholder="0" min="0" value={form.stock} onChange={set('stock')} required />
            </div>
            <div>
              <label className="label">Unit Measure</label>
              <select className="input" value={form.unit} onChange={set('unit')}>
                {['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'bundle', 'pack', 'bottle', 'box'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="label">Search Tags (comma separated, optional)</label>
            <input className="input" placeholder="e.g. organic, fresh, village, natural" value={form.tags} onChange={set('tags')} />
          </div>
        </div>

        {/* Admin Specific overrides */}
        <div className="card p-6 space-y-5 border-l-4 border-primary-500">
          <div>
            <h3 className="font-semibold text-primary-700">Admin Options</h3>
            <p className="text-xs text-gray-500 mb-4">You can optionally assign this product to a specific virtual seller or location.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Display Seller Name (Optional)</label>
              <input className="input" placeholder="Defaults to 'EPM Admin'" value={form.sellerName} onChange={set('sellerName')} />
            </div>
            <div>
              <label className="label">Display Village / Origin (Optional)</label>
              <input className="input" placeholder="Defaults to 'Admin Hub'" value={form.villageName} onChange={set('villageName')} />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline px-8 py-3">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3 text-base">
            {loading
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : isEdit ? 'Save Changes & Approve' : 'Add Product & Approve'
            }
          </button>
        </div>
      </form>
    </div>
  );
}
