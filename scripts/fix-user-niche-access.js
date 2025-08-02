require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserNicheAccess() {
  console.log('🔧 Fixing user niche access issues...\n');

  try {
    // Get all users who have completed onboarding and have Stripe customer IDs
    console.log('📋 Step 1: Finding users with potential niche access issues...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('onboarding_completed', true)
      .not('stripe_customer_id', 'is', null);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users.length} users with completed onboarding and Stripe customer IDs\n`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      console.log(`🔍 Checking user: ${user.email}`);
      
      // Check if user has access issues
      const hasNiches = user.niches && user.niches.length > 0;
      const hasActiveSubscription = user.subscription_status === 'active' || 
                                   user.subscription_status === 'trialing' ||
                                   user.subscription_status === 'past_due';
      const hasAccess = hasActiveSubscription || (hasNiches && user.stripe_customer_id);
      
      console.log(`   - Has niches: ${hasNiches} [${(user.niches || []).join(', ')}]`);
      console.log(`   - Subscription status: ${user.subscription_status}`);
      console.log(`   - Has active subscription: ${hasActiveSubscription}`);
      console.log(`   - Has access: ${hasAccess}`);

      // Check if user needs fixing
      const needsFixing = !hasAccess && hasNiches && user.stripe_customer_id;
      
      if (needsFixing) {
        console.log(`   🔧 User needs fixing - they have niches but no access`);
        
        // Fix the user
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            subscription_tier: 'core',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error(`   ❌ Error fixing user ${user.email}:`, updateError);
        } else {
          console.log(`   ✅ Fixed user ${user.email} - set subscription to active`);
          fixedCount++;
        }
      } else {
        console.log(`   ✅ User ${user.email} has proper access`);
        skippedCount++;
      }
      
      console.log('');
    }

    console.log('📊 Summary:');
    console.log(`   - Total users checked: ${users.length}`);
    console.log(`   - Users fixed: ${fixedCount}`);
    console.log(`   - Users skipped (already correct): ${skippedCount}`);

    if (fixedCount > 0) {
      console.log('\n🎉 Successfully fixed niche access for users!');
      console.log('These users should now see their purchased niches in the sidebar.');
    } else {
      console.log('\n✅ No users needed fixing - all users have proper access.');
    }

  } catch (error) {
    console.error('❌ Fix error:', error);
  }
}

// Also provide a function to fix a specific user
async function fixSpecificUser(email) {
  console.log(`🔧 Fixing specific user: ${email}...\n`);

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      return;
    }

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log('📊 User data:');
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Subscription Status: ${user.subscription_status}`);
    console.log(`   - Niches: [${(user.niches || []).join(', ')}]`);
    console.log(`   - Stripe Customer ID: ${user.stripe_customer_id || 'None'}`);

    // Check if user needs fixing
    const hasNiches = user.niches && user.niches.length > 0;
    const hasActiveSubscription = user.subscription_status === 'active' || 
                                 user.subscription_status === 'trialing' ||
                                 user.subscription_status === 'past_due';
    const hasAccess = hasActiveSubscription || (hasNiches && user.stripe_customer_id);

    if (!hasAccess && hasNiches && user.stripe_customer_id) {
      console.log('🔧 User needs fixing - applying fix...');
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          subscription_tier: 'core',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error fixing user:', updateError);
      } else {
        console.log('✅ User fixed successfully!');
        console.log(`   - New subscription status: ${updatedUser.subscription_status}`);
        console.log(`   - New subscription tier: ${updatedUser.subscription_tier}`);
      }
    } else {
      console.log('✅ User already has proper access');
    }

  } catch (error) {
    console.error('❌ Fix error:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length > 0 && args[0] === '--user' && args[1]) {
  fixSpecificUser(args[1]);
} else {
  fixUserNicheAccess();
} 