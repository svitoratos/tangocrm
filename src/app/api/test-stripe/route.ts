import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPriceId } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Testing Stripe configuration...');
    
    // Test 1: Check if Stripe is initialized
    console.log('🔧 Stripe initialized:', !!stripe);
    
    // Test 2: Check environment variables
    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
    console.log('🔧 Stripe key available:', hasStripeKey);
    
    // Test 3: Test price ID retrieval
    try {
      const priceId = getPriceId('creator', 'monthly', false);
      console.log('🔧 Price ID test:', priceId);
    } catch (error) {
      console.error('❌ Price ID test failed:', error);
    }
    
    // Test 4: Test Stripe API call
    try {
      const account = await stripe.accounts.retrieve();
      console.log('🔧 Stripe account test:', { id: account.id, charges_enabled: account.charges_enabled });
    } catch (error) {
      console.error('❌ Stripe API test failed:', error);
    }
    
    // Test 5: Test creating a simple checkout session
    try {
      const testSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_1Rt8u9IvVfTNGbwuoAxHpYSj',
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'https://www.gotangocrm.com/success',
        cancel_url: 'https://www.gotangocrm.com/cancel',
      });
      
      console.log('🔧 Test checkout session created:', testSession.id);
      
      // Clean up test session
      await stripe.checkout.sessions.expire(testSession.id);
      
    } catch (error) {
      console.error('❌ Test checkout session failed:', error);
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        stripeInitialized: !!stripe,
        hasStripeKey,
        environment: {
          hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
          appUrl: process.env.NEXT_PUBLIC_APP_URL
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Stripe test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
