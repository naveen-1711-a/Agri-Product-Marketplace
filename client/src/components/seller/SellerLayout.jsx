import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiPackage, FiShoppingBag, FiUser, FiMenu, FiX, FiLogOut, FiPlusCircle, FiTool } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/seller/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/seller/products', icon: FiPackage, label: 'Products' },
  { to: '/seller/products/new', icon: FiPlusCircle, label: 'Add Product' },
  { to: '/seller/equipment', icon: FiTool, label: 'Equipment' },
  { to: '/seller/orders', icon: FiShoppingBag, label: 'Orders' },
  { to: '/seller/profile', icon: FiUser, label: 'Profile' },
];

// Moved OUTSIDE component to prevent re-mount on state change
function Sidebar({ user, onClose, onLogout }) {
  return (
    <div className="h-full flex flex-col bg-primary-dark text-white">
      <div className="p-5 border-b border-primary-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GiWheat className="text-primary-light text-2xl" />
          <div><p className="font-bold text-sm">Seller Hub</p><p className="text-xs text-primary-light">{user?.villageName || 'EPM'}</p></div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-green-200 hover:text-white p-1">
            <FiX size={20} />
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/seller/dashboard'}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-700 text-white' : 'text-green-200 hover:bg-primary-700/50 hover:text-white'}`}
            onClick={onClose}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-primary-700">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{user?.name?.[0]}</div>
          <div className="min-w-0"><p className="text-sm font-medium truncate">{user?.name}</p><p className="text-xs text-primary-light">Seller</p></div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-red-300 hover:text-red-200 text-sm px-1 transition-colors">
          <FiLogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}

export default function SellerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0 flex-col shadow-xl">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl animate-slide-in">
            <Sidebar user={user} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <FiMenu size={22} />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <GiWheat className="text-primary-dark text-xl" />
              <span className="font-bold text-primary-dark text-base">Seller Hub</span>
            </div>
            <h1 className="font-semibold text-gray-700 text-lg hidden lg:block">Seller Dashboard</h1>
          </div>
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Seller</span>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden bg-white border-t border-gray-200 flex items-center justify-around py-2 px-1 flex-shrink-0 shadow-lg fixed bottom-0 left-0 right-0 z-40">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/seller/dashboard'}
              className={({ isActive }) => `flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg text-xs transition-colors min-w-0 ${isActive ? 'text-primary-700 font-semibold' : 'text-gray-500'}`}>
              <Icon size={19} />
              <span className="leading-none truncate w-full text-center" style={{fontSize:'0.6rem'}}>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <style>{`
        @keyframes slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.25s ease-out forwards; }
      `}</style>
    </div>
  );
}
