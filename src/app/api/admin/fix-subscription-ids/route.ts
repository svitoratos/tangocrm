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

    console.log('🔧 Admin fixing subscription IDs...');

    // Get all users with stripe_customer_id but missing stripe_subscription_id
    const { data: users, error } = await supabase
      .from('users')
      .select('id, stripe_customer_id, stripe_subscription_id, subscription_status')
      .not('stripe_customer_id', 'is', null)
      .or('stripe_subscription_id.is.null,stripe_subscription_id.eq.');

    if (error) {
      console.error('❌ Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    const results = {
      processed: 0,
      updated: 0,
      errors: 0,
      details: [] as any[]
    };

    for (const user of users || []) {
      try {
        results.processed++;
        
        if (!user.stripe_customer_id) {
          results.details.push({
            userId: user.id,
            status: 'skipped',
            reason: 'No stripe_customer_id'
          });
          continue;
        }

        console.log(`🔧 Checking customer ${user.stripe_customer_id} for user ${user.id}`);

        // Get customer's subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 1
        });

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          
          // Update user with subscription ID and status
          await userOperations.updateProfile(user.id, {
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            updated_at: new Date().toISOString()
          });

          results.updated++;
          results.details.push({
            userId: user.id,
            status: 'updated',
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status
          });

          console.log(`✅ Updated user ${user.id} with subscription ${subscription.id}`);
        } else {
          // No subscriptions found, clear subscription ID
          await userOperations.updateProfile(user.id, {
            stripe_subscription_id: null,
            subscription_status: 'inactive',
            updated_at: new Date().toISOString()
          });

          results.updated++;
          results.details.push({
            userId: user.id,
            status: 'cleared',
            reason: 'No subscriptions found in Stripe'
          });

          console.log(`✅ Cleared subscription ID for user ${user.id} (no subscriptions found)`);
        }
      } catch (error) {
        results.errors++;
        results.details.push({
          userId: user.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`❌ Error processing user ${user.id}:`, error);
      }
    }

    console.log('✅ Subscription ID fix completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Subscription IDs fixed successfully',
      results
    });

  } catch (error) {
    console.error('❌ Error in fix-subscription-ids:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 