const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupStripeCustomers() {
  try {
    console.log('🔧 Cleaning up problematic Stripe customers...\n');

    // 1. Get all customers with stevenvitoratos@gmail.com
    console.log('1️⃣ Finding customers with stevenvitoratos@gmail.com...');
    const { data: customers } = await stripe.customers.list({ 
      limit: 100,
      email: 'stevenvitoratos@gmail.com'
    });
    
    console.log(`✅ Found ${customers.length} customers with stevenvitoratos@gmail.com`);

    // 2. Categorize customers
    const customersWithSubscriptions = [];
    const customersWithoutSubscriptions = [];
    const customersWithMetadata = [];

    for (const customer of customers) {
      // Check if customer has subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10
      });

      if (subscriptions.data.length > 0) {
        customersWithSubscriptions.push({
          customer,
          subscriptions: subscriptions.data
        });
      } else {
        customersWithoutSubscriptions.push(customer);
      }

      // Check if customer has metadata (Clerk user ID)
      if (customer.metadata && (customer.metadata.userId || customer.metadata.clerkUserId)) {
        customersWithMetadata.push(customer);
      }
    }

    console.log(`\n2️⃣ Customer categorization:`);
    console.log(`   Customers with subscriptions: ${customersWithSubscriptions.length}`);
    console.log(`   Customers without subscriptions: ${customersWithoutSubscriptions.length}`);
    console.log(`   Customers with metadata: ${customersWithMetadata.length}`);

    // 3. Handle customers with subscriptions (these are likely real users)
    if (customersWithSubscriptions.length > 0) {
      console.log('\n3️⃣ Processing customers with subscriptions...');
      
      for (const { customer, subscriptions } of customersWithSubscriptions) {
        console.log(`\n   Customer: ${customer.id} (${customer.email})`);
        console.log(`   Subscriptions: ${subscriptions.length}`);
        
        // Check if this customer has metadata
        if (customer.metadata && (customer.metadata.userId || customer.metadata.clerkUserId)) {
          const clerkUserId = customer.metadata.userId || customer.metadata.clerkUserId;
          console.log(`   ✅ Has Clerk user ID: ${clerkUserId}`);
          
          // Check if user exists in database
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', clerkUserId)
            .single();
          
          if (user) {
            console.log(`   ✅ User found in database: ${user.email}`);
            
            // Update customer with correct email if different
            if (user.email !== customer.email) {
              console.log(`   🔧 Updating customer email from ${customer.email} to ${user.email}`);
              try {
                await stripe.customers.update(customer.id, {
                  email: user.email,
                  name: user.full_name || ''
                });
                console.log(`   ✅ Customer email updated successfully`);
              } catch (error) {
                console.log(`   ❌ Failed to update customer: ${error.message}`);
              }
            }
          } else {
            console.log(`   ❌ User not found in database for Clerk ID: ${clerkUserId}`);
          }
        } else {
          console.log(`   ⚠️  No Clerk user ID in metadata`);
          console.log(`   Metadata:`, customer.metadata);
        }
      }
    }

    // 4. Handle customers without subscriptions (these can be safely deleted)
    if (customersWithoutSubscriptions.length > 0) {
      console.log('\n4️⃣ Processing customers without subscriptions...');
      
      for (const customer of customersWithoutSubscriptions) {
        console.log(`\n   Customer: ${customer.id} (${customer.email})`);
        
        // Check if this customer has metadata
        if (customer.metadata && (customer.metadata.userId || customer.metadata.clerkUserId)) {
          const clerkUserId = customer.metadata.userId || customer.metadata.clerkUserId;
          console.log(`   Has Clerk user ID: ${clerkUserId}`);
          
          // Check if user exists in database
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', clerkUserId)
            .single();
          
          if (user) {
            console.log(`   ✅ User found in database: ${user.email}`);
            
            // Update customer with correct email
            if (user.email !== customer.email) {
              console.log(`   🔧 Updating customer email from ${customer.email} to ${user.email}`);
              try {
                await stripe.customers.update(customer.id, {
                  email: user.email,
                  name: user.full_name || ''
                });
                console.log(`   ✅ Customer email updated successfully`);
              } catch (error) {
                console.log(`   ❌ Failed to update customer: ${error.message}`);
              }
            }
          } else {
            console.log(`   ❌ User not found in database, deleting customer`);
            try {
              await stripe.customers.del(customer.id);
              console.log(`   ✅ Customer deleted successfully`);
            } catch (error) {
              console.log(`   ❌ Failed to delete customer: ${error.message}`);
            }
          }
        } else {
          console.log(`   ⚠️  No Clerk user ID, deleting customer`);
          try {
            await stripe.customers.del(customer.id);
            console.log(`   ✅ Customer deleted successfully`);
          } catch (error) {
            console.log(`   ❌ Failed to delete customer: ${error.message}`);
          }
        }
      }
    }

    console.log('\n🎉 Stripe customer cleanup completed!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run the cleanup
if (require.main === module) {
  cleanupStripeCustomers();
}

module.exports = { cleanupStripeCustomers }; 