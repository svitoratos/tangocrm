const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

async function fixSubscriptionData() {
  try {
    console.log('🔧 Fixing subscription data inconsistencies...\n');

    // 1. Get all users from database
    console.log('1️⃣ Fetching users from database...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.log('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`✅ Found ${users.length} users in database\n`);

    let fixedCount = 0;

    // 2. Check and fix each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`${i + 1}. Checking user: ${user.email || 'No email'} (${user.id})`);
      
      let needsUpdate = false;
      const updates = {};

      // 3. Check if user has Stripe customer ID
      if (user.stripe_customer_id) {
        try {
          const customer = await stripe.customers.retrieve(user.stripe_customer_id);
          console.log(`   ✅ Stripe Customer: ${customer.email} (${customer.id})`);
          
          // 4. Check customer's subscriptions in Stripe
          const subscriptions = await stripe.subscriptions.list({
            customer: user.stripe_customer_id,
            limit: 10
          });

          const activeSubscriptions = subscriptions.data.filter(sub => 
            ['active', 'trialing', 'past_due'].includes(sub.status)
          );

          console.log(`   Stripe Subscriptions: ${subscriptions.data.length} total, ${activeSubscriptions.length} active`);

          // 5. Fix subscription status mismatch
          if (activeSubscriptions.length > 0) {
            // User has active subscription in Stripe
            const latestSubscription = activeSubscriptions[0];
            
            if (user.subscription_status !== 'active' || user.stripe_subscription_id !== latestSubscription.id) {
              console.log(`   🔧 Fixing: Setting subscription status to active`);
              updates.subscription_status = 'active';
              updates.stripe_subscription_id = latestSubscription.id;
              needsUpdate = true;
            }
          } else {
            // User has no active subscription in Stripe
            if (user.subscription_status === 'active' || user.stripe_subscription_id) {
              console.log(`   🔧 Fixing: Setting subscription status to inactive (no active Stripe subscription)`);
              updates.subscription_status = 'inactive';
              updates.stripe_subscription_id = null;
              needsUpdate = true;
            }
          }

        } catch (error) {
          console.log(`   ❌ Error with Stripe customer: ${error.message}`);
          
          // If customer doesn't exist in Stripe, clear the customer ID
          if (error.message.includes('No such customer')) {
            console.log(`   🔧 Fixing: Clearing invalid Stripe customer ID`);
            updates.stripe_customer_id = null;
            updates.stripe_subscription_id = null;
            updates.subscription_status = 'inactive';
            needsUpdate = true;
          }
        }
      } else {
        // 6. User has no Stripe customer ID but claims to have active subscription
        if (user.subscription_status === 'active' && !user.stripe_customer_id) {
          console.log(`   🔧 Fixing: User claims active subscription but no Stripe customer ID`);
          updates.subscription_status = 'inactive';
          updates.stripe_subscription_id = null;
          needsUpdate = true;
        }
      }

      // 7. Update user if needed
      if (needsUpdate) {
        try {
          updates.updated_at = new Date().toISOString();
          
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

          if (updateError) {
            console.log(`   ❌ Failed to update user: ${updateError.message}`);
          } else {
            console.log(`   ✅ Updated user successfully`);
            fixedCount++;
          }
        } catch (error) {
          console.log(`   ❌ Error updating user: ${error.message}`);
        }
      } else {
        console.log(`   ✅ User data is consistent`);
      }

      console.log('   ' + '─'.repeat(50));
    }

    // 8. Summary
    console.log('\n📊 Fix Summary:');
    console.log(`   Total users checked: ${users.length}`);
    console.log(`   Users fixed: ${fixedCount}`);
    console.log(`   Users already consistent: ${users.length - fixedCount}`);

    // 9. Final verification
    console.log('\n9️⃣ Running final verification...');
    const { data: finalUsers } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    const usersWithActiveStatus = finalUsers.filter(u => u.subscription_status === 'active');
    const usersWithCustomerId = finalUsers.filter(u => u.stripe_customer_id);
    const usersWithSubscriptionId = finalUsers.filter(u => u.stripe_subscription_id);

    console.log(`   Final counts:`);
    console.log(`   - Users with active status: ${usersWithActiveStatus.length}`);
    console.log(`   - Users with Stripe customer ID: ${usersWithCustomerId.length}`);
    console.log(`   - Users with Stripe subscription ID: ${usersWithSubscriptionId.length}`);

    console.log('\n🎉 Subscription data fix completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
if (require.main === module) {
  fixSubscriptionData();
}

module.exports = { fixSubscriptionData }; 