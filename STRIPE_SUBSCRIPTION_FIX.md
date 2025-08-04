# Stripe Subscription ID Fix

## Issue Summary

Stripe was not properly picking up subscriptions because the webhook handlers were not storing the `stripe_subscription_id` in the database. This caused several problems:

1. **Missing Subscription IDs**: When users completed checkout, the webhook would update the user profile but not store the actual subscription ID from Stripe
2. **Subscription Details API Failure**: The `/api/user/subscription-details` endpoint would fail because it couldn't find the subscription ID in the database
3. **Incomplete Subscription Tracking**: The system couldn't properly track subscription status changes

## Root Cause

The webhook handlers in `/src/app/api/stripe/webhook/route.ts` were:
- Storing `stripe_customer_id` but not `stripe_subscription_id`
- Not updating subscription IDs when subscription events occurred
- Missing proper error handling for subscription retrieval

## Fixes Implemented

### 1. Updated Webhook Handlers

**File**: `/src/app/api/stripe/webhook/route.ts`

**Changes**:
- Added `stripe_subscription_id` storage in `checkout.session.completed` event
- Added `stripe_subscription_id` updates in all subscription events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted` (clears the ID when deleted)

**Key Changes**:
```typescript
// Before
stripe_customer_id: session.customer as string,

// After  
stripe_customer_id: session.customer as string,
stripe_subscription_id: session.subscription as string || null,
```

### 2. Enhanced Force Refresh API

**File**: `/src/app/api/user/force-refresh-payment-status/route.ts`

**Changes**:
- Now stores `stripe_subscription_id` when found in Stripe
- Clears `stripe_subscription_id` when no subscriptions are found
- Better error handling and logging

### 3. Admin Fix Tool

**New Files**:
- `/src/app/api/admin/fix-subscription-ids/route.ts` - API endpoint to fix existing users
- `/src/app/admin/fix-subscriptions/page.tsx` - Admin UI to trigger the fix

**Features**:
- Finds all users with `stripe_customer_id` but missing `stripe_subscription_id`
- Queries Stripe API to get current subscription status
- Updates database with correct subscription IDs
- Provides detailed reporting of the fix process

### 4. Admin Navigation

**File**: `/src/app/admin/page.tsx`

**Changes**:
- Added link to the new "Fix Subscription IDs" admin tool

## How to Use the Fix

### For New Subscriptions
The webhook will now automatically store subscription IDs for all new subscriptions.

### For Existing Users
1. Go to `/admin/fix-subscriptions` (admin access required)
2. Click "Fix Subscription IDs"
3. The tool will:
   - Find all users with missing subscription IDs
   - Query Stripe for their current subscription status
   - Update the database with correct information
   - Provide a detailed report

## Testing the Fix

### 1. Check Webhook Logs
Look for these log messages in your server logs:
```
🔧 Webhook: Subscription created: sub_xxx
✅ Webhook: Updated user subscription status to: active for user: user_xxx
```

### 2. Test Subscription Details API
Call `/api/user/subscription-details` for a user with an active subscription. It should now return subscription details instead of an error.

### 3. Verify Database
Check that users have both `stripe_customer_id` and `stripe_subscription_id` populated in the database.

## Database Schema Requirements

Ensure your `users` table has these columns:
```sql
stripe_customer_id TEXT,
stripe_subscription_id TEXT,
subscription_status TEXT,
subscription_tier TEXT
```

## Environment Variables

Make sure these are set:
```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Monitoring

After implementing the fix, monitor:
1. Webhook delivery success rates in Stripe Dashboard
2. Database consistency between `stripe_customer_id` and `stripe_subscription_id`
3. Subscription status accuracy in your application

## Rollback Plan

If issues occur:
1. The webhook changes are backward compatible
2. The admin fix tool can be disabled by removing the route
3. Database changes are additive and won't break existing functionality

## Future Improvements

Consider implementing:
1. Regular subscription status sync jobs
2. Better error handling for webhook failures
3. Subscription status change notifications
4. Automated testing for webhook scenarios 