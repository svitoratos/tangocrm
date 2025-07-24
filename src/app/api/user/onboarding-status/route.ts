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
        primaryNiche: null,
        niches: []
      })
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = user.onboarding_completed === true
    const primaryNiche = user.primary_niche || 'creator'
    const niches = user.niches || [primaryNiche]

    return NextResponse.json({
      hasCompletedOnboarding,
      primaryNiche,
      niches
    })
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { onboardingCompleted, primaryNiche, niches } = body

    // Update user profile with onboarding status
    const updatedUser = await userOperations.upsertProfile(userId, {
      onboarding_completed: onboardingCompleted,
      primary_niche: primaryNiche,
      niches: niches,
      updated_at: new Date().toISOString()
    })

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
