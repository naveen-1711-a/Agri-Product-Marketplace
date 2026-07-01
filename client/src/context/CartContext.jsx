import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    try {
      setCartLoading(true);
      const { data } = await api.get('/cart');
      setCart(data.cart);
    } catch (err) {
      console.error(err);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    try {
      const { data } = await api.post('/cart/add', { productId, quantity });
      setCart(data.cart);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/item/${productId}`);
      setCart(data.cart);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await api.put(`/cart/item/${productId}`, { quantity });
      setCart(data.cart);
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCart({ items: [] });
    } catch (err) { console.error(err); }
  };

  const cartCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, cartLoading, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
