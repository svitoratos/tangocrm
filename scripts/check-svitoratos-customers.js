const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkSvitoratosCustomers() {
  try {
    const email = 'svitoratos13@gmail.com';
    console.log('🔍 Checking customers for:', email);

    // 1. Find all customers with this email
    const customers = await stripe.customers.list({
      email: email,
      limit: 100
    });

    console.log(`Found ${customers.data.length} customers with email: ${email}`);

    if (customers.data.length === 0) {
      console.log('❌ No customers found');
      return;
    }

    // 2. Show details for each customer
    for (const customer of customers.data) {
      console.log(`\n📋 Customer: ${customer.id}`);
      console.log(`  Created: ${new Date(customer.created * 1000).toISOString()}`);
      console.log(`  Email: ${customer.email}`);
      console.log(`  Deleted: ${customer.deleted}`);
      
      // Get subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 100
      });

      console.log(`  Subscriptions: ${subscriptions.data.length}`);
      for (const sub of subscriptions.data) {
        console.log(`    - ${sub.id}: ${sub.status}`);
        for (const item of sub.items.data) {
          console.log(`      * ${item.price.id} (${item.quantity})`);
        }
      }

      // Get checkout sessions for this customer
      const sessions = await stripe.checkout.sessions.list({
        customer: customer.id,
        limit: 100
      });

      console.log(`  Checkout Sessions: ${sessions.data.length}`);
      for (const session of sessions.data) {
        console.log(`    - ${session.id}: ${session.status} (${session.metadata?.niche || 'unknown'})`);
      }
    }

    // 3. Check if this is a recent issue
    const recentCustomers = customers.data.filter(c => 
      !c.deleted && new Date(c.created * 1000) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    if (recentCustomers.length > 1) {
      console.log('\n🚨 RECENT DUPLICATE CUSTOMERS DETECTED!');
      console.log('This suggests our fix is not working properly.');
      
      for (const customer of recentCustomers) {
        console.log(`  - ${customer.id} created at ${new Date(customer.created * 1000).toISOString()}`);
      }
    }

    // 4. Show recommendations
    console.log('\n💡 Recommendations:');
    if (customers.data.length > 1) {
      console.log('  - Multiple customers found - need to consolidate');
      console.log('  - Check if our code fixes are properly deployed');
      console.log('  - Verify the ensureSingleCustomer function is working');
    } else {
      console.log('  - Single customer found - system working correctly');
    }

  } catch (error) {
    console.error('❌ Error checking customers:', error);
  }
}

// Run the check
console.log('🚀 Checking customer status for svitoratos13@gmail.com...\n');

checkSvitoratosCustomers()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
