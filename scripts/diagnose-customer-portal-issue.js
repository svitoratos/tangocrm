#!/usr/bin/env node

/**
 * Diagnose Customer Portal Issue Script
 * 
 * This script helps diagnose why the customer portal is only showing one subscription
 * when the database shows multiple niches. It will:
 * 1. Check user's database niches
 * 2. Check Stripe customer IDs
 * 3. Check Stripe subscriptions
 * 4. Identify the root cause
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

// Price ID to niche mapping
const priceToNiche = {
  'price_1Rt8u9IvVfTNGbwuoAxHpYSj': 'creator',
  'price_1Rt8u9IvVfTNGbwug424qIjh': 'creator',
  'price_1Rt8u9IvVfTNGbwu0UI52sRR': 'coach',
  'price_1Rt8u9IvVfTNGbwuH88MMC8I': 'coach',
  'price_1Rt8uAIvVfTNGbwuiwPUarlw': 'podcaster',
  'price_1Rt8uAIvVfTNGbwu9nXGrotw': 'podcaster',
  'price_1Rt8uAIvVfTNGbwupN9yBl9U': 'freelancer',
  'price_1Rt8uBIvVfTNGbwuWxLrbFPu': 'freelancer',
  'price_1RqIA2IvVfTNGbwujqF5AXfU': 'creator',
  'price_1RqIAoIvVfTNGbwuXswPztfk': 'creator',
  'price_1RjmO3IvVfTNGbwuU9KTk44N': 'coach',
  'price_1RkCcMIvVfTNGbwuHONiyPQ7': 'coach',
  'price_1RqII9IvVfTNGbwuhApqysHX': 'podcaster',
  'price_1RqIIXIvVfTNGbwu8EMGv4OG': 'podcaster',
  'price_1RqIK7IvVfTNGbwuAiFKM7is': 'freelancer',
  'price_1RqIKNIvVfTNGbwuHONiyPQ7': 'freelancer'
};

async function diagnoseUser(userEmail) {
  console.log(`🔍 Diagnosing customer portal issue for: ${userEmail}\n`);
  
  try {
    // 1. Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      console.error('❌ User not found in database:', userError);
      return;
    }

    console.log('📊 Database User Info:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Customer ID: ${user.stripe_customer_id}`);
    console.log(`   Database Niches: [${user.niches?.join(', ') || 'none'}]`);
    console.log(`   Primary Niche: ${user.primary_niche}`);
    console.log(`   Subscription Status: ${user.subscription_status}`);
    console.log('');

    // 2. Check all Stripe customers for this email
    console.log('🔍 Checking Stripe customers...');
    const stripeCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 100
    });

    console.log(`📊 Found ${stripeCustomers.data.length} Stripe customers for this email:`);
    
    for (const customer of stripeCustomers.data) {
      console.log(`   Customer ID: ${customer.id}`);
      console.log(`   Created: ${new Date(customer.created * 1000).toISOString()}`);
      console.log(`   Metadata:`, customer.metadata);
      
      // 3. Check subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        limit: 100
      });

      console.log(`   Subscriptions: ${subscriptions.data.length}`);
      
      for (const subscription of subscriptions.data) {
        console.log(`     Subscription: ${subscription.id} (${subscription.status})`);
        
        for (const item of subscription.items.data) {
          const niche = priceToNiche[item.price.id];
          console.log(`       Item: ${item.price.id} -> ${niche || 'unknown'}`);
        }
      }
      console.log('');
    }

    // 4. Check if there are multiple customers with subscriptions
    const customersWithSubscriptions = [];
    
    for (const customer of stripeCustomers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 100
      });
      
      if (subscriptions.data.length > 0) {
        customersWithSubscriptions.push({
          customerId: customer.id,
          subscriptionCount: subscriptions.data.length,
          subscriptions: subscriptions.data
        });
      }
    }

    console.log('🔍 Analysis:');
    
    if (customersWithSubscriptions.length === 0) {
      console.log('❌ No active subscriptions found in Stripe');
      console.log('   This explains why the portal shows no subscriptions');
    } else if (customersWithSubscriptions.length === 1) {
      console.log('✅ Single customer with subscriptions found');
      console.log(`   Customer: ${customersWithSubscriptions[0].customerId}`);
      console.log(`   Subscriptions: ${customersWithSubscriptions[0].subscriptionCount}`);
      
      if (customersWithSubscriptions[0].customerId === user.stripe_customer_id) {
        console.log('✅ Customer ID matches database');
        console.log('   The portal should show all subscriptions');
      } else {
        console.log('❌ Customer ID mismatch!');
        console.log(`   Database: ${user.stripe_customer_id}`);
        console.log(`   Stripe: ${customersWithSubscriptions[0].customerId}`);
        console.log('   This explains why the portal shows different subscriptions');
      }
    } else {
      console.log('❌ Multiple customers with subscriptions found!');
      console.log('   This is the root cause - subscriptions are scattered across customers');
      
      for (const customerData of customersWithSubscriptions) {
        console.log(`   Customer ${customerData.customerId}: ${customerData.subscriptionCount} subscriptions`);
      }
      
      console.log('   Solution: Need to consolidate all subscriptions under one customer');
    }

    // 5. Check what the portal would show
    if (user.stripe_customer_id) {
      console.log('\n🔍 What the portal would show:');
      
      const portalSubscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'active',
        limit: 100
      });

      console.log(`   Portal customer ID: ${user.stripe_customer_id}`);
      console.log(`   Active subscriptions: ${portalSubscriptions.data.length}`);
      
      for (const subscription of portalSubscriptions.data) {
        console.log(`     ${subscription.id} (${subscription.status})`);
        for (const item of subscription.items.data) {
          const niche = priceToNiche[item.price.id];
          console.log(`       ${niche || 'unknown'} - ${item.price.id}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error diagnosing user:', error);
  }
}

async function main() {
  console.log('🚀 Customer Portal Issue Diagnosis\n');
  
  // Get user email from command line or environment
  const userEmail = process.argv[2] || process.env.TEST_USER_EMAIL;
  
  if (!userEmail) {
    console.error('❌ Please provide a user email:');
    console.error('   node scripts/diagnose-customer-portal-issue.js user@example.com');
    console.error('   or set TEST_USER_EMAIL environment variable');
    return;
  }

  await diagnoseUser(userEmail);
  
  console.log('\n📋 Next Steps:');
  console.log('1. If multiple customers found: Run consolidation script');
  console.log('2. If customer ID mismatch: Update database customer ID');
  console.log('3. If no subscriptions: Check webhook processing');
  console.log('4. If single customer: Check subscription status');
}

// Run the script
main().catch(console.error);
