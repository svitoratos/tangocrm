require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateStripeCustomerId() {
  console.log('🔧 Updating Stripe Customer ID...\n');

  try {
    const userEmail = 'hello@gotangocrm.com';
    const stripeCustomerId = 'cus_Slon7JS8PXERtm';

    console.log(`📋 Updating user: ${userEmail}`);
    console.log(`📋 Stripe Customer ID: ${stripeCustomerId}`);

    // Update the user's profile with the Stripe customer ID
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date().toISOString()
      })
      .eq('email', userEmail)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      return;
    }

    console.log('✅ Successfully updated user profile:');
    console.log(`   - Email: ${updatedUser.email}`);
    console.log(`   - Stripe Customer ID: ${updatedUser.stripe_customer_id}`);
    console.log(`   - Updated At: ${updatedUser.updated_at}`);
    console.log(`   - Niches: [${(updatedUser.niches || []).join(', ')}]`);
    console.log(`   - Subscription Status: ${updatedUser.subscription_status}`);

    console.log('\n🎯 Next Steps:');
    console.log('1. ✅ Stripe customer ID has been added to your profile');
    console.log('2. 🔄 Refresh your billing management page');
    console.log('3. 📊 You should now see real Stripe subscription data');
    console.log('4. 💳 Payment methods and billing history should be available');

  } catch (error) {
    console.error('❌ Error updating Stripe customer ID:', error);
  }
}

updateStripeCustomerId(); 