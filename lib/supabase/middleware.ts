// ============================================================
// SUPABASE MIDDLEWARE CLIENT (MODIFIED)
// ============================================================
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
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

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const customerProtectedRoutes = ['/checkout', '/orders'];
  const isCustomerProtectedRoute = customerProtectedRoutes.some(
    route => pathname.startsWith(route)
  );

  const isAdminRoute = pathname.startsWith('/admin');

  if (!user && isCustomerProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // --- تعديل الصلاحيات المباشر لمحمد علي ---
    const isExplicitAdmin = user.email === 'mohammed.ali.pro.tech@gmail.com';

    if (!isExplicitAdmin) {
      // لو مش إيميلك، وقتها بس روح اسأل قاعدة البيانات
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = '/';
        return NextResponse.redirect(homeUrl);
      }
    }
    // لو إيميلك هو المقصود، هيعدي السطور اللي فوق دي كلها ويدخلك بأمان
  }

  const authRoutes = ['/auth/login', '/auth/register'];
  if (user && authRoutes.some(route => pathname.startsWith(route))) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/';
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectTo;
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}