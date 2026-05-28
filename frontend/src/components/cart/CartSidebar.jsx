import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';

export default function CartSidebar() {
  const {
    cart, cartTotal, cartLoading,
    sidebarOpen, setSidebarOpen,
    updateQuantity, removeFromCart,
  } = useCart();
  const navigate = useNavigate();

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 flex flex-col"
            style={{ backgroundColor: '#131921', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#FF9900]" />
                <h2 className="font-bold text-[#E7E9EA]">
                  Your Cart
                  {totalItems > 0 && (
                    <span className="ml-2 text-sm text-[#6B7280] font-normal">({totalItems} items)</span>
                  )}
                </h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-[#A0AEC0]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {cartLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="skeleton w-16 h-16 rounded flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-3 w-full rounded" />
                        <div className="skeleton h-3 w-2/3 rounded" />
                        <div className="skeleton h-4 w-1/3 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <Package className="w-10 h-10 text-[#374151]" />
                  </div>
                  <h3 className="font-semibold text-[#E7E9EA] mb-2">Your cart is empty</h3>
                  <p className="text-sm text-[#6B7280] mb-6">Add items to get started</p>
                  <button
                    onClick={() => { setSidebarOpen(false); navigate('/products'); }}
                    className="btn-amazon-orange text-sm px-6 py-2 rounded-lg"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="flex gap-3 pb-3"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {/* Image */}
                      <Link to={`/products/${item.product_id}`} onClick={() => setSidebarOpen(false)} className="flex-shrink-0">
                        <div className="w-16 h-16 rounded overflow-hidden" style={{ backgroundColor: '#1B2533' }}>
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                            onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64'; }}
                          />
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product_id}`}
                          onClick={() => setSidebarOpen(false)}
                          className="text-xs font-medium text-[#E7E9EA] hover:text-[#FF9900] transition-colors line-clamp-2 leading-snug"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm font-bold text-[#E7E9EA] mt-1">{formatPrice(item.price)}</p>
                        <p className="text-xs text-green-400 mt-0.5">FREE delivery</p>

                        <div className="flex items-center gap-2 mt-2">
                          {/* Qty */}
                          <div className="flex items-center rounded overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.12)', backgroundColor: '#1B2533' }}>
                            <button
                              onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)}
                              className="px-2 py-1 hover:bg-white/5 transition-colors text-[#E7E9EA]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 py-1 text-xs font-bold text-[#E7E9EA] border-x" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="px-2 py-1 hover:bg-white/5 transition-colors text-[#E7E9EA] disabled:opacity-40"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-[#6B7280] hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#A0AEC0]">Subtotal ({totalItems} items)</span>
                  <span className="font-bold text-[#E7E9EA]">{formatPrice(cartTotal)}</span>
                </div>

                <button
                  onClick={() => { setSidebarOpen(false); navigate('/checkout'); }}
                  className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'linear-gradient(to bottom, #f0c14b, #e47911)', color: '#131921' }}
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => { setSidebarOpen(false); navigate('/cart'); }}
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-[#A0AEC0] hover:text-[#E7E9EA] transition-colors text-center"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  View Full Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
