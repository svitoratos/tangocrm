# 🛡️ Customer ID Mismatch Prevention Guide

## Overview

This guide provides a comprehensive strategy to prevent customer ID mismatches between your database and Stripe, ensuring that subscriptions always appear correctly in the customer portal.

## 🚨 What Causes Customer ID Mismatches

1. **Multiple Customer Creation**: Creating new Stripe customers instead of reusing existing ones
2. **Webhook Failures**: Webhook events not properly processed or failing silently
3. **Database Updates**: Manual database changes that break the link between users and customers
4. **Checkout Flow Issues**: Using `customer_email` instead of `customer` ID in checkout sessions
5. **Race Conditions**: Multiple processes trying to create/update customer data simultaneously

## ✅ Prevention Strategy

### 1. **Enhanced Webhook Validation** ✅ IMPLEMENTED

Your webhook handler now includes comprehensive validation:

```typescript
// Enhanced validation in webhook handler
- Verify customer exists in Stripe before processing
- Check subscription ownership
- Detect and resolve conflicts automatically
- Fallback to email matching if customer ID not found
- Log all validation failures for monitoring
```

### 2. **Database Constraints** 🔧 NEEDS IMPLEMENTATION

Run this SQL in your Supabase SQL editor:

```sql
-- Function to validate customer ID uniqueness
CREATE OR REPLACE FUNCTION validate_stripe_customer_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new customer ID is already used by another user
  IF NEW.stripe_customer_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM users 
      WHERE stripe_customer_id = NEW.stripe_customer_id 
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Stripe customer ID % is already used by another user', NEW.stripe_customer_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run validation on insert/update
DROP TRIGGER IF EXISTS validate_stripe_customer_id_trigger ON users;
CREATE TRIGGER validate_stripe_customer_id_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_stripe_customer_id();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### 3. **Improved Checkout Flow** 🔧 NEEDS IMPLEMENTATION

Update your checkout session creation to always use customer IDs:

```typescript
// In src/app/api/stripe/checkout/route.ts
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const user = await userOperations.getProfile(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a Stripe customer
    let stripeCustomerId = user.stripe_customer_id;
    
    if (stripeCustomerId) {
      try {
        // Verify the customer still exists in Stripe
        await stripe.customers.retrieve(stripeCustomerId);
        console.log('✅ Using existing Stripe customer:', stripeCustomerId);
      } catch (error) {
        console.log('⚠️  Existing customer not found, creating new one...');
        stripeCustomerId = null;
      }
    }

    // Create new customer if needed
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId,
          clerkUserId: userId
        }
      });

      stripeCustomerId = customer.id;

      // Update user with new customer ID immediately
      await userOperations.updateProfile(userId, {
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date().toISOString()
      });

      console.log('✅ Created new Stripe customer:', stripeCustomerId);
    }

    // Create checkout session with customer ID
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId, // Use customer ID instead of customer_email
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        clerk_user_id: userId,
        email: user.email,
        // ... other metadata
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
```

### 4. **Monitoring & Alerts** 🔧 NEEDS IMPLEMENTATION

Set up regular monitoring with the provided script:

```bash
# Run monitoring script
node scripts/monitor-customer-sync.js
```

Add this to your deployment pipeline or set up a cron job to run daily.

### 5. **Automated Sync** 🔧 NEEDS IMPLEMENTATION

Run the sync script to fix any existing mismatches:

```bash
# Sync existing customers
node scripts/sync-existing-customers.js
```

## 🚀 Implementation Checklist

### ✅ Completed
- [x] Enhanced webhook validation
- [x] Customer mismatch detection and fixing
- [x] Prevention strategy documentation

### 🔧 To Implement
- [ ] Database constraints and triggers
- [ ] Improved checkout flow
- [ ] Regular monitoring setup
- [ ] Automated sync scheduling

## 📊 Monitoring Dashboard

Create a simple monitoring dashboard to track:

1. **Customer Sync Status**
   - Users with Stripe customer IDs
   - Users with active subscriptions
   - Mismatches detected

2. **Webhook Health**
   - Failed webhook events
   - Validation errors
   - Sync issues

3. **Portal Access**
   - Successful portal sessions
   - Failed portal access attempts
   - User feedback

## 🛠️ Tools Created

### Scripts for Prevention
- `scripts/prevent-customer-mismatches.js` - Generates prevention code
- `scripts/monitor-customer-sync.js` - Monitors customer sync status
- `scripts/sync-existing-customers.js` - Syncs existing customer data
- `scripts/debug-customer-subscription.js` - Debugs specific customer issues
- `scripts/find-missing-user.js` - Finds missing user associations
- `scripts/fix-customer-mismatch.js` - Fixes specific customer mismatches

### Prevention Files
- `scripts/prevention/webhook-validation.js` - Webhook validation code
- `scripts/prevention/database-trigger.sql` - Database constraints
- `scripts/prevention/monitor-customer-sync.js` - Monitoring script
- `scripts/prevention/improved-checkout.js` - Improved checkout flow
- `scripts/prevention/sync-existing-customers.js` - Sync function
- `scripts/prevention/PREVENTION_STRATEGY.md` - Strategy documentation

## 🔄 Best Practices

### 1. **Always Use Customer IDs**
- Use `customer` parameter instead of `customer_email` in checkout sessions
- Store customer IDs immediately after creation
- Verify customer existence before using

### 2. **Validate Everything**
- Verify Stripe data before updating database
- Check for conflicts before making changes
- Log all validation failures

### 3. **Monitor Continuously**
- Run monitoring scripts regularly
- Set up alerts for validation failures
- Track customer portal access

### 4. **Handle Edge Cases**
- Deleted customers in Stripe
- Multiple users with same email
- Race conditions in customer creation
- Webhook failures and retries

### 5. **Recovery Procedures**
- Automated sync for fixing mismatches
- Manual verification tools
- Rollback procedures for failed updates

## 🚨 Emergency Procedures

### If Customer Mismatch is Detected:

1. **Immediate Action**
   ```bash
   # Run the fix script
   node scripts/fix-customer-mismatch.js
   ```

2. **Investigation**
   ```bash
   # Debug the specific customer
   node scripts/debug-customer-subscription.js
   ```

3. **Prevention**
   ```bash
   # Run monitoring to catch other issues
   node scripts/monitor-customer-sync.js
   ```

## 📈 Success Metrics

Track these metrics to ensure prevention is working:

- **Zero customer mismatches** in production
- **100% webhook success rate**
- **All active subscriptions visible** in customer portal
- **No duplicate customer IDs** in database
- **Consistent email matching** between Stripe and database

## 🎯 Next Steps

1. **Implement Database Constraints** (High Priority)
   - Run the SQL in Supabase
   - Test with existing data

2. **Update Checkout Flow** (High Priority)
   - Implement improved checkout session creation
   - Test with new subscriptions

3. **Set Up Monitoring** (Medium Priority)
   - Schedule regular monitoring runs
   - Set up alerts for failures

4. **Create Dashboard** (Low Priority)
   - Build monitoring dashboard
   - Add customer sync status

By following this prevention strategy, you'll ensure that customer ID mismatches never happen again, and your users will always see their subscriptions correctly in the customer portal! 🎉 