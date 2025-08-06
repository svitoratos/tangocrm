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
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {

    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        

        
        // Handle successful checkout
        
        // Update user's onboarding status and basic details
        const userId = session.metadata?.clerk_user_id;
        const primaryNiche = session.metadata?.niche || 'creator';
        const niches = session.metadata?.niches ? JSON.parse(session.metadata.niches) : [primaryNiche];
        
        if (userId) {
          
                  // CRITICAL FIX: Prioritize metadata email to prevent autofill issues
        // The metadata contains the actual user's email from Clerk
        const customerEmail = session.metadata?.email || session.customer_details?.email || '';
        const customerName = session.metadata?.name || session.customer_details?.name || '';
        
        console.log('🔧 Webhook: Processing checkout session for user:', userId);
        console.log('🔧 Webhook: User email from metadata:', session.metadata?.email);
        console.log('🔧 Webhook: User name from metadata:', session.metadata?.name);
        console.log('🔧 Webhook: Customer email from details:', session.customer_details?.email);
        console.log('🔧 Webhook: Customer name from details:', session.customer_details?.name);
        console.log('🔧 Webhook: Final email to use:', customerEmail);
        console.log('🔧 Webhook: Final name to use:', customerName);
        
        // Validate that we have the correct email
        if (!customerEmail || customerEmail === 'stevenvitoratos@gmail.com') {
          console.error('❌ Webhook: Invalid or fallback email detected:', customerEmail);
          console.error('❌ Webhook: This indicates an autofill issue or missing user data');
        }
          
          // Check if this is a discounted or free payment
          const isDiscountedPayment = (session.total_details?.amount_discount || 0) > 0;
          const isFreePayment = session.amount_total === 0;
          
                  // Get current user profile to preserve existing niches
        const currentProfile = await userOperations.getProfile(userId);
        const existingNiches = currentProfile?.niches || [];
        
        // Merge existing niches with new niches from session
        const newNiches = session.metadata?.niches ? JSON.parse(session.metadata.niches) : [primaryNiche];
        const updatedNiches = [...new Set([...existingNiches, ...newNiches])];
        
        console.log('🔧 Webhook: Merging niches:', {
          existing: existingNiches,
          new: newNiches,
          merged: updatedNiches
        });
        
        // Update user profile - handle both regular and discounted payments
        const updatedUser = await userOperations.upsertProfile(userId, {
          email: customerEmail,
          onboarding_completed: true,
          primary_niche: primaryNiche,
          niches: updatedNiches,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string || null,
          subscription_tier: 'core',
          updated_at: new Date().toISOString()
        });
          
          // If there's a subscription ID, fetch its status
          if (session.subscription) {
            try {
              const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
              
              // Update subscription status based on actual subscription
              await userOperations.updateProfile(userId, {
                subscription_status: subscription.status,
                stripe_subscription_id: session.subscription as string,
                updated_at: new Date().toISOString()
              });
            } catch (subscriptionError) {
              console.error('❌ Error retrieving subscription:', subscriptionError);
            }
          } else if (isFreePayment || isDiscountedPayment) {
            // For free or discounted payments without subscription, set status to active
            await userOperations.updateProfile(userId, {
              subscription_status: 'active',
              updated_at: new Date().toISOString()
            });
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
        
        // Enhanced validation and sync
        if (subscription.customer) {
          try {
            // 1. Verify customer exists in Stripe
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            if (customer.deleted) {
              console.error('❌ Customer has been deleted:', subscription.customer);
              break;
            }
            console.log('✅ Verified customer exists:', customer.email);
            
            // 2. Verify subscription belongs to customer
            if (subscription.customer !== customer.id) {
              console.error('❌ Subscription does not belong to customer:', subscription.id, subscription.customer);
              break;
            }
            
            // 3. Find user by customer ID
            const { data: user } = await supabase
              .from('users')
              .select('id, email, stripe_customer_id')
              .eq('stripe_customer_id', subscription.customer)
              .single();
            
            if (user) {
              // 4. Check for conflicts
              if (user.stripe_customer_id && user.stripe_customer_id !== subscription.customer) {
                console.warn('⚠️  User has different customer ID, updating...');
                console.log('   Old customer ID:', user.stripe_customer_id);
                console.log('   New customer ID:', subscription.customer);
              }
              
              // 5. Check if customer ID is used by another user
              const { data: conflictingUser } = await supabase
                .from('users')
                .select('id, email')
                .eq('stripe_customer_id', subscription.customer)
                .neq('id', user.id)
                .single();
              
              if (conflictingUser) {
                console.error('❌ Customer ID already used by another user:', conflictingUser.email);
                break;
              }
              
              // 6. Update user with validated data
              const updatedUser = await userOperations.updateProfile(user.id, {
                subscription_status: subscription.status,
                stripe_subscription_id: subscription.id,
                updated_at: new Date().toISOString()
              });
              console.log('✅ Webhook: Updated user subscription status to:', subscription.status, 'for user:', user.id);
            } else {
              console.error('❌ No user found for customer ID:', subscription.customer);
              
              // 7. Try to find user by email as fallback
              if (!customer.deleted && customer.email) {
                const { data: userByEmail } = await supabase
                  .from('users')
                  .select('id, email, stripe_customer_id')
                  .eq('email', customer.email)
                  .single();
                
                if (userByEmail) {
                  console.log('🔧 Found user by email, updating customer ID...');
                  const updatedUser = await userOperations.updateProfile(userByEmail.id, {
                    stripe_customer_id: subscription.customer,
                    subscription_status: subscription.status,
                    stripe_subscription_id: subscription.id,
                    updated_at: new Date().toISOString()
                  });
                  console.log('✅ Webhook: Updated user with new customer ID and subscription for user:', userByEmail.id);
                }
              }
            }
          } catch (error) {
            console.error('❌ Error in subscription.created webhook:', error);
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
              stripe_subscription_id: updatedSubscription.id,
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
              stripe_subscription_id: null, // Clear subscription ID when deleted
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
