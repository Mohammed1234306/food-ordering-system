'use client';
// ============================================================
// ORDER TRACKING PAGE
// ============================================================
// Shows the real-time status of a specific order.
// Uses Supabase real-time to automatically update when the
// admin changes the order status.
//
// ROUTE: /orders/[id]
// [id] is the order UUID
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Phone, ChevronLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { formatPrice, formatOrderDate, formatRelativeTime, getOrderNumber, getOrderProgress } from '@/lib/utils';
import { ORDER_STATUS_CONFIG, ORDER_STATUS_STEPS } from '@/types';
import type { Order } from '@/types';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const supabase = createClient();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<{ currency_symbol: string; restaurant_phone: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  // Fetch the initial order data
  useEffect(() => {
    async function fetchOrder() {
      const [orderRes, settingsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single(),
        supabase
          .from('restaurant_settings')
          .select('currency_symbol, restaurant_phone')
          .eq('id', 1)
          .single(),
      ]);

      if (orderRes.error || !orderRes.data) {
        setNotFoundError(true);
      } else {
        setOrder(orderRes.data as Order);
      }
      if (settingsRes.data) setSettings(settingsRes.data);
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  // Subscribe to real-time updates for this specific order
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,  // Only listen to THIS order
        },
        async (payload) => {
          // Re-fetch to get the complete order with items
          const { data } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', orderId)
            .single();
          
          if (data) setOrder(data as Order);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (notFoundError || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">This order doesn't exist or you don't have access to it.</p>
          <Link href="/orders" className="btn-primary">View My Orders</Link>
        </main>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const progress = getOrderProgress(order.status);
  const currencySymbol = settings?.currency_symbol ?? '$';
  const isCancelled = order.status === 'cancelled';

  // Get the current step index in the progress timeline
  const currentStepIndex = ORDER_STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-6 py-8 pb-16">
        
        {/* Back button */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to orders
        </Link>

        {/* Order header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Order {getOrderNumber(order.id)}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {formatOrderDate(order.created_at)}
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
              {statusConfig.icon} {statusConfig.label}
            </div>
          </div>
        </div>

        {/* Status description card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={order.status}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`p-4 rounded-2xl border mb-6 ${statusConfig.bgColor}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{statusConfig.icon}</span>
              <div>
                <p className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{statusConfig.description}</p>
                {order.estimated_minutes && order.status !== 'completed' && order.status !== 'cancelled' && (
                  <p className="text-sm font-medium mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Estimated: ~{order.estimated_minutes} min
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-border p-6 mb-5">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-5">
              Order Progress
            </h2>
            
            {/* Progress bar */}
            <div className="relative mb-6">
              <div className="h-2 bg-secondary rounded-full">
                <motion.div
                  className="h-full bg-primary-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="flex justify-between">
              {ORDER_STATUS_STEPS.map((step, index) => {
                const stepConfig = ORDER_STATUS_CONFIG[step];
                const isDone = currentStepIndex > index || order.status === 'completed';
                const isCurrent = currentStepIndex === index;

                return (
                  <div key={step} className="flex flex-col items-center gap-2 flex-1">
                    {/* Step circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isDone
                        ? 'bg-primary-500 border-primary-500'
                        : isCurrent
                        ? 'bg-primary-100 border-primary-500'
                        : 'bg-white border-gray-200'
                    }`}>
                      {isDone ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span className={`text-sm ${isCurrent ? 'text-primary-600' : 'text-gray-300'}`}>
                          {stepConfig.icon}
                        </span>
                      )}
                    </div>
                    
                    {/* Step label */}
                    <span className={`text-[10px] font-medium text-center leading-tight ${
                      isDone || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {stepConfig.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery details */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-5 space-y-3">
          <h2 className="font-semibold text-foreground">Delivery Details</h2>
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span>{order.delivery_address}</span>
          </div>
          {order.customer_phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{order.customer_phone}</span>
            </div>
          )}
          {order.notes && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Special instructions</p>
              <p className="text-sm italic mt-0.5">"{order.notes}"</p>
            </div>
          )}
        </div>

        {/* Order items */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-5">
          <h2 className="font-semibold text-foreground mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.order_items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x <span className="text-foreground font-medium">{item.item_name}</span>
                </span>
                <span className="font-medium">{formatPrice(item.line_total, currencySymbol)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal, currencySymbol)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Delivery fee</span>
              <span>{order.delivery_fee === 0 ? 'Free' : formatPrice(order.delivery_fee, currencySymbol)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary-600">{formatPrice(order.total, currencySymbol)}</span>
            </div>
          </div>
        </div>

        {/* Help/contact */}
        {settings?.restaurant_phone && (
          <p className="text-center text-sm text-muted-foreground">
            Questions about your order?{' '}
            <a href={`tel:${settings.restaurant_phone}`} className="text-primary-600 font-medium hover:underline">
              Call us
            </a>
          </p>
        )}
      </main>
    </div>
  );
}
