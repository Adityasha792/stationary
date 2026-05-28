import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users, TrendingUp,
  Plus, Edit3, Trash2, Loader2, BarChart2, ArrowUpRight,
  X, Save, Upload,
} from 'lucide-react';
import { adminService } from '../services/productService';
import api from '../services/api';
import { formatPrice, formatDate, ORDER_STATUS } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders',    label: 'Orders',    icon: ShoppingBag },
  { id: 'products',  label: 'Products',  icon: Package },
  { id: 'users',     label: 'Users',     icon: Users },
];

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]           = useState('dashboard');
  const [data, setData]         = useState(null);
  const [orders, setOrders]     = useState([]);
  const [users, setUsers]       = useState([]);
  const [saving, setSaving]     = useState(false);
  const [imageMode, setImageMode]     = useState('url');
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [productModal, setProductModal] = useState(null);
  const [productForm, setProductForm]   = useState({});
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    loadData();
  }, [isAdmin, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, ord, usr] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAllOrders(),
        adminService.getAllUsers(),
      ]);
      setData(dash.data);
      setOrders(ord.data.orders || []);
      setUsers(usr.data.users || []);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await adminService.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success('Order status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const openProductModal = (product = null) => {
    if (product) {
      setProductForm({ ...product, images: product.images?.join(', ') || '', tags: product.tags?.join(', ') || '' });
      setProductModal('edit');
      setImageMode('url');
      setProductImageFile(null);
      setProductImagePreview(product.image_url || '');
    } else {
      setProductForm({ title:'', description:'', price:'', original_price:'', category:'', brand:'', stock:0, image_url:'', images:'', tags:'', is_featured:false });
      setProductModal('create');
      setImageMode('url');
      setProductImageFile(null);
      setProductImagePreview('');
    }
  };

  const handleProductImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) { setProductImageFile(null); setProductImagePreview(productForm.image_url || ''); return; }
    setProductImageFile(file);
    setProductImagePreview(URL.createObjectURL(file));
  };

  const saveProduct = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const imagesArray = productForm.images ? productForm.images.split(',').map(s => s.trim()).filter(Boolean) : [];
      const tagsArray   = productForm.tags   ? productForm.tags.split(',').map(s => s.trim()).filter(Boolean) : [];

      if (imageMode === 'upload' && productImageFile) {
        const formData = new FormData();
        Object.entries({ title: productForm.title, description: productForm.description,
          price: String(Number(productForm.price)), original_price: productForm.original_price ? String(Number(productForm.original_price)) : '',
          category: productForm.category, brand: productForm.brand, stock: String(Number(productForm.stock||0)),
          images: JSON.stringify(imagesArray), tags: JSON.stringify(tagsArray), is_featured: String(!!productForm.is_featured),
        }).forEach(([k, v]) => formData.append(k, v));
        formData.append('image', productImageFile);
        productModal === 'create' ? await adminService.createProduct(formData) : await adminService.updateProduct(productForm.id, formData);
        toast.success(productModal === 'create' ? 'Product created!' : 'Product updated!');
        setProductModal(null); loadData(); return;
      }

      const payload = { ...productForm, price: Number(productForm.price), original_price: Number(productForm.original_price)||null, stock: Number(productForm.stock), images: imagesArray, tags: tagsArray };
      productModal === 'create' ? await adminService.createProduct(payload) : await adminService.updateProduct(productForm.id, payload);
      toast.success(productModal === 'create' ? 'Product created!' : 'Product updated!');
      setProductModal(null); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await adminService.deleteProduct(id); toast.success('Product deleted'); loadData(); }
    catch { toast.error('Delete failed'); }
  };

  const STAT_CARDS = data ? [
    { label: 'Total Revenue', value: formatPrice(data.stats.totalRevenue), icon: TrendingUp,  gradient: 'linear-gradient(135deg, #FF9900, #e47911)', change: '+12.5%' },
    { label: 'Total Orders',  value: data.stats.totalOrders.toLocaleString(), icon: ShoppingBag, gradient: 'linear-gradient(135deg, #7C3AED, #6d28d9)', change: '+8.2%' },
    { label: 'Total Users',   value: data.stats.totalUsers.toLocaleString(), icon: Users,       gradient: 'linear-gradient(135deg, #27ae60, #1e8449)', change: '+5.1%' },
    { label: 'Products',      value: data.stats.totalProducts.toLocaleString(), icon: Package,  gradient: 'linear-gradient(135deg, #3498db, #2980b9)', change: '+2 new' },
  ] : [];

  return (
    <div style={{ backgroundColor: '#0F1111' }} className="min-h-screen">
      <div className="nexcart-container py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#E7E9EA]">Admin Panel</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Welcome back, {user?.name}</p>
          </div>
          <Link to="/" className="btn-amazon-secondary text-sm px-4 py-2 rounded-lg">
            ← Back to Store
          </Link>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0 space-y-1">
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

          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar mb-4 w-full">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  tab === t.id ? 'text-[#131921] font-bold' : 'text-[#A0AEC0]'
                }`}
                style={{ backgroundColor: tab === t.id ? '#FF9900' : 'rgba(255,255,255,0.06)' }}
              >
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-0">

            {/* ── Dashboard Tab ─────────────────────────────────── */}
            {tab === 'dashboard' && (
              <div className="space-y-5">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-lg" />)
                    : STAT_CARDS.map((card, i) => (
                        <motion.div key={card.label}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="rounded-lg p-5 text-white overflow-hidden relative"
                          style={{ background: card.gradient }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                              <card.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3" /> {card.change}
                            </span>
                          </div>
                          <p className="font-display text-2xl font-extrabold">{card.value}</p>
                          <p className="text-white/80 text-xs mt-1">{card.label}</p>
                        </motion.div>
                      ))
                  }
                </div>

                {/* Revenue Chart */}
                {!loading && data?.revenueByDay?.length > 0 && (
                  <div className="rounded-lg p-5" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 className="font-bold text-[#E7E9EA] mb-4 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-[#FF9900]" /> Revenue (Last 30 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={data.revenueByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={d => d.slice(5)} />
                        <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={v => formatPrice(v)}
                          contentStyle={{ background: '#1B2533', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#E7E9EA', fontSize: '13px' }}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#FF9900" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Recent Orders + Top Products */}
                <div className="grid lg:grid-cols-2 gap-5">
                  <div className="rounded-lg p-5" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 className="font-bold text-[#E7E9EA] mb-4">Recent Orders</h3>
                    <div className="space-y-3">
                      {(data?.recentOrders || []).slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between gap-2 text-sm py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <div className="min-w-0">
                            <p className="font-medium text-[#E7E9EA] truncate">{order.user_name}</p>
                            <p className="text-xs text-[#6B7280]">#{order.id} · {formatDate(order.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`badge badge-${ORDER_STATUS[order.status]?.color || 'info'} text-[10px]`}>
                              {ORDER_STATUS[order.status]?.label}
                            </span>
                            <span className="font-bold text-[#E7E9EA] text-sm">{formatPrice(order.final_price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg p-5" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 className="font-bold text-[#E7E9EA] mb-4">Top Selling Products</h3>
                    <div className="space-y-3">
                      {(data?.topProducts || []).map((p, i) => (
                        <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <span className="font-bold text-[#6B7280] text-sm w-5">#{i + 1}</span>
                          <img src={p.image_url} alt={p.title} className="w-10 h-10 object-cover rounded flex-shrink-0"
                            onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40'; }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#E7E9EA] truncate">{p.title}</p>
                            <p className="text-xs text-[#6B7280]">{Number(p.total_sold).toLocaleString()} sold</p>
                          </div>
                          <p className="text-sm font-bold text-[#FF9900] flex-shrink-0">{formatPrice(p.revenue)}</p>
                        </div>
                      ))}
                      {(!data?.topProducts || data.topProducts.length === 0) && (
                        <p className="text-[#6B7280] text-sm text-center py-6">No sales data yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Orders Tab ────────────────────────────────────── */}
            {tab === 'orders' && (
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="font-bold text-[#E7E9EA]">All Orders ({orders.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="amazon-table">
                    <thead>
                      <tr>
                        {['Order ID', 'Customer', 'Date', 'Amount', 'Status', 'Action'].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td className="font-mono text-[#FF9900] font-bold">#{order.id}</td>
                          <td>
                            <p className="font-medium text-[#E7E9EA] truncate max-w-[140px]">{order.user_name}</p>
                            <p className="text-xs text-[#6B7280] truncate max-w-[140px]">{order.user_email}</p>
                          </td>
                          <td className="text-[#6B7280] whitespace-nowrap">{formatDate(order.created_at)}</td>
                          <td className="font-bold text-[#E7E9EA] whitespace-nowrap">{formatPrice(order.final_price)}</td>
                          <td><span className={`badge badge-${ORDER_STATUS[order.status]?.color || 'info'}`}>{ORDER_STATUS[order.status]?.label}</span></td>
                          <td>
                            <select
                              value={order.status}
                              onChange={e => updateStatus(order.id, e.target.value)}
                              className="text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
                              style={{ backgroundColor: '#1B2533', border: '1px solid rgba(255,255,255,0.12)', color: '#E7E9EA' }}
                            >
                              {Object.keys(ORDER_STATUS).map(s => <option key={s} value={s}>{ORDER_STATUS[s].label}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <p className="text-center text-[#6B7280] py-8">No orders found</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Products Tab ──────────────────────────────────── */}
            {tab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#E7E9EA]">Product Management</h3>
                  <button onClick={() => openProductModal(null)} className="btn-amazon-orange text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>
                <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="p-4">
                    <AdminProductList onEdit={openProductModal} onDelete={deleteProduct} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Users Tab ─────────────────────────────────────── */}
            {tab === 'users' && (
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="font-bold text-[#E7E9EA]">All Users ({users.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="amazon-table">
                    <thead>
                      <tr>{['User', 'Email', 'Role', 'Joined'].map(h => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#FF9900] flex items-center justify-center text-dark-900 text-xs font-bold flex-shrink-0">
                                {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : u.name?.[0]?.toUpperCase()}
                              </div>
                              <span className="font-medium text-[#E7E9EA]">{u.name}</span>
                            </div>
                          </td>
                          <td className="text-[#6B7280]">{u.email}</td>
                          <td><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-success'}`}>{u.role}</span></td>
                          <td className="text-[#6B7280] whitespace-nowrap">{formatDate(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {productModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-lg p-6 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#E7E9EA]">
                {productModal === 'create' ? 'Add New Product' : 'Edit Product'}
              </h3>
              <button onClick={() => setProductModal(null)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            <form onSubmit={saveProduct} className="space-y-3">
              <input className="input text-sm" placeholder="Product Title *" required value={productForm.title || ''}
                onChange={e => setProductForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="input resize-none text-sm" rows={3} placeholder="Description"
                value={productForm.description || ''} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} />

              <div className="grid grid-cols-2 gap-3">
                <input className="input text-sm" type="number" placeholder="Price *" required value={productForm.price || ''}
                  onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} />
                <input className="input text-sm" type="number" placeholder="Original Price" value={productForm.original_price || ''}
                  onChange={e => setProductForm(f => ({ ...f, original_price: e.target.value }))} />
                <input className="input text-sm" placeholder="Category *" required value={productForm.category || ''}
                  onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} />
                <input className="input text-sm" placeholder="Brand" value={productForm.brand || ''}
                  onChange={e => setProductForm(f => ({ ...f, brand: e.target.value }))} />
                <input className="input text-sm" type="number" placeholder="Stock" value={productForm.stock || 0}
                  onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Use Image URL', mode: 'url' },
                  { label: 'Upload Image',  mode: 'upload', icon: Upload },
                ].map(opt => (
                  <button key={opt.mode} type="button" onClick={() => setImageMode(opt.mode)}
                    className={`text-sm rounded-lg px-3 py-2 border transition-colors flex items-center justify-center gap-2 ${
                      imageMode === opt.mode
                        ? 'border-[#FF9900] text-[#FF9900]'
                        : 'text-[#6B7280] hover:text-[#A0AEC0]'
                    }`}
                    style={{ borderColor: imageMode === opt.mode ? undefined : 'rgba(255,255,255,0.12)' }}
                  >
                    {opt.icon && <opt.icon className="w-4 h-4" />}
                    {opt.label}
                  </button>
                ))}
              </div>

              {imageMode === 'url' ? (
                <input className="input text-sm" placeholder="Main Image URL" value={productForm.image_url || ''}
                  onChange={e => setProductForm(f => ({ ...f, image_url: e.target.value }))} />
              ) : (
                <div className="space-y-2">
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="input text-sm" onChange={handleProductImageSelect} />
                  {productImagePreview && (
                    <img src={productImagePreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover border border-white/10" />
                  )}
                </div>
              )}

              <input className="input text-sm" placeholder="Extra images (comma-separated URLs)" value={productForm.images || ''}
                onChange={e => setProductForm(f => ({ ...f, images: e.target.value }))} />
              <input className="input text-sm" placeholder="Tags (comma-separated)" value={productForm.tags || ''}
                onChange={e => setProductForm(f => ({ ...f, tags: e.target.value }))} />

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!productForm.is_featured}
                  onChange={e => setProductForm(f => ({ ...f, is_featured: e.target.checked }))}
                  className="accent-[#FF9900] w-4 h-4" />
                <span className="text-sm text-[#A0AEC0]">Featured product</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setProductModal(null)} className="flex-1 btn-amazon-secondary py-2.5 rounded-lg text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-amazon-orange py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : 'Save Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function AdminProductList({ onEdit, onDelete }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/products?limit=50')
      .then(res => setProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton h-32 rounded-lg animate-pulse" />;

  return (
    <div className="space-y-2">
      {products.map(p => (
        <div key={p.id}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
        >
          <img src={p.image_url} alt={p.title} className="w-12 h-12 object-cover rounded flex-shrink-0"
            onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=48'; }} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-[#E7E9EA] truncate">{p.title}</p>
            <p className="text-xs text-[#6B7280]">{p.category} · Stock: {p.stock} · {formatPrice(p.price)}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => onEdit(p)}
              className="p-2 rounded-lg text-[#007185] hover:bg-white/5 transition-colors" title="Edit">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(p.id)}
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
