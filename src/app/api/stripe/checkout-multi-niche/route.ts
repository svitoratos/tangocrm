import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { stripe, getPriceId, ensureSingleCustomer } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Multi-niche checkout route called');
    
    const { userId } = await auth();
    console.log('🔧 User ID from auth:', userId);
    
    if (!userId) {
      console.error('❌ No user ID found in auth');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let requestBody;
    try {
      requestBody = await request.json();
      console.log('🔧 Request body received:', requestBody);
    } catch (parseError) {
      console.error('❌ Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { niches, billingCycle = 'monthly', successUrl, cancelUrl, isNicheUpgrade = false } = requestBody;

    console.log('🔧 Extracted parameters:', { niches, billingCycle, successUrl, cancelUrl, isNicheUpgrade });

    if (!niches || !Array.isArray(niches) || niches.length === 0) {
      console.error('❌ Invalid niches parameter:', niches);
      return NextResponse.json({ error: 'At least one niche is required' }, { status: 400 });
    }

    if (niches.length > 4) {
      console.error('❌ Too many niches:', niches.length);
      return NextResponse.json({ error: 'Maximum 4 niches allowed' }, { status: 400 });
    }

    if (!successUrl || !cancelUrl) {
      console.error('❌ Missing URLs:', { successUrl, cancelUrl });
      return NextResponse.json({ error: 'Missing success or cancel URL' }, { status: 400 });
    }

    console.log('🔧 Creating multi-niche checkout session:', { niches, billingCycle, isNicheUpgrade, userId });

    // Get user email for customer deduplication
    let userEmail: string;
    
    try {
      // First try to get email from our database
      console.log('🔧 Fetching user profile from database...');
      const { data: userProfile, error: dbError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();

      if (dbError) {
        console.log('⚠️ Database error (may be expected for new users):', dbError);
      }

      if (userProfile?.email) {
        userEmail = userProfile.email;
        console.log('✅ Found user email in database:', userEmail);
      } else {
        // If not found in database, get it from Clerk (e.g., during onboarding)
        console.log('⚠️ User email not found in database, fetching from Clerk...');
        try {
          const client = await clerkClient();
          const user = await client.users.getUser(userId);
          userEmail = user.emailAddresses?.[0]?.emailAddress;
          
          if (!userEmail) {
            console.error('❌ No email found in Clerk for user:', userId);
            return NextResponse.json({ error: 'User email not found' }, { status: 400 });
          }
          
          console.log('✅ Found user email in Clerk:', userEmail);
        } catch (clerkError) {
          console.error('❌ Failed to fetch user from Clerk:', clerkError);
          return NextResponse.json({ error: 'Failed to retrieve user information' }, { status: 500 });
        }
      }
    } catch (error) {
      console.error('❌ Error in user email retrieval:', error);
      return NextResponse.json({ error: 'Failed to retrieve user email' }, { status: 500 });
    }

    if (!userEmail) {
      console.error('❌ User email is still undefined after retrieval attempts');
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // ALWAYS find or create a single customer ID for this user
    console.log('🔍 Calling ensureSingleCustomer for multi-niche checkout:', { email: userEmail, userId });
    
    let customerId;
    try {
      customerId = await ensureSingleCustomer(userEmail, userId);
    } catch (ensureError) {
      console.error('❌ Error in ensureSingleCustomer:', ensureError);
      return NextResponse.json({ error: 'Failed to create or find customer ID' }, { status: 500 });
    }
    
    if (!customerId) {
      console.error('❌ ensureSingleCustomer returned null for multi-niche checkout:', { email: userEmail, userId });
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

    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionOptions);
      console.log('✅ Multi-niche checkout session created successfully:', session.id);
    } catch (stripeError) {
      console.error('❌ Stripe checkout session creation failed:', stripeError);
      
      if (stripeError instanceof Error) {
        if (stripeError.message.includes('No such price')) {
          return NextResponse.json({ 
            error: 'Invalid price ID - please check your Stripe configuration' 
          }, { status: 400 });
        }
        if (stripeError.message.includes('Invalid API key')) {
          return NextResponse.json({ 
            error: 'Stripe configuration error - please check your API keys' 
          }, { status: 500 });
        }
        if (stripeError.message.includes('customer')) {
          return NextResponse.json({ 
            error: 'Customer configuration error - please check customer setup' 
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({ 
        error: 'Stripe checkout session creation failed', 
        details: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
      }, { status: 500 });
    }

    if (!session || !session.url) {
      console.error('❌ Stripe session created but missing URL:', session);
      return NextResponse.json({ 
        error: 'Checkout session created but URL is missing' 
      }, { status: 500 });
    }

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