
// Add this to your webhook handler (src/app/api/stripe/webhook/route.ts)

async function validateAndSyncCustomerData(customerId, subscriptionId, userId) {
  try {
    // 1. Verify customer exists in Stripe
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer) {
      console.error('❌ Customer not found in Stripe:', customerId);
      return false;
    }

    // 2. Verify subscription belongs to customer
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (subscription.customer !== customerId) {
        console.error('❌ Subscription does not belong to customer:', subscriptionId, customerId);
        return false;
      }
    }

    // 3. Check if user already has a different customer ID
    const { data: existingUser } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    if (existingUser && existingUser.stripe_customer_id && existingUser.stripe_customer_id !== customerId) {
      console.warn('⚠️  User has different customer ID, updating...');
      console.log('   Old customer ID:', existingUser.stripe_customer_id);
      console.log('   New customer ID:', customerId);
    }

    // 4. Check if customer ID is already used by another user
    const { data: conflictingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('stripe_customer_id', customerId)
      .neq('id', userId)
      .single();

    if (conflictingUser) {
      console.error('❌ Customer ID already used by another user:', conflictingUser.email);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Validation error:', error);
    return false;
  }
}
