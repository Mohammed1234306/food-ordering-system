'use client';
// ============================================================
// MENU ITEM CARD COMPONENT
// ============================================================
// The card shown for each food item on the menu page.
//
// Features:
// - Food item image with hover zoom effect
// - Name, description, price
// - Dietary/category tags (vegetarian, spicy, etc.)
// - Availability indicator
// - "Add to cart" button with animation
// - Quick quantity adjustment if item already in cart
// - Special instructions modal on long-press or detail click
//
// ANIMATIONS:
// - Card lifts on hover (translateY + shadow)
// - Image zooms on hover
// - "Add" button bounces when item is added
// - Count badge pops in/out
// ============================================================

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Clock, Flame, Leaf } from 'lucide-react';
import { useCartStore } from '@/hooks/useCart';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { MenuItem } from '@/types';

interface MenuItemCardProps {
  item: MenuItem;
  currencySymbol?: string;
  // Optional: show full description vs truncated
  variant?: 'grid' | 'list';
}

// Maps tag names to their display config
const TAG_CONFIG: Record<string, { label: string; icon?: React.ReactNode; className: string }> = {
  vegetarian: { label: 'Veg',       className: 'tag-vegetarian',   icon: <Leaf className="w-2.5 h-2.5" /> },
  vegan:      { label: 'Vegan',     className: 'tag-vegan',        icon: <Leaf className="w-2.5 h-2.5" /> },
  spicy:      { label: 'Spicy',     className: 'tag-spicy',        icon: <Flame className="w-2.5 h-2.5" /> },
  popular:    { label: 'Popular',   className: 'tag-popular'       },
  bestseller: { label: '⭐ Best',   className: 'tag-popular'       },
  new:        { label: 'New',       className: 'tag-new'           },
  'gluten-free': { label: 'GF',     className: 'tag-gluten-free'   },
  premium:    { label: 'Premium',   className: 'tag-premium'       },
  healthy:    { label: 'Healthy',   className: 'tag-healthy'       },
};

export function MenuItemCard({ 
  item, 
  currencySymbol = '$',
  variant = 'grid',
}: MenuItemCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  
  // Find if this item is already in the cart
  const cartItem = items.find(ci => ci.menuItemId === item.id);
  const quantityInCart = cartItem?.quantity || 0;
  
  // Track animation state for the "add" button
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (!item.is_available) return;
    
    // Trigger button animation
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 400);
    
    // Add item to cart
    addItem(item, 1);
    
    // Show toast notification
    toast.success(`${item.name} added to cart!`, {
      duration: 2000,
    });
  };

  const handleDecrement = () => {
    if (!cartItem) return;
    if (quantityInCart <= 1) {
      removeItem(cartItem.id);
    } else {
      updateQuantity(cartItem.id, quantityInCart - 1);
    }
  };

  const handleIncrement = () => {
    if (!cartItem) return;
    updateQuantity(cartItem.id, quantityInCart + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={cn(
        'group bg-white rounded-2xl border border-border/50 shadow-card overflow-hidden',
        'hover:shadow-card-hover transition-shadow duration-300',
        !item.is_available && 'opacity-60',
        variant === 'list' && 'flex'
      )}
    >
      {/* ---- ITEM IMAGE ---- */}
      <div className={cn(
        'relative overflow-hidden bg-gray-100',
        variant === 'grid' ? 'aspect-[4/3]' : 'w-32 h-full flex-shrink-0'
      )}>
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes={variant === 'grid' ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : '128px'}
          />
        ) : (
          // Fallback when no image
          <div className="w-full h-full bg-primary-50 flex items-center justify-center text-4xl">
            🍽️
          </div>
        )}
        
        {/* Unavailable overlay */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="font-semibold text-sm text-gray-500 bg-white/90 px-3 py-1 rounded-full">
              Unavailable
            </span>
          </div>
        )}
        
        {/* Featured badge */}
        {item.is_featured && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full shadow-sm">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* ---- ITEM DETAILS ---- */}
      <div className={cn(
        'p-4',
        variant === 'list' && 'flex-1 flex flex-col justify-between'
      )}>
        
        {/* Tags row */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.tags.slice(0, 3).map(tag => {
              const config = TAG_CONFIG[tag];
              if (!config) return null;
              return (
                <span key={tag} className={config.className}>
                  {config.icon && config.icon}
                  {config.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Item name */}
        <h3 className="font-display font-bold text-base text-foreground leading-tight mb-1">
          {item.name}
        </h3>

        {/* Description */}
        {item.description && (
          <p className={cn(
            'text-sm text-muted-foreground leading-relaxed mb-3',
            variant === 'grid' ? 'line-clamp-2' : 'line-clamp-3'
          )}>
            {item.description}
          </p>
        )}

        {/* Meta info (prep time, calories) */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          {item.prep_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.prep_time_minutes} min
            </span>
          )}
          {item.calories && (
            <span className="flex items-center gap-1">
              🔥 {item.calories} cal
            </span>
          )}
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between mt-auto">
          {/* Price */}
          <span className="font-display font-bold text-lg text-primary-600">
            {formatPrice(item.price, currencySymbol)}
          </span>

          {/* Add to cart / quantity controls */}
          <AnimatePresence mode="wait">
            {quantityInCart === 0 ? (
              // Show "Add" button when item is NOT in cart
              <motion.button
                key="add"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: isAdding ? [1, 1.2, 1] : 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleAddToCart}
                disabled={!item.is_available}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all',
                  item.is_available
                    ? 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-warm active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                <Plus className="w-4 h-4" />
                Add
              </motion.button>
            ) : (
              // Show quantity controls when item IS in cart
              <motion.div
                key="quantity"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-1 bg-primary-50 rounded-xl p-0.5"
              >
                <button
                  onClick={handleDecrement}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-primary-600 hover:bg-primary-100 transition-colors font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                
                <motion.span
                  key={quantityInCart}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="w-7 text-center font-bold text-sm text-primary-700"
                >
                  {quantityInCart}
                </motion.span>
                
                <button
                  onClick={handleIncrement}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-primary-600 hover:bg-primary-100 transition-colors font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
