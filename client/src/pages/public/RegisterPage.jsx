import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GiWheat } from 'react-icons/gi';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', villageName: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-dark mb-6">
            <GiWheat size={36} />
            <span className="text-2xl font-bold">EPM</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join EPM and shop authentic village products</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" className="input pl-10" placeholder="Your full name" value={form.name} onChange={set('name')} required />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" className="input pl-10" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="Min. 6 characters"
                  value={form.password} onChange={set('password')} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Phone (Optional)</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" className="input pl-10" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
              </div>
            </div>
            <div>
              <label className="label">Village / City (Optional)</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" className="input pl-10" placeholder="Your village or city" value={form.villageName} onChange={set('villageName')} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
