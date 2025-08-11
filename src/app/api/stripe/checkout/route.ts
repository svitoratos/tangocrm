import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, getPriceId, ensureSingleCustomer } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { niche, billingCycle = 'monthly', successUrl, cancelUrl } = await request.json();

    if (!niche || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the price ID for the selected niche and billing cycle
    const priceId = getPriceId(niche, billingCycle);

    // Get user email for customer deduplication
    const { data: userProfile } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!userProfile?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // ALWAYS find or create a single customer ID for this user
    console.log('🔍 Calling ensureSingleCustomer for:', { email: userProfile.email, userId });
    const customerId = await ensureSingleCustomer(userProfile.email, userId);
    
    if (!customerId) {
      console.error('❌ ensureSingleCustomer returned null for:', { email: userProfile.email, userId });
      return NextResponse.json({ error: 'Failed to create or find customer ID' }, { status: 500 });
    }
    
    console.log('✅ ensureSingleCustomer returned customer ID:', customerId);

    // Create checkout session ALWAYS using the existing/found customer ID
    const sessionOptions: any = {
      customer: customerId, // Always use the customer ID
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        clerk_user_id: userId,
        niche: niche,
        billing_cycle: billingCycle,
        existing_customer_id: customerId, // Track that we're using existing customer
      },
    };

    console.log('✅ Using customer ID for checkout:', customerId);

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('No such price')) {
        return NextResponse.json({ 
          error: 'Invalid price ID - please check your Stripe configuration' 
        }, { status: 400 });
      }
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json({ 
          error: 'Stripe configuration error - please check your API keys' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Checkout creation failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 