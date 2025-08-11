import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { cleanupDuplicateCustomers } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!userProfile?.email || !['stevenvitoratos@gmail.com'].includes(userProfile.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('🧹 Starting duplicate customer cleanup for all users...');

    // Get all users with Stripe customer IDs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id')
      .not('stripe_customer_id', 'is', null);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ success: true, message: 'No users with Stripe customer IDs found' });
    }

    console.log(`🔍 Processing ${users.length} users for duplicate cleanup...`);

    let totalCleaned = 0;
    let totalErrors = 0;

    for (const user of users) {
      if (!user.email || !user.stripe_customer_id) continue;

      try {
        console.log(`🧹 Processing user: ${user.email}`);
        const success = await cleanupDuplicateCustomers(user.email, user.stripe_customer_id);
        
        if (success) {
          totalCleaned++;
        } else {
          totalErrors++;
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.email}:`, error);
        totalErrors++;
      }
    }

    console.log(`✅ Duplicate customer cleanup completed. Cleaned: ${totalCleaned}, Errors: ${totalErrors}`);

    return NextResponse.json({
      success: true,
      message: `Duplicate customer cleanup completed. Cleaned: ${totalCleaned}, Errors: ${totalErrors}`,
      totalUsers: users.length,
      totalCleaned,
      totalErrors
    });

  } catch (error) {
    console.error('❌ Error in duplicate customer cleanup:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
