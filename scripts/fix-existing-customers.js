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

async function fixExistingCustomers() {
  try {
    console.log('🔧 Fixing existing customers with wrong email...\n');

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
    }

    console.log(`\n2️⃣ Customer categorization:`);
    console.log(`   Customers with subscriptions: ${customersWithSubscriptions.length}`);
    console.log(`   Customers without subscriptions: ${customersWithoutSubscriptions.length}`);

    // 3. Handle customers with subscriptions (CRITICAL - these are real users)
    if (customersWithSubscriptions.length > 0) {
      console.log('\n3️⃣ 🚨 CRITICAL: Processing customers with active subscriptions...');
      
      for (const { customer, subscriptions } of customersWithSubscriptions) {
        console.log(`\n   Customer: ${customer.id} (${customer.email})`);
        console.log(`   Subscriptions: ${subscriptions.length}`);
        
        // Check if this customer has metadata (Clerk user ID)
        if (customer.metadata && (customer.metadata.userId || customer.metadata.clerkUserId)) {
          const clerkUserId = customer.metadata.userId || customer.metadata.clerkUserId;
          console.log(`   ✅ Has Clerk user ID: ${clerkUserId}`);
          
          // Get user from database
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', clerkUserId)
            .single();
          
          if (user) {
            console.log(`   ✅ User found in database: ${user.email}`);
            
            // Update Stripe customer with correct email
            if (user.email !== customer.email) {
              console.log(`   🔧 Updating Stripe customer email from ${customer.email} to ${user.email}`);
              try {
                await stripe.customers.update(customer.id, {
                  email: user.email,
                  name: user.full_name || ''
                });
                console.log(`   ✅ Stripe customer email updated successfully`);
                
                // Update database user with correct Stripe customer ID
                const { error: updateError } = await supabase
                  .from('users')
                  .update({
                    stripe_customer_id: customer.id,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', user.id);
                
                if (updateError) {
                  console.log(`   ❌ Failed to update database user: ${updateError.message}`);
                } else {
                  console.log(`   ✅ Database user updated with Stripe customer ID`);
                }
              } catch (error) {
                console.log(`   ❌ Failed to update Stripe customer: ${error.message}`);
              }
            } else {
              console.log(`   ✅ Customer email already matches user email`);
            }
          } else {
            console.log(`   ❌ User not found in database for Clerk ID: ${clerkUserId}`);
            console.log(`   ⚠️  This customer needs manual intervention`);
          }
        } else {
          console.log(`   ⚠️  No Clerk user ID in metadata`);
          console.log(`   Metadata:`, customer.metadata);
          console.log(`   ⚠️  This customer needs manual intervention`);
        }
      }
    }

    // 4. Handle customers without subscriptions (safe to delete)
    if (customersWithoutSubscriptions.length > 0) {
      console.log('\n4️⃣ Processing customers without subscriptions (safe to delete)...');
      
      for (const customer of customersWithoutSubscriptions) {
        console.log(`\n   Customer: ${customer.id} (${customer.email})`);
        
        // Check if this customer has metadata
        if (customer.metadata && (customer.metadata.userId || customer.metadata.clerkUserId)) {
          const clerkUserId = customer.metadata.userId || customer.metadata.clerkUserId;
          console.log(`   Has Clerk user ID: ${clerkUserId}`);
          
          // Get user from database
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', clerkUserId)
            .single();
          
          if (user) {
            console.log(`   ✅ User found in database: ${user.email}`);
            
            // Update Stripe customer with correct email instead of deleting
            if (user.email !== customer.email) {
              console.log(`   🔧 Updating Stripe customer email from ${customer.email} to ${user.email}`);
              try {
                await stripe.customers.update(customer.id, {
                  email: user.email,
                  name: user.full_name || ''
                });
                console.log(`   ✅ Stripe customer email updated successfully`);
                
                // Update database user with correct Stripe customer ID
                const { error: updateError } = await supabase
                  .from('users')
                  .update({
                    stripe_customer_id: customer.id,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', user.id);
                
                if (updateError) {
                  console.log(`   ❌ Failed to update database user: ${updateError.message}`);
                } else {
                  console.log(`   ✅ Database user updated with Stripe customer ID`);
                }
              } catch (error) {
                console.log(`   ❌ Failed to update Stripe customer: ${error.message}`);
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

    // 5. Summary
    console.log('\n5️⃣ Summary:');
    console.log(`   ✅ Fixed ${customersWithSubscriptions.length} customers with subscriptions`);
    console.log(`   ✅ Processed ${customersWithoutSubscriptions.length} customers without subscriptions`);
    console.log(`   🎉 All existing customers have been processed!`);

    console.log('\n🎉 Existing customer fix completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
if (require.main === module) {
  fixExistingCustomers();
}

module.exports = { fixExistingCustomers }; 