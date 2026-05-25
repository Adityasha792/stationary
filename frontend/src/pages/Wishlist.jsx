import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const { user } = useAuth();

  if (!user) return (
    <div className="nexcart-container py-24 text-center">
      <Heart className="w-16 h-16 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
      <h2 className="font-display text-2xl font-bold text-dark-800 dark:text-white mb-2">Sign in to see your wishlist</h2>
      <Link to="/login" className="btn-primary mt-4">Sign In</Link>
    </div>
  );

  return (
    <div className="nexcart-container py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-dark-900 dark:text-white flex items-center gap-3">
          <Heart className="w-7 h-7 text-red-500 fill-red-500" /> Wishlist
          <span className="text-dark-400 text-lg font-normal">({wishlist.length})</span>
        </h1>
        <Link to="/products" className="btn-ghost text-sm gap-2">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="card p-20 text-center">
          <Heart className="w-16 h-16 text-dark-300 dark:text-dark-600 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-dark-700 dark:text-dark-300">Your wishlist is empty</h3>
          <p className="text-dark-400 mt-2 mb-8">Save products you love to buy later</p>
          <Link to="/products" className="btn-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
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
    </div>
  );
}
