// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Use dynamic imports for ES modules
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Initialize Stripe and Supabase directly
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugCustomerIssue() {
  console.log('🔍 Debugging customer consolidation issue...');
  
  try {
    // Check the specific subscriptions mentioned
    const subscription1 = await stripe.subscriptions.retrieve('sub_1RwQfnIvVfTNGbwuXFUFLVrZ');
    const subscription2 = await stripe.subscriptions.retrieve('sub_1RwQf4IvVfTNGbwuFnrZSkZn');
    
    console.log('📋 Subscription 1 Details:');
    console.log(`   ID: ${subscription1.id}`);
    console.log(`   Customer: ${subscription1.customer}`);
    console.log(`   Status: ${subscription1.status}`);
    console.log(`   Created: ${new Date(subscription1.created * 1000).toISOString()}`);
    console.log(`   Metadata:`, subscription1.metadata);
    
    console.log('📋 Subscription 2 Details:');
    console.log(`   ID: ${subscription2.id}`);
    console.log(`   Customer: ${subscription2.customer}`);
    console.log(`   Status: ${subscription2.status}`);
    console.log(`   Created: ${new Date(subscription2.created * 1000).toISOString()}`);
    console.log(`   Metadata:`, subscription2.metadata);
    
    // Get customer details for both
    const customer1 = await stripe.customers.retrieve(subscription1.customer);
    const customer2 = await stripe.customers.retrieve(subscription2.customer);
    
    console.log('👤 Customer 1 Details:');
    console.log(`   ID: ${customer1.id}`);
    console.log(`   Email: ${customer1.email}`);
    console.log(`   Created: ${new Date(customer1.created * 1000).toISOString()}`);
    console.log(`   Metadata:`, customer1.metadata);
    
    console.log('👤 Customer 2 Details:');
    console.log(`   ID: ${customer2.id}`);
    console.log(`   Email: ${customer2.email}`);
    console.log(`   Created: ${new Date(customer2.created * 1000).toISOString()}`);
    console.log(`   Metadata:`, customer2.metadata);
    
    // Check if they have the same email
    if (customer1.email === customer2.email) {
      console.log('⚠️  ISSUE CONFIRMED: Both customers have the same email!');
      console.log(`   Email: ${customer1.email}`);
      
      // Check database for this user
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, stripe_customer_id')
        .eq('email', customer1.email);
      
      if (error) {
        console.error('❌ Error querying database:', error);
      } else {
        console.log('💾 Database Records:');
        users.forEach((user, index) => {
          console.log(`   User ${index + 1}:`);
          console.log(`     ID: ${user.id}`);
          console.log(`     Email: ${user.email}`);
          console.log(`     Stored Customer ID: ${user.stripe_customer_id}`);
        });
      }
      
      // Find ALL customers with this email in Stripe
      const allCustomers = await stripe.customers.list({
        email: customer1.email,
        limit: 100
      });
      
      console.log(`🔍 All Stripe Customers for ${customer1.email}:`);
      allCustomers.data.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.id} (created: ${new Date(customer.created * 1000).toISOString()})`);
      });
      
    } else {
      console.log('✅ Customers have different emails - this might be expected');
    }
    
    // Get checkout sessions that created these subscriptions
    console.log('🔍 Looking for checkout sessions...');
    const sessions = await stripe.checkout.sessions.list({
      limit: 20
    });
    
    const relevantSessions = sessions.data.filter(session => 
      session.subscription === subscription1.id || session.subscription === subscription2.id
    );
    
    console.log('💳 Relevant Checkout Sessions:');
    relevantSessions.forEach((session, index) => {
      console.log(`   Session ${index + 1}:`);
      console.log(`     ID: ${session.id}`);
      console.log(`     Customer: ${session.customer}`);
      console.log(`     Subscription: ${session.subscription}`);
      console.log(`     Created: ${new Date(session.created * 1000).toISOString()}`);
      console.log(`     Metadata:`, session.metadata);
      console.log(`     Customer Details Email: ${session.customer_details?.email}`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging:', error);
  }
}

debugCustomerIssue();