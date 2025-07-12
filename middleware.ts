import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create Supabase client for middleware
  const supabase = getSupabase();

  // Get the current user from the request cookies
  const authCookie = req.cookies.get('sb-access-token')?.value;
  let user = null;

  if (authCookie) {
    try {
      const { data: { user: userData } } = await supabase.auth.getUser(authCookie);
      user = userData;
    } catch (error) {
      console.error('Error getting user in middleware:', error);
    }
  }

  const { pathname } = req.nextUrl;

  // Skip middleware for auth pages
  if (pathname.startsWith('/auth/')) {
    return res;
  }

  // Vendor-only routes
  const vendorRoutes = ['/vendor'];
  const isVendorRoute = vendorRoutes.some(route => pathname.startsWith(route));

  // Buyer-only routes (cart and account)
  const buyerRoutes = ['/cart', '/account'];
  const isBuyerRoute = buyerRoutes.some(route => pathname.startsWith(route));

  // Check if user is authenticated
  if (!user) {
    // Redirect to sign-in for protected routes
    if (isVendorRoute || isBuyerRoute) {
      const redirectUrl = new URL('/auth/sign-in', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return res;
  }

  // Check role-based access
  const userRole = user.user_metadata?.role;

  // Vendor route access control
  if (isVendorRoute) {
    if (userRole !== 'vendor') {
      // Redirect non-vendors to home page
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Buyer route access control
  if (isBuyerRoute) {
    if (userRole !== 'buyer') {
      // Redirect non-buyers to home page
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/vendor/:path*',
    '/cart/:path*',
    '/account/:path*',
  ],
}; 