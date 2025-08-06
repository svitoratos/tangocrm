import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
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
    console.log('🔧 Onboarding status POST request received');
    
    const { userId } = await auth()
    console.log('🔧 User ID from auth:', userId);
    
    if (!userId) {
      console.error('❌ No user ID found in auth');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await currentUser()
    console.log('🔧 Current user:', user?.emailAddresses?.[0]?.emailAddress);
    
    const body = await request.json()
    console.log('🔧 Request body:', body);
    
    const { onboardingCompleted, primaryNiche, niches, isUpgrade } = body

    console.log('🔧 Updating onboarding status:', {
      userId,
      onboardingCompleted,
      primaryNiche,
      niches,
      isUpgrade
    })

    // Validate required fields
    if (onboardingCompleted === undefined || !primaryNiche || !niches) {
      console.error('❌ Missing required fields:', { onboardingCompleted, primaryNiche, niches });
      return NextResponse.json(
        { error: 'Missing required fields: onboardingCompleted, primaryNiche, niches' },
        { status: 400 }
      )
    }

    // Get current user profile to handle niche upgrades properly
    const currentProfile = await userOperations.getProfile(userId);
    let updatedNiches = niches;
    
    if (isUpgrade && currentProfile) {
      // For niche upgrades, append the new niche to existing niches
      const existingNiches = currentProfile.niches || [];
      const newNiches = Array.isArray(niches) ? niches : [niches];
      
      // Merge existing and new niches, removing duplicates
      updatedNiches = [...new Set([...existingNiches, ...newNiches])];
      
      console.log('🔧 Niche upgrade - merging niches:', {
        existing: existingNiches,
        new: newNiches,
        merged: updatedNiches
      });
    }

    // Update user profile with onboarding status
    console.log('🔧 Calling userOperations.upsertProfile...');
    const updatedUser = await userOperations.upsertProfile(userId, {
      email: user?.emailAddresses[0]?.emailAddress || '',
      onboarding_completed: onboardingCompleted,
      primary_niche: primaryNiche,
      niches: updatedNiches,
      updated_at: new Date().toISOString()
    })

    console.log('🔧 Updated user profile result:', updatedUser);

    if (!updatedUser) {
      console.error('❌ userOperations.upsertProfile returned null');
      return NextResponse.json(
        { error: 'Failed to update user profile. Please check your database connection.' },
        { status: 500 }
      )
    }

    console.log('✅ Onboarding status updated successfully');
    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('❌ Error updating onboarding status:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
