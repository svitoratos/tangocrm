import Stripe from 'stripe';

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Price IDs - Update these with your actual price IDs from Stripe Dashboard
export const STRIPE_PRICES = {
  creator: {
    monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual creator monthly price ID
    yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',  // Replace with your actual creator yearly price ID
  },
  coach: {
    monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual coach monthly price ID
    yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',  // Replace with your actual coach yearly price ID
  },
  podcaster: {
    monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual podcaster monthly price ID
    yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',  // Replace with your actual podcaster yearly price ID
  },
  freelancer: {
    monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual freelancer monthly price ID
    yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',  // Replace with your actual freelancer yearly price ID
  },
};

// Helper function to get price ID
export function getPriceId(niche: string, billingCycle: 'monthly' | 'yearly' = 'monthly'): string {
  const prices = STRIPE_PRICES[niche as keyof typeof STRIPE_PRICES];
  if (!prices) {
    throw new Error(`No price configuration found for niche: ${niche}`);
  }
  
  const priceId = prices[billingCycle];
  if (!priceId || priceId === 'price_1RjlLtIvVfT8K9K9K9K9K9K9') {
    throw new Error(`Price ID not configured for ${niche} ${billingCycle} plan`);
  }
  
  return priceId;
} 