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

async function fixCustomerMismatch() {
  try {
    console.log('🔧 Fixing customer ID mismatch...\n');

    const userId = 'user_30n5o1Z6dwKZepcepjfIbyrRGKJ';
    const correctCustomerId = 'cus_SoYS8Apu07B9pB';
    const correctSubscriptionId = 'sub_1RsvLlIvVfTNGbwuxKyjWAxS';

    // 1. Get current user data
    console.log('1️⃣ Getting current user data...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.log('❌ Error fetching user:', userError);
      return;
    }

    console.log(`✅ Current user: ${user.email} (${user.id})`);
    console.log(`   Current Stripe Customer ID: ${user.stripe_customer_id || 'None'}`);
    console.log(`   Current Subscription Status: ${user.subscription_status || 'None'}`);
    console.log(`   Current Stripe Subscription ID: ${user.stripe_subscription_id || 'None'}`);

    // 2. Verify the correct customer and subscription exist in Stripe
    console.log('\n2️⃣ Verifying Stripe customer and subscription...');
    try {
      const customer = await stripe.customers.retrieve(correctCustomerId);
      console.log(`✅ Stripe Customer: ${customer.email} (${customer.id})`);

      const subscription = await stripe.subscriptions.retrieve(correctSubscriptionId);
      console.log(`✅ Stripe Subscription: ${subscription.id} (${subscription.status})`);
      console.log(`   Customer: ${subscription.customer}`);
      console.log(`   Created: ${new Date(subscription.created * 1000).toLocaleDateString()}`);

      if (subscription.customer !== correctCustomerId) {
        console.log('❌ Subscription does not belong to the correct customer');
        return;
      }

    } catch (error) {
      console.log('❌ Error verifying Stripe data:', error.message);
      return;
    }

    // 3. Update user with correct Stripe data
    console.log('\n3️⃣ Updating user with correct Stripe data...');
    const updates = {
      stripe_customer_id: correctCustomerId,
      stripe_subscription_id: correctSubscriptionId,
      subscription_status: 'active',
      subscription_tier: 'core',
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    };

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Error updating user:', updateError);
      return;
    }

    console.log('✅ User updated successfully!');
    console.log(`   New Stripe Customer ID: ${updatedUser.stripe_customer_id}`);
    console.log(`   New Subscription Status: ${updatedUser.subscription_status}`);
    console.log(`   New Stripe Subscription ID: ${updatedUser.stripe_subscription_id}`);

    // 4. Test portal access
    console.log('\n4️⃣ Testing portal access...');
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: correctCustomerId,
        return_url: 'http://localhost:3000/dashboard/settings',
      });

      console.log('✅ Portal session created successfully');
      console.log(`   Session URL: ${session.url}`);
      console.log(`   Session ID: ${session.id}`);
      
    } catch (error) {
      console.log('❌ Error creating portal session:', error.message);
    }

    // 5. Verify the fix
    console.log('\n5️⃣ Verifying the fix...');
    const { data: finalUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    console.log(`✅ Final user state:`);
    console.log(`   Email: ${finalUser.email}`);
    console.log(`   Stripe Customer ID: ${finalUser.stripe_customer_id}`);
    console.log(`   Subscription Status: ${finalUser.subscription_status}`);
    console.log(`   Stripe Subscription ID: ${finalUser.stripe_subscription_id}`);
    console.log(`   Onboarding Completed: ${finalUser.onboarding_completed}`);

    console.log('\n🎉 Customer ID mismatch fixed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the customer portal from your application');
    console.log('2. Verify the subscription shows up correctly');
    console.log('3. Check that billing management works properly');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
if (require.main === module) {
  fixCustomerMismatch();
}

module.exports = { fixCustomerMismatch }; 