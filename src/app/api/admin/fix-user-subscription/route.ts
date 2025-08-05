import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isAdminEmail } from '@/lib/admin-config';
import { userOperations } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userEmail = sessionClaims?.email as string;
    const isAdmin = isAdminEmail(userEmail);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetUserId, subscriptionId } = body;

    if (!targetUserId || !subscriptionId) {
      return NextResponse.json(
        { error: 'Missing targetUserId or subscriptionId' },
        { status: 400 }
      );
    }

    console.log(`🔧 Admin fixing subscription for user ${targetUserId} with subscription ${subscriptionId}`);

    try {
      // Verify the subscription exists in Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      console.log(`✅ Found subscription in Stripe:`, {
        id: subscription.id,
        status: subscription.status,
        customer: subscription.customer
      });

      // Update the user's subscription ID in the database
      const updatedUser = await userOperations.updateProfile(targetUserId, {
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        updated_at: new Date().toISOString()
      });

      console.log(`✅ Updated user ${targetUserId} with subscription ${subscription.id}`);

      return NextResponse.json({
        success: true,
        message: 'Subscription ID updated successfully',
        user: updatedUser,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          customer: subscription.customer
        }
      });

    } catch (stripeError) {
      console.error('❌ Error retrieving subscription from Stripe:', stripeError);
      return NextResponse.json(
        { error: 'Subscription not found in Stripe' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('❌ Error in fix-user-subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 