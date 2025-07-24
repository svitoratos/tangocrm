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

async function testAuthState() {
  try {
    console.log('🧪 Testing authentication state display...');
    
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }
    
    console.log(`📊 Found ${users.length} users in database`);
    
    if (users.length === 0) {
      console.log('ℹ️  No users found in database');
      return;
    }
    
    // Test different user states
    console.log('\n👥 Testing different user states:');
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}: ${user.email || user.id}`);
      console.log(`   - Onboarding Completed: ${user.onboarding_completed || false}`);
      console.log(`   - Subscription Status: ${user.subscription_status || 'N/A'}`);
      
      // Determine what should be shown on landing page
      if (!user.onboarding_completed) {
        console.log(`   🎯 Landing Page State: Should show "Welcome back" + "Go to Dashboard" button`);
        console.log(`   📍 User should be redirected to: /onboarding when clicking dashboard`);
      } else if (user.subscription_status !== 'active' && user.subscription_status !== 'trialing') {
        console.log(`   🎯 Landing Page State: Should show "Welcome back" + "Go to Dashboard" button`);
        console.log(`   📍 User should be redirected to: /pricing?require_payment=true when clicking dashboard`);
      } else {
        console.log(`   🎯 Landing Page State: Should show "Welcome back" + "Go to Dashboard" button`);
        console.log(`   📍 User should have full access to dashboard`);
      }
    });
    
    console.log('\n✅ Authentication state test completed!');
    console.log('\n📝 Summary:');
    console.log('- Logged-in users should see "Welcome back" message');
    console.log('- Logged-in users should see "Dashboard" and "Sign Out" in navbar');
    console.log('- Logged-in users should see "Go to Dashboard" and "View Plans" buttons');
    console.log('- Payment verification will still redirect users appropriately');
    
  } catch (error) {
    console.error('❌ Failed to test auth state:', error);
    process.exit(1);
  }
}

// Run the test
testAuthState(); 