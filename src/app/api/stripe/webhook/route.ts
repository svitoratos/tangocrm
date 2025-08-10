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
        const isNicheUpgrade = session.metadata?.is_niche_upgrade === 'true';
        
        if (!customerEmail) {
          console.error('❌ Missing email in session data');
          return NextResponse.json({ error: 'Missing email data' }, { status: 400 });
        }

        // Find user by email
        const { data: existingUser, error: findError } = await supabase
          .from('users')
          .select('*')
          .eq('email', customerEmail)
          .single();

        if (findError && findError.code !== 'PGRST116') {
          console.error('❌ Error finding user by email:', findError);
          return NextResponse.json({ error: 'Database lookup failed' }, { status: 500 });
        }

        if (!existingUser) {
          console.log('⚠️ No existing user found for payment customer:', customerEmail);
          return NextResponse.json({ received: true });
        }

        if (isNicheUpgrade && existingUser.stripe_subscription_id) {
          // This is a niche upgrade - add the new niche to existing subscription
          console.log('🔧 Adding niche to existing subscription:', niche);
          
          try {
            // Get the existing subscription
            const existingSubscription = await stripe.subscriptions.retrieve(existingUser.stripe_subscription_id);
            
            // Get the price ID for the new niche
            const priceId = getPriceId(niche, 'monthly'); // Default to monthly for niche upgrades
            
            // Add the new niche as a subscription item
            const updatedSubscription = await stripe.subscriptions.update(existingUser.stripe_subscription_id, {
              items: [
                ...existingSubscription.items.data.map(item => ({
                  id: item.id,
                  price: item.price.id,
                  quantity: item.quantity
                })),
                {
                  price: priceId,
                  quantity: 1
                }
              ]
            });
            
            console.log('✅ Added niche to existing subscription:', niche);
            
            // Update user's niches array in database
            const currentNiches = existingUser.niches || [existingUser.primary_niche || 'creator'];
            const updatedNiches = [...new Set([...currentNiches, niche])];
            
            const { error: updateError } = await supabase
              .from('users')
              .update({
                niches: updatedNiches,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingUser.id);
              
            if (updateError) {
              console.error('❌ Error updating user niches:', updateError);
            }
            
          } catch (stripeError) {
            console.error('❌ Error adding niche to subscription:', stripeError);
          }
          
        } else {
          // This is a new subscription (Tango Core)
          console.log('🔧 Creating new Tango Core subscription');
          
          const { data: user, error: updateError } = await supabase
            .from('users')
            .update({
              onboarding_completed: true,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              subscription_status: 'active',
              subscription_tier: 'core',
              primary_niche: niche || 'creator',
              niches: [niche || 'creator'],
              updated_at: new Date().toISOString()
            })
            .eq('id', existingUser.id)
            .select()
            .single();

          if (updateError) {
            console.error('❌ Error updating user subscription:', updateError);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
          }

          console.log('✅ User subscription created successfully:', user.id);
        }
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('✅ Subscription updated:', subscription.id);
        
        // Update user's subscription status and niches
        try {
          const { error: updateError } = await supabase
            .from('users')
            .update({
              subscription_status: subscription.status,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);

          if (updateError) {
            console.error('❌ Error updating subscription status:', updateError);
          } else {
            console.log('✅ Subscription status updated for subscription:', subscription.id);
          }
        } catch (error) {
          console.error('❌ Error processing subscription update:', error);
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('✅ Payment succeeded for invoice:', invoice.id);
        
        if (invoice.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            
            if (customer && 'email' in customer && customer.email) {
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

// Helper function to get price ID (import from stripe.ts)
function getPriceId(niche: string, billingCycle: 'monthly' | 'yearly' = 'monthly'): string {
  const STRIPE_PRICES = {
    creator: {
      monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',
      yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',
    },
    coach: {
      monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',
      yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',
    },
    podcaster: {
      monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',
      yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',
    },
    freelancer: {
      monthly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',
      yearly: 'price_1RjlLtIvVfT8K9K9K9K9K9K9',
    },
  };
  
  const prices = STRIPE_PRICES[niche as keyof typeof STRIPE_PRICES];
  if (!prices) {
    throw new Error(`No price configuration found for niche: ${niche}`);
  }
  
  const priceId = prices[billingCycle];
  if (!priceId || priceId === 'price_1RjlLtIvVfT8K9K9K9K9K9K9') {
    throw new Error(`Price ID not configured for ${niche} ${billingCycle} plan`);
  }
  
  return priceId;
}