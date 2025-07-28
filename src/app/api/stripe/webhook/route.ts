import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { userOperations } from '@/lib/database';
import { supabase } from '@/lib/supabase';

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
    console.log('🔧 Processing webhook event:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Handle successful checkout
        console.log('🔧 Checkout completed for session:', session.id);
        console.log('🔧 User ID:', session.metadata?.clerk_user_id);
        console.log('🔧 Niche:', session.metadata?.niche);
        console.log('🔧 Niches:', session.metadata?.niches);
        console.log('🔧 Customer ID:', session.customer);
        console.log('🔧 Subscription ID:', session.subscription);
        
        // Update user's onboarding status and basic details
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
          
          // Get user email from session metadata or customer data
          const customerEmail = session.customer_details?.email || session.metadata?.email || '';
          
          // Only update onboarding status and customer ID here
          // Don't set subscription_status yet - wait for subscription events
          const updatedUser = await userOperations.upsertProfile(userId, {
            email: customerEmail,
            onboarding_completed: true,
            primary_niche: primaryNiche,
            niches: niches,
            stripe_customer_id: session.customer as string,
            // Don't set subscription_status here - let subscription events handle it
            subscription_tier: 'core',
            updated_at: new Date().toISOString()
          });
          
          console.log('✅ Webhook: User onboarding completed successfully:', updatedUser);
          
          // If there's a subscription ID, fetch its status
          if (session.subscription) {
            try {
              const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
              console.log('🔧 Retrieved subscription status:', subscription.status);
              
              // Update subscription status based on actual subscription
              await userOperations.updateProfile(userId, {
                subscription_status: subscription.status,
                updated_at: new Date().toISOString()
              });
              
              console.log('✅ Webhook: Updated subscription status to:', subscription.status);
            } catch (subscriptionError) {
              console.error('❌ Error retrieving subscription:', subscriptionError);
            }
          }
        } else {
          console.error('❌ No user ID found in session metadata');
        }
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔧 Subscription created:', subscription.id);
        console.log('🔧 Subscription status:', subscription.status);
        console.log('🔧 Customer ID:', subscription.customer);
        
        // Update subscription status
        if (subscription.customer) {
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .single();
            
          if (user) {
            const updatedUser = await userOperations.updateProfile(user.id, {
              subscription_status: subscription.status,
              updated_at: new Date().toISOString()
            });
            console.log('✅ Webhook: Updated user subscription status to:', subscription.status, 'for user:', user.id);
          } else {
            console.error('❌ No user found for customer ID:', subscription.customer);
          }
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log('🔧 Subscription updated:', updatedSubscription.id);
        console.log('🔧 New status:', updatedSubscription.status);
        console.log('🔧 Customer ID:', updatedSubscription.customer);
        
        // Update subscription status
        if (updatedSubscription.customer) {
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', updatedSubscription.customer)
            .single();
            
          if (user) {
            const updatedUser = await userOperations.updateProfile(user.id, {
              subscription_status: updatedSubscription.status,
              updated_at: new Date().toISOString()
            });
            console.log('✅ Webhook: Updated user subscription status to:', updatedSubscription.status, 'for user:', user.id);
          } else {
            console.error('❌ No user found for customer ID:', updatedSubscription.customer);
          }
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('🔧 Subscription deleted:', deletedSubscription.id);
        console.log('🔧 Customer ID:', deletedSubscription.customer);
        
        // Update subscription status
        if (deletedSubscription.customer) {
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', deletedSubscription.customer)
            .single();
            
          if (user) {
            const updatedUser = await userOperations.updateProfile(user.id, {
              subscription_status: 'canceled',
              updated_at: new Date().toISOString()
            });
            console.log('✅ Webhook: Updated user subscription status to canceled for user:', user.id);
          } else {
            console.error('❌ No user found for customer ID:', deletedSubscription.customer);
          }
        }
        break;

      default:
        console.log(`🔧 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
