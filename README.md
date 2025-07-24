# Creator CRM Platform

A comprehensive CRM platform designed specifically for creators, coaches, podcasters, and freelancers to manage their business operations.

## Features

- **Multi-Niche Support**: Specialized workflows for Content Creators, Coaches, Podcasters, and Freelancers
- **Subscription Management**: Integrated Stripe payment processing
- **Onboarding Flow**: Guided setup process for new users
- **Dashboard**: Comprehensive business management tools
- **Client Management**: Track leads, opportunities, and client relationships

## Authentication Flow

### New User Signup
1. User signs up via Clerk authentication
2. Automatically redirected to `/onboarding`
3. User selects their niche(s) and subscription plan
4. Completes payment via Stripe
5. Redirected to dashboard with personalized features

### Returning Users
- Users who have completed onboarding are automatically redirected to their dashboard
- Users who haven't completed onboarding are redirected to the onboarding flow
- Dashboard access is protected and requires completed onboarding

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

Create a `.env.local` file with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
