import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { userOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔧 Creating Stripe portal session for user:', userId);

    // Get user profile to get Stripe customer ID
    const userProfile = await userOperations.getProfile(userId);
    
    if (!userProfile || !userProfile.stripe_customer_id) {
      console.log('❌ No user profile or Stripe customer ID found for user:', userId);
      return NextResponse.json({ 
        error: 'No subscription found. Please contact support.' 
      }, { status: 404 });
    }

    console.log('🔧 Found Stripe customer ID:', userProfile.stripe_customer_id);

    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userProfile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?section=settings&tab=subscription`,
    });

    console.log('✅ Created portal session:', session.id);

    return NextResponse.json({
      url: session.url
    });

  } catch (error) {
    console.error('❌ Error creating portal session:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('No such customer')) {
        return NextResponse.json({ 
          error: 'Customer not found. Please contact support.' 
        }, { status: 404 });
      }
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json({ 
          error: 'Billing portal temporarily unavailable. Please contact support.' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create billing portal session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}