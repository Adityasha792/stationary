import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatPrice, discountPercent } from '../../utils/formatters';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const wishlisted = isWishlisted(product.id);
  const discount   = discountPercent(product.original_price, product.price);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    addToCart(product.id);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    toggleWishlist(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative"
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="card-hover overflow-hidden">
          {/* Image Container */}
          <div className="relative overflow-hidden bg-dark-100 dark:bg-dark-700 aspect-square">
            {/* Discount Badge */}
            {discount > 0 && (
              <div className="discount-badge">{discount}% OFF</div>
            )}

            {/* Featured Badge */}
            {product.is_featured && (
              <div className="absolute top-2 right-2 z-10">
                <span className="badge badge-primary text-[10px]">⭐ Featured</span>
              </div>
            )}

            {/* Product Image with zoom */}
            <motion.img
              src={product.image_url}
              alt={product.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'; }}
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center gap-2">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlist}
                className={`opacity-0 group-hover:opacity-100 transition-all duration-200 delay-75 p-2.5 rounded-full shadow-lg
                  ${wishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-200 hover:bg-red-50 hover:text-red-500'
                  }`}
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 delay-100 p-2.5 rounded-full bg-primary-600 text-white shadow-glow-sm hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
              </motion.button>

              <Link
                to={`/products/${product.id}`}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 delay-150 p-2.5 rounded-full bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-200 shadow-lg hover:bg-dark-50"
                onClick={e => e.stopPropagation()}
              >
                <Eye className="w-4 h-4" />
              </Link>
            </div>

            {/* Out of stock overlay */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-sm font-semibold px-3 py-1.5 bg-black/60 rounded-full">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            {/* Brand */}
            {product.brand && (
              <p className="text-xs text-dark-400 dark:text-dark-500 uppercase tracking-wider mb-1">{product.brand}</p>
            )}

            {/* Title */}
            <h3 className="font-semibold text-dark-800 dark:text-dark-100 text-sm leading-tight line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
              {product.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-dark-300 dark:text-dark-600'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-dark-400">({product.review_count?.toLocaleString()})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 mt-2">
              <span className="font-display text-lg font-bold text-dark-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-dark-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>

            {/* Add to Cart Button — visible on mobile */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full mt-3 py-2 rounded-xl text-xs font-semibold
                bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300
                border border-primary-200 dark:border-primary-700/50
                hover:bg-primary-500 hover:text-white hover:border-primary-500 hover:shadow-glow-sm
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 flex items-center justify-center gap-1.5
                sm:hidden"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
