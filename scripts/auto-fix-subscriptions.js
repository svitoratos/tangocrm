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

async function autoFixSubscriptions() {
  try {
    console.log('🔧 Automatically fixing subscription assignments...\n');

    // 1. Get available users without Stripe customer IDs
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .is('stripe_customer_id', null)
      .order('created_at', { ascending: false });

    const availableUsers = users.filter(user => user.email && user.email !== 'stevenvitoratos@gmail.com');
    
    console.log(`✅ Found ${availableUsers.length} available users without Stripe customer IDs`);

    // 2. Define the fixes based on the analysis
    const fixes = [
      {
        subscriptionId: 'sub_1Rt9kRIvVfTNGbwu7WgvI933',
        customerId: 'cus_SonLLq7sswd9mA',
        targetUser: availableUsers[0], // user@example.com
        reason: 'Created around same time (8/4 vs 8/6)'
      },
      {
        subscriptionId: 'sub_1Rt9grIvVfTNGbwu0nph7ekU',
        customerId: 'cus_SonHONxzRHOrSH',
        targetUser: availableUsers[1], // support@gotangocrm.com
        reason: 'Created around same time (8/3 vs 8/6)'
      },
      {
        subscriptionId: 'sub_1Rt9T7IvVfTNGbwuCkgmut3P',
        customerId: 'cus_Son3UcKdzxDjAq',
        targetUser: availableUsers[2], // hello@getbondlyapp.com
        reason: 'Older user, likely early adopter'
      },
      {
        subscriptionId: 'sub_1RsvLlIvVfTNGbwuCkgmut3P',
        customerId: 'cus_SoYS8Apu07B9pB',
        targetUser: availableUsers[3], // amanda.carluccio@gmail.com
        reason: 'Older user, likely early adopter'
      }
    ];

    console.log('2️⃣ Applying fixes...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const fix of fixes) {
      if (!fix.targetUser) {
        console.log(`❌ No target user available for subscription ${fix.subscriptionId}`);
        errorCount++;
        continue;
      }

      console.log(`🔧 Fixing subscription: ${fix.subscriptionId}`);
      console.log(`   Current Customer: ${fix.customerId} (stevenvitoratos@gmail.com)`);
      console.log(`   Target User: ${fix.targetUser.email} (${fix.targetUser.id})`);
      console.log(`   Reason: ${fix.reason}`);

      try {
        // 1. Update Stripe customer with correct email
        console.log(`   🔧 Updating Stripe customer email...`);
        await stripe.customers.update(fix.customerId, {
          email: fix.targetUser.email,
          name: fix.targetUser.full_name || ''
        });
        console.log(`   ✅ Stripe customer email updated to: ${fix.targetUser.email}`);

        // 2. Update database user with Stripe customer ID
        console.log(`   🔧 Updating database user...`);
        const { error: updateError } = await supabase
          .from('users')
          .update({
            stripe_customer_id: fix.customerId,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', fix.targetUser.id);

        if (updateError) {
          console.log(`   ❌ Failed to update database user: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Database user updated with Stripe customer ID`);
          successCount++;
        }

        // 3. Add metadata to customer for future reference
        console.log(`   🔧 Adding metadata to Stripe customer...`);
        await stripe.customers.update(fix.customerId, {
          metadata: {
            userId: fix.targetUser.id,
            clerkUserId: fix.targetUser.id,
            fixedAt: new Date().toISOString(),
            originalEmail: 'stevenvitoratos@gmail.com',
            fixedEmail: fix.targetUser.email
          }
        });
        console.log(`   ✅ Metadata added to Stripe customer`);

      } catch (error) {
        console.log(`   ❌ Error fixing subscription: ${error.message}`);
        errorCount++;
      }

      console.log('');
    }

    // 3. Summary
    console.log('3️⃣ Fix Summary:');
    console.log(`   ✅ Successfully fixed: ${successCount} subscriptions`);
    console.log(`   ❌ Errors: ${errorCount} subscriptions`);
    console.log(`   🎉 Total processed: ${fixes.length} subscriptions`);

    if (successCount > 0) {
      console.log('\n4️⃣ Verification:');
      console.log('   Run this command to verify the fix:');
      console.log('   node scripts/check-stripe-customers.js');
    }

    console.log('\n🎉 Automated subscription fix completed!');

  } catch (error) {
    console.error('❌ Auto-fix failed:', error);
  }
}

// Run the auto-fix
if (require.main === module) {
  autoFixSubscriptions();
}

module.exports = { autoFixSubscriptions }; 