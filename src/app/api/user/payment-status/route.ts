import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { userOperations } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile from database
    const user = await userOperations.getProfile(userId)
    
    if (!user) {
      // User doesn't exist in database yet, hasn't completed onboarding
      return NextResponse.json({
        hasCompletedOnboarding: false,
        hasActiveSubscription: false,
        subscriptionStatus: 'inactive',
        subscriptionTier: 'free',
        primaryNiche: null,
        niches: []
      })
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = user.onboarding_completed === true
    
    // Check if user has active subscription
    const hasActiveSubscription = user.subscription_status === 'active' || 
                                 user.subscription_status === 'trialing'
    
    const primaryNiche = user.primary_niche || 'creator'
    const niches = user.niches || [primaryNiche]

    return NextResponse.json({
      hasCompletedOnboarding,
      hasActiveSubscription,
      subscriptionStatus: user.subscription_status || 'inactive',
      subscriptionTier: user.subscription_tier || 'free',
      primaryNiche,
      niches,
      stripeCustomerId: user.stripe_customer_id
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 