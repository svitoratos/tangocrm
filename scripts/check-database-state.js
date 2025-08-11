const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseState() {
  try {
    const email = 'svitoratos13@gmail.com';
    console.log('🔍 Checking database state for:', email);

    // 1. Check if user exists in our database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        console.log('❌ User not found in database');
        console.log('💡 This explains why ensureSingleCustomer is failing!');
        console.log('   The user needs to complete onboarding first.');
        return;
      } else {
        console.error('❌ Error fetching user:', userError);
        return;
      }
    }

    console.log('✅ User found in database:');
    console.log(`  - ID: ${user.id}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Stripe Customer ID: ${user.stripe_customer_id || 'NULL'}`);
    console.log(`  - Subscription Status: ${user.subscription_status}`);
    console.log(`  - Niches: ${JSON.stringify(user.niches || [])}`);
    console.log(`  - Onboarding Completed: ${user.onboarding_completed}`);
    console.log(`  - Created: ${user.created_at}`);
    console.log(`  - Updated: ${user.updated_at}`);

    // 2. Check if there are multiple users with this email
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (allUsersError) {
      console.error('❌ Error fetching all users:', allUsersError);
      return;
    }

    if (allUsers.length > 1) {
      console.log(`\n⚠️ Found ${allUsers.length} users with same email:`);
      allUsers.forEach((u, i) => {
        console.log(`  ${i + 1}. ID: ${u.id}, Stripe: ${u.stripe_customer_id || 'NULL'}`);
      });
    }

    // 3. Check if user has Clerk ID
    if (user.id) {
      console.log(`\n🔍 User has Clerk ID: ${user.id}`);
      console.log('💡 This should work with ensureSingleCustomer');
    }

    // 4. Recommendations
    console.log('\n💡 Recommendations:');
    
    if (!user.stripe_customer_id) {
      console.log('  1. User has no Stripe customer ID - this is expected for first purchase');
      console.log('  2. But subsequent purchases should reuse the first customer ID');
      console.log('  3. The issue is that ensureSingleCustomer is not finding existing customers');
    } else {
      console.log('  1. User has Stripe customer ID - this should work');
      console.log('  2. But multiple customers were still created - logic issue exists');
    }

    console.log('\n🎯 Next Steps:');
    console.log('  1. Fix the ensureSingleCustomer function');
    console.log('  2. Update database to use the primary customer ID');
    console.log('  3. Test with a new purchase to ensure it works');

  } catch (error) {
    console.error('❌ Error checking database state:', error);
  }
}

// Run the check
console.log('🚀 Starting database state check...\n');

checkDatabaseState()
  .then(() => {
    console.log('\n✅ Database check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database check failed:', error);
    process.exit(1);
  });
