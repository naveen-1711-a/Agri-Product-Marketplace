import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}&limit=100` : '?limit=100';
      const { data } = await api.get(`/products/seller/my-products${params}`);
      setProducts(data.products || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [filter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = products;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">My Products ({products.length})</h2>
        <Link to="/seller/products/new" className="btn-primary text-sm">
          <FiPlus /> Add Product
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? 'bg-primary-700 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {filtered.length === 0 ? (
            <div className="card p-16 text-center text-gray-400">
              <div className="text-5xl mb-4">📦</div>
              <p className="font-medium text-lg">No products found</p>
              <p className="text-sm mb-6">Start by adding your first product</p>
              <Link to="/seller/products/new" className="btn-primary text-sm">
                <FiPlus /> Add Product
              </Link>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(p => (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images?.[0] || `https://placehold.co/40x40/A5D6A7/1B5E20?text=${p.name[0]}`}
                              alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                            />
                            <div>
                              <p className="font-medium line-clamp-1 max-w-xs">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.villageName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{p.category}</td>
                        <td className="px-4 py-3 font-semibold text-primary-dark">₹{p.price}</td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${p.stock === 0 ? 'text-red-500' : p.stock < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge-${p.status}`}>{p.status}</span>
                          {p.status === 'rejected' && p.rejectionReason && (
                            <p className="text-xs text-red-500 mt-0.5 max-w-xs truncate" title={p.rejectionReason}>
                              ↳ {p.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {p.status === 'approved' && (
                              <a href={`/products/${p._id}`} target="_blank" rel="noreferrer"
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                <FiEye size={15} />
                              </a>
                            )}
                            <button onClick={() => navigate(`/seller/products/edit/${p._id}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <FiEdit2 size={15} />
                            </button>
                            <button onClick={() => handleDelete(p._id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
