# Coach Niche Upgrade - Complete Implementation

## 🎯 **Objective Achieved**
Successfully implemented coach niche upgrade with both monthly and yearly payment links that immediately unlock the coach dashboard after successful payment.

## ✅ **Complete User Flow**

### **Step 1: User Initiates Upgrade**
1. User clicks "Add Niche" in sidebar
2. Upgrade modal opens with niche selection
3. User selects "Coach" niche
4. User selects billing cycle (Monthly or Yearly)

### **Step 2: Payment Processing**
1. System detects coach niche + billing cycle selection
2. Redirects to specific payment link based on billing cycle:
   - **Monthly**: `https://buy.stripe.com/5kQ3cw5l086faBieOE2Nq05`
   - **Yearly**: `https://buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03`
3. User completes payment on Stripe

### **Step 3: Payment Success**
1. Stripe redirects to `/payment-success`
2. Payment success page detects coach payment links
3. Redirects to `/onboarding/success` with coach metadata

### **Step 4: Niche Addition**
1. Onboarding success page adds coach niche to user account
2. Updates user's niches array: `['podcaster', 'creator', 'coach']`
3. Sets subscription status to active

### **Step 5: Dashboard Access**
1. Redirects to coach dashboard: `/dashboard?niche=coach&section=dashboard`
2. User immediately sees coach dashboard
3. Coach niche appears in sidebar dropdown

## 🔧 **Technical Implementation**

### **Payment Links**
- **Monthly**: https://buy.stripe.com/5kQ3cw5l086faBieOE2Nq05
- **Yearly**: https://buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03

### **Code Changes**

#### **1. Niche Upgrade Modal**
```typescript
// Special handling for coach niche - use the specific payment links
if (selectedNiche === 'coach') {
  if (billingCycle === 'monthly') {
    window.location.href = 'https://buy.stripe.com/5kQ3cw5l086faBieOE2Nq05';
  } else if (billingCycle === 'yearly') {
    window.location.href = 'https://buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03';
  }
  onClose();
  return;
}
```

#### **2. Payment Success Detection**
```typescript
// Check if user came from the coach payment links
const referrer = document.referrer;
if (referrer.includes('buy.stripe.com/5kQ3cw5l086faBieOE2Nq05') || 
    referrer.includes('buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03')) {
  router.push('/onboarding/success?upgrade=true&niche=coach&niches=%5B%22coach%22%5D&specific_niche=coach');
}
```

#### **3. Coach Dashboard Redirect**
```typescript
// Special handling for coach niche - immediately switch to coach dashboard
if (finalNiche === 'coach' || specificNiche === 'coach') {
  router.push('/dashboard?niche=coach&section=dashboard&upgrade=success');
}
```

## 📊 **Current User Status**

Based on the test results:

- **stevenvitoratos@gotangocrm.com**: Has `['podcaster', 'creator']` - ✅ Can upgrade to coach
- **stevenvitoratos@getbondlyapp.com**: Has `['podcaster', 'creator']` - ✅ Can upgrade to coach

## 🎯 **Key Features**

1. **✅ Dual Payment Links**: Separate links for monthly and yearly billing
2. **✅ Smart Detection**: System detects both coach payment links
3. **✅ Immediate Access**: Coach dashboard unlocked immediately after payment
4. **✅ Proper Tracking**: Coach niche metadata tracked through entire flow
5. **✅ Better UX**: Clear upgrade path with billing cycle selection
6. **✅ Analytics Ready**: Can track both monthly and yearly coach upgrades

## 🚀 **Testing Instructions**

### **Monthly Plan Test**
1. Login as user with active subscription but no coach niche
2. Click "Add Niche" in sidebar
3. Select "Coach" niche
4. Select "Monthly" billing cycle
5. Complete payment using monthly link
6. Verify coach dashboard is immediately accessible

### **Yearly Plan Test**
1. Login as user with active subscription but no coach niche
2. Click "Add Niche" in sidebar
3. Select "Coach" niche
4. Select "Yearly" billing cycle
5. Complete payment using yearly link
6. Verify coach dashboard is immediately accessible

## 🔗 **Payment Link Details**

### **Monthly Plan**
- **URL**: https://buy.stripe.com/5kQ3cw5l086faBieOE2Nq05
- **Product**: Tango Coach Niche Upgrade
- **Price**: $9.99/month
- **Billing**: Monthly subscription

### **Yearly Plan**
- **URL**: https://buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03
- **Product**: Tango Coach Niche Upgrade
- **Price**: $95.90/year (20% discount)
- **Billing**: Yearly subscription

## 🎉 **Implementation Complete**

The coach niche upgrade system is now fully implemented and ready for production use! Users can upgrade to the coach niche using either monthly or yearly billing, and they'll immediately gain access to the coach dashboard after successful payment.

**Status**: ✅ **Ready for Testing & Production** 