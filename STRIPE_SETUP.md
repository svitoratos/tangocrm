# Stripe Payment Setup Guide

## 1. Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the account verification process
3. Get your API keys from the Stripe Dashboard

## 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Clerk Authentication (you already have these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Get Your Stripe API Keys

1. Log into your Stripe Dashboard
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Replace the placeholder values in your `.env.local` file

## 4. Test the Integration

The current implementation uses dynamic pricing instead of pre-created products, which means:

- **Tango Core Plan**: $39.99/month
- **Add a Niche Plan**: $9.99/month

The payment flow will work immediately once you add your Stripe keys.

## 5. Production Setup

When you're ready for production:

1. Switch to **Live** mode in Stripe Dashboard
2. Update your environment variables with live keys
3. Set up webhook endpoints for subscription management
4. Configure your domain in Stripe settings

## 6. Current Implementation

The payment flow works as follows:

1. User completes onboarding and clicks "Complete Setup"
2. Stripe Checkout session is created with dynamic pricing
3. User is redirected to Stripe's hosted checkout page
4. After successful payment, user is redirected to `/onboarding/success`
5. User can then access their dashboard

## 7. Testing

You can test the payment flow using Stripe's test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## 8. Next Steps

Once basic payments are working, consider adding:

- Webhook handling for subscription events
- Customer portal for subscription management
- Usage-based billing
- Invoice generation
- Payment method management

## Troubleshooting

If you see "Invalid API Key" errors:

1. Check that your `.env.local` file exists
2. Verify the API keys are correct
3. Restart your development server after adding environment variables
4. Make sure you're using test keys for development 