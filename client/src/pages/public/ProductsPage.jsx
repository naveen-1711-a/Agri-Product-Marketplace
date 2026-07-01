import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import api from '../../services/api';
import ProductCard from '../../components/common/ProductCard';
import Spinner from '../../components/common/Spinner';

const CATEGORIES = ['Organic Vegetables','Fruits','Homemade Foods','Traditional Snacks','Pickles','Honey','Millets','Handicrafts','Village Special Products','Seeds','Medicine','Fertilizer'];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    sort: '-createdAt',
  });

  const fetchProducts = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 12, ...filters });
      Object.keys(filters).forEach(k => { if (!filters[k]) params.delete(k); });
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(1); setPage(1); }, [filters]);

  useEffect(() => {
    setFilters(f => ({
      ...f,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || ''
    }));
  }, [searchParams]);

  const handleFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const clearFilters = () => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', rating: '', sort: '-createdAt' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Products</h1>
          <p className="text-gray-500 text-sm">{total} products found</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 lg:hidden">
          <FiFilter /> Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
          <div className="card p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                <FiX size={12} /> Clear all
              </button>
            </div>

            {/* Search */}
            <div className="mb-5">
              <label className="label">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input className="input pl-9" placeholder="Search products..." value={filters.search}
                  onChange={e => handleFilter('search', e.target.value)} />
              </div>
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="label">Category</label>
              <select className="input" value={filters.category} onChange={e => handleFilter('category', e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-5">
              <label className="label">Price Range (₹)</label>
              <div className="flex gap-2">
                <input className="input" type="number" placeholder="Min" value={filters.minPrice}
                  onChange={e => handleFilter('minPrice', e.target.value)} />
                <input className="input" type="number" placeholder="Max" value={filters.maxPrice}
                  onChange={e => handleFilter('maxPrice', e.target.value)} />
              </div>
            </div>

            {/* Rating */}
            <div className="mb-5">
              <label className="label">Min Rating</label>
              <select className="input" value={filters.rating} onChange={e => handleFilter('rating', e.target.value)}>
                <option value="">Any Rating</option>
                {[4, 3, 2, 1].map(r => <option key={r} value={r}>{r}+ Stars</option>)}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="label">Sort By</label>
              <select className="input" value={filters.sort} onChange={e => handleFilter('sort', e.target.value)}>
                <option value="-createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <Spinner size="lg" text="Loading products..." />
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try adjusting your filters</p>
              <button onClick={clearFilters} className="btn-primary mt-4 text-sm">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => { setPage(p); fetchProducts(p); }}
                      className={`w-9 h-9 rounded-lg font-medium text-sm transition-colors ${page === p ? 'bg-primary-700 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
