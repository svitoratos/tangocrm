
// Add this to your scripts folder (scripts/monitor-customer-sync.js)

async function monitorCustomerSync() {
  try {
    console.log('🔍 Monitoring customer sync status...\n');

    // Get all users with Stripe customer IDs
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .not('stripe_customer_id', 'is', null);

    let issuesFound = 0;

    for (const user of users) {
      try {
        // Verify customer exists in Stripe
        const customer = await stripe.customers.retrieve(user.stripe_customer_id);
        
        // Check if email matches
        if (customer.email !== user.email) {
          console.log('⚠️  Email mismatch for user:', user.id);
          console.log('   DB email:', user.email);
          console.log('   Stripe email:', customer.email);
          issuesFound++;
        }

        // Check subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          limit: 10
        });

        const activeSubscriptions = subscriptions.data.filter(sub => 
          ['active', 'trialing', 'past_due'].includes(sub.status)
        );

        // Check if subscription status matches
        if (activeSubscriptions.length > 0 && user.subscription_status !== 'active') {
          console.log('⚠️  Subscription status mismatch for user:', user.id);
          console.log('   DB status:', user.subscription_status);
          console.log('   Stripe has active subscription');
          issuesFound++;
        }

        if (activeSubscriptions.length === 0 && user.subscription_status === 'active') {
          console.log('⚠️  Subscription status mismatch for user:', user.id);
          console.log('   DB status: active');
          console.log('   Stripe has no active subscription');
          issuesFound++;
        }

      } catch (error) {
        console.log('❌ Error checking user:', user.id, error.message);
        issuesFound++;
      }
    }

    console.log('\n📊 Monitoring Summary:');
    console.log('   Users checked:', users.length);
    console.log('   Issues found:', issuesFound);

    return issuesFound === 0;
  } catch (error) {
    console.error('❌ Monitoring failed:', error);
    return false;
  }
}
