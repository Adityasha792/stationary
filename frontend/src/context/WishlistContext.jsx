import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlist([]); return; }
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data.wishlist || []);
    } catch { setWishlist([]); }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = useCallback(async (productId) => {
    try {
      const res = await api.post('/wishlist', { product_id: productId });
      if (res.data.wishlisted) {
        toast.success('Added to wishlist ❤️');
      } else {
        toast.success('Removed from wishlist');
      }
      fetchWishlist();
      return res.data.wishlisted;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
      return null;
    }
  }, [fetchWishlist]);

  const isWishlisted = useCallback((productId) => {
    return wishlist.some(item => item.product_id === productId);
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
