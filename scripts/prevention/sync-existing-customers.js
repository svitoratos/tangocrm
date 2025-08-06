
// Add this to your scripts folder (scripts/sync-existing-customers.js)

async function syncExistingCustomers() {
  try {
    console.log('🔄 Syncing existing customers...\n');

    // Get all users with Stripe customer IDs
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .not('stripe_customer_id', 'is', null);

    let syncedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Get customer from Stripe
        const customer = await stripe.customers.retrieve(user.stripe_customer_id);
        
        // Get active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          limit: 10
        });

        const activeSubscriptions = subscriptions.data.filter(sub => 
          ['active', 'trialing', 'past_due'].includes(sub.status)
        );

        // Determine correct subscription status
        let subscriptionStatus = 'inactive';
        let subscriptionId = null;

        if (activeSubscriptions.length > 0) {
          subscriptionStatus = 'active';
          subscriptionId = activeSubscriptions[0].id;
        }

        // Update user if needed
        const updates = {};
        let needsUpdate = false;

        if (user.subscription_status !== subscriptionStatus) {
          updates.subscription_status = subscriptionStatus;
          needsUpdate = true;
        }

        if (user.stripe_subscription_id !== subscriptionId) {
          updates.stripe_subscription_id = subscriptionId;
          needsUpdate = true;
        }

        if (needsUpdate) {
          updates.updated_at = new Date().toISOString();
          
          await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id);

          console.log('✅ Synced user:', user.email);
          syncedCount++;
        } else {
          console.log('✅ User already in sync:', user.email);
        }

      } catch (error) {
        console.log('❌ Error syncing user:', user.email, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log('   Users processed:', users.length);
    console.log('   Users synced:', syncedCount);
    console.log('   Errors:', errorCount);

  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}
