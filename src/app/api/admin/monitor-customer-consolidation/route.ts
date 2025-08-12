import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, ensureSubscriptionCustomerConsistency, findExistingCustomerByEmail } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

// Force Vercel to build from latest commit - Updated: 2024-01-11 13:10 UTC
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
      // Scan for potential customer consolidation issues
      const issues = await scanForCustomerConsolidationIssues();
      return NextResponse.json({ issues });
    }

    if (action === 'fix' && userEmail) {
      // Fix customer consolidation for a specific user
      const result = await fixCustomerConsolidationForUser(userEmail);
      return NextResponse.json({ result });
    }

    if (action === 'fix-all') {
      // Fix all customer consolidation issues
      const results = await fixAllCustomerConsolidationIssues();
      return NextResponse.json({ results });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Admin customer consolidation monitor error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function scanForCustomerConsolidationIssues() {
  const issues = [];
  
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
        // Found potential consolidation issue
        const customerIds = stripeCustomers.data.map(c => c.id);
        const hasMismatch = !customerIds.includes(user.stripe_customer_id);
        
        issues.push({
          user_id: user.id,
          email: user.email,
          stored_customer_id: user.stripe_customer_id,
          stripe_customer_ids: customerIds,
          customer_count: customerIds.length,
          has_mismatch: hasMismatch,
          needs_fix: hasMismatch || customerIds.length > 1
        });
      }
    }

    return issues;

  } catch (error) {
    console.error('❌ Error scanning for consolidation issues:', error);
    throw error;
  }
}

async function fixCustomerConsolidationForUser(userEmail: string) {
  try {
    console.log('🔧 Fixing customer consolidation for:', userEmail);
    
    // Get user ID from email first
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (!user) {
      console.error('❌ User not found for email:', userEmail);
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    // Run the consolidation function with proper user ID
    const result = await ensureSubscriptionCustomerConsistency(user.id, userEmail);
    
    return {
      success: result,
      message: result ? 'Customer consolidation completed successfully' : 'Customer consolidation failed'
    };

  } catch (error) {
    console.error('❌ Error fixing customer consolidation for user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function fixAllCustomerConsolidationIssues() {
  const results = [];
  
  try {
    // Get all users with Stripe customer IDs
    const { data: users } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .not('stripe_customer_id', 'is', null);

    for (const user of users || []) {
      if (!user.email || !user.stripe_customer_id) continue;

      try {
        console.log(`🔧 Checking customer consolidation for: ${user.email}`);
        
        // Run consolidation check for this user
        const result = await ensureSubscriptionCustomerConsistency(user.id, user.email);
        
        results.push({
          user_id: user.id,
          email: user.email,
          success: result,
          message: result ? 'Consolidation check completed' : 'Consolidation check failed'
        });
        
      } catch (error) {
        results.push({
          user_id: user.id,
          email: user.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;

  } catch (error) {
    console.error('❌ Error fixing all customer consolidation issues:', error);
    throw error;
  }
}
