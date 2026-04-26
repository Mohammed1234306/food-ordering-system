// ============================================================
// AUTH CALLBACK ROUTE HANDLER
// ============================================================
// This server-side route handles two types of auth callbacks:
//
// 1. OAuth callback (Google sign-in):
//    After Google authenticates the user, Google redirects to:
//    https://your-project.supabase.co/auth/v1/callback
//    which then redirects here.
//
// 2. Email link callback (password reset, email confirmation):
//    Supabase embeds a ?code= parameter in the email link.
//    This handler exchanges that code for a session.
//
// HOW IT WORKS:
// - Supabase sends a `code` query parameter
// - We exchange it for a user session using exchangeCodeForSession()
// - Then redirect the user to their destination
// ============================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  
  // The auth code from Supabase
  const code = searchParams.get('code');
  
  // Where to redirect after successful auth
  // Defaults to home page if not specified
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = cookies();
    
    // Create a server-side Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Exchange the code for a session
    // This sets the auth cookies on the response
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Redirect to the intended destination
      // Use the same origin to prevent open redirects
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, redirect to login with an error
  console.error('Auth callback error: no code or exchange failed');
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
