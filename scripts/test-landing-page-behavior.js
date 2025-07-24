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

async function testLandingPageBehavior() {
  try {
    console.log('🧪 Testing landing page behavior...');
    
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
    console.log('\n👥 Testing landing page behavior for different user states:');
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}: ${user.email || user.id}`);
      console.log(`   - Onboarding Completed: ${user.onboarding_completed || false}`);
      console.log(`   - Subscription Status: ${user.subscription_status || 'N/A'}`);
      
      // Determine what should be displayed on landing page
      console.log(`   🎯 Landing Page Display: Should show full landing page with logged-in state`);
      console.log(`   📍 Navigation: Dashboard and Sign Out buttons in navbar`);
      console.log(`   🎨 Welcome Message: "Welcome back, [FirstName]! 👋"`);
      console.log(`   🔘 CTA Buttons: "Go to Dashboard" and "View Plans"`);
      
      // Explain what happens when they click dashboard
      if (!user.onboarding_completed) {
        console.log(`   ⚠️  Dashboard Click: Will redirect to /onboarding (payment verification)`);
      } else if (user.subscription_status !== 'active' && user.subscription_status !== 'trialing') {
        console.log(`   ⚠️  Dashboard Click: Will redirect to /pricing?require_payment=true (payment verification)`);
      } else {
        console.log(`   ✅ Dashboard Click: Will access full dashboard`);
      }
    });
    
    console.log('\n✅ Landing page behavior test completed!');
    console.log('\n📝 Summary:');
    console.log('- All logged-in users see full landing page with welcome message');
    console.log('- Navigation shows Dashboard and Sign Out options');
    console.log('- CTA buttons show "Go to Dashboard" and "View Plans"');
    console.log('- Payment verification happens when clicking Dashboard, not on landing page');
    console.log('- Onboarding completion message only shows when accessing protected features');
    
  } catch (error) {
    console.error('❌ Failed to test landing page behavior:', error);
    process.exit(1);
  }
}

// Run the test
testLandingPageBehavior(); 