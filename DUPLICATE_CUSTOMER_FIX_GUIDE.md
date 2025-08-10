# 🚨 Fix Duplicate Stripe Customers Guide

## Problem Statement

**Issue**: Users like `stevenvitoratos@gmail.com` have multiple Stripe customer IDs, causing:
- Subscription access problems
- Customer portal issues
- Billing confusion
- Data inconsistency

**Root Cause**: Multiple checkout sessions created new customers instead of using existing ones.

## ✅ Solutions Implemented

### 1. **Admin Dashboard Tool** (Recommended)

Navigate to `/admin/fix-duplicate-customers` to use the web-based tool:

1. **Scan for Duplicates**: Click "Scan for Duplicates" to find all users with multiple customer IDs
2. **Fix All**: Click "Fix All Duplicates" to automatically merge all duplicate customers
3. **Fix Specific User**: Fix duplicates for a specific email address

### 2. **Command Line Script** (For Immediate Fix)

Run the dedicated script for `stevenvitoratos@gmail.com`:

```bash
# Make sure you're in the project directory
cd /path/to/your/project

# Install dependencies if needed
npm install stripe dotenv

# Set your Stripe secret key in .env file
echo "STRIPE_SECRET_KEY=sk_live_..." > .env

# Run the fix script
node scripts/fix-steven-customer.js
```

**What the script does**:
- Finds all customers with `stevenvitoratos@gmail.com`
- Analyzes each customer's subscriptions and metadata
- Merges duplicate customers into the oldest (primary) customer
- Transfers all subscriptions to the primary customer
- Deletes duplicate customers
- Provides detailed logging of the process

### 3. **Webhook Improvements** (Prevention)

The webhook has been enhanced to:
- Detect duplicate customers during checkout
- Automatically merge them before processing
- Transfer subscriptions properly
- Maintain data integrity

## 🔧 How to Fix Right Now

### **Option 1: Use Admin Dashboard (Easiest)**

1. Go to `/admin/fix-duplicate-customers`
2. Click "Scan for Duplicates"
3. Review the results
4. Click "Fix All Duplicates" or fix specific users

### **Option 2: Run Command Line Script**

```bash
node scripts/fix-steven-customer.js
```

### **Option 3: Manual Stripe Dashboard**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/customers)
2. Search for `stevenvitoratos@gmail.com`
3. Identify the oldest customer (keep this one)
4. For each duplicate customer:
   - Transfer subscriptions to the primary customer
   - Delete the duplicate customer

## 📊 What Gets Fixed

### **Customer Merging**
- ✅ All subscriptions transferred to primary customer
- ✅ Payment methods moved to primary customer
- ✅ Metadata preserved and enhanced
- ✅ Duplicate customers deleted

### **Database Updates**
- ✅ User record updated with correct customer ID
- ✅ Subscription IDs updated if needed
- ✅ Audit trail maintained

### **Stripe Cleanup**
- ✅ No orphaned subscriptions
- ✅ No duplicate customers
- ✅ Clean customer portal access

## 🛡️ Prevention Measures

### **Checkout Process**
- ✅ Customer deduplication before checkout
- ✅ Existing customer lookup by email
- ✅ Reuse of existing customer IDs

### **Webhook Processing**
- ✅ Duplicate customer detection
- ✅ Automatic merging during webhook processing
- ✅ Subscription transfer handling

### **Admin Monitoring**
- ✅ Regular duplicate scanning
- ✅ Automated fix tools
- ✅ Comprehensive logging

## 🚀 After Fixing

### **Verify the Fix**
1. Check Stripe Dashboard for single customer
2. Verify all subscriptions are active
3. Test customer portal access
4. Confirm billing is working

### **Update Database** (if needed)
```sql
-- Update user with correct customer ID
UPDATE users 
SET stripe_customer_id = 'cus_correct_id_here'
WHERE email = 'stevenvitoratos@gmail.com';
```

### **Monitor for Future Issues**
- Use the admin dashboard regularly
- Check webhook logs for merge operations
- Monitor for new duplicate patterns

## 🔍 Troubleshooting

### **If Script Fails**
- Check Stripe API key permissions
- Verify customer IDs exist
- Check for active subscriptions
- Review error logs

### **If Webhook Merge Fails**
- Check webhook endpoint configuration
- Verify webhook secret
- Review webhook delivery logs
- Check for API rate limits

### **If Database Update Fails**
- Verify user exists
- Check database permissions
- Review constraint violations
- Check for foreign key issues

## 📞 Support

If you encounter issues:
1. Check the admin dashboard for error details
2. Review webhook logs in Stripe Dashboard
3. Check browser console for frontend errors
4. Review server logs for backend issues

## 🎯 Success Metrics

After fixing, you should see:
- ✅ One customer ID per user
- ✅ All subscriptions accessible
- ✅ Customer portal working
- ✅ Clean Stripe Dashboard
- ✅ No duplicate customer warnings

---

**Remember**: Always test in Stripe test mode first if possible, and backup your data before running fixes in production.
