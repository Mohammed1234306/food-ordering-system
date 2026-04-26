// ============================================================
// ORDERS HISTORY PAGE
// ============================================================
// Shows all past orders for the logged-in customer.
// Server component that fetches data from Supabase.
// ============================================================

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { OrderCard } from '@/components/orders/OrderCard';
import { ShoppingBag } from 'lucide-react';
import type { Order } from '@/types';

export default async function OrdersPage() {
  const supabase = createClient();
  
  // Get the currently logged-in user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Redirect to login if not authenticated
  // (middleware also handles this, but this is an extra safety check)
  if (!user) {
    redirect('/auth/login?redirectTo=/orders');
  }

  // Fetch all orders for this user with their items
  const { data: orders } = await supabase
    .from('orders')
    .select(`*, order_items(*)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Get currency symbol from settings
  const { data: settings } = await supabase
    .from('restaurant_settings')
    .select('currency_symbol')
    .eq('id', 1)
    .single();

  const currencySymbol = settings?.currency_symbol ?? '$';
  const orderList = (orders as Order[]) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 py-8 pb-16">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            {orderList.length > 0 
              ? `You have ${orderList.length} order${orderList.length !== 1 ? 's' : ''}` 
              : 'No orders yet'
            }
          </p>
        </div>

        {/* Orders list */}
        {orderList.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-primary-300" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              When you place an order, it will appear here. You can track your order status in real-time.
            </p>
            <Link href="/menu" className="btn-primary">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orderList.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                currencySymbol={currencySymbol}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
