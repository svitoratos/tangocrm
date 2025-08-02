import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { userOperations } from '@/lib/database'
import { isAdminEmail } from '@/lib/admin-config'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 400 }
      )
    }

    console.log('🔧 Force refresh payment status requested for user:', userId);

    // Check if user is admin - try to get email from sessionClaims or from database
    let userEmail = sessionClaims?.email as string
    
    // If email is not in sessionClaims, try to get it from the database
    if (!userEmail) {
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (userByEmail && !emailError) {
        userEmail = userByEmail.email;
      } else {
        // Try to find any user with the email we know
        const knownEmail = 'stevenvitoratos@getbondlyapp.com';
        const { data: userWithKnownEmail, error: knownEmailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', knownEmail)
          .single();
        
        if (userWithKnownEmail && !knownEmailError) {
          userEmail = knownEmail;
        }
      }
    }
    
    const isAdmin = isAdminEmail(userEmail)

    // Get user profile from database
    let user = await userOperations.getProfile(userId)
    
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
    
    if (!user) {
      // User doesn't exist in database yet, hasn't completed onboarding
      const response = {
        hasCompletedOnboarding: isAdmin, // Admins bypass onboarding
        hasActiveSubscription: isAdmin, // Admins bypass subscription requirement
        subscriptionStatus: isAdmin ? 'active' : 'inactive',
        subscriptionTier: isAdmin ? 'admin' : 'free',
        primaryNiche: isAdmin ? 'creator' : null,
        niches: isAdmin ? ['creator', 'coach', 'podcaster', 'freelancer'] : [] // Admins get all niches
      }
      return NextResponse.json(response)
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = isAdmin ? true : (user.onboarding_completed === true)
    
    // Check if user has active subscription (admins bypass this)
    // Include 'trialing' as an active status since Stripe uses this for free trials
    // Also allow users with niches to have access even if subscription is canceled (they paid for the niches)
    let hasActiveSubscription = isAdmin ? true : (
      user.subscription_status === 'active' || 
      user.subscription_status === 'trialing' ||
      user.subscription_status === 'past_due' || // Allow past_due as well for grace period
      (user.niches && user.niches.length > 0 && user.stripe_customer_id) // Users with niches who paid should have access
    )
    
    let subscriptionStatus = user.subscription_status || 'inactive'
    
    // Force check Stripe directly to ensure we have the latest data
    if (hasCompletedOnboarding && user.stripe_customer_id && !isAdmin) {
      try {
        console.log('🔧 Force checking Stripe for customer:', user.stripe_customer_id);
        
        // Get customer's subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 1
        });
        
        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          console.log('🔧 Found Stripe subscription:', subscription.status);
          
          // Update database with correct subscription status
          await userOperations.updateProfile(userId, {
            subscription_status: subscription.status,
            updated_at: new Date().toISOString()
          });
          
          // Update local variables
          subscriptionStatus = subscription.status;
          hasActiveSubscription = subscription.status === 'active' || 
                                 subscription.status === 'trialing' || 
                                 subscription.status === 'past_due';
          
          console.log('✅ Updated subscription status from Stripe:', subscription.status);
        } else {
          console.log('🔧 No active Stripe subscriptions found');
        }
      } catch (stripeError) {
        console.error('❌ Error checking Stripe:', stripeError);
        // Continue with database values if Stripe check fails
      }
    }
    
    const primaryNiche = user.primary_niche || 'creator'
    const niches = isAdmin ? ['creator', 'coach', 'podcaster', 'freelancer'] : (user.niches || [primaryNiche])

    const response = {
      hasCompletedOnboarding,
      hasActiveSubscription,
      subscriptionStatus: isAdmin ? 'active' : subscriptionStatus,
      subscriptionTier: isAdmin ? 'admin' : (user.subscription_tier || 'free'),
      primaryNiche,
      niches,
      stripeCustomerId: user.stripe_customer_id
    }
    
    console.log('✅ Force refresh completed:', response);
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Force refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 