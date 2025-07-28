import Stripe from 'stripe';

// Server-side Stripe instance (only create on server)
console.log('🔧 Stripe Secret Key:', process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...');
console.log('🔧 Stripe Publishable Key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...');

export const stripe = typeof window === 'undefined' 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil',
      typescript: true,
    })
  : null;

// Client-side Stripe instance
export const getStripe = () => {
  if (typeof window !== 'undefined') {
    const { loadStripe } = require('@stripe/stripe-js');
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return null;
};

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};

// Payment Links for different niches
export const STRIPE_PAYMENT_LINKS = {
  creator: {
    monthly: 'https://buy.stripe.com/fZueVebJofyHaBi35W2Nq00',
    yearly: 'https://buy.stripe.com/00weVefZE5Y7cJqbCs2Nq01',
  },
  coach: {
    monthly: 'https://buy.stripe.com/fZueVebJofyHaBi35W2Nq00',
    yearly: 'https://buy.stripe.com/00weVefZE5Y7cJqbCs2Nq01',
  },
  podcaster: {
    monthly: 'https://buy.stripe.com/fZueVebJofyHaBi35W2Nq00',
    yearly: 'https://buy.stripe.com/00weVefZE5Y7cJqbCs2Nq01',
  },
  freelancer: {
    monthly: 'https://buy.stripe.com/fZueVebJofyHaBi35W2Nq00',
    yearly: 'https://buy.stripe.com/00weVefZE5Y7cJqbCs2Nq01',
  },
};

// Legacy Product/Price IDs (keeping for reference)
export const STRIPE_PRODUCTS = {
  creator: {
    monthly: 'price_creator_monthly',
    yearly: 'price_creator_yearly',
  },
  coach: {
    monthly: 'price_coach_monthly',
    yearly: 'price_coach_yearly',
  },
  podcaster: {
    monthly: 'price_podcaster_monthly',
    yearly: 'price_podcaster_yearly',
  },
  freelancer: {
    monthly: 'price_freelancer_monthly',
    yearly: 'price_freelancer_yearly',
  },
};

// Pricing tiers
export const PRICING_TIERS = {
  creator: {
    name: 'Creator',
    monthly: 39.99,
    yearly: 383.90,
    features: [
      'Brand deal tracking',
      'Content calendar',
      'Analytics dashboard',
      'Client management',
      'Email support',
    ],
  },
  coach: {
    name: 'Coach',
    monthly: 39.99,
    yearly: 383.90,
    features: [
      'Client session scheduling',
      'Progress tracking',
      'Payment processing',
      'Session notes',
      'Priority support',
    ],
  },
  podcaster: {
    name: 'Podcaster',
    monthly: 39.99,
    yearly: 383.90,
    features: [
      'Episode planning',
      'Guest management',
      'Sponsorship tracking',
      'Analytics',
      'Email support',
    ],
  },
  freelancer: {
    name: 'Freelancer',
    monthly: 39.99,
    yearly: 383.90,
    features: [
      'Project management',
      'Time tracking',
      'Invoice generation',
      'Client portal',
      'Priority support',
    ],
  },
};

// Additional niche pricing
export const ADDITIONAL_NICHE_PRICING = {
  monthly: 9.99,
  yearly: 95.90,
}; 