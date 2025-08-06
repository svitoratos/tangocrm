// Stripe Price IDs - Update these with your actual price IDs from Stripe Dashboard
export const STRIPE_PRICE_IDS = {
  // Monthly plans
  creator: {
    monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual creator monthly price ID
    yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual creator yearly price ID
  },
  coach: {
    monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual coach monthly price ID
    yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual coach yearly price ID
  },
  podcaster: {
    monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual podcaster monthly price ID
    yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual podcaster yearly price ID
  },
  freelancer: {
    monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual freelancer monthly price ID
    yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9', // Replace with your actual freelancer yearly price ID
  },
}

// Helper function to get price ID based on niche and billing cycle
export function getPriceId(niche: string, billingCycle: 'monthly' | 'yearly' = 'monthly'): string {
  const nicheConfig = STRIPE_PRICE_IDS[niche as keyof typeof STRIPE_PRICE_IDS]
  if (!nicheConfig) {
    throw new Error(`No price configuration found for niche: ${niche}`)
  }
  
  const priceId = nicheConfig[billingCycle]
  if (!priceId || priceId === 'price_1RjlLtIvVfT8K9K9K9K9K9K9') {
    throw new Error(`Price ID not configured for ${niche} ${billingCycle} plan`)
  }
  
  return priceId
} 