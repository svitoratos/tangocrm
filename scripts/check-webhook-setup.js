const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

async function checkWebhookSetup() {
  try {
    console.log('🔧 Checking webhook setup...\n');

    // 1. Check current webhook endpoints
    console.log('1️⃣ Checking existing webhook endpoints...');
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    
    console.log(`✅ Found ${webhooks.data.length} webhook endpoints:`);
    
    if (webhooks.data.length === 0) {
      console.log('❌ No webhook endpoints found. You need to create one.');
    } else {
      webhooks.data.forEach((webhook, index) => {
        console.log(`   ${index + 1}. ${webhook.description || 'No description'} (${webhook.id})`);
        console.log(`      URL: ${webhook.url}`);
        console.log(`      Status: ${webhook.status}`);
        console.log(`      Events: ${webhook.enabled_events.length} events`);
        console.log(`      Created: ${new Date(webhook.created * 1000).toLocaleDateString()}`);
        console.log('');
      });
    }

    // 2. Check if the specific webhook exists
    const targetWebhookId = 'we_1RsV9iIvVfTNGbwuTSg2yAxz';
    console.log(`2️⃣ Checking for specific webhook: ${targetWebhookId}`);
    
    try {
      const webhook = await stripe.webhookEndpoints.retrieve(targetWebhookId);
      console.log('✅ Webhook found:', webhook.description);
      console.log(`   URL: ${webhook.url}`);
      console.log(`   Status: ${webhook.status}`);
    } catch (error) {
      console.log('❌ Webhook not found:', error.message);
      console.log('   This webhook may have been deleted or never existed.');
    }

    // 3. Check environment variables
    console.log('\n3️⃣ Checking environment variables...');
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (stripeKey) {
      const isTest = stripeKey.includes('test');
      const isLive = stripeKey.includes('live');
      console.log(`✅ Stripe Key: ${isTest ? 'TEST' : isLive ? 'LIVE' : 'UNKNOWN'} mode`);
    } else {
      console.log('❌ STRIPE_SECRET_KEY not found');
    }
    
    if (webhookSecret) {
      console.log('✅ STRIPE_WEBHOOK_SECRET is set');
    } else {
      console.log('❌ STRIPE_WEBHOOK_SECRET not found');
    }

    // 4. Provide recommendations
    console.log('\n4️⃣ Recommendations:');
    
    if (webhooks.data.length === 0) {
      console.log('🔧 Create a new webhook endpoint:');
      console.log('   1. Go to Stripe Dashboard → Developers → Webhooks');
      console.log('   2. Click "Add endpoint"');
      console.log('   3. Set URL to: https://yourdomain.com/api/stripe/webhook');
      console.log('   4. Select events: checkout.session.completed, customer.subscription.*, invoice.payment_*');
      console.log('   5. Copy the webhook signing secret to your environment variables');
    } else {
      console.log('🔧 Update your environment variables:');
      console.log('   1. Copy the webhook signing secret from an existing webhook');
      console.log('   2. Update STRIPE_WEBHOOK_SECRET in your .env.local file');
      console.log('   3. Update STRIPE_WEBHOOK_SECRET in your Vercel environment variables');
    }

    console.log('\n🔧 For production deployment:');
    console.log('   1. Use your production domain in the webhook URL');
    console.log('   2. Ensure your webhook endpoint is publicly accessible');
    console.log('   3. Test the webhook using Stripe\'s webhook testing tool');

    console.log('\n🎉 Webhook setup check completed!');

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
if (require.main === module) {
  checkWebhookSetup();
}

module.exports = { checkWebhookSetup }; 