import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { userOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nicheToAdd } = body;

    if (!nicheToAdd) {
      return NextResponse.json({ error: 'Niche to add is required' }, { status: 400 });
    }

    console.log('🔧 Adding niche to user profile:', {
      userId,
      nicheToAdd
    });

    // Get current user profile
    const currentProfile = await userOperations.getProfile(userId);
    
    if (!currentProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get existing niches and add the new one
    const existingNiches = currentProfile.niches || [];
    const updatedNiches = [...new Set([...existingNiches, nicheToAdd])];

    console.log('🔧 Updating niches:', {
      existing: existingNiches,
      new: nicheToAdd,
      updated: updatedNiches
    });

    // Update user profile with new niche
    const updatedUser = await userOperations.updateProfile(userId, {
      niches: updatedNiches,
      updated_at: new Date().toISOString()
    });

    console.log('✅ Successfully added niche to user profile:', updatedUser);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${nicheToAdd} niche`,
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Error adding niche to user profile:', error);
    return NextResponse.json(
      { error: 'Failed to add niche to user profile' },
      { status: 500 }
    );
  }
} 