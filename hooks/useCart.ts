// ============================================================
// CART STATE MANAGEMENT - ZUSTAND STORE
// ============================================================
// Zustand is a lightweight state management library.
// This store manages the shopping cart across the entire app.
//
// WHY ZUSTAND INSTEAD OF CONTEXT?
// - Much simpler API than React Context + useReducer
// - No Provider wrapping needed
// - Components only re-render when their subscribed state changes
// - Works outside React components (e.g., in utility functions)
// - Built-in persistence with localStorage
//
// HOW TO USE IN A COMPONENT:
// import { useCartStore } from '@/hooks/useCart'
// const { items, addItem, removeItem, total } = useCartStore()
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { CartItem, MenuItem } from '@/types';

// Shape of the cart store state and actions
interface CartStore {
  // STATE
  items: CartItem[];            // All items currently in the cart
  isOpen: boolean;              // Whether the cart drawer is open
  
  // COMPUTED (derived from items)
  // These are computed as getters, not stored state
  getTotal: () => number;
  getItemCount: () => number;
  getSubtotal: () => number;
  
  // ACTIONS
  addItem: (item: MenuItem, quantity?: number, specialInstructions?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateInstructions: (cartItemId: string, instructions: string) => void;
  clearCart: () => void;
  setIsOpen: (open: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  // persist() wraps the store to automatically save to localStorage
  // This means the cart survives page refreshes!
  persist(
    (set, get) => ({
      // ============================================================
      // INITIAL STATE
      // ============================================================
      items: [],
      isOpen: false,

      // ============================================================
      // COMPUTED GETTERS
      // These recalculate every time they're called
      // ============================================================
      
      /**
       * Calculate cart subtotal (sum of all item line totals)
       */
      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      },
      
      /**
       * Alias for getSubtotal (used in different contexts)
       */
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      },
      
      /**
       * Total number of individual items in cart
       * (sums quantities, so 2x burger = 2 items)
       */
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // ============================================================
      // ACTIONS
      // ============================================================

      /**
       * Add an item to the cart.
       * If the same menu item already exists in the cart, 
       * we increase its quantity instead of adding a duplicate.
       */
      addItem: (menuItem: MenuItem, quantity = 1, specialInstructions = '') => {
        set(state => {
          // Check if this menu item is already in the cart
          const existingItem = state.items.find(
            item => item.menuItemId === menuItem.id && 
                    item.special_instructions === specialInstructions
          );

          if (existingItem) {
            // Item exists - just increase the quantity
            return {
              items: state.items.map(item =>
                item.id === existingItem.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          } else {
            // New item - add to cart with a unique cart item ID
            // We use a separate cart item ID (not the menu item ID)
            // so the same menu item can appear multiple times with
            // different special instructions
            const newCartItem: CartItem = {
              id: uuidv4(),                    // Unique cart item ID
              menuItemId: menuItem.id,         // Reference to menu item
              name: menuItem.name,
              price: menuItem.price,
              image_url: menuItem.image_url,
              quantity,
              special_instructions: specialInstructions,
            };
            
            return { items: [...state.items, newCartItem] };
          }
        });
      },

      /**
       * Remove a specific cart item by its cart item ID
       * (not the menu item ID - see comment in addItem above)
       */
      removeItem: (cartItemId: string) => {
        set(state => ({
          items: state.items.filter(item => item.id !== cartItemId),
        }));
      },

      /**
       * Update the quantity of a cart item.
       * If quantity reaches 0 or below, removes the item entirely.
       */
      updateQuantity: (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
          // Remove item if quantity drops to 0
          get().removeItem(cartItemId);
          return;
        }
        
        set(state => ({
          items: state.items.map(item =>
            item.id === cartItemId ? { ...item, quantity } : item
          ),
        }));
      },

      /**
       * Update special instructions for a cart item
       * (e.g., "no onions", "extra sauce on the side")
       */
      updateInstructions: (cartItemId: string, instructions: string) => {
        set(state => ({
          items: state.items.map(item =>
            item.id === cartItemId 
              ? { ...item, special_instructions: instructions } 
              : item
          ),
        }));
      },

      /**
       * Empty the entire cart
       * Called after a successful order placement
       */
      clearCart: () => {
        set({ items: [] });
      },

      /**
       * Toggle cart drawer open/closed
       */
      setIsOpen: (open: boolean) => {
        set({ isOpen: open });
      },
    }),
    {
      // ============================================================
      // PERSISTENCE CONFIG
      // ============================================================
      name: 'food-cart',                // localStorage key name
      storage: createJSONStorage(() => localStorage),
      
      // Only persist the items array, not the UI state (isOpen)
      partialize: (state) => ({ items: state.items }),
    }
  )
);
