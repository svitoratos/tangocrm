# Onboarding Flow Setup

This document explains the onboarding flow that guides new users through niche selection and Stripe subscription setup.

## Overview

The onboarding flow consists of three main steps:
1. **Niche Selection** - Users choose their creator type (Content Creator, Coach, Podcaster, Freelancer)
2. **Plan Selection** - Users select a pricing plan (Starter, Professional, Enterprise)
3. **Payment Setup** - Users complete their Stripe subscription

## Files Created

### Pages
- `src/app/onboarding/page.tsx` - Main onboarding flow
- `src/app/onboarding/success/page.tsx` - Success page after payment

### API Routes
- `src/app/api/stripe/onboarding-checkout/route.ts` - Creates Stripe checkout for onboarding
- `src/app/api/stripe/verify-session/route.ts` - Verifies payment completion

### Components
- `src/components/app/onboarding-progress.tsx` - Reusable progress indicator

## Flow Description

### 1. User Signs Up
- User completes Clerk sign-up
- Automatically redirected to `/onboarding`

### 2. Niche Selection
- User selects from 4 niches:
  - **Content Creator**: YouTubers, TikTokers, Instagram influencers
  - **Coach/Consultant**: Life coaches, business consultants, trainers
  - **Podcaster**: Podcast hosts, audio content creators
  - **Freelancer**: Designers, developers, writers, service professionals

### 3. Plan Selection
- User chooses from 2 plans:
  - **Tango Core** ($39.99/month): For creators, coaches, podcasters & freelancers
  - **Add a Niche** ($9.99/month per niche): Expand with more niche workspaces

### 4. Payment Processing
- User is redirected to Stripe Checkout
- Payment is processed securely
- User is redirected to success page

### 5. Success & Dashboard Access
- Payment verification occurs
- User is welcomed and guided to dashboard
- Dashboard is personalized based on selected niche

## Configuration Required

### Stripe Setup
1. **Create Products & Prices** in Stripe Dashboard:
   ```
   Tango Core: price_tango_core_monthly ($39.99/month)
   Add a Niche: price_add_niche_monthly ($9.99/month per niche)
   ```

2. **Update Price IDs** in `src/app/api/stripe/onboarding-checkout/route.ts`:
   ```typescript
   const planToPriceId: Record<string, string> = {
     'tango-core': 'price_your_actual_tango_core_price_id',
     'add-niche': 'price_your_actual_add_niche_price_id',
   }
   ```

3. **Set up Webhooks** for subscription management:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Environment Variables
Ensure these are set in `.env.local`:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Customization

### Adding New Niches
1. Add to `niches` array in `src/app/onboarding/page.tsx`
2. Update dashboard components to handle new niche
3. Add niche-specific features and workflows

### Modifying Plans
1. Update `pricingPlans` array in onboarding page
2. Add corresponding Stripe price IDs
3. Update plan features and limits

### Styling
- All components use Tailwind CSS
- Progress indicator is customizable via `OnboardingProgress` component
- Color schemes can be modified in the niche and plan cards

## Security Considerations

- All payment processing happens server-side
- User authentication is handled by Clerk
- Stripe webhooks verify payment completion
- Session verification prevents unauthorized access

## Testing

### Test Mode
- Use Stripe test keys for development
- Test with Stripe's test card numbers
- Verify webhook handling in test mode

### Production
- Switch to live Stripe keys
- Test with real payment methods
- Monitor webhook delivery and processing

## Next Steps

1. **Database Integration**: Store user preferences and subscription status
2. **Email Notifications**: Send welcome emails and onboarding guides
3. **Analytics**: Track onboarding completion rates
4. **A/B Testing**: Test different onboarding flows
5. **Onboarding Completion**: Add logic to prevent re-onboarding for existing users 