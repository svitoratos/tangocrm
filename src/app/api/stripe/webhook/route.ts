import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { userOperations } from '@/lib/database';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper function to validate webhook data
async function validateWebhookData(event: Stripe.Event, userId?: string) {
  try {
    if (!userId) return { valid: true, message: 'No user ID to validate' };

    // Get user data from database
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      return { 
        valid: false, 
        error: 'User not found',
        user_id: userId 
      };
    }

    // Extract customer and subscription IDs from event
    let customerId: string | undefined;
    let subscriptionId: string | undefined;

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        customerId = session.customer as string;
        subscriptionId = session.subscription as string;
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        customerId = subscription.customer as string;
        subscriptionId = subscription.id;
        break;
    }

    // Validate customer ID consistency
    if (customerId && user.stripe_customer_id && user.stripe_customer_id !== customerId) {
      console.error('❌ Customer ID mismatch detected:', {
        userId,
        dbCustomerId: user.stripe_customer_id,
        webhookCustomerId: customerId,
        eventType: event.type
      });
      
      return {
        valid: false,
        error: 'Customer ID mismatch',
        db_customer_id: user.stripe_customer_id,
        webhook_customer_id: customerId,
        user_id: userId
      };
    }

    // Validate subscription ID consistency
    if (subscriptionId && user.stripe_subscription_id && user.stripe_subscription_id !== subscriptionId) {
      console.error('❌ Subscription ID mismatch detected:', {
        userId,
        dbSubscriptionId: user.stripe_subscription_id,
        webhookSubscriptionId: subscriptionId,
        eventType: event.type
      });
      
      return {
        valid: false,
        error: 'Subscription ID mismatch',
        db_subscription_id: user.stripe_subscription_id,
        webhook_subscription_id: subscriptionId,
        user_id: userId
      };
    }

    return { valid: true, message: 'Webhook data validated' };
  } catch (error) {
    console.error('❌ Webhook validation error:', error);
    return { valid: false, error: 'Validation failed', details: error };
  }
}

// Helper function to log customer ID changes
async function logCustomerIdChange(userId: string, oldCustomerId: string | null, newCustomerId: string | null) {
  try {
    await supabase
      .from('customer_id_changes')
      .insert({
        user_id: userId,
        old_customer_id: oldCustomerId,
        new_customer_id: newCustomerId,
        changed_at: new Date().toISOString(),
        changed_by: 'webhook',
        notes: 'Updated via Stripe webhook'
      });
  } catch (error) {
    console.error('❌ Failed to log customer ID change:', error);
  }
}

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
    console.log(`🔧 Processing webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('🚀 CHECKOUT.SESSION.COMPLETED WEBHOOK TRIGGERED');
        console.log('📊 Session ID:', session.id);
        console.log('📊 Session object:', JSON.stringify(session, null, 2));
        console.log('📊 Session metadata:', session.metadata);
        console.log('📊 Session customer:', session.customer);
        console.log('📊 Session subscription:', session.subscription);
        console.log('📊 Session amount_total:', session.amount_total);
        console.log('📊 Session payment_status:', session.payment_status);
        
        // Validate webhook data before processing
        const userId = session.metadata?.clerk_user_id;
        const validation = await validateWebhookData(event, userId);
        
        if (!validation.valid) {
          console.error('❌ Webhook validation failed:', validation);
          // Log the issue but don't fail the webhook
          // This allows us to track issues without breaking the flow
        }
        
        console.log('✅ VALIDATION COMPLETE:', validation);
        console.log('📊 User ID from metadata:', userId);
        
        // Handle successful checkout
        const primaryNiche = session.metadata?.niche || 'creator';
        const niches = session.metadata?.niches ? JSON.parse(session.metadata.niches) : [primaryNiche];
        
        if (userId) {
          console.log('🔍 PROCESSING USER UPDATE');
          const customerEmail = session.customer_details?.email || session.metadata?.email || '';
          const isDiscountedPayment = (session.total_details?.amount_discount || 0) > 0;
          const isFreePayment = session.amount_total === 0;
          
          console.log('📊 Customer email:', customerEmail);
          console.log('📊 Primary niche:', primaryNiche);
          console.log('📊 All niches:', niches);
          console.log('📊 Is discounted payment:', isDiscountedPayment);
          console.log('📊 Is free payment:', isFreePayment);
          
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
          
          // Log customer ID change if it's being updated
          const oldCustomerId = currentProfile?.stripe_customer_id;
          const newCustomerId = session.customer as string;
          
          if (oldCustomerId !== newCustomerId) {
            await logCustomerIdChange(userId, oldCustomerId || null, newCustomerId);
          }
          
          // Update user profile
          console.log('🔄 Attempting to update user profile for ID:', userId);
          const updatedUser = await userOperations.upsertProfile(userId, {
            email: customerEmail,
            onboarding_completed: true,
            primary_niche: primaryNiche,
            niches: updatedNiches,
            stripe_customer_id: newCustomerId,
            stripe_subscription_id: session.subscription as string || null,
            subscription_tier: 'core',
            updated_at: new Date().toISOString()
          });
          
          console.log('✅ USER PROFILE UPDATED');
          console.log('📊 Updated user data:', updatedUser);
          
          // If there's a subscription ID, fetch its status
          if (session.subscription) {
            try {
              const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
              
              await userOperations.updateProfile(userId, {
                subscription_status: subscription.status,
                stripe_subscription_id: session.subscription as string,
                updated_at: new Date().toISOString()
              });
            } catch (subscriptionError) {
              console.error('❌ Error retrieving subscription:', subscriptionError);
            }
          } else if (isFreePayment || isDiscountedPayment) {
            await userOperations.updateProfile(userId, {
              subscription_status: 'active',
              updated_at: new Date().toISOString()
            });
          }
        } else {
          console.error('❌ No user ID found in session metadata');
        }
        
        console.log('🎉 CHECKOUT.SESSION.COMPLETED PROCESSING COMPLETE');
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔧 Subscription created:', subscription.id);
        
        // Validate webhook data
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single();
          
        if (user) {
          const validation = await validateWebhookData(event, user.id);
          if (!validation.valid) {
            console.error('❌ Subscription creation validation failed:', validation);
          }
          
          // Log customer ID change if needed
          const currentProfile = await userOperations.getProfile(user.id);
          if (currentProfile?.stripe_subscription_id !== subscription.id) {
            await logCustomerIdChange(user.id, currentProfile?.stripe_subscription_id || null, subscription.id);
          }
          
          const updatedUser = await userOperations.updateProfile(user.id, {
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString()
          });
          console.log('✅ Webhook: Updated user subscription status to:', subscription.status, 'for user:', user.id);
        } else {
          console.error('❌ No user found for customer ID:', subscription.customer);
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log('🔧 Subscription updated:', updatedSubscription.id);
        
        const { data: updatedUser } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', updatedSubscription.customer)
          .single();
          
        if (updatedUser) {
          const validation = await validateWebhookData(event, updatedUser.id);
          if (!validation.valid) {
            console.error('❌ Subscription update validation failed:', validation);
          }
          
          const updatedUserProfile = await userOperations.updateProfile(updatedUser.id, {
            subscription_status: updatedSubscription.status,
            stripe_subscription_id: updatedSubscription.id,
            updated_at: new Date().toISOString()
          });
          console.log('✅ Webhook: Updated user subscription status to:', updatedSubscription.status, 'for user:', updatedUser.id);
        } else {
          console.error('❌ No user found for customer ID:', updatedSubscription.customer);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('🔧 Subscription deleted:', deletedSubscription.id);
        
        const { data: deletedUser } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', deletedSubscription.customer)
          .single();
          
        if (deletedUser) {
          const validation = await validateWebhookData(event, deletedUser.id);
          if (!validation.valid) {
            console.error('❌ Subscription deletion validation failed:', validation);
          }
          
          const updatedUserProfile = await userOperations.updateProfile(deletedUser.id, {
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString()
          });
          console.log('✅ Webhook: Updated user subscription status to canceled for user:', deletedUser.id);
        } else {
          console.error('❌ No user found for customer ID:', deletedSubscription.customer);
        }
        break;

      case 'customer.updated':
        const customer = event.data.object as Stripe.Customer;
        console.log('🔧 Customer updated:', customer.id);
        
        // Update user email if it changed
        const { data: customerUser } = await supabase
          .from('users')
          .select('id, email')
          .eq('stripe_customer_id', customer.id)
          .single();
          
        if (customerUser && customer.email && customerUser.email !== customer.email) {
          await userOperations.updateProfile(customerUser.id, {
            email: customer.email,
            updated_at: new Date().toISOString()
          });
          console.log('✅ Webhook: Updated user email for customer:', customer.id);
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        console.log('🔧 Invoice payment succeeded:', invoice.id);
        
        const subscriptionId = typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : (invoice as any).subscription?.id;
        if (subscriptionId) {
          const { data: invoiceUser } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', invoice.customer)
            .single();
            
          if (invoiceUser) {
            // Fetch the subscription to get current status
            try {
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);
              
              await userOperations.updateProfile(invoiceUser.id, {
                subscription_status: subscription.status,
                stripe_subscription_id: subscription.id,
                updated_at: new Date().toISOString()
              });
              
              console.log('✅ Webhook: Updated subscription status after successful payment:', subscription.status, 'for user:', invoiceUser.id);
            } catch (subscriptionError) {
              console.error('❌ Error retrieving subscription after payment:', subscriptionError);
            }
          } else {
            console.error('❌ No user found for customer ID in invoice:', invoice.customer);
          }
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log('🔧 Invoice payment failed:', failedInvoice.id);
        
        const failedSubscriptionId = typeof (failedInvoice as any).subscription === 'string' ? (failedInvoice as any).subscription : (failedInvoice as any).subscription?.id;
        if (failedSubscriptionId) {
          const { data: failedUser } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', failedInvoice.customer)
            .single();
            
          if (failedUser) {
            // Fetch the subscription to get current status (might be past_due)
            try {
              const subscription = await stripe.subscriptions.retrieve(failedSubscriptionId);
              
              await userOperations.updateProfile(failedUser.id, {
                subscription_status: subscription.status,
                updated_at: new Date().toISOString()
              });
              
              console.log('✅ Webhook: Updated subscription status after failed payment:', subscription.status, 'for user:', failedUser.id);
            } catch (subscriptionError) {
              console.error('❌ Error retrieving subscription after failed payment:', subscriptionError);
            }
          }
        }
        break;

      case 'customer.subscription.trial_will_end':
        const trialSubscription = event.data.object as Stripe.Subscription;
        console.log('🔧 Subscription trial will end:', trialSubscription.id);
        
        const { data: trialUser } = await supabase
          .from('users')
          .select('id, email')
          .eq('stripe_customer_id', trialSubscription.customer)
          .single();
          
        if (trialUser) {
          // You can add email notification logic here
          console.log('✅ Webhook: Trial ending notification for user:', trialUser.id);
        }
        break;

      case 'payment_method.attached':
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        console.log('🔧 Payment method attached:', paymentMethod.id);
        // Payment method updates are handled automatically by Stripe
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
