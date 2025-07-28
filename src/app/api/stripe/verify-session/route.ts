import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

// Force test mode in development
const isDevelopment = process.env.NODE_ENV === 'development' ||
                     process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ||
                     process.env.NEXT_PUBLIC_APP_URL?.includes('127.0.0.1');

// Use test key for development, live key for production
const stripeKey = isDevelopment 
  ? process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY
  : process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new Error('Stripe secret key is not configured');
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if the session is completed and payment was successful
    if (session.payment_status === 'paid' && session.status === 'complete') {
      console.log('✅ Session verified successfully:', {
        sessionId,
        paymentStatus: session.payment_status,
        status: session.status,
        customerId: session.customer,
        metadata: session.metadata
      });

      return NextResponse.json({ 
        verified: true, 
        session: {
          id: session.id,
          paymentStatus: session.payment_status,
          status: session.status,
          customerId: session.customer,
          metadata: session.metadata
        }
      });
    } else {
      console.log('❌ Session verification failed:', {
        sessionId,
        paymentStatus: session.payment_status,
        status: session.status
      });

      return NextResponse.json({ 
        verified: false, 
        error: 'Payment not completed',
        session: {
          id: session.id,
          paymentStatus: session.payment_status,
          status: session.status
        }
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
} 