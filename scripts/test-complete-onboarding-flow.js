#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Complete Onboarding Flow...\n');

// Check environment variables
console.log('📋 Environment Check:');
console.log('- NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '❌ NOT SET');
console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ SET' : '❌ NOT SET');
console.log('- NODE_ENV:', process.env.NODE_ENV || '❌ NOT SET');

// Check key files
console.log('\n📄 File Check:');
const files = [
  'src/app/onboarding/success/page.tsx',
  'src/middleware.ts',
  'src/app/api/stripe/checkout/route.ts',
  'src/app/api/user/onboarding-status/route.ts',
  'src/app/api/user/payment-status/route.ts',
  'src/app/api/stripe/webhook/route.ts'
];

files.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`- ${file}: ${exists ? '✅ Exists' : '❌ Missing'}`);
});

// Check middleware configuration
console.log('\n🛡️  Middleware Configuration Check:');
const middlewareContent = fs.readFileSync(path.join(process.cwd(), 'src/middleware.ts'), 'utf8');

const checks = [
  { name: 'Special handling for /onboarding/success', pattern: "pathname === '/onboarding/success'" },
  { name: 'Exact /onboarding$ pattern', pattern: "/onboarding$" },
  { name: 'No broad /onboarding(.*) pattern', pattern: "/onboarding(.*)", shouldNotExist: true },
  { name: 'Logging for success page', pattern: "Middleware: Handling /onboarding/success" },
  { name: 'Logging for onboarding redirects', pattern: "Middleware: Redirecting to onboarding" }
];

checks.forEach(check => {
  const found = middlewareContent.includes(check.pattern);
  const status = check.shouldNotExist ? !found : found;
  console.log(`- ${check.name}: ${status ? '✅ Correct' : '❌ Issue'}`);
});

// Check success page configuration
console.log('\n📄 Success Page Configuration Check:');
const successPageContent = fs.readFileSync(path.join(process.cwd(), 'src/app/onboarding/success/page.tsx'), 'utf8');

const successChecks = [
  { name: 'Payment verification', pattern: "verifyPaymentAndUpdateStatus" },
  { name: 'Onboarding status update', pattern: "onboarding-status" },
  { name: 'Final status check', pattern: "Final status check" },
  { name: 'Dashboard redirect', pattern: "router.push.*dashboard" },
  { name: 'Error handling', pattern: "catch.*error" }
];

successChecks.forEach(check => {
  const found = successPageContent.includes(check.pattern);
  console.log(`- ${check.name}: ${found ? '✅ Present' : '❌ Missing'}`);
});

// Check checkout configuration
console.log('\n💳 Stripe Checkout Configuration Check:');
const checkoutContent = fs.readFileSync(path.join(process.cwd(), 'src/app/api/stripe/checkout/route.ts'), 'utf8');

const checkoutChecks = [
  { name: 'Environment variable fallback', pattern: "process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin" },
  { name: 'URL encoding', pattern: "encodeURIComponent" },
  { name: 'Success URL logging', pattern: "Creating checkout session with URLs" },
  { name: 'Proper success URL', pattern: "/onboarding/success" }
];

checkoutChecks.forEach(check => {
  const found = checkoutContent.includes(check.pattern);
  console.log(`- ${check.name}: ${found ? '✅ Present' : '❌ Missing'}`);
});

// Test URL construction
console.log('\n🔗 URL Construction Test:');
const testOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const testNiche = 'creator';
const testNiches = ['creator', 'coach'];

const successUrl = `${testOrigin}/onboarding/success?session_id={CHECKOUT_SESSION_ID}&niche=${encodeURIComponent(testNiche)}&niches=${encodeURIComponent(JSON.stringify(testNiches))}`;
console.log('Success URL:', successUrl);

// Check for potential issues
console.log('\n🔍 Potential Issues Analysis:');

// Issue 1: Environment variables not loaded
if (!process.env.NEXT_PUBLIC_APP_URL) {
  console.log('1. ❌ NEXT_PUBLIC_APP_URL not set in environment');
} else {
  console.log('1. ✅ NEXT_PUBLIC_APP_URL is properly configured');
}

// Issue 2: Middleware timing
console.log('2. ⚠️  Potential timing issue: Middleware might check status before success page updates it');

// Issue 3: Database update timing
console.log('3. ⚠️  Database update timing: Success page needs time to update onboarding status');

// Issue 4: Redirect loops
console.log('4. ⚠️  Potential redirect loop: Success page → Middleware → Onboarding → Success page');

console.log('\n💡 Recommendations:');

console.log('1. ✅ Ensure NEXT_PUBLIC_APP_URL is set in .env.local');
console.log('2. ✅ Restart development server after environment changes');
console.log('3. ✅ Test with fresh browser session/incognito mode');
console.log('4. ✅ Monitor browser console and network tab during testing');
console.log('5. ✅ Use Stripe test card: 4242 4242 4242 4242');

console.log('\n🧪 Testing Steps:');

console.log('1. Start development server: npm run dev');
console.log('2. Open browser in incognito mode');
console.log('3. Navigate to your app URL');
console.log('4. Complete the onboarding process');
console.log('5. Use test card: 4242 4242 4242 4242');
console.log('6. Complete Stripe checkout');
console.log('7. Verify redirect to /onboarding/success');
console.log('8. Wait for loading screen to complete');
console.log('9. Verify redirect to dashboard');

console.log('\n🔧 Debugging Commands:');

console.log('1. Check environment variables:');
console.log('   node scripts/test-stripe-redirect.js');
console.log('');
console.log('2. Debug middleware issues:');
console.log('   node scripts/debug-onboarding-redirect.js');
console.log('');
console.log('3. Monitor server logs:');
console.log('   npm run dev');
console.log('');
console.log('4. Check browser console for errors');
console.log('5. Check network tab for failed requests');

console.log('\n✅ Complete onboarding flow test analysis finished!'); 