import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { userOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Get user profile to find Stripe customer ID
    const user = await userOperations.getProfile(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    let stripeCustomerId = user.stripe_customer_id;

    // If user doesn't have a Stripe customer ID, create one
    if (!stripeCustomerId) {
      console.log('🔧 Creating Stripe customer for user:', userId);
      
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: userId,
            clerkUserId: userId
          }
        });

        stripeCustomerId = customer.id;

        // Update user profile with new Stripe customer ID
        await userOperations.updateProfile(userId, {
          stripe_customer_id: stripeCustomerId,
          updated_at: new Date().toISOString()
        });

        console.log('✅ Created new Stripe customer:', stripeCustomerId, 'for user:', userId);
      } catch (stripeError) {
        console.error('❌ Error creating Stripe customer:', stripeError);
        return NextResponse.json(
          { error: 'Failed to create Stripe customer' },
          { status: 500 }
        );
      }
    }

    // Create billing portal session with Stripe customer ID
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${request.nextUrl.origin}/dashboard/settings`,
    });

    console.log('✅ Created billing portal session for user:', userId, 'customer:', stripeCustomerId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
} 