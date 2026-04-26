'use client';
// ============================================================
// ORDER CARD COMPONENT
// ============================================================
// A card shown in the orders history list.
// Shows order status, items, total, and a link to tracking page.
// ============================================================

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Clock } from 'lucide-react';
import { formatPrice, formatRelativeTime, getOrderNumber } from '@/lib/utils';
import { ORDER_STATUS_CONFIG } from '@/types';
import type { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  currencySymbol?: string;
}

export function OrderCard({ order, currencySymbol = '$' }: OrderCardProps) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const itemCount = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const previewItems = order.order_items?.slice(0, 2) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="transition-shadow hover:shadow-card-hover"
    >
      <Link href={`/orders/${order.id}`} className="block">
        <div className="bg-white rounded-2xl border border-border p-5">
          
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-base text-foreground">
                Order {getOrderNumber(order.id)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(order.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.icon} {statusConfig.label}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Items preview */}
          <div className="flex flex-wrap gap-1 mb-3">
            {previewItems.map(item => (
              <span key={item.id} className="text-xs bg-secondary text-foreground/70 px-2 py-1 rounded-lg">
                {item.quantity}x {item.item_name}
              </span>
            ))}
            {(order.order_items?.length || 0) > 2 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{(order.order_items?.length || 0) - 2} more
              </span>
            )}
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
            <span className="text-muted-foreground">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </span>
            <span className="font-bold text-foreground">
              {formatPrice(order.total, currencySymbol)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
