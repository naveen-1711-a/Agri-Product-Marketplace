import { useState, useEffect } from 'react';
import { FiUser, FiLock, FiSave, FiPackage, FiShoppingCart, FiClock, FiChevronRight, FiCheckCircle, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import ProductCard from '../../components/common/ProductCard';

const STATUS_COLORS = {
  pending: 'badge-pending',
  confirmed: 'badge-approved',
  shipped: 'badge-delivered',
  delivered: 'badge-approved',
  cancelled: 'badge-rejected',
};

export default function CustomerDashboard() {
  const { user, updateUser } = useAuth();
  const { cartCount } = useCart();
  const [tab, setTab] = useState('overview');
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '', 
    villageName: user?.villageName || '', 
    address: user?.address || '' 
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    api.get('/orders/my')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, []);

  useEffect(() => {
    if (tab === 'wishlist') {
      setLoadingWishlist(true);
      api.get('/auth/wishlist')
        .then(({ data }) => setWishlistProducts(data.wishlist || []))
        .catch(console.error)
        .finally(() => setLoadingWishlist(false));
    }
  }, [tab]);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated successfully!');
    } catch { 
      toast.error('Failed to update profile'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { 
      toast.error('Passwords do not match'); 
      return; 
    }
    if (passForm.newPassword.length < 6) { 
      toast.error('Password must be at least 6 characters'); 
      return; 
    }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to change password'); 
    } finally { 
      setSaving(false); 
    }
  };

  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 rounded-3xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
          <FiPackage size={250} />
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/50 flex items-center justify-center text-3xl font-bold text-white shadow-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">Hello, {user?.name}!</h1>
            <p className="text-primary-100 font-medium text-lg">Welcome to your personal dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 sm:gap-6 mb-8 border-b border-gray-200 overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', icon: FiPackage, label: 'Overview' },
          { id: 'wishlist', icon: FiHeart, label: 'My Wishlist' },
          { id: 'profile', icon: FiUser, label: 'Profile Details' },
          { id: 'security', icon: FiLock, label: 'Security' },
        ].map(({ id, icon: Icon, label }) => (
          <button 
            key={id} 
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab === id 
                ? 'border-primary-600 text-primary-700' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content: Overview */}
      {tab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
                <FiPackage size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{orders.length}</p>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
                <FiClock size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{activeOrders}</p>
                <p className="text-sm font-medium text-gray-500">Active Orders</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                <FiShoppingCart size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{cartCount}</p>
                <p className="text-sm font-medium text-gray-500">Items in Cart</p>
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
              <Link to="/customer/orders" className="text-sm font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1">
                View All <FiChevronRight />
              </Link>
            </div>
            
            <div className="p-6">
              {loadingOrders ? (
                <Spinner text="Loading your orders..." />
              ) : orders.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <FiPackage size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-base font-medium">You haven't placed any orders yet.</p>
                  <Link to="/products" className="inline-block mt-4 btn-primary text-sm px-6 py-2">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div key={order._id} className="flex flex-col gap-4 p-5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <FiPackage size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.products.length} item(s)</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center">
                          <p className="font-bold text-gray-800">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                          <span className={`mt-1 text-[10px] ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                        </div>
                      </div>

                      {/* Order Tracking Progress */}
                      {order.status !== 'cancelled' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="relative flex justify-between">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full z-0"></div>
                            {['pending', 'confirmed', 'shipped', 'delivered'].map((step, index, arr) => {
                              const stepIndex = arr.indexOf(step);
                              const currentStatusIndex = arr.indexOf(order.status);
                              const isCompleted = stepIndex <= currentStatusIndex;
                              const isCurrent = stepIndex === currentStatusIndex;
                              const labels = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];
                              
                              return (
                                <div key={step} className="relative z-10 flex flex-col items-center gap-1">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors ${
                                    isCompleted ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-300'
                                  }`}>
                                    {isCompleted ? '✓' : index + 1}
                                  </div>
                                  <span className={`text-[10px] font-semibold ${isCurrent ? 'text-primary-700' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {labels[index]}
                                  </span>
                                </div>
                              );
                            })}
                            <div className="absolute top-1/2 left-0 h-1 bg-primary-600 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
                                 style={{ width: `${(Math.max(0, ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.status)) / 3) * 100}%` }}>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Wishlist */}
      {tab === 'wishlist' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">My Wishlist</h2>
              <p className="text-gray-500 text-sm">Products you have saved for later.</p>
            </div>
          </div>
          {loadingWishlist ? (
            <Spinner text="Loading wishlist..." />
          ) : wishlistProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <FiHeart size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">Explore our marketplace and add your favorite products to your wishlist.</p>
              <Link to="/products" className="btn-primary inline-flex">Explore Products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {wishlistProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Profile Details */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 animate-fadeIn max-w-3xl">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
            <p className="text-sm text-gray-500 mt-1">Update your personal details and address.</p>
          </div>
          <form onSubmit={handleProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
              </div>
              <div>
                <label className="label">Email Address (Read Only)</label>
                <input className="input bg-gray-50 text-gray-500 cursor-not-allowed" value={user?.email} disabled />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Phone Number</label>
                <input className="input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="Enter your mobile number" />
              </div>
              <div>
                <label className="label">Village / City</label>
                <input className="input" value={form.villageName} onChange={e => setForm(f => ({...f, villageName: e.target.value}))} placeholder="Your local area" />
              </div>
            </div>
            <div>
              <label className="label">Complete Address</label>
              <textarea className="input resize-none" rows={3} value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="House no, Street, Landmark..." />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2">
                <FiSave /> {saving ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content: Security */}
      {tab === 'security' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 animate-fadeIn max-w-xl">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
            <p className="text-sm text-gray-500 mt-1">Ensure your account uses a strong, secure password.</p>
          </div>
          <form onSubmit={handlePassword} className="space-y-5">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" value={passForm.currentPassword} onChange={e => setPassForm(f => ({...f, currentPassword: e.target.value}))} required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" value={passForm.newPassword} onChange={e => setPassForm(f => ({...f, newPassword: e.target.value}))} required />
              <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters long.</p>
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input" value={passForm.confirmPassword} onChange={e => setPassForm(f => ({...f, confirmPassword: e.target.value}))} required />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2">
                <FiCheckCircle /> {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
