// ============================================================
// SUPABASE CLIENT - BROWSER SIDE
// ============================================================
// This creates a Supabase client for use in Client Components
// (components with 'use client' directive).
//
// WHY TWO CLIENTS?
// Next.js App Router has both Server Components and Client
// Components. They need different Supabase client setups:
// - Client Components: use createBrowserClient (this file)
// - Server Components: use createServerClient (server.ts)
//
// The @supabase/ssr package handles cookie-based auth correctly
// for Next.js App Router, which is needed for SSR.
// ============================================================

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in browser/client components.
 * 
 * Usage in a Client Component:
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 * const supabase = createClient()
 * ```
 */
export function createClient() {
  // Both of these env vars are prefixed with NEXT_PUBLIC_ so they
  // are safely exposed to the browser. Never put secret keys here!
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
