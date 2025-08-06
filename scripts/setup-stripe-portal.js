const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

async function setupStripePortal() {
  try {
    console.log('🔧 Setting up Stripe Customer Portal...\n');

    // 1. Create products for each niche
    console.log('📦 Creating products...');
    
    const products = {
      creator: {
        name: 'Tango Creator CRM',
        description: 'Complete CRM solution for content creators, influencers, and social media managers'
      },
      coach: {
        name: 'Tango Coach CRM', 
        description: 'Comprehensive CRM for coaches, consultants, and service providers'
      },
      podcaster: {
        name: 'Tango Podcaster CRM',
        description: 'Specialized CRM for podcasters, audio creators, and media professionals'
      },
      freelancer: {
        name: 'Tango Freelancer CRM',
        description: 'Project management and client CRM for freelancers and contractors'
      }
    };

    const createdProducts = {};

    for (const [niche, productData] of Object.entries(products)) {
      try {
        const product = await stripe.products.create({
          name: productData.name,
          description: productData.description,
          metadata: {
            niche: niche,
            type: 'crm_platform'
          }
        });

        createdProducts[niche] = product;
        console.log(`✅ Created product for ${niche}: ${product.id}`);
      } catch (error) {
        console.log(`⚠️  Product for ${niche} might already exist:`, error.message);
      }
    }

    // 2. Create prices for each product
    console.log('\n💰 Creating prices...');
    
    const prices = {};
    
    for (const [niche, product] of Object.entries(createdProducts)) {
      if (!product) continue;

      // Monthly price
      try {
        const monthlyPrice = await stripe.prices.create({
          unit_amount: 3999, // $39.99
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
          product: product.id,
          metadata: {
            niche: niche,
            billing_cycle: 'monthly'
          }
        });
        
        prices[`${niche}_monthly`] = monthlyPrice;
        console.log(`✅ Created monthly price for ${niche}: ${monthlyPrice.id}`);
      } catch (error) {
        console.log(`⚠️  Monthly price for ${niche} might already exist:`, error.message);
      }

      // Yearly price
      try {
        const yearlyPrice = await stripe.prices.create({
          unit_amount: 38390, // $383.90 (20% discount)
          currency: 'usd',
          recurring: {
            interval: 'year',
          },
          product: product.id,
          metadata: {
            niche: niche,
            billing_cycle: 'yearly'
          }
        });
        
        prices[`${niche}_yearly`] = yearlyPrice;
        console.log(`✅ Created yearly price for ${niche}: ${yearlyPrice.id}`);
      } catch (error) {
        console.log(`⚠️  Yearly price for ${niche} might already exist:`, error.message);
      }
    }

    // 3. Configure customer portal
    console.log('\n🔧 Configuring customer portal...');
    
    try {
      // Get existing configurations
      const configurations = await stripe.billingPortal.configurations.list();
      
      if (configurations.data.length > 0) {
        console.log('📋 Found existing portal configurations:');
        configurations.data.forEach(config => {
          console.log(`  - ${config.id}: ${config.display_name || 'Default'}`);
        });
      }

      // Create or update default configuration
      const portalConfig = await stripe.billingPortal.configurations.create({
        business_profile: {
          headline: 'Manage your Tango CRM subscription',
          privacy_policy_url: 'https://yourdomain.com/privacy',
          terms_of_service_url: 'https://yourdomain.com/terms',
        },
        features: {
          customer_update: {
            enabled: true,
            allowed_updates: ['email', 'address', 'phone', 'tax_id'],
          },
          invoice_history: {
            enabled: true,
          },
          payment_method_update: {
            enabled: true,
          },
          subscription_cancel: {
            enabled: true,
            mode: 'at_period_end',
            proration_behavior: 'none',
          },
          subscription_pause: {
            enabled: true,
          },
          subscription_update: {
            enabled: true,
            default_allowed_updates: ['price', 'quantity'],
            proration_behavior: 'create_prorations',
            products: Object.values(createdProducts).map(product => ({
              product: product.id,
              prices: Object.values(prices)
                .filter(price => price.metadata?.niche === product.metadata?.niche)
                .map(price => price.id)
            }))
          },
        },
        display_name: 'Tango CRM Portal',
        metadata: {
          environment: process.env.NODE_ENV || 'development'
        }
      });

      console.log('✅ Created portal configuration:', portalConfig.id);
      console.log('🔗 Portal URL will be generated when customers access it');

    } catch (error) {
      console.log('⚠️  Portal configuration might already exist:', error.message);
    }

    // 4. Test portal session creation
    console.log('\n🧪 Testing portal session creation...');
    
    // Get a test customer or create one
    let testCustomer;
    try {
      const customers = await stripe.customers.list({ limit: 1 });
      if (customers.data.length > 0) {
        testCustomer = customers.data[0];
        console.log(`✅ Using existing test customer: ${testCustomer.id}`);
      } else {
        testCustomer = await stripe.customers.create({
          email: 'test@example.com',
          name: 'Test Customer',
          metadata: {
            test: 'true'
          }
        });
        console.log(`✅ Created test customer: ${testCustomer.id}`);
      }

      // Create a test portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: testCustomer.id,
        return_url: 'http://localhost:3000/dashboard/settings',
      });

      console.log('✅ Successfully created test portal session');
      console.log(`🔗 Test portal URL: ${session.url}`);
      console.log(`🆔 Session ID: ${session.id}`);

    } catch (error) {
      console.log('❌ Failed to create test portal session:', error.message);
    }

    console.log('\n🎉 Stripe Customer Portal setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Stripe Dashboard → Settings → Customer Portal');
    console.log('2. Verify the configuration settings');
    console.log('3. Test the portal with a real customer');
    console.log('4. Update your return URL to your production domain');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
if (require.main === module) {
  setupStripePortal();
}

module.exports = { setupStripePortal }; 