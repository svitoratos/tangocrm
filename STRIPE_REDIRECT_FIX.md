# Stripe Redirect Fix - Complete Solution

## 🚨 Issue Description

**Problem**: After completing payment through Stripe checkout, users were staying on the Stripe checkout page instead of being redirected to the onboarding success page.

**Root Cause**: The `NEXT_PUBLIC_APP_URL` environment variable was missing from the `.env.local` file, causing the Stripe checkout to not have the correct success URL.

## ✅ Solution Implemented

### 1. Added Missing Environment Variable

**File**: `.env.local`
**Change**: Added the missing `NEXT_PUBLIC_APP_URL` environment variable

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Improved Stripe Checkout Configuration

**File**: `src/app/api/stripe/checkout/route.ts`
**Changes Made**:
- Added fallback URL handling using `process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin`
- Added URL encoding for parameters to prevent issues with special characters
- Added better logging for debugging redirect URLs

**Key Improvements**:
```typescript
// Before: Using only request.nextUrl.origin
success_url: `${request.nextUrl.origin}/onboarding/success?session_id={CHECKOUT_SESSION_ID}&niche=${primaryRole}&niches=${JSON.stringify(selectedRoles)}`,

// After: Using environment variable with fallback and proper encoding
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
const successUrl = `${baseUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}&niche=${encodeURIComponent(primaryRole)}&niches=${encodeURIComponent(JSON.stringify(selectedRoles))}`;
```

### 3. Created Diagnostic Scripts

**Files Created**:
- `scripts/fix-stripe-redirect.js` - Automatically adds missing environment variables
- `scripts/test-stripe-redirect.js` - Tests the complete redirect configuration

## 🔧 How to Apply the Fix

### Option 1: Automatic Fix (Recommended)
```bash
node scripts/fix-stripe-redirect.js
```

### Option 2: Manual Fix
1. Open your `.env.local` file
2. Add this line:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. Save the file

### Option 3: Test the Configuration
```bash
node scripts/test-stripe-redirect.js
```

## 🔄 Next Steps

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test the payment flow**:
   - Complete the onboarding process
   - Use Stripe test card: `4242 4242 4242 4242`
   - Verify redirect to `/onboarding/success` page

3. **For production deployment**:
   - Update `NEXT_PUBLIC_APP_URL` to your production domain
   - Example: `NEXT_PUBLIC_APP_URL=https://yourdomain.com`

## 🧪 Testing

### Test Cards for Stripe
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

### Expected Flow
1. User completes onboarding
2. Clicks "Start 3-Day Free Trial"
3. Redirected to Stripe checkout
4. Completes payment
5. **Redirected to `/onboarding/success`** ✅
6. Shows loading screen
7. Redirected to dashboard

## 🔍 Debugging

If the issue persists:

1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed requests
3. **Verify environment variables** are loaded:
   ```bash
   node scripts/test-stripe-redirect.js
   ```
4. **Check Stripe webhook** configuration
5. **Verify middleware** is not blocking the redirect

## 📝 Environment Variables Required

Make sure these are set in your `.env.local`:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## ✅ Verification

After applying the fix, you should see:
- ✅ Successful redirect to `/onboarding/success` after payment
- ✅ Loading screen with progress indicators
- ✅ Automatic redirect to dashboard after setup
- ✅ Proper niche parameter passed to dashboard

The fix ensures that Stripe checkout sessions are created with the correct success URL, allowing users to complete the onboarding flow properly. 