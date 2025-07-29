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
    const { selectedNiche, billingCycle } = body;

    console.log('🔧 Creating niche upgrade checkout session for:', {
      userId,
      selectedNiche,
      billingCycle
    });

    // Create test products and prices on the fly for testing
    let priceId: string;
    
    try {
      // Force test mode for development (regardless of key type)
      const isDevelopment = process.env.NODE_ENV === 'development' ||
                           process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ||
                           process.env.NEXT_PUBLIC_APP_URL?.includes('127.0.0.1');

      // Force test mode in development, regardless of the key type
      const isTestMode = isDevelopment;
      
      console.log('🔧 Niche upgrade checkout mode:', isTestMode ? 'TEST' : 'LIVE');
      console.log('🔧 Environment:', process.env.NODE_ENV);
      console.log('🔧 App URL:', process.env.NEXT_PUBLIC_APP_URL);
      
      if (isTestMode) {
        // Create test price for testing
        // Map billingCycle to valid Stripe intervals
        const stripeInterval = billingCycle === 'yearly' ? 'year' : 'month';
        
        const testPrice = await stripe.prices.create({
          unit_amount: 999, // $9.99 for additional niche
          currency: 'usd',
          recurring: {
            interval: stripeInterval,
          },
          product_data: {
            name: `Tango ${selectedNiche} Niche - ${billingCycle} (Test)`,
          },
        });
        
        priceId = testPrice.id;
        console.log('Created test price for niche upgrade:', priceId);
      } else {
        // Use live price IDs for additional niches
        const priceIds: Record<string, Record<string, string>> = {
          'content-creator': {
            monthly: 'price_1RjmNPIvVfTNGbwuqLvxM7BC', // $9.99/month
            yearly: 'price_1Ro6qgIvVfTNGbwuZrlckcp7'   // $95.90/year
          },
          'coach': {
            monthly: 'price_1RjmNPIvVfTNGbwuqLvxM7BC', // $9.99/month
            yearly: 'price_1Ro6qgIvVfTNGbwuZrlckcp7'   // $95.90/year
          },
          'podcaster': {
            monthly: 'price_1RjmNPIvVfTNGbwuqLvxM7BC', // $9.99/month
            yearly: 'price_1Ro6qgIvVfTNGbwuZrlckcp7'   // $95.90/year
          },
          'freelancer': {
            monthly: 'price_1RjmNPIvVfTNGbwuqLvxM7BC', // $9.99/month
            yearly: 'price_1Ro6qgIvVfTNGbwuZrlckcp7'   // $95.90/year
          }
        };

        priceId = priceIds[selectedNiche]?.[billingCycle];
      }

      if (!priceId) {
        throw new Error(`No price found for niche: ${selectedNiche}, billing cycle: ${billingCycle}`);
      }

      // Create checkout session with proper success URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const successUrl = `${baseUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}&niche=${selectedNiche}&niches=%5B%22${selectedNiche}%22%5D&upgrade=true&specific_niche=${selectedNiche}`;
      const cancelUrl = `${baseUrl}/dashboard`;

      console.log('🔧 Creating niche upgrade checkout session with URLs:', {
        successUrl,
        cancelUrl,
        baseUrl,
        selectedNiche,
        billingCycle
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
          niche: selectedNiche,
          niches: JSON.stringify([selectedNiche]),
          email: user?.emailAddresses?.[0]?.emailAddress || '',
          upgrade_type: 'niche_upgrade',
          billing_cycle: billingCycle,
          product_name: `Tango ${selectedNiche} Niche Upgrade`
        },
        customer_email: user?.emailAddresses?.[0]?.emailAddress,
        allow_promotion_codes: true,
      });

      console.log('✅ Created niche upgrade checkout session:', {
        sessionId: session.id,
        niche: selectedNiche,
        billingCycle: billingCycle,
        priceId: priceId
      });

      return NextResponse.json({
        url: session.url,
        sessionId: session.id
      });

    } catch (error) {
      console.error('❌ Error creating niche upgrade checkout session:', error);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Niche upgrade checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 