'use client';
// ============================================================
// ADMIN ORDERS PAGE
// ============================================================
// Real-time order management dashboard.
//
// Features:
// - Live orders feed using Supabase real-time subscriptions
// - Audio bell alert when new order arrives
// - Visual flash animation on new order
// - Filter by order status
// - Accept / Prepare / Ready / Complete / Cancel controls
// - Order details expansion
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellOff, RefreshCw, Filter, Phone,
  MapPin, CheckCircle, ChefHat, Package, XCircle, Clock,
  ChevronDown, ChevronUp, MessageSquare,
} from 'lucide-react';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, formatRelativeTime, formatTime, getOrderNumber } from '@/lib/utils';
import { ORDER_STATUS_CONFIG } from '@/types';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

// Status filter tabs shown at the top of the page
const STATUS_FILTERS = [
  { value: 'all',        label: 'All Orders' },
  { value: 'pending',    label: 'Pending'    },
  { value: 'accepted',   label: 'Accepted'   },
  { value: 'preparing',  label: 'Preparing'  },
  { value: 'ready',      label: 'Ready'      },
  { value: 'completed',  label: 'Completed'  },
  { value: 'cancelled',  label: 'Cancelled'  },
];

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Load alert settings from Supabase settings
  const [alertSound, setAlertSound] = useState('bell1');
  const [alertVolume, setAlertVolume] = useState(0.8);

  useEffect(() => {
    supabase
      .from('restaurant_settings')
      .select('alert_sound, alert_volume')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setAlertSound(data.alert_sound);
          setAlertVolume(Number(data.alert_volume));
        }
      });
  }, []);

  // The real-time orders hook that powers this page
  const {
    orders,
    loading,
    newOrderAlert,
    refetch,
    updateOrderStatus,
  } = useRealtimeOrders({
    audioEnabled,
    alertSound,
    alertVolume,
    statusFilter,
  });

  // Handle status update action buttons
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus, estimatedMinutes?: number) => {
    const { error } = await updateOrderStatus(orderId, newStatus, 
      estimatedMinutes ? { estimated_minutes: estimatedMinutes } : undefined
    );
    
    if (error) {
      toast.error(`Failed to update order: ${error}`);
    } else {
      toast.success(`Order marked as ${newStatus}`);
    }
  };

  return (
    <div className="p-6 md:p-8">
      
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            Orders
            {/* New order flash indicator */}
            <AnimatePresence>
              {newOrderAlert && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse"
                >
                  🔔 NEW ORDER!
                </motion.span>
              )}
            </AnimatePresence>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {loading ? 'Loading...' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? 'Mute alerts' : 'Unmute alerts'}
            className={cn(
              'p-2.5 rounded-xl border transition-colors text-sm font-medium',
              audioEnabled
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : 'bg-white/5 border-white/10 text-white/40'
            )}
          >
            {audioEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          
          {/* Refresh */}
          <button
            onClick={refetch}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
            title="Refresh orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
        {STATUS_FILTERS.map(filter => {
          const count = filter.value === 'all'
            ? orders.length
            : orders.filter(o => o.status === filter.value).length;
          
          return (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                statusFilter === filter.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              {filter.label}
              {count > 0 && (
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-xs font-bold',
                  statusFilter === filter.value ? 'bg-white/20' : 'bg-white/10'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No orders found</p>
          <p className="text-sm mt-1">
            {statusFilter !== 'all' ? `No ${statusFilter} orders` : 'No orders yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {orders.map(order => (
              <AdminOrderCard
                key={order.id}
                order={order}
                isExpanded={expandedOrderId === order.id}
                onToggleExpand={() => setExpandedOrderId(
                  expandedOrderId === order.id ? null : order.id
                )}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMIN ORDER CARD
// Individual order card with status controls
// ============================================================
interface AdminOrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusUpdate: (orderId: string, status: OrderStatus, estimatedMinutes?: number) => void;
}

function AdminOrderCard({
  order,
  isExpanded,
  onToggleExpand,
  onStatusUpdate,
}: AdminOrderCardProps) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const [isUpdating, setIsUpdating] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  const handleUpdate = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    await onStatusUpdate(
      order.id, 
      newStatus,
      newStatus === 'accepted' ? estimatedMinutes : undefined
    );
    setIsUpdating(false);
  };

  const itemCount = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  // Determine what action buttons to show based on current status
  const getActionButtons = () => {
    switch (order.status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-white/50 text-xs">ETA (min):</label>
              <select
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(Number(e.target.value))}
                className="bg-white/10 border border-white/20 text-white text-xs rounded-lg px-2 py-1"
              >
                {[15, 20, 25, 30, 40, 45, 60].map(m => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
            </div>
            <button onClick={() => handleUpdate('accepted')} disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60">
              <CheckCircle className="w-3.5 h-3.5" /> Accept Order
            </button>
            <button onClick={() => handleUpdate('cancelled')} disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60">
              <XCircle className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        );
      case 'accepted':
        return (
          <button onClick={() => handleUpdate('preparing')} disabled={isUpdating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60">
            <ChefHat className="w-3.5 h-3.5" /> Start Preparing
          </button>
        );
      case 'preparing':
        return (
          <button onClick={() => handleUpdate('ready')} disabled={isUpdating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60">
            <Package className="w-3.5 h-3.5" /> Mark Ready
          </button>
        );
      case 'ready':
        return (
          <button onClick={() => handleUpdate('completed')} disabled={isUpdating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60">
            <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'bg-white/5 border rounded-2xl overflow-hidden transition-colors',
        order.status === 'pending' ? 'border-amber-500/30' : 'border-white/10'
      )}
    >
      {/* Card header - always visible */}
      <div className="p-4 flex items-start gap-4">
        
        {/* Status icon */}
        <div className={cn('p-2.5 rounded-xl flex-shrink-0', statusConfig.bgColor)}>
          <span className="text-lg">{statusConfig.icon}</span>
        </div>

        {/* Order info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-white">{getOrderNumber(order.id)}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusConfig.color, 'bg-white/5')}>
              {statusConfig.label}
            </span>
            {order.status === 'pending' && (
              <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-medium animate-pulse">
                ⚡ New!
              </span>
            )}
          </div>
          
          {/* Customer info */}
          <p className="text-white/70 text-sm">
            {order.customer_name || 'Unknown'} 
            {order.customer_phone && (
              <a href={`tel:${order.customer_phone}`} className="ml-2 text-primary-400 hover:text-primary-300">
                <Phone className="w-3.5 h-3.5 inline mr-0.5" />
                {order.customer_phone}
              </a>
            )}
          </p>
          
          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(order.created_at)}
            </span>
            <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            <span className="text-white font-semibold">
              ${Number(order.total).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={onToggleExpand}
          className="p-1.5 text-white/40 hover:text-white transition-colors flex-shrink-0"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Action buttons - always visible */}
      <div className="px-4 pb-3">
        {getActionButtons()}
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              
              {/* Delivery address */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">{order.delivery_address}</span>
              </div>

              {/* Order items list */}
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Items</p>
                <div className="space-y-1.5">
                  {order.order_items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-white/70">
                        <span className="text-white font-medium">{item.quantity}×</span> {item.item_name}
                        {item.special_instructions && (
                          <span className="text-amber-400 text-xs ml-1 italic">
                            ({item.special_instructions})
                          </span>
                        )}
                      </span>
                      <span className="text-white/60 font-mono">
                        ${Number(item.line_total).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer notes */}
              {order.notes && (
                <div className="flex items-start gap-2 text-sm bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                  <MessageSquare className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-amber-300 italic">{order.notes}</span>
                </div>
              )}

              {/* Estimated time (if set) */}
              {order.estimated_minutes && (
                <p className="text-white/50 text-xs">
                  Estimated delivery: ~{order.estimated_minutes} minutes
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
