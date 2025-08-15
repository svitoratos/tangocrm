# Customer Consolidation Fix for Multi-Niche Subscriptions

## 🎯 **Problem**
Users are getting separate Stripe customer IDs for each niche subscription instead of consolidating all subscriptions under one customer. This prevents them from managing all subscriptions in a single Stripe Customer Portal.

Example:
- Creator subscription: `cus_ABC123` 
- Podcaster subscription: `cus_XYZ456`
- User can't see both in the portal

## 🔧 **Root Cause**
The `ensureSingleCustomer` function in `/src/lib/stripe.ts` has a flaw:
1. It searches for existing customers by email using `stripe.customers.list({ email, limit: 1 })`
2. This only returns the FIRST customer, even if multiple exist
3. Checkout sessions sometimes create new customers despite our consolidation logic

## ✅ **Solution Implementation**

### Step 1: Fix Customer Search Logic

Update `/src/lib/stripe.ts` to find ALL customers by email and consolidate them:

```typescript
// Replace the existing findExistingCustomerByEmail function
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
  
  // Move all subscriptions to the primary customer
  for (const secondaryCustomerId of secondaryCustomerIds) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: secondaryCustomerId,
        status: 'all'
      });
      
      for (const subscription of subscriptions.data) {
        if (subscription.status === 'active') {
          await stripe.subscriptions.update(subscription.id, {
            customer: primaryCustomerId
          });
          console.log('✅ Moved subscription to primary customer:', subscription.id);
        }
      }
      
      // Delete the secondary customer
      await stripe.customers.del(secondaryCustomerId);
      console.log('✅ Deleted secondary customer:', secondaryCustomerId);
      
    } catch (error) {
      console.error('❌ Error consolidating customer:', secondaryCustomerId, error);
    }
  }
  
  return primaryCustomerId;
}

// Update the ensureSingleCustomer function
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
```

### Step 2: Force Customer ID in Checkout

Update `/src/app/api/stripe/checkout/route.ts` to be more explicit about customer usage:

```typescript
// In the checkout session creation, add this after getting customerId:
console.log('✅ ensureSingleCustomer returned customer ID:', customerId);

// Verify the customer exists in Stripe before using it
try {
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    throw new Error('Customer was deleted');
  }
  console.log('✅ Verified customer exists:', customerId);
} catch (error) {
  console.error('❌ Customer verification failed:', error);
  return NextResponse.json({ error: 'Invalid customer ID' }, { status: 500 });
}

// Create checkout session with explicit customer configuration
const sessionOptions: any = {
  customer: customerId, // Always use the consolidated customer ID
  customer_update: {
    name: 'auto',
    address: 'auto'
  },
  payment_method_types: ['card'],
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  mode: 'subscription',
  success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: cancelUrl,
  metadata: {
    clerk_user_id: userId,
    niche: niche,
    billing_cycle: billingCycle,
    consolidated_customer_id: customerId,
    force_customer_reuse: 'true'
  },
  // Prevent Stripe from creating a new customer
  customer_creation: 'never'
};
```

### Step 3: Add Customer Verification Script

Create a script to fix existing duplicate customers:

```typescript
// /scripts/fix-duplicate-customers.js
const { stripe } = require('../src/lib/stripe');
const { supabase } = require('../src/lib/supabase');

async function fixDuplicateCustomers() {
  console.log('🔧 Starting duplicate customer consolidation...');
  
  // Get all users with stripe customer IDs
  const { data: users } = await supabase
    .from('users')
    .select('id, email, stripe_customer_id')
    .not('stripe_customer_id', 'is', null);
  
  for (const user of users) {
    try {
      // Find all customers for this email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 100
      });
      
      if (customers.data.length > 1) {
        console.log(`🔍 Found ${customers.data.length} customers for ${user.email}`);
        
        const customerIds = customers.data.map(c => c.id);
        const primaryCustomerId = await consolidateCustomers(customerIds, user.email, user.id);
        
        console.log(`✅ Consolidated customers for ${user.email} into ${primaryCustomerId}`);
      }
    } catch (error) {
      console.error(`❌ Error processing user ${user.email}:`, error);
    }
  }
  
  console.log('✅ Duplicate customer consolidation complete');
}

fixDuplicateCustomers();
```

## 📋 **Implementation Steps for Cursor**

1. **Update `/src/lib/stripe.ts`**:
   - Replace `findExistingCustomerByEmail` with `findAllCustomersByEmail`
   - Add `consolidateCustomers` function
   - Update `ensureSingleCustomer` function

2. **Update `/src/app/api/stripe/checkout/route.ts`**:
   - Add customer verification before checkout
   - Set `customer_creation: 'never'` in session options
   - Add more detailed metadata

3. **Create consolidation script**:
   - Add `/scripts/fix-duplicate-customers.js`
   - Run it to fix existing duplicate customers

4. **Test the flow**:
   - Subscribe to first niche
   - Subscribe to second niche
   - Verify both subscriptions appear under same customer ID
   - Test customer portal access

## 🎯 **Expected Result**

After this fix:
- All subscriptions for a user will be under ONE customer ID
- Customer Portal will show ALL subscriptions
- Users can manage Creator, Podcaster, Coach, and Freelancer subscriptions from one place
- No more duplicate customers in Stripe dashboard

## 🔍 **Verification**

Check Stripe dashboard:
- User should have only ONE customer record
- That customer should have multiple active subscriptions
- Customer Portal should display all subscriptions for management