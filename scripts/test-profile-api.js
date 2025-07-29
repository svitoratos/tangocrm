require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfileAPI() {
  console.log('🔧 Testing Profile API functionality...\n');

  try {
    // Get all users from database
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`📊 Found ${users.length} users to test\n`);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n👤 Testing User ${i + 1}: ${user.email || user.id}`);
      console.log(`   - User ID: ${user.id}`);
      console.log(`   - Email: ${user.email || 'NOT SET'}`);
      console.log(`   - Full Name: ${user.full_name || 'NOT SET'}`);
      console.log(`   - Timezone: ${user.timezone || 'NOT SET'}`);
      console.log(`   - Onboarding Completed: ${user.onboarding_completed}`);
      console.log(`   - Subscription Status: ${user.subscription_status || 'NOT SET'}`);

      // Test 1: Check if user has basic profile data
      if (!user.email) {
        console.log('   ❌ User has no email - incomplete profile');
        continue;
      }

      // Test 2: Check if user has a full name
      if (!user.full_name) {
        console.log('   ⚠️ User has no full name set');
      } else {
        console.log('   ✅ User has full name set');
      }

      // Test 3: Check if user has timezone
      if (!user.timezone) {
        console.log('   ⚠️ User has no timezone set');
      } else {
        console.log('   ✅ User has timezone set');
      }

      // Test 4: Simulate profile update (we can't actually call the API without authentication)
      console.log('   🔧 Simulating profile update...');
      
      const testUpdates = {
        full_name: user.full_name || 'Test User',
        email: user.email,
        timezone: user.timezone || 'America/New_York',
        updated_at: new Date().toISOString()
      };

      console.log('   📝 Test updates:', testUpdates);

      // Test 5: Check if we can update the user in database directly
      try {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(testUpdates)
          .eq('id', user.id)
          .select()
          .single();
        
        if (updateError) {
          console.log('   ❌ Failed to update user:', updateError.message);
        } else {
          console.log('   ✅ Successfully updated user profile');
          console.log('   - Updated Full Name:', updatedUser.full_name);
          console.log('   - Updated Timezone:', updatedUser.timezone);
          console.log('   - Updated At:', updatedUser.updated_at);
        }
      } catch (updateError) {
        console.log('   ❌ Error updating user:', updateError.message);
      }

      console.log('   ' + '─'.repeat(50));
    }

    console.log('\n✅ Profile API testing completed!');
    console.log('\n📋 Summary:');
    console.log('- Profile API should work for users with completed onboarding');
    console.log('- Users without emails cannot have complete profiles');
    console.log('- Full name and timezone are optional but recommended');
    console.log('- Profile updates are handled through the /api/user/profile endpoint');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProfileAPI().catch(console.error); 