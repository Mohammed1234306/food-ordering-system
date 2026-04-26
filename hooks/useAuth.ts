// ============================================================
// AUTH HOOK
// ============================================================
// Custom hook to easily access authentication state
// and profile data anywhere in the application.
//
// This hook:
// 1. Gets the current user from Supabase Auth
// 2. Fetches the user's profile from the profiles table
// 3. Provides auth actions (signOut, etc.)
// 4. Listens for auth state changes in real-time
// ============================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface AuthState {
  user: User | null;           // Supabase auth user object
  profile: Profile | null;     // App-level profile (from public.profiles)
  loading: boolean;            // True while auth state is being determined
  isAdmin: boolean;            // Convenience: true if user is an admin
}

export function useAuth() {
  const supabase = createClient();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
  });

  /**
   * Fetches the user's profile from the database.
   * Called whenever auth state changes.
   */
  const fetchProfile = useCallback(async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return profile as Profile;
  }, [supabase]);

  useEffect(() => {
    // Get the initial auth state when the component mounts
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const profile = await fetchProfile(user.id);
        setState({
          user,
          profile,
          loading: false,
          isAdmin: profile?.role === 'admin',
        });
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          isAdmin: false,
        });
      }
    };

    initAuth();

    // Subscribe to auth state changes (login, logout, token refresh)
    // This keeps the auth state in sync automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            loading: false,
            isAdmin: profile?.role === 'admin',
          });
        } else {
          setState({
            user: null,
            profile: null,
            loading: false,
            isAdmin: false,
          });
        }
      }
    );

    // Cleanup subscription when component unmounts
    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  /**
   * Sign the user out and clear their session
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    // Auth state change listener above will update state automatically
  };

  /**
   * Update the user's profile (optimistic update)
   */
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) return { error: 'Not authenticated' };
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', state.user.id)
      .select()
      .single();
    
    if (data) {
      // Update local state immediately without waiting for subscription
      setState(prev => ({
        ...prev,
        profile: data as Profile,
        isAdmin: (data as Profile).role === 'admin',
      }));
    }
    
    return { data, error };
  };

  return {
    ...state,
    signOut,
    updateProfile,
  };
}
