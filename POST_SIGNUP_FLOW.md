# Post-Signup Loading Flow

## Overview
After a user completes the Stripe checkout during onboarding, they are redirected to a beautiful loading screen that matches the onboarding design.

## Flow Steps

### 1. User Completes Onboarding
- User goes through 4-step onboarding process
- Selects niches, goals, sees testimonials
- Clicks "Start 3-Day Free Trial" on step 4

### 2. Stripe Checkout
- User is redirected to Stripe checkout
- Completes payment with 3-day free trial
- Stripe redirects back to `/onboarding/success` with session data

### 3. Post-Signup Loading Screen
- Shows the `PostSignupLoading` component
- Displays animated progress steps:
  - ✅ Creating your CRM dashboard
  - ✅ Personalizing your workspace  
  - ✅ Getting everything ready for you
- Shows testimonial and encouraging messages
- Includes bubble animations matching onboarding design

### 4. Automatic Redirect
- After ~4.5 seconds of simulated setup
- Automatically redirects to dashboard with niche parameter
- URL: `/dashboard?niche={selected_niche}&section=crm`

## Files Involved

### Components
- `src/components/app/post-signup-loading.tsx` - The loading screen component
- `src/components/app/tango-onboarding.tsx` - Main onboarding component

### Pages
- `src/app/onboarding/success/page.tsx` - Success page that shows loading screen

### API Routes
- `src/app/api/stripe/onboarding-checkout/route.ts` - Creates Stripe checkout session
- `src/app/api/stripe/webhook/route.ts` - Handles Stripe webhooks for payment events

## Configuration

### Environment Variables Needed
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Webhook Events
The webhook handles these events:
- `checkout.session.completed` - When user completes payment
- `customer.subscription.created` - When subscription is created
- `customer.subscription.updated` - When subscription is updated
- `customer.subscription.deleted` - When subscription is cancelled

## Customization

### Loading Duration
To change the loading duration, modify the `setupSteps` array in `onboarding/success/page.tsx`:

```tsx
const setupSteps = [
  { name: 'Creating your CRM dashboard', duration: 2000 },
  { name: 'Personalizing your workspace', duration: 1500 },
  { name: 'Getting everything ready for you', duration: 1000 },
];
```

### Progress Steps
To add/remove progress steps, update the JSX in `post-signup-loading.tsx`.

### Redirect Destination
To change where users are redirected after loading, modify the router.push call in `onboarding/success/page.tsx`.

## Testing

### Local Testing
1. Complete onboarding flow
2. Use Stripe test card: `4242 4242 4242 4242`
3. Complete checkout
4. Should see loading screen then redirect to dashboard

### Webhook Testing
Use Stripe CLI to test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
``` 