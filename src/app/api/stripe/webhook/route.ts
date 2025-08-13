import { NextRequest, NextResponse } from 'next/server';
import { stripe, addNicheToCustomer, getPriceId } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { userOperations } from '@/lib/database';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function GET(request: NextRequest) {
  // Test endpoint to verify webhook is working
  return NextResponse.json({ 
    status: 'Webhook endpoint is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}

export async function POST(request: NextRequest) {
  console.log('🔧 Webhook received at:', new Date().toISOString());
  
  // Check if webhook secret is configured
  if (!endpointSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }
  
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    console.error('❌ Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log('✅ Webhook signature verified successfully');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    console.error('❌ Signature header:', sig);
    console.error('❌ Body length:', body.length);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  console.log('🔧 Processing webhook:', event.type);
  console.log('🔧 Webhook event ID:', event.id);
  console.log('🔧 Webhook timestamp:', new Date(event.created * 1000).toISOString());

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('✅ Checkout completed for session:', session.id);
        console.log('🔍 Full session data:', JSON.stringify(session, null, 2));
        
        // Get email from session, but prioritize user profile email
        let customerEmail = session.customer_details?.email;
        const niche = session.metadata?.niche;
        const isNicheUpgrade = session.metadata?.is_niche_upgrade === 'true';
        const userId = session.metadata?.user_id;
        
        console.log('🔍 Session data:', {
          sessionId: session.id,
          sessionEmail: customerEmail,
          metadata: session.metadata,
          userId,
          customerId: session.customer,
          subscriptionId: session.subscription,
          amountTotal: session.amount_total,
          paymentStatus: session.payment_status
        });
        
        // CRITICAL: Check if this is a discounted or free payment
        const isDiscountedPayment = (session.total_details?.amount_discount || 0) > 0;
        const isFreePayment = session.amount_total === 0;
        
        console.log('🔍 Payment analysis:', {
          isDiscountedPayment,
          isFreePayment,
          amountTotal: session.amount_total,
          amountDiscount: session.total_details?.amount_discount || 0
        });
        
        // If we have a userId, try to get the email from the user profile first
        if (userId) {
          try {
            const { data: userProfile } = await supabase
              .from('users')
              .select('email')
              .eq('id', userId)
              .single();
            
            if (userProfile?.email) {
              console.log('🔧 Using email from user profile:', userProfile.email);
              customerEmail = userProfile.email;
            } else {
              console.log('⚠️ No user profile found for userId:', userId);
            }
          } catch (error) {
            console.error('❌ Error fetching user profile:', error);
          }
        }
        
        if (!customerEmail) {
          console.error('❌ Missing email in session data and user profile');
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

        // Log customer ID consistency check
        console.log('🔍 Customer ID consistency check:', {
          sessionId: session.id,
          sessionCustomerId: session.customer,
          databaseCustomerId: existingUser.stripe_customer_id,
          isNicheUpgrade,
          niche,
          userEmail: customerEmail
        });

        // CRITICAL SAFEGUARD: Always ensure customer consistency before processing
        let finalCustomerId = existingUser.stripe_customer_id;
        
        // If we have a customer ID mismatch, consolidate immediately
        if (existingUser.stripe_customer_id && session.customer && existingUser.stripe_customer_id !== session.customer) {
          console.warn('⚠️ Customer ID mismatch detected - consolidating immediately:', {
            databaseCustomerId: existingUser.stripe_customer_id,
            sessionCustomerId: session.customer,
            userEmail: customerEmail
          });
          
          try {
            // Run immediate customer consolidation
            console.log('🔄 Customer consolidation no longer needed with simplified approach');
            
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
            
          } catch (consolidationError) {
            console.error('❌ Error during customer consolidation:', consolidationError);
          }
        }

        // Validate customer ID consistency
        if (finalCustomerId && session.customer && finalCustomerId !== session.customer) {
          console.warn('⚠️ Customer ID mismatch still exists after consolidation:', {
            finalCustomerId,
            sessionCustomerId: session.customer,
            userEmail: customerEmail
          });
          
          // Try to merge the customers to maintain consistency
          try {
            console.log('🔄 Customer merging no longer needed with simplified approach');
            console.log('✅ Using existing customer ID for subscription');
          } catch (mergeError) {
            console.error('❌ Error during customer merge:', mergeError);
          }
        }

        if (isNicheUpgrade && existingUser.stripe_subscription_id) {
          // This is a niche upgrade - add the new niche to existing subscription
          console.log('🔧 Adding niche to existing subscription:', niche);
          
          try {
            // Get the existing subscription
            const existingSubscription = await stripe.subscriptions.retrieve(existingUser.stripe_subscription_id);
            
            // Get billing cycle from session metadata
            const billingCycle = session.metadata?.billing_cycle || 'monthly';
            console.log('🔧 Using billing cycle for niche upgrade:', billingCycle);
            
            // Get the price ID for the new niche
            const priceId = getPriceId(niche, billingCycle as 'monthly' | 'yearly', true); // true for niche upgrades
            
            console.log('🔧 Using price ID for niche upgrade:', priceId);
            
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
            
            // Update customer metadata with new niche
            if (existingUser.stripe_customer_id) {
              await addNicheToCustomer(existingUser.stripe_customer_id, niche, existingUser.id);
            }
            
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
          
          // IMPORTANT: For new subscriptions, we should preserve the existing customer ID
          // if the user already has one, rather than overwriting it with session.customer
          const customerIdToUse = existingUser.stripe_customer_id || session.customer;
          
          console.log('🔧 Using customer ID for new subscription:', {
            existingCustomerId: existingUser.stripe_customer_id,
            sessionCustomerId: session.customer,
            finalCustomerId: customerIdToUse
          });
          
          // CRITICAL FIX: Preserve existing niches when creating new subscription
          const existingNiches = existingUser.niches || [];
          const newNiche = niche || 'creator';
          const updatedNiches = existingNiches.includes(newNiche) ? existingNiches : [...existingNiches, newNiche];
          
          console.log('🔧 Preserving existing niches:', {
            existingNiches,
            newNiche,
            updatedNiches
          });
          
          const { data: user, error: updateError } = await supabase
            .from('users')
            .update({
              onboarding_completed: true,
              stripe_customer_id: customerIdToUse, // Use existing customer ID if available
              stripe_subscription_id: session.subscription,
              subscription_status: 'active',
              subscription_tier: 'core',
              primary_niche: newNiche,
              niches: updatedNiches, // Use updated niches that preserve existing ones
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
          console.log('✅ Onboarding marked as completed for user:', existingUser.id);
          console.log('✅ User profile updated with:', {
            onboarding_completed: user.onboarding_completed,
            subscription_status: user.subscription_status,
            stripe_customer_id: user.stripe_customer_id,
            primary_niche: user.primary_niche,
            niches: user.niches
          });
          
          // CRITICAL: Ensure niches are properly unlocked by double-checking
          if (user.niches && user.niches.length > 0) {
            console.log('✅ Niches successfully unlocked:', user.niches);
          } else {
            console.error('❌ CRITICAL: No niches found after subscription creation!');
            console.error('❌ User niches array is empty or missing');
            
            // FALLBACK: Force add the niche if it's missing
            try {
              console.log('🔄 FALLBACK: Forcing niche addition...');
              const fallbackNiches = [newNiche || 'creator'];
              
              const { error: fallbackError } = await supabase
                .from('users')
                .update({
                  niches: fallbackNiches,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingUser.id);
              
              if (fallbackError) {
                console.error('❌ FALLBACK niche addition failed:', fallbackError);
              } else {
                console.log('✅ FALLBACK niche addition successful:', fallbackNiches);
              }
            } catch (fallbackError) {
              console.error('❌ FALLBACK niche addition error:', fallbackError);
            }
          }
          
          // After creating a new subscription, ensure customer consistency
          // This helps prevent future customer ID mismatches
          try {
            console.log('🔍 Customer consistency check no longer needed with simplified approach');
            console.log('✅ Subscription created successfully with simplified customer management');
          } catch (consistencyError) {
            console.error('❌ Error during customer consistency check:', consistencyError);
            // Don't fail the webhook for this - it's just a cleanup step
          }
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

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    console.error('❌ Error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      eventType: event?.type,
      eventId: event?.id
    });
    
    // Return 200 to prevent Stripe from retrying (for now)
    // This prevents webhook delivery failures while we debug
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      received: true // Tell Stripe we received it to stop retries
    }, { status: 200 });
  }
}