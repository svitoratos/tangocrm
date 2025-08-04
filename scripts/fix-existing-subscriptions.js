#!/usr/bin/env node

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

async function fixExistingSubscriptions() {
  console.log('🔧 Fixing existing subscriptions...\n');

  try {
    // Get all customers from Stripe
    console.log('📊 Fetching customers from Stripe...');
    const customers = await stripe.customers.list({ limit: 100 });
    
    console.log(`Found ${customers.data.length} customers in Stripe\n`);

    // Get all subscriptions
    console.log('📊 Fetching subscriptions from Stripe...');
    const subscriptions = await stripe.subscriptions.list({ limit: 100 });
    
    console.log(`Found ${subscriptions.data.length} subscriptions in Stripe\n`);

    // Match customers with subscriptions
    const customerSubscriptions = {};
    
    subscriptions.data.forEach(sub => {
      if (sub.customer) {
        customerSubscriptions[sub.customer] = {
          status: sub.status,
          subscriptionId: sub.id,
          customerId: sub.customer
        };
      }
    });

    console.log('🔍 Customer-Subscription Mapping:');
    Object.entries(customerSubscriptions).forEach(([customerId, sub]) => {
      console.log(`- Customer: ${customerId} → Status: ${sub.status}`);
    });

    console.log('\n📋 Manual Database Update Required:');
    console.log('You need to manually update these users in your database:');
    
    Object.entries(customerSubscriptions).forEach(([customerId, sub]) => {
      console.log(`\nSQL for customer ${customerId}:`);
      console.log(`UPDATE users SET subscription_status = '${sub.status}' WHERE stripe_customer_id = '${customerId}';`);
    });

    // Check for customers without subscriptions
    const customersWithoutSubs = customers.data.filter(customer => 
      !customerSubscriptions[customer.id]
    );

    if (customersWithoutSubs.length > 0) {
      console.log('\n⚠️  Customers without subscriptions:');
      customersWithoutSubs.forEach(customer => {
        console.log(`- ${customer.email} (${customer.id})`);
      });
    }

    console.log('\n✅ Analysis complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the SQL commands above in your Supabase database');
    console.log('2. Set up the webhook endpoint in Stripe Dashboard');
    console.log('3. Test with a new payment');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the fix
fixExistingSubscriptions(); 