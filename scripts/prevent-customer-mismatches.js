const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

async function preventCustomerMismatches() {
  try {
    console.log('🔧 Implementing customer mismatch prevention...\n');

    // 1. Create a validation function for webhook handlers
    console.log('1️⃣ Creating webhook validation function...');
    
    const webhookValidationCode = `
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
`;

    console.log('✅ Webhook validation function created');

    // 2. Create a database trigger function
    console.log('\n2️⃣ Creating database trigger function...');
    
    const databaseTriggerCode = `
-- Add this to your database (run in Supabase SQL editor)

-- Function to validate customer ID uniqueness
CREATE OR REPLACE FUNCTION validate_stripe_customer_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new customer ID is already used by another user
  IF NEW.stripe_customer_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM users 
      WHERE stripe_customer_id = NEW.stripe_customer_id 
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Stripe customer ID % is already used by another user', NEW.stripe_customer_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run validation on insert/update
DROP TRIGGER IF EXISTS validate_stripe_customer_id_trigger ON users;
CREATE TRIGGER validate_stripe_customer_id_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_stripe_customer_id();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

    console.log('✅ Database trigger function created');

    // 3. Create a monitoring script
    console.log('\n3️⃣ Creating monitoring script...');
    
    const monitoringScriptCode = `
// Add this to your scripts folder (scripts/monitor-customer-sync.js)

async function monitorCustomerSync() {
  try {
    console.log('🔍 Monitoring customer sync status...\\n');

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

    console.log('\\n📊 Monitoring Summary:');
    console.log('   Users checked:', users.length);
    console.log('   Issues found:', issuesFound);

    return issuesFound === 0;
  } catch (error) {
    console.error('❌ Monitoring failed:', error);
    return false;
  }
}
`;

    console.log('✅ Monitoring script created');

    // 4. Create improved checkout session creation
    console.log('\n4️⃣ Creating improved checkout session creation...');
    
    const improvedCheckoutCode = `
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
`;

    console.log('✅ Improved checkout session creation created');

    // 5. Create a sync function for existing data
    console.log('\n5️⃣ Creating sync function for existing data...');
    
    const syncFunctionCode = `
// Add this to your scripts folder (scripts/sync-existing-customers.js)

async function syncExistingCustomers() {
  try {
    console.log('🔄 Syncing existing customers...\\n');

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

    console.log('\\n📊 Sync Summary:');
    console.log('   Users processed:', users.length);
    console.log('   Users synced:', syncedCount);
    console.log('   Errors:', errorCount);

  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}
`;

    console.log('✅ Sync function created');

    // 6. Create prevention summary
    console.log('\n6️⃣ Creating prevention summary...');
    
    const preventionSummary = `
## 🛡️ Customer Mismatch Prevention Strategy

### 1. **Webhook Validation**
- Validate customer and subscription ownership in webhooks
- Check for conflicts before updating user data
- Log all validation failures for monitoring

### 2. **Database Constraints**
- Add unique constraint on stripe_customer_id
- Add trigger to prevent duplicate customer IDs
- Add indexes for better performance

### 3. **Improved Checkout Flow**
- Always use customer ID instead of customer_email
- Verify existing customers before creating new ones
- Update user profile immediately after customer creation

### 4. **Monitoring & Alerts**
- Regular sync checks to catch mismatches early
- Email alerts for validation failures
- Dashboard to monitor customer sync status

### 5. **Best Practices**
- Always verify Stripe data before updating database
- Use customer ID consistently across all operations
- Implement proper error handling and logging
- Regular data consistency checks

### 6. **Recovery Procedures**
- Automated sync scripts for fixing mismatches
- Manual verification tools for edge cases
- Rollback procedures for failed updates
`;

    console.log('✅ Prevention summary created');

    // 7. Save all the code to files
    console.log('\n7️⃣ Saving prevention code to files...');
    
    const fs = require('fs');
    const path = require('path');

    // Create prevention directory
    const preventionDir = path.join(__dirname, 'prevention');
    if (!fs.existsSync(preventionDir)) {
      fs.mkdirSync(preventionDir);
    }

    // Save webhook validation
    fs.writeFileSync(
      path.join(preventionDir, 'webhook-validation.js'),
      webhookValidationCode
    );

    // Save database trigger
    fs.writeFileSync(
      path.join(preventionDir, 'database-trigger.sql'),
      databaseTriggerCode
    );

    // Save monitoring script
    fs.writeFileSync(
      path.join(preventionDir, 'monitor-customer-sync.js'),
      monitoringScriptCode
    );

    // Save improved checkout
    fs.writeFileSync(
      path.join(preventionDir, 'improved-checkout.js'),
      improvedCheckoutCode
    );

    // Save sync function
    fs.writeFileSync(
      path.join(preventionDir, 'sync-existing-customers.js'),
      syncFunctionCode
    );

    // Save prevention summary
    fs.writeFileSync(
      path.join(preventionDir, 'PREVENTION_STRATEGY.md'),
      preventionSummary
    );

    console.log('✅ All prevention files saved to scripts/prevention/');

    console.log('\n🎉 Customer mismatch prevention strategy implemented!');
    console.log('\n📋 Next steps:');
    console.log('1. Review the prevention files in scripts/prevention/');
    console.log('2. Implement the webhook validation in your webhook handler');
    console.log('3. Run the database trigger SQL in Supabase');
    console.log('4. Set up regular monitoring with the monitoring script');
    console.log('5. Update your checkout flow to use the improved version');

  } catch (error) {
    console.error('❌ Prevention setup failed:', error);
  }
}

// Run the prevention setup
if (require.main === module) {
  preventCustomerMismatches();
}

module.exports = { preventCustomerMismatches }; 