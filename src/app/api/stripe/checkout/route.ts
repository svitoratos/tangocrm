import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe is not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

    // Force test mode in development
    const isDevelopment = process.env.NODE_ENV === 'development' ||
                         process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ||
                         process.env.NEXT_PUBLIC_APP_URL?.includes('127.0.0.1');

    // Use test key for development, live key for production
    const stripeKey = isDevelopment 
      ? process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY
      : process.env.STRIPE_SECRET_KEY;

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-06-30.basil',
    });

    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { billingCycle, selectedRoles, selectedGoals, selectedSetupTask } = body;

    const primaryRole = selectedRoles[0] || 'content-creator';

    // Create test products and prices on the fly for testing
    let priceId: string;
    
    try {
            // Force test mode for development (regardless of key type)
      const isDevelopment = process.env.NODE_ENV === 'development' ||
                           process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ||
                           process.env.NEXT_PUBLIC_APP_URL?.includes('127.0.0.1');

      // Force test mode in development, regardless of the key type
      const isTestMode = isDevelopment;
      
      console.log('🔧 Checkout mode:', isTestMode ? 'TEST' : 'LIVE');
      console.log('🔧 Environment:', process.env.NODE_ENV);
      console.log('🔧 App URL:', process.env.NEXT_PUBLIC_APP_URL);
      
      if (isTestMode) {
        // Create test price for testing
        // Map billingCycle to valid Stripe intervals
        const stripeInterval = billingCycle === 'yearly' ? 'year' : 'month';
        
        const testPrice = await stripe.prices.create({
          unit_amount: 3999, // $39.99
          currency: 'usd',
          recurring: {
            interval: stripeInterval,
          },
          product_data: {
            name: `Tango ${primaryRole} - ${billingCycle} (Test)`,
          },
        });
        
        priceId = testPrice.id;
        console.log('Created test price:', priceId);
      } else {
        // Use live price IDs
        const priceIds: Record<string, Record<string, string>> = {
          'content-creator': {
            monthly: 'price_1RjmNPIvVfTNGbwuqLvxM7BC', // $39.99/month
            yearly: 'price_1Ro6qgIvVfTNGbwuZrlckcp7'   // $383.90/year
          },
          'coach': {
            monthly: 'price_1RjmNPIvVfTNGbwuqLvxM7BC', // $39.99/month
            yearly: 'price_1Ro6qgIvVfTNGbwuZrlckcp7'   // $383.90/year
          },
          'podcaster': {
            monthly: 'price_1RjmNPIvVfTNGbwuqLvxM7BC', // $39.99/month
            yearly: 'price_1Ro6qgIvVfTNGbwuZrlckcp7'   // $383.90/year
          },
          'freelancer': {
            monthly: 'price_1RjmNPIvVfTNGbwuqLvxM7BC', // $39.99/month
            yearly: 'price_1Ro6qgIvVfTNGbwuZrlckcp7'   // $383.90/year
          }
        };

        priceId = priceIds[primaryRole]?.[billingCycle];
      }

      if (!priceId) {
        return NextResponse.json({ error: 'Invalid pricing configuration' }, { status: 400 });
      }
    } catch (error) {
      console.error('Error creating/getting price:', error);
      return NextResponse.json({ error: 'Failed to create/get price' }, { status: 500 });
    }

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid pricing configuration' }, { status: 400 });
    }

    console.log('Creating checkout session with:', {
      userId,
      primaryRole,
      billingCycle,
      priceId,
      selectedRoles,
      selectedGoals
    });

    // Create checkout session with improved redirect handling
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const successUrl = `${baseUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}&niche=${encodeURIComponent(primaryRole)}&niches=${encodeURIComponent(JSON.stringify(selectedRoles))}`;
    const cancelUrl = `${baseUrl}/onboarding`;
    
    console.log('🔧 Creating checkout session with URLs:', {
      successUrl,
      cancelUrl,
      baseUrl
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        clerk_user_id: userId,
        email: user?.emailAddresses[0]?.emailAddress || '',
        niche: primaryRole,
        niches: JSON.stringify(selectedRoles),
        goals: JSON.stringify(selectedGoals),
        setup_task: selectedSetupTask || '',
        billing_cycle: billingCycle,
      },
      customer_email: user?.emailAddresses[0]?.emailAddress,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log('Created checkout session:', session.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'Invalid Stripe API key. Please check your configuration.' },
          { status: 500 }
        );
      } else if (error.message.includes('No such price')) {
        return NextResponse.json(
          { error: 'Invalid price configuration. Please contact support.' },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: `Stripe error: ${error.message}` },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 