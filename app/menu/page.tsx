'use client';
// ============================================================
// MENU PAGE
// ============================================================
// The full interactive menu with:
// - Category filter tabs (sticky on scroll)
// - Search bar with debouncing
// - Tag/dietary filters
// - Responsive grid of MenuItemCards
// - Smooth animations on filter changes
// ============================================================

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import type { MenuItem, Category } from '@/types';

// All possible dietary/feature filter tags
// !! ADD YOUR OWN TAGS HERE !! if you have custom ones
const FILTER_TAGS = [
  { value: 'vegetarian', label: '🥗 Vegetarian' },
  { value: 'vegan',      label: '🌱 Vegan'      },
  { value: 'spicy',      label: '🌶️ Spicy'      },
  { value: 'popular',    label: '⭐ Popular'    },
  { value: 'new',        label: '✨ New'        },
  { value: 'healthy',    label: '💚 Healthy'    },
  { value: 'gluten-free',label: '🌾 Gluten-Free'},
];

function MenuPageContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<{ currency_symbol: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Controlled filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(
    // Pre-select category from URL query param (e.g., /menu?category=Burgers)
    searchParams.get('category') || 'All'
  );
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all data from Supabase on mount
  useEffect(() => {
    async function fetchData() {
      const [itemsRes, catsRes, settingsRes] = await Promise.all([
        supabase.from('menu_items').select('*, categories(*)').eq('is_available', true).order('sort_order'),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('restaurant_settings').select('currency_symbol').eq('id', 1).single(),
      ]);

      if (itemsRes.data) setItems(itemsRes.data as MenuItem[]);
      if (catsRes.data)  setCategories(catsRes.data as Category[]);
      if (settingsRes.data) setSettings(settingsRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Toggle a tag filter on/off
  const toggleTag = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Filtered items - recalculates whenever filters change
  const filteredItems = useMemo(() => {
    let result = items;

    // Filter by category
    if (activeCategory !== 'All') {
      result = result.filter(item => (item as any).categories?.name === activeCategory);
    }

    // Filter by search query (searches name + description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false)
      );
    }

    // Filter by active tags (item must have ALL selected tags)
    if (activeTags.length > 0) {
      result = result.filter(item =>
        activeTags.every(tag => item.tags?.includes(tag))
      );
    }

    return result;
  }, [items, activeCategory, searchQuery, activeTags]);

  // Group filtered items by category for section headers
  const groupedItems = useMemo(() => {
    if (activeCategory !== 'All') {
      return { [activeCategory]: filteredItems };
    }
    const groups: Record<string, MenuItem[]> = {};
    filteredItems.forEach(item => {
      const catName = (item as any).categories?.name || 'Other';
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(item);
    });
    return groups;
  }, [filteredItems, activeCategory]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveTags([]);
  };

  const hasActiveFilters = searchQuery || activeCategory !== 'All' || activeTags.length > 0;
  const currencySymbol = settings?.currency_symbol ?? '$';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 pb-16">
        
        {/* Page title */}
        <div className="py-8 md:py-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Our Menu
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${items.length} items available`}
          </p>
        </div>

        {/* ---- SEARCH + FILTER BAR ---- */}
        <div className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur-sm pb-4 -mx-4 px-4">
          
          {/* Search input */}
          <div className="flex gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            
            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                showFilters || activeTags.length > 0
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-white border-border text-foreground hover:bg-secondary'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeTags.length > 0 && (
                <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeTags.length}
                </span>
              )}
            </button>
          </div>

          {/* Tag filters (expandable) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="flex flex-wrap gap-2 py-2">
                  {FILTER_TAGS.map(tag => (
                    <button
                      key={tag.value}
                      onClick={() => toggleTag(tag.value)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        activeTags.includes(tag.value)
                          ? 'bg-primary-500 text-white shadow-warm'
                          : 'bg-white border border-border text-foreground hover:border-primary-300'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {/* "All" tab */}
            <button
              onClick={() => setActiveCategory('All')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeCategory === 'All'
                  ? 'bg-primary-500 text-white shadow-warm'
                  : 'bg-white border border-border text-foreground hover:border-primary-300'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === cat.name
                    ? 'bg-primary-500 text-white shadow-warm'
                    : 'bg-white border border-border text-foreground hover:border-primary-300'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Active filters summary */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-muted-foreground">
                {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
              </span>
              <button onClick={clearAllFilters} className="text-primary-600 font-medium hover:text-primary-700">
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* ---- MENU ITEMS ---- */}
        {loading ? (
          // Skeleton loading grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-[4/3] skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-full" />
                  <div className="h-3 skeleton rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          // No results state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-bold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
            <button onClick={clearAllFilters} className="btn-primary px-6 py-2.5 text-sm">
              Clear Filters
            </button>
          </div>
        ) : (
          // Items grouped by category (or flat when filtered)
          <div className="mt-4 space-y-12">
            {Object.entries(groupedItems).map(([categoryName, categoryItems]) => (
              <section key={categoryName}>
                {/* Category section header */}
                {activeCategory === 'All' && (
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                      {categories.find(c => c.name === categoryName)?.icon} {categoryName}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      ({categoryItems.length} items)
                    </span>
                  </div>
                )}

                {/* Items grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  <AnimatePresence>
                    {categoryItems.map((item, i) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                      >
                        <MenuItemCard item={item} currencySymbol={currencySymbol} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Wrap in Suspense because useSearchParams() requires it in Next.js App Router
export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading menu...</div>}>
      <MenuPageContent />
    </Suspense>
  );
}
