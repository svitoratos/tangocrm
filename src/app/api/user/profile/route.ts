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
    console.log('🔧 Request body type:', typeof body);
    console.log('🔧 Request body keys:', Object.keys(body));

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
        // CRITICAL SAFEGUARD: Prevent saving placeholder emails
        if (key === 'email' && value && typeof value === 'string') {
          if (value.includes('@placeholder.tango')) {
            console.warn('⚠️ Attempted to save placeholder email, skipping email update:', value);
            continue; // Skip this field
          }
        }
        
        validUpdates[key] = value;
        console.log(`🔧 Field ${key}:`, value, `(type: ${typeof value})`);
      } else {
        console.log(`⚠️ Skipping disallowed field ${key}:`, value);
      }
    }

    // Add updated_at timestamp
    validUpdates.updated_at = new Date().toISOString();

    console.log('🔧 Valid profile updates:', validUpdates);
    console.log('🔧 Number of fields to update:', Object.keys(validUpdates).length);

    // Check if user profile exists before updating
    const existingProfile = await userOperations.getProfile(userId);
    console.log('🔧 Existing profile check:', {
      exists: !!existingProfile,
      profileId: existingProfile?.id,
      profileEmail: existingProfile?.email
    });

    if (!existingProfile) {
      console.log('❌ User profile does not exist, cannot update');
      return NextResponse.json(
        { error: 'User profile not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    // CRITICAL SAFEGUARD: Always use email from Clerk, never from request body
    if (validUpdates.email) {
      console.log('⚠️ Email update attempted, but email should come from Clerk, not request body');
      console.log('⚠️ Skipping email update to prevent placeholder emails');
      delete validUpdates.email; // Remove email from updates
    }
    
    // CRITICAL SAFEGUARD: Preserve user's original email from Clerk
    if (existingProfile.email) {
      console.log('🔒 Preserving user\'s original email:', existingProfile.email);
      // The email will remain unchanged in the database
    }

    // Update user profile in database
    console.log('🔧 Calling userOperations.updateProfile...');
    const updatedUser = await userOperations.updateProfile(userId, validUpdates);
    
    if (!updatedUser) {
      console.log('❌ Failed to update user profile - updateProfile returned null');
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