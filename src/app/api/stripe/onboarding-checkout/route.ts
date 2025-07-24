import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'

// Check if Stripe secret key is configured
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not configured')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    console.log('Onboarding checkout API called');
    const { userId } = await auth()
    console.log('User ID from auth:', userId);
    
    if (!userId) {
      console.log('No user ID found, returning unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe is not configured')
      return NextResponse.json(
        { error: 'Payment processing is not configured' },
        { status: 500 }
      )
    }

    const { priceId, niche, niches, billingCycle = 'monthly', successUrl, cancelUrl } = await request.json()

    // Validate inputs
    if (!priceId || !niche || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Parse niches array
    const nichesArray = niches ? (Array.isArray(niches) ? niches : JSON.parse(niches)) : [niche]
    const numberOfNiches = nichesArray.length

    // Calculate pricing based on number of niches and billing cycle
    // $39.99 for first niche + $9.99 for each additional niche
    const basePrice = 3999 // $39.99 in cents
    const additionalNichePrice = 999 // $9.99 in cents
    let totalAmount = basePrice + (numberOfNiches - 1) * additionalNichePrice
    
    // Apply yearly billing with 20% discount
    if (billingCycle === 'yearly') {
      totalAmount = Math.round(totalAmount * 12 * 0.8) // 20% off yearly
    }

    // Create product name and description
    const productName = `Tango Core Plan - ${numberOfNiches} Niche${numberOfNiches > 1 ? 's' : ''}`
    const productDescription = `CRM for ${nichesArray.join(', ')} creators - Core features`

    // Create checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: totalAmount,
            recurring: {
              interval: billingCycle === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&niche=${niche}&niches=${encodeURIComponent(JSON.stringify(nichesArray))}`,
      cancel_url: cancelUrl,
      metadata: {
        clerk_user_id: userId,
        niche: niche,
        niches: JSON.stringify(nichesArray),
        number_of_niches: numberOfNiches.toString(),
        plan: priceId,
        billing_cycle: billingCycle,
        total_amount: totalAmount.toString(),
      },
      subscription_data: {
        metadata: {
          clerk_user_id: userId,
          niche: niche,
          niches: JSON.stringify(nichesArray),
          number_of_niches: numberOfNiches.toString(),
          plan: priceId,
          billing_cycle: billingCycle,
          total_amount: totalAmount.toString(),
        },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Onboarding checkout error:', error)
    
    // Provide more specific error messages
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Payment error: ${error.message}` },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
