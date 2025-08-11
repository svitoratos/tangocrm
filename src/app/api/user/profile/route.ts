import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    console.log('🔧 Profile API GET called for userId:', userId);
    
    if (!userId) {
      console.log('❌ No userId found - user not authenticated');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const user = await userOperations.getProfile(userId);
    
    console.log('🔧 User profile from database:', {
      userId,
      hasProfile: !!user,
      email: user?.email,
      fullName: user?.full_name,
      timezone: user?.timezone
    });
    
    if (!user) {
      console.log('❌ No user profile found in database');
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    console.log('✅ Profile fetched successfully for user:', userId);
    return NextResponse.json(user);
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    console.log('🔧 Profile API PUT called for userId:', userId);
    
    if (!userId) {
      console.log('❌ No userId found - user not authenticated');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('🔧 Profile update request body:', body);

    // Validate required fields
    const allowedFields = [
      'full_name',
      'email',
      'avatar_url',
      'timezone',
      'primary_niche',
      'niches',
      'onboarding_completed',
      'subscription_status',
      'subscription_tier'
    ];

    // Filter out any fields that aren't allowed
    const validUpdates: any = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        validUpdates[key] = value;
      }
    }

    // Add updated_at timestamp
    validUpdates.updated_at = new Date().toISOString();

    console.log('🔧 Valid profile updates:', validUpdates);

    // Update user profile in database
    const updatedUser = await userOperations.updateProfile(userId, validUpdates);
    
    if (!updatedUser) {
      console.log('❌ Failed to update user profile');
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    console.log('✅ Profile updated successfully for user:', userId);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update user profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 