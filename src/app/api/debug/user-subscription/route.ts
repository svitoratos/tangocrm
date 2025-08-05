import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isAdminEmail } from '@/lib/admin-config';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userEmail = sessionClaims?.email as string;
    const isAdmin = isAdminEmail(userEmail);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get user data from database
    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (dbError) {
      return NextResponse.json({
        error: 'Database error',
        details: dbError
      }, { status: 500 });
    }

    // Check Stripe for customer data
    let stripeCustomer = null;
    let stripeSubscriptions = [];
    let stripeError = null;

    if (user?.stripe_customer_id) {
      try {
        stripeCustomer = await stripe.customers.retrieve(user.stripe_customer_id);
        
        // Get all subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'all',
          limit: 10
        });
        
        stripeSubscriptions = subscriptions.data;
      } catch (error) {
        stripeError = error instanceof Error ? error.message : 'Unknown Stripe error';
      }
    }

    // Also check by email if we have it
    let customerByEmail = null;
    if (user?.email) {
      try {
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1
        });
        
        if (customers.data.length > 0) {
          customerByEmail = customers.data[0];
          
          // Get subscriptions for this customer
          const subscriptions = await stripe.subscriptions.list({
            customer: customerByEmail.id,
            status: 'all',
            limit: 10
          });
          
          if (subscriptions.data.length > 0) {
            stripeSubscriptions = [...stripeSubscriptions, ...subscriptions.data];
          }
        }
      } catch (error) {
        console.error('Error checking customer by email:', error);
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        userId,
        userEmail,
        database: {
          user: user,
          error: dbError
        },
        stripe: {
          customerId: user?.stripe_customer_id,
          customer: stripeCustomer,
          customerByEmail,
          subscriptions: stripeSubscriptions,
          error: stripeError
        },
        recommendations: {
          missingSubscriptionId: !user?.stripe_subscription_id,
          hasStripeCustomer: !!user?.stripe_customer_id,
          hasSubscriptions: stripeSubscriptions.length > 0,
          needsFix: !user?.stripe_subscription_id && stripeSubscriptions.length > 0
        }
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 