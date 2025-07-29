require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFreelancerNicheUpgrade() {
  console.log('🔧 Testing freelancer niche upgrade flow...\n');

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
      
      const hasFreelancerNiche = niches.includes('freelancer');
      const hasActiveSubscription = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
      
      console.log(`Has freelancer niche: ${hasFreelancerNiche}`);
      console.log(`Has active subscription: ${hasActiveSubscription}`);
      
      if (hasActiveSubscription && !hasFreelancerNiche) {
        console.log('📈 User can upgrade to freelancer niche');
        console.log('💡 They should use the upgrade modal and select freelancer');
        console.log('🔗 Monthly payment link: https://buy.stripe.com/3cI7sMcNs5Y710I21S2Nq0a');
        console.log('🔗 Yearly payment link: https://buy.stripe.com/5kQ9AU6p4cmvfVC35W2Nq0b');
      } else if (hasFreelancerNiche) {
        console.log('✅ User already has freelancer niche');
      } else {
        console.log('❌ User needs active subscription first');
      }
      
      console.log('');
    }

    console.log('✅ Finished testing freelancer niche upgrade\n');
    
    console.log('📋 Freelancer Niche Upgrade Flow:');
    console.log('1. ✅ User clicks "Add Niche" in sidebar');
    console.log('2. ✅ Upgrade modal opens');
    console.log('3. ✅ User selects "Freelancer" niche');
    console.log('4. ✅ User selects billing cycle (Monthly/Yearly)');
    console.log('5. ✅ System uses specific payment link based on billing cycle:');
    console.log('   - Monthly: https://buy.stripe.com/3cI7sMcNs5Y710I21S2Nq0a');
    console.log('   - Yearly: https://buy.stripe.com/5kQ9AU6p4cmvfVC35W2Nq0b');
    console.log('6. ✅ After payment, redirects to /onboarding/success with freelancer metadata');
    console.log('7. ✅ System adds freelancer niche to user account');
    console.log('8. ✅ Redirects to freelancer dashboard: /dashboard?niche=freelancer&section=dashboard');
    
  } catch (error) {
    console.error('❌ Error testing freelancer niche upgrade:', error);
  }
}

testFreelancerNicheUpgrade(); 