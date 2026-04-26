// ============================================================
// ADMIN DASHBOARD - OVERVIEW PAGE
// ============================================================
// The main landing page for the admin panel.
// Shows key metrics: today's orders, revenue, pending orders.
// Server Component - fetches data fresh on each visit.
// ============================================================

import { createClient } from '@/lib/supabase/server';
import { formatPrice, formatRelativeTime, getOrderNumber } from '@/lib/utils';
import { ORDER_STATUS_CONFIG } from '@/types';
import Link from 'next/link';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  TrendingUp,
  ChevronRight,
  Users,
} from 'lucide-react';
import type { Order } from '@/types';

export default async function AdminDashboard() {
  const supabase = createClient();

  // Get today's date range (midnight to midnight)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Fetch all metrics in parallel for performance
  const [
    { data: todayOrders },
    { data: pendingOrders },
    { data: recentOrders },
    { count: totalCustomers },
    { data: settings },
  ] = await Promise.all([
    // Today's orders (for revenue and count)
    supabase
      .from('orders')
      .select('total, status')
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', todayEnd.toISOString()),

    // Active/pending orders (need attention)
    supabase
      .from('orders')
      .select('id, status, total, created_at, customer_name, order_items(item_name, quantity)')
      .in('status', ['pending', 'accepted', 'preparing', 'ready'])
      .order('created_at', { ascending: true }),

    // Recent 5 orders for the activity feed
    supabase
      .from('orders')
      .select('id, status, total, created_at, customer_name')
      .order('created_at', { ascending: false })
      .limit(5),

    // Total customer count
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer'),

    // Restaurant settings (for currency symbol)
    supabase
      .from('restaurant_settings')
      .select('currency_symbol, is_open, restaurant_name')
      .eq('id', 1)
      .single(),
  ]);

  const currencySymbol = settings?.currency_symbol ?? '$';

  // Calculate today's stats
  const todayRevenue = (todayOrders || [])
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total), 0);

  const todayOrderCount = (todayOrders || []).length;
  const pendingCount = (pendingOrders || []).filter(o => o.status === 'pending').length;

  // Stat cards config
  const stats = [
    {
      label: "Today's Orders",
      value: todayOrderCount.toString(),
      icon: ShoppingBag,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      description: 'Total orders today',
    },
    {
      label: "Today's Revenue",
      value: formatPrice(todayRevenue, currencySymbol),
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      description: 'Excluding cancelled',
    },
    {
      label: 'Pending',
      value: pendingCount.toString(),
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      description: 'Awaiting confirmation',
    },
    {
      label: 'Total Customers',
      value: (totalCustomers || 0).toString(),
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      description: 'Registered accounts',
    },
  ];

  return (
    <div className="p-6 md:p-8">

      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            Dashboard
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {settings?.restaurant_name || 'RESTAURANT_NAME_HERE'} — 
            <span className={settings?.is_open ? 'text-green-400' : 'text-red-400'}>
              {' '}{settings?.is_open ? '● Open' : '● Closed'}
            </span>
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          View Orders
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`p-5 rounded-2xl border ${stat.bg}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${stat.color} font-mono`}>
                {stat.value}
              </p>
              <p className="text-white/60 text-xs mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Active orders requiring attention */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Active Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Manage all →
            </Link>
          </div>

          {!pendingOrders || pendingOrders.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-sm">
              🎉 No active orders right now
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.slice(0, 5).map(order => {
                const statusConfig = ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];
                return (
                  <Link
                    key={order.id}
                    href="/admin/orders"
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <span className="text-lg">{statusConfig.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">
                        {getOrderNumber(order.id)} — {order.customer_name || 'Customer'}
                      </p>
                      <p className="text-white/40 text-xs">
                        {formatRelativeTime(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-semibold">
                        {formatPrice(order.total, currencySymbol)}
                      </p>
                      <p className={`text-xs ${statusConfig.color}`}>
                        {statusConfig.label}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent order activity feed */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Recent Activity
            </h2>
          </div>

          {!recentOrders || recentOrders.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-sm">
              No orders yet today
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => {
                const statusConfig = ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];
                return (
                  <div key={order.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className="text-base">{statusConfig.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm">
                        <span className="font-medium text-white">{getOrderNumber(order.id)}</span>
                        {' '}{order.customer_name ? `by ${order.customer_name}` : ''}
                      </p>
                      <p className="text-white/30 text-xs">{formatRelativeTime(order.created_at)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.color} bg-white/5`}>
                      {statusConfig.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
