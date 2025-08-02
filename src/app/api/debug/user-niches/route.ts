import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userOperations } from '@/lib/database';
import { isAdminEmail } from '@/lib/admin-config';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug endpoint called at:', new Date().toISOString());
    
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 400 }
      );
    }

    console.log('🔍 Debugging user:', userId);

    // Check if user is admin - try to get email from sessionClaims or from database
    let userEmail = sessionClaims?.email as string;
    
    // If email is not in sessionClaims, try to get it from the database
    if (!userEmail) {
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (userByEmail && !emailError) {
        userEmail = userByEmail.email;
      }
    }
    
    const isAdmin = isAdminEmail(userEmail);

    console.log('🔍 User email:', userEmail);
    console.log('🔍 Is admin:', isAdmin);

    // Get user profile from database
    let user = await userOperations.getProfile(userId);
    
    // If user not found by ID, try to find by email (for cases where user exists with different ID)
    if (!user && userEmail) {
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();
      
      if (userByEmail && !emailError) {
        user = userByEmail;
      }
    }
    
    console.log('🔍 User profile from database:', user);

    if (!user) {
      console.log('🔍 User not found in database');
      const response = {
        userId,
        userEmail,
        isAdmin,
        hasCompletedOnboarding: isAdmin,
        hasActiveSubscription: isAdmin,
        subscriptionStatus: isAdmin ? 'active' : 'inactive',
        subscriptionTier: isAdmin ? 'admin' : 'free',
        primaryNiche: isAdmin ? 'creator' : null,
        niches: isAdmin ? ['creator', 'coach', 'podcaster', 'freelancer'] : [],
        stripeCustomerId: null,
        timestamp: new Date().toISOString(),
        debug: {
          userFound: false,
          reason: 'User not found in database'
        }
      };
      return NextResponse.json(response);
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = isAdmin ? true : (user.onboarding_completed === true);
    
    // Check if user has active subscription (admins bypass this)
    // Include 'trialing' as an active status since Stripe uses this for free trials
    // Also allow users with niches to have access even if subscription is canceled (they paid for the niches)
    let hasActiveSubscription = isAdmin ? true : (
      user.subscription_status === 'active' || 
      user.subscription_status === 'trialing' ||
      user.subscription_status === 'past_due' || // Allow past_due as well for grace period
      (user.niches && user.niches.length > 0 && user.stripe_customer_id) // Users with niches who paid should have access
    );
    
    let subscriptionStatus = user.subscription_status || 'inactive';
    
    // Check Stripe directly for additional verification
    let stripeVerification = null;
    if (hasCompletedOnboarding && user.stripe_customer_id && !isAdmin) {
      try {
        console.log('🔍 Checking Stripe for customer:', user.stripe_customer_id);
        
        // Get customer's subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 1
        });
        
        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          stripeVerification = {
            subscriptionId: subscription.id,
            status: subscription.status,
            created: new Date(subscription.created * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
          };
          
          console.log('🔍 Stripe verification:', stripeVerification);
        } else {
          stripeVerification = {
            message: 'No subscriptions found in Stripe'
          };
        }
      } catch (stripeError) {
        stripeVerification = {
          error: stripeError.message
        };
        console.error('❌ Error checking Stripe:', stripeError);
      }
    }
    
    const primaryNiche = user.primary_niche || 'creator';
    const niches = isAdmin ? ['creator', 'coach', 'podcaster', 'freelancer'] : (user.niches || [primaryNiche]);

    const response = {
      userId,
      userEmail,
      isAdmin,
      hasCompletedOnboarding,
      hasActiveSubscription,
      subscriptionStatus: isAdmin ? 'active' : subscriptionStatus,
      subscriptionTier: isAdmin ? 'admin' : (user.subscription_tier || 'free'),
      primaryNiche,
      niches,
      stripeCustomerId: user.stripe_customer_id,
      timestamp: new Date().toISOString(),
      debug: {
        userFound: true,
        databaseUser: {
          id: user.id,
          email: user.email,
          onboarding_completed: user.onboarding_completed,
          subscription_status: user.subscription_status,
          subscription_tier: user.subscription_tier,
          primary_niche: user.primary_niche,
          niches: user.niches,
          stripe_customer_id: user.stripe_customer_id,
          updated_at: user.updated_at
        },
        stripeVerification,
        accessLogic: {
          hasNiches: user.niches && user.niches.length > 0,
          hasStripeCustomerId: !!user.stripe_customer_id,
          subscriptionActive: user.subscription_status === 'active' || 
                              user.subscription_status === 'trialing' ||
                              user.subscription_status === 'past_due',
          shouldHaveAccess: hasActiveSubscription
        }
      }
    };
    
    console.log('🔍 Debug response:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 