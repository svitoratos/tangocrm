# Customer ID Mismatch Prevention Guide

## Overview

This guide outlines comprehensive strategies to prevent customer ID mismatches between your database and Stripe, ensuring that users can always access their subscriptions through the customer portal.

## Root Causes of Customer ID Mismatches

### 1. **Multiple Customer Creation**
- User goes through checkout multiple times
- Each checkout creates a new Stripe customer
- Only the latest customer ID is stored in database
- Previous subscriptions become orphaned

### 2. **Webhook Failures**
- Webhook events fail to process
- Database not updated with latest customer/subscription IDs
- Manual interventions create inconsistencies

### 3. **Race Conditions**
- Multiple webhook events processed simultaneously
- Database updates conflict with each other
- Inconsistent state between Stripe and database

### 4. **Manual Database Changes**
- Direct database updates without proper validation
- Customer IDs changed without updating Stripe
- Missing audit trail

## Prevention Strategies

### 1. **Database Safeguards** ✅

#### Audit Tables
```sql
-- Track all customer ID changes
CREATE TABLE customer_id_changes (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  old_customer_id TEXT,
  new_customer_id TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by TEXT,
  notes TEXT
);
```

#### Validation Triggers
```sql
-- Automatically log customer ID changes
CREATE TRIGGER customer_id_change_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_customer_id_change();
```

#### Monitoring Functions
```sql
-- Detect potential mismatches
CREATE FUNCTION monitor_customer_mismatches()
RETURNS TABLE (
  user_id TEXT,
  user_email TEXT,
  mismatch_type TEXT
);
```

### 2. **Webhook Validation** ✅

#### Pre-Processing Validation
```typescript
// Validate webhook data before processing
async function validateWebhookData(event: Stripe.Event, userId?: string) {
  // Check customer ID consistency
  // Check subscription ID consistency
  // Log any mismatches
}
```

#### Change Logging
```typescript
// Log all customer ID changes
async function logCustomerIdChange(userId: string, oldCustomerId: string | null, newCustomerId: string | null) {
  await supabase.from('customer_id_changes').insert({
    user_id: userId,
    old_customer_id: oldCustomerId,
    new_customer_id: newCustomerId,
    changed_at: new Date().toISOString(),
    changed_by: 'webhook',
    notes: 'Updated via Stripe webhook'
  });
}
```

### 3. **Checkout Process Improvements**

#### Customer ID Deduplication
```typescript
// Before creating checkout session
async function ensureSingleCustomer(userId: string, email: string) {
  // Check if user already has a Stripe customer
  const existingCustomer = await findExistingCustomer(email);
  
  if (existingCustomer) {
    // Use existing customer instead of creating new one
    return existingCustomer.id;
  }
  
  // Create new customer only if none exists
  return await createNewCustomer(email, userId);
}
```

#### Metadata Validation
```typescript
// Validate checkout session metadata
const session = await stripe.checkout.sessions.create({
  // ... other options
  metadata: {
    clerk_user_id: userId,
    email: userEmail,
    customer_id: existingCustomerId, // Include existing customer ID if available
    session_type: 'subscription_creation'
  }
});
```

### 4. **Automated Monitoring**

#### Daily Health Checks
```sql
-- Run daily monitoring
CREATE FUNCTION run_daily_monitoring()
RETURNS JSON AS $$
BEGIN
  -- Count mismatches
  -- Log results
  -- Send alerts if issues found
END;
$$ LANGUAGE plpgsql;
```

#### Real-time Alerts
```typescript
// Send alerts for detected issues
async function sendMismatchAlert(mismatchData: any) {
  // Send email/Slack notification
  // Include user details and recommended actions
}
```

### 5. **Recovery Procedures**

#### Automatic Fixes
```sql
-- Fix common issues automatically
CREATE FUNCTION auto_fix_common_issues()
RETURNS JSON AS $$
BEGIN
  -- Set inactive users without customer ID to inactive
  -- Clear orphaned subscription IDs
  -- Log all changes
END;
$$ LANGUAGE plpgsql;
```

#### Manual Sync Tools
```typescript
// Manual user sync function
async function manualSyncUser(userId: string) {
  // Get user data
  // Check Stripe for customer/subscription
  // Update database if needed
  // Log all changes
}
```

## Implementation Steps

### Phase 1: Database Safeguards
1. ✅ Run `database_safeguards.sql` in Supabase
2. ✅ Create audit tables and triggers
3. ✅ Set up monitoring functions

### Phase 2: Webhook Improvements
1. ✅ Update webhook handler with validation
2. ✅ Add change logging
3. ✅ Implement error handling

### Phase 3: Checkout Process
1. 🔄 Implement customer deduplication
2. 🔄 Add metadata validation
3. 🔄 Improve error handling

### Phase 4: Monitoring & Alerts
1. 🔄 Set up daily monitoring jobs
2. 🔄 Configure alert notifications
3. 🔄 Create dashboard for monitoring

### Phase 5: Recovery Tools
1. 🔄 Implement automatic fixes
2. 🔄 Create manual sync tools
3. 🔄 Document recovery procedures

## Best Practices

### 1. **Always Validate Before Updates**
```typescript
// Before updating user data
const validation = await validateWebhookData(event, userId);
if (!validation.valid) {
  console.error('Validation failed:', validation);
  // Log issue but don't fail the webhook
}
```

### 2. **Log All Changes**
```typescript
// Log every customer ID change
await logCustomerIdChange(userId, oldCustomerId, newCustomerId);
```

### 3. **Use Transactions**
```sql
-- Wrap related updates in transactions
BEGIN;
  UPDATE users SET stripe_customer_id = $1 WHERE id = $2;
  INSERT INTO customer_id_changes (user_id, new_customer_id) VALUES ($2, $1);
COMMIT;
```

### 4. **Monitor Regularly**
```bash
# Run daily monitoring
node scripts/run-daily-monitoring.js
```

### 5. **Test Thoroughly**
```bash
# Test webhook handling
node scripts/test-webhook-validation.js

# Test customer creation
node scripts/test-customer-creation.js
```

## Monitoring Dashboard

### Key Metrics to Track
- **Total Users**: Number of users in database
- **Active Subscriptions**: Users with active subscription status
- **Customer ID Coverage**: Users with Stripe customer IDs
- **Mismatch Count**: Users with inconsistent data
- **Recent Changes**: Customer ID changes in last 7 days

### Alert Thresholds
- **Mismatch Count > 0**: Immediate attention required
- **Recent Changes > 5**: Review for potential issues
- **Customer ID Coverage < 95%**: Investigate missing IDs

## Recovery Procedures

### When Mismatches Are Detected

1. **Investigate the Issue**
   ```bash
   node scripts/debug-customer-subscription.js
   ```

2. **Check Stripe Data**
   ```bash
   node scripts/check-stripe-customer.js
   ```

3. **Fix the Mismatch**
   ```bash
   node scripts/fix-customer-mismatch.js
   ```

4. **Verify the Fix**
   ```bash
   node scripts/verify-subscription-access.js
   ```

### Emergency Procedures

1. **Stop Processing** (if widespread issues)
2. **Backup Database**
3. **Run Diagnostics**
4. **Apply Fixes**
5. **Resume Processing**

## Testing Checklist

### Pre-Deployment Tests
- [ ] Webhook validation works correctly
- [ ] Customer ID changes are logged
- [ ] Monitoring functions return accurate data
- [ ] Recovery scripts work as expected

### Post-Deployment Tests
- [ ] Create test subscription
- [ ] Verify customer portal access
- [ ] Test webhook processing
- [ ] Check monitoring alerts

### Ongoing Tests
- [ ] Daily monitoring runs successfully
- [ ] No new mismatches are created
- [ ] Recovery procedures work when needed

## Tools and Scripts

### Monitoring Scripts
- `scripts/check-user-subscriptions.js` - Check current state
- `scripts/monitor-customer-mismatches.js` - Detect issues
- `scripts/run-daily-monitoring.js` - Daily health check

### Fix Scripts
- `scripts/fix-customer-mismatch.js` - Fix specific user
- `scripts/fix-subscription-data.js` - Fix all users
- `scripts/auto-fix-common-issues.js` - Automatic fixes

### Debug Scripts
- `scripts/debug-customer-subscription.js` - Debug specific customer
- `scripts/find-missing-user.js` - Find orphaned customers
- `scripts/test-webhook-validation.js` - Test webhook handling

## Conclusion

By implementing these safeguards, you can prevent customer ID mismatches and ensure that all users can access their subscriptions through the customer portal. The key is to:

1. **Validate everything** before making changes
2. **Log all changes** for audit purposes
3. **Monitor continuously** to catch issues early
4. **Have recovery procedures** ready for when issues occur
5. **Test thoroughly** to prevent regressions

This comprehensive approach will significantly reduce the likelihood of customer ID mismatches and provide the tools needed to quickly resolve any issues that do occur. 