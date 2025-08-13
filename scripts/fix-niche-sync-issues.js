#!/usr/bin/env node

/**
 * Fix Niche Sync Issues Script
 * 
 * This script helps debug and fix issues where users have lost their initial niches
 * due to Stripe sync problems. It will:
 * 1. Find users with missing niches
 * 2. Check their Stripe subscriptions
 * 3. Restore missing niches
 * 4. Ensure proper sync between Stripe and database
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

async function findUsersWithNicheIssues() {
  console.log('🔍 Finding users with potential niche sync issues...\n');
  
  try {
    // Find users with Stripe customer IDs but potentially missing niches
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id, niches, primary_niche, subscription_status')
      .not('stripe_customer_id', 'is', null)
      .not('stripe_customer_id', 'eq', '');

    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }

    console.log(`📊 Found ${users.length} users with Stripe customer IDs\n`);

    const usersWithIssues = [];

    for (const user of users) {
      console.log(`🔍 Checking user: ${user.email}`);
      
      // Get Stripe subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'active',
        limit: 100
      });

      const stripeNiches = [];
      for (const subscription of subscriptions.data) {
        for (const item of subscription.items.data) {
          const niche = priceToNiche[item.price.id];
          if (niche && !stripeNiches.includes(niche)) {
            stripeNiches.push(niche);
          }
        }
      }

      const databaseNiches = user.niches || [];
      
      console.log(`   Database niches: [${databaseNiches.join(', ')}]`);
      console.log(`   Stripe niches: [${stripeNiches.join(', ')}]`);
      console.log(`   Active subscriptions: ${subscriptions.data.length}`);

      // Check for issues
      const missingFromDatabase = stripeNiches.filter(niche => !databaseNiches.includes(niche));
      const missingFromStripe = databaseNiches.filter(niche => !stripeNiches.includes(niche));

      if (missingFromDatabase.length > 0 || missingFromStripe.length > 0) {
        console.log(`   ⚠️  ISSUES FOUND:`);
        if (missingFromDatabase.length > 0) {
          console.log(`      Missing from database: [${missingFromDatabase.join(', ')}]`);
        }
        if (missingFromStripe.length > 0) {
          console.log(`      Missing from Stripe: [${missingFromStripe.join(', ')}]`);
        }
        
        usersWithIssues.push({
          user,
          stripeNiches,
          databaseNiches,
          missingFromDatabase,
          missingFromStripe,
          subscriptions: subscriptions.data
        });
      } else {
        console.log(`   ✅ No issues found`);
      }
      
      console.log('');
    }

    return usersWithIssues;

  } catch (error) {
    console.error('❌ Error finding users with niche issues:', error);
    return [];
  }
}

async function fixUserNiches(userData) {
  const { user, stripeNiches, databaseNiches, missingFromDatabase } = userData;
  
  console.log(`🔧 Fixing niches for user: ${user.email}`);
  
  try {
    // Merge database and Stripe niches
    const mergedNiches = [...new Set([...databaseNiches, ...stripeNiches])];
    
    console.log(`   Current database niches: [${databaseNiches.join(', ')}]`);
    console.log(`   Stripe niches: [${stripeNiches.join(', ')}]`);
    console.log(`   Merged niches: [${mergedNiches.join(', ')}]`);

    // Update database with merged niches
    const { error: updateError } = await supabase
      .from('users')
      .update({
        niches: mergedNiches,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error(`   ❌ Error updating user niches:`, updateError);
      return false;
    }

    console.log(`   ✅ Successfully updated user niches`);
    return true;

  } catch (error) {
    console.error(`   ❌ Error fixing user niches:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Niche Sync Issue Fix Script\n');
  
  // Find users with issues
  const usersWithIssues = await findUsersWithNicheIssues();
  
  if (usersWithIssues.length === 0) {
    console.log('✅ No users with niche sync issues found!');
    return;
  }

  console.log(`\n🔧 Found ${usersWithIssues.length} users with niche sync issues\n`);
  
  // Ask for confirmation
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Do you want to fix these issues? (y/N): ', async (answer) => {
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      return;
    }

    console.log('\n🔧 Starting to fix niche sync issues...\n');
    
    let fixedCount = 0;
    let failedCount = 0;

    for (const userData of usersWithIssues) {
      const success = await fixUserNiches(userData);
      if (success) {
        fixedCount++;
      } else {
        failedCount++;
      }
      console.log('');
    }

    console.log('📊 Fix Summary:');
    console.log(`   ✅ Fixed: ${fixedCount} users`);
    console.log(`   ❌ Failed: ${failedCount} users`);
    console.log(`   📊 Total: ${usersWithIssues.length} users`);
  });
}

// Run the script
main().catch(console.error);
