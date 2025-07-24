const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPaymentVerification() {
  try {
    console.log('🧪 Testing payment verification system...');
    
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }
    
    console.log(`📊 Found ${users.length} users in database`);
    
    if (users.length === 0) {
      console.log('ℹ️  No users found in database');
      return;
    }
    
    // Check each user's payment status
    for (const user of users) {
      console.log(`\n👤 User: ${user.email || user.id}`);
      console.log(`   - Primary Niche: ${user.primary_niche || 'N/A'}`);
      console.log(`   - Niches: ${JSON.stringify(user.niches || [])}`);
      console.log(`   - Onboarding Completed: ${user.onboarding_completed || false}`);
      console.log(`   - Subscription Status: ${user.subscription_status || 'N/A'}`);
      console.log(`   - Subscription Tier: ${user.subscription_tier || 'N/A'}`);
      console.log(`   - Stripe Customer ID: ${user.stripe_customer_id || 'N/A'}`);
      
      // Simulate payment verification logic
      const hasCompletedOnboarding = user.onboarding_completed === true;
      const hasActiveSubscription = user.subscription_status === 'active' || 
                                   user.subscription_status === 'trialing';
      
      console.log(`   - Has Completed Onboarding: ${hasCompletedOnboarding}`);
      console.log(`   - Has Active Subscription: ${hasActiveSubscription}`);
      
      if (!hasCompletedOnboarding) {
        console.log(`   ⚠️  Should be redirected to: /onboarding`);
      } else if (!hasActiveSubscription) {
        console.log(`   ⚠️  Should be redirected to: /pricing?require_payment=true`);
      } else {
        console.log(`   ✅ Should have access to dashboard`);
      }
    }
    
    // Check database schema
    console.log('\n🔍 Checking database schema...');
    
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'users')
      .eq('table_schema', 'public');
    
    if (schemaError) {
      console.log('Note: Could not check schema details:', schemaError.message);
    } else {
      console.log('📋 Users table columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
      });
    }
    
    console.log('\n✅ Payment verification test completed!');
    
  } catch (error) {
    console.error('❌ Failed to test payment verification:', error);
    process.exit(1);
  }
}

// Run the test
testPaymentVerification(); 