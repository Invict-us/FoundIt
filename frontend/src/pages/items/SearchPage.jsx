import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MapPin, Calendar, Package, X,
  SlidersHorizontal, ChevronDown, Loader2, Eye, Tag
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Input from '../../components/Input';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const CATEGORIES = [
  { value: '', label: 'All Categories', icon: '🔍' },
  { value: 'ID Cards', label: 'ID Cards', icon: '🪪' },
  { value: 'Electronics', label: 'Electronics', icon: '💻' },
  { value: 'Books', label: 'Books', icon: '📚' },
  { value: 'Stationery', label: 'Stationery', icon: '✏️' },
  { value: 'Wallets', label: 'Wallets', icon: '👛' },
  { value: 'Water Bottles', label: 'Water Bottles', icon: '💧' },
  { value: 'Keys', label: 'Keys', icon: '🔑' },
  { value: 'Others', label: 'Others', icon: '📦' }
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Verification Pending', label: 'Verification Pending' },
  { value: 'Claimed', label: 'Claimed' },
  { value: 'Archived', label: 'Archived' }
];

const statusVariantMap = {
  Active: 'info',
  'Verification Pending': 'warning',
  Claimed: 'success',
  Archived: 'neutral',
  Rejected: 'danger'
};

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 shadow-lg p-4 animate-pulse">
      <div className="w-full h-40 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4" />
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    building: searchParams.get('building') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);

  const fetchResults = useCallback(async (q, f) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (f.category) params.append('category', f.category);
      if (f.status) params.append('status', f.status);
      if (f.building) params.append('building', f.building);
      if (f.dateFrom) params.append('dateFrom', f.dateFrom);
      if (f.dateTo) params.append('dateTo', f.dateTo);

      const res = await api.get(`/items/search?${params.toString()}`);
      setResults(res.data?.items || res.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(query, filters);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, filters, fetchResults]);

  const handleFilterChange = (field) => (e) => {
    const value = e.target ? e.target.value : e;
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', status: '', building: '', dateFrom: '', dateTo: '' });
    setQuery('');
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '') || query !== '';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Search Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F] dark:text-white mb-6">
          Search Lost & Found Items
        </h1>

        {/* Search Bar */}
        <div className="relative z-20">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by item name, description, or location..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg shadow-md focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent outline-none transition placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition ${
              showFilters
                ? 'bg-[#14B8A6] text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Category Filters */}
        <div className="mt-6 flex flex-wrap gap-3">
          {CATEGORIES.slice(1).map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleFilterChange('category')(cat.value === filters.category ? '' : cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                filters.category === cat.value
                  ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-md shadow-[#1E3A5F]/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#14B8A6] hover:text-[#14B8A6] hover:shadow-sm'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card glass className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#14B8A6]" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#14B8A6] hover:text-teal-600 font-medium transition"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input
                  label="Category"
                  type="select"
                  value={filters.category}
                  onChange={handleFilterChange('category')}
                  options={CATEGORIES}
                />
                <Input
                  label="Status"
                  type="select"
                  value={filters.status}
                  onChange={handleFilterChange('status')}
                  options={STATUSES}
                />
                <Input
                  label="Building"
                  type="text"
                  placeholder="Any building"
                  value={filters.building}
                  onChange={handleFilterChange('building')}
                />
                <Input
                  label="Date From"
                  type="date"
                  value={filters.dateFrom}
                  onChange={handleFilterChange('dateFrom')}
                />
                <Input
                  label="Date To"
                  type="date"
                  value={filters.dateTo}
                  onChange={handleFilterChange('dateTo')}
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      {hasSearched && !loading && (
        <motion.div variants={itemVariants} className="mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Found <span className="font-semibold text-slate-900 dark:text-white">{results.length}</span> item{results.length !== 1 ? 's' : ''}
            {query && <> matching "<span className="text-[#14B8A6]">{query}</span>"</>}
          </p>
        </motion.div>
      )}

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : results.length === 0 && hasSearched ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-16"
        >
          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5">
            <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No items found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            We couldn't find any items matching your search. Try adjusting your filters or search terms.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {results.map((item) => (
            <motion.div
              key={item._id}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="cursor-pointer"
              onClick={() => navigate(`/items/${item._id}`)}
            >
              <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(20,184,166,0.12)] border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300 group flex flex-col h-full">
                {/* Image */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant={item.type === 'lost' ? 'danger' : 'success'}>
                      {item.type === 'lost' ? 'Lost' : 'Found'}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={statusVariantMap[item.status] || 'neutral'}>
                      {item.status || 'Active'}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">{item.name}</h3>
                  {item.category && (
                    <div className="flex items-center gap-1 mb-2">
                      <Tag className="w-3.5 h-3.5 text-[#14B8A6]" />
                      <span className="text-xs font-medium text-[#14B8A6]">{item.category}</span>
                    </div>
                  )}
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {item.description || 'No description provided'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.building || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.dateLost || item.dateFound || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* View Details Footer */}
                <div className="px-5 pb-5 mt-auto">
                  <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-sm font-semibold text-[#1E3A5F] dark:text-white group-hover:bg-[#1E3A5F] group-hover:text-white dark:group-hover:bg-[#14B8A6] transition-all duration-300">
                    <Eye className="w-4 h-4" />
                    View Details
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
