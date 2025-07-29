# Stripe Payment Links Setup Guide

## 🎯 **Two Approaches for Niche Upgrades**

### **Option 1: Dynamic API (Current - Recommended)**
- ✅ **More flexible** - Easy to change prices, add features
- ✅ **Better metadata** - Rich session data
- ✅ **Cleaner code** - One API handles all niches
- ✅ **Future-proof** - Easy to add new niches

### **Option 2: Individual Payment Links**
- ✅ **Better analytics** - Track per-niche performance
- ✅ **Direct marketing** - Share specific niche links
- ✅ **Simpler webhooks** - Each link has specific metadata
- ❌ **Less flexible** - Harder to change prices/features

## 🔧 **Current Implementation (Dynamic API)**

The system currently uses a dynamic API approach:

```typescript
// User selects niche in modal
const response = await fetch('/api/stripe/niche-upgrade', {
  method: 'POST',
  body: JSON.stringify({
    selectedNiche: 'coach',        // Specific niche
    billingCycle: 'monthly'        // Billing preference
  }),
});

// API creates checkout session with proper metadata
const session = await stripe.checkout.sessions.create({
  metadata: {
    niche: selectedNiche,          // 'coach'
    upgrade_type: 'niche_upgrade',
    billing_cycle: billingCycle    // 'monthly'
  }
});
```

## 📊 **If You Want Individual Payment Links**

### **Step 1: Create Payment Links in Stripe Dashboard**

1. **Go to Stripe Dashboard** → Payment Links
2. **Create links for each niche**:

#### **Creator Niche**
- **Name**: "Tango Creator Niche Upgrade"
- **Price**: $9.99/month or $95.90/year
- **Metadata**:
  ```json
  {
    "niche": "creator",
    "upgrade_type": "niche_upgrade"
  }
  ```

#### **Coach Niche**
- **Name**: "Tango Coach Niche Upgrade"
- **Price**: $9.99/month or $95.90/year
- **Metadata**:
  ```json
  {
    "niche": "coach",
    "upgrade_type": "niche_upgrade"
  }
  ```

#### **Podcaster Niche**
- **Name**: "Tango Podcaster Niche Upgrade"
- **Price**: $9.99/month or $95.90/year
- **Metadata**:
  ```json
  {
    "niche": "podcaster",
    "upgrade_type": "niche_upgrade"
  }
  ```

#### **Freelancer Niche**
- **Name**: "Tango Freelancer Niche Upgrade"
- **Price**: $9.99/month or $95.90/year
- **Metadata**:
  ```json
  {
    "niche": "freelancer",
    "upgrade_type": "niche_upgrade"
  }
  ```

### **Step 2: Update Code to Use Individual Links**

```typescript
const NICHE_PAYMENT_LINKS = {
  creator: {
    monthly: 'https://buy.stripe.com/creator_monthly_link',
    yearly: 'https://buy.stripe.com/creator_yearly_link'
  },
  coach: {
    monthly: 'https://buy.stripe.com/coach_monthly_link',
    yearly: 'https://buy.stripe.com/coach_yearly_link'
  },
  podcaster: {
    monthly: 'https://buy.stripe.com/podcaster_monthly_link',
    yearly: 'https://buy.stripe.com/podcaster_yearly_link'
  },
  freelancer: {
    monthly: 'https://buy.stripe.com/freelancer_monthly_link',
    yearly: 'https://buy.stripe.com/freelancer_yearly_link'
  }
};

// In the upgrade modal:
const handleUpgrade = () => {
  if (selectedNiche) {
    const paymentLink = NICHE_PAYMENT_LINKS[selectedNiche][billingCycle];
    window.location.href = paymentLink;
  }
};
```

## 🎯 **My Recommendation**

**Stick with the current Dynamic API approach** because:

1. **✅ More Flexible**: Easy to change prices, add features, modify metadata
2. **✅ Better User Experience**: Consistent checkout flow
3. **✅ Easier Maintenance**: One API to maintain vs 8 payment links
4. **✅ Future-Proof**: Easy to add new niches or features
5. **✅ Better Error Handling**: Can handle failures gracefully

## 📈 **Analytics & Tracking**

### **Current Approach (Dynamic API)**:
- Track via webhook metadata
- Use session metadata for analytics
- Monitor via Stripe Dashboard → Events

### **Individual Links Approach**:
- Track via payment link analytics
- Use link-specific metadata
- Monitor via Stripe Dashboard → Payment Links

## 🚀 **Next Steps**

1. **Test the current dynamic API** approach
2. **Monitor webhook events** to ensure proper niche tracking
3. **Consider individual links** only if you need specific marketing features
4. **Evaluate based on** your specific business needs

The current dynamic API approach is working well and provides all the benefits you need! 🎯 