import { useState, useEffect } from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/orders/seller').then(({ data }) => setOrders(data.orders || [])).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/seller/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      toast.success('Order status updated');
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <Spinner size="lg" text="Loading orders..." />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">My Orders ({orders.length})</h2>

      {orders.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <FiShoppingBag size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm">Orders will appear here once customers purchase your products.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const myItems = order.products.filter(p => p.sellerId?.toString() === user._id);
            const myRevenue = myItems.reduce((s, p) => s + p.price * p.quantity, 0);

            return (
              <div key={order._id} className="card overflow-hidden">
                <div
                  className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-gray-700">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`badge-${order.status === 'delivered' ? 'approved' : order.status === 'cancelled' ? 'rejected' : 'pending'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {order.customerName} · {new Date(order.createdAt).toLocaleDateString('en-IN')} · {myItems.length} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-800">₹{myRevenue.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                    </div>
                    <select
                      value={order.status}
                      onChange={e => { e.stopPropagation(); updateStatus(order._id, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {expanded === order._id && (
                  <div className="border-t px-4 py-4 bg-gray-50 space-y-4">
                    {/* My Items in this order */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Your Products in this Order</p>
                      <div className="space-y-2">
                        {myItems.map((p, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                            <img
                              src={p.image || `https://placehold.co/48x48/A5D6A7/1B5E20?text=${p.name[0]}`}
                              alt={p.name} className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{p.name}</p>
                              <p className="text-xs text-gray-500">Qty: {p.quantity} × ₹{p.price}</p>
                            </div>
                            <span className="font-semibold text-sm">₹{(p.price * p.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Ship to</p>
                      <p className="text-sm text-gray-700">
                        {order.shippingAddress?.name} · {order.shippingAddress?.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress?.addressLine}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
