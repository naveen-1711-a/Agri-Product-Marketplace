import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GiWheat } from 'react-icons/gi';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      if (from) { navigate(from, { replace: true }); return; }
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'seller') navigate('/seller/dashboard', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-dark mb-6">
            <GiWheat size={36} />
            <span className="text-2xl font-bold">EPM</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" className="input pl-10" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-primary-50 rounded-xl text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-primary-dark mb-2">Demo credentials:</p>
            <p>🔐 Admin: admin@epm.com / Admin@123</p>
            <p>👤 Customer: register below</p>
          </div>

          <p className="text-center text-sm text-gray-600 mt-5">
            New customer?{' '}
            <Link to="/register" className="text-primary-700 font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
