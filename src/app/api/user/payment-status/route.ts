import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { userOperations } from '@/lib/database'
import { isAdminEmail } from '@/lib/admin-config'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 400 }
      )
    }

    // Check if user is admin - try to get email from sessionClaims or from database
    let userEmail = sessionClaims?.email as string
    
    // If email is not in sessionClaims, try to get it from the database
    if (!userEmail) {
      console.log('🔧 Email not in sessionClaims, trying to get from database...');
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (userByEmail && !emailError) {
        userEmail = userByEmail.email;
        console.log('🔧 Found email in database:', userEmail);
      } else {
        console.log('🔧 Could not find email in database for userId:', userId, emailError);
        
        // Try to find any user with the email we know
        const knownEmail = 'stevenvitoratos@getbondlyapp.com';
        console.log('🔧 Trying to find user with known email:', knownEmail);
        const { data: userWithKnownEmail, error: knownEmailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', knownEmail)
          .single();
        
        if (userWithKnownEmail && !knownEmailError) {
          console.log('🔧 Found user with known email:', userWithKnownEmail.id);
          userEmail = knownEmail;
        } else {
          console.log('🔧 Could not find user with known email either:', knownEmailError);
        }
      }
    }
    
    const isAdmin = isAdminEmail(userEmail)
    
    console.log('🔧 Payment status check for:', userEmail, 'isAdmin:', isAdmin)

    // Get user profile from database
    let user = await userOperations.getProfile(userId)
    
    // If user not found by ID, try to find by email (for cases where user exists with different ID)
    if (!user && userEmail) {
      console.log('🔧 User not found by ID, trying to find by email:', userEmail);
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();
      
      if (userByEmail && !emailError) {
        console.log('🔧 Found user by email:', userByEmail);
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
      console.log('🔧 No user profile found, returning:', response)
      return NextResponse.json(response)
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = isAdmin ? true : (user.onboarding_completed === true)
    
    console.log('🔧 Onboarding status check:', {
      userId,
      isAdmin,
      onboarding_completed: user.onboarding_completed,
      hasCompletedOnboarding,
      userProfile: user
    })
    
    // Check if user has active subscription (admins bypass this)
    // Include 'trialing' as an active status since Stripe uses this for free trials
    let hasActiveSubscription = isAdmin ? true : (
      user.subscription_status === 'active' || 
      user.subscription_status === 'trialing' ||
      user.subscription_status === 'past_due' // Allow past_due as well for grace period
    )
    
    let subscriptionStatus = user.subscription_status || 'inactive'
    
    // Fallback: If user has completed onboarding but no active subscription and has a Stripe customer ID,
    // check Stripe directly to see if there's a subscription
    if (hasCompletedOnboarding && !hasActiveSubscription && user.stripe_customer_id && !isAdmin) {
      console.log('🔧 Fallback: Checking Stripe directly for customer:', user.stripe_customer_id);
      
      try {
        // Get customer's subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 1
        });
        
        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          console.log('🔧 Found subscription in Stripe:', subscription.status);
          
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
          
          console.log('✅ Updated database with correct subscription status:', subscription.status);
        } else {
          console.log('🔧 No active subscriptions found in Stripe for customer:', user.stripe_customer_id);
        }
      } catch (stripeError) {
        console.error('❌ Error checking Stripe subscriptions:', stripeError);
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
    
    console.log('🔧 User profile found, returning:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 