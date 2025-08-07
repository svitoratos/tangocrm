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
        
        const customerEmail = session.customer_details?.email;
        const niche = session.metadata?.niche;
        
        if (!customerEmail) {
          console.error('❌ Missing email in session data');
          return NextResponse.json({ error: 'Missing email data' }, { status: 400 });
        }

        // Find user by email (since they're logged in with Clerk)
        const { data: existingUser, error: findError } = await supabase
          .from('users')
          .select('*')
          .eq('email', customerEmail)
          .single();

        if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('❌ Error finding user by email:', findError);
          return NextResponse.json({ error: 'Database lookup failed' }, { status: 500 });
        }

        if (!existingUser) {
          console.log('⚠️ No existing user found for payment customer:', customerEmail);
          // Could create a new user here if needed, but for now just log
          return NextResponse.json({ received: true });
        }

        // Update existing user with subscription details
        const { data: user, error: updateError } = await supabase
          .from('users')
          .update({
            onboarding_completed: true,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            subscription_status: 'active',
            subscription_tier: 'core',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Error updating user subscription:', updateError);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        console.log('✅ User subscription updated successfully:', user.id);
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