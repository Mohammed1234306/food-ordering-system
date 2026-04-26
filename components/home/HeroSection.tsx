'use client';
// ============================================================
// HERO SECTION COMPONENT
// ============================================================
// The large banner at the top of the home page.
// Features animated text, CTA buttons, and a food illustration.
// ============================================================

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, ChevronRight, AlertCircle } from 'lucide-react';

interface HeroSectionProps {
  isOpen: boolean;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  restaurantName?: string;
  tagline?: string;
}

export function HeroSection({
  isOpen,
  deliveryTimeMin,
  deliveryTimeMax,
  restaurantName = 'RESTAURANT_NAME_HERE',
  tagline = 'Delicious food, delivered fast',
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-warm-gradient">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-dots opacity-60 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-60" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary-50 rounded-full blur-3xl opacity-80" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left content */}
          <div>
            {/* Closed banner */}
            {!isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-full text-sm font-medium mb-6"
              >
                <AlertCircle className="w-4 h-4" />
                We're currently closed. Check back soon!
              </motion.div>
            )}

            {/* Eyebrow label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-5"
            >
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
              {isOpen ? 'Now Open & Delivering' : 'Currently Closed'}
              <Clock className="w-3.5 h-3.5" />
              {deliveryTimeMin}-{deliveryTimeMax} min
            </motion.div>

            {/* Main headline */}
            {/* !! CHANGE THE TEXT BELOW !! */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-5 text-balance"
            >
              {/* !! CHANGE THIS HEADLINE !! */}
              Great Food,
              <br />
              <span className="text-gradient">Right to Your Door</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-lg text-muted-foreground mb-8 max-w-md leading-relaxed"
            >
              {tagline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/menu"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl transition-all hover:shadow-warm-lg text-base"
              >
                Order Now
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-gray-50 text-foreground font-bold rounded-2xl border border-border transition-all hover:shadow-card text-base"
              >
                Browse Menu
              </Link>
            </motion.div>
          </div>

          {/* Right: Hero image / illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative hidden lg:block"
          >
            {/* Main hero image */}
            {/* !! CHANGE THIS IMAGE URL to your food photo !! */}
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-50 rounded-[3rem] rotate-3" />
              <div className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-warm-lg">
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800"
                  alt="Delicious food"
                  className="w-full h-full object-cover aspect-square"
                />
              </div>
              
              {/* Floating info card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-card-hover p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-xl">
                  🍔
                </div>
                <div>
                  <p className="font-bold text-sm">Classic Smash Burger</p>
                  <p className="text-xs text-primary-600 font-semibold">$14.99</p>
                </div>
              </motion.div>
              
              {/* Floating info card 2 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-card-hover p-3 text-center"
              >
                <p className="text-2xl font-display font-black text-primary-600">4.9</p>
                <p className="text-xs text-muted-foreground">⭐ Rating</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
