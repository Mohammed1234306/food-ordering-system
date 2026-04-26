'use client';
// ============================================================
// CART PROVIDER
// ============================================================
// Wraps the app to make cart state available everywhere.
// Also handles cart hydration from localStorage.
//
// WHY WE NEED THIS:
// Zustand's persist middleware saves cart to localStorage.
// But localStorage only exists in the browser, not on the server.
// This provider ensures the cart state is only accessed after
// the component has mounted (client-side), preventing
// server/client hydration mismatches.
// ============================================================

import { useEffect, useState } from 'react';
import { useCartStore } from '@/hooks/useCart';

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for the cart to hydrate from localStorage
  // useCartStore.persist.hasHydrated() tells us if the store
  // has been rehydrated from localStorage yet
  useEffect(() => {
    // Mark as hydrated after component mounts
    // This ensures localStorage is available
    setIsHydrated(true);
    
    // Manually trigger hydration if needed
    useCartStore.persist.rehydrate();
  }, []);

  // The cart is rendered regardless - we just prevent
  // hydration mismatches by not accessing localStorage during SSR
  return <>{children}</>;
}
