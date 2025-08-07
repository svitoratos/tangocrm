import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  console.log('🔧 Processing webhook:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('✅ Checkout completed for session:', session.id);
        
        const userId = session.metadata?.clerk_user_id;
        const customerEmail = session.customer_details?.email;
        const niche = session.metadata?.niche;
        
        if (!userId || !customerEmail) {
          console.error('❌ Missing user ID or email in session metadata');
          return NextResponse.json({ error: 'Missing user data' }, { status: 400 });
        }

        // Update or create user record
        const { data: user, error } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: customerEmail,
            onboarding_completed: true,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            subscription_status: 'active',
            subscription_tier: 'core',
            primary_niche: niche || 'creator',
            niches: niche ? [niche] : ['creator'],
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating user:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        console.log('✅ User updated successfully:', user.id);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('✅ Payment succeeded for invoice:', invoice.id);
        
        // Handle subscription payment success
        if (invoice.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            
            if (customer && 'email' in customer && customer.email) {
              // Update user subscription status
              const { error: updateError } = await supabase
                .from('users')
                .update({
                  subscription_status: subscription.status,
                  updated_at: new Date().toISOString()
                })
                .eq('stripe_customer_id', customer.id);

              if (updateError) {
                console.error('❌ Error updating subscription status:', updateError);
              } else {
                console.log('✅ Subscription status updated for customer:', customer.id);
              }
            }
          } catch (stripeError) {
            console.error('❌ Error processing subscription payment:', stripeError);
          }
        }
        break;

      default:
        console.log('🔧 Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}