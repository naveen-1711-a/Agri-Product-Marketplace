import { useState } from 'react';
import { FiUser, FiLock, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function SellerProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    villageName: user?.villageName || '',
    address: user?.address || '',
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passForm.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-dark">
          {user?.name?.[0]}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email} · Seller</p>
          {user?.villageName && <p className="text-xs text-primary-700 font-medium mt-0.5">📍 {user.villageName}</p>}
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {[['profile', FiUser, 'Profile'], ['password', FiLock, 'Password']].map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === key ? 'border-primary-700 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfile} className="card p-6 space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Village Name</label>
            <input className="input" value={form.villageName} onChange={e => setForm(f => ({ ...f, villageName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea className="input resize-none" rows={3} value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePassword} className="card p-6 space-y-4">
          {[
            ['currentPassword', 'Current Password'],
            ['newPassword', 'New Password'],
            ['confirmPassword', 'Confirm New Password'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type="password" className="input" value={passForm[key]}
                onChange={e => setPassForm(f => ({ ...f, [key]: e.target.value }))} required />
            </div>
          ))}
          <button type="submit" disabled={saving} className="btn-primary">
            <FiLock /> {saving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
}
