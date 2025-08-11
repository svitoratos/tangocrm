const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function fixStevenBondlyCustomer() {
  try {
    const email = 'stevenvitoratos@getbondlyapp.com';
    console.log('🔍 Fixing duplicate customers for:', email);

    // 1. Find all customers with this email
    const customers = await stripe.customers.list({
      email: email,
      limit: 100
    });

    console.log(`Found ${customers.data.length} customers with email: ${email}`);

    if (customers.data.length <= 1) {
      console.log('✅ No duplicate customers found');
      return;
    }

    // 2. Find the primary customer (the one with the most subscriptions)
    let primaryCustomer = null;
    let maxSubscriptions = 0;

    for (const customer of customers.data) {
      if (customer.deleted) continue;
      
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 100
      });

      console.log(`Customer ${customer.id}: ${subscriptions.data.length} subscriptions`);

      if (subscriptions.data.length > maxSubscriptions) {
        maxSubscriptions = subscriptions.data.length;
        primaryCustomer = customer;
      }
    }

    if (!primaryCustomer) {
      console.log('❌ No valid primary customer found');
      return;
    }

    console.log(`🎯 Primary customer: ${primaryCustomer.id} with ${maxSubscriptions} subscriptions`);

    // 3. Merge all other customers into the primary one
    const duplicateCustomers = customers.data.filter(c => 
      c.id !== primaryCustomer.id && !c.deleted
    );

    console.log(`🔄 Merging ${duplicateCustomers.length} duplicate customers...`);

    for (const duplicate of duplicateCustomers) {
      try {
        console.log(`\n🔄 Processing duplicate customer: ${duplicate.id}`);

        // Get subscriptions from duplicate customer
        const subscriptions = await stripe.subscriptions.list({
          customer: duplicate.id,
          limit: 100
        });

        // Transfer each subscription to primary customer
        for (const subscription of subscriptions.data) {
          console.log(`  📦 Transferring subscription: ${subscription.id}`);

          // Create new subscription for primary customer
          const newSubscription = await stripe.subscriptions.create({
            customer: primaryCustomer.id,
            items: subscription.items.data.map(item => ({
              price: item.price.id,
              quantity: item.quantity
            })),
            metadata: {
              ...subscription.metadata,
              transferred_from_customer: duplicate.id,
              transferred_from_subscription: subscription.id,
              transferred_at: new Date().toISOString(),
              fix_operation: 'steven_bondly_duplicate_fix'
            }
          });

          // Cancel the old subscription
          await stripe.subscriptions.cancel(subscription.id);

          // Update cancelled subscription with metadata
          await stripe.subscriptions.update(subscription.id, {
            metadata: {
              ...subscription.metadata,
              cancelled_because: 'duplicate_customer_fix',
              transferred_to_customer: primaryCustomer.id,
              transferred_to_subscription: newSubscription.id,
              cancelled_at: new Date().toISOString()
            }
          });

          console.log(`    ✅ Subscription transferred: ${subscription.id} → ${newSubscription.id}`);
        }

        // Delete the duplicate customer
        await stripe.customers.del(duplicate.id);
        console.log(`  🗑️ Deleted duplicate customer: ${duplicate.id}`);

      } catch (error) {
        console.error(`  ❌ Error processing duplicate customer ${duplicate.id}:`, error);
      }
    }

    console.log('\n✅ Duplicate customer fix completed!');
    console.log(`🎯 Primary customer ID: ${primaryCustomer.id}`);
    console.log(`📧 Email: ${email}`);
    console.log(`📊 Total subscriptions: ${maxSubscriptions}`);

    // 4. Show final state
    const finalSubscriptions = await stripe.subscriptions.list({
      customer: primaryCustomer.id,
      limit: 100
    });

    console.log('\n📋 Final subscription list:');
    for (const sub of finalSubscriptions.data) {
      console.log(`  - ${sub.id}: ${sub.status} (${sub.items.data.length} items)`);
      for (const item of sub.items.data) {
        console.log(`    * ${item.price.id} (${item.quantity})`);
      }
    }

  } catch (error) {
    console.error('❌ Error fixing duplicate customers:', error);
  }
}

// Run the fix
console.log('🚀 Starting duplicate customer fix for stevenvitoratos@getbondlyapp.com...');
console.log('⚠️ This will merge duplicate customers and may take a few minutes...\n');

fixStevenBondlyCustomer()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
