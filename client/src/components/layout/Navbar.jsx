import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setDropdownOpen(false); };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'seller') return '/seller/dashboard';
    return '/customer/dashboard';
  };

  return (
    <nav className="bg-primary-dark text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <GiWheat className="text-primary-light text-2xl" />
            <span className="text-white">EPM</span>
            <span className="text-primary-light text-sm font-normal hidden sm:block">Marketplace</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/products" className="hover:text-primary-light transition-colors">Shop</Link>
            <Link to="/categories" className="hover:text-primary-light transition-colors">Categories</Link>
            <Link to="/equipment" className="hover:text-primary-light transition-colors flex items-center gap-1">
              <span>🚜</span> Rent Equipment
            </Link>
            <Link to="/about" className="hover:text-primary-light transition-colors">About</Link>
            <Link to="/contact" className="hover:text-primary-light transition-colors">Contact</Link>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {user && (
              <Link to="/cart" className="relative p-2 hover:text-primary-light transition-colors">
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-primary-700 rounded-full px-3 py-1.5 hover:bg-primary-500 transition-colors text-sm">
                  <FiUser size={16} />
                  <span className="hidden sm:block max-w-24 truncate">{user.name.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                    </div>
                    <Link to={getDashboardLink()} onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors">
                      <FiPackage size={15} /> Dashboard
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 text-red-600 w-full text-sm transition-colors">
                      <FiLogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium hover:text-primary-light transition-colors px-3 py-1.5">Login</Link>
                <Link to="/register" className="bg-white text-primary-dark font-semibold text-sm px-4 py-1.5 rounded-lg hover:bg-primary-light transition-colors">Register</Link>
              </div>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-700 border-t border-primary-500 px-4 py-4 space-y-3 text-sm font-medium">
          <Link to="/products" onClick={() => setMenuOpen(false)} className="block hover:text-primary-light">Shop</Link>
          <Link to="/categories" onClick={() => setMenuOpen(false)} className="block hover:text-primary-light">Categories</Link>
          <Link to="/equipment" onClick={() => setMenuOpen(false)} className="block hover:text-primary-light">🚜 Rent Equipment</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="block hover:text-primary-light">About</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="block hover:text-primary-light">Contact</Link>
          {!user && (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block hover:text-primary-light">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block hover:text-primary-light">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
