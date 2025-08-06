const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

async function debugCustomerSubscription() {
  try {
    console.log('🔧 Debugging customer subscription...\n');

    const customerId = 'cus_SoYS8Apu07B9pB';
    const subscriptionItemId = 'si_SoYSRnMIkqZSd2';

    // 1. Get customer details
    console.log('1️⃣ Fetching customer details...');
    const customer = await stripe.customers.retrieve(customerId);
    console.log(`✅ Customer: ${customer.email} (${customer.id})`);
    console.log(`   Created: ${new Date(customer.created * 1000).toLocaleDateString()}`);
    console.log(`   Default Source: ${customer.default_source || 'None'}`);
    console.log(`   Invoice Settings:`, customer.invoice_settings);

    // 2. Get all subscriptions for this customer
    console.log('\n2️⃣ Fetching all subscriptions...');
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10
    });

    console.log(`✅ Found ${subscriptions.data.length} subscriptions:`);
    subscriptions.data.forEach((sub, index) => {
      console.log(`   ${index + 1}. Subscription: ${sub.id}`);
      console.log(`      Status: ${sub.status}`);
      console.log(`      Created: ${new Date(sub.created * 1000).toLocaleDateString()}`);
      console.log(`      Current Period Start: ${new Date(sub.current_period_start * 1000).toLocaleDateString()}`);
      console.log(`      Current Period End: ${new Date(sub.current_period_end * 1000).toLocaleDateString()}`);
      console.log(`      Canceled At: ${sub.canceled_at ? new Date(sub.canceled_at * 1000).toLocaleDateString() : 'Not canceled'}`);
      console.log(`      Items: ${sub.items.data.length}`);
      
      sub.items.data.forEach((item, itemIndex) => {
        console.log(`         Item ${itemIndex + 1}: ${item.id}`);
        console.log(`            Price: ${item.price.id} (${item.price.unit_amount / 100} ${item.price.currency.toUpperCase()})`);
        console.log(`            Product: ${item.price.product.name || 'Unknown'}`);
        console.log(`            Status: ${item.status}`);
      });
    });

    // 3. Get specific subscription item
    console.log('\n3️⃣ Fetching specific subscription item...');
    try {
      const subscriptionItem = await stripe.subscriptionItems.retrieve(subscriptionItemId);
      console.log(`✅ Subscription Item: ${subscriptionItem.id}`);
      console.log(`   Subscription: ${subscriptionItem.subscription}`);
      console.log(`   Price: ${subscriptionItem.price.id}`);
      console.log(`   Status: ${subscriptionItem.status}`);
      console.log(`   Created: ${new Date(subscriptionItem.created * 1000).toLocaleDateString()}`);
      
      // Get the parent subscription
      const parentSubscription = await stripe.subscriptions.retrieve(subscriptionItem.subscription);
      console.log(`   Parent Subscription Status: ${parentSubscription.status}`);
      console.log(`   Parent Subscription Customer: ${parentSubscription.customer}`);
      
    } catch (error) {
      console.log(`❌ Error fetching subscription item: ${error.message}`);
    }

    // 4. Check portal configuration
    console.log('\n4️⃣ Checking portal configuration...');
    const configurations = await stripe.billingPortal.configurations.list();
    console.log(`✅ Found ${configurations.data.length} portal configurations:`);
    
    configurations.data.forEach((config, index) => {
      console.log(`   ${index + 1}. ${config.display_name || 'Default'} (${config.id})`);
      console.log(`      Features:`);
      if (config.features?.customer_update?.enabled) console.log(`         - Customer updates`);
      if (config.features?.invoice_history?.enabled) console.log(`         - Invoice history`);
      if (config.features?.payment_method_update?.enabled) console.log(`         - Payment method updates`);
      if (config.features?.subscription_cancel?.enabled) console.log(`         - Subscription cancellation`);
      if (config.features?.subscription_pause?.enabled) console.log(`         - Subscription pause`);
      if (config.features?.subscription_update?.enabled) console.log(`         - Subscription updates`);
      
      if (config.features?.subscription_update?.products) {
        console.log(`      Products in portal: ${config.features.subscription_update.products.length}`);
        config.features.subscription_update.products.forEach(product => {
          console.log(`         - Product: ${product.product}`);
        });
      }
    });

    // 5. Test portal session creation
    console.log('\n5️⃣ Testing portal session creation...');
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: 'http://localhost:3000/dashboard/settings',
      });

      console.log('✅ Portal session created successfully');
      console.log(`   Session URL: ${session.url}`);
      console.log(`   Session ID: ${session.id}`);
      console.log(`   Created: ${new Date(session.created * 1000).toLocaleDateString()}`);
      console.log(`   Expires: ${new Date(session.expires_at * 1000).toLocaleDateString()}`);
      
    } catch (error) {
      console.log(`❌ Error creating portal session: ${error.message}`);
    }

    // 6. Check if subscription is in a state that should be visible
    console.log('\n6️⃣ Analyzing subscription visibility...');
    const activeSubscriptions = subscriptions.data.filter(sub => 
      ['active', 'trialing', 'past_due'].includes(sub.status)
    );

    if (activeSubscriptions.length === 0) {
      console.log('⚠️  No active subscriptions found - this is why it\'s not showing in portal');
      console.log('   Portal only shows active, trialing, or past_due subscriptions');
    } else {
      console.log(`✅ Found ${activeSubscriptions.length} active subscriptions that should be visible`);
    }

    // 7. Check database sync
    console.log('\n7️⃣ Checking database sync...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('stripe_customer_id', customerId);

    if (users && users.length > 0) {
      const user = users[0];
      console.log(`✅ Found user in database: ${user.email}`);
      console.log(`   Subscription Status: ${user.subscription_status}`);
      console.log(`   Stripe Subscription ID: ${user.stripe_subscription_id}`);
      
      // Check if database matches Stripe
      const hasActiveStripeSub = activeSubscriptions.length > 0;
      const hasActiveDBStatus = user.subscription_status === 'active';
      
      if (hasActiveStripeSub !== hasActiveDBStatus) {
        console.log('⚠️  MISMATCH: Database and Stripe subscription status don\'t match');
        console.log(`   Stripe has active subscription: ${hasActiveStripeSub}`);
        console.log(`   Database shows active: ${hasActiveDBStatus}`);
      } else {
        console.log('✅ Database and Stripe subscription status match');
      }
    } else {
      console.log('❌ No user found in database with this Stripe customer ID');
    }

    console.log('\n🎉 Debug analysis completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
if (require.main === module) {
  debugCustomerSubscription();
}

module.exports = { debugCustomerSubscription }; 