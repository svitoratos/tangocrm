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

    console.log('🔗 Creating customer portal session for user:', userId);

    // Get user profile
    const userProfile = await userOperations.getProfile(userId);
    if (!userProfile) {
      console.error('❌ User profile not found');
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (!userProfile.stripe_customer_id) {
      console.error('❌ User has no Stripe customer ID');
      return NextResponse.json({ 
        error: 'No subscription found. Please contact support.',
        supportEmail: 'support@gotangocrm.com'
      }, { status: 404 });
    }

    // Create a customer portal session - Stripe handles multiple subscriptions automatically
    const session = await stripe.billingPortal.sessions.create({
      customer: userProfile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.gotangocrm.com'}/dashboard?section=settings&tab=subscription`,
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
          error: 'Customer not found in Stripe. Please contact support.',
          supportEmail: 'support@gotangocrm.com'
        }, { status: 404 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create portal session. Please try again or contact support.',
      supportEmail: 'support@gotangocrm.com'
    }, { status: 500 });
  }
}