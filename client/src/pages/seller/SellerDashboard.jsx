import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="stat-card">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

export default function SellerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products/seller/my-products?limit=100'),
      api.get('/orders/seller'),
    ]).then(([p, o]) => {
      setProducts(p.data.products || []);
      setOrders(o.data.orders || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" text="Loading dashboard..." />;

  const approved = products.filter(p => p.status === 'approved').length;
  const pending = products.filter(p => p.status === 'pending').length;
  const rejected = products.filter(p => p.status === 'rejected').length;
  const revenue = orders.filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => {
      const myItems = o.products.filter(p => p.sellerId?.toString() === user._id);
      return acc + myItems.reduce((s, p) => s + p.price * p.quantity, 0);
    }, 0);

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Welcome, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-gray-500 text-sm">Here's your seller overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={products.length} icon={FiPackage} color="bg-primary-700" />
        <StatCard label="Approved" value={approved} icon={FiCheckCircle} color="bg-green-600" />
        <StatCard label="Pending" value={pending} icon={FiClock} color="bg-yellow-500" />
        <StatCard label="Revenue" value={`₹${revenue.toLocaleString('en-IN')}`} icon={FiDollarSign} color="bg-indigo-600" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={orders.length} icon={FiShoppingBag} color="bg-blue-500" />
        <StatCard label="Rejected" value={rejected} icon={FiXCircle} color="bg-red-500" />
        <StatCard label="Delivered" value={orders.filter(o => o.status === 'delivered').length} icon={FiCheckCircle} color="bg-teal-500" />
        <StatCard label="Pending Orders" value={orders.filter(o => o.status === 'pending').length} icon={FiClock} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Recent Products</h3>
            <Link to="/seller/products" className="text-sm text-primary-700 hover:underline flex items-center gap-1">
              View all <FiArrowRight size={13} />
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiPackage size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No products yet.</p>
              <Link to="/seller/products/new" className="btn-primary text-sm mt-3 inline-flex">Add Product</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map(p => (
                <div key={p._id} className="flex items-center gap-3">
                  <img src={p.images?.[0] || `https://placehold.co/40x40/A5D6A7/1B5E20?text=${p.name[0]}`}
                    alt={p.name} className="w-10 h-10 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-500">₹{p.price} · Stock: {p.stock}</p>
                  </div>
                  <span className={`badge-${p.status}`}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <Link to="/seller/orders" className="text-sm text-primary-700 hover:underline flex items-center gap-1">
              View all <FiArrowRight size={13} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiShoppingBag size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No orders yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-mono font-semibold text-sm">#{o._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{o.customerName} · {new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge-${o.status === 'delivered' ? 'approved' : o.status === 'cancelled' ? 'rejected' : 'pending'}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending approval notice */}
      {pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
          <FiClock className="text-yellow-600 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="font-semibold text-yellow-800 text-sm">
              {pending} product{pending > 1 ? 's' : ''} awaiting admin approval
            </p>
            <p className="text-yellow-700 text-xs mt-0.5">
              Your products will be visible publicly once approved by the admin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
