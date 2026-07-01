import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const EMPTY = { name: '', email: '', password: '', phone: '', villageName: '' };

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchSellers = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/sellers');
    setSellers(data.sellers || []);
    setLoading(false);
  };

  useEffect(() => { fetchSellers(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (s) => { setForm({ name: s.name, email: s.email, password: '', phone: s.phone || '', villageName: s.villageName || '' }); setEditId(s._id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/admin/sellers/${editId}`, form);
        toast.success('Seller updated');
      } else {
        await api.post('/admin/sellers', form);
        toast.success('Seller created! They can now login.');
      }
      setModal(false);
      fetchSellers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this seller?')) return;
    try { await api.delete(`/admin/sellers/${id}`); toast.success('Seller deleted'); fetchSellers(); }
    catch { toast.error('Failed to delete'); }
  };

  const toggleStatus = async (id) => {
    try { await api.put(`/admin/users/${id}/toggle-status`); fetchSellers(); }
    catch { toast.error('Failed'); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Seller Management</h2>
        <button onClick={openCreate} className="btn-primary text-sm"><FiPlus /> Add Seller</button>
      </div>

      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Seller','Email','Village','Status','Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellers.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No sellers yet. Create one!</td></tr>
                ) : sellers.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-dark text-sm">{s.name[0]}</div>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.email}</td>
                    <td className="px-4 py-3 text-gray-600">{s.villageName || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(s._id)} className={`badge-${s.isActive ? 'approved' : 'rejected'} cursor-pointer hover:opacity-80`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 size={15} /></button>
                        <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-gray-800">{editId ? 'Edit Seller' : 'Create Seller'}</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600"><FiX /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={set('name')} required /></div>
              <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={set('email')} required disabled={!!editId} /></div>
              {!editId && <div><label className="label">Password</label><input type="password" className="input" value={form.password} onChange={set('password')} required minLength={6} placeholder="Min 6 characters" /></div>}
              <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
              <div><label className="label">Village Name</label><input className="input" value={form.villageName} onChange={set('villageName')} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? 'Saving...' : editId ? 'Update' : 'Create Seller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
