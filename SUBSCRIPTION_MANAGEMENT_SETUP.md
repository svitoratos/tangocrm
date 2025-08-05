# Subscription Management System Setup

## Overview

I've created a comprehensive subscription management system for your Tango CRM that allows users to view, manage, and control their subscriptions directly within the application.

## Features Implemented

### 1. **Subscription Management Component** (`/src/components/app/subscription-management.tsx`)

**Three-Tab Interface:**
- **Overview Tab**: Current subscription status, plan details, active niches, and features
- **Billing Tab**: Payment management, billing cycle changes, and Stripe customer portal access
- **Actions Tab**: Cancellation requests and support options

**Key Features:**
- Real-time subscription status display
- Billing cycle management (monthly ↔ yearly)
- Active niche breakdown
- Plan feature overview
- One-click Stripe customer portal access
- Cancellation request workflow
- Support integration

### 2. **Settings Page Integration**

The subscription management is now integrated into the settings page at `/dashboard/settings` with a dedicated "Subscription" tab.

## Stripe Setup Requirements

### 1. **Environment Variables**

Ensure these are set in your `.env.local` and Vercel:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# For production
STRIPE_LIVE_SECRET_KEY=sk_live_xxx
STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_xxx
```

### 2. **Stripe Products & Prices**

Create these products in your Stripe Dashboard:

#### Monthly Plan
- **Product Name**: Tango Monthly Plan
- **Price**: $39.99/month
- **Billing**: Monthly
- **Features**: Core CRM features

#### Yearly Plan  
- **Product Name**: Tango Yearly Plan
- **Price**: $383.90/year (20% discount)
- **Billing**: Yearly
- **Features**: Core CRM features + 20% savings

### 3. **Stripe Customer Portal**

Set up the customer portal in Stripe Dashboard:

1. Go to **Settings** → **Customer Portal**
2. Configure these features:
   - ✅ **Payment method updates**
   - ✅ **Billing history**
   - ✅ **Invoice downloads**
   - ✅ **Subscription cancellation**
   - ✅ **Subscription pause**
   - ✅ **Plan changes**

3. Set the return URL to: `https://yourdomain.com/dashboard/settings?tab=subscription`

### 4. **Webhook Configuration**

Ensure your webhook endpoint is configured in Stripe:

**Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`

**Events to listen for**:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Database Schema

Ensure your `users` table has these columns:

```sql
-- Subscription tracking
stripe_customer_id TEXT,
stripe_subscription_id TEXT,
subscription_status TEXT DEFAULT 'inactive',
subscription_tier TEXT DEFAULT 'free',

-- User details
email TEXT,
full_name TEXT,
timezone TEXT DEFAULT 'America/New_York',
onboarding_completed BOOLEAN DEFAULT FALSE,

-- Niche management
primary_niche TEXT DEFAULT 'creator',
niches TEXT[] DEFAULT ARRAY['creator'],

-- Timestamps
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

## API Endpoints

### Existing Endpoints (Enhanced)
- `/api/stripe/webhook` - Handles all Stripe events
- `/api/user/subscription-details` - Gets subscription details
- `/api/user/subscription-status` - Updates subscription status
- `/api/user/force-refresh-payment-status` - Refreshes payment status

### New Endpoints
- `/api/stripe/portal` - Creates customer portal session
- `/api/admin/fix-subscription-ids` - Admin tool to fix subscription IDs

## User Experience Flow

### 1. **New User Onboarding**
1. User completes onboarding
2. Redirected to Stripe checkout
3. Webhook processes payment
4. User gets access to subscription management

### 2. **Existing User Management**
1. User goes to Settings → Subscription
2. Views current plan and status
3. Can upgrade/downgrade billing cycle
4. Can access Stripe customer portal
5. Can request cancellation

### 3. **Billing Cycle Changes**
1. User clicks upgrade/downgrade
2. Redirected to Stripe customer portal
3. Makes changes in Stripe
4. Webhook updates database
5. User sees updated status

## Testing the System

### 1. **Test Subscription Creation**
```bash
# Use Stripe test cards
Card: 4242 4242 4242 4242
Exp: Any future date
CVC: Any 3 digits
```

### 2. **Test Webhook Events**
Use Stripe CLI to test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 3. **Test Customer Portal**
1. Create a test subscription
2. Go to Settings → Subscription → Billing
3. Click "Manage Billing"
4. Should redirect to Stripe customer portal

## Admin Tools

### Fix Subscription IDs
Access `/admin/fix-subscriptions` to:
- Find users with missing subscription IDs
- Sync subscription data from Stripe
- Update database with correct information

## Monitoring & Analytics

### 1. **Stripe Dashboard**
Monitor:
- Subscription metrics
- Revenue analytics
- Customer portal usage
- Webhook delivery rates

### 2. **Application Logs**
Look for:
- Webhook processing logs
- Subscription status changes
- Customer portal access
- Error handling

### 3. **Database Monitoring**
Track:
- Subscription status distribution
- Billing cycle preferences
- Niche usage patterns

## Security Considerations

### 1. **Webhook Security**
- Verify webhook signatures
- Use HTTPS endpoints
- Validate event data

### 2. **Customer Portal**
- Secure session management
- Proper authentication
- CSRF protection

### 3. **Data Protection**
- Encrypt sensitive data
- Follow GDPR compliance
- Secure API endpoints

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**
   - Check webhook endpoint URL
   - Verify webhook secret
   - Check server logs

2. **Subscription Status Not Updating**
   - Run admin fix tool
   - Check webhook processing
   - Verify database schema

3. **Customer Portal Not Working**
   - Check Stripe configuration
   - Verify return URL
   - Check authentication

### Debug Commands

```bash
# Check webhook status
curl -X POST https://yourdomain.com/api/stripe/webhook

# Test subscription details
curl -X GET https://yourdomain.com/api/user/subscription-details

# Force refresh payment status
curl -X POST https://yourdomain.com/api/user/force-refresh-payment-status
```

## Next Steps

1. **Deploy the changes** to Vercel
2. **Configure Stripe products** and prices
3. **Set up customer portal** in Stripe Dashboard
4. **Test the complete flow** with test cards
5. **Monitor webhook delivery** and processing
6. **Train support team** on the new system

## Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Customer Portal Setup](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe Webhook Guide](https://stripe.com/docs/webhooks)
- [Tango CRM Support](mailto:support@tangocrm.com) 