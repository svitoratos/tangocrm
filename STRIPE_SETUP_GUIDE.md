# 🚀 Stripe Integration Setup Guide

Your clean Stripe integration is now deployed and ready for configuration! Here's what you need to do to complete the setup:

## ✅ What's Already Done

- ✅ Stripe dependencies installed (`stripe` and `@stripe/stripe-js`)
- ✅ Clean checkout API (`/api/stripe/checkout`)
- ✅ Webhook handler (`/api/stripe/webhook`)
- ✅ Updated onboarding flow
- ✅ Payment status checking
- ✅ Success page with countdown redirect
- ✅ Deployed to Vercel

## 🔧 Required Configuration

### 1. Environment Variables

Add these to your Vercel environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook endpoint secret
```

### 2. Update Price IDs

Edit `src/lib/stripe.ts` and replace the placeholder price IDs with your actual Stripe price IDs:

```typescript
export const STRIPE_PRICES = {
  creator: {
    monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual creator monthly price ID
    yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',  // Replace with your actual creator yearly price ID
  },
  coach: {
    monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual coach monthly price ID
    yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',  // Replace with your actual coach yearly price ID
  },
  // ... etc
};
```

### 3. Webhook Configuration

In your Stripe Dashboard:

1. Go to **Developers > Webhooks**
2. Add endpoint: `https://www.gotangocrm.com/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
4. Copy the webhook secret and add it to your environment variables

## 🧪 Testing the Integration

### Test Flow:
1. Go to `/onboarding`
2. Select a niche (e.g., "Content Creator")
3. Choose goals and continue
4. Click "Start Your Journey"
5. Complete payment in Stripe Checkout
6. Should redirect to `/payment-success` then `/dashboard`

### Test Webhook:
```bash
curl -X POST https://www.gotangocrm.com/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

## 🔍 Troubleshooting

### Common Issues:

1. **"Invalid price ID" error**
   - Update the price IDs in `src/lib/stripe.ts`

2. **Webhook not receiving events**
   - Check webhook URL is correct: `https://www.gotangocrm.com/api/stripe/webhook`
   - Verify webhook secret in environment variables

3. **Payment success but user not updated**
   - Check Vercel logs for webhook processing errors
   - Verify database connection and user table schema

### Debug Endpoints:

- `/api/user/payment-status` - Check user subscription status
- `/api/debug/user-subscription` - Debug subscription details

## 📊 Monitoring

Check Vercel logs for:
- Webhook processing: `🔧 Processing webhook: checkout.session.completed`
- User updates: `✅ User updated successfully: [user-id]`
- Errors: `❌ Error updating user: [error]`

## 🎯 Next Steps

1. **Configure your actual Stripe products and prices**
2. **Test the complete payment flow**
3. **Set up webhook monitoring**
4. **Add customer portal functionality** (optional)

Your Stripe integration is now clean, simple, and ready to handle payments! 🚀 