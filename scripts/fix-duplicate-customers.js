// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Use dynamic imports for ES modules
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase environment variables not found');
  process.exit(1);
}

// Initialize Stripe and Supabase directly
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('✅ Environment variables loaded successfully');
console.log('✅ Stripe and Supabase clients initialized');

// Replicate the consolidateCustomers function here
async function consolidateCustomers(customerIds, email, userId) {
  if (customerIds.length === 0) {
    console.log('🔧 No existing customers found, creating new one');
    const newCustomer = await stripe.customers.create({
      email: email,
      metadata: {
        clerk_user_id: userId,
        created_at: new Date().toISOString(),
        source: 'consolidation_script'
      }
    });
    return newCustomer.id;
  }
  
  if (customerIds.length === 1) {
    console.log('✅ Single customer found, using:', customerIds[0]);
    return customerIds[0];
  }
  
  // Multiple customers found - consolidate them
  console.log('🔄 Multiple customers found, consolidating:', customerIds);
  
  const primaryCustomerId = customerIds[0];
  const secondaryCustomerIds = customerIds.slice(1);
  
  // Move all subscriptions to the primary customer
  for (const secondaryCustomerId of secondaryCustomerIds) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: secondaryCustomerId,
        status: 'all'
      });
      
      for (const subscription of subscriptions.data) {
        if (subscription.status === 'active') {
          await stripe.subscriptions.update(subscription.id, {
            customer: primaryCustomerId
          });
          console.log('✅ Moved subscription to primary customer:', subscription.id);
        }
      }
      
      // Delete the secondary customer
      await stripe.customers.del(secondaryCustomerId);
      console.log('✅ Deleted secondary customer:', secondaryCustomerId);
      
    } catch (error) {
      console.error('❌ Error consolidating customer:', secondaryCustomerId, error);
    }
  }
  
  return primaryCustomerId;
}

async function fixDuplicateCustomers() {
  console.log('🔧 Starting duplicate customer consolidation...');
  
  try {
    // Get all users with stripe customer IDs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .not('stripe_customer_id', 'is', null);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    console.log(`📊 Found ${users.length} users with customer IDs`);
    
    let consolidatedCount = 0;
    let processedEmails = new Set();
    
    for (const user of users) {
      try {
        // Skip if we've already processed this email
        if (processedEmails.has(user.email)) {
          console.log(`⏭️ Skipping ${user.email} - already processed`);
          continue;
        }
        
        console.log(`🔍 Processing user: ${user.email} (ID: ${user.id})`);
        
        // Find all customers for this email
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 100
        });
        
        if (customers.data.length > 1) {
          console.log(`📋 Found ${customers.data.length} customers for ${user.email}:`);
          customers.data.forEach((customer, index) => {
            console.log(`   ${index + 1}. ${customer.id} (created: ${new Date(customer.created * 1000).toISOString()})`);
          });
          
          const customerIds = customers.data.map(c => c.id);
          
          // Get all subscriptions for each customer to show what we're consolidating
          for (const customerId of customerIds) {
            const subscriptions = await stripe.subscriptions.list({
              customer: customerId,
              status: 'all'
            });
            console.log(`   Customer ${customerId} has ${subscriptions.data.length} subscriptions:`, 
              subscriptions.data.map(s => `${s.id}(${s.status})`).join(', '));
          }
          
          const primaryCustomerId = await consolidateCustomers(customerIds, user.email, user.id);
          
          // Update the user's customer ID in the database
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              stripe_customer_id: primaryCustomerId,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          
          if (updateError) {
            console.error('❌ Error updating user customer ID:', updateError);
          } else {
            console.log('✅ Updated user database with consolidated customer ID');
          }
          
          console.log(`✅ Consolidated customers for ${user.email} into ${primaryCustomerId}`);
          consolidatedCount++;
          
          // Mark this email as processed
          processedEmails.add(user.email);
          
          // Verify consolidation worked
          const finalCustomers = await stripe.customers.list({
            email: user.email,
            limit: 100
          });
          
          if (finalCustomers.data.length === 1) {
            console.log(`✅ Verification: ${user.email} now has 1 customer (${finalCustomers.data[0].id})`);
            
            // Check subscriptions on the final customer
            const finalSubscriptions = await stripe.subscriptions.list({
              customer: finalCustomers.data[0].id,
              status: 'all'
            });
            console.log(`✅ Final customer has ${finalSubscriptions.data.length} subscriptions`);
          } else {
            console.warn(`⚠️ Warning: ${user.email} still has ${finalCustomers.data.length} customers after consolidation`);
          }
          
        } else if (customers.data.length === 1) {
          console.log(`✅ ${user.email} already has single customer: ${customers.data[0].id}`);
          processedEmails.add(user.email);
        } else {
          console.log(`⚠️ No customers found for ${user.email} in Stripe`);
          processedEmails.add(user.email);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing user ${user.email}:`, error);
      }
    }
    
    console.log(`✅ Duplicate customer consolidation complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total users processed: ${users.length}`);
    console.log(`   - Customers consolidated: ${consolidatedCount}`);
    console.log(`   - Unique emails processed: ${processedEmails.size}`);
    
  } catch (error) {
    console.error('❌ Error during consolidation process:', error);
  }
}

// Add a function to just report on duplicates without fixing them
async function reportDuplicateCustomers() {
  console.log('📊 Reporting on duplicate customers...');
  
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .not('stripe_customer_id', 'is', null);
    
    const emailGroups = {};
    
    for (const user of users) {
      if (!emailGroups[user.email]) {
        emailGroups[user.email] = [];
      }
      emailGroups[user.email].push(user);
    }
    
    let duplicateCount = 0;
    
    for (const [email, userList] of Object.entries(emailGroups)) {
      // Check Stripe for this email
      const customers = await stripe.customers.list({
        email: email,
        limit: 100
      });
      
      if (customers.data.length > 1) {
        console.log(`📋 ${email} has ${customers.data.length} customers in Stripe:`);
        customers.data.forEach((customer, index) => {
          console.log(`   ${index + 1}. ${customer.id} (created: ${new Date(customer.created * 1000).toISOString()})`);
        });
        duplicateCount++;
      }
    }
    
    console.log(`📊 Found ${duplicateCount} emails with duplicate customers`);
    
  } catch (error) {
    console.error('❌ Error reporting duplicates:', error);
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'report') {
  reportDuplicateCustomers();
} else if (command === 'fix') {
  fixDuplicateCustomers();
} else {
  console.log('Usage:');
  console.log('  node scripts/fix-duplicate-customers.js report  # Report duplicates without fixing');
  console.log('  node scripts/fix-duplicate-customers.js fix     # Fix duplicate customers');
}