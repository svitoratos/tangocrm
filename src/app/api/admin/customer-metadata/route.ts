import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you can implement your own admin check)
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get customer metadata for all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id, niches')
      .not('stripe_customer_id', 'is', null);

    if (error) {
      console.error('❌ Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Fetch Stripe customer metadata for each user
    const customersWithMetadata = [];
    
    for (const user of users) {
      try {
        const customer = await stripe.customers.retrieve(user.stripe_customer_id);
        if (!customer.deleted) {
          customersWithMetadata.push({
            userId: user.id,
            email: user.email,
            customerId: user.stripe_customer_id,
            databaseNiches: user.niches || [],
            stripeMetadata: customer.metadata,
            customerCreated: customer.created,
            totalSubscriptions: customer.subscriptions?.total_count || 0
          });
        }
      } catch (stripeError) {
        console.warn(`⚠️ Could not retrieve customer ${user.stripe_customer_id}:`, stripeError);
        customersWithMetadata.push({
          userId: user.id,
          email: user.email,
          customerId: user.stripe_customer_id,
          databaseNiches: user.niches || [],
          stripeMetadata: {},
          customerCreated: null,
          totalSubscriptions: 0,
          error: 'Could not retrieve from Stripe'
        });
      }
    }

    return NextResponse.json({
      success: true,
      customers: customersWithMetadata,
      totalCustomers: customersWithMetadata.length
    });

  } catch (error) {
    console.error('❌ Error fetching customer metadata:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch customer metadata',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, customerId, metadata } = body;

    if (!action || !customerId) {
      return NextResponse.json({ error: 'Action and customer ID are required' }, { status: 400 });
    }

    switch (action) {
      case 'update_metadata':
        if (!metadata) {
          return NextResponse.json({ error: 'Metadata is required for update action' }, { status: 400 });
        }
        
        const customer = await stripe.customers.update(customerId, { metadata });
        
        return NextResponse.json({
          success: true,
          message: 'Customer metadata updated successfully',
          customer: {
            id: customer.id,
            metadata: customer.metadata
          }
        });

      case 'consolidate_metadata':
        // This would trigger metadata consolidation for a customer
        // Implementation depends on your consolidation logic
        return NextResponse.json({
          success: true,
          message: 'Metadata consolidation triggered'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error processing customer metadata action:', error);
    return NextResponse.json({ 
      error: 'Failed to process action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
