require('dotenv').config({ path: '.env.local' });

async function testNotificationsAPI() {
  console.log('🧪 Testing Notifications API...\n');

  try {
    // Test GET request
    console.log('📝 Testing GET /api/user/notifications...');
    
    const getResponse = await fetch('http://localhost:3001/api/user/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('GET Response status:', getResponse.status);
    console.log('GET Response headers:', Object.fromEntries(getResponse.headers.entries()));

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('GET Response data:', getData);
    } else {
      const errorText = await getResponse.text();
      console.log('GET Error response:', errorText);
    }

    console.log('\n' + '─'.repeat(50) + '\n');

    // Test PUT request
    console.log('📝 Testing PUT /api/user/notifications...');
    
    const putResponse = await fetch('http://localhost:3001/api/user/notifications', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: true }),
    });

    console.log('PUT Response status:', putResponse.status);
    console.log('PUT Response headers:', Object.fromEntries(putResponse.headers.entries()));

    if (putResponse.ok) {
      const putData = await putResponse.json();
      console.log('PUT Response data:', putData);
    } else {
      const errorText = await putResponse.text();
      console.log('PUT Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNotificationsAPI().catch(console.error); 