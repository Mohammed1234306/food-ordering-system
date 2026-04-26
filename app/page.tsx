// ============================================================
// HOME PAGE
// ============================================================
// The main landing page of the customer app.
//
// Sections:
// 1. Hero - Full-width banner with CTA buttons
// 2. Features strip - delivery time, free delivery badge, etc.
// 3. Featured items - Highlighted menu items
// 4. Categories - Quick links to menu categories
//
// This is a Server Component (no 'use client').
// It fetches settings and featured items from Supabase on the server.
// ============================================================

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedItems } from '@/components/home/FeaturedItems';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { StatsBar } from '@/components/home/StatsBar';
import type { MenuItem, Category, RestaurantSettings } from '@/types';

export default async function HomePage() {
  const supabase = createClient();

  // Fetch restaurant settings (for delivery time, open status, etc.)
  const { data: settings } = await supabase
    .from('restaurant_settings')
    .select('*')
    .eq('id', 1)
    .single();

  // Fetch featured menu items for the homepage showcase
  const { data: featuredItems } = await supabase
    .from('menu_items')
    .select('*, categories(*)')
    .eq('is_featured', true)
    .eq('is_available', true)
    .order('sort_order')
    .limit(8);

  // Fetch all active categories for the category grid
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      
      <main className="flex-1">
        {/* Hero section */}
        <HeroSection
          isOpen={settings?.is_open ?? true}
          deliveryTimeMin={settings?.delivery_time_min ?? 25}
          deliveryTimeMax={settings?.delivery_time_max ?? 45}
          restaurantName={settings?.restaurant_name}
          tagline={settings?.tagline}
        />

        {/* Stats bar */}
        <StatsBar
          deliveryTimeMin={settings?.delivery_time_min ?? 25}
          deliveryTimeMax={settings?.delivery_time_max ?? 45}
        />

        {/* Category quick navigation */}
        {categories && categories.length > 0 && (
          <CategoryGrid categories={categories as Category[]} />
        )}

        {/* Featured items */}
        {featuredItems && featuredItems.length > 0 && (
          <FeaturedItems
            items={featuredItems as MenuItem[]}
            currencySymbol={settings?.currency_symbol ?? '$'}
          />
        )}

        {/* CTA to menu */}
        <section className="py-16 px-4 text-center bg-warm-gradient">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hungry for more?
            </h2>
            <p className="text-muted-foreground mb-8">
              Browse our full menu to find your next favourite dish.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl transition-all hover:shadow-warm-lg text-lg"
            >
              View Full Menu →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
