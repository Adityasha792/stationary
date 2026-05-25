import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Package, Heart, Camera, Save, Loader2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import { orderService } from '../services/productService';
import { formatPrice, formatDate, ORDER_STATUS } from '../utils/formatters';
import toast from 'react-hot-toast';
import ProductCard from '../components/product/ProductCard';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { wishlist } = useWishlist();
  const [tab, setTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });

  useEffect(() => {
    if (tab === 'orders') {
      setLoading(true);
      orderService.getMyOrders()
        .then(res => setOrders(res.data.orders || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally { setSaving(false); }
  };

  const TABS = [
    { id: 'profile',  label: 'My Profile',  icon: User },
    { id: 'orders',   label: 'My Orders',   icon: Package },
    { id: 'wishlist', label: 'Wishlist',     icon: Heart },
  ];

  return (
    <div className="nexcart-container py-8 page-enter">
      <h1 className="font-display text-3xl font-bold text-dark-900 dark:text-white mb-8">My Account</h1>

      {/* Avatar Header */}
      <div className="card p-6 flex flex-col sm:flex-row items-center gap-5 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-3xl font-bold shadow-glow overflow-hidden">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center shadow-md hover:bg-primary-500 transition-colors">
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-dark-900 dark:text-white">{user?.name}</h2>
          <p className="text-dark-400 text-sm">{user?.email}</p>
          <span className={`badge mt-2 ${user?.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
            {user?.role === 'admin' ? '👑 Admin' : '✓ Verified User'}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${tab === t.id ? 'bg-primary-600 text-white shadow-glow-sm' : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          {tab === 'profile' && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
              <div className="card p-6">
                <h3 className="font-display font-bold text-dark-900 dark:text-white mb-5">Personal Information</h3>
                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Full Name</label>
                      <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Phone</label>
                      <input className="input" placeholder="+91 9999999999" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Email (read-only)</label>
                      <input className="input opacity-60 cursor-not-allowed" value={user?.email} readOnly />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Avatar URL</label>
                      <input className="input" placeholder="https://..." value={form.avatar} onChange={e => setForm(f => ({...f, avatar: e.target.value}))} />
                    </div>
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {tab === 'orders' && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({length:3}).map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl animate-pulse" />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="card p-12 text-center">
                  <Package className="w-12 h-12 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
                  <h3 className="font-display font-semibold text-dark-700 dark:text-dark-300">No orders yet</h3>
                  <p className="text-dark-400 text-sm mt-1 mb-6">Start shopping to see your orders here</p>
                  <Link to="/products" className="btn-primary text-sm">Shop Now</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    const st = ORDER_STATUS[order.status];
                    return (
                      <div key={order.id} className="card p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div>
                            <p className="text-xs text-dark-400">Order #{order.id}</p>
                            <p className="text-sm font-semibold text-dark-800 dark:text-dark-100">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{st?.icon}</span>
                            <span className={`badge badge-${st?.color || 'info'}`}>{st?.label}</span>
                          </div>
                          <p className="font-bold text-dark-900 dark:text-white">{formatPrice(order.final_price)}</p>
                        </div>
                        {/* Items preview */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                          {order.items?.slice(0,4).map(item => (
                            <img key={item.id} src={item.image_url} alt={item.title} className="w-12 h-12 object-cover rounded-xl flex-shrink-0" />
                          ))}
                          {order.items?.length > 4 && (
                            <div className="w-12 h-12 rounded-xl bg-dark-100 dark:bg-dark-700 flex items-center justify-center text-xs text-dark-500 flex-shrink-0">
                              +{order.items.length-4}
                            </div>
                          )}
                        </div>
                        <Link to={`/orders/${order.id}`} className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline mt-3">
                          View Details <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'wishlist' && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
              {wishlist.length === 0 ? (
                <div className="card p-12 text-center">
                  <Heart className="w-12 h-12 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
                  <h3 className="font-display font-semibold text-dark-700 dark:text-dark-300">Wishlist is empty</h3>
                  <p className="text-dark-400 text-sm mt-1 mb-6">Save your favorite items here</p>
                  <Link to="/products" className="btn-primary text-sm">Explore Products</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlist.map((item, i) => (
                    <ProductCard key={item.product_id} product={{
                      id: item.product_id, title: item.title, price: item.price,
                      original_price: item.original_price, image_url: item.image_url,
                      rating: item.rating, review_count: item.review_count,
                      category: item.category, brand: item.brand, stock: item.stock,
                    }} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
