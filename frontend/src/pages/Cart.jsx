import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, discountPercent } from '../utils/formatters';

export default function CartPage() {
  const { cart, cartTotal, cartLoading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const savings = cart.reduce((s, i) => {
    const disc = i.original_price ? (i.original_price - i.price) * i.quantity : 0;
    return s + disc;
  }, 0);

  if (cartLoading) return (
    <div className="nexcart-container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({length:3}).map((_,i) => (
            <div key={i} className="card p-4 flex gap-4 animate-pulse">
              <div className="skeleton w-24 h-24 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-8 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div className="nexcart-container py-24 flex flex-col items-center justify-center text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
        <div className="w-24 h-24 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-dark-300 dark:text-dark-600" />
        </div>
      </motion.div>
      <h2 className="font-display text-2xl font-bold text-dark-800 dark:text-white mb-2">Your cart is empty</h2>
      <p className="text-dark-400 mb-8">Looks like you haven't added anything yet.</p>
      <Link to="/products" className="btn-primary">Start Shopping <ArrowRight className="w-4 h-4" /></Link>
    </div>
  );

  return (
    <div className="nexcart-container py-8 page-enter">
      <h1 className="font-display text-3xl font-bold text-dark-900 dark:text-white mb-8">
        Shopping Cart <span className="text-dark-400 text-lg font-normal">({cart.reduce((s,i) => s+i.quantity, 0)} items)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, i) => {
            const disc = discountPercent(item.original_price, item.price);
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-4 flex gap-4"
              >
                <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                  <img src={item.image_url} alt={item.title} className="w-24 h-24 object-cover rounded-xl hover:opacity-80 transition-opacity" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product_id}`} className="font-semibold text-dark-800 dark:text-dark-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2">
                    {item.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-dark-900 dark:text-white text-lg">{formatPrice(item.price)}</span>
                    {item.original_price && item.original_price > item.price && (
                      <>
                        <span className="text-dark-400 line-through text-sm">{formatPrice(item.original_price)}</span>
                        <span className="badge badge-danger text-[10px]">{disc}% off</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 border border-dark-200 dark:border-dark-600 rounded-xl overflow-hidden">
                      <button onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity-1) : removeFromCart(item.id)}
                        className="px-3 py-2 hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors">
                        <Minus className="w-3.5 h-3.5 text-dark-600 dark:text-dark-300" />
                      </button>
                      <span className="px-4 py-2 font-semibold text-dark-900 dark:text-white min-w-[2.5rem] text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity+1)}
                        disabled={item.quantity >= item.stock}
                        className="px-3 py-2 hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors disabled:opacity-40">
                        <Plus className="w-3.5 h-3.5 text-dark-600 dark:text-dark-300" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)}
                      className="btn-danger text-xs gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
                <div className="text-right hidden sm:block flex-shrink-0">
                  <p className="font-display font-bold text-primary-600 dark:text-primary-400">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </motion.div>
            );
          })}

          <button onClick={clearCart} className="text-sm text-red-500 hover:underline mt-2">
            Clear entire cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card p-6 space-y-4 sticky top-24">
            <h3 className="font-display text-xl font-bold text-dark-900 dark:text-white">Order Summary</h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-dark-600 dark:text-dark-300">
                <span>Subtotal ({cart.reduce((s,i) => s+i.quantity,0)} items)</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>You Save</span>
                  <span>−{formatPrice(savings)}</span>
                </div>
              )}
              <div className="flex justify-between text-dark-600 dark:text-dark-300">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
            </div>

            <div className="divider" />

            {/* Coupon hint */}
            <div className="flex items-center gap-2 text-xs text-dark-400">
              <Tag className="w-4 h-4 text-primary-500" />
              <span>Apply coupon at checkout for extra savings</span>
            </div>

            <div className="divider" />

            <div className="flex justify-between font-bold text-dark-900 dark:text-white text-lg">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary justify-center py-4 text-base"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </motion.button>

            <Link to="/products" className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
