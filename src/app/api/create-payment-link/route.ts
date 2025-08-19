import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { billingCycle = 'monthly' } = await request.json();
    
    console.log('🔧 Creating payment link for:', billingCycle);
    
    // Get the correct price ID based on billing cycle
    const priceId = billingCycle === 'yearly' 
      ? 'price_1RxsWxIvVfTNGbwulG7qCbnS'  // Yearly
      : 'price_1RxsWxIvVfTNGbwulG7qCbnS'; // Monthly
    
    // Create payment link
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
          url: `${request.headers.get('origin') || 'https://www.gotangocrm.com'}/payment-success` 
        } 
      },
    });
    
    console.log('✅ Payment link created:', paymentLink.url);
    
    return NextResponse.json({
      success: true,
      url: paymentLink.url
    });
    
  } catch (error) {
    console.error('❌ Error creating payment link:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment link'
    }, { status: 500 });
  }
}
