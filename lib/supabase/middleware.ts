// ============================================================
// SUPABASE MIDDLEWARE CLIENT
// ============================================================
// This creates a Supabase client specifically for use in
// Next.js middleware (middleware.ts in the project root).
//
// Middleware runs on every request BEFORE the page renders.
// We use it to:
// 1. Refresh expired auth sessions automatically
// 2. Protect routes (redirect unauthenticated users to login)
// 3. Protect admin routes (check for admin role)
//
// WHY A SEPARATE CLIENT FOR MIDDLEWARE?
// Middleware uses a different API for reading/writing cookies
// compared to Server Components, so we need this special setup.
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Updates the auth session in middleware.
 * Call this in your middleware.ts file.
 */
export async function updateSession(request: NextRequest) {
  // Start with a response that just continues to the next handler
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create a Supabase client that can read/write cookies in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          // Set cookies on both the request and response
          // This is required for the middleware to work correctly
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very
  // hard to debug issues with users being randomly logged out.

  // Refresh the session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ============================================================
  // ROUTE PROTECTION RULES
  // Add/modify these rules to control access to routes
  // ============================================================

  // Protected customer routes (require any login)
  const customerProtectedRoutes = ['/checkout', '/orders'];
  const isCustomerProtectedRoute = customerProtectedRoutes.some(
    route => pathname.startsWith(route)
  );

  // Admin routes (require login AND admin role)
  const isAdminRoute = pathname.startsWith('/admin');

  if (!user && isCustomerProtectedRoute) {
    // Not logged in - redirect to login page
    // Save the current URL so we can redirect back after login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute) {
    if (!user) {
      // Not logged in - redirect to login
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin role from profile
    // We query the database here to verify the role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      // Logged in but not an admin - redirect to home
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = '/';
      return NextResponse.redirect(homeUrl);
    }
  }

  // Auth pages should redirect logged-in users away
  const authRoutes = ['/auth/login', '/auth/register'];
  if (user && authRoutes.some(route => pathname.startsWith(route))) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/';
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectTo;
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  // Return the response with refreshed session cookies
  return supabaseResponse;
}
