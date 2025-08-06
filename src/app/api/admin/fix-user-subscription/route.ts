import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userOperations } from '@/lib/database';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId, targetSubscriptionId } = body;

    // Get user profile from database
    const user = await userOperations.getProfile(targetUserId || userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('🔧 Fix - User data before fix:', {
      userId: user.id,
      email: user.email,
      stripe_customer_id: user.stripe_customer_id,
      stripe_subscription_id: user.stripe_subscription_id,
      subscription_status: user.subscription_status
    });

    let fixApplied = false;
    let fixDetails = '';

    // If specific subscription ID is provided, use it
    if (targetSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(targetSubscriptionId);
        
        // Update user profile with correct subscription data
        await userOperations.updateProfile(user.id, {
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
          updated_at: new Date().toISOString()
        });
        
        fixApplied = true;
        fixDetails = `Updated subscription ID to ${subscription.id} with status ${subscription.status}`;
        
        console.log('✅ Fix applied - Updated with specific subscription ID:', subscription.id);
      } catch (error) {
        console.error('❌ Error fixing with specific subscription ID:', error);
        return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 });
      }
    }
    // Otherwise, check Stripe for active subscriptions
    else if (user.stripe_customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 10
        });
        
        const activeSubscription = subscriptions.data.find(sub => 
          sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due'
        );
        
        if (activeSubscription) {
          // Update user profile with correct subscription data
          await userOperations.updateProfile(user.id, {
            stripe_subscription_id: activeSubscription.id,
            subscription_status: activeSubscription.status,
            updated_at: new Date().toISOString()
          });
          
          fixApplied = true;
          fixDetails = `Found active subscription ${activeSubscription.id} with status ${activeSubscription.status}`;
          
          console.log('✅ Fix applied - Updated with active subscription:', activeSubscription.id);
        } else {
          fixDetails = 'No active subscriptions found in Stripe';
          console.log('⚠️ No active subscriptions found for customer:', user.stripe_customer_id);
        }
      } catch (error) {
        console.error('❌ Error checking Stripe subscriptions:', error);
        return NextResponse.json({ error: 'Failed to check Stripe subscriptions' }, { status: 500 });
      }
    }

    // Get updated user data
    const updatedUser = await userOperations.getProfile(user.id);
    
    console.log('🔧 Fix - User data after fix:', {
      userId: updatedUser?.id,
      email: updatedUser?.email,
      stripe_customer_id: updatedUser?.stripe_customer_id,
      stripe_subscription_id: updatedUser?.stripe_subscription_id,
      subscription_status: updatedUser?.subscription_status
    });

    return NextResponse.json({
      success: true,
      fixApplied,
      fixDetails,
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        stripe_customer_id: updatedUser?.stripe_customer_id,
        stripe_subscription_id: updatedUser?.stripe_subscription_id,
        subscription_status: updatedUser?.subscription_status,
        onboarding_completed: updatedUser?.onboarding_completed,
        niches: updatedUser?.niches
      }
    });

  } catch (error) {
    console.error('Error fixing user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fix user subscription' },
      { status: 500 }
    );
  }
} 