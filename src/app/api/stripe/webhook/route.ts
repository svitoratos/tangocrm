import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  console.log('🔧 Processing webhook:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('✅ Checkout completed for session:', session.id)
        
        const userId = session.metadata?.clerk_user_id
        const customerEmail = session.customer_details?.email || session.metadata?.email
        
        if (!userId || !customerEmail) {
          console.error('❌ Missing user ID or email in session metadata')
          return NextResponse.json({ error: 'Missing user data' }, { status: 400 })
        }

        // Update or create user record
        const { data: user, error } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: customerEmail,
            onboarding_completed: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string || null,
            subscription_status: 'active',
            subscription_tier: 'core',
            primary_niche: session.metadata?.niche || 'creator',
            niches: session.metadata?.niches ? JSON.parse(session.metadata.niches) : ['creator'],
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
          .select()
          .single()

        if (error) {
          console.error('❌ Error updating user:', error)
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }

        console.log('✅ User updated successfully:', user.id)
        break

      default:
        console.log('🔧 Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
} 