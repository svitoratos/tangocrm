import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';

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

    console.warn('⚠️ Creating fallback payment link (bypasses customer consolidation):', { 
      userId, 
      niche, 
      billingCycle, 
      isNicheUpgrade 
    });

    // Get the price ID for the selected niche and billing cycle
    const priceId = getPriceId(niche, billingCycle);
    if (!priceId) {
      return NextResponse.json({ 
        error: 'Price configuration not found for this niche and billing cycle' 
      }, { status: 400 });
    }

    // Create a fallback payment link as a last resort
    // This bypasses customer consolidation and should only be used in emergencies
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      after_completion: { 
        type: 'redirect', 
        redirect: { 
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}` 
        } 
      },
      metadata: {
        niche,
        billing_cycle: billingCycle,
        is_niche_upgrade: isNicheUpgrade.toString(),
        user_id: userId,
        source: 'fallback_payment_link',
        bypassed_consolidation: 'true',
        created_at: new Date().toISOString()
      }
    });

    console.warn('⚠️ Fallback payment link created successfully (customer consolidation bypassed)');
    
    return NextResponse.json({ 
      success: true,
      url: paymentLink.url,
      warning: 'This payment bypasses customer consolidation safeguards'
    });

  } catch (error) {
    console.error('❌ Error creating fallback payment link:', error);
    return NextResponse.json({ 
      error: 'Failed to create fallback payment link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Gets the Stripe price ID for a niche and billing cycle
 * This matches the logic in our existing getPriceId function
 */
function getPriceId(niche: string, billingCycle: 'monthly' | 'yearly'): string | null {
  const prices: Record<string, { monthly: string; yearly: string }> = {
    coach: {
      monthly: process.env.STRIPE_COACH_MONTHLY_PRICE_ID || '',
      yearly: process.env.STRIPE_COACH_YEARLY_PRICE_ID || ''
    },
    creator: {
      monthly: process.env.STRIPE_CREATOR_MONTHLY_PRICE_ID || '',
      yearly: process.env.STRIPE_CREATOR_YEARLY_PRICE_ID || ''
    },
    podcaster: {
      monthly: process.env.STRIPE_PODCASTER_MONTHLY_PRICE_ID || '',
      yearly: process.env.STRIPE_PODCASTER_YEARLY_PRICE_ID || ''
    },
    freelancer: {
      monthly: process.env.STRIPE_FREELANCER_MONTHLY_PRICE_ID || '',
      yearly: process.env.STRIPE_FREELANCER_YEARLY_PRICE_ID || ''
    }
  };

  const nichePrices = prices[niche];
  if (!nichePrices) {
    console.error(`No price configuration found for niche: ${niche}`);
    return null;
  }

  const priceId = billingCycle === 'yearly' ? nichePrices.yearly : nichePrices.monthly;
  if (!priceId) {
    console.error(`No ${billingCycle} price found for niche: ${niche}`);
    return null;
  }

  return priceId;
}
