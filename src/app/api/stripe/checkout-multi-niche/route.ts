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

    const { niches, billingCycle = 'monthly', successUrl, cancelUrl, isNicheUpgrade = false } = await request.json();

    if (!niches || !Array.isArray(niches) || niches.length === 0) {
      return NextResponse.json({ error: 'At least one niche is required' }, { status: 400 });
    }

    if (niches.length > 4) {
      return NextResponse.json({ error: 'Maximum 4 niches allowed' }, { status: 400 });
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Missing success or cancel URL' }, { status: 400 });
    }

    console.log('🔧 Creating multi-niche checkout session:', { niches, billingCycle, isNicheUpgrade, userId });

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
    console.log('🔍 Calling ensureSingleCustomer for multi-niche checkout:', { email: userProfile.email, userId });
    const customerId = await ensureSingleCustomer(userProfile.email, userId);
    
    if (!customerId) {
      console.error('❌ ensureSingleCustomer returned null for multi-niche checkout:', { email: userProfile.email, userId });
      return NextResponse.json({ error: 'Failed to create or find customer ID' }, { status: 500 });
    }
    
    console.log('✅ ensureSingleCustomer returned customer ID for multi-niche checkout:', customerId);
    
    // Verify the customer exists in Stripe before using it
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        throw new Error('Customer was deleted');
      }
      console.log('✅ Verified customer exists for multi-niche checkout:', customerId);
    } catch (error) {
      console.error('❌ Customer verification failed for multi-niche checkout:', error);
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 500 });
    }

    // Create line items for each niche
    const lineItems = [];
    for (let i = 0; i < niches.length; i++) {
      const niche = niches[i];
      try {
        // For multi-niche onboarding, the first niche uses regular pricing, additional niches use upgrade pricing
        const useUpgradePrice = isNicheUpgrade || i > 0;
        const priceId = getPriceId(niche, billingCycle as 'monthly' | 'yearly', useUpgradePrice);
        
        lineItems.push({
          price: priceId,
          quantity: 1,
        });
        
        console.log(`✅ Added line item for niche ${i + 1}:`, { niche, priceId, useUpgradePrice });
      } catch (error) {
        console.error(`❌ Error getting price ID for niche ${niche}:`, error);
        return NextResponse.json({ 
          error: `Price configuration error for niche: ${niche}`, 
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
      }
    }

    // Create checkout session with explicit customer configuration
    const sessionOptions: any = {
      customer: customerId, // Always use the consolidated customer ID
      customer_update: {
        name: 'auto',
        address: 'auto'
      },
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        clerk_user_id: userId,
        niches: JSON.stringify(niches), // Store all niches
        primary_niche: niches[0], // First niche is primary
        billing_cycle: billingCycle,
        is_multi_niche: 'true',
        niche_count: niches.length.toString(),
        consolidated_customer_id: customerId,
        force_customer_reuse: 'true'
      },
      // Prevent Stripe from creating a new customer
      customer_creation: 'never'
    };

    console.log('✅ Using customer ID for multi-niche checkout:', customerId);
    console.log('✅ Creating checkout session with line items:', lineItems.length);

    const session = await stripe.checkout.sessions.create(sessionOptions);

    console.log('✅ Multi-niche checkout session created successfully:', session.id);

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      niches: niches,
      lineItemCount: lineItems.length
    });
  } catch (error) {
    console.error('❌ Multi-niche checkout error:', error);
    
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
      error: 'Multi-niche checkout creation failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}