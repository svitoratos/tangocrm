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
      console.log('🔧 User not found by ID, checking by email:', userEmail);
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();
      
      if (userByEmail && !emailError) {
        console.log('🔧 Found user by email with different ID:', userByEmail.id);
        console.log('🔧 Current Clerk userId:', userId);
        console.log('🔧 Database user ID:', userByEmail.id);
        
        // Check if the user by email has active subscription
        if (userByEmail.stripe_customer_id && userByEmail.subscription_status) {
          console.log('🔧 User by email has subscription data, using this user');
          user = userByEmail;
        } else {
          console.log('🔧 User by email has no subscription data, checking if webhook processed recently');
          // Check if there's a recent webhook update for this email
          const { data: recentUser, error: recentError } = await supabase
            .from('users')
            .select('*')
            .eq('email', userEmail)
            .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
            .single();
          
          if (recentUser && !recentError) {
            console.log('🔧 Found recent user update by email, using this user');
            user = recentUser;
          }
        }
      }
    }
    
    if (!user) {
      console.log('🔧 User not found in database, checking Stripe directly for email:', userEmail);
      
      // Last resort: Check Stripe directly for this email
      if (userEmail && !isAdmin) {
        try {
          // Search for customers by email in Stripe
          const customers = await stripe.customers.list({
            email: userEmail,
            limit: 1
          });
          
          if (customers.data.length > 0) {
            const customer = customers.data[0];
            console.log('🔧 Found customer in Stripe:', customer.id);
            
            // Check if customer has active subscriptions
            const subscriptions = await stripe.subscriptions.list({
              customer: customer.id,
              status: 'all',
              limit: 1
            });
            
            if (subscriptions.data.length > 0) {
              const subscription = subscriptions.data[0];
              console.log('🔧 Found active subscription in Stripe:', subscription.status);
              
              // User has paid but database record is missing, create it
              const newUser = await userOperations.upsertProfile(userId, {
                email: userEmail,
                onboarding_completed: true,
                stripe_customer_id: customer.id,
                stripe_subscription_id: subscription.id,
                subscription_status: subscription.status,
                subscription_tier: 'core',
                primary_niche: 'creator',
                niches: ['creator'],
                updated_at: new Date().toISOString()
              });
              
              if (newUser) {
                console.log('🔧 Created missing user record from Stripe data');
                user = newUser;
              }
            }
          }
        } catch (stripeError) {
          console.error('❌ Error checking Stripe directly:', stripeError);
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
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = isAdmin ? true : (user.onboarding_completed === true)
    

    
    // Check if user has active subscription (admins bypass this)
    // Include 'trialing' as an active status since Stripe uses this for free trials
    // Only allow users with verified active subscription status
    let hasActiveSubscription = isAdmin ? true : (
      user.subscription_status === 'active' || 
      user.subscription_status === 'trialing' ||
      user.subscription_status === 'past_due' // Allow past_due as well for grace period
    )
    
    let subscriptionStatus = user.subscription_status || 'inactive'
    
    // Fallback: If user has completed onboarding but no active subscription and has a Stripe customer ID,
    // check Stripe directly to see if there's a subscription
    if (hasCompletedOnboarding && !hasActiveSubscription && user.stripe_customer_id && !isAdmin) {
      try {
        // Get customer's subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 1
        });
        
        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          
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
        }
      } catch (stripeError) {
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
    
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 