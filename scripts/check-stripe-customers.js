const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

async function checkStripeCustomers() {
  try {
    console.log('🔧 Checking Stripe customers...\n');

    // 1. List all customers
    console.log('1️⃣ Listing all Stripe customers...');
    const { data: customers } = await stripe.customers.list({ limit: 50 });
    
    console.log(`✅ Found ${customers.length} Stripe customers:`);
    
    const emailCounts = {};
    customers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.email} (${customer.id})`);
      console.log(`      Created: ${new Date(customer.created * 1000).toLocaleDateString()}`);
      console.log(`      Metadata:`, customer.metadata);
      console.log(`      Name: ${customer.name || 'N/A'}`);
      console.log(`      Phone: ${customer.phone || 'N/A'}`);
      
      // Count emails
      if (emailCounts[customer.email]) {
        emailCounts[customer.email]++;
      } else {
        emailCounts[customer.email] = 1;
      }
    });

    // 2. Check for duplicate emails
    console.log('\n2️⃣ Checking for duplicate emails...');
    const duplicateEmails = Object.entries(emailCounts).filter(([email, count]) => count > 1);
    
    if (duplicateEmails.length > 0) {
      console.log(`⚠️  Found ${duplicateEmails.length} emails with multiple customers:`);
      duplicateEmails.forEach(([email, count]) => {
        console.log(`   ${email}: ${count} customers`);
      });
    } else {
      console.log('✅ No duplicate emails found');
    }

    // 3. Check specific problematic email
    console.log('\n3️⃣ Checking for stevenvitoratos@gmail.com customers...');
    const stevenCustomers = customers.filter(c => c.email === 'stevenvitoratos@gmail.com');
    
    if (stevenCustomers.length > 0) {
      console.log(`🚨 Found ${stevenCustomers.length} customers with stevenvitoratos@gmail.com:`);
      stevenCustomers.forEach((customer, index) => {
        console.log(`   ${index + 1}. Customer ID: ${customer.id}`);
        console.log(`      Created: ${new Date(customer.created * 1000).toLocaleDateString()}`);
        console.log(`      Metadata:`, customer.metadata);
        
        // Check if this customer has subscriptions
        console.log(`      Checking subscriptions...`);
      });
      
      // Check subscriptions for these customers
      for (const customer of stevenCustomers) {
        try {
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            limit: 10
          });
          
          console.log(`   Customer ${customer.id} has ${subscriptions.data.length} subscriptions:`);
          subscriptions.data.forEach((sub, index) => {
            console.log(`      ${index + 1}. ${sub.id} - Status: ${sub.status}`);
            console.log(`         Created: ${new Date(sub.created * 1000).toLocaleDateString()}`);
            console.log(`         Metadata:`, sub.metadata);
          });
        } catch (error) {
          console.log(`   ❌ Error checking subscriptions for ${customer.id}:`, error.message);
        }
      }
    } else {
      console.log('✅ No customers found with stevenvitoratos@gmail.com');
    }

    // 4. Check checkout sessions
    console.log('\n4️⃣ Checking recent checkout sessions...');
    const { data: sessions } = await stripe.checkout.sessions.list({ limit: 20 });
    
    console.log(`✅ Found ${sessions.length} recent checkout sessions:`);
    sessions.forEach((session, index) => {
      console.log(`   ${index + 1}. Session: ${session.id}`);
      console.log(`      Customer Email: ${session.customer_details?.email || 'N/A'}`);
      console.log(`      Customer ID: ${session.customer || 'N/A'}`);
      console.log(`      Status: ${session.status}`);
      console.log(`      Created: ${new Date(session.created * 1000).toLocaleDateString()}`);
      console.log(`      Metadata:`, session.metadata);
    });

    // 5. Check for customers created via checkout sessions
    console.log('\n5️⃣ Analyzing checkout session patterns...');
    const emailPatterns = {};
    
    sessions.forEach(session => {
      const email = session.customer_details?.email || session.metadata?.email || 'unknown';
      if (emailPatterns[email]) {
        emailPatterns[email]++;
      } else {
        emailPatterns[email] = 1;
      }
    });
    
    console.log('Email patterns in checkout sessions:');
    Object.entries(emailPatterns).forEach(([email, count]) => {
      console.log(`   ${email}: ${count} sessions`);
    });

    console.log('\n🎉 Stripe customer analysis completed!');

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
if (require.main === module) {
  checkStripeCustomers();
}

module.exports = { checkStripeCustomers }; 