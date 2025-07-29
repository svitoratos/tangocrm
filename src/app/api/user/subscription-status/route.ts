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
    const { subscriptionStatus, subscriptionTier } = body;

    console.log('🔧 Manually updating subscription status for user:', userId);
    console.log('🔧 New status:', subscriptionStatus);
    console.log('🔧 New tier:', subscriptionTier);

    // Update the user's subscription status
    const updatedUser = await userOperations.updateProfile(userId, {
      subscription_status: subscriptionStatus,
      subscription_tier: subscriptionTier,
      updated_at: new Date().toISOString()
    });

    console.log('✅ Successfully updated subscription status:', updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Subscription status updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Error updating subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription status' },
      { status: 500 }
    );
  }
} 