import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('epm_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('epm_token');
    if (token) {
      api.get('/auth/me').then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('epm_user', JSON.stringify(data.user));
      }).catch(() => {
        localStorage.removeItem('epm_token');
        localStorage.removeItem('epm_user');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('epm_token', data.token);
    localStorage.setItem('epm_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('epm_token');
    localStorage.removeItem('epm_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('epm_user', JSON.stringify(updatedUser));
  };

  const toggleWishlist = async (productId) => {
    try {
      const { data } = await api.post('/auth/wishlist', { productId });
      if (data.success) {
        const updatedUser = { ...user, wishlist: data.wishlist };
        updateUser(updatedUser);
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, toggleWishlist }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
