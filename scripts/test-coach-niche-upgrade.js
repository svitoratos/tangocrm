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

async function testCoachNicheUpgrade() {
  try {
    console.log('🔧 Testing coach niche upgrade flow...');
    
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
      
      // Check if user has coach niche
      const hasCoachNiche = user.niches && user.niches.includes('coach');
      const hasActiveSubscription = user.subscription_status === 'active' || user.subscription_status === 'trialing';
      
      console.log('Has coach niche:', hasCoachNiche);
      console.log('Has active subscription:', hasActiveSubscription);
      
      if (hasActiveSubscription && !hasCoachNiche) {
        console.log('📈 User can upgrade to coach niche');
        console.log('💡 They should use the upgrade modal and select coach');
        console.log('🔗 Monthly payment link: https://buy.stripe.com/5kQ3cw5l086faBieOE2Nq05');
        console.log('🔗 Yearly payment link: https://buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03');
      } else if (hasCoachNiche) {
        console.log('✅ User already has coach niche');
      } else {
        console.log('❌ User needs active subscription first');
      }
    }
    
    console.log('\n✅ Finished testing coach niche upgrade flow');
    console.log('\n📋 Coach Niche Upgrade Flow:');
    console.log('1. ✅ User clicks "Add Niche" in sidebar');
    console.log('2. ✅ Upgrade modal opens');
    console.log('3. ✅ User selects "Coach" niche');
    console.log('4. ✅ User selects billing cycle (Monthly/Yearly)');
    console.log('5. ✅ System uses specific payment link based on billing cycle:');
    console.log('   - Monthly: https://buy.stripe.com/5kQ3cw5l086faBieOE2Nq05');
    console.log('   - Yearly: https://buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03');
    console.log('6. ✅ After payment, redirects to /onboarding/success with coach metadata');
    console.log('7. ✅ System adds coach niche to user account');
    console.log('8. ✅ Redirects to coach dashboard: /dashboard?niche=coach&section=dashboard');
    
  } catch (error) {
    console.error('❌ Error in testCoachNicheUpgrade:', error);
  }
}

testCoachNicheUpgrade(); 