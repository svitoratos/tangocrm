require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixHelloUserNiches() {
  console.log('🔧 Fixing hello@gotangocrm.com user niches...\n');

  try {
    const testEmail = 'hello@gotangocrm.com';
    
    console.log('📋 Step 1: Getting current user data...');
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

    console.log('📊 Current user data:');
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Subscription Status: ${user.subscription_status}`);
    console.log(`   - Current Niches: [${(user.niches || []).join(', ')}]`);
    console.log(`   - Primary Niche: ${user.primary_niche}`);
    console.log('');

    // Fix 1: Set subscription status to active (since they paid for the niches)
    console.log('🔧 Fix 1: Setting subscription status to active...');
    const { data: updatedUser1, error: updateError1 } = await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        subscription_tier: 'core',
        updated_at: new Date().toISOString()
      })
      .eq('email', testEmail)
      .select()
      .single();

    if (updateError1) {
      console.error('❌ Error updating subscription status:', updateError1);
      return;
    }

    console.log('✅ Subscription status updated to active');

    // Fix 2: Add missing niches (podcaster and ensure freelancer is there)
    console.log('🔧 Fix 2: Adding missing niches...');
    const currentNiches = updatedUser1.niches || [];
    const requiredNiches = ['creator', 'podcaster', 'freelancer'];
    const updatedNiches = [...new Set([...currentNiches, ...requiredNiches])];

    console.log(`   - Current niches: [${currentNiches.join(', ')}]`);
    console.log(`   - Required niches: [${requiredNiches.join(', ')}]`);
    console.log(`   - Updated niches: [${updatedNiches.join(', ')}]`);

    const { data: updatedUser2, error: updateError2 } = await supabase
      .from('users')
      .update({
        niches: updatedNiches,
        primary_niche: 'creator', // Set primary niche to creator
        updated_at: new Date().toISOString()
      })
      .eq('email', testEmail)
      .select()
      .single();

    if (updateError2) {
      console.error('❌ Error updating niches:', updateError2);
      return;
    }

    console.log('✅ Niches updated successfully');

    // Fix 3: Verify the final state
    console.log('\n📋 Step 2: Verifying final user state...');
    const { data: finalUser, error: finalError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (finalError) {
      console.error('❌ Error fetching final user data:', finalError);
      return;
    }

    console.log('📊 Final user data:');
    console.log(`   - Email: ${finalUser.email}`);
    console.log(`   - Subscription Status: ${finalUser.subscription_status}`);
    console.log(`   - Subscription Tier: ${finalUser.subscription_tier}`);
    console.log(`   - Primary Niche: ${finalUser.primary_niche}`);
    console.log(`   - Niches: [${(finalUser.niches || []).join(', ')}]`);
    console.log(`   - Onboarding Completed: ${finalUser.onboarding_completed}`);
    console.log(`   - Last Updated: ${finalUser.updated_at}`);

    // Simulate the payment status API response
    console.log('\n📋 Step 3: Simulating payment status API response...');
    const hasCompletedOnboarding = finalUser.onboarding_completed === true;
    const hasActiveSubscription = finalUser.subscription_status === 'active' || 
                                 finalUser.subscription_status === 'trialing' ||
                                 finalUser.subscription_status === 'past_due';
    
    const primaryNiche = finalUser.primary_niche || 'creator';
    const niches = finalUser.niches || [primaryNiche];

    const paymentStatusResponse = {
      hasCompletedOnboarding,
      hasActiveSubscription,
      subscriptionStatus: finalUser.subscription_status || 'inactive',
      subscriptionTier: finalUser.subscription_tier || 'free',
      primaryNiche,
      niches,
      stripeCustomerId: finalUser.stripe_customer_id
    };

    console.log('📊 Payment Status API Response:');
    console.log(JSON.stringify(paymentStatusResponse, null, 2));

    // Final verification
    console.log('\n📋 Step 4: Final verification...');
    
    if (hasCompletedOnboarding) {
      console.log('✅ User has completed onboarding');
    } else {
      console.log('❌ User has not completed onboarding');
    }
    
    if (hasActiveSubscription) {
      console.log('✅ User has active subscription');
    } else {
      console.log('❌ User does not have active subscription');
    }
    
    if (niches.includes('podcaster') && niches.includes('freelancer')) {
      console.log('✅ User has both podcaster and freelancer niches');
    } else {
      console.log('❌ User is missing required niches');
    }

    console.log('\n🎉 Fix completed successfully!');
    console.log('The user should now see podcaster and freelancer niches in the sidebar.');

  } catch (error) {
    console.error('❌ Fix error:', error);
  }
}

fixHelloUserNiches(); 