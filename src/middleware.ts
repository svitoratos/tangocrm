import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Simple in-memory rate limiting (for development/production)
const rateLimit = new Map();

// Rate limiting function
function getRateLimit(pathname: string) {
  // Strict limits for sensitive endpoints
  if (pathname.startsWith('/api/auth')) return { limit: 5, window: 60 };
  if (pathname.startsWith('/api/stripe')) return { limit: 10, window: 60 };
  if (pathname.startsWith('/api/admin')) return { limit: 20, window: 60 };
  if (pathname.startsWith('/api/contact')) return { limit: 3, window: 60 };
  
  // Moderate limits for user data
  if (pathname.startsWith('/api/user')) return { limit: 60, window: 60 };
  if (pathname.startsWith('/api/opportunities')) return { limit: 100, window: 60 };
  if (pathname.startsWith('/api/clients')) return { limit: 100, window: 60 };
  if (pathname.startsWith('/api/content-items')) return { limit: 100, window: 60 };
  if (pathname.startsWith('/api/goals')) return { limit: 100, window: 60 };
  if (pathname.startsWith('/api/journal-entries')) return { limit: 100, window: 60 };
  if (pathname.startsWith('/api/analytics')) return { limit: 30, window: 60 };
  if (pathname.startsWith('/api/calendar-events')) return { limit: 100, window: 60 };
  
  // Generous limits for public content
  if (pathname.startsWith('/api/')) return { limit: 200, window: 60 };
  
  // Default for other routes
  return { limit: 300, window: 60 };
}

// Rate limiting middleware
function applyRateLimit(req: Request, pathname: string) {
  // Skip rate limiting for static assets and Next.js internals
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/api/webhook')) {
    return null;
  }

  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  const { limit, window } = getRateLimit(pathname);
  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const windowMs = window * 1000;
  
  const userRequests = rateLimit.get(key) || [];
  const recentRequests = userRequests.filter((time: number) => now - time < windowMs);
  
  if (recentRequests.length >= limit) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: window 
      }), 
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': window.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
        }
      }
    );
  }
  
  recentRequests.push(now);
  rateLimit.set(key, recentRequests);
  
  return null; // Continue with normal processing
}

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
  '/onboarding$', // Only match /onboarding exactly, not /onboarding/success
  '/api/stripe(.*)',
  '/api/user/onboarding-status',
  '/api/user/payment-status',
  '/pricing',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/blog(.*)',
  '/creator-crm',
  '/coach-crm',
  '/podcaster-crm',
  '/freelancer-crm',
]);

// Helper function to check if user is admin
function isAdminUser(sessionClaims: any): boolean {
  // Check for admin role in metadata
  if (sessionClaims?.metadata?.role === 'admin') {
    return true;
  }
  
  // Check for admin emails from environment variable
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const userEmail = sessionClaims?.email;
  
  if (userEmail && adminEmails.includes(userEmail.trim())) {
    return true;
  }
  
  return false;
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // Apply rate limiting first
  const rateLimitResponse = applyRateLimit(req, pathname);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  // Special handling for onboarding success page
  if (pathname === '/onboarding/success') {
    console.log('🔧 Middleware: Handling /onboarding/success for user:', userId);
    // Allow access to success page for authenticated users
    // This page handles its own verification and redirects
    if (userId) {
      console.log('🔧 Middleware: Allowing access to success page');
      return NextResponse.next();
    } else {
      console.log('🔧 Middleware: Redirecting unauthenticated user to signin');
      return NextResponse.redirect(new URL('/signin', req.url));
    }
  }
  
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
      
      if (!isAdminUser(sessionClaims)) {
        // Redirect to home page if user doesn't have admin role
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      console.log('🔧 Admin access granted for:', sessionClaims?.email);
    } catch (error) {
      console.error('Admin verification error:', error);
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  // Check if route requires payment verification
  if (protectedRoutes(req)) {
    // Special handling for users coming from onboarding success
    const referer = req.headers.get('referer');
    const isFromSuccessPage = referer && referer.includes('/onboarding/success');
    
    if (isFromSuccessPage) {
      console.log('🔧 User coming from success page, allowing access temporarily');
      return NextResponse.next();
    }
    try {
      // First check if user is admin - admins bypass onboarding and payment requirements
      const { sessionClaims } = await auth();
      
      if (isAdminUser(sessionClaims)) {
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
        
        console.log('🔧 Middleware payment check:', {
          pathname,
          hasActiveSubscription,
          hasCompletedOnboarding,
          userEmail: sessionClaims?.email
        });
        
        // If user hasn't completed onboarding, redirect to onboarding
        if (!hasCompletedOnboarding) {
          console.log('🔧 Middleware: Redirecting to onboarding - hasCompletedOnboarding:', hasCompletedOnboarding, 'for pathname:', pathname);
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }
        
        // If user doesn't have active subscription, redirect to pricing
        if (!hasActiveSubscription) {
          console.log('🔧 Redirecting to pricing - hasActiveSubscription:', hasActiveSubscription);
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