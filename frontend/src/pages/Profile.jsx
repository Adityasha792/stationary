import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Package, Heart, Save, Loader2, ChevronRight, Mail, Shield, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import { orderService } from '../services/productService';
import { formatPrice, formatDate, ORDER_STATUS } from '../utils/formatters';
import toast from 'react-hot-toast';
import ProductCard from '../components/product/ProductCard';

const ACCOUNT_SECTIONS = [
  { to: '/orders',  icon: Package,  title: 'Your Orders',   desc: 'Track, return, or buy things again', color: '#FF9900' },
  { to: '/wishlist',icon: Heart,    title: 'Your Wishlist', desc: 'Saved items for purchase later', color: '#e74c3c' },
];

const TABS = [
  { id: 'account', label: 'Account',  icon: User    },
  { id: 'orders',  label: 'Orders',   icon: Package },
  { id: 'wishlist',label: 'Wishlist', icon: Heart   },
];

export default function Profile() {
  const { user, updateUser, isAdmin } = useAuth();
  const { wishlist } = useWishlist();
  const [tab, setTab]       = useState('account');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
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
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ backgroundColor: '#0F1111' }} className="min-h-screen page-enter">
      <div className="nexcart-container py-6 max-w-5xl">

        {/* Account Overview Header */}
        <div className="rounded-lg p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-[#FF9900] flex items-center justify-center text-dark-900 text-2xl font-bold overflow-hidden shadow-md">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : user?.name?.[0]?.toUpperCase()
              }
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-[#E7E9EA]">{user?.name}</h1>
            <p className="text-sm text-[#6B7280] flex items-center gap-2 mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                {user?.role === 'admin' ? '👑 Admin' : '✓ Verified'}
              </span>
            </div>
          </div>
          {isAdmin && (
            <Link to="/admin" className="btn-amazon-orange text-sm px-4 py-2 rounded-lg flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
            </Link>
          )}
        </div>

        {/* Quick Action Cards — on account tab home */}
        {tab === 'account' && (
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {ACCOUNT_SECTIONS.map(s => (
              <Link key={s.to} to={s.to}
                className="flex items-center gap-4 p-4 rounded-lg transition-all group"
                style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${s.color}18` }}>
                  <s.icon className="w-6 h-6" style={{ color: s.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#E7E9EA] text-sm">{s.title}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{s.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#FF9900] transition-colors" />
              </Link>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="space-y-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  tab === t.id
                    ? 'text-[#131921] font-bold'
                    : 'text-[#A0AEC0] hover:text-[#E7E9EA] hover:bg-white/5'
                }`}
                style={{ backgroundColor: tab === t.id ? '#FF9900' : 'transparent' }}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">

            {/* ── Account Tab ──────────────────────────────────── */}
            {tab === 'account' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="rounded-lg p-5" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h2 className="font-bold text-[#E7E9EA] mb-4">Personal Information</h2>
                  <form onSubmit={saveProfile} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-[#A0AEC0] block mb-1.5">Full Name</label>
                        <input className="input text-sm py-2.5" value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#A0AEC0] block mb-1.5">Phone</label>
                        <input className="input text-sm py-2.5" placeholder="+91 9999999999"
                          value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-[#A0AEC0] block mb-1.5">Email (read-only)</label>
                        <input className="input text-sm py-2.5 opacity-60 cursor-not-allowed" value={user?.email} readOnly />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-[#A0AEC0] block mb-1.5">Avatar URL (optional)</label>
                        <input className="input text-sm py-2.5" placeholder="https://…"
                          value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} />
                      </div>
                    </div>
                    <button type="submit" disabled={saving} className="btn-amazon-orange px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </form>
                </div>

                {/* Security section */}
                <div className="rounded-lg p-5 mt-4" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-green-400" />
                    <h2 className="font-bold text-[#E7E9EA]">Security</h2>
                  </div>
                  <div className="text-sm text-[#6B7280] space-y-2">
                    <p>✓ Two-factor authentication: <span className="text-[#A0AEC0]">Not enabled</span></p>
                    <p>✓ Password: <span className="text-[#A0AEC0]">Set</span></p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Orders Tab ───────────────────────────────────── */}
            {tab === 'orders' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-lg" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-lg py-16 text-center" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Package className="w-12 h-12 text-[#374151] mx-auto mb-4" />
                    <h3 className="font-semibold text-[#E7E9EA] mb-2">No orders yet</h3>
                    <p className="text-sm text-[#6B7280] mb-6">Start shopping to see your orders here</p>
                    <Link to="/products" className="btn-amazon-orange text-sm px-6 py-2 rounded-lg">Shop Now</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => {
                      const st = ORDER_STATUS[order.status];
                      return (
                        <div key={order.id} className="rounded-lg overflow-hidden" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="flex items-center justify-between px-4 py-3 text-xs" style={{ backgroundColor: '#1B2533', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex gap-4">
                              <span className="text-[#6B7280]">Order #{order.id}</span>
                              <span className="text-[#6B7280]">{formatDate(order.created_at)}</span>
                            </div>
                            <span className={`badge badge-${st?.color || 'info'}`}>{st?.icon} {st?.label}</span>
                          </div>
                          <div className="p-4 flex items-center gap-4">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                              {order.items?.slice(0, 3).map(item => (
                                <img key={item.id} src={item.image_url} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0"
                                  onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=48'; }} />
                              ))}
                              {order.items?.length > 3 && (
                                <div className="w-12 h-12 rounded flex items-center justify-center text-xs text-[#6B7280] flex-shrink-0"
                                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                  +{order.items.length - 3}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-[#E7E9EA] text-sm">{formatPrice(order.final_price)}</p>
                              <p className="text-xs text-[#6B7280]">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                            </div>
                            <Link to="/orders" className="text-xs text-[#007185] hover:text-[#FF9900] hover:underline flex items-center gap-1 transition-colors">
                              View Details <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Wishlist Tab ──────────────────────────────────── */}
            {tab === 'wishlist' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {wishlist.length === 0 ? (
                  <div className="rounded-lg py-16 text-center" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Heart className="w-12 h-12 text-[#374151] mx-auto mb-4" />
                    <h3 className="font-semibold text-[#E7E9EA] mb-2">Wishlist is empty</h3>
                    <p className="text-sm text-[#6B7280] mb-6">Tap ♥ on products to save them</p>
                    <Link to="/products" className="btn-amazon-orange text-sm px-6 py-2 rounded-lg">Explore Products</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
    </div>
  );
}
