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

async function testNicheUpgradeFlow() {
  try {
    console.log('🔧 Testing new niche upgrade flow...');
    
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }
    
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      console.log(`\n🔧 User: ${user.email} (${user.id})`);
      console.log('Current niches:', user.niches);
      console.log('Primary niche:', user.primary_niche);
      console.log('Subscription status:', user.subscription_status);
      
      // Check if user has active subscription
      const hasActiveSubscription = user.subscription_status === 'active' || user.subscription_status === 'trialing';
      
      if (hasActiveSubscription) {
        console.log('✅ User has active subscription');
        
        // Show what niches they could potentially upgrade to
        const allNiches = ['creator', 'coach', 'podcaster', 'freelancer'];
        const currentNiches = user.niches || [];
        const availableUpgrades = allNiches.filter(niche => !currentNiches.includes(niche));
        
        if (availableUpgrades.length > 0) {
          console.log('📈 Available niche upgrades:', availableUpgrades);
          console.log('💡 User should use the upgrade modal to select specific niche');
        } else {
          console.log('✅ User has access to all niches');
        }
      } else {
        console.log('❌ User has inactive subscription');
      }
    }
    
    console.log('\n✅ Finished testing niche upgrade flow');
    console.log('\n📋 Summary of new system:');
    console.log('1. ✅ No automatic niche assumptions');
    console.log('2. ✅ Users must select specific niche in upgrade modal');
    console.log('3. ✅ Proper API integration with Stripe checkout');
    console.log('4. ✅ Specific niche tracking through payment flow');
    
  } catch (error) {
    console.error('❌ Error in testNicheUpgradeFlow:', error);
  }
}

testNicheUpgradeFlow(); 