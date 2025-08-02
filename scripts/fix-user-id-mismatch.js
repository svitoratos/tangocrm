require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserIdMismatch() {
  console.log('🔧 Fixing user ID mismatch for hello@gotangocrm.com...\n');

  try {
    const email = 'hello@gotangocrm.com';
    
    console.log('📋 Step 1: Finding user by email...');
    const { data: userByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (emailError) {
      console.error('❌ Error finding user by email:', emailError);
      return;
    }

    if (!userByEmail) {
      console.error('❌ User not found by email');
      return;
    }

    console.log('📊 Current user data:');
    console.log(`   - User ID: ${userByEmail.id}`);
    console.log(`   - Email: ${userByEmail.email}`);
    console.log(`   - Subscription Status: ${userByEmail.subscription_status}`);
    console.log(`   - Niches: [${(userByEmail.niches || []).join(', ')}]`);
    console.log(`   - Onboarding Completed: ${userByEmail.onboarding_completed}`);

    // The correct user ID from the frontend debug logs
    const correctUserId = 'user_30YUikU1QBqNiZnHHxrb8uUJs6E';
    
    console.log(`\n📋 Step 2: Updating user ID from ${userByEmail.id} to ${correctUserId}...`);
    
    // First, check if the correct user ID already exists
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('*')
      .eq('id', correctUserId)
      .single();

    if (existingUser && !existingError) {
      console.log('⚠️  User with correct ID already exists, merging data...');
      
      // Merge the data - keep the better data from the old record
      const mergedNiches = [...new Set([...(existingUser.niches || []), ...(userByEmail.niches || [])])];
      const mergedSubscriptionStatus = userByEmail.subscription_status === 'active' ? 'active' : existingUser.subscription_status;
      const mergedOnboardingCompleted = userByEmail.onboarding_completed || existingUser.onboarding_completed;
      
      console.log(`   - Merged niches: [${mergedNiches.join(', ')}]`);
      console.log(`   - Merged subscription status: ${mergedSubscriptionStatus}`);
      console.log(`   - Merged onboarding completed: ${mergedOnboardingCompleted}`);
      
      // Update the correct user ID with merged data
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          email: email,
          subscription_status: mergedSubscriptionStatus,
          subscription_tier: 'core',
          primary_niche: 'creator',
          niches: mergedNiches,
          onboarding_completed: mergedOnboardingCompleted,
          stripe_customer_id: userByEmail.stripe_customer_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', correctUserId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating user with correct ID:', updateError);
        return;
      }

      console.log('✅ Successfully updated user with correct ID');
      
      // Delete the old user record
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userByEmail.id);

      if (deleteError) {
        console.error('❌ Error deleting old user record:', deleteError);
      } else {
        console.log('✅ Deleted old user record');
      }
      
    } else {
      console.log('📋 Creating new user record with correct ID...');
      
      // Create new user record with correct ID
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: correctUserId,
          email: email,
          subscription_status: userByEmail.subscription_status,
          subscription_tier: 'core',
          primary_niche: 'creator',
          niches: userByEmail.niches,
          onboarding_completed: userByEmail.onboarding_completed,
          stripe_customer_id: userByEmail.stripe_customer_id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating new user record:', createError);
        return;
      }

      console.log('✅ Successfully created new user record with correct ID');
      
      // Delete the old user record
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userByEmail.id);

      if (deleteError) {
        console.error('❌ Error deleting old user record:', deleteError);
      } else {
        console.log('✅ Deleted old user record');
      }
    }

    // Verify the fix
    console.log('\n📋 Step 3: Verifying the fix...');
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

    console.log('\n🎉 User ID mismatch fixed successfully!');
    console.log('The user should now see their niches in the sidebar.');

  } catch (error) {
    console.error('❌ Fix error:', error);
  }
}

fixUserIdMismatch(); 