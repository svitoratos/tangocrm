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
    
    console.log('🔍 Customer consolidation result:', {
      userEmail,
      userId,
      customerId,
      userProfileEmail: userProfile.email
    });

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
      allow_promotion_codes: true, // Enable discount code field
      success_url: `${request.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
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
      
      // Debug: Check what email the existing customer has in Stripe
      try {
        const existingCustomer = await stripe.customers.retrieve(customerId);
        
        // Check if customer exists and is not deleted (TypeScript safe)
        if (existingCustomer && !existingCustomer.deleted && 'email' in existingCustomer) {
          console.log('🔍 Existing customer details:', {
            customerId,
            customerEmail: existingCustomer.email,
            customerMetadata: existingCustomer.metadata
          });
          
          // If the existing customer has the wrong email, force email update
          if (existingCustomer.email !== userEmail) {
            console.warn('⚠️ Existing customer has wrong email, updating:', {
              currentEmail: existingCustomer.email,
              correctEmail: userEmail
            });
            
            // Update the customer email in Stripe
            await stripe.customers.update(customerId, {
              email: userEmail
            });
            
            console.log('✅ Updated customer email in Stripe');
          }
        } else {
          console.log('⚠️ Customer not found or deleted, will create new customer');
        }
      } catch (error) {
        console.error('❌ Error checking existing customer:', error);
      }
    } else {
      // For new customers, ensure proper email handling
      sessionConfig.customer_creation = 'if_required';
      sessionConfig.customer_email = userEmail;
      
      // Add billing address collection to ensure email is captured
      sessionConfig.billing_address_collection = 'required';
      
      // Force email collection even if customer exists
      sessionConfig.payment_method_collection = 'always';
      
      console.log('🔧 Creating checkout for new customer with email enforcement:', userEmail);
    }

    // Always ensure the email is set in the session
    if (!sessionConfig.customer_email) {
      sessionConfig.customer_email = userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Verify and fix customer email if needed
    if (session.customer && typeof session.customer === 'string') {
      try {
        const customer = await stripe.customers.retrieve(session.customer);
        
        if (customer && !customer.deleted && 'email' in customer) {
          console.log('🔍 Post-creation customer email check:', {
            customerId: session.customer,
            customerEmail: customer.email,
            expectedEmail: userEmail
          });
          
          // If the customer email is wrong (e.g., placeholder), fix it immediately
          if (customer.email && customer.email !== userEmail && customer.email.includes('@placeholder.tango')) {
            console.warn('⚠️ Customer created with placeholder email, fixing immediately:', {
              currentEmail: customer.email,
              correctEmail: userEmail
            });
            
            await stripe.customers.update(session.customer, {
              email: userEmail
            });
            
            console.log('✅ Fixed customer email immediately after creation');
          }
        }
      } catch (error) {
        console.error('❌ Error checking post-creation customer email:', error);
      }
    }

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
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // Check if it's a Stripe error
    if (error && typeof error === 'object' && 'type' in error) {
      console.error('❌ Stripe error details:', {
        type: (error as any).type,
        code: (error as any).code,
        message: (error as any).message,
        decline_code: (error as any).decline_code,
        param: (error as any).param
      });
    }
    
    // Check environment variables
    console.error('❌ Environment check:', {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    });
    
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