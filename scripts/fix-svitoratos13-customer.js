const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixSvitoratos13Customer() {
  const email = 'svitoratos13@gmail.com';
  
  console.log('🔧 Fixing customer consolidation for:', email);
  console.log('=====================================\n');

  try {
    // 1. Find all customers with this email in Stripe
    console.log('🔍 Step 1: Finding all Stripe customers...');
    const customers = await stripe.customers.list({
      email: email,
      limit: 100
    });

    console.log(`Found ${customers.data.length} customers in Stripe:`);
    customers.data.forEach(customer => {
      console.log(`  - ${customer.id} (created: ${new Date(customer.created * 1000).toISOString()})`);
    });

    if (customers.data.length <= 1) {
      console.log('✅ No duplicate customers found!');
      return;
    }

    // 2. Get user from database
    console.log('\n🔍 Step 2: Getting user from database...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('❌ Error getting user:', userError);
      return;
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      current_customer_id: user.stripe_customer_id,
      niches: user.niches
    });

    // 3. Find the customer with the most active subscriptions
    console.log('\n🔍 Step 3: Finding customer with most subscriptions...');
    let bestCustomer = null;
    let maxSubscriptions = 0;
    let allNiches = [];

    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 100
      });
      
      const activeSubscriptions = subscriptions.data.filter(sub => sub.status === 'active');
      
      console.log(`\nCustomer ${customer.id}:`);
      console.log(`  - Total subscriptions: ${subscriptions.data.length}`);
      console.log(`  - Active subscriptions: ${activeSubscriptions.length}`);
      
      activeSubscriptions.forEach(sub => {
        console.log(`    * ${sub.id}: ${sub.status} - ${sub.items.data.map(item => item.price.id).join(', ')}`);
      });
      
      if (activeSubscriptions.length > maxSubscriptions) {
        maxSubscriptions = activeSubscriptions.length;
        bestCustomer = customer;
      }
      
      // Collect all niches from active subscriptions
      for (const sub of activeSubscriptions) {
        for (const item of sub.items.data) {
          // Map price IDs to niches
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
          
          const niche = priceToNiche[item.price.id];
          if (niche && !allNiches.includes(niche)) {
            allNiches.push(niche);
          }
        }
      }
    }

    if (!bestCustomer) {
      console.log('❌ No customer with active subscriptions found');
      return;
    }

    console.log(`\n🎯 Best customer: ${bestCustomer.id} (${maxSubscriptions} active subscriptions)`);
    console.log(`📋 All niches found: ${allNiches.join(', ')}`);

    // 4. Update database to use the best customer
    console.log('\n🔧 Step 4: Updating database...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        stripe_customer_id: bestCustomer.id,
        niches: allNiches,
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (updateError) {
      console.error('❌ Error updating database:', updateError);
      return;
    }

    console.log('✅ Database updated with best customer ID and all niches');

    // 5. Delete other customers (optional - for cleanup)
    console.log('\n🧹 Step 5: Cleaning up duplicate customers...');
    for (const customer of customers.data) {
      if (customer.id === bestCustomer.id) continue;
      
      try {
        await stripe.customers.del(customer.id);
        console.log(`  ✅ Deleted duplicate customer ${customer.id}`);
      } catch (error) {
        console.log(`  ⚠️ Could not delete customer ${customer.id}: ${error.message}`);
      }
    }

    // 6. Verify final state
    console.log('\n🔍 Step 6: Verifying final state...');
    const finalCustomers = await stripe.customers.list({
      email: email,
      limit: 100
    });

    console.log(`Final customer count: ${finalCustomers.data.length}`);
    
    if (finalCustomers.data.length === 1) {
      console.log('✅ Success! Only one customer remains.');
      
      const finalCustomer = finalCustomers.data[0];
      const finalSubscriptions = await stripe.subscriptions.list({
        customer: finalCustomer.id,
        limit: 100
      });
      
      console.log(`\nFinal customer: ${finalCustomer.id}`);
      console.log(`Total subscriptions: ${finalSubscriptions.data.length}`);
      finalSubscriptions.data.forEach(sub => {
        console.log(`  - ${sub.id}: ${sub.status}`);
      });
      
      console.log('\n🎉 Customer consolidation completed successfully!');
      console.log('The customer portal should now show all subscriptions.');
      console.log(`User now has niches: ${allNiches.join(', ')}`);
      
    } else {
      console.log('⚠️ Multiple customers still exist. Manual intervention may be needed.');
    }

  } catch (error) {
    console.error('❌ Error during customer consolidation:', error);
  }
}

// Run the fix
fixSvitoratos13Customer().then(() => {
  console.log('\n🏁 Script completed.');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
