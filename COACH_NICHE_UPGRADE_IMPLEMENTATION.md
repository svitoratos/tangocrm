# Coach Niche Upgrade Implementation

## 🎯 **Objective**
Implement a specific payment link for the coach niche upgrade that immediately unlocks the coach dashboard after successful payment.

## ✅ **Implementation Complete**

### **Payment Links**
- **Monthly URL**: `https://buy.stripe.com/5kQ3cw5l086faBieOE2Nq05`
- **Yearly URL**: `https://buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03`
- **Niche**: Coach
- **Billing**: Monthly or Yearly
- **Purpose**: Add coach niche to user's account

## 🔄 **User Flow**

### **Step 1: User Initiates Upgrade**
1. User clicks "Add Niche" in sidebar
2. Upgrade modal opens
3. User selects "Coach" niche
4. User selects "Monthly" billing cycle

### **Step 2: Payment Processing**
1. System detects coach niche + billing cycle (monthly/yearly)
2. Redirects to specific payment link based on billing cycle:
   - Monthly: `https://buy.stripe.com/5kQ3cw5l086faBieOE2Nq05`
   - Yearly: `https://buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03`
3. User completes payment on Stripe

### **Step 3: Payment Success**
1. Stripe redirects to `/payment-success`
2. Payment success page detects coach payment link
3. Redirects to `/onboarding/success` with coach metadata

### **Step 4: Niche Addition**
1. Onboarding success page adds coach niche to user account
2. Updates user's niches array: `['podcaster', 'creator', 'coach']`
3. Sets subscription status to active

### **Step 5: Dashboard Access**
1. Redirects to coach dashboard: `/dashboard?niche=coach&section=dashboard`
2. User immediately sees coach dashboard
3. Coach niche appears in sidebar dropdown

## 🔧 **Code Changes Made**

### **1. Niche Upgrade Modal (`src/components/app/niche-upgrade-modal.tsx`)**
```typescript
// Special handling for coach niche - use the specific payment links
if (selectedNiche === 'coach') {
  if (billingCycle === 'monthly') {
    console.log('🔧 Using specific coach monthly payment link');
    window.location.href = 'https://buy.stripe.com/5kQ3cw5l086faBieOE2Nq05';
  } else if (billingCycle === 'yearly') {
    console.log('🔧 Using specific coach yearly payment link');
    window.location.href = 'https://buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03';
  }
  onClose();
  return;
}
```

### **2. Payment Success Page (`src/app/payment-success/page.tsx`)**
```typescript
// Check if user came from the coach payment links
const referrer = document.referrer;
if (referrer.includes('buy.stripe.com/5kQ3cw5l086faBieOE2Nq05') || 
    referrer.includes('buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03')) {
  console.log('🔧 Detected coach niche payment link, adding coach niche');
  router.push('/onboarding/success?upgrade=true&niche=coach&niches=%5B%22coach%22%5D&specific_niche=coach');
}
```

### **3. Onboarding Success Page (`src/app/onboarding/success/page.tsx`)**
```typescript
// Special handling for coach niche - immediately switch to coach dashboard
if (specificNiche === 'coach') {
  console.log('🎯 Coach niche added - will redirect to coach dashboard');
}

// Final redirect logic
if (finalNiche === 'coach' || specificNiche === 'coach') {
  console.log('🎯 Redirecting to coach dashboard...');
  router.push('/dashboard?niche=coach&section=dashboard&upgrade=success');
}
```

### **4. Stripe API (`src/app/api/stripe/niche-upgrade/route.ts`)**
```typescript
// Success URL includes specific niche metadata
const successUrl = `${baseUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}&niche=${selectedNiche}&niches=%5B%22${selectedNiche}%22%5D&upgrade=true&specific_niche=${selectedNiche}`;
```

## 📊 **Current User Status**

Based on the test results:

- **stevenvitoratos@gotangocrm.com**: Has `['podcaster', 'creator']` - ✅ Can upgrade to coach
- **stevenvitoratos@getbondlyapp.com**: Has `['podcaster', 'creator']` - ✅ Can upgrade to coach

## 🎯 **Benefits**

1. **✅ Specific Payment Link**: Dedicated Stripe payment link for coach niche
2. **✅ Immediate Access**: Coach dashboard unlocked immediately after payment
3. **✅ Proper Tracking**: Coach niche metadata tracked through entire flow
4. **✅ Better UX**: Clear upgrade path with specific niche selection
5. **✅ Analytics**: Can track coach niche upgrade performance separately

## 🚀 **Testing Instructions**

1. **Login** as a user with active subscription but no coach niche
2. **Click "Add Niche"** in the sidebar
3. **Select "Coach"** niche in the upgrade modal
4. **Select billing cycle** (Monthly or Yearly)
5. **Complete payment** using the specific payment link
6. **Verify** coach dashboard is immediately accessible
7. **Check** coach niche appears in sidebar dropdown

## 🔗 **Payment Link Details**

### **Monthly Plan**
- **URL**: https://buy.stripe.com/5kQ3cw5l086faBieOE2Nq05
- **Product**: Tango Coach Niche Upgrade
- **Price**: $9.99/month
- **Success URL**: `/onboarding/success` with coach metadata
- **Cancel URL**: `/dashboard`

### **Yearly Plan**
- **URL**: https://buy.stripe.com/00w5kEcNs1HR10IdKA2Nq03
- **Product**: Tango Coach Niche Upgrade
- **Price**: $95.90/year (20% discount)
- **Success URL**: `/onboarding/success` with coach metadata
- **Cancel URL**: `/dashboard`

The coach niche upgrade is now fully implemented and ready for testing! 🎯 