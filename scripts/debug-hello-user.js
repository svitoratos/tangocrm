require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-06-30.basil',
});

async function debugHelloUser() {
  console.log('🔍 Debugging hello@gotangocrm.com user...\n');

  try {
    const testEmail = 'hello@gotangocrm.com';
    
    console.log('📋 Step 1: Checking user profile in database...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      return;
    }

    if (!user) {
      console.error('❌ User not found in database');
      return;
    }

    console.log('✅ User found in database:');
    console.log(`   - User ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Stripe Customer ID: ${user.stripe_customer_id || 'NOT SET'}`);
    console.log(`   - Subscription Status: ${user.subscription_status || 'NOT SET'}`);
    console.log(`   - Subscription Tier: ${user.subscription_tier || 'NOT SET'}`);
    console.log(`   - Primary Niche: ${user.primary_niche || 'NOT SET'}`);
    console.log(`   - Niches Array: [${(user.niches || []).join(', ')}]`);
    console.log(`   - Onboarding Completed: ${user.onboarding_completed}`);
    console.log(`   - Last Updated: ${user.updated_at}`);
    console.log('');

    // Check if user has Stripe customer ID
    if (!user.stripe_customer_id) {
      console.log('❌ ISSUE: No Stripe customer ID in database!');
      console.log('   This means the user has never made a payment or the customer ID was not saved.');
      return;
    }

    console.log('📋 Step 2: Checking Stripe customer and subscriptions...');
    try {
      const customer = await stripe.customers.retrieve(user.stripe_customer_id);
      console.log(`✅ Stripe customer found: ${customer.id}`);
      console.log(`   - Customer Email: ${customer.email}`);
      console.log(`   - Customer Created: ${new Date(customer.created * 1000).toISOString()}`);
      
      // Get customer's subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'all',
        limit: 10
      });
      
      console.log(`   - Total Subscriptions: ${subscriptions.data.length}`);
      
      if (subscriptions.data.length > 0) {
        subscriptions.data.forEach((sub, index) => {
          console.log(`   - Subscription ${index + 1}:`);
          console.log(`     * ID: ${sub.id}`);
          console.log(`     * Status: ${sub.status}`);
          console.log(`     * Created: ${new Date(sub.created * 1000).toISOString()}`);
          console.log(`     * Current Period End: ${new Date(sub.current_period_end * 1000).toISOString()}`);
        });
      } else {
        console.log('   - No subscriptions found');
      }
      
    } catch (stripeError) {
      console.error('❌ Error checking Stripe:', stripeError.message);
    }

    console.log('\n📋 Step 3: Simulating payment status API response...');
    
    // Simulate the payment status API logic
    const isAdmin = false; // hello@gotangocrm.com is not admin
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

    console.log('📊 Payment Status API Response:');
    console.log(JSON.stringify(paymentStatusResponse, null, 2));
    console.log('');

    console.log('📋 Step 4: Analysis...');
    
    if (!hasCompletedOnboarding) {
      console.log('❌ ISSUE: User has not completed onboarding');
    } else {
      console.log('✅ User has completed onboarding');
    }
    
    if (!hasActiveSubscription) {
      console.log('❌ ISSUE: User does not have active subscription');
      console.log(`   Current status: ${user.subscription_status || 'NOT SET'}`);
    } else {
      console.log('✅ User has active subscription');
    }
    
    if (!niches || niches.length === 0) {
      console.log('❌ ISSUE: No niches assigned to user');
    } else {
      console.log(`✅ User has ${niches.length} niche(s): [${niches.join(', ')}]`);
    }

    console.log('\n📋 Step 5: Recommended fixes...');
    
    if (!hasCompletedOnboarding) {
      console.log('🔧 Fix 1: Mark user as onboarding completed');
      console.log('   UPDATE users SET onboarding_completed = true WHERE email = \'hello@gotangocrm.com\';');
    }
    
    if (!hasActiveSubscription) {
      console.log('🔧 Fix 2: Set subscription status to active');
      console.log('   UPDATE users SET subscription_status = \'active\' WHERE email = \'hello@gotangocrm.com\';');
    }
    
    if (!niches.includes('podcaster') || !niches.includes('freelancer')) {
      console.log('🔧 Fix 3: Add missing niches');
      console.log('   UPDATE users SET niches = ARRAY[\'creator\', \'podcaster\', \'freelancer\'] WHERE email = \'hello@gotangocrm.com\';');
    }

    console.log('\n📋 Step 6: Testing force refresh...');
    
    // Test the force refresh endpoint logic
    if (hasCompletedOnboarding && user.stripe_customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 1
        });
        
        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          console.log(`✅ Found Stripe subscription: ${subscription.status}`);
          
          if (subscription.status !== user.subscription_status) {
            console.log(`🔧 Database subscription status (${user.subscription_status}) doesn't match Stripe (${subscription.status})`);
            console.log('   This should be updated by the force refresh endpoint');
          }
        } else {
          console.log('⚠️  No Stripe subscriptions found, but user has customer ID');
        }
      } catch (error) {
        console.error('❌ Error checking Stripe subscriptions:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugHelloUser(); 