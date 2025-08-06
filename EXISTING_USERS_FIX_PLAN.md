# 🚨 Action Plan: Fix Existing Users with Wrong Email

## 📊 Current Situation Analysis

### **Stripe Customers:**
- **31 customers** with `stevenvitoratos@gmail.com` email
- **4 customers** have active subscriptions (CRITICAL - real users)
- **27 customers** have no subscriptions (safe to delete)
- **1 customer** has metadata (Clerk user ID) - `cus_SoQUxN8Qp1ZAKZ`

### **Database Users:**
- **9 users** in database, all with correct emails
- **No duplicate emails** in database
- **Users are correctly saved** with their own email addresses

## 🎯 Fix Strategy

### **Phase 1: Fix Customers with Active Subscriptions (CRITICAL)**

**Target:** 4 customers with active subscriptions
- `cus_SonLLq7sswd9mA` - sub_1Rt9kRIvVfTNGbwu7WgvI933 (active)
- `cus_SonHONxzRHOrSH` - sub_1Rt9grIvVfTNGbwu0nph7ekU (active)
- `cus_Son3UcKdzxDjAq` - sub_1Rt9T7IvVfTNGbwuCkgmut3P (active)
- `cus_SoYS8Apu07B9pB` - sub_1RsvLlIvVfTNGbwuxKyjWAxS (active)

**Action:** 
1. Identify which users these subscriptions belong to
2. Update Stripe customer emails to match user emails
3. Link database users with correct Stripe customer IDs

### **Phase 2: Clean Up Orphaned Customers**

**Target:** 27 customers without subscriptions
**Action:** Delete these customers (they have no billing impact)

### **Phase 3: Update Database Links**

**Target:** All users
**Action:** Ensure database users have correct `stripe_customer_id`

## 🛠️ Implementation Steps

### **Step 1: Run the Fix Script**
```bash
node scripts/fix-existing-customers.js
```

This script will:
- ✅ Identify customers with subscriptions
- ✅ Update Stripe customer emails to correct user emails
- ✅ Link database users with correct Stripe customer IDs
- ✅ Delete orphaned customers without subscriptions

### **Step 2: Verify the Fix**
```bash
node scripts/check-stripe-customers.js
```

This will confirm:
- ✅ No more customers with `stevenvitoratos@gmail.com`
- ✅ All customers have correct emails
- ✅ Database users are properly linked

### **Step 3: Test Customer Portal**
- ✅ Users can access their billing portal
- ✅ Subscription information is correct
- ✅ Billing history shows correct data

## 📋 Detailed Action Plan

### **For Customers with Subscriptions:**

1. **Identify the Real Users**
   - Check subscription metadata for Clerk user IDs
   - Match with database users by email
   - Update Stripe customer email to match user email

2. **Update Database Records**
   - Set `stripe_customer_id` to the correct customer ID
   - Ensure `subscription_status` matches Stripe status

3. **Verify Billing Portal Access**
   - Users should see their own subscription data
   - Billing history should be correct

### **For Customers without Subscriptions:**

1. **Safe Deletion**
   - These customers have no billing impact
   - No subscriptions to preserve
   - Safe to delete from Stripe

2. **Database Cleanup**
   - Remove any incorrect `stripe_customer_id` references
   - Set `subscription_status` to 'inactive' if needed

## 🔍 Manual Intervention Required

### **Customers Needing Manual Review:**

1. **Customers without metadata** (Clerk user IDs)
   - Need to identify which user they belong to
   - May require contacting users directly
   - Could be test accounts or abandoned signups

2. **Customers with metadata but no database user**
   - Clerk user may have been deleted
   - Need to check if user still exists in Clerk
   - May need to recreate user or delete customer

## ✅ Success Criteria

### **After Fix:**
- ✅ **0 customers** with `stevenvitoratos@gmail.com` email
- ✅ **All active subscriptions** linked to correct users
- ✅ **Database users** have correct `stripe_customer_id`
- ✅ **Customer portal** works for all users
- ✅ **Billing data** is accurate for all users

### **Prevention:**
- ✅ **New signups** create customers with correct emails
- ✅ **No more autofill issues** in checkout
- ✅ **Proper metadata** in all customer records

## 🚨 Risk Assessment

### **Low Risk:**
- Deleting customers without subscriptions
- Updating customer emails (Stripe allows this)
- Updating database records

### **Medium Risk:**
- Customers without metadata (need manual review)
- Customers with metadata but no database user

### **High Risk:**
- None identified - all actions are reversible

## 📞 Support Plan

### **If Users Report Issues:**
1. **Billing Portal Access**: Check if user has correct `stripe_customer_id`
2. **Subscription Not Showing**: Verify subscription is linked to correct customer
3. **Wrong Email in Stripe**: Update customer email manually if needed

### **Emergency Rollback:**
- All changes are logged and reversible
- Database backups available
- Stripe customer updates can be reverted

## 🎯 Expected Outcome

After running the fix script:
- **4 real users** will have their Stripe customers corrected
- **27 orphaned customers** will be deleted
- **All database users** will have correct Stripe customer IDs
- **Customer portal** will work correctly for all users
- **Future signups** will create customers with correct emails

**Status**: Ready for implementation 