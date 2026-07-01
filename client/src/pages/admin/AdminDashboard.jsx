import { useState, useEffect } from 'react';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="stat-card">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/products/admin/all?status=pending&limit=5'),
      api.get('/orders/admin/all?limit=5'),
    ]).then(([s, p, o]) => {
      setStats(s.data.stats);
      setPendingProducts(p.data.products || []);
      setRecentOrders(o.data.orders || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Overview</h2>
        <p className="text-gray-500 text-sm">Welcome back, Admin!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers || 0} icon={FiUsers} color="bg-blue-500" />
        <StatCard label="Sellers" value={stats?.totalSellers || 0} icon={FiUsers} color="bg-purple-500" />
        <StatCard label="Total Products" value={stats?.totalProducts || 0} icon={FiPackage} color="bg-primary-700" sub={`${stats?.approvedProducts} approved`} />
        <StatCard label="Revenue" value={`₹${(stats?.revenue || 0).toLocaleString('en-IN')}`} icon={FiDollarSign} color="bg-green-600" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={stats?.totalOrders || 0} icon={FiShoppingBag} color="bg-indigo-500" />
        <StatCard label="Pending Approval" value={stats?.pendingProducts || 0} icon={FiAlertCircle} color="bg-yellow-500" />
        <StatCard label="Customers" value={stats?.totalCustomers || 0} icon={FiUsers} color="bg-pink-500" />
        <StatCard label="Approved Products" value={stats?.approvedProducts || 0} icon={FiCheckCircle} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Products */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Pending Approvals</h3>
            <a href="/admin/products" className="text-sm text-primary-700 hover:underline">View all</a>
          </div>
          {pendingProducts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No pending products 🎉</p>
          ) : (
            <div className="space-y-3">
              {pendingProducts.map(p => (
                <div key={p._id} className="flex items-center gap-3">
                  <img src={p.images?.[0] || `https://placehold.co/40x40/A5D6A7/1B5E20?text=${p.name[0]}`}
                    alt={p.name} className="w-10 h-10 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.sellerName} · ₹{p.price}</p>
                  </div>
                  <span className="badge-pending">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <a href="/admin/orders" className="text-sm text-primary-700 hover:underline">View all</a>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">#{o._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{o.customerName} · {new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₹{o.totalAmount.toLocaleString('en-IN')}</p>
                    <span className={`badge-${o.status === 'delivered' ? 'approved' : o.status === 'cancelled' ? 'rejected' : 'pending'}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products Analytics */}
      <div className="card p-5 mt-6">
        <h3 className="font-bold text-gray-800 mb-4">Top Performing Products</h3>
        {stats?.topProducts?.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No sales data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-sm font-semibold text-gray-500">Product Name</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500">Units Sold</th>
                  <th className="pb-3 text-sm font-semibold text-gray-500 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats?.topProducts?.map(p => (
                  <tr key={p._id} className="border-b border-gray-50 last:border-none">
                    <td className="py-3 text-sm font-medium text-gray-800">{p.name}</td>
                    <td className="py-3 text-sm text-gray-600">{p.totalSold}</td>
                    <td className="py-3 text-sm font-bold text-primary-700 text-right">₹{p.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
