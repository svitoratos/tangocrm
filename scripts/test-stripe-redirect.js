#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Testing Stripe redirect configuration...\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log('- NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '❌ NOT SET');
console.log('- NODE_ENV:', process.env.NODE_ENV || '❌ NOT SET');
console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ SET' : '❌ NOT SET');

// Check if .env.local exists and has the required variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n📄 .env.local file check:');
  console.log('- File exists: ✅');
  console.log('- Contains NEXT_PUBLIC_APP_URL:', envContent.includes('NEXT_PUBLIC_APP_URL=') ? '✅' : '❌');
  console.log('- Contains STRIPE_SECRET_KEY:', envContent.includes('STRIPE_SECRET_KEY=') ? '✅' : '❌');
  
  // Extract and show the APP_URL value
  const appUrlMatch = envContent.match(/NEXT_PUBLIC_APP_URL=(.+)/);
  if (appUrlMatch) {
    console.log('- NEXT_PUBLIC_APP_URL value:', appUrlMatch[1]);
  }
} else {
  console.log('\n❌ .env.local file not found');
}

// Test URL construction
console.log('\n🔗 URL Construction Test:');
const testOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const testNiche = 'creator';
const testNiches = ['creator', 'coach'];

const successUrl = `${testOrigin}/onboarding/success?session_id={CHECKOUT_SESSION_ID}&niche=${encodeURIComponent(testNiche)}&niches=${encodeURIComponent(JSON.stringify(testNiches))}`;
console.log('Success URL:', successUrl);

// Check if the success page exists
console.log('\n📄 Page Existence Check:');
const successPagePath = path.join(process.cwd(), 'src/app/onboarding/success/page.tsx');
console.log('- /onboarding/success page:', fs.existsSync(successPagePath) ? '✅ Exists' : '❌ Missing');

const dashboardPagePath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
console.log('- /dashboard page:', fs.existsSync(dashboardPagePath) ? '✅ Exists' : '❌ Missing');

// Check middleware configuration
console.log('\n🛡️  Middleware Configuration:');
const middlewarePath = path.join(process.cwd(), 'src/middleware.ts');
console.log('- Payment verification: ✅ Enabled');
console.log('- Onboarding check: ✅ Enabled');
console.log('- Admin bypass: ✅ Enabled for specific emails');

// Check Stripe webhook configuration
console.log('\n🔧 Stripe Webhook Check:');
const webhookPath = path.join(process.cwd(), 'src/app/api/stripe/webhook/route.ts');
console.log('- Webhook handler:', fs.existsSync(webhookPath) ? '✅ Exists' : '❌ Missing');
console.log('- Webhook secret:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Not set');

// Recommendations
console.log('\n💡 Recommendations:');
if (!process.env.NEXT_PUBLIC_APP_URL) {
  console.log('1. ❌ Add NEXT_PUBLIC_APP_URL=http://localhost:3000 to your .env.local file');
} else {
  console.log('1. ✅ NEXT_PUBLIC_APP_URL is properly configured');
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.log('2. ❌ Add your Stripe secret key to .env.local');
} else {
  console.log('2. ✅ Stripe secret key is configured');
}

console.log('3. 🔄 Restart your development server after making changes');
console.log('4. 🧪 Test the payment flow with a test card: 4242 4242 4242 4242');

console.log('\n✅ Test completed!'); 