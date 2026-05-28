import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const { user } = useAuth();

  if (!user) return (
    <div style={{ backgroundColor: '#0F1111' }} className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4 py-16">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#131921', border: '2px solid rgba(255,255,255,0.1)' }}>
          <Heart className="w-10 h-10 text-[#374151]" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#E7E9EA] mb-2">Sign in to view your wishlist</h2>
        <p className="text-[#6B7280] mb-8">Save products you love to buy later.</p>
        <Link to="/login" className="btn-amazon-orange text-sm px-8 py-3 rounded-lg inline-flex items-center gap-2 font-bold">
          Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#0F1111' }} className="min-h-screen page-enter">
      <div className="nexcart-container py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#E7E9EA] flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-400 fill-red-400" />
              Your Wishlist
              <span className="text-[#6B7280] text-base font-normal">({wishlist.length})</span>
            </h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Saved items for later purchase</p>
          </div>
          <Link to="/products" className="btn-amazon-secondary text-sm px-4 py-2 rounded-lg flex items-center gap-2">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-lg py-20 text-center" style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <Heart className="w-16 h-16 text-[#374151] mx-auto mb-4" />
            </motion.div>
            <h3 className="font-display text-xl font-semibold text-[#E7E9EA] mb-2">Your wishlist is empty</h3>
            <p className="text-[#6B7280] mb-8">Tap the ♥ on any product to save it here.</p>
            <Link to="/products" className="btn-amazon-orange text-sm px-8 py-3 rounded-lg inline-flex items-center gap-2 font-bold">
              Explore Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {wishlist.map((item, i) => (
              <ProductCard
                key={item.product_id}
                product={{
                  id: item.product_id, title: item.title, price: item.price,
                  original_price: item.original_price, image_url: item.image_url,
                  rating: item.rating, review_count: item.review_count,
                  category: item.category, brand: item.brand, stock: item.stock,
                }}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
