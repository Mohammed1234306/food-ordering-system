// ============================================================
// REAL-TIME ORDERS HOOK
// ============================================================
// This hook powers the admin dashboard's live order feed.
// It uses Supabase's real-time subscriptions to receive
// instant notifications when new orders arrive.
//
// HOW SUPABASE REAL-TIME WORKS:
// 1. Supabase publishes database changes over WebSocket
// 2. The client subscribes to changes on a specific table
// 3. When a new row is inserted/updated, a callback fires
// 4. We then play an audio alert and update the orders list
//
// REAL-TIME EVENTS WE LISTEN TO:
// - INSERT: New order placed → trigger audio bell
// - UPDATE: Order status changed → update in list
// ============================================================

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/types';

// Available alert sounds
// Sound files should be placed in /public/sounds/
// !! CHANGE THE SOUND URLS !! to point to your actual audio files
export const ALERT_SOUNDS = {
  bell1: '/sounds/bell1.mp3',   // !! REPLACE WITH YOUR SOUND FILE !!
  bell2: '/sounds/bell2.mp3',   // !! REPLACE WITH YOUR SOUND FILE !!
  bell3: '/sounds/bell3.mp3',   // !! REPLACE WITH YOUR SOUND FILE !!
} as const;

export type AlertSoundKey = keyof typeof ALERT_SOUNDS;

interface UseRealtimeOrdersOptions {
  // Whether to play audio on new orders
  audioEnabled: boolean;
  // Which sound to play ('bell1', 'bell2', 'bell3', or custom URL)
  alertSound: string;
  // Volume (0.0 to 1.0)
  alertVolume: number;
  // Current status filter (or 'all' for all statuses)
  statusFilter?: string;
}

export function useRealtimeOrders(options: UseRealtimeOrdersOptions) {
  const supabase = createClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false); // For visual flash
  
  const { audioEnabled, alertSound, alertVolume, statusFilter } = options;

  /**
   * Play the alert sound when a new order comes in.
   * We use a ref to the Audio element to avoid creating
   * a new Audio instance on every render.
   */
  const playAlert = useCallback(() => {
    if (!audioEnabled) return;
    
    try {
      // Get the sound URL (built-in or custom)
      const soundUrl = ALERT_SOUNDS[alertSound as AlertSoundKey] || alertSound;
      
      // Create or reuse the audio element
      if (!audioRef.current) {
        audioRef.current = new Audio(soundUrl);
      } else {
        audioRef.current.src = soundUrl;
      }
      
      // Set volume and play
      audioRef.current.volume = alertVolume;
      audioRef.current.currentTime = 0; // Rewind to start
      
      // play() returns a Promise - we catch errors silently
      // (browsers may block autoplay if user hasn't interacted with page)
      audioRef.current.play().catch(err => {
        console.warn('Audio play blocked by browser:', err);
        // This is normal - browsers require user interaction before
        // allowing audio. The admin needs to click something first.
      });
    } catch (err) {
      console.warn('Audio error:', err);
    }
  }, [audioEnabled, alertSound, alertVolume]);

  /**
   * Trigger a visual flash alert (pulsing red indicator)
   * Resets after 3 seconds
   */
  const triggerVisualAlert = useCallback(() => {
    setNewOrderAlert(true);
    setTimeout(() => setNewOrderAlert(false), 3000);
  }, []);

  /**
   * Fetch all orders with their items and customer profiles
   */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles (full_name, email, phone, avatar_url)
      `)
      .order('created_at', { ascending: false });

    // Apply status filter if not 'all'
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error: fetchError } = await query;
    
    if (fetchError) {
      setError(fetchError.message);
      console.error('Error fetching orders:', fetchError);
    } else {
      setOrders(data as Order[]);
    }
    
    setLoading(false);
  }, [supabase, statusFilter]);

  // Fetch orders when component mounts or filter changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /**
   * Set up real-time subscription to the orders table.
   * This listens for INSERT (new orders) and UPDATE (status changes).
   */
  useEffect(() => {
    // Create a unique channel name to avoid conflicts
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',          // New order placed
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          console.log('New order received:', payload.new);
          
          // Play audio alert for new orders
          playAlert();
          
          // Show visual alert indicator
          triggerVisualAlert();
          
          // Fetch the complete new order (with items and profile)
          const { data: newOrder } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (*),
              profiles (full_name, email, phone, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (newOrder) {
            // Add to the top of the orders list
            setOrders(prev => [newOrder as Order, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',          // Order status changed
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          console.log('Order updated:', payload.new);
          
          // Update the specific order in our list
          // We re-fetch to get the complete data with joins
          const { data: updatedOrder } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (*),
              profiles (full_name, email, phone, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (updatedOrder) {
            setOrders(prev => 
              prev.map(order => 
                order.id === payload.new.id 
                  ? (updatedOrder as Order) 
                  : order
              )
            );
          }
        }
      )
      .subscribe();

    // Cleanup: unsubscribe when component unmounts
    // This prevents memory leaks and duplicate subscriptions
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, playAlert, triggerVisualAlert]);

  /**
   * Update an order's status from the admin dashboard.
   * This will trigger the UPDATE real-time event above.
   */
  const updateOrderStatus = async (
    orderId: string, 
    status: string,
    additionalData?: { estimated_minutes?: number; admin_notes?: string }
  ) => {
    // Build the update object with status-specific timestamp
    const timestampField = status === 'accepted' ? 'accepted_at' 
      : status === 'preparing' ? 'preparing_at'
      : status === 'ready' ? 'ready_at'
      : status === 'completed' ? 'completed_at'
      : status === 'cancelled' ? 'cancelled_at'
      : null;
    
    const updateData: Record<string, unknown> = {
      status,
      ...additionalData,
    };
    
    // Set the transition timestamp
    if (timestampField) {
      updateData[timestampField] = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);
    
    if (error) {
      console.error('Error updating order status:', error);
      return { error: error.message };
    }
    
    return { error: null };
  };

  return {
    orders,
    loading,
    error,
    newOrderAlert,
    refetch: fetchOrders,
    updateOrderStatus,
  };
}
