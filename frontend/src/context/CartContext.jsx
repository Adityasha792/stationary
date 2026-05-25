import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart]             = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart([]); return; }
    try {
      setCartLoading(true);
      const res = await api.get('/cart');
      setCart(res.data.cart || []);
    } catch { setCart([]); }
    finally { setCartLoading(false); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const res = await api.post('/cart', { product_id: productId, quantity });
      setCart(res.data.cart || []);
      setSidebarOpen(true);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  }, []);

  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    try {
      const res = await api.put(`/cart/${cartItemId}`, { quantity });
      setCart(res.data.cart || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  }, []);

  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      const res = await api.delete(`/cart/${cartItemId}`);
      setCart(res.data.cart || []);
      toast.success('Removed from cart');
    } catch { toast.error('Failed to remove item'); }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await api.delete('/cart');
      setCart([]);
    } catch { toast.error('Failed to clear cart'); }
  }, []);

  const cartCount   = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal   = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, cartLoading, cartCount, cartTotal,
      sidebarOpen, setSidebarOpen,
      addToCart, updateQuantity, removeFromCart, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
