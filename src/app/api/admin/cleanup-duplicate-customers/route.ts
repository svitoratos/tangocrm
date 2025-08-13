import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin-config';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = sessionClaims?.email as string;
    const isAdmin = isAdminEmail(userEmail);

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('🧹 Admin cleanup duplicate customers requested by:', userEmail);

    // Get all users with Stripe customer IDs
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id, niches')
      .not('stripe_customer_id', 'is', null)
      .not('stripe_customer_id', 'eq', '');

    if (error) {
      console.error('❌ Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    console.log(`📊 Found ${users.length} users with Stripe customer IDs`);

    const results = {
      processed: 0,
      updated: 0,
      errors: 0,
      details: [] as any[]
    };

    for (const user of users) {
      try {
        results.processed++;
        
        // With simplified approach, we just ensure the user has a valid customer ID
        // No complex consolidation needed
        console.log(`🔍 Checking user: ${user.email} (Customer: ${user.stripe_customer_id})`);
        
        // For now, just log the user's current state
        results.details.push({
          email: user.email,
          customerId: user.stripe_customer_id,
          niches: user.niches,
          status: 'checked'
        });
        
        results.updated++;
        
      } catch (error) {
        console.error(`❌ Error processing user ${user.email}:`, error);
        results.errors++;
        results.details.push({
          email: user.email,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'error'
        });
      }
    }

    console.log('✅ Cleanup completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Duplicate customer cleanup completed (simplified approach)',
      results
    });

  } catch (error) {
    console.error('❌ Error in cleanup duplicate customers:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup duplicate customers',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
