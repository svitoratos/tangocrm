import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect directly to landing page for immediate sign-out
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Sign out error:', error);
    // Still redirect to landing page even on error
    return NextResponse.redirect(new URL('/', request.url));
  }
} 