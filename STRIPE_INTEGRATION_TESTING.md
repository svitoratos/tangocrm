# 🧪 Stripe Integration Testing Strategy

## 🎯 **Testing Checklist**

### **Phase 1: Webhook Event Testing**

#### ✅ **1.1 Test Each Webhook Event**

**Test `checkout.session.completed`:**
```bash
# In Stripe Dashboard → Webhooks → Send test webhook
1. Select "checkout.session.completed"
2. Check logs for: "🔧 Processing webhook: checkout.session.completed"
3. Verify user profile updated with subscription data
```

**Test `invoice.payment_succeeded`:**
```bash
1. Send test webhook for "invoice.payment_succeeded"  
2. Check logs for: "✅ Webhook: Updated subscription status after successful payment"
3. Verify subscription_status remains 'active'
```

**Test `invoice.payment_failed`:**
```bash
1. Send test webhook for "invoice.payment_failed"
2. Check logs for: "✅ Webhook: Updated subscription status after failed payment"  
3. Verify subscription_status changes to 'past_due'
```

**Test `customer.subscription.updated`:**
```bash
1. Update a subscription in Stripe Dashboard
2. Check webhook receives event automatically
3. Verify database reflects the change
```

#### ✅ **1.2 Webhook Delivery Verification**

```bash
# Check webhook delivery status
1. Go to Stripe Dashboard → Webhooks
2. Click your webhook endpoint
3. Check "Recent deliveries" tab
4. All events should show "200 OK"
```

### **Phase 2: Customer Portal Testing**

#### ✅ **2.1 Portal Access Test**

```javascript
// Test portal access for existing customers
async function testPortalAccess() {
  // 1. Login as a customer with active subscription
  // 2. Go to Dashboard → Settings → Subscription
  // 3. Click "Manage Billing"
  // 4. Verify portal opens and shows:
  //    - Active subscription
  //    - Correct billing amount
  //    - Next billing date
  //    - Payment method
}
```

#### ✅ **2.2 Portal Functionality Test**

Test these portal features:
- ✅ View subscription details
- ✅ Update payment method  
- ✅ View invoice history
- ✅ Cancel subscription
- ✅ Update billing address
- ✅ Download invoices

### **Phase 3: Subscription Sync Testing**

#### ✅ **3.1 Real Payment Flow Test**

```bash
# Complete payment flow test
1. Create new test customer in Stripe test mode
2. Complete checkout process
3. Verify webhook events fire in sequence:
   - checkout.session.completed
   - customer.subscription.created
   - invoice.payment_succeeded (if immediate billing)
4. Check database has correct data:
   - stripe_customer_id ✅
   - stripe_subscription_id ✅  
   - subscription_status: 'active' ✅
```

#### ✅ **3.2 Subscription Status Sync Test**

```javascript
// Test subscription status synchronization
async function testSubscriptionSync() {
  // 1. Manually change subscription status in Stripe
  // 2. Trigger webhook or wait for next billing event
  // 3. Verify database updates accordingly
  // 4. Check customer portal reflects change
}
```

### **Phase 4: Error Handling Testing**

#### ✅ **4.1 Failed Payment Handling**

```bash
# Test failed payment scenario
1. Use test card that triggers payment failure (4000000000000002)
2. Complete checkout process  
3. Verify webhook handles invoice.payment_failed
4. Check subscription_status becomes 'past_due'
5. Verify customer portal shows payment issue
```

#### ✅ **4.2 Webhook Failure Recovery**

```bash
# Test webhook retry mechanism
1. Temporarily break webhook endpoint (return 500 error)
2. Trigger subscription event
3. Verify Stripe retries webhook delivery
4. Fix endpoint and confirm event processes correctly
```

### **Phase 5: Data Integrity Testing**

#### ✅ **5.1 Database Consistency Check**

```sql
-- Run this query to check for data inconsistencies
SELECT 
  id, 
  email,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  CASE 
    WHEN stripe_customer_id IS NOT NULL AND stripe_subscription_id IS NULL THEN 'Missing subscription ID'
    WHEN stripe_customer_id IS NULL AND stripe_subscription_id IS NOT NULL THEN 'Missing customer ID'  
    WHEN subscription_status = 'active' AND stripe_subscription_id IS NULL THEN 'Active without subscription'
    ELSE 'OK'
  END as status_check
FROM users 
WHERE stripe_customer_id IS NOT NULL
ORDER BY created_at DESC;
```

#### ✅ **5.2 Stripe-Database Sync Verification**

```javascript
// Verify Stripe data matches database
async function verifyStripeSync() {
  const users = await supabase
    .from('users')
    .select('id, stripe_customer_id, stripe_subscription_id, subscription_status')
    .not('stripe_subscription_id', 'is', null);

  for (const user of users) {
    const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
    
    if (user.subscription_status !== subscription.status) {
      console.error(`❌ Status mismatch for user ${user.id}: DB=${user.subscription_status}, Stripe=${subscription.status}`);
    } else {
      console.log(`✅ User ${user.id}: Status in sync`);
    }
  }
}
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Portal Shows "No Subscriptions"**
**Cause:** Missing `stripe_subscription_id` in database
**Solution:** Run the sync script: `node scripts/fix-stripe-subscription-sync.js`

### **Issue 2: Webhook Events Not Processing**
**Cause:** Webhook endpoint URL incorrect or webhook secret mismatch
**Solution:** 
1. Verify webhook URL in Stripe Dashboard
2. Check `STRIPE_WEBHOOK_SECRET` environment variable
3. Test webhook signature verification

### **Issue 3: Subscription Status Out of Sync**
**Cause:** Missed webhook events or processing errors
**Solution:**
1. Check webhook delivery logs in Stripe
2. Use force refresh API endpoint
3. Run manual sync script

### **Issue 4: Payment Method Updates Not Reflected**
**Cause:** Missing `payment_method.attached` webhook handling
**Solution:** Already fixed in updated webhook handler

## 🔧 **Testing Tools**

### **Stripe CLI Testing**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login and forward webhooks to local development
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### **Manual Testing Script**
```javascript
// Run this in your browser console on dashboard settings page
async function testSubscriptionManagement() {
  // Test portal access
  const portalResponse = await fetch('/api/stripe/portal', { method: 'POST' });
  console.log('Portal API:', portalResponse.status);
  
  // Test subscription details
  const detailsResponse = await fetch('/api/user/subscription-details');
  const details = await detailsResponse.json();
  console.log('Subscription details:', details);
  
  // Test payment status
  const statusResponse = await fetch('/api/user/payment-status');
  const status = await statusResponse.json();
  console.log('Payment status:', status);
}
```

## 📊 **Success Metrics**

After implementing fixes, you should achieve:

- ✅ **100% webhook delivery success rate**
- ✅ **< 5 second** subscription status sync time
- ✅ **Zero** customer portal access errors
- ✅ **100%** accuracy in subscription status display
- ✅ **Immediate** reflection of payment method updates

## 🎉 **Final Validation**

Before going live, complete this checklist:

- [ ] All webhook events return 200 OK
- [ ] Customer portal shows active subscriptions
- [ ] Payment failures update status correctly  
- [ ] Subscription cancellations process immediately
- [ ] New signups create complete customer records
- [ ] Database and Stripe data are synchronized
- [ ] Error handling gracefully manages edge cases

Your Stripe integration should now be bulletproof! 🚀