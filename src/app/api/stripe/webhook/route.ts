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

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        console.log('✅ Payment succeeded for invoice:', invoice.id)
        
        // Handle payment link payments (no session metadata)
        const subscriptionId = (invoice as any).subscription
        if (subscriptionId) {
          try {
            // Get subscription details
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const customerResponse = await stripe.customers.retrieve(subscription.customer as string)
            
            // Check if customer is not deleted and has email
            if (customerResponse && 'email' in customerResponse && customerResponse.email) {
              console.log('🔧 Processing payment link payment for customer:', customerResponse.email)
              
              // For payment links, we need to find the user by email
              const { data: existingUser, error: findError } = await supabase
                .from('users')
                .select('*')
                .eq('email', customerResponse.email)
                .single()

              if (existingUser) {
                // Update existing user
                const { data: user, error } = await supabase
                  .from('users')
                  .update({
                    onboarding_completed: true,
                    stripe_customer_id: customerResponse.id,
                    stripe_subscription_id: subscription.id,
                    subscription_status: subscription.status,
                    subscription_tier: 'core',
                    primary_niche: 'creator', // Default for payment link
                    niches: ['creator'],
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', existingUser.id)
                  .select()
                  .single()

                if (error) {
                  console.error('❌ Error updating user:', error)
                } else {
                  console.log('✅ User updated successfully from payment link:', user.id)
                }
              } else {
                // Create new user (this shouldn't happen with payment links, but just in case)
                console.log('⚠️ No existing user found for payment link customer:', customerResponse.email)
              }
            }
          } catch (stripeError) {
            console.error('❌ Error processing payment link payment:', stripeError)
          }
        }
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