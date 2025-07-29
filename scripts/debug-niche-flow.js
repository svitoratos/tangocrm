require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugNicheFlow() {
  console.log('🔍 Debugging Niche Upgrade Flow...\n');

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

    console.log('📋 User Profile Analysis:');
    console.log(`Email: ${user.email}`);
    console.log(`User ID: ${user.id}`);
    console.log(`Onboarding Completed: ${user.onboarding_completed}`);
    console.log(`Subscription Status: ${user.subscription_status}`);
    console.log(`Primary Niche: ${user.primary_niche}`);
    console.log(`Current Niches: [ ${(user.niches || []).join(', ')} ]`);
    console.log(`Stripe Customer ID: ${user.stripe_customer_id || 'None'}`);
    console.log(`Last Updated: ${user.updated_at}`);

    // Simulate the payment status API response
    const hasCompletedOnboarding = user.onboarding_completed === true;
    const hasActiveSubscription = user.subscription_status === 'active' || 
                                 user.subscription_status === 'trialing' ||
                                 user.subscription_status === 'past_due';
    
    const primaryNiche = user.primary_niche || 'creator';
    const niches = user.niches || [primaryNiche];

    const paymentStatusResponse = {
      hasCompletedOnboarding,
      hasActiveSubscription,
      subscriptionStatus: user.subscription_status || 'inactive',
      subscriptionTier: user.subscription_tier || 'free',
      primaryNiche,
      niches,
      stripeCustomerId: user.stripe_customer_id
    };

    console.log('\n📊 Payment Status API Response:');
    console.log(JSON.stringify(paymentStatusResponse, null, 2));

    console.log('\n🎯 Expected Dashboard Behavior:');
    console.log(`1. ✅ Onboarding Status: ${hasCompletedOnboarding ? 'COMPLETED' : 'INCOMPLETE'}`);
    console.log(`2. ✅ Subscription Status: ${hasActiveSubscription ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`3. ✅ Available Niches: ${niches.length} niche(s)`);
    console.log(`4. ✅ Niche List: [ ${niches.join(', ')} ]`);
    
    if (niches.length > 1) {
      console.log(`5. ✅ User should see dropdown with: ${niches.join(' ↔ ')}`);
    } else {
      console.log(`5. ⚠️ User only has 1 niche: ${niches[0]}`);
    }

    console.log('\n🔍 Potential Issues:');
    
    // Check for potential issues
    if (!hasCompletedOnboarding) {
      console.log('❌ ISSUE: User has not completed onboarding');
    }
    
    if (!hasActiveSubscription) {
      console.log('⚠️ WARNING: User subscription is inactive - this might affect niche display');
    }
    
    if (niches.length === 1) {
      console.log('⚠️ WARNING: User only has 1 niche - check if upgrade was successful');
    }
    
    if (!user.stripe_customer_id) {
      console.log('⚠️ WARNING: No Stripe customer ID - payment might not be linked');
    }

    console.log('\n🧪 Testing Steps:');
    console.log('1. Open browser console (F12)');
    console.log('2. Navigate to dashboard');
    console.log('3. Look for these logs:');
    console.log('   - "🔧 Initial payment status loaded:"');
    console.log('   - "🎉 Upgrade successful detected!"');
    console.log('   - "🔄 Refreshing payment status..."');
    console.log('4. Check Network tab for /api/user/payment-status calls');
    console.log('5. Verify response contains both niches');
    console.log('6. Try manual refresh from user dropdown');

    console.log('\n🔧 Manual Debugging Commands:');
    console.log('// In browser console, run:');
    console.log('fetch("/api/user/payment-status?t=" + Date.now()).then(r => r.json()).then(console.log)');
    console.log('');
    console.log('// Check if niches are being passed to sidebar:');
    console.log('// Look for "subscribedNiches" in React DevTools');

  } catch (error) {
    console.error('❌ Error debugging niche flow:', error);
  }
}

debugNicheFlow(); 