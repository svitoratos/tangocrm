# 🚨 Stripe Price Configuration Required

## ⚠️ **Critical Issue**

Your Stripe price IDs are currently set to placeholder values (`price_1RjlLtIvVfT8K9K9K9K9K9K9`) in `src/lib/stripe.ts`. This will cause all payment flows to fail.

## 🔧 **What Needs to be Fixed**

### **File: `src/lib/stripe.ts`**

Update the `STRIPE_PRICES` object with your actual Stripe price IDs:

```typescript
export const STRIPE_PRICES = {
  creator: {
    monthly: 'price_ACTUAL_CREATOR_MONTHLY_ID', // Replace with real ID
    yearly: 'price_ACTUAL_CREATOR_YEARLY_ID',   // Replace with real ID
  },
  coach: {
    monthly: 'price_ACTUAL_COACH_MONTHLY_ID',   // Replace with real ID
    yearly: 'price_ACTUAL_COACH_YEARLY_ID',     // Replace with real ID
  },
  podcaster: {
    monthly: 'price_ACTUAL_PODCASTER_MONTHLY_ID', // Replace with real ID
    yearly: 'price_ACTUAL_PODCASTER_YEARLY_ID',   // Replace with real ID
  },
  freelancer: {
    monthly: 'price_ACTUAL_FREELANCER_MONTHLY_ID', // Replace with real ID
    yearly: 'price_ACTUAL_FREELANCER_YEARLY_ID',   // Replace with real ID
  },
};
```

## 📍 **How to Get Your Price IDs**

1. **Go to Stripe Dashboard** → Products
2. **Find your niche products** (Creator, Coach, Podcaster, Freelancer)
3. **Click on each product** → Pricing
4. **Copy the Price ID** (starts with `price_`)
5. **Replace the placeholder values** in the code

## 🎯 **Example of Real Configuration**

```typescript
export const STRIPE_PRICES = {
  creator: {
    monthly: 'price_1OqRstUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz',
    yearly: 'price_1OqRstUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz',
  },
  coach: {
    monthly: 'price_2PqRstUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz',
    yearly: 'price_2PqRstUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz',
  },
  // ... etc
};
```

## 🚨 **Current Error**

Until you configure these price IDs, users will see:
- ❌ "Price configuration error"
- ❌ "Price ID not configured"
- ❌ Payment flows will fail

## ✅ **After Configuration**

Once you update the price IDs:
- ✅ Users can create checkout sessions
- ✅ Customer consolidation will work
- ✅ All payment flows will function properly
- ✅ No more "User profile not found" errors

## 🔍 **Quick Test**

After updating the price IDs, test by:
1. Going to `/pricing`
2. Clicking "Get Started"
3. Should redirect to Stripe checkout (not show errors)

---

**This is the final piece needed to make your customer consolidation system fully functional!**
