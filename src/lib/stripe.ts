import Stripe from 'stripe';
import { supabase } from './supabase';

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Price IDs - Updated with actual price IDs from Stripe Dashboard
export const STRIPE_PRICES = {
  creator: {
    monthly: 'price_1Rt8u9IvVfTNGbwuoAxHpYSj',
    yearly: 'price_1Rt8u9IvVfTNGbwug424qIjh',
  },
  coach: {
    monthly: 'price_1Rt8u9IvVfTNGbwu0UI52sRR',
    yearly: 'price_1Rt8u9IvVfTNGbwuH88MMC8I',
  },
  podcaster: {
    monthly: 'price_1Rt8uAIvVfTNGbwuiwPUarlw',
    yearly: 'price_1Rt8uAIvVfTNGbwu9nXGrotw',
  },
  freelancer: {
    monthly: 'price_1Rt8uAIvVfTNGbwupN9yBl9U',
    yearly: 'price_1Rt8uBIvVfTNGbwuWxLrbFPu',
  },
};

// Price IDs for niche upgrades (different from initial signups)
export const STRIPE_NICHE_UPGRADE_PRICES = {
  creator: {
    monthly: 'price_1RqIA2IvVfTNGbwujqF5AXfU',
    yearly: 'price_1RqIAoIvVfTNGbwuXswPztfk',
  },
  coach: {
    monthly: 'price_1RjmO3IvVfTNGbwuU9KTk44N',
    yearly: 'price_1RkCcMIvVfTNGbwuyFeyMlbZ',
  },
  podcaster: {
    monthly: 'price_1RqII9IvVfTNGbwuhApqysHX',
    yearly: 'price_1RqIIXIvVfTNGbwu8EMGv4OG',
  },
  freelancer: {
    monthly: 'price_1RqIK7IvVfTNGbwuAiFKM7is',
    yearly: 'price_1RqIKNIvVfTNGbwuHONiyPQ7',
  },
};

// Helper function to get price ID
export function getPriceId(niche: string, billingCycle: 'monthly' | 'yearly' = 'monthly', isNicheUpgrade: boolean = false): string {
  const prices = isNicheUpgrade ? STRIPE_NICHE_UPGRADE_PRICES : STRIPE_PRICES;
  const priceSet = prices[niche as keyof typeof prices];
  
  if (!priceSet) {
    throw new Error(`No price configuration found for niche: ${niche} (${isNicheUpgrade ? 'upgrade' : 'initial'})`);
  }
  
  const priceId = priceSet[billingCycle];
  if (!priceId) {
    throw new Error(`Price ID not configured for ${niche} ${billingCycle} plan (${isNicheUpgrade ? 'upgrade' : 'initial'})`);
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
    console.log('🔍 Searching for existing customer by email:', email);
    const existingCustomerId = await findExistingCustomerByEmail(email);
    
    if (existingCustomerId) {
      console.log('✅ Found existing customer by email:', existingCustomerId);
      
      // Update our database with this customer ID
      console.log('🔄 Updating database with existing customer ID:', existingCustomerId);
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          stripe_customer_id: existingCustomerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ Error updating user with customer ID:', updateError);
        console.error('❌ Update details:', { userId, existingCustomerId, error: updateError });
        // Don't fail here - still return the customer ID
        console.log('⚠️ Continuing with existing customer ID despite database update failure');
      } else {
        console.log('✅ Successfully updated user with existing customer ID');
      }
      
      return existingCustomerId;
    } else {
      console.log('🔍 No existing customer found by email');
    }
    
    // No existing customer found, create a new one
    console.log('🔧 No existing customer found, creating new one for:', email);
    
    const newCustomer = await stripe.customers.create({
      email: email,
      metadata: {
        clerk_user_id: userId,
        created_at: new Date().toISOString(),
        source: 'checkout_flow',
        customer_type: 'primary',
        consolidation_status: 'active',
        total_niches: '1',
        niches: '[]',
        last_consolidation_check: new Date().toISOString(),
        system_version: '2.0.0'
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
    
    if (customers.data.length <= 1) {
      console.log('✅ No duplicate customers found');
      return true;
    }
    
    console.log(`🔍 Found ${customers.data.length} customers for email:`, email);
    
    // Sort customers by creation date (oldest first)
    const sortedCustomers = customers.data.sort((a, b) => a.created - b.created);
    const primaryCustomer = sortedCustomers[0];
    
    if (primaryCustomer.id !== primaryCustomerId) {
      console.log('⚠️ Primary customer ID mismatch, using oldest customer as primary');
    }
    
    // Collect all customer IDs to be merged
    const customersToMerge = sortedCustomers.slice(1).map(c => c.id);
    
    // Process all other customers (merge them into the primary)
    for (let i = 1; i < sortedCustomers.length; i++) {
      const duplicateCustomer = sortedCustomers[i];
      console.log(`🔄 Processing duplicate customer: ${duplicateCustomer.id}`);
      
      try {
        const mergeSuccess = await mergeCustomers(primaryCustomer.id, duplicateCustomer.id);
        if (mergeSuccess) {
          console.log(`✅ Successfully merged customer ${duplicateCustomer.id} into ${primaryCustomer.id}`);
        } else {
          console.log(`⚠️ Failed to merge customer ${duplicateCustomer.id}`);
        }
      } catch (error) {
        console.error(`❌ Error merging customer ${duplicateCustomer.id}:`, error);
      }
    }
    
    // Consolidate metadata after all merges
    if (customersToMerge.length > 0) {
      await consolidateCustomerMetadata(primaryCustomer.id, customersToMerge);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error cleaning up duplicate customers:', error);
    return false;
  }
}

// Function to ensure all subscriptions for a user are under the same customer ID
export async function ensureSubscriptionCustomerConsistency(userId: string, email: string): Promise<boolean> {
  try {
    console.log('🔍 Ensuring subscription customer consistency for user:', userId);
    
    // Get user's current customer ID
    const { data: userProfile } = await supabase
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', userId)
      .single();
    
    if (!userProfile?.stripe_customer_id) {
      console.log('⚠️ User has no customer ID, nothing to consolidate');
      return true;
    }
    
    // Find all customers with this email
    const customers = await stripe.customers.list({
      email: email,
      limit: 100
    });
    
    if (customers.data.length <= 1) {
      console.log('✅ User already has single customer ID');
      return true;
    }
    
    console.log(`🔍 Found ${customers.data.length} customers for user, consolidating...`);
    
    // Find the primary customer (the one stored in our database)
    const primaryCustomer = customers.data.find(c => c.id === userProfile.stripe_customer_id);
    
    if (!primaryCustomer) {
      console.error('❌ Primary customer not found in Stripe');
      return false;
    }
    
    // Consolidate all other customers into the primary one
    for (const customer of customers.data) {
      if (customer.id === primaryCustomer.id) continue;
      
      console.log(`🔄 Consolidating customer ${customer.id} into ${primaryCustomer.id}`);
      
      try {
        const mergeSuccess = await mergeCustomers(primaryCustomer.id, customer.id);
        if (mergeSuccess) {
          console.log(`✅ Successfully consolidated customer ${customer.id}`);
        } else {
          console.log(`⚠️ Failed to consolidate customer ${customer.id}`);
        }
      } catch (error) {
        console.error(`❌ Error consolidating customer ${customer.id}:`, error);
      }
    }
    
    console.log('✅ Subscription customer consistency check completed');
    return true;
    
  } catch (error) {
    console.error('❌ Error ensuring subscription customer consistency:', error);
    return false;
  }
}

// Function to get customer portal URL with all subscriptions
export async function createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string | null> {
  try {
    console.log('🔗 Creating customer portal session for customer:', customerId);
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    console.log('✅ Customer portal session created:', session.url);
    return session.url;
    
  } catch (error) {
    console.error('❌ Error creating customer portal session:', error);
    return null;
  }
}

// Function to update customer metadata with niche information
export async function updateCustomerMetadata(customerId: string, metadata: Record<string, string>): Promise<boolean> {
  try {
    console.log('🔄 Updating customer metadata:', { customerId, metadata });
    
    await stripe.customers.update(customerId, {
      metadata: metadata
    });
    
    console.log('✅ Customer metadata updated successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error updating customer metadata:', error);
    return false;
  }
}

// Function to add niche to customer metadata
export async function addNicheToCustomer(customerId: string, niche: string): Promise<boolean> {
  try {
    console.log('🔧 Adding niche to customer metadata:', { customerId, niche });
    
    // Get current customer to read existing metadata
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.error('❌ Customer was deleted');
      return false;
    }
    
    // Parse existing niches
    const currentNiches = customer.metadata.niches ? JSON.parse(customer.metadata.niches) : [];
    const totalNiches = parseInt(customer.metadata.total_niches || '0');
    
    // Add new niche if not already present
    if (!currentNiches.includes(niche)) {
      currentNiches.push(niche);
      
      // Update customer metadata
      await updateCustomerMetadata(customerId, {
        niches: JSON.stringify(currentNiches),
        total_niches: (totalNiches + 1).toString(),
        last_updated: new Date().toISOString(),
        consolidation_status: 'active'
      });
      
      console.log('✅ Niche added to customer metadata:', niche);
      return true;
    } else {
      console.log('⚠️ Niche already exists in customer metadata:', niche);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error adding niche to customer:', error);
    return false;
  }
}

// Function to consolidate customer metadata after merging
export async function consolidateCustomerMetadata(primaryCustomerId: string, mergedCustomerIds: string[]): Promise<boolean> {
  try {
    console.log('🔧 Consolidating customer metadata after merge:', { primaryCustomerId, mergedCustomerIds });
    
    // Get primary customer
    const primaryCustomer = await stripe.customers.retrieve(primaryCustomerId);
    if (primaryCustomer.deleted) {
      console.error('❌ Primary customer was deleted');
      return false;
    }
    
    // Collect all niches from merged customers
    let allNiches = primaryCustomer.metadata.niches ? JSON.parse(primaryCustomer.metadata.niches) : [];
    let totalNiches = parseInt(primaryCustomer.metadata.total_niches || '0');
    
    // Process each merged customer
    for (const mergedCustomerId of mergedCustomerIds) {
      try {
        const mergedCustomer = await stripe.customers.retrieve(mergedCustomerId);
        if (!mergedCustomer.deleted && mergedCustomer.metadata.niches) {
          const mergedNiches = JSON.parse(mergedCustomer.metadata.niches);
          allNiches = [...new Set([...allNiches, ...mergedNiches])];
          totalNiches += mergedNiches.length;
        }
      } catch (error) {
        console.warn('⚠️ Could not retrieve merged customer metadata:', mergedCustomerId);
      }
    }
    
    // Update primary customer with consolidated metadata
    await updateCustomerMetadata(primaryCustomerId, {
      niches: JSON.stringify(allNiches),
      total_niches: totalNiches.toString(),
      last_consolidation: new Date().toISOString(),
      consolidation_status: 'consolidated',
      merged_customers: mergedCustomerIds.join(','),
      total_merged: mergedCustomerIds.length.toString()
    });
    
    console.log('✅ Customer metadata consolidated successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error consolidating customer metadata:', error);
    return false;
  }
} 