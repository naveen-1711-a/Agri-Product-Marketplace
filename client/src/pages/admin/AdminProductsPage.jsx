import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiSearch, FiPlus, FiEdit2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}&limit=50` : '?limit=50';
      const { data } = await api.get(`/products/admin/all${params}`);
      setProducts(data.products || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/products/admin/${id}/status`, { status: 'approved' });
      toast.success('Product approved!');
      fetchProducts();
    } catch { toast.error('Failed'); }
  };

  const handleReject = async () => {
    try {
      await api.put(`/products/admin/${rejectModal}/status`, { status: 'rejected', rejectionReason: reason });
      toast.success('Product rejected');
      setRejectModal(null); setReason('');
      fetchProducts();
    } catch { toast.error('Failed'); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sellerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">Products Management</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['pending', 'approved', 'rejected', ''].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>
          <Link to="/admin/products/new" className="btn-primary py-2 px-4 flex items-center gap-2 text-sm shadow-md">
            <FiPlus /> Add Product
          </Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9" placeholder="Search products or sellers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Product','Category','Seller','Price','Status','Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No products found</td></tr>
                ) : filtered.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || `https://placehold.co/40x40/A5D6A7/1B5E20?text=${p.name[0]}`}
                          alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                        <div><p className="font-medium line-clamp-1 max-w-xs">{p.name}</p><p className="text-xs text-gray-400">{p.villageName}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 text-gray-600">{p.sellerName}</td>
                    <td className="px-4 py-3 font-semibold">₹{p.price}</td>
                    <td className="px-4 py-3"><span className={`badge-${p.status}`}>{p.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 items-center">
                        <Link to={`/admin/products/edit/${p._id}`} className="text-gray-500 hover:text-primary-700 bg-gray-100 hover:bg-primary-50 p-1.5 rounded-lg transition-colors">
                          <FiEdit2 size={14} />
                        </Link>
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(p._id)} className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                              <FiCheck size={13} /> Approve
                            </button>
                            <button onClick={() => setRejectModal(p._id)} className="flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                              <FiX size={13} /> Reject
                            </button>
                          </>
                        )}
                        {p.status === 'approved' && <button onClick={() => setRejectModal(p._id)} className="text-xs text-red-500 hover:underline">Revoke</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-800 mb-3">Reject Product</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason for rejection (optional):</p>
            <textarea className="input resize-none mb-4" rows={3} placeholder="e.g. Images not clear, description incomplete..."
              value={reason} onChange={e => setReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setReason(''); }} className="btn-outline flex-1 justify-center">Cancel</button>
              <button onClick={handleReject} className="btn-danger flex-1 justify-center">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
