import Stripe from 'stripe';
import { supabase } from './supabase';

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

// Customer deduplication utilities
export async function findExistingCustomerByEmail(email: string): Promise<string | null> {
  try {
    const customers = await stripe.customers.list({
      email: email,
      limit: 100
    });
    
    // Return the first (oldest) customer found
    return customers.data.length > 0 ? customers.data[0].id : null;
  } catch (error) {
    console.error('Error finding existing customer by email:', error);
    return null;
  }
}

export async function mergeCustomers(existingCustomerId: string, newCustomerId: string): Promise<boolean> {
  try {
    console.log(`🔧 Merging customer ${newCustomerId} into ${existingCustomerId}`);
    
    // Get the new customer details
    const newCustomer = await stripe.customers.retrieve(newCustomerId);
    
    if (newCustomer.deleted) {
      console.log('⚠️ New customer was already deleted, skipping merge');
      return false;
    }
    
    // Get existing customer details for metadata
    const existingCustomer = await stripe.customers.retrieve(existingCustomerId);
    
    if (existingCustomer.deleted) {
      console.log('⚠️ Existing customer was deleted, cannot merge');
      return false;
    }
    
    // Transfer all subscriptions from new customer to existing customer
    const subscriptions = await stripe.subscriptions.list({
      customer: newCustomerId,
      limit: 100
    });
    
    for (const subscription of subscriptions.data) {
      console.log(`🔄 Transferring subscription ${subscription.id}`);
      
      // Update subscription metadata to track the transfer
      await stripe.subscriptions.update(subscription.id, {
        metadata: {
          ...subscription.metadata,
          transferred_from_customer: newCustomerId,
          transferred_at: new Date().toISOString(),
          merged_customer: existingCustomerId
        }
      });
    }
    
    // Transfer any payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: newCustomerId,
      type: 'card'
    });
    
    for (const paymentMethod of paymentMethods.data) {
      console.log(`🔄 Transferring payment method ${paymentMethod.id}`);
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: existingCustomerId
      });
    }
    
    // Update existing customer with any useful metadata from new customer
    const existingMetadata = existingCustomer.metadata || {};
    await stripe.customers.update(existingCustomerId, {
      metadata: {
        ...existingMetadata,
        merged_at: new Date().toISOString(),
        merged_customers: `${existingMetadata.merged_customers || ''},${newCustomerId}`.replace(/^,/, '')
      }
    });
    
    // Delete the duplicate customer
    await stripe.customers.del(newCustomerId);
    
    console.log('✅ Successfully merged customers');
    return true;
    
  } catch (error) {
    console.error('❌ Error merging customers:', error);
    return false;
  }
}

export async function ensureSingleCustomer(email: string, userId: string): Promise<string | null> {
  try {
    // First check if user already has a customer ID in our database
    const { data: userProfile } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();
    
    if (userProfile?.stripe_customer_id) {
      // Verify the customer still exists in Stripe
      try {
        await stripe.customers.retrieve(userProfile.stripe_customer_id);
        console.log('✅ Using existing customer ID:', userProfile.stripe_customer_id);
        return userProfile.stripe_customer_id;
      } catch (error) {
        console.log('⚠️ Stored customer ID not found in Stripe, will search by email');
      }
    }
    
    // Search for existing customer by email
    const existingCustomerId = await findExistingCustomerByEmail(email);
    
    if (existingCustomerId) {
      console.log('✅ Found existing customer by email:', existingCustomerId);
      
      // Update our database with this customer ID
      await supabase
        .from('users')
        .update({ 
          stripe_customer_id: existingCustomerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      return existingCustomerId;
    }
    
    // No existing customer found, will create new one
    console.log('🔧 No existing customer found, will create new one');
    return null;
    
  } catch (error) {
    console.error('❌ Error ensuring single customer:', error);
    return null;
  }
} 