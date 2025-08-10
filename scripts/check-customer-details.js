// Temporary script to check customer details for stephanosvitoratos13@gmail.com
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkCustomerDetails() {
  const customer1 = 'cus_SqGinoLf2I1sIv';
  const customer2 = 'cus_Spuu8oh2OJ9wRj';
  const email = 'stephanosvitoratos13@gmail.com';
  
  console.log('🔧 Checking customer details for:', email);
  console.log('Customer 1:', customer1);
  console.log('Customer 2:', customer2);
  
  try {
    // Get customer 1 details
    const cust1 = await stripe.customers.retrieve(customer1);
    console.log('\n=== Customer 1 Details ===');
    console.log('ID:', cust1.id);
    console.log('Email:', cust1.email);
    console.log('Created:', new Date(cust1.created * 1000).toISOString());
    console.log('Metadata:', cust1.metadata);
    
    // Get subscriptions for customer 1
    const subs1 = await stripe.subscriptions.list({ customer: customer1 });
    console.log('Active subscriptions:', subs1.data.length);
    subs1.data.forEach((sub, i) => {
      console.log(`  Sub ${i+1}:`, sub.id, sub.status, sub.metadata);
    });
    
    // Get customer 2 details
    const cust2 = await stripe.customers.retrieve(customer2);
    console.log('\n=== Customer 2 Details ===');
    console.log('ID:', cust2.id);
    console.log('Email:', cust2.email);
    console.log('Created:', new Date(cust2.created * 1000).toISOString());
    console.log('Metadata:', cust2.metadata);
    
    // Get subscriptions for customer 2
    const subs2 = await stripe.subscriptions.list({ customer: customer2 });
    console.log('Active subscriptions:', subs2.data.length);
    subs2.data.forEach((sub, i) => {
      console.log(`  Sub ${i+1}:`, sub.id, sub.status, sub.metadata);
    });
    
    console.log('\n=== Recommendation ===');
    console.log('Older customer (keep):', cust1.created < cust2.created ? customer1 : customer2);
    console.log('Newer customer (merge):', cust1.created < cust2.created ? customer2 : customer1);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCustomerDetails();