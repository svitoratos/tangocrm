require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPaymentStatus() {
  console.log('🔧 Testing payment status functionality...\n');

  try {
    // Get the specific user we're testing
    const testEmail = 'hello@gotangocrm.com';
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      return;
    }

    console.log(`🔧 User: ${user.email} (${user.id})`);
    console.log(`Current niches: [ ${(user.niches || []).join(', ')} ]`);
    console.log(`Subscription status: ${user.subscription_status}`);
    console.log(`Onboarding completed: ${user.onboarding_completed}`);
    console.log(`Primary niche: ${user.primary_niche}`);
    console.log(`Stripe customer ID: ${user.stripe_customer_id}`);

    // Simulate what the payment status API should return
    const hasCompletedOnboarding = user.onboarding_completed === true;
    const hasActiveSubscription = user.subscription_status === 'active' || 
                                 user.subscription_status === 'trialing' ||
                                 user.subscription_status === 'past_due';
    
    const primaryNiche = user.primary_niche || 'creator';
    const niches = user.niches || [primaryNiche];

    const simulatedResponse = {
      hasCompletedOnboarding,
      hasActiveSubscription,
      subscriptionStatus: user.subscription_status || 'inactive',
      subscriptionTier: user.subscription_tier || 'free',
      primaryNiche,
      niches,
      stripeCustomerId: user.stripe_customer_id
    };

    console.log('\n📋 Simulated Payment Status API Response:');
    console.log(JSON.stringify(simulatedResponse, null, 2));

    console.log('\n🎯 Expected Dashboard Behavior:');
    console.log(`1. ✅ User has completed onboarding: ${hasCompletedOnboarding}`);
    console.log(`2. ✅ User has active subscription: ${hasActiveSubscription}`);
    console.log(`3. ✅ Available niches: [ ${niches.join(', ')} ]`);
    console.log(`4. ✅ Sidebar should show: ${niches.length} niche(s)`);
    
    if (niches.length > 1) {
      console.log(`5. ✅ User should be able to switch between: ${niches.join(' ↔ ')}`);
    }

    console.log('\n🔍 Debugging Questions:');
    console.log('1. Is the dashboard calling the payment status API?');
    console.log('2. Is the payment status API returning the correct niches?');
    console.log('3. Is the sidebar receiving the updated niches?');
    console.log('4. Is there a caching issue preventing the update?');

  } catch (error) {
    console.error('❌ Error testing payment status:', error);
  }
}

testPaymentStatus(); 