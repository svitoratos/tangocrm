import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { userOperations } from '@/lib/database'
import { isAdminEmail } from '@/lib/admin-config'

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userEmail = sessionClaims?.email as string
    const isAdmin = isAdminEmail(userEmail)
    
    console.log('🔧 Payment status check for:', userEmail, 'isAdmin:', isAdmin)

    // Get user profile from database
    const user = await userOperations.getProfile(userId)
    
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
    const hasActiveSubscription = isAdmin ? true : (user.subscription_status === 'active' || 
                                 user.subscription_status === 'trialing')
    
    const primaryNiche = user.primary_niche || 'creator'
    const niches = isAdmin ? ['creator', 'coach', 'podcaster', 'freelancer'] : (user.niches || [primaryNiche])

    const response = {
      hasCompletedOnboarding,
      hasActiveSubscription,
      subscriptionStatus: isAdmin ? 'active' : (user.subscription_status || 'inactive'),
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