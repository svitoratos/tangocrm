const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

async function testStripeSetup() {
  try {
    console.log('🔧 Testing Stripe Setup...\n');

    // 1. Test API connection
    console.log('1️⃣ Testing API connection...');
    try {
      const account = await stripe.accounts.retrieve();
      console.log('✅ Stripe API connection successful');
      console.log(`   Account ID: ${account.id}`);
      console.log(`   Account Type: ${account.type}`);
      console.log(`   Charges Enabled: ${account.charges_enabled}`);
      console.log(`   Payouts Enabled: ${account.payouts_enabled}`);
    } catch (error) {
      console.log('❌ Stripe API connection failed:', error.message);
      return;
    }

    // 2. Check products
    console.log('\n2️⃣ Checking products...');
    try {
      const products = await stripe.products.list({ limit: 10 });
      console.log(`✅ Found ${products.data.length} products`);
      
      if (products.data.length === 0) {
        console.log('⚠️  No products found. You need to create products first.');
      } else {
        products.data.forEach(product => {
          console.log(`   - ${product.name} (${product.id})`);
          if (product.metadata?.niche) {
            console.log(`     Niche: ${product.metadata.niche}`);
          }
        });
      }
    } catch (error) {
      console.log('❌ Failed to retrieve products:', error.message);
    }

    // 3. Check prices
    console.log('\n3️⃣ Checking prices...');
    try {
      const prices = await stripe.prices.list({ limit: 20 });
      console.log(`✅ Found ${prices.data.length} prices`);
      
      if (prices.data.length === 0) {
        console.log('⚠️  No prices found. You need to create prices first.');
      } else {
        prices.data.forEach(price => {
          const amount = (price.unit_amount / 100).toFixed(2);
          console.log(`   - ${amount} ${price.currency.toUpperCase()} / ${price.recurring?.interval} (${price.id})`);
          if (price.metadata?.niche) {
            console.log(`     Niche: ${price.metadata.niche}`);
          }
        });
      }
    } catch (error) {
      console.log('❌ Failed to retrieve prices:', error.message);
    }

    // 4. Check customers
    console.log('\n4️⃣ Checking customers...');
    try {
      const customers = await stripe.customers.list({ limit: 5 });
      console.log(`✅ Found ${customers.data.length} customers`);
      
      if (customers.data.length === 0) {
        console.log('⚠️  No customers found. This is normal for a new setup.');
      } else {
        customers.data.forEach(customer => {
          console.log(`   - ${customer.email} (${customer.id})`);
          console.log(`     Created: ${new Date(customer.created * 1000).toLocaleDateString()}`);
        });
      }
    } catch (error) {
      console.log('❌ Failed to retrieve customers:', error.message);
    }

    // 5. Check subscriptions
    console.log('\n5️⃣ Checking subscriptions...');
    try {
      const subscriptions = await stripe.subscriptions.list({ limit: 5 });
      console.log(`✅ Found ${subscriptions.data.length} subscriptions`);
      
      if (subscriptions.data.length === 0) {
        console.log('⚠️  No subscriptions found. This is normal for a new setup.');
      } else {
        subscriptions.data.forEach(sub => {
          console.log(`   - ${sub.id} (${sub.status})`);
          console.log(`     Customer: ${sub.customer}`);
          console.log(`     Created: ${new Date(sub.created * 1000).toLocaleDateString()}`);
        });
      }
    } catch (error) {
      console.log('❌ Failed to retrieve subscriptions:', error.message);
    }

    // 6. Check portal configurations
    console.log('\n6️⃣ Checking customer portal configurations...');
    try {
      const configurations = await stripe.billingPortal.configurations.list();
      console.log(`✅ Found ${configurations.data.length} portal configurations`);
      
      if (configurations.data.length === 0) {
        console.log('⚠️  No portal configurations found. You need to configure the customer portal.');
        console.log('   Run: node scripts/setup-stripe-portal.js');
      } else {
        configurations.data.forEach(config => {
          console.log(`   - ${config.display_name || 'Default'} (${config.id})`);
          console.log(`     Features enabled:`);
          if (config.features?.customer_update?.enabled) console.log(`       - Customer updates`);
          if (config.features?.invoice_history?.enabled) console.log(`       - Invoice history`);
          if (config.features?.payment_method_update?.enabled) console.log(`       - Payment method updates`);
          if (config.features?.subscription_cancel?.enabled) console.log(`       - Subscription cancellation`);
          if (config.features?.subscription_pause?.enabled) console.log(`       - Subscription pause`);
          if (config.features?.subscription_update?.enabled) console.log(`       - Subscription updates`);
        });
      }
    } catch (error) {
      console.log('❌ Failed to retrieve portal configurations:', error.message);
    }

    // 7. Test portal session creation
    console.log('\n7️⃣ Testing portal session creation...');
    try {
      // Get first customer or create a test one
      let testCustomer;
      const customers = await stripe.customers.list({ limit: 1 });
      
      if (customers.data.length > 0) {
        testCustomer = customers.data[0];
        console.log(`   Using existing customer: ${testCustomer.email}`);
      } else {
        testCustomer = await stripe.customers.create({
          email: 'test@example.com',
          name: 'Test Customer',
          metadata: { test: 'true' }
        });
        console.log(`   Created test customer: ${testCustomer.email}`);
      }

      // Try to create a portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: testCustomer.id,
        return_url: 'http://localhost:3000/dashboard/settings',
      });

      console.log('✅ Portal session creation successful');
      console.log(`   Session URL: ${session.url}`);
      console.log(`   Session ID: ${session.id}`);
      
    } catch (error) {
      console.log('❌ Portal session creation failed:', error.message);
      
      if (error.message.includes('No such customer')) {
        console.log('   This usually means the customer ID is invalid or the customer was deleted.');
      } else if (error.message.includes('portal configuration')) {
        console.log('   You need to configure the customer portal first.');
        console.log('   Run: node scripts/setup-stripe-portal.js');
      }
    }

    // 8. Environment variables check
    console.log('\n8️⃣ Checking environment variables...');
    const requiredVars = [
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET'
    ];

    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        const isTest = value.includes('test');
        const isLive = value.includes('live');
        console.log(`✅ ${varName}: ${isTest ? 'TEST' : isLive ? 'LIVE' : 'UNKNOWN'} mode`);
      } else {
        console.log(`❌ ${varName}: Not set`);
      }
    });

    console.log('\n🎉 Stripe setup test completed!');
    console.log('\n📋 Summary:');
    console.log('- If you see any ❌ errors, fix them before proceeding');
    console.log('- If you see ⚠️ warnings, consider addressing them');
    console.log('- Run the setup script if portal configuration is missing');
    console.log('- Test with real customers once everything is configured');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testStripeSetup();
}

module.exports = { testStripeSetup }; 