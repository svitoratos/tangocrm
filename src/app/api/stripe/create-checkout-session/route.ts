import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPriceId, ensureSingleCustomer } from '@/lib/stripe';
import { stripe } from '@/lib/stripe';
import { userOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { niche, billingCycle = 'monthly', isNicheUpgrade = false } = body;

    if (!niche) {
      return NextResponse.json({ error: 'Niche is required' }, { status: 400 });
    }

    console.log('🔧 Creating checkout session:', { userId, niche, billingCycle, isNicheUpgrade });

    // Get user profile to get email
    let userProfile = await userOperations.getProfile(userId);
    
    // If user profile doesn't exist, create one
    if (!userProfile) {
      console.log('🔧 User profile not found, creating new profile for:', userId);
      
      // Get user info from Clerk using currentUser
      const { currentUser } = await import('@clerk/nextjs/server');
      const user = await currentUser();
      
      if (!user) {
        console.error('❌ Could not get Clerk user for:', userId);
        return NextResponse.json({ error: 'Could not authenticate user' }, { status: 401 });
      }
      
      // Get email from Clerk user
      const userEmail = user.emailAddresses?.[0]?.emailAddress;
      
      if (userEmail) {
        console.log('🔧 Creating user profile with email from Clerk:', userEmail);
        
        // Create user profile
        userProfile = await userOperations.upsertProfile(userId, {
          id: userId,
          email: userEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          onboarding_completed: false,
          subscription_status: 'inactive',
          subscription_tier: 'none',
          primary_niche: niche,
          niches: [niche]
        });
        
        if (!userProfile) {
          console.error('❌ Failed to create user profile');
          return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
        }
      } else {
        console.error('❌ No email found in Clerk user');
        return NextResponse.json({ error: 'User email not found' }, { status: 400 });
      }
    }
    
    if (!userProfile) {
      console.error('❌ User profile not found and could not be created');
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const userEmail = userProfile.email;
    if (!userEmail) {
      console.error('❌ User email not found in profile');
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Use the ensureSingleCustomer utility to prevent duplicates
    const customerId = await ensureSingleCustomer(userEmail, userId);

    // Get the price ID using the utility function
    let priceId: string;
    try {
      priceId = getPriceId(niche, billingCycle as 'monthly' | 'yearly');
    } catch (error) {
      console.error('❌ Error getting price ID:', error);
      return NextResponse.json({ 
        error: 'Price configuration error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }

    // Create checkout session configuration
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/pricing`,
      metadata: {
        niche,
        billing_cycle: billingCycle,
        is_niche_upgrade: isNicheUpgrade.toString(),
        user_id: userId
      },
      subscription_data: {
        metadata: {
          niche,
          billing_cycle: billingCycle,
          is_niche_upgrade: isNicheUpgrade.toString(),
          user_id: userId
        }
      },
    };

    // Configure customer handling to prevent duplicates
    if (customerId) {
      // Use existing customer - this prevents duplicate customer creation
      sessionConfig.customer = customerId;
      console.log('🔧 Using existing customer:', customerId);
    } else {
      // For new customers, use if_required to prevent duplicates by email
      sessionConfig.customer_creation = 'if_required';
      sessionConfig.customer_email = userEmail;
      console.log('🔧 Creating checkout for new customer with if_required:', userEmail);
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('✅ Checkout session created:', {
      sessionId: session.id,
      customerId: customerId || 'new',
      customerEmail: userEmail,
      priceId,
      niche,
      billingCycle
    });

    return NextResponse.json({ 
      success: true,
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'Failed to create checkout session',
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create checkout session' 
    }, { status: 500 });
  }
}