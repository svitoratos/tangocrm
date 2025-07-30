# 🎁 50% Discount Setup Guide

## **How the 50% Off Feature Works**

The retention offer now includes a functional "Get 50% Off" button that applies a Stripe coupon to the user's subscription.

## **Step 1: Create Stripe Coupon**

1. **Go to Stripe Dashboard** → **Products** → **Coupons**
2. **Click "Create coupon"**
3. **Configure the coupon:**
   - **Coupon ID**: `50_OFF_3_MONTHS`
   - **Name**: "50% Off Next 3 Months"
   - **Percent off**: `50`
   - **Duration**: `repeating`
   - **Duration in months**: `3`
   - **Redemptions**: `unlimited` (or set a limit)
   - **Applies to**: `all_products`

## **Step 2: Database Schema (Optional)**

Add these columns to your `users` table in Supabase:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS discount_applied TEXT,
ADD COLUMN IF NOT EXISTS discount_applied_at TIMESTAMP WITH TIME ZONE;
```

## **Step 3: Test the Feature**

1. **Start your dev server**: `npm run dev`
2. **Navigate to**: Dashboard → Settings → Subscription
3. **Click**: "Cancel Subscription"
4. **Fill out** the cancellation form
5. **Click**: "Get 50% Off" button
6. **Check Stripe Dashboard** to see the coupon applied

## **How It Works**

1. **User clicks "Get 50% Off"**
2. **API call** to `/api/stripe/apply-discount`
3. **Stripe applies** the coupon to their subscription
4. **Database updated** with discount info
5. **User gets 50% off** for the next 3 months

## **Alternative Options**

### **Option 2: Manual Stripe Link**
Instead of automatic application, you could:
- Generate a Stripe checkout link with the coupon pre-applied
- Send user to Stripe to confirm the discount

### **Option 3: Custom Pricing**
- Create a new price in Stripe with 50% discount
- Switch user to the discounted price

### **Option 4: Proration**
- Calculate 50% of remaining subscription time
- Apply as account credit

## **Monitoring & Analytics**

Track discount usage in Stripe Dashboard:
- **Coupons** → See redemption counts
- **Subscriptions** → Check applied discounts
- **Customers** → View discount history

## **Important Notes**

- ✅ **Coupon is applied immediately** to current subscription
- ✅ **Works with existing Stripe setup**
- ✅ **Tracks usage in database**
- ✅ **No additional Stripe fees**
- ⚠️ **Test thoroughly** before production
- ⚠️ **Monitor for abuse** (multiple redemptions)

## **Troubleshooting**

**Error: "No active subscription found"**
- User must have an active Stripe subscription
- Check `stripe_subscription_id` in database

**Error: "Failed to apply discount"**
- Verify coupon ID exists in Stripe
- Check Stripe API key permissions
- Ensure subscription is active

**Discount not showing in Stripe**
- Check coupon configuration
- Verify subscription status
- Look for API errors in logs 