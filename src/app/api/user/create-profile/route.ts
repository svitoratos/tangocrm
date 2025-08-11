import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, niche = 'creator' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('🔧 Creating user profile for:', { userId, email, niche });

    // Check if user profile already exists
    const existingProfile = await userOperations.getProfile(userId);
    if (existingProfile) {
      console.log('✅ User profile already exists:', existingProfile.id);
      return NextResponse.json({ 
        success: true, 
        profile: existingProfile,
        message: 'Profile already exists'
      });
    }

    // Create new user profile
    const newProfile = await userOperations.upsertProfile(userId, {
      id: userId,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      onboarding_completed: false,
      subscription_status: 'inactive',
      subscription_tier: 'none',
      primary_niche: niche,
      niches: [niche]
    });

    if (!newProfile) {
      console.error('❌ Failed to create user profile');
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    console.log('✅ User profile created successfully:', newProfile.id);
    
    return NextResponse.json({ 
      success: true, 
      profile: newProfile,
      message: 'Profile created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    return NextResponse.json({ 
      error: 'Failed to create user profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
