const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSvitoratos13Subscriptions() {
  const email = 'svitoratos13@gmail.com';
  
  console.log('🔍 Checking subscriptions for:', email);
  console.log('================================\n');

  try {
    // 1. Find the customer
    console.log('🔍 Step 1: Finding customer...');
    const customers = await stripe.customers.list({
      email: email,
      limit: 100
    });

    if (customers.data.length === 0) {
      console.log('❌ No customer found');
      return;
    }

    const customer = customers.data[0];
    console.log(`Found customer: ${customer.id}`);

    // 2. Get all subscriptions for this customer
    console.log('\n🔍 Step 2: Getting subscriptions...');
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 100
    });

    console.log(`Total subscriptions: ${subscriptions.data.length}`);
    
    const activeSubscriptions = subscriptions.data.filter(sub => sub.status === 'active');
    console.log(`Active subscriptions: ${activeSubscriptions.length}`);

    // 3. Map price IDs to niches and collect all niches
    const priceToNiche = {
      'price_1Rt8u9IvVfTNGbwuoAxHpYSj': 'creator',
      'price_1Rt8u9IvVfTNGbwug424qIjh': 'creator',
      'price_1Rt8u9IvVfTNGbwu0UI52sRR': 'coach',
      'price_1Rt8u9IvVfTNGbwuH88MMC8I': 'coach',
      'price_1Rt8uAIvVfTNGbwuiwPUarlw': 'podcaster',
      'price_1Rt8uAIvVfTNGbwu9nXGrotw': 'podcaster',
      'price_1Rt8uAIvVfTNGbwupN9yBl9U': 'freelancer',
      'price_1Rt8uBIvVfTNGbwuWxLrbFPu': 'freelancer',
      'price_1RqIA2IvVfTNGbwujqF5AXfU': 'creator',
      'price_1RqIAoIvVfTNGbwuXswPztfk': 'creator',
      'price_1RjmO3IvVfTNGbwuU9KTk44N': 'coach',
      'price_1RkCcMIvVfTNGbwuyFeyMlbZ': 'coach',
      'price_1RqII9IvVfTNGbwuhApqysHX': 'podcaster',
      'price_1RqIIXIvVfTNGbwu8EMGv4OG': 'podcaster',
      'price_1RqIK7IvVfTNGbwuAiFKM7is': 'freelancer',
      'price_1RqIKNIvVfTNGbwuHONiyPQ7': 'freelancer'
    };

    const allNiches = [];
    
    for (const subscription of activeSubscriptions) {
      console.log(`\nSubscription: ${subscription.id} (${subscription.status})`);
      console.log(`  Created: ${new Date(subscription.created * 1000).toISOString()}`);
      
      for (const item of subscription.items.data) {
        const niche = priceToNiche[item.price.id];
        console.log(`  - Price: ${item.price.id} -> Niche: ${niche || 'unknown'}`);
        
        if (niche && !allNiches.includes(niche)) {
          allNiches.push(niche);
        }
      }
    }

    console.log(`\n📋 All niches found: ${allNiches.join(', ')}`);

    // 4. Get current user data from database
    console.log('\n🔍 Step 3: Getting user from database...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('❌ Error getting user:', userError);
      return;
    }

    console.log('Current user data:', {
      id: user.id,
      email: user.email,
      current_customer_id: user.stripe_customer_id,
      current_niches: user.niches,
      subscription_status: user.subscription_status
    });

    // 5. Update database if needed
    console.log('\n🔧 Step 4: Updating database...');
    const updates = {};
    
    if (user.stripe_customer_id !== customer.id) {
      updates.stripe_customer_id = customer.id;
      console.log(`  - Updating customer ID: ${user.stripe_customer_id} -> ${customer.id}`);
    }
    
    if (JSON.stringify(user.niches) !== JSON.stringify(allNiches)) {
      updates.niches = allNiches;
      console.log(`  - Updating niches: ${JSON.stringify(user.niches)} -> ${JSON.stringify(allNiches)}`);
    }
    
    if (activeSubscriptions.length > 0 && user.subscription_status !== 'active') {
      updates.subscription_status = 'active';
      console.log(`  - Updating subscription status: ${user.subscription_status} -> active`);
    }

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('email', email);

      if (updateError) {
        console.error('❌ Error updating database:', updateError);
        return;
      }

      console.log('✅ Database updated successfully');
    } else {
      console.log('✅ No updates needed');
    }

    // 6. Final verification
    console.log('\n🔍 Step 5: Final verification...');
    console.log(`Customer ID: ${customer.id}`);
    console.log(`Active subscriptions: ${activeSubscriptions.length}`);
    console.log(`User niches: ${allNiches.join(', ')}`);
    
    if (activeSubscriptions.length > 0) {
      console.log('\n🎉 Customer portal should now show all subscriptions!');
      console.log('The user should be able to see all their subscriptions in the Stripe customer portal.');
    } else {
      console.log('\n⚠️ No active subscriptions found. User may need to resubscribe.');
    }

  } catch (error) {
    console.error('❌ Error checking subscriptions:', error);
  }
}

// Run the check
checkSvitoratos13Subscriptions().then(() => {
  console.log('\n🏁 Script completed.');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
