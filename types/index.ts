// ============================================================
// APPLICATION-WIDE TYPE DEFINITIONS
// ============================================================
// This file defines all TypeScript interfaces and types used
// throughout the application.
//
// WHY CENTRALIZE TYPES?
// - Single source of truth for data shapes
// - Changing a type here updates all usages automatically
// - Makes it easy to see the full data model at a glance
//
// HOW TO USE:
// Import from this file: import type { Order, MenuItem } from '@/types'
// ============================================================


// ------------------------------------------------------------
// USER / PROFILE TYPES
// ------------------------------------------------------------

/** 
 * User profile data stored in the public.profiles table.
 * Extends Supabase's auth.users with additional fields.
 */
export interface Profile {
  id: string;                    // UUID matching auth.users.id
  full_name: string | null;
  email: string | null;
  phone: string | null;
  default_address: string | null;
  default_lat: number | null;
  default_lng: number | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}


// ------------------------------------------------------------
// MENU TYPES
// ------------------------------------------------------------

/**
 * A menu category (e.g., Burgers, Pizza, Drinks)
 */
export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

/**
 * A single menu item (food or drink)
 * 
 * HOW TO ADD NEW FIELDS:
 * 1. Add the field here
 * 2. Add it to the database schema (supabase/schema.sql)
 * 3. Add it to lib/menuData.ts seed data
 * 4. Update the admin menu form (components/admin/MenuItemForm.tsx)
 */
export interface MenuItem {
  id: string;
  category_id: string | null;
  name: string;              // !! WRITE ITEM NAME HERE !!
  description: string | null;
  price: number;             // !! CHANGE PRICE HERE !!
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  tags: string[];            // e.g., ["vegetarian", "spicy", "popular"]
  prep_time_minutes: number;
  calories: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  
  // Joined data (from query with category join)
  categories?: Category;
}

/**
 * MenuItem with category data joined in
 * Used on the menu page where we show category info
 */
export type MenuItemWithCategory = MenuItem & {
  categories: Category | null;
}


// ------------------------------------------------------------
// CART TYPES
// ------------------------------------------------------------

/**
 * A single item in the shopping cart
 * Extends MenuItem with quantity and cart-specific fields
 */
export interface CartItem {
  id: string;                        // Cart item UUID (not menu item ID)
  menuItemId: string;                // Reference to the menu item
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  special_instructions: string;      // Customer notes (e.g., "no onions")
}

/**
 * The full cart state
 */
export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}


// ------------------------------------------------------------
// ORDER TYPES
// ------------------------------------------------------------

/**
 * All possible order statuses in the workflow
 * Flow: pending → accepted → preparing → ready → completed
 * Any status can move to: cancelled
 */
export type OrderStatus = 
  | 'pending'    // Customer placed order, waiting for restaurant
  | 'accepted'   // Restaurant confirmed the order
  | 'preparing'  // Food is being made
  | 'ready'      // Order ready for pickup/delivery
  | 'completed'  // Order delivered
  | 'cancelled'; // Order was cancelled

/**
 * Payment methods supported
 * !! Add more here if you integrate other payment providers !!
 */
export type PaymentMethod = 'cash_on_delivery';

/**
 * A customer order from the public.orders table
 */
export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: PaymentMethod;
  is_paid: boolean;
  delivery_address: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
  customer_phone: string | null;
  customer_name: string | null;
  notes: string | null;
  admin_notes: string | null;
  estimated_minutes: number | null;
  
  // Status transition timestamps (null until that status is reached)
  accepted_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  
  created_at: string;
  updated_at: string;
  
  // Joined data
  order_items?: OrderItem[];
  profiles?: Profile | null;
}

/**
 * A line item within an order
 */
export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;          // Snapshotted at order time
  item_price: number;         // Snapshotted at order time
  item_image_url: string | null;
  quantity: number;
  line_total: number;
  special_instructions: string | null;
  created_at: string;
}

/**
 * Data required to create a new order at checkout
 */
export interface CreateOrderInput {
  delivery_address: string;
  delivery_lat?: number;
  delivery_lng?: number;
  customer_phone: string;
  customer_name: string;
  notes?: string;
  payment_method: PaymentMethod;
  items: {
    menu_item_id: string;
    item_name: string;
    item_price: number;
    item_image_url: string | null;
    quantity: number;
    line_total: number;
    special_instructions?: string;
  }[];
}


// ------------------------------------------------------------
// RESTAURANT SETTINGS TYPE
// ------------------------------------------------------------

/**
 * Restaurant configuration from the restaurant_settings table
 * Only one row exists (id = 1)
 */
export interface RestaurantSettings {
  id: 1;
  restaurant_name: string;     // !! RESTAURANT_NAME_HERE !!
  tagline: string;
  delivery_fee: number;
  min_order_amount: number;
  delivery_time_min: number;
  delivery_time_max: number;
  is_open: boolean;
  alert_sound: string;         // 'bell1', 'bell2', 'bell3', or custom URL
  alert_volume: number;
  show_location: boolean;
  restaurant_lat: number;
  restaurant_lng: number;
  restaurant_address: string;
  restaurant_phone: string;
  restaurant_email: string;
  instagram_url: string;
  facebook_url: string;
  currency_symbol: string;     // !! CHANGE TO YOUR CURRENCY !!
  require_phone: boolean;
  updated_at: string;
}


// ------------------------------------------------------------
// UTILITY TYPES
// ------------------------------------------------------------

/**
 * Helper type for API responses
 */
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
}

/**
 * Status display config - maps order status to UI properties
 * Used in OrderCard and OrderStatusTimeline components
 */
export interface StatusConfig {
  label: string;           // Human-readable status label
  color: string;           // Tailwind color class
  bgColor: string;         // Tailwind bg class
  icon: string;            // Emoji or icon name
  description: string;     // Description shown on tracking page
}

/**
 * Maps each OrderStatus to its display configuration
 */
export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: 'Order Placed',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: '⏳',
    description: 'Your order has been placed and is waiting for confirmation.',
  },
  accepted: {
    label: 'Order Confirmed',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: '✅',
    description: 'Restaurant has confirmed your order.',
  },
  preparing: {
    label: 'Preparing',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: '👨‍🍳',
    description: 'Your food is being freshly prepared.',
  },
  ready: {
    label: 'Out for Delivery',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    icon: '🛵',
    description: 'Your order is on its way!',
  },
  completed: {
    label: 'Delivered',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200',
    icon: '🎉',
    description: 'Order delivered successfully. Enjoy your meal!',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: '❌',
    description: 'This order was cancelled.',
  },
};

/**
 * The ordered list of statuses for the progress timeline
 * (excludes 'cancelled' since it's not a linear step)
 */
export const ORDER_STATUS_STEPS: OrderStatus[] = [
  'pending',
  'accepted', 
  'preparing',
  'ready',
  'completed',
];
