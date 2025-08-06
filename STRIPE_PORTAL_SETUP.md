# Stripe Customer Portal Setup Guide

## Overview

This guide will help you configure the Stripe Customer Portal so that your users can manage their subscriptions, update payment methods, and view billing history.

## Prerequisites

1. **Stripe Account**: Ensure you have a Stripe account with API access
2. **Environment Variables**: Make sure your Stripe keys are properly configured
3. **Products & Prices**: You need to have products and prices set up in Stripe

## Step 1: Environment Variables Setup

Ensure these environment variables are set in your `.env.local` and production environment:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxx  # or sk_live_xxx for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # or pk_live_xxx for production
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Step 2: Run the Portal Setup Script

Execute the setup script to create products, prices, and configure the customer portal:

```bash
# Install dependencies if not already installed
npm install stripe

# Run the setup script
node scripts/setup-stripe-portal.js
```

This script will:
- Create products for each niche (creator, coach, podcaster, freelancer)
- Create monthly and yearly prices for each product
- Configure the customer portal with proper settings
- Test portal session creation

## Step 3: Manual Dashboard Configuration

### 3.1 Access Customer Portal Settings

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings** → **Customer Portal**
3. Click **Configure** to set up your portal

### 3.2 Configure Portal Features

Enable these features in your portal configuration:

#### Business Profile
- **Headline**: "Manage your Tango CRM subscription"
- **Privacy Policy URL**: `https://yourdomain.com/privacy`
- **Terms of Service URL**: `https://yourdomain.com/terms`

#### Customer Information
- ✅ **Customer update**: Allow customers to update their information
- ✅ **Allowed updates**: Email, Address, Phone, Tax ID

#### Billing
- ✅ **Invoice history**: Allow customers to view and download invoices
- ✅ **Payment method update**: Allow customers to update payment methods

#### Subscriptions
- ✅ **Subscription cancellation**: Allow customers to cancel subscriptions
- ✅ **Subscription pause**: Allow customers to pause subscriptions
- ✅ **Subscription updates**: Allow customers to change plans

#### Subscription Update Settings
- **Default allowed updates**: Price, Quantity
- **Proration behavior**: Create prorations
- **Product catalog**: Include all your Tango CRM products

### 3.3 Set Return URL

Set the return URL to redirect customers back to your application:
```
https://yourdomain.com/dashboard/settings?tab=subscription
```

For development:
```
http://localhost:3000/dashboard/settings?tab=subscription
```

## Step 4: Verify Product Catalog

Ensure your product catalog includes:

### Products
1. **Tango Creator CRM** - For content creators and influencers
2. **Tango Coach CRM** - For coaches and consultants
3. **Tango Podcaster CRM** - For podcasters and audio creators
4. **Tango Freelancer CRM** - For freelancers and contractors

### Prices
Each product should have:
- **Monthly price**: $39.99/month
- **Yearly price**: $383.90/year (20% discount)

## Step 5: Test the Portal

### 5.1 Create a Test Customer

1. Go to **Customers** in your Stripe Dashboard
2. Create a test customer with a valid email
3. Assign them a subscription to one of your products

### 5.2 Test Portal Access

1. Go to the customer's page in Stripe Dashboard
2. Click **Actions** → **Open customer portal**
3. Verify all features work correctly:
   - Customer can view subscription details
   - Customer can update payment methods
   - Customer can view invoice history
   - Customer can cancel or pause subscription

### 5.3 Test from Your Application

1. Log in to your application
2. Go to **Dashboard** → **Settings** → **Subscription**
3. Click **Manage Billing**
4. Verify the portal opens correctly and redirects back

## Step 6: Webhook Configuration

Ensure your webhook endpoint is configured to handle portal events:

### Webhook Endpoint
```
https://yourdomain.com/api/stripe/webhook
```

### Events to Listen For
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.updated`
- `payment_method.attached`
- `payment_method.detached`

## Step 7: Production Deployment

### 7.1 Update Environment Variables

For production, use live Stripe keys:
```bash
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 7.2 Update Return URLs

Update all return URLs to use your production domain:
```
https://yourdomain.com/dashboard/settings?tab=subscription
```

### 7.3 Test with Real Customers

1. Create a real subscription for a test customer
2. Test the full customer journey
3. Verify all portal features work in production

## Troubleshooting

### Common Issues

#### 1. "No such customer" Error
**Cause**: Customer doesn't exist in Stripe
**Solution**: Ensure customers are created in Stripe when they sign up

#### 2. Portal Configuration Not Found
**Cause**: Portal not configured in Stripe Dashboard
**Solution**: Run the setup script and configure manually in Dashboard

#### 3. Products Not Available in Portal
**Cause**: Products not added to portal configuration
**Solution**: Add products to the subscription update feature in portal settings

#### 4. Return URL Issues
**Cause**: Incorrect return URL configuration
**Solution**: Update return URL in portal settings and API calls

### Debug Commands

Test portal session creation:
```bash
node scripts/test-portal-api.js
```

Check customer data:
```bash
node scripts/check-customer-data.js
```

## API Integration

Your application already has the necessary API endpoints:

### Portal Session Creation
```typescript
// POST /api/stripe/portal
const response = await fetch('/api/stripe/portal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const { url } = await response.json();
window.location.href = url;
```

### Subscription Management
```typescript
// GET /api/user/subscription-details
// GET /api/user/subscription-status
// POST /api/user/force-refresh-payment-status
```

## Security Considerations

1. **Authentication**: Always verify user authentication before creating portal sessions
2. **Customer Verification**: Ensure users can only access their own billing portal
3. **Webhook Security**: Verify webhook signatures to prevent unauthorized requests
4. **Environment Separation**: Use test keys for development, live keys for production

## Support

If you encounter issues:

1. Check the Stripe Dashboard for error messages
2. Review your webhook logs
3. Test with the provided scripts
4. Contact Stripe support if needed

## Next Steps

After completing this setup:

1. Monitor portal usage in Stripe Dashboard
2. Set up analytics to track customer portal interactions
3. Consider adding custom branding to the portal
4. Implement additional features like usage-based billing if needed 