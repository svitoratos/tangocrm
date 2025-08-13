import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, findExistingCustomerByEmail } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin-config';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, userEmail } = await request.json();

    if (action === 'scan') {
      // Scan for duplicate customers
      const duplicates = await scanForDuplicateCustomers();
      return NextResponse.json({ duplicates });
    }

    if (action === 'fix' && userEmail) {
      // Fix duplicate customers for a specific user
      const result = await fixDuplicateCustomersForUser(userEmail);
      return NextResponse.json({ result });
    }

    if (action === 'fix-all') {
      // Fix all duplicate customers
      const results = await fixAllDuplicateCustomers();
      return NextResponse.json({ results });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Admin duplicate customer fix error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function scanForDuplicateCustomers() {
  const duplicates = [];
  
  try {
    // Get all users with Stripe customer IDs
    const { data: users } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .not('stripe_customer_id', 'is', null);

    for (const user of users || []) {
      if (!user.email || !user.stripe_customer_id) continue;

      // Search for customers by email in Stripe
      const stripeCustomers = await stripe.customers.list({
        email: user.email,
        limit: 100
      });

      if (stripeCustomers.data.length > 1) {
        // Found duplicates
        const customerIds = stripeCustomers.data.map(c => c.id);
        const primaryCustomerId = customerIds[0]; // Use the first (oldest) customer
        
        duplicates.push({
          user_id: user.id,
          email: user.email,
          stored_customer_id: user.stripe_customer_id,
          stripe_customer_ids: customerIds,
          primary_customer_id: primaryCustomerId,
          needs_fix: !customerIds.includes(user.stripe_customer_id) || customerIds.length > 1
        });
      }
    }

    return duplicates;

  } catch (error) {
    console.error('❌ Error scanning for duplicates:', error);
    throw error;
  }
}

async function fixDuplicateCustomersForUser(userEmail: string) {
  try {
    // Find user by email
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    // Search for customers by email in Stripe
    const stripeCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 100
    });

    if (stripeCustomers.data.length <= 1) {
      return { message: 'No duplicates found for this user', status: 'skipped' };
    }

    const customerIds = stripeCustomers.data.map(c => c.id);
    const primaryCustomerId = customerIds[0]; // Use the first (oldest) customer
    const duplicateCustomerIds = customerIds.slice(1);

    console.log(`🔧 Fixing duplicates for ${userEmail}:`, {
      primary: primaryCustomerId,
      duplicates: duplicateCustomerIds
    });

    // With simplified approach, we don't need complex merging
    // Just ensure the user has a valid customer ID
    console.log(`🔍 Checking customer for user: ${user.email}`);
    
    const existingCustomerId = await findExistingCustomerByEmail(user.email);
    
    if (existingCustomerId && existingCustomerId !== user.stripe_customer_id) {
      console.log(`🔄 Updating user ${user.email} to use existing customer: ${existingCustomerId}`);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          stripe_customer_id: existingCustomerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error(`❌ Error updating user ${user.email}:`, updateError);
        return { message: 'Failed to update user', status: 'error', error: updateError };
      } else {
        console.log(`✅ Updated user ${user.email} customer ID`);
        return { message: 'Successfully updated user customer ID', status: 'updated' };
      }
    } else {
      console.log(`✅ User ${user.email} already has correct customer ID`);
      return { message: 'User already has correct customer ID', status: 'skipped' };
    }

  } catch (error) {
    console.error('❌ Error fixing duplicates for user:', error);
    throw error;
  }
}

async function fixAllDuplicateCustomers() {
  try {
    const duplicates = await scanForDuplicateCustomers();
    const results = { updated: 0, skipped: 0, errors: 0 };

    for (const duplicate of duplicates) {
      if (duplicate.needs_fix) {
        try {
          const result = await fixDuplicateCustomersForUser(duplicate.email);
          results.updated++;
        } catch (error) {
          results.errors++;
        }
      } else {
        results.skipped++;
      }
    }

    return results;

  } catch (error) {
    console.error('❌ Error fixing all duplicates:', error);
    throw error;
  }
}
