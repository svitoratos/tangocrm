import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { userOperations } from '@/lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Handle successful checkout
        console.log('Checkout completed for session:', session.id);
        console.log('User ID:', session.metadata?.clerk_user_id);
        console.log('Niche:', session.metadata?.niche);
        console.log('Niches:', session.metadata?.niches);
        
        // Update user's onboarding status and subscription details
        const userId = session.metadata?.clerk_user_id;
        const primaryNiche = session.metadata?.niche || 'creator';
        const niches = session.metadata?.niches ? JSON.parse(session.metadata.niches) : [primaryNiche];
        
        if (userId) {
          console.log('🔧 Webhook: Updating user profile with onboarding completion:', {
            userId,
            primaryNiche,
            niches,
            stripeCustomerId: session.customer
          });
          
          const updatedUser = await userOperations.upsertProfile(userId, {
            onboarding_completed: true,
            primary_niche: primaryNiche,
            niches: niches,
            stripe_customer_id: session.customer as string,
            subscription_status: 'active',
            subscription_tier: 'core',
            updated_at: new Date().toISOString()
          });
          
          console.log('✅ Webhook: User onboarding completed successfully:', updatedUser);
        } else {
          console.error('No user ID found in session metadata');
        }
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription created:', subscription.id);
        
        // Update subscription status
        if (subscription.customer) {
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .single();
            
          if (user) {
            await userOperations.updateProfile(user.id, {
              subscription_status: subscription.status,
              updated_at: new Date().toISOString()
            });
          }
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', updatedSubscription.id);
        
        // Update subscription status
        if (updatedSubscription.customer) {
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', updatedSubscription.customer)
            .single();
            
          if (user) {
            await userOperations.updateProfile(user.id, {
              subscription_status: updatedSubscription.status,
              updated_at: new Date().toISOString()
            });
          }
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', deletedSubscription.id);
        
        // Update subscription status
        if (deletedSubscription.customer) {
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', deletedSubscription.customer)
            .single();
            
          if (user) {
            await userOperations.updateProfile(user.id, {
              subscription_status: 'canceled',
              updated_at: new Date().toISOString()
            });
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Import supabase for webhook handlers
import { supabase } from '@/lib/supabase';
