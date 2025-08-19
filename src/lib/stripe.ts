import Stripe from 'stripe';
import { supabase } from './supabase';

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Price IDs - Updated with single Tango Core price ID for all niches
export const STRIPE_PRICES = {
  creator: {
    monthly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
    yearly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
  },
  coach: {
    monthly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
    yearly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
  },
  podcaster: {
    monthly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
    yearly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
  },
  freelancer: {
    monthly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
    yearly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
  },
};

// Price IDs for niche upgrades (now using same Tango Core pricing)
export const STRIPE_NICHE_UPGRADE_PRICES = {
  creator: {
    monthly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
    yearly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
  },
  coach: {
    monthly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
    yearly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
  },
  podcaster: {
    monthly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
    yearly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
  },
  freelancer: {
    monthly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
    yearly: 'price_1RxsWxIvVfTNGbwulG7qCbnS',
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

// Improved customer consolidation functions
export async function findAllCustomersByEmail(email: string): Promise<string[]> {
  try {
    console.log('🔍 Searching for ALL customers by email:', email);
    
    const customers = await stripe.customers.list({
      email: email,
      limit: 100 // Get all customers, not just the first one
    });
    
    const customerIds = customers.data.map(customer => customer.id);
    console.log('✅ Found customers:', customerIds);
    
    return customerIds;
  } catch (error) {
    console.error('❌ Error searching for customers:', error);
    return [];
  }
}

export async function consolidateCustomers(customerIds: string[], email: string, userId: string): Promise<string> {
  if (customerIds.length === 0) {
    console.log('🔧 No existing customers found, creating new one');
    const newCustomer = await stripe.customers.create({
      email: email,
      metadata: {
        clerk_user_id: userId,
        created_at: new Date().toISOString(),
        source: 'consolidation_flow'
      }
    });
    return newCustomer.id;
  }
  
  if (customerIds.length === 1) {
    console.log('✅ Single customer found, using:', customerIds[0]);
    return customerIds[0];
  }
  
  // Multiple customers found - consolidate them
  console.log('🔄 Multiple customers found, consolidating:', customerIds);
  
  const primaryCustomerId = customerIds[0];
  const secondaryCustomerIds = customerIds.slice(1);
  
  // Note: Stripe doesn't allow moving active subscriptions between customers
  // Instead, we'll use the primary customer for all future subscriptions
  // and mark secondary customers for tracking purposes
  for (const secondaryCustomerId of secondaryCustomerIds) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: secondaryCustomerId,
        status: 'all'
      });
      
      console.log(`📋 Customer ${secondaryCustomerId} has ${subscriptions.data.length} subscriptions`);
      
      // Only delete customers with no active subscriptions
      const activeSubscriptions = subscriptions.data.filter(sub => sub.status === 'active');
      if (activeSubscriptions.length === 0) {
        await stripe.customers.del(secondaryCustomerId);
        console.log('✅ Deleted empty secondary customer:', secondaryCustomerId);
      } else {
        console.log(`⚠️ Keeping customer ${secondaryCustomerId} with ${activeSubscriptions.length} active subscriptions`);
        
        // Update metadata to mark as secondary customer
        await stripe.customers.update(secondaryCustomerId, {
          metadata: {
            consolidation_status: 'secondary_customer',
            primary_customer_id: primaryCustomerId,
            marked_for_consolidation: new Date().toISOString()
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing customer:', secondaryCustomerId, error);
    }
  }
  
  return primaryCustomerId;
}

// Legacy function for backward compatibility
export async function findExistingCustomerByEmail(email: string): Promise<string | null> {
  const customers = await findAllCustomersByEmail(email);
  return customers.length > 0 ? customers[0] : null;
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
    
    // Find ALL customers by email
    const allCustomerIds = await findAllCustomersByEmail(email);
    
    // If user has a customer ID in database, make sure it's included
    if (existingUser?.stripe_customer_id) {
      if (!allCustomerIds.includes(existingUser.stripe_customer_id)) {
        allCustomerIds.unshift(existingUser.stripe_customer_id);
      }
    }
    
    // Consolidate all customers into one
    const finalCustomerId = await consolidateCustomers(allCustomerIds, email, userId);
    
    // Update our database with the final customer ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        stripe_customer_id: finalCustomerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('❌ Error updating user with customer ID:', updateError);
    } else {
      console.log('✅ Successfully updated user with consolidated customer ID');
    }
    
    return finalCustomerId;
    
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