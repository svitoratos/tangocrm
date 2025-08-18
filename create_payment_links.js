// Script to create Stripe payment links for Tango Core
// Run this with: node create_payment_links.js

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function createPaymentLinks() {
  try {
    console.log('🔧 Creating Stripe payment links for Tango Core...');
    
    // Monthly payment link
    const monthlyLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: 'price_1Rt8u9IvVfTNGbwuoAxHpYSj', // Monthly
          quantity: 1,
        },
      ],
      after_completion: { type: 'redirect', redirect: { url: 'https://www.gotangocrm.com/payment-success' } },
    });
    
    console.log('✅ Monthly payment link:', monthlyLink.url);
    
    // Yearly payment link
    const yearlyLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: 'price_1Rt8u9IvVfTNGbwug424qIjh', // Yearly
          quantity: 1,
        },
      ],
      after_completion: { type: 'redirect', redirect: { url: 'https://www.gotangocrm.com/payment-success' } },
    });
    
    console.log('✅ Yearly payment link:', yearlyLink.url);
    
    console.log('\n📋 Payment Links for Tango Core:');
    console.log('Monthly:', monthlyLink.url);
    console.log('Yearly:', yearlyLink.url);
    
  } catch (error) {
    console.error('❌ Error creating payment links:', error);
  }
}

createPaymentLinks();
