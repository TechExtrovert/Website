import { useEffect, useState, useMemo } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/types';
import { GOALS } from '../lib/types';
import { ProductCard } from '../components/ProductCard';

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const goal = params.get('goal');
    const q = params.get('q');
    if (goal) setActiveGoal(goal);
    if (q) setSearchQuery(q);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('products').select('*').order('sort_order');
      setProducts(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];
    if (activeGoal) result = result.filter((p) => p.goal === activeGoal);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return result;
  }, [products, activeGoal, searchQuery, sortBy]);

  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 py-16">
        <div className="container-x text-center">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-4">
            Shop Blends
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Find your perfect blend. Filter by your fitness goal and discover
            functional nutrition crafted just for you.
          </p>
        </div>
      </section>

      {/* Goal filter pills */}
      <section className="sticky top-16 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 py-4">
        <div className="container-x">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveGoal(null)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !activeGoal
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-dark-600 hover:bg-gray-200'
              }`}
            >
              All Blends
            </button>
            {GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setActiveGoal(goal.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeGoal === goal.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-dark-600 hover:bg-gray-200'
                }`}
              >
                {goal.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-primary-300 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>
            <span className="text-sm text-dark-200 hidden sm:block">
              {filtered.length} products
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-200" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 bg-white"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Mobile search */}
        <div className="relative mb-6 md:hidden">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-200" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-dark-200 text-lg">No products found. Try a different filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-dark-600/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl animate-slide-in-left p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-dark-600">Fitness Goal</h4>
              <div className="space-y-2">
                <button
                  onClick={() => { setActiveGoal(null); }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    !activeGoal ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                  }`}
                >
                  All Blends
                </button>
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setActiveGoal(goal.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeGoal === goal.id ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
