import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Shield, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, discountPercent } from '../utils/formatters';

export default function CartPage() {
  const { cart, cartTotal, cartLoading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const savings = cart.reduce((s, i) => {
    const disc = i.original_price ? (i.original_price - i.price) * i.quantity : 0;
    return s + disc;
  }, 0);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  if (cartLoading) return (
    <div style={{ backgroundColor: '#0F1111' }} className="min-h-screen py-6">
      <div className="nexcart-container">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg p-4 flex gap-4 animate-pulse" style={{ backgroundColor: '#131921' }}>
                <div className="skeleton w-24 h-24 rounded flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-8 w-32 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="skeleton h-72 rounded-lg" />
        </div>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div style={{ backgroundColor: '#0F1111' }} className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4 py-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#131921', border: '2px solid rgba(255,255,255,0.1)' }}>
            <ShoppingBag className="w-14 h-14 text-[#6B7280]" />
          </div>
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-[#E7E9EA] mb-2">Your Cart is Empty</h2>
        <p className="text-[#6B7280] mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn-amazon-orange text-sm px-8 py-3 rounded-lg inline-flex items-center gap-2 font-bold">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#0F1111' }} className="min-h-screen page-enter">
      <div className="nexcart-container py-6">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* ── Cart Items ─────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Header */}
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h1 className="font-display text-2xl font-bold text-[#E7E9EA]">Shopping Cart</h1>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-[#6B7280]">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                  <button onClick={clearCart} className="text-xs text-[#007185] hover:text-red-400 hover:underline transition-colors">
                    Deselect all items
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {cart.map((item, i) => {
                  const disc = discountPercent(item.original_price, item.price);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="px-5 py-4 flex gap-4"
                    >
                      {/* Image */}
                      <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                        <div className="w-24 h-24 rounded overflow-hidden" style={{ backgroundColor: '#1B2533' }}>
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                            onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=96'; }}
                          />
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product_id}`}
                          className="text-sm font-medium text-[#007185] hover:text-[#FF9900] hover:underline transition-colors line-clamp-2"
                        >
                          {item.title}
                        </Link>

                        {/* Stock & Prime */}
                        <p className="text-xs text-green-400 font-medium mt-1">In Stock</p>
                        <p className="text-xs text-[#007185] font-medium mt-0.5">✓ FREE Delivery</p>

                        {/* Price on mobile */}
                        <div className="flex items-center gap-2 mt-1 sm:hidden">
                          <span className="font-bold text-[#E7E9EA]">{formatPrice(item.price)}</span>
                          {item.original_price && item.original_price > item.price && (
                            <span className="text-xs text-[#6B7280] line-through">{formatPrice(item.original_price)}</span>
                          )}
                        </div>

                        {/* Actions row */}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {/* Qty stepper */}
                          <div className="flex items-center rounded overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.15)', backgroundColor: '#1B2533' }}>
                            <button
                              onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)}
                              className="px-3 py-1.5 hover:bg-white/5 transition-colors text-[#E7E9EA] text-sm"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-4 py-1.5 text-sm font-bold text-[#E7E9EA] border-x"
                              style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="px-3 py-1.5 hover:bg-white/5 transition-colors text-[#E7E9EA] text-sm disabled:opacity-40"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-[#374151] text-sm">|</span>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center gap-1 text-xs text-[#007185] hover:text-red-400 hover:underline transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>

                          <span className="text-[#374151] text-sm">|</span>
                          <button className="text-xs text-[#007185] hover:underline transition-colors">Save for later</button>
                        </div>
                      </div>

                      {/* Price — Desktop */}
                      <div className="hidden sm:block text-right flex-shrink-0">
                        <p className="font-bold text-[#E7E9EA] text-base">{formatPrice(item.price * item.quantity)}</p>
                        {item.original_price && item.original_price > item.price && (
                          <div className="mt-0.5">
                            <span className="text-xs text-[#6B7280] line-through">{formatPrice(item.original_price * item.quantity)}</span>
                            <span className="text-xs text-[#B12704] font-semibold ml-1">-{disc}%</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Subtotal footer */}
              {savings > 0 && (
                <div className="px-5 py-3 text-right text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-[#6B7280]">Subtotal ({totalItems} items): </span>
                  <span className="font-bold text-[#E7E9EA]">{formatPrice(cartTotal)}</span>
                  <span className="text-green-400 ml-2 font-medium">You save {formatPrice(savings)}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Order Summary ──────────────────────────────────────── */}
          <div>
            <div className="rounded-lg p-5 sticky top-28 space-y-4" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>

              {/* Free delivery notice */}
              <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.2)' }}>
                <Truck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-400 leading-relaxed">
                  <span className="font-bold">FREE Delivery</span> on your order
                </p>
              </div>

              {/* Subtotal */}
              <div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#A0AEC0]">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Savings</span>
                      <span>-{formatPrice(savings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#A0AEC0]">
                    <span>Delivery</span>
                    <span className="text-green-400 font-medium">FREE</span>
                  </div>
                </div>

                <div className="my-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

                <div className="flex justify-between font-bold text-[#E7E9EA] text-lg">
                  <span>Order Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Coupon hint */}
              <div className="flex items-center gap-2 text-xs text-[#A0AEC0]">
                <Tag className="w-3.5 h-3.5 text-[#FF9900]" />
                <span>Apply coupon at checkout for extra savings</span>
              </div>

              {/* Checkout button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/checkout')}
                className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(to bottom, #f0c14b, #e47911)', border: '1px solid #e47911', color: '#131921' }}
              >
                Proceed to Buy ({totalItems}) <ArrowRight className="w-4 h-4" />
              </motion.button>

              <Link to="/products" className="block text-center text-sm text-[#007185] hover:text-[#FF9900] hover:underline transition-colors">
                Continue Shopping
              </Link>

              {/* Trust */}
              <div className="flex items-center justify-center gap-2 text-xs text-[#6B7280] pt-2 border-t border-white/10">
                <Shield className="w-3.5 h-3.5" />
                <span>Safe & Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
