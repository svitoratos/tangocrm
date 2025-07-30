import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userOperations } from '@/lib/database';
import { stripe } from '@/lib/stripe';

// Lazy initialization of Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const { createClient } = require('@supabase/supabase-js');
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reason, customReason, improvement, comeback } = body;

    // Validate required fields
    if (!reason) {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    // Get user profile to access subscription info
    const user = await userOperations.getProfile(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let subscriptionCanceled = false;
    let subscriptionEndDate = null;

    // Cancel Stripe subscription if exists
    if (user.stripe_subscription_id && stripe) {
      try {
        const subscription = await stripe.subscriptions.update(
          user.stripe_subscription_id,
          {
            cancel_at_period_end: true,
          }
        );
        
        subscriptionCanceled = true;
        subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
        
        console.log('✅ Stripe subscription marked for cancellation:', subscription.id);
      } catch (stripeError) {
        console.error('❌ Error canceling Stripe subscription:', stripeError);
        // Continue with the process even if Stripe fails
      }
    }

    // Update user subscription status
    const updatedUser = await userOperations.updateProfile(userId, {
      subscription_status: subscriptionCanceled ? 'canceled' : 'inactive',
      updated_at: new Date().toISOString(),
    });

    // Store cancellation feedback
    const supabase = getSupabaseClient();
    const feedbackData = {
      user_id: userId,
      reason,
      custom_reason: customReason || null,
      improvement_suggestion: improvement || null,
      would_comeback: comeback || null,
      subscription_end_date: subscriptionEndDate,
      created_at: new Date().toISOString(),
    };

    const { error: feedbackError } = await supabase
      .from('cancellation_feedback')
      .insert([feedbackData]);

    if (feedbackError) {
      console.error('❌ Error storing cancellation feedback:', feedbackError);
      // Don't fail the entire operation if feedback storage fails
    } else {
      console.log('✅ Cancellation feedback stored successfully');
    }

    // Log cancellation for analytics
    console.log('📊 Subscription Cancellation:', {
      userId,
      reason,
      hasCustomReason: !!customReason,
      hasImprovement: !!improvement,
      comeback,
      subscriptionId: user.stripe_subscription_id,
      endDate: subscriptionEndDate,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
      subscriptionEndDate,
      user: updatedUser,
    });

  } catch (error) {
    console.error('❌ Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}