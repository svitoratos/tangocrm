#!/usr/bin/env node

/**
 * Script to fix duplicate Stripe customers for stevenvitoratos@gmail.com
 * Run this script to merge duplicate customers and ensure one customer ID per user
 */

const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function findCustomersByEmail(email) {
  try {
    const customers = await stripe.customers.list({
      email: email,
      limit: 100
    });
    
    console.log(`Found ${customers.data.length} customers for ${email}:`);
    customers.data.forEach((customer, index) => {
      console.log(`  ${index + 1}. ${customer.id} (created: ${new Date(customer.created * 1000).toISOString()})`);
      if (customer.metadata) {
        console.log(`     Metadata:`, customer.metadata);
      }
    });
    
    return customers.data;
  } catch (error) {
    console.error('Error finding customers:', error);
    return [];
  }
}

async function getCustomerSubscriptions(customerId) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100
    });
    
    console.log(`  Subscriptions: ${subscriptions.data.length}`);
    subscriptions.data.forEach(sub => {
      console.log(`    - ${sub.id} (${sub.status}) - ${sub.items.data.map(item => item.price.id).join(', ')}`);
    });
    
    return subscriptions.data;
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
}

async function mergeCustomers(primaryCustomerId, duplicateCustomerId) {
  try {
    console.log(`\n🔧 Merging customer ${duplicateCustomerId} into ${primaryCustomerId}...`);
    
    // Get the duplicate customer details
    const duplicateCustomer = await stripe.customers.retrieve(duplicateCustomerId);
    
    if (duplicateCustomer.deleted) {
      console.log('⚠️ Customer was already deleted, skipping merge');
      return false;
    }
    
    // Get existing customer details
    const primaryCustomer = await stripe.customers.retrieve(primaryCustomerId);
    
    if (primaryCustomer.deleted) {
      console.log('⚠️ Primary customer was deleted, cannot merge');
      return false;
    }
    
    // Transfer all subscriptions from duplicate to primary
    const subscriptions = await stripe.subscriptions.list({
      customer: duplicateCustomerId,
      limit: 100
    });
    
    for (const subscription of subscriptions.data) {
      console.log(`🔄 Transferring subscription ${subscription.id}`);
      
      // Create new subscription for primary customer
      const newSubscription = await stripe.subscriptions.create({
        customer: primaryCustomerId,
        items: subscription.items.data.map(item => ({
          price: item.price.id,
          quantity: item.quantity
        })),
        metadata: {
          ...subscription.metadata,
          transferred_from_customer: duplicateCustomerId,
          transferred_from_subscription: subscription.id,
          transferred_at: new Date().toISOString()
        }
      });
      
      // Cancel the old subscription
      await stripe.subscriptions.cancel(subscription.id);
      
      console.log(`✅ Subscription transferred: ${subscription.id} → ${newSubscription.id}`);
    }
    
    // Transfer payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: duplicateCustomerId,
      type: 'card'
    });
    
    for (const paymentMethod of paymentMethods.data) {
      console.log(`🔄 Transferring payment method ${paymentMethod.id}`);
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: primaryCustomerId
      });
    }
    
    // Update primary customer metadata
    const existingMetadata = primaryCustomer.metadata || {};
    await stripe.customers.update(primaryCustomerId, {
      metadata: {
        ...existingMetadata,
        merged_at: new Date().toISOString(),
        merged_customers: `${existingMetadata.merged_customers || ''},${duplicateCustomerId}`.replace(/^,/, '')
      }
    });
    
    // Delete the duplicate customer
    await stripe.customers.del(duplicateCustomerId);
    
    console.log('✅ Successfully merged customers');
    return true;
    
  } catch (error) {
    console.error('❌ Error merging customers:', error);
    return false;
  }
}

async function main() {
  const email = 'stevenvitoratos@gmail.com';
  
  console.log(`🔍 Scanning for duplicate customers for: ${email}\n`);
  
  // Find all customers with this email
  const customers = await findCustomersByEmail(email);
  
  if (customers.length <= 1) {
    console.log('✅ No duplicate customers found!');
    return;
  }
  
  console.log('\n📊 Customer Analysis:');
  
  // Analyze each customer
  for (const customer of customers) {
    console.log(`\nCustomer: ${customer.id}`);
    console.log(`  Created: ${new Date(customer.created * 1000).toISOString()}`);
    console.log(`  Email: ${customer.email}`);
    
    const subscriptions = await getCustomerSubscriptions(customer.id);
    
    if (customer.metadata) {
      console.log(`  Metadata:`, customer.metadata);
    }
  }
  
  // Determine primary customer (oldest)
  const sortedCustomers = customers.sort((a, b) => a.created - b.created);
  const primaryCustomer = sortedCustomers[0];
  const duplicateCustomers = sortedCustomers.slice(1);
  
  console.log(`\n🎯 Primary customer: ${primaryCustomer.id} (oldest)`);
  console.log(`🔄 Duplicate customers: ${duplicateCustomers.length}`);
  
  // Ask for confirmation
  console.log('\n⚠️  This will merge all duplicate customers into the primary customer.');
  console.log('   All subscriptions will be transferred and duplicate customers will be deleted.');
  console.log('\nPress Ctrl+C to cancel, or wait 10 seconds to continue...');
  
  // Wait 10 seconds
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Merge all duplicates
  console.log('\n🚀 Starting merge process...');
  
  for (const duplicateCustomer of duplicateCustomers) {
    const success = await mergeCustomers(primaryCustomer.id, duplicateCustomer.id);
    if (success) {
      console.log(`✅ Successfully merged ${duplicateCustomer.id}`);
    } else {
      console.log(`❌ Failed to merge ${duplicateCustomer.id}`);
    }
  }
  
  console.log('\n🎉 Merge process completed!');
  console.log(`Primary customer ID: ${primaryCustomer.id}`);
  console.log(`\nNext steps:`);
  console.log(`1. Update your database to use customer ID: ${primaryCustomer.id}`);
  console.log(`2. Verify all subscriptions are working correctly`);
  console.log(`3. Test the customer portal access`);
}

// Run the script
main().catch(console.error);
