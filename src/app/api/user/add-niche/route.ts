import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { userOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user info from Clerk using clerkClient (correct approach for API routes)
    let userEmail: string;
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      userEmail = user.emailAddresses?.[0]?.emailAddress || '';
    } catch (clerkError) {
      console.error('❌ Error fetching user from Clerk:', clerkError);
      userEmail = 'unknown@email.com'; // Fallback for logging
    }

    const body = await request.json();
    const { nicheToAdd } = body;

    if (!nicheToAdd) {
      return NextResponse.json({ error: 'Niche to add is required' }, { status: 400 });
    }

    console.log('🔧 Adding niche(s) to user profile:', {
      userId,
      nicheToAdd,
      userEmail
    });

    // Get current user profile
    const currentProfile = await userOperations.getProfile(userId);
    
    if (!currentProfile) {
      console.error('❌ User profile not found for userId:', userId);
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    console.log('🔧 Current user profile:', {
      id: currentProfile.id,
      email: currentProfile.email,
      existingNiches: currentProfile.niches,
      subscriptionStatus: currentProfile.subscription_status,
      stripeCustomerId: currentProfile.stripe_customer_id
    });

    // Handle multiple niches (comma-separated)
    const nichesToAdd = nicheToAdd.includes(',') 
      ? nicheToAdd.split(',').map((n: string) => n.trim()).filter((n: string) => n)
      : [nicheToAdd];

    // Get existing niches and add the new ones
    const existingNiches = currentProfile.niches || [];
    const updatedNiches = [...new Set([...existingNiches, ...nichesToAdd])];

    console.log('🔧 Updating niches:', {
      existing: existingNiches,
      new: nichesToAdd,
      updated: updatedNiches
    });

    // Update user profile with new niche
    const updatedUser = await userOperations.updateProfile(userId, {
      niches: updatedNiches,
      updated_at: new Date().toISOString()
    });

    if (!updatedUser) {
      console.error('❌ Failed to update user profile - updateProfile returned null');
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    console.log('✅ Successfully added niche(s) to user profile:', {
      userId: updatedUser.id,
      email: updatedUser.email,
      niches: updatedUser.niches,
      subscriptionStatus: updatedUser.subscription_status
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ${nichesToAdd.length > 1 ? 'niches' : 'niche'}: ${nichesToAdd.join(', ')}`,
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Error adding niche to user profile:', error);
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json(
      { error: 'Failed to add niche to user profile' },
      { status: 500 }
    );
  }
} 