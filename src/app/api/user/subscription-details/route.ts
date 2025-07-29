import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { userOperations } from '@/lib/database'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile from database
    const user = await userOperations.getProfile(userId)
    
    if (!user || !user.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 404 }
      )
    }

    // Get customer's subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'all',
      expand: ['data.default_payment_method', 'data.items.data.price.product']
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'No subscriptions found' },
        { status: 404 }
      )
    }

    const subscription = subscriptions.data[0];
    
    // Extract subscription details
    const subscriptionDetails = {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: (subscription as any).current_period_start,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      items: subscription.items.data.map(item => ({
        id: item.id,
        priceId: item.price.id,
        productId: (item.price.product as Stripe.Product).id,
        productName: (item.price.product as Stripe.Product).name,
        unitAmount: item.price.unit_amount,
        currency: item.price.currency,
        interval: item.price.recurring?.interval,
        intervalCount: item.price.recurring?.interval_count,
        quantity: item.quantity
      })),
      totalAmount: subscription.items.data.reduce((total, item) => {
        return total + ((item.price.unit_amount || 0) * (item.quantity || 1));
      }, 0),
      currency: subscription.currency,
      defaultPaymentMethod: (subscription as any).default_payment_method
    };

    // Calculate next billing date
    const nextBillingDate = new Date((subscription as any).current_period_end * 1000);
    
    // Get billing history (recent invoices)
    const invoices = await stripe.invoices.list({
      customer: user.stripe_customer_id,
      limit: 5,
      status: 'paid'
    });

    const billingHistory = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end
    }));

    const response = {
      subscription: subscriptionDetails,
      nextBillingDate: nextBillingDate.toISOString(),
      billingHistory,
      customerId: user.stripe_customer_id
    };

    console.log('✅ Subscription details fetched:', {
      customerId: user.stripe_customer_id,
      subscriptionId: subscription.id,
      status: subscription.status,
      totalAmount: subscriptionDetails.totalAmount,
      currency: subscriptionDetails.currency
    });

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Error fetching subscription details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    )
  }
} 