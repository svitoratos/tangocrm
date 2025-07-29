require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

async function testPortalAPI() {
  console.log('🔧 Testing Portal API functionality...\n');

  try {
    // Get all users from database
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`📊 Found ${users.length} users to test\n`);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n👤 Testing User ${i + 1}: ${user.email || user.id}`);
      console.log(`   - User ID: ${user.id}`);
      console.log(`   - Email: ${user.email || 'NOT SET'}`);
      console.log(`   - Stripe Customer ID: ${user.stripe_customer_id || 'NOT SET'}`);
      console.log(`   - Onboarding Completed: ${user.onboarding_completed}`);
      console.log(`   - Subscription Status: ${user.subscription_status || 'NOT SET'}`);

      // Test 1: Check if user has email
      if (!user.email) {
        console.log('   ❌ User has no email - cannot create Stripe customer');
        continue;
      }

      // Test 2: Check if Stripe customer exists
      if (user.stripe_customer_id) {
        try {
          const customer = await stripe.customers.retrieve(user.stripe_customer_id);
          console.log('   ✅ Stripe customer exists and is valid');
          console.log(`   - Customer Email: ${customer.email}`);
          console.log(`   - Customer Created: ${new Date(customer.created * 1000).toISOString()}`);
        } catch (stripeError) {
          console.log('   ❌ Stripe customer ID is invalid:', stripeError.message);
          
          // Test 3: Try to create a new customer
          console.log('   🔧 Attempting to create new Stripe customer...');
          try {
            const newCustomer = await stripe.customers.create({
              email: user.email,
              metadata: {
                userId: user.id,
                clerkUserId: user.id
              }
            });
            
            console.log('   ✅ Successfully created new Stripe customer:', newCustomer.id);
            
            // Update user in database
            const { error: updateError } = await supabase
              .from('users')
              .update({ 
                stripe_customer_id: newCustomer.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
            
            if (updateError) {
              console.log('   ❌ Failed to update user with new Stripe customer ID:', updateError);
            } else {
              console.log('   ✅ Updated user with new Stripe customer ID');
            }
          } catch (createError) {
            console.log('   ❌ Failed to create Stripe customer:', createError.message);
          }
        }
      } else {
        // Test 3: Create Stripe customer for user without one
        console.log('   🔧 Creating Stripe customer for user...');
        try {
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              userId: user.id,
              clerkUserId: user.id
            }
          });
          
          console.log('   ✅ Successfully created Stripe customer:', customer.id);
          
          // Update user in database
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              stripe_customer_id: customer.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          
          if (updateError) {
            console.log('   ❌ Failed to update user with Stripe customer ID:', updateError);
          } else {
            console.log('   ✅ Updated user with Stripe customer ID');
          }
        } catch (createError) {
          console.log('   ❌ Failed to create Stripe customer:', createError.message);
        }
      }

      // Test 4: Try to create billing portal session
      console.log('   🔧 Testing billing portal session creation...');
      try {
        // Get updated user data
        const { data: updatedUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (fetchError || !updatedUser) {
          console.log('   ❌ Failed to fetch updated user data:', fetchError);
          continue;
        }

        if (!updatedUser.stripe_customer_id) {
          console.log('   ❌ User still has no Stripe customer ID');
          continue;
        }

        const session = await stripe.billingPortal.sessions.create({
          customer: updatedUser.stripe_customer_id,
          return_url: 'http://localhost:3000/dashboard/settings',
        });
        
        console.log('   ✅ Successfully created billing portal session');
        console.log('   - Portal URL:', session.url);
        console.log('   - Session ID:', session.id);
        
      } catch (sessionError) {
        console.log('   ❌ Failed to create billing portal session:', sessionError.message);
      }

      console.log('   ' + '─'.repeat(50));
    }

    console.log('\n✅ Portal API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPortalAPI().catch(console.error); 