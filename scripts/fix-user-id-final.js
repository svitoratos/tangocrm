require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserIdFinal() {
  console.log('🔧 Fixing user ID - final solution...\n');

  try {
    const email = 'hello@gotangocrm.com';
    const oldUserId = 'user_30W87lLw81Koz5V8vqfsw33g6F9';
    const correctUserId = 'user_30YUikU1QBqNiZnHHxrb8uUJs6E';
    
    console.log('📋 Step 1: Getting current user data...');
    const { data: currentUser, error: currentError } = await supabase
      .from('users')
      .select('*')
      .eq('id', oldUserId)
      .single();

    if (currentError) {
      console.error('❌ Error getting current user:', currentError);
      return;
    }

    console.log('📊 Current user data:');
    console.log(`   - User ID: ${currentUser.id}`);
    console.log(`   - Email: ${currentUser.email}`);
    console.log(`   - Subscription Status: ${currentUser.subscription_status}`);
    console.log(`   - Niches: [${(currentUser.niches || []).join(', ')}]`);
    console.log(`   - Onboarding Completed: ${currentUser.onboarding_completed}`);

    console.log(`\n📋 Step 2: Creating new user record with correct ID: ${correctUserId}...`);
    
    // Create new user record with correct ID
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: correctUserId,
        email: currentUser.email,
        full_name: currentUser.full_name,
        avatar_url: currentUser.avatar_url,
        timezone: currentUser.timezone || 'UTC',
        primary_niche: currentUser.primary_niche,
        niches: currentUser.niches,
        onboarding_completed: currentUser.onboarding_completed,
        subscription_status: currentUser.subscription_status,
        subscription_tier: currentUser.subscription_tier,
        stripe_customer_id: currentUser.stripe_customer_id,
        created_at: currentUser.created_at,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating new user record:', createError);
      return;
    }

    console.log('✅ Successfully created new user record with correct ID');
    console.log(`   - New User ID: ${newUser.id}`);
    console.log(`   - Niches: [${(newUser.niches || []).join(', ')}]`);
    console.log(`   - Subscription Status: ${newUser.subscription_status}`);

    console.log('\n📋 Step 3: Deleting old user record...');
    
    // Delete the old user record
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', oldUserId);

    if (deleteError) {
      console.error('❌ Error deleting old user record:', deleteError);
    } else {
      console.log('✅ Successfully deleted old user record');
    }

    // Verify the fix
    console.log('\n📋 Step 4: Verifying the fix...');
    const { data: finalUser, error: finalError } = await supabase
      .from('users')
      .select('*')
      .eq('id', correctUserId)
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

    console.log('\n🎉 User ID fixed successfully!');
    console.log('The user should now see their niches in the sidebar.');
    console.log('Please refresh the page and try again.');

  } catch (error) {
    console.error('❌ Fix error:', error);
  }
}

fixUserIdFinal(); 