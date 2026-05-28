import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ShoppingBag, Truck, Mail } from 'lucide-react';
import { orderService } from '../services/productService';
import { formatPrice, formatDate, ORDER_STATUS } from '../utils/formatters';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrder(id)
      .then(res => setOrder(res.data.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ backgroundColor: '#0F1111' }} className="min-h-screen flex items-center justify-center py-12 px-4 page-enter">
      <div className="max-w-lg w-full">

        {/* Success icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', boxShadow: '0 0 40px rgba(39,174,96,0.4)' }}
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="font-display text-3xl font-extrabold text-[#E7E9EA] mb-2">
              Order Placed! 🎉
            </h1>
            <p className="text-[#A0AEC0] text-sm">
              Thank you! Your order has been confirmed and is being processed.
            </p>
          </motion.div>
        </div>

        {/* Email notification notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 p-3 rounded-lg mb-4 text-sm"
          style={{ backgroundColor: 'rgba(0,113,133,0.1)', border: '1px solid rgba(0,113,133,0.2)' }}
        >
          <Mail className="w-4 h-4 text-[#007185] flex-shrink-0" />
          <span className="text-[#A0AEC0]">
            Confirmation email sent to your registered address
          </span>
        </motion.div>

        {/* Order details card */}
        {!loading && order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: '#1B2533', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wider">Order Number</p>
                <p className="font-bold text-[#FF9900] mt-0.5">#{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#6B7280] uppercase tracking-wider">Placed</p>
                <p className="text-sm font-medium text-[#E7E9EA] mt-0.5">{formatDate(order.created_at)}</p>
              </div>
            </div>

            {/* Status */}
            <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="text-xl">{ORDER_STATUS[order.status]?.icon}</span>
              </div>
              <div>
                <p className="font-semibold text-[#E7E9EA] text-sm">{ORDER_STATUS[order.status]?.label}</p>
                <p className="text-xs text-[#6B7280]">Expected delivery: 2-5 business days</p>
              </div>
              <div className="ml-auto flex items-center gap-2 text-xs text-green-400">
                <Truck className="w-4 h-4" />
                FREE Delivery
              </div>
            </div>

            {/* Items */}
            <div className="px-5 py-4 space-y-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0" style={{ backgroundColor: '#1B2533' }}>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=56'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#E7E9EA] line-clamp-1">{item.title}</p>
                    <p className="text-xs text-[#6B7280]">Qty: {item.quantity} · {formatPrice(item.price_at_purchase)} each</p>
                  </div>
                  <p className="text-sm font-bold text-[#E7E9EA] flex-shrink-0">
                    {formatPrice(item.price_at_purchase * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Price & Delivery */}
            <div className="px-5 py-4 space-y-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {order.shipping_address && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-xs text-[#6B7280] mb-1 font-medium">Delivering to:</p>
                  <p className="text-[#E7E9EA] font-medium">{order.shipping_address.full_name}</p>
                  <p className="text-[#A0AEC0] text-xs">{order.shipping_address.address_line}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-[#A0AEC0] text-sm">Order Total</span>
                <span className="text-xl font-extrabold text-[#E7E9EA]">{formatPrice(order.final_price)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 flex gap-3">
              <Link
                to="/orders"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-[#E7E9EA] transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)' }}
              >
                <Package className="w-4 h-4" />
                Track Order
              </Link>
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all"
                style={{ background: 'linear-gradient(to bottom, #f0c14b, #e47911)', color: '#131921' }}
              >
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        )}

        {loading && (
          <div className="rounded-lg animate-pulse" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="p-4" style={{ backgroundColor: '#1B2533' }}>
              <div className="skeleton h-4 w-32 rounded" />
            </div>
            <div className="p-5 space-y-4">
              <div className="skeleton h-12 rounded-lg" />
              <div className="skeleton h-20 rounded-lg" />
              <div className="skeleton h-12 rounded" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
