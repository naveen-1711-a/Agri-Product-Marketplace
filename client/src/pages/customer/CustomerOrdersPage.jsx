import { useState, useEffect } from 'react';
import { FiPackage } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import { generateBill } from '../../utils/generateBill';

const STATUS_COLORS = {
  pending: 'badge-pending',
  confirmed: 'badge-approved',
  shipped: 'badge-delivered',
  delivered: 'badge-approved',
  cancelled: 'badge-rejected',
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await api.put(`/orders/my/${id}/cancel`);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o));
    } catch (err) { alert(err.response?.data?.message || 'Cannot cancel'); }
  };


  if (loading) return <Spinner size="lg" text="Loading orders..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FiPackage size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm">Your orders will appear here once placed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card overflow-hidden">
              <div className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-gray-700">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className={STATUS_COLORS[order.status]}>{order.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.products.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                </div>
              </div>
              {expanded === order._id && (
                <div className="border-t px-4 py-4 bg-gray-50">
                  <div className="space-y-3 mb-4">
                    {order.products.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={p.image || `https://placehold.co/48x48/A5D6A7/1B5E20?text=${p.name[0]}`}
                          alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.sellerName} · Qty: {p.quantity}</p>
                        </div>
                        <span className="font-semibold text-sm">₹{(p.price * p.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <p className="font-medium">Shipping to:</p>
                    <p>{order.shippingAddress?.name}, {order.shippingAddress?.addressLine}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                  </div>
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button onClick={() => handleCancel(order._id)} className="btn-danger text-sm mr-3">Cancel Order</button>
                  )}
                  <button onClick={() => generateBill(order)} className="btn-outline text-sm text-primary-700 border-primary-700 hover:bg-primary-50">
                    Download Invoice
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
