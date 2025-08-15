import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, getPriceId } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { niche, billingCycle = 'monthly', isNicheUpgrade = false } = body;

    if (!niche) {
      return NextResponse.json({ error: 'Niche is required' }, { status: 400 });
    }

    console.log('🔧 Creating fallback payment link with customer consolidation:', { 
      userId, 
      niche, 
      billingCycle, 
      isNicheUpgrade 
    });

    // Get the price ID using the same utility function as the main checkout
    let priceId: string;
    try {
      priceId = getPriceId(niche, billingCycle as 'monthly' | 'yearly', isNicheUpgrade);
    } catch (error) {
      console.error('❌ Error getting price ID for fallback:', error);
      return NextResponse.json({ 
        error: 'Price configuration error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }

    // Get user email to store in metadata for webhook consolidation
    const { data: userProfile } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!userProfile?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Get the app URL with fallback
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.gotangocrm.com';
    
    console.log('🔧 Using app URL for fallback payment link:', appUrl);

    // Create payment link with customer consolidation
    // This now uses the same customer consolidation as the main checkout
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true, // Enable discount code field
      after_completion: { 
        type: 'redirect', 
        redirect: { 
          url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}` 
        } 
      },
      metadata: {
        niche,
        billing_cycle: billingCycle,
        is_niche_upgrade: isNicheUpgrade.toString(),
        user_id: userId,
        user_email: userProfile.email,
        source: 'fallback_payment_link',
        requires_consolidation: 'true',
        created_at: new Date().toISOString()
      }
    });

    console.log('✅ Fallback payment link created successfully with customer consolidation');
    
    return NextResponse.json({ 
      success: true,
      url: paymentLink.url,
      message: 'Payment link created with customer consolidation'
    });

  } catch (error) {
    console.error('❌ Error creating fallback payment link:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // Check if it's a Stripe error
    if (error && typeof error === 'object' && 'type' in error) {
      console.error('❌ Stripe error details:', {
        type: (error as any).type,
        code: (error as any).code,
        message: (error as any).message,
        decline_code: (error as any).decline_code,
        param: (error as any).param
      });
    }
    
    // Check environment variables
    console.error('❌ Environment check:', {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      fallbackUrl: 'https://www.gotangocrm.com',
      finalUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://www.gotangocrm.com'
    });
    
    return NextResponse.json({ 
      error: 'Failed to create fallback payment link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
