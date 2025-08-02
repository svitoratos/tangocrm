require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testPaymentStatusAPI() {
  console.log('🧪 Testing Payment Status API...\n');

  try {
    // Test the regular payment status endpoint
    console.log('📋 Testing /api/user/payment-status...');
    
    const response = await fetch('https://tangocrm-8xmmuytr1-svitoratos-projects.vercel.app/api/user/payment-status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Payment Status API Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Payment Status API failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }

    console.log('\n📋 Testing force refresh endpoint...');
    
    const forceResponse = await fetch('https://tangocrm-8xmmuytr1-svitoratos-projects.vercel.app/api/user/force-refresh-payment-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache'
    });

    if (forceResponse.ok) {
      const forceData = await forceResponse.json();
      console.log('✅ Force Refresh API Response:');
      console.log(JSON.stringify(forceData, null, 2));
    } else {
      console.error('❌ Force Refresh API failed:', forceResponse.status, forceResponse.statusText);
      const errorText = await forceResponse.text();
      console.error('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testPaymentStatusAPI(); 