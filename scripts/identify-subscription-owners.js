const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function identifySubscriptionOwners() {
  try {
    console.log('🔧 Identifying subscription owners...\n');

    // 1. Get the 4 active subscriptions
    const subscriptionIds = [
      'sub_1Rt9kRIvVfTNGbwu7WgvI933',
      'sub_1Rt9grIvVfTNGbwu0nph7ekU', 
      'sub_1Rt9T7IvVfTNGbwuCkgmut3P',
      'sub_1RsvLlIvVfTNGbwuxKyjWAxS'
    ];

    console.log('1️⃣ Analyzing active subscriptions...\n');

    for (const subscriptionId of subscriptionIds) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        console.log(`📋 Subscription: ${subscriptionId}`);
        console.log(`   Customer: ${customer.id} (${customer.email})`);
        console.log(`   Status: ${subscription.status}`);
        console.log(`   Created: ${new Date(subscription.created * 1000).toLocaleDateString()}`);
        console.log(`   Customer Created: ${new Date(customer.created * 1000).toLocaleDateString()}`);
        console.log(`   Customer Metadata:`, customer.metadata);
        console.log(`   Subscription Metadata:`, subscription.metadata);
        
        // 2. Check checkout sessions around the subscription creation time
        const subscriptionDate = new Date(subscription.created * 1000);
        const startDate = new Date(subscriptionDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
        const endDate = new Date(subscriptionDate.getTime() + 24 * 60 * 60 * 1000); // 1 day after
        
        console.log(`   🔍 Looking for checkout sessions between ${startDate.toLocaleDateString()} and ${endDate.toLocaleDateString()}`);
        
        const { data: sessions } = await stripe.checkout.sessions.list({
          limit: 50,
          created: {
            gte: Math.floor(startDate.getTime() / 1000),
            lte: Math.floor(endDate.getTime() / 1000)
          }
        });
        
        const relevantSessions = sessions.filter(session => 
          session.subscription === subscriptionId || 
          session.customer === customer.id
        );
        
        if (relevantSessions.length > 0) {
          console.log(`   ✅ Found ${relevantSessions.length} relevant checkout sessions:`);
          relevantSessions.forEach((session, index) => {
            console.log(`      ${index + 1}. Session: ${session.id}`);
            console.log(`         Customer Email: ${session.customer_details?.email || 'N/A'}`);
            console.log(`         Customer ID: ${session.customer || 'N/A'}`);
            console.log(`         Status: ${session.status}`);
            console.log(`         Metadata:`, session.metadata);
          });
        } else {
          console.log(`   ❌ No relevant checkout sessions found`);
        }
        
        console.log('');
        
      } catch (error) {
        console.log(`❌ Error analyzing subscription ${subscriptionId}:`, error.message);
      }
    }

    // 3. Get all database users to see who might be missing Stripe customer IDs
    console.log('2️⃣ Checking database users...\n');
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    console.log(`✅ Found ${users.length} users in database:`);
    
    const usersWithoutStripeCustomer = [];
    const usersWithStripeCustomer = [];
    
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.id})`);
      console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log(`      Stripe Customer ID: ${user.stripe_customer_id || 'NONE'}`);
      console.log(`      Subscription Status: ${user.subscription_status || 'none'}`);
      console.log(`      Onboarding: ${user.onboarding_completed || false}`);
      
      if (!user.stripe_customer_id) {
        usersWithoutStripeCustomer.push(user);
      } else {
        usersWithStripeCustomer.push(user);
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Users without Stripe customer ID: ${usersWithoutStripeCustomer.length}`);
    console.log(`   Users with Stripe customer ID: ${usersWithStripeCustomer.length}`);

    // 4. Suggest potential matches
    if (usersWithoutStripeCustomer.length > 0) {
      console.log(`\n3️⃣ Potential matches for the 4 active subscriptions:`);
      console.log(`   These users don't have Stripe customer IDs and might be the subscription owners:`);
      
      usersWithoutStripeCustomer.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.id})`);
        console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`);
        console.log(`      Subscription Status: ${user.subscription_status || 'none'}`);
      });
    }

    console.log('\n🎉 Subscription owner identification completed!');

  } catch (error) {
    console.error('❌ Identification failed:', error);
  }
}

// Run the identification
if (require.main === module) {
  identifySubscriptionOwners();
}

module.exports = { identifySubscriptionOwners }; 