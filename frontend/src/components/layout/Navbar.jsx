import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Heart, Search, Menu, X, Sun, Moon, User,
  LogOut, Package, LayoutDashboard, ChevronDown, Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useDebounce } from '../../hooks/useDebounce';
import { productService } from '../../services/productService';
import { formatPrice } from '../../utils/formatters';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount, setSidebarOpen } = useCart();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery]     = useState('');
  const [suggestions, setSuggestions]     = useState([]);
  const [searchFocus, setSearchFocus]     = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const searchRef = useRef(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location]);

  // Live search suggestions
  useEffect(() => {
    if (debouncedSearch.length < 2) { setSuggestions([]); return; }
    productService.searchSuggestions(debouncedSearch)
      .then(res => setSuggestions(res.data.suggestions || []))
      .catch(() => setSuggestions([]));
  }, [debouncedSearch]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocus(false);
      if (!e.target.closest('.profile-dropdown')) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); setSuggestions([]); setSearchFocus(false);
    }
  };

  const navLinks = [
    { label: 'Home',       to: '/' },
    { label: 'Products',   to: '/products' },
    { label: 'Electronics',to: '/products?category=Electronics' },
    { label: 'Fashion',    to: '/products?category=Fashion' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400
          ${scrolled
            ? 'bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl shadow-glass border-b border-dark-100/50 dark:border-dark-700/50'
            : 'bg-white/70 dark:bg-dark-950/70 backdrop-blur-md'
          }`}
      >
        <div className="nexcart-container">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-xl font-bold gradient-text hidden sm:block">NexCart</span>
            </Link>

            {/* Nav Links — Desktop */}
            <div className="hidden lg:flex items-center gap-1 ml-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-auto relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products, brands..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-600 bg-dark-50 dark:bg-dark-800 text-sm text-dark-800 dark:text-dark-100 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white dark:focus:bg-dark-700 transition-all duration-200"
                />
              </form>

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {searchFocus && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 card shadow-glass overflow-hidden z-50"
                  >
                    {suggestions.map(s => (
                      <Link
                        key={s.id}
                        to={`/products/${s.id}`}
                        onClick={() => { setSearchFocus(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors duration-150"
                      >
                        <img src={s.image_url} alt={s.title} className="w-10 h-10 object-cover rounded-lg"
                          onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40'; }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-dark-800 dark:text-dark-100 truncate">{s.title}</p>
                          <p className="text-xs text-dark-400">{s.category} • {formatPrice(s.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2 rounded-xl text-dark-500 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 transition-all duration-200"
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              {/* Wishlist */}
              {user && (
                <Link to="/wishlist" className="p-2 rounded-xl text-dark-500 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 transition-all duration-200">
                  <Heart className="w-5 h-5" />
                </Link>
              )}

              {/* Cart */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => user ? setSidebarOpen(true) : navigate('/login')}
                className="relative p-2 rounded-xl text-dark-500 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 transition-all duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-[10px] font-bold shadow-glow-sm"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* User Menu */}
              {user ? (
                <div className="relative profile-dropdown">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user.avatar
                        ? <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                        : user.name?.[0]?.toUpperCase()}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-dark-400 hidden sm:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 card shadow-glass overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-dark-100 dark:border-dark-700">
                          <p className="text-sm font-semibold text-dark-800 dark:text-dark-100">{user.name}</p>
                          <p className="text-xs text-dark-400 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors">
                            <User className="w-4 h-4" /> My Profile
                          </Link>
                          <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors">
                            <Package className="w-4 h-4" /> My Orders
                          </Link>
                          {isAdmin && (
                            <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                              <LayoutDashboard className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="py-1 border-t border-dark-100 dark:border-dark-700">
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="btn-primary text-xs px-4 py-2 hidden sm:inline-flex">
                  Login
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-xl text-dark-500 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 transition-all lg:hidden"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-dark-100 dark:border-dark-700 bg-white dark:bg-dark-900 lg:hidden"
            >
              <div className="nexcart-container py-3 space-y-1">
                {navLinks.map(link => (
                  <Link key={link.to} to={link.to} className="block px-3 py-2 rounded-xl text-sm font-medium text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors">
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <Link to="/login" className="block px-3 py-2 rounded-xl text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
