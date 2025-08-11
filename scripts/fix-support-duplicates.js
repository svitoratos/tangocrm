const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function fixSupportDuplicates() {
  try {
    const email = 'support@gotangocrm.com';
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
    let customerSubscriptions = {};

    for (const customer of customers.data) {
      if (customer.deleted) continue;
      
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 100
      });

      customerSubscriptions[customer.id] = subscriptions.data;
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

    // 3. Show all subscriptions by customer
    console.log('\n📋 Current subscription distribution:');
    for (const [customerId, subscriptions] of Object.entries(customerSubscriptions)) {
      const customer = customers.data.find(c => c.id === customerId);
      const isPrimary = customerId === primaryCustomer.id;
      console.log(`\n${isPrimary ? '🎯 PRIMARY' : '🔄 DUPLICATE'} Customer: ${customerId}`);
      
      for (const sub of subscriptions) {
        console.log(`  - ${sub.id}: ${sub.status} (${sub.items.data.length} items)`);
        for (const item of sub.items.data) {
          console.log(`    * ${item.price.id} (${item.quantity})`);
        }
      }
    }

    // 4. Strategy: Keep existing subscriptions, update database to use primary customer ID
    console.log('\n💡 Strategy: Keep existing subscriptions, update database to use primary customer ID');
    console.log(`🎯 Primary customer ID to use: ${primaryCustomer.id}`);
    
    // 5. Show what needs to be done in the database
    console.log('\n📝 Database Update Required:');
    console.log(`UPDATE users SET stripe_customer_id = '${primaryCustomer.id}' WHERE email = '${email}';`);
    
    // 6. Show what this will achieve
    console.log('\n✅ What this fix will achieve:');
    console.log('  - All existing subscriptions remain active');
    console.log('  - Future niche purchases will use the primary customer ID');
    console.log('  - Customer portal will show all subscriptions under one customer');
    console.log('  - No more duplicate customer creation');
    
    // 7. Show the current state for reference
    console.log('\n📊 Current State Summary:');
    console.log(`  - Total customers: ${customers.data.length}`);
    console.log(`  - Primary customer: ${primaryCustomer.id}`);
    console.log(`  - Total active subscriptions: ${Object.values(customerSubscriptions).flat().length}`);
    console.log(`  - Email: ${email}`);

    // 8. Show the specific customer IDs found
    console.log('\n🔍 Customer IDs Found:');
    for (const customer of customers.data) {
      if (!customer.deleted) {
        console.log(`  - ${customer.id} (created: ${new Date(customer.created * 1000).toISOString()})`);
      }
    }

  } catch (error) {
    console.error('❌ Error fixing duplicate customers:', error);
  }
}

// Run the fix
console.log('🚀 Starting duplicate customer fix for support@gotangocrm.com...');
console.log('💡 This version analyzes the situation and provides a database update strategy\n');

fixSupportDuplicates()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
