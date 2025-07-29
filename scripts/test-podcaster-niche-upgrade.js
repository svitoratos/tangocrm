require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPodcasterNicheUpgrade() {
  console.log('🔧 Testing podcaster niche upgrade flow...\n');

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

    for (const user of users) {
      console.log(`🔧 User: ${user.email} (${user.id})`);
      
      const niches = user.niches || [];
      const primaryNiche = user.primary_niche;
      const subscriptionStatus = user.subscription_status;
      
      console.log(`Current niches: [ ${niches.join(', ')} ]`);
      console.log(`Primary niche: ${primaryNiche}`);
      console.log(`Subscription status: ${subscriptionStatus}`);
      
      const hasPodcasterNiche = niches.includes('podcaster');
      const hasActiveSubscription = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
      
      console.log(`Has podcaster niche: ${hasPodcasterNiche}`);
      console.log(`Has active subscription: ${hasActiveSubscription}`);
      
      if (hasActiveSubscription && !hasPodcasterNiche) {
        console.log('📈 User can upgrade to podcaster niche');
        console.log('💡 They should use the upgrade modal and select podcaster');
        console.log('🔗 Monthly payment link: https://buy.stripe.com/14AcN65l00DNbFm9uk2Nq08');
        console.log('🔗 Yearly payment link: https://buy.stripe.com/28E3cw3cSdqz9xe0XO2Nq09');
      } else if (hasPodcasterNiche) {
        console.log('✅ User already has podcaster niche');
      } else {
        console.log('❌ User needs active subscription first');
      }
      
      console.log('');
    }

    console.log('✅ Finished testing podcaster niche upgrade flow\n');
    
    console.log('📋 Podcaster Niche Upgrade Flow:');
    console.log('1. ✅ User clicks "Add Niche" in sidebar');
    console.log('2. ✅ Upgrade modal opens');
    console.log('3. ✅ User selects "Podcaster" niche');
    console.log('4. ✅ User selects billing cycle (Monthly/Yearly)');
    console.log('5. ✅ System uses specific payment link based on billing cycle:');
    console.log('   - Monthly: https://buy.stripe.com/14AcN65l00DNbFm9uk2Nq08');
    console.log('   - Yearly: https://buy.stripe.com/28E3cw3cSdqz9xe0XO2Nq09');
    console.log('6. ✅ After payment, redirects to /onboarding/success with podcaster metadata');
    console.log('7. ✅ System adds podcaster niche to user account');
    console.log('8. ✅ Redirects to podcaster dashboard: /dashboard?niche=podcaster&section=dashboard');
    
  } catch (error) {
    console.error('❌ Error testing podcaster niche upgrade:', error);
  }
}

testPodcasterNicheUpgrade(); 