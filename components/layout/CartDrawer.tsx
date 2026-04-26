'use client';
// ============================================================
// CART DRAWER COMPONENT
// ============================================================
// A slide-in panel from the right showing cart contents.
// Opens when user clicks the cart icon in the navbar.
//
// Features:
// - Smooth slide-in animation with Framer Motion
// - Blurred backdrop overlay
// - Item quantity controls (+/-)
// - Remove item button
// - Special instructions display
// - Subtotal calculation
// - Checkout button (disabled if cart is empty)
// - Clear cart button
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getItemCount,
  } = useCartStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ---- BACKDROP OVERLAY ---- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* ---- DRAWER PANEL ---- */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary-500" />
                <h2 className="font-display font-bold text-lg">Your Cart</h2>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items Scrollable Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin py-4 px-5 space-y-3">
              {items.length === 0 ? (
                // Empty cart state
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-primary-300" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add some delicious items from our menu!
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-primary-600 font-semibold text-sm hover:text-primary-700 underline underline-offset-2"
                  >
                    Browse Menu →
                  </button>
                </div>
              ) : (
                // Cart items list
                <>
                  <AnimatePresence initial={false}>
                    {items.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 p-3 bg-secondary/40 rounded-xl"
                      >
                        {/* Item image */}
                        {item.image_url && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        )}

                        {/* Item details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {item.name}
                          </p>
                          
                          {/* Price */}
                          <p className="text-primary-600 font-bold text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          
                          {/* Special instructions */}
                          {item.special_instructions && (
                            <p className="text-xs text-muted-foreground italic mt-0.5 truncate">
                              "{item.special_instructions}"
                            </p>
                          )}

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            
                            <span className="font-bold text-sm w-5 text-center">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors self-start"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Clear cart button */}
                  <button
                    onClick={clearCart}
                    className="w-full py-2 text-xs text-muted-foreground hover:text-red-500 transition-colors text-center"
                  >
                    Clear cart
                  </button>
                </>
              )}
            </div>

            {/* Footer with totals and checkout button */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-border flex-shrink-0 bg-white space-y-3">
                
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Subtotal</span>
                  <span className="font-bold text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Delivery fee calculated at checkout
                </div>

                {/* Checkout button */}
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all hover:shadow-warm"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
