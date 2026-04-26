'use client';
import { motion } from 'framer-motion';
import { Clock, Truck, Star, ShieldCheck } from 'lucide-react';

interface StatsBarProps {
  deliveryTimeMin: number;
  deliveryTimeMax: number;
}

export function StatsBar({ deliveryTimeMin, deliveryTimeMax }: StatsBarProps) {
  const stats = [
    { icon: <Clock className="w-5 h-5" />, value: `${deliveryTimeMin}-${deliveryTimeMax} min`, label: 'Delivery Time', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: <Truck className="w-5 h-5" />, value: 'Free Delivery', label: 'On orders over $30', color: 'text-green-600', bg: 'bg-green-50' }, // !! CHANGE !!
    { icon: <Star className="w-5 h-5" />, value: '4.9 ★', label: 'Customer Rating', color: 'text-amber-600', bg: 'bg-amber-50' }, // !! CHANGE !!
    { icon: <ShieldCheck className="w-5 h-5" />, value: '100%', label: 'Fresh Ingredients', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];
  return (
    <section className="py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-border shadow-card">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>{stat.icon}</div>
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
