#!/usr/bin/env node

/**
 * Fix Customer Portal Subscriptions Script
 * 
 * This script fixes the issue where the customer portal only shows one subscription
 * by consolidating all subscriptions under one customer ID.
 */

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
  console.error('❌ Missing environment variables');
  console.error('Please set: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey);

async function consolidateUserSubscriptions(userEmail) {
  console.log(`🔧 Consolidating subscriptions for: ${userEmail}\n`);
  
  try {
    // 1. Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      console.error('❌ User not found in database:', userError);
      return false;
    }

    console.log('📊 User Info:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Customer ID: ${user.stripe_customer_id}`);
    console.log(`   Database Niches: [${user.niches?.join(', ') || 'none'}]`);

    // 2. Find all Stripe customers for this email
    const stripeCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 100
    });

    console.log(`\n🔍 Found ${stripeCustomers.data.length} Stripe customers`);

    if (stripeCustomers.data.length <= 1) {
      console.log('✅ Only one customer found - no consolidation needed');
      return true;
    }

    // 3. Find the primary customer (the one in the database or the oldest one)
    let primaryCustomer = null;
    
    if (user.stripe_customer_id) {
      primaryCustomer = stripeCustomers.data.find(c => c.id === user.stripe_customer_id);
    }
    
    if (!primaryCustomer) {
      // Use the oldest customer as primary
      primaryCustomer = stripeCustomers.data.sort((a, b) => a.created - b.created)[0];
      console.log(`🔧 Using oldest customer as primary: ${primaryCustomer.id}`);
    } else {
      console.log(`🔧 Using database customer as primary: ${primaryCustomer.id}`);
    }

    // 4. Collect all subscriptions from all customers
    const allSubscriptions = [];
    const customersToDelete = [];

    for (const customer of stripeCustomers.data) {
      if (customer.id === primaryCustomer.id) continue;

      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 100
      });

      if (subscriptions.data.length > 0) {
        console.log(`📦 Found ${subscriptions.data.length} active subscriptions in customer ${customer.id}`);
        allSubscriptions.push(...subscriptions.data);
        customersToDelete.push(customer.id);
      }
    }

    if (allSubscriptions.length === 0) {
      console.log('✅ No additional subscriptions to consolidate');
      return true;
    }

    console.log(`\n🔧 Consolidating ${allSubscriptions.length} subscriptions to customer ${primaryCustomer.id}`);

    // 5. Transfer subscriptions to primary customer
    for (const subscription of allSubscriptions) {
      try {
        console.log(`🔄 Transferring subscription ${subscription.id}...`);
        
        // Update subscription to use primary customer
        await stripe.subscriptions.update(subscription.id, {
          customer: primaryCustomer.id,
          metadata: {
            ...subscription.metadata,
            transferred_at: new Date().toISOString(),
            original_customer: subscription.customer
          }
        });

        console.log(`✅ Successfully transferred subscription ${subscription.id}`);
      } catch (error) {
        console.error(`❌ Failed to transfer subscription ${subscription.id}:`, error.message);
      }
    }

    // 6. Update database with primary customer ID
    if (user.stripe_customer_id !== primaryCustomer.id) {
      console.log(`🔄 Updating database customer ID: ${user.stripe_customer_id} -> ${primaryCustomer.id}`);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          stripe_customer_id: primaryCustomer.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Failed to update database customer ID:', updateError);
      } else {
        console.log('✅ Database customer ID updated successfully');
      }
    }

    // 7. Delete empty customers (optional - be careful with this)
    console.log('\n🧹 Cleaning up empty customers...');
    
    for (const customerId of customersToDelete) {
      try {
        // Check if customer has any remaining subscriptions
        const remainingSubscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'all',
          limit: 1
        });

        if (remainingSubscriptions.data.length === 0) {
          console.log(`🗑️ Deleting empty customer: ${customerId}`);
          await stripe.customers.del(customerId);
        } else {
          console.log(`⚠️ Customer ${customerId} still has subscriptions, skipping deletion`);
        }
      } catch (error) {
        console.error(`❌ Error deleting customer ${customerId}:`, error.message);
      }
    }

    // 8. Verify consolidation
    console.log('\n🔍 Verifying consolidation...');
    
    const finalSubscriptions = await stripe.subscriptions.list({
      customer: primaryCustomer.id,
      status: 'active',
      limit: 100
    });

    console.log(`✅ Primary customer ${primaryCustomer.id} now has ${finalSubscriptions.data.length} active subscriptions`);
    
    for (const subscription of finalSubscriptions.data) {
      console.log(`   ${subscription.id} (${subscription.status})`);
    }

    return true;

  } catch (error) {
    console.error('❌ Error consolidating subscriptions:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Customer Portal Subscription Consolidation\n');
  
  // Get user email from command line or environment
  const userEmail = process.argv[2] || process.env.TEST_USER_EMAIL;
  
  if (!userEmail) {
    console.error('❌ Please provide a user email:');
    console.error('   node scripts/fix-customer-portal-subscriptions.js user@example.com');
    console.error('   or set TEST_USER_EMAIL environment variable');
    return;
  }

  // Ask for confirmation
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(`Do you want to consolidate subscriptions for ${userEmail}? (y/N): `, async (answer) => {
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      return;
    }

    console.log('\n🔧 Starting subscription consolidation...\n');
    
    const success = await consolidateUserSubscriptions(userEmail);
    
    if (success) {
      console.log('\n✅ Consolidation completed successfully!');
      console.log('🎉 The customer portal should now show all subscriptions');
    } else {
      console.log('\n❌ Consolidation failed');
    }
  });
}

// Run the script
main().catch(console.error);
