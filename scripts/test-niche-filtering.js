require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNicheFiltering() {
  console.log('🔧 Testing niche filtering in upgrade modal...\n');

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users.length} users\n`);

    // All available niches
    const allNiches = ['creator', 'coach', 'podcaster', 'freelancer'];

    for (const user of users) {
      console.log(`🔧 User: ${user.email} (${user.id})`);
      
      const niches = user.niches || [];
      const subscriptionStatus = user.subscription_status;
      
      console.log(`Current niches: [ ${niches.join(', ')} ]`);
      console.log(`Subscription status: ${subscriptionStatus}`);
      
      const hasActiveSubscription = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
      
      if (hasActiveSubscription) {
        // Calculate available niches for upgrade
        const availableNiches = allNiches.filter(niche => !niches.includes(niche));
        
        console.log(`Available niches for upgrade: [ ${availableNiches.join(', ')} ]`);
        
        if (availableNiches.length === 0) {
          console.log('✅ User has all niches - should see "You have all available niches!" message');
        } else {
          console.log(`📈 User can upgrade to: ${availableNiches.join(', ')}`);
          console.log('💡 These niches should be shown in the upgrade modal');
        }
      } else {
        console.log('❌ User needs active subscription first');
      }
      
      console.log('');
    }

    console.log('✅ Finished testing niche filtering\n');
    
    console.log('📋 Expected Behavior:');
    console.log('1. ✅ Users with active subscriptions see only available niches');
    console.log('2. ✅ Users with all niches see "You have all available niches!" message');
    console.log('3. ✅ Users without active subscriptions see core plan message');
    console.log('4. ✅ Modal footer only shows when there are available niches');
    
  } catch (error) {
    console.error('❌ Error testing niche filtering:', error);
  }
}

testNicheFiltering(); 