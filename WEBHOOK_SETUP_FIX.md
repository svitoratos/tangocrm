# 🚨 CRITICAL: Webhook Subscription Fix

## **Issue**: Users are paying but subscriptions aren't being updated in the system

### **Root Cause**: Webhook endpoint not properly configured in Stripe Dashboard

## **🛠️ Step-by-Step Fix**

### **Step 1: Configure Webhook in Stripe Dashboard**

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com)**
2. **Make sure you're in LIVE mode** (top right corner)
3. **Navigate to Developers → Webhooks**
4. **Click "Add endpoint"**
5. **Set the endpoint URL to:**
   ```
   https://tangocrm-45r1-jyypp8afn-svitoratos-projects.vercel.app/api/stripe/webhook
   ```
6. **Select these events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
7. **Click "Add endpoint"**
8. **Copy the new webhook signing secret** (starts with `whsec_`)

### **Step 2: Update Environment Variables**

**Update your `.env.local` file:**

```bash
# Change this line:
NEXT_PUBLIC_APP_URL=http://localhost:3000

# To this:
NEXT_PUBLIC_APP_URL=https://tangocrm-45r1-jyypp8afn-svitoratos-projects.vercel.app
```

**If you got a new webhook secret, update:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_new_webhook_secret_here
```

### **Step 3: Deploy the Changes**

```bash
vercel --prod
```

### **Step 4: Test the Webhook**

1. **Go to Stripe Dashboard → Webhooks**
2. **Click on your webhook endpoint**
3. **Click "Send test webhook"**
4. **Select "checkout.session.completed"**
5. **Click "Send test webhook"**
6. **Check if you see a success message**

### **Step 5: Monitor Webhook Delivery**

1. **In Stripe Dashboard → Webhooks**
2. **Click on your webhook endpoint**
3. **Check the "Recent deliveries" tab**
4. **Look for any failed deliveries**
5. **Click on failed deliveries to see error details**

## **🔍 Troubleshooting**

### **If webhook deliveries are failing:**

1. **Check the error message in Stripe Dashboard**
2. **Common issues:**
   - **404 Error**: Webhook URL is incorrect
   - **401 Error**: Webhook secret doesn't match
   - **500 Error**: Server error in webhook handler

### **If webhook is working but subscriptions still not updating:**

1. **Check server logs** in Vercel Dashboard
2. **Look for webhook processing errors**
3. **Verify database connection**
4. **Check if user has `stripe_customer_id` set**

### **To test locally:**

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local development:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Make a test payment and watch the webhook events**

## **📊 Webhook Events Handled**

The webhook handler processes these events:

- **`checkout.session.completed`**: Updates user profile and subscription status
- **`customer.subscription.created`**: Sets subscription status to active
- **`customer.subscription.updated`**: Updates subscription status
- **`customer.subscription.deleted`**: Sets subscription status to canceled

## **🔧 Manual Fix for Existing Users**

If you have users who paid but don't have active subscriptions:

1. **Go to Stripe Dashboard → Customers**
2. **Find the customer**
3. **Check their subscription status**
4. **Manually update the user's subscription status in your database**

## **✅ Verification Steps**

After fixing:

1. **Make a test payment**
2. **Check if webhook is delivered successfully**
3. **Verify user's subscription status is updated**
4. **Check if user can access paid features**

## **🚨 Emergency Fix**

If you need to immediately fix existing users:

1. **Export customer list from Stripe**
2. **Match with your user database**
3. **Manually update subscription statuses**
4. **Set up webhook for future payments**

## **📞 Support**

If the issue persists:
1. **Check Vercel function logs**
2. **Verify Stripe webhook configuration**
3. **Test with Stripe CLI**
4. **Contact support with webhook delivery logs** 