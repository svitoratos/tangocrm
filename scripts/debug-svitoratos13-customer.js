const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function debugSvitoratos13Customer() {
  try {
    const email = 'svitoratos13@gmail.com';
    console.log('🔍 Debugging customer creation for:', email);

    // 1. Find all customers with this email
    const customers = await stripe.customers.list({
      email: email,
      limit: 100
    });

    console.log(`Found ${customers.data.length} customers with email: ${email}`);

    if (customers.data.length === 0) {
      console.log('❌ No customers found - this suggests the issue is in our logic');
      return;
    }

    // 2. Show all customers and their details
    for (const customer of customers.data) {
      console.log(`\n📋 Customer: ${customer.id}`);
      console.log(`  - Created: ${customer.created}`);
      console.log(`  - Email: ${customer.email}`);
      console.log(`  - Deleted: ${customer.deleted}`);
      console.log(`  - Metadata:`, customer.metadata);

      // Get subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 100
      });

      console.log(`  - Subscriptions: ${subscriptions.data.length}`);
      for (const sub of subscriptions.data) {
        console.log(`    * ${sub.id}: ${sub.status} - Created: ${sub.created}`);
        console.log(`      Items: ${sub.items.data.map(item => item.price.id).join(', ')}`);
      }
    }

    // 3. Check if there are any checkout sessions that might have created these customers
    console.log('\n🔍 Checking for recent checkout sessions...');
    
    // Get all checkout sessions for this email (last 30 days)
    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: thirtyDaysAgo }
    });

    const relevantSessions = sessions.data.filter(session => 
      session.customer_details?.email === email
    );

    console.log(`Found ${relevantSessions.length} checkout sessions for ${email}:`);
    
    for (const session of relevantSessions) {
      console.log(`\n📦 Session: ${session.id}`);
      console.log(`  - Created: ${new Date(session.created * 1000).toISOString()}`);
      console.log(`  - Customer: ${session.customer}`);
      console.log(`  - Status: ${session.status}`);
      console.log(`  - Metadata:`, session.metadata);
      
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        console.log(`  - Subscription: ${subscription.id} (${subscription.status})`);
      }
    }

    // 4. Analyze the issue
    console.log('\n🔍 Analysis:');
    
    if (customers.data.length > 1) {
      console.log('❌ ISSUE CONFIRMED: Multiple customer IDs created');
      console.log('💡 Possible causes:');
      console.log('  1. Race condition between checkout and database update');
      console.log('  2. Database update failing silently');
      console.log('  3. ensureSingleCustomer not working properly');
      console.log('  4. Webhook not updating database correctly');
      
      console.log('\n🎯 Recommended fix:');
      console.log('  1. Identify the primary customer (most subscriptions)');
      console.log('  2. Update database to use that customer ID');
      console.log('  3. Ensure ensureSingleCustomer works for future purchases');
    } else {
      console.log('✅ Only one customer found - issue might be resolved');
    }

  } catch (error) {
    console.error('❌ Error debugging customer:', error);
  }
}

// Run the debug
console.log('🚀 Starting debug for svitoratos13@gmail.com...\n');

debugSvitoratos13Customer()
  .then(() => {
    console.log('\n✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Debug failed:', error);
    process.exit(1);
  });
