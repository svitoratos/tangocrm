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

async function manualSubscriptionFix() {
  try {
    console.log('🔧 Manual subscription fix tool...\n');

    // 1. Show the 4 active subscriptions that need to be fixed
    console.log('1️⃣ Active subscriptions that need to be assigned to correct users:\n');
    
    const subscriptions = [
      {
        id: 'sub_1Rt9kRIvVfTNGbwu7WgvI933',
        customerId: 'cus_SonLLq7sswd9mA',
        created: '8/6/2025'
      },
      {
        id: 'sub_1Rt9grIvVfTNGbwu0nph7ekU',
        customerId: 'cus_SonHONxzRHOrSH', 
        created: '8/6/2025'
      },
      {
        id: 'sub_1Rt9T7IvVfTNGbwuCkgmut3P',
        customerId: 'cus_Son3UcKdzxDjAq',
        created: '8/6/2025'
      },
      {
        id: 'sub_1RsvLlIvVfTNGbwuxKyjWAxS',
        customerId: 'cus_SoYS8Apu07B9pB',
        created: '8/5/2025'
      }
    ];

    subscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.id}`);
      console.log(`      Customer: ${sub.customerId}`);
      console.log(`      Created: ${sub.created}`);
    });

    // 2. Show available users without Stripe customer IDs
    console.log('\n2️⃣ Available users without Stripe customer IDs:\n');
    
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .is('stripe_customer_id', null)
      .order('created_at', { ascending: false });

    const availableUsers = users.filter(user => user.email && user.email !== 'stevenvitoratos@gmail.com');
    
    availableUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.id})`);
      console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log(`      Onboarding: ${user.onboarding_completed || false}`);
    });

    // 3. Manual assignment mapping
    console.log('\n3️⃣ Manual assignment instructions:\n');
    console.log('Based on the analysis, here are the suggested assignments:');
    console.log('');
    
    // Suggest assignments based on creation dates and user patterns
    const suggestedAssignments = [
      {
        subscriptionId: 'sub_1Rt9kRIvVfTNGbwu7WgvI933',
        customerId: 'cus_SonLLq7sswd9mA',
        suggestedUser: availableUsers[0], // user@example.com (created 8/4/2025)
        reason: 'Created around same time (8/4 vs 8/6)'
      },
      {
        subscriptionId: 'sub_1Rt9grIvVfTNGbwu0nph7ekU',
        customerId: 'cus_SonHONxzRHOrSH',
        suggestedUser: availableUsers[1], // support@gotangocrm.com (created 8/3/2025)
        reason: 'Created around same time (8/3 vs 8/6)'
      },
      {
        subscriptionId: 'sub_1Rt9T7IvVfTNGbwuCkgmut3P',
        customerId: 'cus_Son3UcKdzxDjAq',
        suggestedUser: availableUsers[2], // hello@getbondlyapp.com (created 7/30/2025)
        reason: 'Older user, likely early adopter'
      },
      {
        subscriptionId: 'sub_1RsvLlIvVfTNGbwuCkgmut3P',
        customerId: 'cus_SoYS8Apu07B9pB',
        suggestedUser: availableUsers[3], // amanda.carluccio@gmail.com (created 7/29/2025)
        reason: 'Older user, likely early adopter'
      }
    ];

    suggestedAssignments.forEach((assignment, index) => {
      console.log(`   ${index + 1}. Subscription: ${assignment.subscriptionId}`);
      console.log(`      Current Customer: ${assignment.customerId} (stevenvitoratos@gmail.com)`);
      console.log(`      Suggested User: ${assignment.suggestedUser?.email || 'UNKNOWN'} (${assignment.suggestedUser?.id || 'UNKNOWN'})`);
      console.log(`      Reason: ${assignment.reason}`);
      console.log('');
    });

    // 4. Provide fix commands
    console.log('4️⃣ To fix these subscriptions, run the following commands:\n');
    
    suggestedAssignments.forEach((assignment, index) => {
      if (assignment.suggestedUser) {
        console.log(`   # Fix subscription ${index + 1}:`);
        console.log(`   node scripts/fix-single-subscription.js ${assignment.subscriptionId} ${assignment.customerId} ${assignment.suggestedUser.id} ${assignment.suggestedUser.email}`);
        console.log('');
      }
    });

    console.log('5️⃣ Or run the automated fix:');
    console.log('   node scripts/auto-fix-subscriptions.js');
    console.log('');

    console.log('🎉 Manual subscription fix analysis completed!');

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
if (require.main === module) {
  manualSubscriptionFix();
}

module.exports = { manualSubscriptionFix }; 