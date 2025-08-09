import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { userOperations } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin-config';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔧 Creating Stripe portal session for user:', userId);

    const userEmail = sessionClaims?.email as string;
    const isAdmin = isAdminEmail(userEmail);

    // Get user profile to get Stripe customer ID
    const userProfile = await userOperations.getProfile(userId);
    
    if (!userProfile) {
      console.log('❌ No user profile found for user:', userId);
      return NextResponse.json({ 
        error: 'User profile not found. Please contact support.' 
      }, { status: 404 });
    }

    // Check if user has a Stripe customer ID
    if (!userProfile.stripe_customer_id) {
      console.log('❌ No Stripe customer ID found for user:', userId);
      
      // Check if user has subscription access through other means
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const hasActiveSubscription = isAdmin || 
        (user && (user.subscription_status === 'active' || 
                  user.subscription_status === 'trialing' || 
                  user.subscription_status === 'past_due'));

      if (hasActiveSubscription) {
        console.log('✅ User has active subscription but no Stripe customer ID - managed subscription');
        return NextResponse.json({ 
          error: 'Your subscription is managed outside of Stripe. For billing support, please contact our support team.',
          supportEmail: 'support@gotangocrm.com',
          isManaged: true
        }, { status: 422 });
      }
      
      // If no active subscription, check if user exists but just doesn't have a subscription yet
      if (user) {
        console.log('❌ User exists but no active subscription found');
        return NextResponse.json({ 
          error: 'No active subscription found. Please subscribe to access billing management.',
          needsSubscription: true
        }, { status: 404 });
      }
      
      console.log('❌ User profile not found in database');
      return NextResponse.json({ 
        error: 'No subscription found. Please contact support if you believe this is an error.',
        supportEmail: 'support@gotangocrm.com'
      }, { status: 404 });
    }

    console.log('🔧 Found Stripe customer ID:', userProfile.stripe_customer_id);

    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userProfile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?section=settings&tab=subscription`,
    });

    console.log('✅ Created portal session:', session.id);

    return NextResponse.json({
      url: session.url
    });

  } catch (error) {
    console.error('❌ Error creating portal session:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('No such customer')) {
        return NextResponse.json({ 
          error: 'Customer not found. Please contact support.' 
        }, { status: 404 });
      }
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json({ 
          error: 'Billing portal temporarily unavailable. Please contact support.' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create billing portal session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}