# 🎯 Stripe Price Setup Guide

## ✅ **The 500 Error is Fixed!**

The checkout API now has proper error handling and will give you clear error messages.

## 🔧 **Next Step: Update Your Price IDs**

### **1. Get Your Price IDs from Stripe Dashboard:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Pricing**
3. Copy the **Price IDs** for each plan

### **2. Update the Configuration:**

Edit `src/lib/stripe-config.ts` and replace the placeholder price IDs:

```typescript
export const STRIPE_PRICE_IDS = {
  creator: {
    monthly: 'price_1ABC123...', // Your actual creator monthly price ID
    yearly: 'price_1DEF456...',  // Your actual creator yearly price ID
  },
  coach: {
    monthly: 'price_1GHI789...', // Your actual coach monthly price ID
    yearly: 'price_1JKL012...',  // Your actual coach yearly price ID
  },
  // ... etc
}
```

### **3. Deploy the Changes:**

```bash
git add .
git commit -m "Update Stripe price IDs"
vercel --prod
```

## 🎉 **That's It!**

Once you update the price IDs, the payment flow will work perfectly:
- ✅ User selects plan → Checkout API creates session
- ✅ Stripe checkout → User pays
- ✅ Webhook updates database → User gets access
- ✅ Success page → Dashboard

**The clean integration is ready to go!** 🚀 