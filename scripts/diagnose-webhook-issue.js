#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing Webhook Subscription Issue\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
console.log('- STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing');
console.log('- NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '❌ Not set');

// Check webhook endpoint
console.log('\n2. Webhook Endpoint:');
const webhookPath = path.join(process.cwd(), 'src/app/api/stripe/webhook/route.ts');
console.log('- Webhook handler exists:', fs.existsSync(webhookPath) ? '✅ Yes' : '❌ No');

// Check webhook events handled
if (fs.existsSync(webhookPath)) {
  const webhookContent = fs.readFileSync(webhookPath, 'utf8');
  const events = [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted'
  ];
  
  console.log('\n3. Webhook Events Handled:');
  events.forEach(event => {
    const isHandled = webhookContent.includes(`case '${event}'`);
    console.log(`- ${event}: ${isHandled ? '✅ Handled' : '❌ Not handled'}`);
  });
}

// Check database operations
console.log('\n4. Database Operations:');
const dbPath = path.join(process.cwd(), 'src/lib/database.ts');
console.log('- Database operations exist:', fs.existsSync(dbPath) ? '✅ Yes' : '❌ No');

// Check user operations
if (fs.existsSync(dbPath)) {
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  const operations = [
    'updateProfile',
    'upsertProfile',
    'getProfile'
  ];
  
  operations.forEach(op => {
    const exists = dbContent.includes(`${op}:`) || dbContent.includes(`async ${op}`);
    console.log(`- ${op}: ${exists ? '✅ Exists' : '❌ Missing'}`);
  });
}

// Check Stripe configuration
console.log('\n5. Stripe Configuration:');
const stripePath = path.join(process.cwd(), 'src/lib/stripe.ts');
console.log('- Stripe config exists:', fs.existsSync(stripePath) ? '✅ Yes' : '❌ No');

// Common issues
console.log('\n6. Common Issues to Check:');
console.log('❓ Is the webhook endpoint configured in Stripe Dashboard?');
console.log('❓ Is the webhook URL correct? (should be: https://yourdomain.com/api/stripe/webhook)');
console.log('❓ Are webhook events being sent to the correct endpoint?');
console.log('❓ Is the webhook secret matching between Stripe and your app?');
console.log('❓ Are there any webhook delivery failures in Stripe Dashboard?');

// Recommendations
console.log('\n7. Next Steps:');
console.log('1. Check Stripe Dashboard → Webhooks → Check delivery status');
console.log('2. Verify webhook endpoint URL is correct');
console.log('3. Test webhook with Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook');
console.log('4. Check server logs for webhook processing errors');
console.log('5. Verify database connection and permissions');

console.log('\n🔧 To test webhook locally:');
console.log('1. Install Stripe CLI: https://stripe.com/docs/stripe-cli');
console.log('2. Run: stripe listen --forward-to localhost:3000/api/stripe/webhook');
console.log('3. Make a test payment and watch the webhook events'); 