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

async function fixCustomerNames() {
  try {
    console.log('🔧 Fixing customer names in Stripe...\n');

    // 1. Get all customers with "Stephanos Vitoratos" name
    console.log('1️⃣ Finding customers with "Stephanos Vitoratos" name...');
    const { data: customers } = await stripe.customers.list({ limit: 100 });
    
    const customersWithWrongName = customers.filter(customer => 
      customer.name === 'Stephanos Vitoratos' || 
      customer.name === 'Stephanos Vitoratos'
    );
    
    console.log(`✅ Found ${customersWithWrongName.length} customers with wrong name`);

    // 2. Get all users from database to match with customers
    console.log('\n2️⃣ Getting users from database...');
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    console.log(`✅ Found ${users.length} users in database`);

    // 3. Fix customer names
    console.log('\n3️⃣ Fixing customer names...\n');

    let fixedCount = 0;
    let errorCount = 0;

    for (const customer of customersWithWrongName) {
      console.log(`🔧 Processing customer: ${customer.id} (${customer.email})`);
      console.log(`   Current name: ${customer.name}`);
      
      // Find matching user by email
      const matchingUser = users.find(user => user.email === customer.email);
      
      if (matchingUser) {
        console.log(`   ✅ Found matching user: ${matchingUser.email}`);
        
        // Determine the correct name
        let correctName = '';
        if (matchingUser.full_name) {
          correctName = matchingUser.full_name;
        } else if (matchingUser.first_name && matchingUser.last_name) {
          correctName = `${matchingUser.first_name} ${matchingUser.last_name}`;
        } else {
          // Use email as fallback if no name is available
          correctName = matchingUser.email.split('@')[0];
        }
        
        console.log(`   🔧 Updating name to: ${correctName}`);
        
        try {
          await stripe.customers.update(customer.id, {
            name: correctName
          });
          
          console.log(`   ✅ Successfully updated customer name`);
          fixedCount++;
          
        } catch (error) {
          console.log(`   ❌ Error updating customer: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`   ⚠️  No matching user found for email: ${customer.email}`);
        
        // For customers without matching users, use email as name
        const emailName = customer.email.split('@')[0];
        console.log(`   🔧 Using email as name: ${emailName}`);
        
        try {
          await stripe.customers.update(customer.id, {
            name: emailName
          });
          
          console.log(`   ✅ Successfully updated customer name`);
          fixedCount++;
          
        } catch (error) {
          console.log(`   ❌ Error updating customer: ${error.message}`);
          errorCount++;
        }
      }
      
      console.log('');
    }

    // 4. Summary
    console.log('4️⃣ Fix Summary:');
    console.log(`   ✅ Successfully fixed: ${fixedCount} customer names`);
    console.log(`   ❌ Errors: ${errorCount} customers`);
    console.log(`   🎉 Total processed: ${customersWithWrongName.length} customers`);

    if (fixedCount > 0) {
      console.log('\n5️⃣ Verification:');
      console.log('   Run this command to verify the fix:');
      console.log('   node scripts/check-stripe-customers.js');
    }

    console.log('\n🎉 Customer name fix completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
if (require.main === module) {
  fixCustomerNames();
}

module.exports = { fixCustomerNames }; 