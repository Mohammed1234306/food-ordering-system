'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Category } from '@/types';

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
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 md:grid md:grid-cols-5 lg:grid-cols-9">
          {categories.map((category, i) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex-shrink-0">
              <Link
                href={`/menu?category=${encodeURIComponent(category.name)}`}
                className="group flex flex-col items-center gap-2 p-4 w-24 md:w-auto bg-white hover:bg-primary-50 border border-border hover:border-primary-200 rounded-2xl transition-all duration-200 hover:shadow-card"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{category.icon}</span>
                <span className="text-xs font-semibold text-foreground/80 text-center leading-tight">{category.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
