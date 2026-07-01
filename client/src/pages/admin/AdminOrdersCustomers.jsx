import { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { generateBill } from '../../utils/generateBill';

const STATUS_OPTIONS = ['pending','confirmed','shipped','delivered','cancelled'];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await api.get(`/orders/admin/all?limit=100${filter ? `&status=${filter}` : ''}`);
    setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/admin/${id}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch { toast.error('Failed'); }
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">Orders</h2>
        <div className="flex gap-2 flex-wrap">
          {['', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? 'bg-primary-700 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>
      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Order ID','Customer','Total','Payment','Date','Status','Update','Invoice'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No orders</td></tr>
                ) : orders.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">{o.customerName}</td>
                    <td className="px-4 py-3 font-semibold">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">{o.paymentMethod}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3"><span className={`badge-${o.status === 'delivered' ? 'approved' : o.status === 'cancelled' ? 'rejected' : 'pending'}`}>{o.status}</span></td>
                    <td className="px-4 py-3">
                      <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)}
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => generateBill(o)} className="text-primary-700 hover:text-primary-800 text-xs font-semibold bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/customers').then(({ data }) => setCustomers(data.customers || [])).finally(() => setLoading(false));
  }, []);

  const toggle = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle-status`);
      setCustomers(prev => prev.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Customers ({customers.length})</h2>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Customer','Email','Phone','Village','Joined','Status'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No customers yet</td></tr>
              ) : customers.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-700">{c.name[0]}</div>
                      {c.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.villageName || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(c._id)} className={`badge-${c.isActive ? 'approved' : 'rejected'} cursor-pointer hover:opacity-80 transition-opacity`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
