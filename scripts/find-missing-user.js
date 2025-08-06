const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

async function findMissingUser() {
  try {
    console.log('🔧 Finding missing user for Stripe customer...\n');

    const customerId = 'cus_SoYS8Apu07B9pB';
    const customerEmail = 'stevenvitoratos@gmail.com';

    // 1. Get customer details from Stripe
    console.log('1️⃣ Getting Stripe customer details...');
    const customer = await stripe.customers.retrieve(customerId);
    console.log(`✅ Stripe Customer: ${customer.email} (${customer.id})`);
    console.log(`   Created: ${new Date(customer.created * 1000).toLocaleDateString()}`);
    console.log(`   Metadata:`, customer.metadata);

    // 2. Get subscription details
    console.log('\n2️⃣ Getting subscription details...');
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10
    });

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      console.log(`✅ Active Subscription: ${subscription.id}`);
      console.log(`   Status: ${subscription.status}`);
      console.log(`   Created: ${new Date(subscription.created * 1000).toLocaleDateString()}`);
      console.log(`   Metadata:`, subscription.metadata);
    }

    // 3. Search for user by email in database
    console.log('\n3️⃣ Searching for user by email in database...');
    const { data: usersByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', customerEmail);

    if (emailError) {
      console.log('❌ Error searching by email:', emailError);
    } else {
      console.log(`✅ Found ${usersByEmail.length} users with email: ${customerEmail}`);
      usersByEmail.forEach((user, index) => {
        console.log(`   ${index + 1}. User ID: ${user.id}`);
        console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`);
        console.log(`      Stripe Customer ID: ${user.stripe_customer_id || 'None'}`);
        console.log(`      Subscription Status: ${user.subscription_status || 'None'}`);
        console.log(`      Onboarding Completed: ${user.onboarding_completed || false}`);
      });
    }

    // 4. Search for user by Stripe customer ID
    console.log('\n4️⃣ Searching for user by Stripe customer ID...');
    const { data: usersByCustomerId, error: customerIdError } = await supabase
      .from('users')
      .select('*')
      .eq('stripe_customer_id', customerId);

    if (customerIdError) {
      console.log('❌ Error searching by customer ID:', customerIdError);
    } else {
      console.log(`✅ Found ${usersByCustomerId.length} users with Stripe customer ID: ${customerId}`);
      usersByCustomerId.forEach((user, index) => {
        console.log(`   ${index + 1}. User ID: ${user.id}`);
        console.log(`      Email: ${user.email || 'No email'}`);
        console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`);
        console.log(`      Subscription Status: ${user.subscription_status || 'None'}`);
      });
    }

    // 5. Get all users to see if there's a pattern
    console.log('\n5️⃣ Checking all users for patterns...');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (allUsersError) {
      console.log('❌ Error fetching all users:', allUsersError);
    } else {
      console.log(`✅ Total users in database: ${allUsers.length}`);
      
      // Find users with similar email patterns
      const similarUsers = allUsers.filter(user => 
        user.email && (
          user.email.includes('stevenvitoratos') || 
          user.email.includes('steven') ||
          user.email.includes('vitoratos')
        )
      );

      console.log(`\n   Users with similar email patterns: ${similarUsers.length}`);
      similarUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.id})`);
        console.log(`      Stripe Customer ID: ${user.stripe_customer_id || 'None'}`);
        console.log(`      Subscription Status: ${user.subscription_status || 'None'}`);
        console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`);
      });
    }

    // 6. Check if we need to create a user or update an existing one
    console.log('\n6️⃣ Analysis and recommendations...');
    
    if (usersByEmail.length === 0) {
      console.log('❌ No user found with email:', customerEmail);
      console.log('   Recommendation: Create a new user for this customer');
    } else if (usersByEmail.length === 1) {
      const user = usersByEmail[0];
      console.log('✅ Found user with matching email:', user.email);
      
      if (!user.stripe_customer_id) {
        console.log('   🔧 User exists but has no Stripe customer ID');
        console.log('   Recommendation: Update user with Stripe customer ID and subscription details');
      } else if (user.stripe_customer_id !== customerId) {
        console.log('   ⚠️  User has different Stripe customer ID');
        console.log(`   Current: ${user.stripe_customer_id}`);
        console.log(`   Expected: ${customerId}`);
        console.log('   Recommendation: Update user with correct Stripe customer ID');
      } else {
        console.log('   ✅ User already has correct Stripe customer ID');
      }
    } else {
      console.log('⚠️  Multiple users found with same email');
      console.log('   Recommendation: Review and consolidate users');
    }

    console.log('\n🎉 Analysis completed!');

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
if (require.main === module) {
  findMissingUser();
}

module.exports = { findMissingUser }; 