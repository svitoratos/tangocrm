# 🚀 Complete Stripe Webhook Setup Guide

## 🔧 **CRITICAL: Updated Webhook Events**

Your webhook endpoint now handles these essential events:

### ✅ **Currently Handled Events:**
- `checkout.session.completed` - Initial subscription setup
- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription changes (plan, status)
- `customer.subscription.deleted` - Subscription cancellation
- `customer.updated` - Customer info updates
- **🆕 `invoice.payment_succeeded`** - Recurring payment success
- **🆕 `invoice.payment_failed`** - Payment failures & retries
- **🆕 `customer.subscription.trial_will_end`** - Trial ending notifications
- **🆕 `payment_method.attached`** - Payment method updates

## 🛠️ **Step 1: Update Stripe Dashboard Webhook**

### 1.1 Go to Stripe Dashboard
1. Navigate to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **LIVE mode** (top right corner)
3. Go to **Developers → Webhooks**

### 1.2 Update Your Existing Webhook
1. Click on your existing webhook endpoint
2. Click **"Configure endpoint"**
3. **ADD these missing events:**
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed` 
   - ✅ `customer.subscription.trial_will_end`
   - ✅ `payment_method.attached`

### 1.3 Verify All Events Are Selected
Your webhook should listen to these events:
```
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ customer.updated
✅ invoice.payment_succeeded
✅ invoice.payment_failed
✅ customer.subscription.trial_will_end
✅ payment_method.attached
```

## 🚀 **Step 2: Deploy Updated Code**

The webhook handler has been updated with the new events. Deploy your changes:

```bash
# Deploy to production
vercel --prod

# Or if using git deployment
git add .
git commit -m "Add missing Stripe webhook events"
git push origin main
```

## 🧪 **Step 3: Test Webhook Events**

### 3.1 Test in Stripe Dashboard
1. Go to **Developers → Webhooks**
2. Click your webhook endpoint
3. Click **"Send test webhook"**
4. Test each event type:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`

### 3.2 Monitor Real Events
1. Make a test subscription purchase
2. Check **"Recent deliveries"** in webhook dashboard
3. Verify all events show **200 OK** status

## 🔍 **Step 4: Fix Customer Portal Display Issues**

### 4.1 Common Portal Issues & Fixes

**Issue**: Portal shows "No subscriptions found"
**Fix**: This happens when `stripe_subscription_id` is missing from user record

**Issue**: Portal shows incorrect subscription status
**Fix**: Database subscription status doesn't match Stripe

### 4.2 Manual Fix for Existing Users

Run this script to sync existing customers:

```javascript
// Run this in your admin panel or as a one-time script
async function fixExistingSubscriptions() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  // Get all users with Stripe customer IDs but missing subscription data
  const { data: users } = await supabase
    .from('users')
    .select('id, stripe_customer_id, stripe_subscription_id, subscription_status')
    .not('stripe_customer_id', 'is', null)
    .is('stripe_subscription_id', null);

  for (const user of users) {
    try {
      // Get customer's subscriptions from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'all',
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        
        // Update user record
        await supabase
          .from('users')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        console.log(`✅ Fixed user ${user.id}: ${subscription.status}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing user ${user.id}:`, error);
    }
  }
}
```

## 🎯 **Step 5: Verify Everything Works**

### 5.1 Test Complete Flow
1. **Create new subscription** → Check webhook receives `checkout.session.completed`
2. **Wait for first invoice** → Check webhook receives `invoice.payment_succeeded`
3. **Open customer portal** → Verify subscription shows correctly
4. **Update payment method** → Check webhook receives `payment_method.attached`

### 5.2 Check Database Sync
Verify these fields are populated correctly:
- `stripe_customer_id` ✅
- `stripe_subscription_id` ✅
- `subscription_status` ✅
- `subscription_tier` ✅

## 🚨 **Troubleshooting**

### Webhook Failing?
1. Check Vercel function logs
2. Verify webhook secret matches environment variable
3. Test webhook signature verification

### Portal Not Showing Subscriptions?
1. Verify `stripe_customer_id` exists in user record
2. Check if customer has active subscriptions in Stripe
3. Run the sync script above

### Subscription Status Out of Sync?
1. Check if webhook events are being delivered
2. Verify webhook handler is updating database
3. Use force refresh API to sync manually

## 📊 **Monitoring & Maintenance**

### Daily Checks
- Monitor webhook delivery success rate
- Check for failed payment notifications
- Verify subscription renewals are processing

### Weekly Reviews
- Review failed webhook deliveries
- Check for subscription status mismatches
- Monitor customer portal usage

## 🎉 **Success Metrics**

After implementing these fixes, you should see:
- ✅ 100% webhook delivery success rate
- ✅ Real-time subscription status updates
- ✅ Customer portal showing active subscriptions
- ✅ Proper handling of payment failures
- ✅ Accurate subscription analytics

---

## 📞 **Need Help?**

If issues persist:
1. Check Stripe webhook logs for delivery failures
2. Monitor Vercel function logs for processing errors
3. Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Test with Stripe test mode before going live

Your Stripe integration should now handle all subscription lifecycle events properly! 🚀