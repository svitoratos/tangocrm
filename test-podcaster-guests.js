// Test script to verify podcaster guests can be saved
const BASE_URL = 'http://localhost:3003';

async function testPodcasterGuests() {
  console.log('🧪 Testing Podcaster Guests API...');
  
  try {
    // Test GET clients for podcaster niche
    const getResponse = await fetch(`${BASE_URL}/api/clients?niche=podcaster`);
    console.log('📖 GET /api/clients?niche=podcaster status:', getResponse.status);
    if (getResponse.ok) {
      const clients = await getResponse.json();
      console.log('📖 Found podcaster clients:', clients.length);
      console.log('📖 Sample client:', clients[0]);
    }
    
    // Test POST a new podcaster guest
    const guestData = {
      name: 'Test Podcast Guest',
      email: 'guest@example.com',
      phone: '+1234567890',
      company: 'Test Podcast',
      status: 'guest',
      niche: 'podcaster',
      notes: 'Test guest for podcast episode'
    };
    
    console.log('📝 Attempting to create podcaster guest with data:', guestData);
    
    const postResponse = await fetch(`${BASE_URL}/api/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guestData)
    });
    
    console.log('📝 POST /api/clients status:', postResponse.status);
    if (postResponse.ok) {
      const newGuest = await postResponse.json();
      console.log('✅ Successfully created podcaster guest:', newGuest);
      
      // Test GET again to see if the guest appears
      const getResponse2 = await fetch(`${BASE_URL}/api/clients?niche=podcaster`);
      if (getResponse2.ok) {
        const updatedClients = await getResponse2.json();
        console.log('📖 Updated podcaster clients count:', updatedClients.length);
        
        // Find the guest we just created
        const createdGuest = updatedClients.find(c => c.name === 'Test Podcast Guest');
        if (createdGuest) {
          console.log('✅ Guest found in podcaster clients list:', createdGuest);
        } else {
          console.log('❌ Guest not found in podcaster clients list');
        }
      }
    } else {
      const errorText = await postResponse.text();
      console.error('❌ Failed to create podcaster guest:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Podcaster guests test failed:', error);
  }
}

async function runTest() {
  console.log('🚀 Starting podcaster guests test...\n');
  
  await testPodcasterGuests();
  
  console.log('\n✅ Podcaster guests test completed!');
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  runTest().catch(console.error);
}
