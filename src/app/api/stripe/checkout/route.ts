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

    // SIMPLE AND EFFECTIVE: Find or create customer ID
    console.log('🔍 Finding or creating customer ID for:', userProfile.email);
    
    let customerId = null;
    
    // 1. Search Stripe for existing customers
    const existingCustomers = await stripe.customers.list({
      email: userProfile.email,
      limit: 100
    });
    
    // 2. If we found existing customers, use the most recent one
    if (existingCustomers.data.length > 0) {
      const validCustomers = existingCustomers.data.filter(c => !c.deleted);
      if (validCustomers.length > 0) {
        // Sort by creation time, newest first
        validCustomers.sort((a, b) => b.created - a.created);
        customerId = validCustomers[0].id;
        console.log('✅ Using existing customer:', customerId);
        
        // Update our database to use this customer ID
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (updateError) {
          console.error('❌ Error updating database:', updateError);
        } else {
          console.log('✅ Database updated with existing customer ID');
        }
      }
    }
    
    // 3. If no existing customer found, create a new one
    if (!customerId) {
      console.log('🔧 Creating new customer for:', userProfile.email);
      
      const newCustomer = await stripe.customers.create({
        email: userProfile.email,
        metadata: {
          clerk_user_id: userId,
          created_at: new Date().toISOString(),
          source: 'checkout_flow_simple'
        }
      });
      
      customerId = newCustomer.id;
      console.log('✅ Created new customer:', customerId);
      
      // Update our database
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ Error updating database with new customer:', updateError);
        throw new Error(`Failed to update database: ${updateError.message}`);
      }
    }
    
    if (!customerId) {
      console.error('❌ Failed to get or create customer ID');
      return NextResponse.json({ error: 'Failed to get or create customer ID' }, { status: 500 });
    }

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
        is_niche_upgrade: 'true', // This tells the webhook to add to existing subscription
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