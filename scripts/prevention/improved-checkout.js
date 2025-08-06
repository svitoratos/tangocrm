
// Update your checkout session creation (src/app/api/stripe/checkout/route.ts)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const user = await userOperations.getProfile(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a Stripe customer
    let stripeCustomerId = user.stripe_customer_id;
    
    if (stripeCustomerId) {
      try {
        // Verify the customer still exists in Stripe
        await stripe.customers.retrieve(stripeCustomerId);
        console.log('✅ Using existing Stripe customer:', stripeCustomerId);
      } catch (error) {
        console.log('⚠️  Existing customer not found, creating new one...');
        stripeCustomerId = null;
      }
    }

    // Create new customer if needed
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId,
          clerkUserId: userId
        }
      });

      stripeCustomerId = customer.id;

      // Update user with new customer ID
      await userOperations.updateProfile(userId, {
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date().toISOString()
      });

      console.log('✅ Created new Stripe customer:', stripeCustomerId);
    }

    // Create checkout session with customer ID
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId, // Use customer ID instead of customer_email
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        clerk_user_id: userId,
        email: user.email,
        // ... other metadata
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
