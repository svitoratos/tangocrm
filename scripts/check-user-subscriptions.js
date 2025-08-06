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

async function checkUserSubscriptions() {
  try {
    console.log('🔧 Checking user subscriptions...\n');

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

    // 2. Check each user's subscription status
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`${i + 1}. User: ${user.email || 'No email'} (${user.id})`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log(`   Stripe Customer ID: ${user.stripe_customer_id || 'None'}`);
      console.log(`   Stripe Subscription ID: ${user.stripe_subscription_id || 'None'}`);
      console.log(`   Subscription Status: ${user.subscription_status || 'None'}`);
      console.log(`   Subscription Tier: ${user.subscription_tier || 'None'}`);
      console.log(`   Onboarding Completed: ${user.onboarding_completed || false}`);

      // 3. Check if user has Stripe customer
      if (user.stripe_customer_id) {
        try {
          const customer = await stripe.customers.retrieve(user.stripe_customer_id);
          console.log(`   ✅ Stripe Customer: ${customer.email} (${customer.id})`);
          console.log(`   Customer Created: ${new Date(customer.created * 1000).toLocaleDateString()}`);
          
          // 4. Check customer's subscriptions in Stripe
          const subscriptions = await stripe.subscriptions.list({
            customer: user.stripe_customer_id,
            limit: 10
          });

          console.log(`   Stripe Subscriptions: ${subscriptions.data.length}`);
          subscriptions.data.forEach(sub => {
            console.log(`     - ${sub.id} (${sub.status}) - Created: ${new Date(sub.created * 1000).toLocaleDateString()}`);
          });

          // 5. Check for mismatches
          const activeStripeSubs = subscriptions.data.filter(sub => 
            ['active', 'trialing', 'past_due'].includes(sub.status)
          );

          if (activeStripeSubs.length > 0 && user.subscription_status !== 'active') {
            console.log(`   ⚠️  MISMATCH: User has active Stripe subscription but DB shows: ${user.subscription_status}`);
          }

          if (activeStripeSubs.length === 0 && user.subscription_status === 'active') {
            console.log(`   ⚠️  MISMATCH: User has no active Stripe subscription but DB shows: active`);
          }

        } catch (error) {
          console.log(`   ❌ Error fetching Stripe customer: ${error.message}`);
        }
      } else {
        console.log(`   ⚠️  No Stripe customer ID found`);
      }

      // 6. Check if user has subscription ID but no customer ID
      if (user.stripe_subscription_id && !user.stripe_customer_id) {
        console.log(`   ⚠️  INCONSISTENT: Has subscription ID but no customer ID`);
      }

      console.log('   ' + '─'.repeat(50));
    }

    // 7. Summary
    console.log('\n📊 Summary:');
    const usersWithCustomerId = users.filter(u => u.stripe_customer_id);
    const usersWithSubscriptionId = users.filter(u => u.stripe_subscription_id);
    const usersWithActiveStatus = users.filter(u => u.subscription_status === 'active');
    const usersWithCompletedOnboarding = users.filter(u => u.onboarding_completed);

    console.log(`   Total users: ${users.length}`);
    console.log(`   Users with Stripe customer ID: ${usersWithCustomerId.length}`);
    console.log(`   Users with Stripe subscription ID: ${usersWithSubscriptionId.length}`);
    console.log(`   Users with active subscription status: ${usersWithActiveStatus.length}`);
    console.log(`   Users with completed onboarding: ${usersWithCompletedOnboarding.length}`);

    // 8. Check Stripe customers that don't exist in our database
    console.log('\n8️⃣ Checking for orphaned Stripe customers...');
    const { data: stripeCustomers } = await stripe.customers.list({ limit: 20 });
    
    if (stripeCustomers && stripeCustomers.data) {
      const orphanedCustomers = stripeCustomers.data.filter(stripeCustomer => {
        return !users.some(user => user.stripe_customer_id === stripeCustomer.id);
      });

      if (orphanedCustomers.length > 0) {
        console.log(`⚠️  Found ${orphanedCustomers.length} Stripe customers not in database:`);
        orphanedCustomers.forEach(customer => {
          console.log(`   - ${customer.email} (${customer.id})`);
        });
      } else {
        console.log('✅ All Stripe customers are in database');
      }
    } else {
      console.log('⚠️  Could not fetch Stripe customers');
    }

    console.log('\n🎉 User subscription check completed!');

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
if (require.main === module) {
  checkUserSubscriptions();
}

module.exports = { checkUserSubscriptions }; 