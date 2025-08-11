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
    console.log('🔍 Ensuring single customer for:', { email, userId });
    
    // First check if user already has a customer ID in our database
    const { data: userProfile } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();
    
    if (userProfile?.stripe_customer_id) {
      // Verify the customer still exists in Stripe
      try {
        const customer = await stripe.customers.retrieve(userProfile.stripe_customer_id);
        if (!customer.deleted) {
          console.log('✅ Using existing customer ID from database:', userProfile.stripe_customer_id);
          return userProfile.stripe_customer_id;
        } else {
          console.log('⚠️ Stored customer ID was deleted in Stripe, will search by email');
        }
      } catch (error) {
        console.log('⚠️ Stored customer ID not found in Stripe, will search by email');
      }
    }
    
    // Search for existing customer by email (this is the key deduplication step)
    const existingCustomerId = await findExistingCustomerByEmail(email);
    
    if (existingCustomerId) {
      console.log('✅ Found existing customer by email:', existingCustomerId);
      
      // Update our database with this customer ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          stripe_customer_id: existingCustomerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ Error updating user with customer ID:', updateError);
      } else {
        console.log('✅ Updated user with existing customer ID');
      }
      
      return existingCustomerId;
    }
    
    // No existing customer found, create a new one
    console.log('🔧 No existing customer found, creating new one for:', email);
    
    const newCustomer = await stripe.customers.create({
      email: email,
      metadata: {
        clerk_user_id: userId,
        created_at: new Date().toISOString(),
        source: 'checkout_flow'
      }
    });
    
    // Update our database with the new customer ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        stripe_customer_id: newCustomer.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('❌ Error updating user with new customer ID:', updateError);
    } else {
      console.log('✅ Created and stored new customer ID:', newCustomer.id);
    }
    
    return newCustomer.id;
    
  } catch (error) {
    console.error('❌ Error ensuring single customer:', error);
    return null;
  }
}

// Function to clean up duplicate customers for a user
export async function cleanupDuplicateCustomers(email: string, primaryCustomerId: string): Promise<boolean> {
  try {
    console.log('🧹 Cleaning up duplicate customers for:', email);
    
    // Find all customers with this email
    const customers = await stripe.customers.list({
      email: email,
      limit: 100
    });
    
    const duplicateCustomers = customers.data.filter(c => 
      c.id !== primaryCustomerId && !c.deleted
    );
    
    if (duplicateCustomers.length === 0) {
      console.log('✅ No duplicate customers found');
      return true;
    }
    
    console.log(`🔧 Found ${duplicateCustomers.length} duplicate customers to clean up`);
    
    for (const duplicate of duplicateCustomers) {
      try {
        // Transfer any subscriptions to the primary customer
        const subscriptions = await stripe.subscriptions.list({
          customer: duplicate.id,
          limit: 100
        });
        
        for (const subscription of subscriptions.data) {
          console.log(`🔄 Transferring subscription ${subscription.id} from duplicate customer`);
          
          // Create new subscription for primary customer
          const newSubscription = await stripe.subscriptions.create({
            customer: primaryCustomerId,
            items: subscription.items.data.map(item => ({
              price: item.price.id,
              quantity: item.quantity
            })),
            metadata: {
              ...subscription.metadata,
              transferred_from_customer: duplicate.id,
              transferred_from_subscription: subscription.id,
              transferred_at: new Date().toISOString(),
              cleanup_operation: 'true'
            }
          });
          
          // Cancel the old subscription
          await stripe.subscriptions.cancel(subscription.id);
          
          // Update cancelled subscription with metadata
          await stripe.subscriptions.update(subscription.id, {
            metadata: {
              ...subscription.metadata,
              cancelled_because: 'duplicate_customer_cleanup',
              transferred_to_customer: primaryCustomerId,
              transferred_to_subscription: newSubscription.id,
              cancelled_at: new Date().toISOString()
            }
          });
        }
        
        // Delete the duplicate customer
        await stripe.customers.del(duplicate.id);
        console.log(`✅ Deleted duplicate customer: ${duplicate.id}`);
        
      } catch (error) {
        console.error(`❌ Error cleaning up duplicate customer ${duplicate.id}:`, error);
      }
    }
    
    console.log('✅ Duplicate customer cleanup completed');
    return true;
    
  } catch (error) {
    console.error('❌ Error during duplicate customer cleanup:', error);
    return false;
  }
} 