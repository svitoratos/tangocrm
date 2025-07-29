import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { userOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ Portal API: No userId found - user not authenticated');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!stripe) {
      console.log('❌ Portal API: Stripe not configured');
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Get user profile to find Stripe customer ID
    const user = await userOperations.getProfile(userId);
    
    if (!user) {
      console.log('❌ Portal API: User profile not found for userId:', userId);
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    console.log('🔧 Portal API: User profile found:', {
      userId,
      email: user.email,
      hasStripeCustomerId: !!user.stripe_customer_id,
      stripeCustomerId: user.stripe_customer_id
    });

    let stripeCustomerId = user.stripe_customer_id;

    // If user doesn't have a Stripe customer ID, create one
    if (!stripeCustomerId) {
      console.log('🔧 Portal API: Creating Stripe customer for user:', userId);
      
      // Check if user has an email
      if (!user.email) {
        console.log('❌ Portal API: User has no email, cannot create Stripe customer');
        return NextResponse.json(
          { error: 'User email is required to create billing portal. Please contact support.' },
          { status: 400 }
        );
      }
      
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

        console.log('✅ Portal API: Created new Stripe customer:', stripeCustomerId, 'for user:', userId);
      } catch (stripeError) {
        console.error('❌ Portal API: Error creating Stripe customer:', stripeError);
        
        // Provide more specific error messages
        if (stripeError instanceof Error) {
          if (stripeError.message.includes('Invalid API key')) {
            return NextResponse.json(
              { error: 'Stripe configuration error. Please contact support.' },
              { status: 500 }
            );
          } else if (stripeError.message.includes('email')) {
            return NextResponse.json(
              { error: 'Invalid email address. Please update your profile with a valid email.' },
              { status: 400 }
            );
          } else {
            return NextResponse.json(
              { error: `Stripe error: ${stripeError.message}` },
              { status: 500 }
            );
          }
        }
        
        return NextResponse.json(
          { error: 'Failed to create Stripe customer. Please try again or contact support.' },
          { status: 500 }
        );
      }
    }

    // Verify the Stripe customer exists
    try {
      await stripe.customers.retrieve(stripeCustomerId);
      console.log('✅ Portal API: Verified Stripe customer exists:', stripeCustomerId);
    } catch (verifyError) {
      console.error('❌ Portal API: Stripe customer verification failed:', verifyError);
      
      // If customer doesn't exist, create a new one
      if (verifyError instanceof Error && verifyError.message.includes('No such customer')) {
        console.log('🔧 Portal API: Customer not found, creating new one...');
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

          console.log('✅ Portal API: Created new Stripe customer after verification failed:', stripeCustomerId);
        } catch (createError) {
          console.error('❌ Portal API: Failed to create customer after verification:', createError);
          return NextResponse.json(
            { error: 'Failed to create billing portal. Please contact support.' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Failed to verify billing account. Please contact support.' },
          { status: 500 }
        );
      }
    }

    // Create billing portal session with Stripe customer ID
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${request.nextUrl.origin}/dashboard/settings`,
    });

    console.log('✅ Portal API: Created billing portal session for user:', userId, 'customer:', stripeCustomerId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Portal API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session. Please try again or contact support.' },
      { status: 500 }
    );
  }
} 