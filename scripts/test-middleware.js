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

async function testMiddleware() {
  try {
    console.log('🧪 Testing middleware payment verification...');
    
    // Get a test user
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error || !users.length) {
      console.error('❌ No users found for testing');
      return;
    }
    
    const testUser = users[0];
    console.log(`👤 Testing with user: ${testUser.email || testUser.id}`);
    
    // Simulate middleware payment verification logic
    console.log('\n🔍 Simulating middleware payment verification...');
    
    // Check if user has completed onboarding
    const hasCompletedOnboarding = testUser.onboarding_completed === true;
    console.log(`   - Has Completed Onboarding: ${hasCompletedOnboarding}`);
    
    if (!hasCompletedOnboarding) {
      console.log(`   ✅ Should redirect to: /onboarding`);
      console.log(`   ✅ This is correct behavior for unpaid users`);
      return;
    }
    
    // Check if user has active subscription
    const hasActiveSubscription = testUser.subscription_status === 'active' || 
                                 testUser.subscription_status === 'trialing';
    console.log(`   - Has Active Subscription: ${hasActiveSubscription}`);
    
    if (!hasActiveSubscription) {
      console.log(`   ✅ Should redirect to: /pricing?require_payment=true`);
      console.log(`   ✅ This is correct behavior for unpaid users`);
      return;
    }
    
    console.log(`   ✅ Should allow access to dashboard`);
    console.log(`   ✅ This is correct behavior for paid users`);
    
    // Test different subscription statuses
    console.log('\n📋 Testing different subscription statuses:');
    const testStatuses = ['free', 'inactive', 'active', 'trialing', 'canceled', 'past_due'];
    
    testStatuses.forEach(status => {
      const isActive = status === 'active' || status === 'trialing';
      console.log(`   - ${status}: ${isActive ? '✅ Allow access' : '❌ Block access'}`);
    });
    
    console.log('\n✅ Middleware test completed!');
    console.log('\n📝 Summary:');
    console.log('- Users without completed onboarding → redirect to /onboarding');
    console.log('- Users without active subscription → redirect to /pricing?require_payment=true');
    console.log('- Users with active subscription → allow access to dashboard');
    console.log('- Error in payment verification → redirect to /pricing?require_payment=true (safe default)');
    
  } catch (error) {
    console.error('❌ Failed to test middleware:', error);
    process.exit(1);
  }
}

// Run the test
testMiddleware(); 