import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes that require payment
const protectedRoutes = createRouteMatcher([
  '/dashboard(.*)',
  '/api/opportunities(.*)',
  '/api/clients(.*)',
  '/api/content-items(.*)',
  '/api/goals(.*)',
  '/api/journal-entries(.*)',
  '/api/analytics(.*)',
  '/api/calendar-events(.*)',
]);

// Define admin routes that require admin access
const adminRoutes = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

// Define routes that don't require payment verification
const publicRoutes = createRouteMatcher([
  '/',
  '/signin(.*)',
  '/signup(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/api/stripe(.*)',
  '/api/user/onboarding-status',
  '/api/user/payment-status',
  '/pricing',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = new URL(req.url);
  
  // Allow public routes
  if (publicRoutes(req)) {
    return NextResponse.next();
  }
  
  // If user is not authenticated, redirect to sign-in
  if (!userId) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }
  
  // Check if route requires admin access
  if (adminRoutes(req)) {
    try {
      const { sessionClaims } = await auth();
      
      // Temporary bypass for your email during development
      const userEmail = sessionClaims?.email;
      const isAdmin = sessionClaims?.metadata?.role === 'admin';
      
      if (!isAdmin && userEmail !== 'stevenvitoratos@gmail.com' && userEmail !== 'stevenvitoratos@getbondlyapp.com') {
        // Redirect to home page if user doesn't have admin role
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      if (userEmail === 'stevenvitoratos@gmail.com' || userEmail === 'stevenvitoratos@getbondlyapp.com') {
        console.log('🔧 Temporary admin access granted for:', userEmail);
      }
    } catch (error) {
      console.error('Admin verification error:', error);
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  // Check if route requires payment verification
  if (protectedRoutes(req)) {
    try {
      // First check if user is admin - admins bypass onboarding and payment requirements
      const { sessionClaims } = await auth();
      const userEmail = sessionClaims?.email;
      const isAdmin = sessionClaims?.metadata?.role === 'admin';
      
      // Temporary bypass for your email during development
      if (isAdmin || userEmail === 'stevenvitoratos@gmail.com' || userEmail === 'stevenvitoratos@getbondlyapp.com') {
        console.log('Admin user detected - bypassing onboarding and payment verification');
        return NextResponse.next();
      }
      
      // For non-admin users, check payment status
      const response = await fetch(`${url.origin}/api/user/payment-status`, {
        headers: {
          'Cookie': req.headers.get('cookie') || '',
        },
      });
      
      if (response.ok) {
        const { hasActiveSubscription, hasCompletedOnboarding } = await response.json();
        
        // If user hasn't completed onboarding, redirect to onboarding
        if (!hasCompletedOnboarding) {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
        
        // If user doesn't have active subscription, redirect to pricing
        if (!hasActiveSubscription) {
          return NextResponse.redirect(new URL('/pricing?require_payment=true', req.url));
        }
      } else {
        // If payment status check fails, redirect to pricing for safety
        console.error('Payment status check failed with status:', response.status);
        return NextResponse.redirect(new URL('/pricing?require_payment=true', req.url));
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      // On error, redirect to pricing instead of allowing access
      return NextResponse.redirect(new URL('/pricing?require_payment=true', req.url));
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}; 