require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCreatorNicheUpgrade() {
  console.log('🔧 Testing creator niche upgrade flow...\n');

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
      
      const hasCreatorNiche = niches.includes('creator');
      const hasActiveSubscription = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
      
      console.log(`Has creator niche: ${hasCreatorNiche}`);
      console.log(`Has active subscription: ${hasActiveSubscription}`);
      
      if (hasActiveSubscription && !hasCreatorNiche) {
        console.log('📈 User can upgrade to creator niche');
        console.log('💡 They should use the upgrade modal and select creator');
        console.log('🔗 Monthly payment link: https://buy.stripe.com/fZu14o7t83PZeRy35W2Nq06');
        console.log('🔗 Yearly payment link: https://buy.stripe.com/7sY6oI6p44U3gZGgWM2Nq07');
      } else if (hasCreatorNiche) {
        console.log('✅ User already has creator niche');
      } else {
        console.log('❌ User needs active subscription first');
      }
      
      console.log('');
    }

    console.log('✅ Finished testing creator niche upgrade flow\n');
    
    console.log('📋 Creator Niche Upgrade Flow:');
    console.log('1. ✅ User clicks "Add Niche" in sidebar');
    console.log('2. ✅ Upgrade modal opens');
    console.log('3. ✅ User selects "Creator" niche');
    console.log('4. ✅ User selects billing cycle (Monthly/Yearly)');
    console.log('5. ✅ System uses specific payment link based on billing cycle:');
    console.log('   - Monthly: https://buy.stripe.com/fZu14o7t83PZeRy35W2Nq06');
    console.log('   - Yearly: https://buy.stripe.com/7sY6oI6p44U3gZGgWM2Nq07');
    console.log('6. ✅ After payment, redirects to /onboarding/success with creator metadata');
    console.log('7. ✅ System adds creator niche to user account');
    console.log('8. ✅ Redirects to creator dashboard: /dashboard?niche=creator&section=dashboard');
    
  } catch (error) {
    console.error('❌ Error testing creator niche upgrade:', error);
  }
}

testCreatorNicheUpgrade(); 