import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createCustomerPortalSession, ensureSubscriptionCustomerConsistency } from '@/lib/stripe';
import { userOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { returnUrl } = body;

    if (!returnUrl) {
      return NextResponse.json({ error: 'Return URL is required' }, { status: 400 });
    }

    console.log('🔗 Creating customer portal session for user:', userId);

    // Get user profile to get email and customer ID
    const userProfile = await userOperations.getProfile(userId);
    if (!userProfile) {
      console.error('❌ User profile not found');
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (!userProfile.stripe_customer_id) {
      console.error('❌ User has no Stripe customer ID');
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Ensure all subscriptions are consolidated under the same customer ID
    console.log('🔍 Ensuring subscription customer consistency...');
    const consistencyResult = await ensureSubscriptionCustomerConsistency(userId, userProfile.email);
    
    if (!consistencyResult) {
      console.warn('⚠️ Customer consistency check failed, but continuing with portal creation');
    }

    // Create customer portal session
    const portalUrl = await createCustomerPortalSession(userProfile.stripe_customer_id, returnUrl);
    
    if (!portalUrl) {
      console.error('❌ Failed to create customer portal session');
      return NextResponse.json({ error: 'Failed to create customer portal session' }, { status: 500 });
    }

    console.log('✅ Customer portal session created successfully');

    return NextResponse.json({ 
      success: true,
      url: portalUrl 
    });

  } catch (error) {
    console.error('❌ Error creating customer portal session:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('No such customer')) {
        return NextResponse.json({ 
          error: 'Customer not found in Stripe' 
        }, { status: 404 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create customer portal session', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
