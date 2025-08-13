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

// Remove the complex consolidation functions and keep only the simple ones
export async function findExistingCustomerByEmail(email: string): Promise<string | null> {
  try {
    console.log('🔍 Searching for existing customer by email:', email);
    
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    if (customers.data.length > 0) {
      const customer = customers.data[0];
      console.log('✅ Found existing customer:', customer.id);
      return customer.id;
    }
    
    console.log('🔍 No existing customer found for email:', email);
    return null;
    
  } catch (error) {
    console.error('❌ Error searching for existing customer:', error);
    return null;
  }
}

export async function ensureSingleCustomer(email: string, userId: string): Promise<string | null> {
  try {
    console.log('🔍 Ensuring single customer for:', { email, userId });
    
    // First, check if we already have a customer ID for this user in our database
    const { data: existingUser } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();
    
    if (existingUser?.stripe_customer_id) {
      console.log('✅ Found existing customer ID in database:', existingUser.stripe_customer_id);
      return existingUser.stripe_customer_id;
    }
    
    // If no customer ID in database, look for existing customer by email
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
        console.log('✅ Successfully updated user with existing customer ID');
      }
      
      return existingCustomerId;
    }
    
    // No existing customer found, create a new one
    console.log('🔧 Creating new customer for:', email);
    
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
      console.log('✅ Successfully updated user with new customer ID');
    }
    
    return newCustomer.id;
    
  } catch (error) {
    console.error('❌ Error ensuring single customer:', error);
    return null;
  }
}

// Function to get customer portal URL with all subscriptions
export async function createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string | null> {
  try {
    console.log('🔗 Creating customer portal session for customer:', customerId);
    
    // Simple portal session creation - Stripe handles multiple subscriptions automatically
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    console.log('✅ Customer portal session created successfully:', session.url);
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
export async function addNicheToCustomer(customerId: string, niche: string, userId?: string): Promise<boolean> {
  try {
    console.log('🔧 Adding niche to customer metadata:', { customerId, niche, userId });
    
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
      
      // CRITICAL FIX: Also update the user's niches in the database if userId is provided
      if (userId) {
        try {
          const { error: updateError } = await supabase
            .from('users')
            .update({
              niches: currentNiches,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          
          if (updateError) {
            console.error('❌ Error updating user niches in database:', updateError);
            console.warn('⚠️ Stripe metadata updated but database update failed');
          } else {
            console.log('✅ User niches updated in database:', currentNiches);
          }
        } catch (dbError) {
          console.error('❌ Database error updating user niches:', dbError);
          console.warn('⚠️ Stripe metadata updated but database update failed');
        }
      }
      
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