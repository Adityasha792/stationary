import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Search, Star } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';
import { productService } from '../services/productService';

const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest First' },
  { value: 'popularity',      label: 'Best Sellers' },
  { value: 'price_asc',       label: 'Price: Low to High' },
  { value: 'price_desc',      label: 'Price: High to Low' },
  { value: 'rating_desc',     label: 'Avg. Customer Review' },
];

const CATEGORIES = ['Electronics','Fashion','Home & Kitchen','Books','Sports','Beauty','Gaming','Furniture'];
const RATINGS    = [4, 3, 2, 1];
const PRICE_RANGES = [
  { label: 'Under ₹1,000',     min: 0,     max: 1000   },
  { label: '₹1,000 – ₹5,000',  min: 1000,  max: 5000   },
  { label: '₹5,000 – ₹20,000', min: 5000,  max: 20000  },
  { label: '₹20,000 – ₹50,000',min: 20000, max: 50000  },
  { label: 'Above ₹50,000',    min: 50000, max: 999999 },
];

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [pagination, setPagination]     = useState(null);
  const [filtersOpen, setFiltersOpen]   = useState(false);
  const loaderRef = useRef(null);

  const category  = searchParams.get('category')  || '';
  const search    = searchParams.get('search')    || '';
  const sort      = searchParams.get('sort')      || 'created_at_desc';
  const minPrice  = searchParams.get('minPrice')  || '';
  const maxPrice  = searchParams.get('maxPrice')  || '';
  const minRating = searchParams.get('minRating') || '';
  const featured  = searchParams.get('featured')  || '';

  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 16, sort };
      if (category)  params.category  = category;
      if (search)    params.search    = search;
      if (minPrice)  params.minPrice  = minPrice;
      if (maxPrice)  params.maxPrice  = maxPrice;
      if (minRating) params.minRating = minRating;
      if (featured)  params.featured  = featured;
      const res = await productService.getProducts(params);
      const { products: newP, pagination: pag } = res.data;
      setProducts(prev => append ? [...prev, ...newP] : newP);
      setPagination(pag);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [category, search, sort, minPrice, maxPrice, minRating, featured]);

  useEffect(() => { setPage(1); setProducts([]); fetchProducts(1, false); }, [fetchProducts]);

  useEffect(() => {
    if (!loaderRef.current || !pagination || page >= pagination.pages) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading) {
        const next = page + 1; setPage(next); fetchProducts(next, true);
      }
    }, { threshold: 0.1 });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef, pagination, page, loading, fetchProducts]);

  const setFilter = (key, value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value) params[key] = value; else delete params[key];
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});
  const hasFilters   = category || minPrice || maxPrice || minRating || featured;

  const pageTitle = featured ? "Today's Deals" : category || (search ? `Results for "${search}"` : 'All Products');

  return (
    <div style={{ backgroundColor: '#0F1111' }} className="min-h-screen">
      <div className="nexcart-container py-4">

        {/* Breadcrumb */}
        <nav className="amazon-breadcrumb mb-3">
          <a href="/">NexCart</a>
          <span>/</span>
          {category ? (
            <><span className="text-[#E7E9EA]">{category}</span></>
          ) : search ? (
            <><span className="text-[#E7E9EA]">Search: "{search}"</span></>
          ) : (
            <><span className="text-[#E7E9EA]">All Products</span></>
          )}
        </nav>

        <div className="flex gap-4">

          {/* ── Sidebar Filters — Desktop ─────────────────────────── */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-28 space-y-4">
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#007185] hover:text-[#FF9900] hover:underline transition-colors"
                >
                  ← Clear all filters
                </button>
              )}

              {/* Department */}
              <FilterSection title="Department">
                <ul className="space-y-1">
                  {CATEGORIES.map(cat => (
                    <li key={cat}>
                      <button
                        onClick={() => setFilter('category', category === cat ? '' : cat)}
                        className={`w-full text-left text-sm py-1 px-2 rounded transition-colors ${
                          category === cat
                            ? 'text-[#FF9900] font-semibold'
                            : 'text-[#E7E9EA] hover:text-[#FF9900]'
                        }`}
                      >
                        {category === cat && '▸ '}{cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </FilterSection>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

              {/* Price */}
              <FilterSection title="Price">
                <ul className="space-y-1">
                  {PRICE_RANGES.map(range => {
                    const active = minPrice === String(range.min) && maxPrice === String(range.max);
                    return (
                      <li key={range.label}>
                        <button
                          onClick={() => {
                            if (active) { setFilter('minPrice', ''); setFilter('maxPrice', ''); }
                            else {
                              const p = Object.fromEntries(searchParams.entries());
                              p.minPrice = range.min; p.maxPrice = range.max;
                              setSearchParams(p);
                            }
                          }}
                          className={`w-full text-left text-sm py-1 px-2 rounded transition-colors ${
                            active ? 'text-[#FF9900] font-semibold' : 'text-[#E7E9EA] hover:text-[#FF9900]'
                          }`}
                        >
                          {active && '▸ '}{range.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </FilterSection>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

              {/* Rating */}
              <FilterSection title="Avg. Customer Review">
                <ul className="space-y-1">
                  {RATINGS.map(r => (
                    <li key={r}>
                      <button
                        onClick={() => setFilter('minRating', minRating === String(r) ? '' : r)}
                        className={`w-full text-left flex items-center gap-2 py-1 px-2 rounded transition-colors ${
                          minRating === String(r) ? 'text-[#FF9900]' : 'text-[#E7E9EA] hover:text-[#FF9900]'
                        }`}
                      >
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < r ? 'fill-[#FF9900] text-[#FF9900]' : 'fill-[#374151] text-[#374151]'}`} />
                          ))}
                        </div>
                        <span className="text-xs">& Up</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </FilterSection>
            </div>
          </aside>

          {/* ── Main Content ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div
              className="flex items-center justify-between gap-4 mb-4 px-4 py-3 rounded-lg flex-wrap"
              style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div>
                <h1 className="font-display text-xl font-bold text-[#E7E9EA]">{pageTitle}</h1>
                {pagination && (
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {pagination.total.toLocaleString()} results
                    {(minPrice || maxPrice) && ` · ₹${minPrice}–₹${maxPrice}`}
                    {minRating && ` · ${minRating}★ & up`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter button */}
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#E7E9EA] border transition-colors"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasFilters && (
                    <span className="bg-[#FF9900] text-dark-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">On</span>
                  )}
                </button>

                {/* Sort */}
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <span className="hidden sm:block">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={e => setFilter('sort', e.target.value)}
                      className="appearance-none text-sm font-medium text-[#E7E9EA] pr-7 pl-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
                      style={{ backgroundColor: '#1B2533', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filter Pills */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {category && <FilterPill label={`Department: ${category}`} onRemove={() => setFilter('category', '')} />}
                {(minPrice || maxPrice) && <FilterPill label={`Price: ₹${minPrice}–₹${maxPrice}`} onRemove={() => { setFilter('minPrice',''); setFilter('maxPrice',''); }} />}
                {minRating && <FilterPill label={`${minRating}★ & Up`} onRemove={() => setFilter('minRating', '')} />}
                {featured  && <FilterPill label="Featured Only" onRemove={() => setFilter('featured', '')} />}
              </div>
            )}

            {/* Empty state */}
            {!loading && products.length === 0 && (
              <div
                className="flex flex-col items-center justify-center py-24 text-center rounded-lg"
                style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Search className="w-16 h-16 text-[#374151] mb-4" />
                <h3 className="text-xl font-bold text-[#E7E9EA] mb-2">No results found</h3>
                <p className="text-[#6B7280] text-sm mb-6">
                  {search
                    ? `No products match "${search}". Try different keywords.`
                    : 'No products match your current filters.'
                  }
                </p>
                <button onClick={clearFilters} className="btn-amazon-orange px-6 py-2.5 rounded-lg text-sm font-semibold">
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              {loading && Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={`sk-${i}`} />)}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={loaderRef} className="h-10 mt-4" />
            {pagination && page >= pagination.pages && products.length > 0 && (
              <p className="text-center text-[#6B7280] text-sm py-6">
                — End of results —
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 bg-black/70 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50 overflow-y-auto"
              style={{ backgroundColor: '#131921', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <h3 className="font-bold text-[#E7E9EA]">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-lg hover:bg-white/5">
                  <X className="w-5 h-5 text-[#E7E9EA]" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <FilterSection title="Department">
                  <ul className="space-y-1">
                    {CATEGORIES.map(cat => (
                      <li key={cat}>
                        <button
                          onClick={() => { setFilter('category', cat); setFiltersOpen(false); }}
                          className={`w-full text-left text-sm py-2 px-2 rounded transition-colors ${category === cat ? 'text-[#FF9900] font-semibold' : 'text-[#E7E9EA] hover:text-[#FF9900]'}`}
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </FilterSection>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

                <FilterSection title="Price Range">
                  <ul className="space-y-1">
                    {PRICE_RANGES.map(range => {
                      const active = minPrice === String(range.min) && maxPrice === String(range.max);
                      return (
                        <li key={range.label}>
                          <button
                            onClick={() => { const p = Object.fromEntries(searchParams.entries()); p.minPrice=range.min; p.maxPrice=range.max; setSearchParams(p); setFiltersOpen(false); }}
                            className={`w-full text-left text-sm py-2 px-2 rounded transition-colors ${active ? 'text-[#FF9900] font-semibold' : 'text-[#E7E9EA] hover:text-[#FF9900]'}`}
                          >
                            {range.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </FilterSection>

                {hasFilters && (
                  <button
                    onClick={() => { clearFilters(); setFiltersOpen(false); }}
                    className="w-full btn-outline text-sm py-2.5 rounded-lg"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-2 group">
        <span className="text-sm font-bold text-[#E7E9EA] group-hover:text-[#FF9900] transition-colors">{title}</span>
        <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#E7E9EA]"
      style={{ backgroundColor: 'rgba(255,153,0,0.15)', border: '1px solid rgba(255,153,0,0.25)' }}>
      {label}
      <button onClick={onRemove} className="text-[#A0AEC0] hover:text-red-400 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
