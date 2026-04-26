'use client';
// ============================================================
// CHECKOUT PAGE
// ============================================================
// The checkout form where customers:
// 1. Review their cart items
// 2. Enter delivery details (name, phone, address)
// 3. Select delivery location on a map
// 4. Choose payment method (Cash on Delivery)
// 5. Place the order
//
// Note: Map component (Leaflet) is dynamically imported to
// prevent SSR errors (Leaflet requires browser APIs)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, FileText, Wallet, ChevronRight, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { useCartStore } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, isValidPhone } from '@/lib/utils';

// Dynamically import the map picker to prevent SSR issues
// Leaflet uses window/document which don't exist on the server
const LocationPicker = dynamic(
  () => import('@/components/checkout/LocationPicker').then(m => m.LocationPicker),
  { 
    ssr: false,  // Disable server-side rendering for this component
    loading: () => (
      <div className="h-64 bg-secondary rounded-2xl flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground text-sm">Loading map...</span>
      </div>
    ),
  }
);

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, profile } = useAuth();
  const { items, getSubtotal, clearCart } = useCartStore();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  
  // Loading and error states
  const [isPlacing, setIsPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Restaurant settings (for delivery fee, min order amount)
  const [settings, setSettings] = useState<{
    delivery_fee: number;
    min_order_amount: number;
    currency_symbol: string;
    is_open: boolean;
  } | null>(null);

  // Pre-fill form with user's profile data
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.default_address || '');
      if (profile.default_lat && profile.default_lng) {
        setLocation({
          lat: profile.default_lat,
          lng: profile.default_lng,
          address: profile.default_address || '',
        });
      }
    }
  }, [profile]);

  // Fetch restaurant settings
  useEffect(() => {
    supabase
      .from('restaurant_settings')
      .select('delivery_fee, min_order_amount, currency_symbol, is_open')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data);
      });
  }, []);

  const subtotal = getSubtotal();
  const deliveryFee = settings?.delivery_fee ?? 2.99;
  const total = subtotal + deliveryFee;
  const currencySymbol = settings?.currency_symbol ?? '$';

  // Validate form fields
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!isValidPhone(phone)) newErrors.phone = 'Please enter a valid phone number';
    if (!address.trim()) newErrors.address = 'Delivery address is required';
    if (!location) newErrors.location = 'Please select your location on the map';
    
    const minOrder = settings?.min_order_amount ?? 0;
    if (minOrder > 0 && subtotal < minOrder) {
      newErrors.items = `Minimum order is ${formatPrice(minOrder, currencySymbol)}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle location selection from map
  const handleLocationSelect = useCallback((locationData: LocationData) => {
    setLocation(locationData);
    setAddress(locationData.address);
    // Clear location error when user selects a location
    setErrors(prev => ({ ...prev, location: '' }));
  }, []);

  // Place the order
  const handlePlaceOrder = async () => {
    if (!validate()) {
      toast.error('Please fix the errors below');
      return;
    }
    
    if (!user) {
      router.push('/auth/login?redirectTo=/checkout');
      return;
    }

    if (!settings?.is_open) {
      toast.error("We're currently closed. Please try again later.");
      return;
    }

    setIsPlacing(true);

    try {
      // Step 1: Create the order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          subtotal,
          delivery_fee: deliveryFee,
          total,
          payment_method: 'cash_on_delivery',
          delivery_address: address,
          delivery_lat: location?.lat,
          delivery_lng: location?.lng,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (orderError || !order) {
        throw new Error(orderError?.message || 'Failed to create order');
      }

      // Step 2: Insert all order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        item_name: item.name,
        item_price: item.price,
        item_image_url: item.image_url,
        quantity: item.quantity,
        line_total: item.price * item.quantity,
        special_instructions: item.special_instructions || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      // Success! Clear cart and redirect to order tracking
      clearCart();
      toast.success('Order placed successfully! 🎉');
      router.push(`/orders/${order.id}`);

    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
          <ShoppingBag className="w-16 h-16 text-primary-200 mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items to your cart before checking out.</p>
          <Link href="/menu" className="btn-primary">Browse Menu</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">
        
        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground mt-1">Complete your order details below</p>
        </div>

        {/* Restaurant closed banner */}
        {settings && !settings.is_open && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">We're currently closed</p>
              <p className="text-sm text-red-600">You can still place your order but it will be prepared when we reopen.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          
          {/* ---- LEFT: DELIVERY DETAILS FORM ---- */}
          <div className="space-y-6">
            
            {/* Contact information */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className={`input-base ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                {/* Phone field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className={`input-base pl-10 ${errors.phone ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" />
                Delivery Location
              </h2>
              
              {/* Address text field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="123 Main Street, Apt 4B"
                  className={`input-base ${errors.address ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              {/* Map picker */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Pin Your Location on Map <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Drag the marker to your exact delivery location for accurate delivery
                </p>
                
                {/* LocationPicker is dynamically imported (no SSR) */}
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLat={location?.lat}
                  initialLng={location?.lng}
                />
                
                {location && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    ✓ Location selected: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </p>
                )}
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
            </div>

            {/* Order notes */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                Special Instructions
                <span className="text-sm font-normal text-muted-foreground ml-1">(optional)</span>
              </h2>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special requests? e.g., 'Ring doorbell', 'Leave at door', 'No rush'..."
                rows={3}
                className="input-base resize-none"
              />
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary-500" />
                Payment Method
              </h2>
              
              {/* Cash on Delivery (only option for now) */}
              {/* !! ADD MORE PAYMENT OPTIONS HERE when you integrate a payment provider !! */}
              <div className="flex items-center gap-4 p-4 bg-primary-50 border-2 border-primary-500 rounded-xl">
                <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                </div>
                <div className="ml-auto text-2xl">💵</div>
              </div>
              
              {/* Placeholder for future payment options */}
              {/* <div className="mt-3 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-sm text-muted-foreground">
                Card payment coming soon
              </div> */}
            </div>
          </div>

          {/* ---- RIGHT: ORDER SUMMARY ---- */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-display font-bold text-lg mb-5">Order Summary</h2>
              
              {/* Cart items list */}
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin pr-1 mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.image_url && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="48px" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm flex-shrink-0">
                      {formatPrice(item.price * item.quantity, currencySymbol)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal, currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery fee</span>
                  <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee, currencySymbol)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(total, currencySymbol)}</span>
                </div>
              </div>

              {/* Error message */}
              {errors.items && (
                <p className="mt-3 text-red-500 text-sm text-center">{errors.items}</p>
              )}

              {/* Place order button */}
              <motion.button
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-5 flex items-center justify-center gap-2 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl transition-all hover:shadow-warm disabled:opacity-60 disabled:cursor-not-allowed text-base"
              >
                {isPlacing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                By placing your order, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
