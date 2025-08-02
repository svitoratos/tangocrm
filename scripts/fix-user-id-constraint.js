require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserIdConstraint() {
  console.log('🔧 Fixing user ID with constraint handling...\n');

  try {
    const email = 'hello@gotangocrm.com';
    const oldUserId = 'user_30W87lLw81Koz5V8vqfsw33g6F9';
    const correctUserId = 'user_30YUikU1QBqNiZnHHxrb8uUJs6E';
    
    console.log('📋 Step 1: Checking if user with correct ID already exists...');
    
    // Check if user with correct ID exists
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('*')
      .eq('id', correctUserId)
      .single();

    if (existingUser && !existingError) {
      console.log('✅ User with correct ID already exists!');
      console.log('📊 Existing user data:');
      console.log(`   - User ID: ${existingUser.id}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - Subscription Status: ${existingUser.subscription_status}`);
      console.log(`   - Niches: [${(existingUser.niches || []).join(', ')}]`);
      console.log(`   - Onboarding Completed: ${existingUser.onboarding_completed}`);
      
      // Check if this user needs updating
      const needsUpdate = !existingUser.niches || 
                         existingUser.niches.length === 0 || 
                         !existingUser.onboarding_completed ||
                         existingUser.subscription_status !== 'active';
      
      if (needsUpdate) {
        console.log('\n📋 Step 2: Updating existing user with correct data...');
        
        // Get the good data from the old user
        const { data: oldUser, error: oldError } = await supabase
          .from('users')
          .select('*')
          .eq('id', oldUserId)
          .single();

        if (oldError) {
          console.error('❌ Error getting old user data:', oldError);
          return;
        }

        // Update the existing user with the good data
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: oldUser.subscription_status,
            subscription_tier: oldUser.subscription_tier,
            primary_niche: oldUser.primary_niche,
            niches: oldUser.niches,
            onboarding_completed: oldUser.onboarding_completed,
            stripe_customer_id: oldUser.stripe_customer_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', correctUserId)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Error updating user:', updateError);
          return;
        }

        console.log('✅ Successfully updated user with correct data');
        console.log(`   - Niches: [${(updatedUser.niches || []).join(', ')}]`);
        console.log(`   - Subscription Status: ${updatedUser.subscription_status}`);
        console.log(`   - Onboarding Completed: ${updatedUser.onboarding_completed}`);

        // Delete the old user record
        console.log('\n📋 Step 3: Deleting old user record...');
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', oldUserId);

        if (deleteError) {
          console.error('❌ Error deleting old user record:', deleteError);
        } else {
          console.log('✅ Successfully deleted old user record');
        }
      } else {
        console.log('✅ User already has correct data, just deleting old record...');
        
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
      }
    } else {
      console.log('❌ User with correct ID does not exist');
      console.log('This is unexpected - the frontend should have created this user');
      return;
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

fixUserIdConstraint(); 