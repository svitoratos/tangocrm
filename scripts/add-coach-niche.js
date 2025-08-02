require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCoachNiche() {
  console.log('🔧 Adding coach niche to hello@gotangocrm.com...\n');

  try {
    const email = 'hello@gotangocrm.com';
    const userId = 'user_30YUikU1QBqNiZnHHxrb8uUJs6E';
    
    console.log('📋 Step 1: Getting current user data...');
    
    // Get the current user data
    const { data: currentUser, error: currentError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (currentError) {
      console.error('❌ Error getting current user:', currentError);
      return;
    }

    console.log('📊 Current user data:');
    console.log(`   - User ID: ${currentUser.id}`);
    console.log(`   - Email: ${currentUser.email}`);
    console.log(`   - Current Niches: [${(currentUser.niches || []).join(', ')}]`);
    console.log(`   - Subscription Status: ${currentUser.subscription_status}`);

    // Add coach niche to existing niches
    const currentNiches = currentUser.niches || [];
    const updatedNiches = [...new Set([...currentNiches, 'coach'])];

    console.log(`\n📋 Step 2: Adding coach niche...`);
    console.log(`   - Current niches: [${currentNiches.join(', ')}]`);
    console.log(`   - Updated niches: [${updatedNiches.join(', ')}]`);

    // Update the user with the new niches
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        niches: updatedNiches,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating user niches:', updateError);
      return;
    }

    console.log('✅ Successfully added coach niche');
    console.log(`   - Updated niches: [${(updatedUser.niches || []).join(', ')}]`);

    // Verify the update
    console.log('\n📋 Step 3: Verifying the update...');
    const { data: finalUser, error: finalError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (finalError) {
      console.error('❌ Error verifying user:', finalError);
      return;
    }

    console.log('📊 Final user data:');
    console.log(`   - User ID: ${finalUser.id}`);
    console.log(`   - Email: ${finalUser.email}`);
    console.log(`   - Subscription Status: ${finalUser.subscription_status}`);
    console.log(`   - Subscription Tier: ${finalUser.subscription_tier}`);
    console.log(`   - Primary Niche: ${finalUser.primary_niche}`);
    console.log(`   - Niches: [${(finalUser.niches || []).join(', ')}]`);
    console.log(`   - Onboarding Completed: ${finalUser.onboarding_completed}`);
    console.log(`   - Stripe Customer ID: ${finalUser.stripe_customer_id}`);

    // Simulate the payment status API response
    const hasCompletedOnboarding = finalUser.onboarding_completed === true;
    const hasActiveSubscription = finalUser.subscription_status === 'active' || 
                                 finalUser.subscription_status === 'trialing' ||
                                 finalUser.subscription_status === 'past_due' ||
                                 (finalUser.niches && finalUser.niches.length > 0 && finalUser.stripe_customer_id);
    
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

    console.log('\n📊 Expected Payment Status API Response:');
    console.log(JSON.stringify(paymentStatusResponse, null, 2));

    console.log('\n🎉 Coach niche added successfully!');
    console.log('The user should now see all 4 niches in the sidebar:');
    console.log('   - creator');
    console.log('   - podcaster');
    console.log('   - freelancer');
    console.log('   - coach');
    console.log('\nPlease refresh the page and try again.');

  } catch (error) {
    console.error('❌ Add coach niche error:', error);
  }
}

addCoachNiche(); 