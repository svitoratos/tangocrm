require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-06-30.basil',
});

async function debugSubscriptionIssue() {
  console.log('🔍 Debugging Subscription Issue...\n');

  try {
    // Find the user by email
    const testEmail = 'hello@gotangocrm.com';
    
    console.log('📋 Step 1: Checking user profile in database...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      return;
    }

    if (!user) {
      console.error('❌ User not found in database');
      return;
    }

    console.log('✅ User found in database:');
    console.log(`   - User ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Stripe Customer ID: ${user.stripe_customer_id || 'NOT SET'}`);
    console.log(`   - Subscription Status: ${user.subscription_status || 'NOT SET'}`);
    console.log(`   - Niches: [${(user.niches || []).join(', ')}]`);
    console.log(`   - Onboarding Completed: ${user.onboarding_completed}`);
    console.log('');

    if (!user.stripe_customer_id) {
      console.log('❌ ISSUE: No Stripe customer ID in database!');
      console.log('   This means the user has never made a payment or the customer ID was not saved.');
      return;
    }

    console.log('📋 Step 2: Checking Stripe customer...');
    try {
      const customer = await stripe.customers.retrieve(user.stripe_customer_id);
      console.log('✅ Stripe customer found:');
      console.log(`   - Customer ID: ${customer.id}`);
      console.log(`   - Email: ${customer.email}`);
      console.log(`   - Created: ${new Date(customer.created * 1000).toISOString()}`);
      console.log('');
    } catch (stripeError) {
      console.error('❌ Error fetching Stripe customer:', stripeError.message);
      console.log('   This means the customer ID in the database is invalid.');
      return;
    }

    console.log('📋 Step 3: Checking Stripe subscriptions...');
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'all',
      limit: 10
    });

    console.log(`✅ Found ${subscriptions.data.length} subscriptions in Stripe:`);
    
    if (subscriptions.data.length === 0) {
      console.log('❌ ISSUE: No subscriptions found in Stripe!');
      console.log('   This means the user has never subscribed or all subscriptions were cancelled.');
      return;
    }

    subscriptions.data.forEach((subscription, index) => {
      console.log(`   Subscription ${index + 1}:`);
      console.log(`     - ID: ${subscription.id}`);
      console.log(`     - Status: ${subscription.status}`);
      console.log(`     - Current Period End: ${new Date(subscription.current_period_end * 1000).toISOString()}`);
      console.log(`     - Cancel at Period End: ${subscription.cancel_at_period_end}`);
      console.log(`     - Items: ${subscription.items.data.length}`);
      
      subscription.items.data.forEach((item, itemIndex) => {
        console.log(`       Item ${itemIndex + 1}: ${item.price.product} (${item.price.unit_amount} ${item.price.currency})`);
      });
      console.log('');
    });

    console.log('📋 Step 4: Checking Stripe invoices...');
    const invoices = await stripe.invoices.list({
      customer: user.stripe_customer_id,
      limit: 5
    });

    console.log(`✅ Found ${invoices.data.length} invoices in Stripe:`);
    invoices.data.forEach((invoice, index) => {
      console.log(`   Invoice ${index + 1}:`);
      console.log(`     - Number: ${invoice.number}`);
      console.log(`     - Status: ${invoice.status}`);
      console.log(`     - Amount: ${invoice.amount_paid} ${invoice.currency}`);
      console.log(`     - Created: ${new Date(invoice.created * 1000).toISOString()}`);
    });

    console.log('\n🎯 SUMMARY:');
    if (subscriptions.data.length > 0) {
      const activeSubscriptions = subscriptions.data.filter(sub => 
        ['active', 'trialing', 'past_due'].includes(sub.status)
      );
      
      if (activeSubscriptions.length > 0) {
        console.log('✅ User has active subscriptions - the API should work!');
        console.log('   The issue might be with the API endpoint itself.');
      } else {
        console.log('⚠️ User has subscriptions but none are active.');
        console.log('   This explains why the API returns 404.');
      }
    } else {
      console.log('❌ User has no subscriptions at all.');
      console.log('   This explains why the API returns 404.');
    }

  } catch (error) {
    console.error('❌ Error debugging subscription issue:', error);
  }
}

debugSubscriptionIssue(); 