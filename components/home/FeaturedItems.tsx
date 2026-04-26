'use client';
// ============================================================
// HOME PAGE SUPPORTING COMPONENTS
// StatsBar, FeaturedItems, CategoryGrid
// ============================================================

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, Truck, Star, ShieldCheck } from 'lucide-react';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import type { MenuItem, Category } from '@/types';

// ============================================================
// STATS BAR
// !! CHANGE THE STATS below to match your actual numbers !!
// ============================================================
interface StatsBarProps {
  deliveryTimeMin: number;
  deliveryTimeMax: number;
}

export function StatsBar({ deliveryTimeMin, deliveryTimeMax }: StatsBarProps) {
  const stats = [
    {
      icon: <Clock className="w-5 h-5" />,
      value: `${deliveryTimeMin}-${deliveryTimeMax} min`,
      label: 'Delivery Time',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: <Truck className="w-5 h-5" />,
      value: 'Free Delivery',           // !! CHANGE !! if you charge
      label: 'On orders over $30',      // !! CHANGE !! threshold
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: <Star className="w-5 h-5" />,
      value: '4.9 ★',                  // !! CHANGE !! your rating
      label: 'Customer Rating',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      value: '100%',
      label: 'Fresh Ingredients',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <section className="py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-border shadow-card"
            >
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className={`font-bold text-base ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ============================================================
// CATEGORY GRID
// ============================================================
interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Browse by Category
            </h2>
            <p className="text-muted-foreground text-sm mt-1">What are you craving?</p>
          </div>
          <Link href="/menu" className="text-primary-600 font-semibold text-sm hover:text-primary-700">
            View all →
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9">
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0"
            >
              <Link
                href={`/menu?category=${encodeURIComponent(category.name)}`}
                className="group flex flex-col items-center gap-2 p-4 w-24 md:w-auto bg-white hover:bg-primary-50 border border-border hover:border-primary-200 rounded-2xl transition-all duration-200 hover:shadow-card"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                  {category.icon}
                </span>
                <span className="text-xs font-semibold text-foreground/80 text-center leading-tight">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ============================================================
// FEATURED ITEMS SECTION
// ============================================================
interface FeaturedItemsProps {
  items: MenuItem[];
  currencySymbol?: string;
}

export function FeaturedItems({ items, currencySymbol = '$' }: FeaturedItemsProps) {
  return (
    <section className="py-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              ⭐ Customer Favourites
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Our most-loved dishes</p>
          </div>
          <Link href="/menu" className="text-primary-600 font-semibold text-sm hover:text-primary-700">
            Full menu →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <MenuItemCard item={item} currencySymbol={currencySymbol} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
