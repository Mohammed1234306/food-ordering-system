// ============================================================
// UTILITY FUNCTIONS
// ============================================================
// Common helper functions used throughout the application
// ============================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from 'date-fns';
import type { OrderStatus } from '@/types';

// ============================================================
// TAILWIND CLASSNAME MERGER
// ============================================================
// Required by shadcn/ui components.
// Merges Tailwind classes intelligently, handling conflicts.
// e.g., cn('p-4', 'p-2') => 'p-2' (not 'p-4 p-2')
//
// Usage: <div className={cn('base-class', condition && 'conditional-class')} />
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// PRICE FORMATTING
// ============================================================

/**
 * Format a number as a price string
 * @param price - The numeric price
 * @param currencySymbol - The currency symbol (default: '$')
 * @returns Formatted price string (e.g., "$12.99")
 * 
 * !! CHANGE '$' to your currency symbol !!
 * Or pass it dynamically from restaurant_settings.currency_symbol
 */
export function formatPrice(price: number, currencySymbol = '$'): string {
  return `${currencySymbol}${price.toFixed(2)}`;
}

// ============================================================
// DATE FORMATTING
// ============================================================

/**
 * Format a date as a relative time string (e.g., "2 hours ago")
 * Used in order history and admin dashboard
 */
export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

/**
 * Format a date for display (e.g., "Jan 15, 2024 at 3:45 PM")
 * Used in order details
 */
export function formatOrderDate(dateString: string): string {
  return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format a date as short time only (e.g., "3:45 PM")
 * Used in admin order cards
 */
export function formatTime(dateString: string): string {
  return format(new Date(dateString), 'h:mm a');
}

// ============================================================
// ORDER UTILITIES
// ============================================================

/**
 * Calculate the estimated delivery time based on order status
 * and the restaurant's configured delivery time range
 * Returns a human-readable string
 */
export function getEstimatedDelivery(
  estimatedMinutes: number | null,
  deliveryTimeMin = 25,
  deliveryTimeMax = 45
): string {
  if (estimatedMinutes) {
    return `~${estimatedMinutes} min`;
  }
  return `${deliveryTimeMin}-${deliveryTimeMax} min`;
}

/**
 * Get the progress percentage for the order status timeline
 * Used for the progress bar on the tracking page
 */
export function getOrderProgress(status: OrderStatus): number {
  const progressMap: Record<OrderStatus, number> = {
    pending: 10,
    accepted: 30,
    preparing: 55,
    ready: 80,
    completed: 100,
    cancelled: 0,
  };
  return progressMap[status];
}

// ============================================================
// VALIDATION UTILITIES
// ============================================================

/**
 * Validate a phone number (basic format check)
 * !! Modify the regex for your country's phone format !!
 */
export function isValidPhone(phone: string): boolean {
  // Allows: +1234567890, 1234567890, (123) 456-7890, 123-456-7890
  const phoneRegex = /^[+]?[\d\s\-()]{7,15}$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Validate an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================
// STORAGE UTILITIES  
// ============================================================

/**
 * Get the public URL for an image stored in Supabase Storage
 * @param bucket - The storage bucket name (e.g., 'menu-images')
 * @param path - The file path within the bucket
 */
export function getStorageUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

// ============================================================
// STRING UTILITIES
// ============================================================

/**
 * Truncate a string to a max length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Generate initials from a full name (for avatar fallback)
 * e.g., "John Doe" => "JD"
 */
export function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate a short order number for display
 * Shows last 6 characters of the UUID in uppercase
 * e.g., "ORDER #A1B2C3"
 */
export function getOrderNumber(orderId: string): string {
  return `#${orderId.slice(-6).toUpperCase()}`;
}
