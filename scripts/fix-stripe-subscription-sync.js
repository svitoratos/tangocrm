#!/usr/bin/env node

/**
 * Stripe Subscription Sync Fix Script
 * 
 * This script fixes subscription data sync issues between Stripe and your database.
 * It handles common problems like:
 * - Missing stripe_subscription_id in user records
 * - Outdated subscription_status values
 * - Customer portal not showing active subscriptions
 * 
 * Usage: node scripts/fix-stripe-subscription-sync.js
 */

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixStripeSubscriptionSync() {
  console.log('🔧 Starting Stripe subscription sync fix...\n');

  try {
    // Step 1: Get all users with Stripe customer IDs
    console.log('📋 Fetching users with Stripe customer IDs...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id, stripe_subscription_id, subscription_status')
      .not('stripe_customer_id', 'is', null);

    if (usersError) {
      throw new Error(`Database error: ${usersError.message}`);
    }

    console.log(`✅ Found ${users.length} users with Stripe customer IDs\n`);

    let fixedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Step 2: Process each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`🔧 Processing user ${i + 1}/${users.length}: ${user.email} (${user.id})`);

      try {
        // Get customer's subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 10
        });

        if (subscriptions.data.length === 0) {
          console.log(`   ⚠️  No subscriptions found in Stripe`);
          
          // Clear subscription data if no subscriptions exist
          if (user.stripe_subscription_id || user.subscription_status !== 'inactive') {
            await supabase
              .from('users')
              .update({
                stripe_subscription_id: null,
                subscription_status: 'inactive',
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
            
            console.log(`   ✅ Cleared subscription data`);
            fixedCount++;
          } else {
            console.log(`   ➡️  Already correct - no action needed`);
            skippedCount++;
          }
          continue;
        }

        // Find the most relevant subscription (active, trialing, or most recent)
        const activeSubscription = subscriptions.data.find(sub => 
          sub.status === 'active' || sub.status === 'trialing'
        ) || subscriptions.data[0]; // Fallback to most recent

        console.log(`   📊 Found subscription: ${activeSubscription.id} (${activeSubscription.status})`);

        // Check if update is needed
        const needsUpdate = 
          user.stripe_subscription_id !== activeSubscription.id ||
          user.subscription_status !== activeSubscription.status;

        if (needsUpdate) {
          // Update user record
          const { error: updateError } = await supabase
            .from('users')
            .update({
              stripe_subscription_id: activeSubscription.id,
              subscription_status: activeSubscription.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (updateError) {
            throw new Error(`Update failed: ${updateError.message}`);
          }

          console.log(`   ✅ Updated: ${user.subscription_status} → ${activeSubscription.status}`);
          fixedCount++;
        } else {
          console.log(`   ➡️  Already up to date`);
          skippedCount++;
        }

        // Add small delay to avoid rate limiting
        if (i % 10 === 0 && i > 0) {
          console.log(`   ⏳ Processed ${i} users, taking a short break...\n`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`   ❌ Error processing user: ${error.message}`);
        errorCount++;
      }
    }

    // Step 3: Summary
    console.log('\n🎉 Sync fix completed!');
    console.log('📊 Summary:');
    console.log(`   ✅ Fixed: ${fixedCount} users`);
    console.log(`   ➡️  Skipped (already correct): ${skippedCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);

    // Step 4: Verify some random users
    console.log('\n🔍 Verification check...');
    const sampleUsers = users.slice(0, Math.min(5, users.length));
    
    for (const user of sampleUsers) {
      const { data: updatedUser } = await supabase
        .from('users')
        .select('stripe_customer_id, stripe_subscription_id, subscription_status')
        .eq('id', user.id)
        .single();

      if (updatedUser.stripe_subscription_id) {
        try {
          const subscription = await stripe.subscriptions.retrieve(updatedUser.stripe_subscription_id);
          const statusMatch = updatedUser.subscription_status === subscription.status;
          console.log(`   ${statusMatch ? '✅' : '❌'} ${user.email}: DB=${updatedUser.subscription_status}, Stripe=${subscription.status}`);
        } catch (verifyError) {
          console.log(`   ❌ ${user.email}: Subscription not found in Stripe`);
        }
      } else {
        console.log(`   ➡️  ${user.email}: No subscription (correct)`);
      }
    }

    console.log('\n🚀 All done! Customer portals should now display subscriptions correctly.');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the fix
if (require.main === module) {
  fixStripeSubscriptionSync()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixStripeSubscriptionSync };