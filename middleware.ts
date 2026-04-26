// ============================================================
// NEXT.JS MIDDLEWARE
// ============================================================
// This middleware runs on EVERY request before the page renders.
// It handles:
// 1. Refreshing expired Supabase auth sessions
// 2. Protecting routes (redirect to login if not authenticated)
// 3. Protecting admin routes (redirect if not admin role)
// 4. Redirecting logged-in users away from auth pages
//
// HOW MIDDLEWARE WORKS IN NEXT.JS:
// - Runs at the "edge" before the page renders
// - Can redirect, rewrite, or modify the request/response
// - The 'matcher' config at the bottom controls which paths
//   trigger this middleware (we exclude static assets)
// ============================================================

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * The main middleware function.
 * Delegates to updateSession which handles auth and route protection.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Matcher configuration.
 * 
 * This tells Next.js WHICH paths should trigger the middleware.
 * We exclude:
 * - _next/static: Static files (JS, CSS bundles)
 * - _next/image: Next.js image optimization API
 * - favicon.ico: Browser favicon
 * - Files with extensions (images, fonts, etc.)
 * 
 * By excluding these, middleware only runs on actual page routes,
 * which is much more efficient.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
