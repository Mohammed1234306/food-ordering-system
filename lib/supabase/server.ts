// ============================================================
// SUPABASE CLIENT - SERVER SIDE
// ============================================================
// This creates a Supabase client for use in Server Components,
// Server Actions, and Route Handlers.
//
// The key difference from the browser client:
// - Server client reads/writes cookies via Next.js headers()
// - This is required for SSR authentication to work correctly
// - The user's session is read from the cookie on every request
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for server-side usage.
 * Must be called inside an async Server Component or Server Action.
 * 
 * Usage in a Server Component:
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 * export default async function Page() {
 *   const supabase = createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   // ...
 * }
 * ```
 */
export function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read a cookie by name
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Set a cookie (used during auth flows)
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        // Remove a cookie (used during sign out)
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Same as above - ignore in Server Components
          }
        },
      },
    }
  );
}
