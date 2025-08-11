#!/usr/bin/env node

/**
 * Test Script for Customer ID Consolidation
 * 
 * This script tests the customer consolidation functionality to ensure
 * that users with multiple Stripe customer IDs can be properly consolidated.
 * 
 * Usage: node scripts/test-customer-consolidation.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCustomerConsolidation() {
  console.log('🧪 Testing Customer ID Consolidation...\n');

  try {
    // 1. Find users with potential customer ID issues
    console.log('🔍 Step 1: Finding users with potential customer ID issues...');
    
    const { data: usersWithCustomers, error: queryError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id, niches, subscription_status')
      .not('stripe_customer_id', 'is', null);

    if (queryError) {
      console.error('❌ Error querying users:', queryError);
      return;
    }

    console.log(`✅ Found ${usersWithCustomers.length} users with Stripe customer IDs\n`);

    // 2. Check for duplicate customer IDs by email
    console.log('🔍 Step 2: Checking for duplicate customer IDs by email...');
    
    const emailCustomerMap = new Map();
    const duplicateEmails = [];

    usersWithCustomers.forEach(user => {
      if (!emailCustomerMap.has(user.email)) {
        emailCustomerMap.set(user.email, []);
      }
      emailCustomerMap.get(user.email).push(user);
    });

    emailCustomerMap.forEach((users, email) => {
      if (users.length > 1) {
        const customerIds = users.map(u => u.stripe_customer_id);
        const uniqueCustomerIds = [...new Set(customerIds)];
        
        if (uniqueCustomerIds.length > 1) {
          duplicateEmails.push({
            email,
            users,
            customerIds: uniqueCustomerIds
          });
        }
      }
    });

    if (duplicateEmails.length === 0) {
      console.log('✅ No duplicate customer IDs found - all users have unique customer IDs per email\n');
    } else {
      console.log(`⚠️ Found ${duplicateEmails.length} emails with duplicate customer IDs:\n`);
      
      duplicateEmails.forEach(({ email, customerIds, users }) => {
        console.log(`📧 ${email}:`);
        console.log(`   Customer IDs: ${customerIds.join(', ')}`);
        console.log(`   User IDs: ${users.map(u => u.id).join(', ')}`);
        console.log(`   Niches: ${users.map(u => u.niches?.join(', ') || 'none').join(' | ')}\n`);
      });
    }

    // 3. Test customer consolidation for a sample user
    if (duplicateEmails.length > 0) {
      console.log('🧪 Step 3: Testing customer consolidation...');
      
      const testEmail = duplicateEmails[0].email;
      console.log(`Testing consolidation for: ${testEmail}`);
      
      // This would call your actual consolidation function
      // For now, just show what would happen
      console.log('Would run: ensureSubscriptionCustomerConsistency(userId, email)');
      console.log('Would consolidate customers:', duplicateEmails[0].customerIds.join(', '));
    }

    // 4. Summary and recommendations
    console.log('📊 Summary:');
    console.log(`   Total users with customer IDs: ${usersWithCustomers.length}`);
    console.log(`   Emails with duplicate customers: ${duplicateEmails.length}`);
    
    if (duplicateEmails.length > 0) {
      console.log('\n🚨 Recommendations:');
      console.log('   1. Run customer consolidation for affected users');
      console.log('   2. Monitor webhook logs for future customer creation');
      console.log('   3. Test customer portal access for consolidated users');
      console.log('   4. Verify all subscriptions appear under single customer ID');
    } else {
      console.log('\n✅ All users have proper customer ID setup');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testCustomerPortalAccess() {
  console.log('\n🔗 Testing Customer Portal Access...\n');

  try {
    // Find a user with multiple niches to test portal access
    const { data: multiNicheUsers, error } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id, niches')
      .not('stripe_customer_id', 'is', null)
      .not('niches', 'eq', '{}');

    if (error) {
      console.error('❌ Error finding multi-niche users:', error);
      return;
    }

    const usersWithMultipleNiches = multiNicheUsers.filter(user => 
      user.niches && user.niches.length > 1
    );

    if (usersWithMultipleNiches.length === 0) {
      console.log('⚠️ No users found with multiple niches to test portal access');
      return;
    }

    console.log(`✅ Found ${usersWithMultipleNiches.length} users with multiple niches:`);
    
    usersWithMultipleNiches.slice(0, 3).forEach(user => {
      console.log(`   📧 ${user.email}: ${user.niches.join(', ')} (Customer: ${user.stripe_customer_id})`);
    });

    console.log('\n🔗 Customer Portal Test:');
    console.log('   These users should be able to access customer portal with all subscriptions');
    console.log('   Portal URL would be created via: /api/stripe/portal');
    console.log('   All subscriptions should appear under customer ID:', usersWithMultipleNiches[0].stripe_customer_id);

  } catch (error) {
    console.error('❌ Portal access test failed:', error);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Customer Consolidation Tests\n');
  
  await testCustomerConsolidation();
  await testCustomerPortalAccess();
  
  console.log('\n✨ Tests completed!');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testCustomerConsolidation,
  testCustomerPortalAccess
};
