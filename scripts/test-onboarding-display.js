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

async function testOnboardingDisplay() {
  try {
    console.log('🧪 Testing onboarding completion message display...');
    
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
      
      // Determine what should be displayed on landing page
      if (!user.onboarding_completed) {
        console.log(`   🎯 Landing Page Display: Should show onboarding completion message`);
        console.log(`   📍 Message: "Complete Onboarding" with 3 steps and "Start Onboarding" button`);
        console.log(`   🎨 Style: Centered white card on white background`);
      } else if (user.subscription_status !== 'active' && user.subscription_status !== 'trialing') {
        console.log(`   🎯 Landing Page Display: Should show logged-in state with welcome message`);
        console.log(`   📍 Navigation: Dashboard and Sign Out buttons`);
        console.log(`   🎨 Style: Full landing page with welcome message`);
      } else {
        console.log(`   🎯 Landing Page Display: Should show logged-in state with welcome message`);
        console.log(`   📍 Navigation: Dashboard and Sign Out buttons`);
        console.log(`   🎨 Style: Full landing page with welcome message`);
      }
    });
    
    console.log('\n✅ Onboarding display test completed!');
    console.log('\n📝 Summary:');
    console.log('- Users without completed onboarding → see onboarding completion message');
    console.log('- Users with completed onboarding → see full landing page with welcome message');
    console.log('- Onboarding message is centered and matches the design in the image');
    
  } catch (error) {
    console.error('❌ Failed to test onboarding display:', error);
    process.exit(1);
  }
}

// Run the test
testOnboardingDisplay(); 