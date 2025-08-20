// Test script to verify journal and goals API endpoints
const BASE_URL = 'http://localhost:3000';

async function testJournalAPI() {
  console.log('🧪 Testing Journal API...');
  
  try {
    // Test GET journal entries
    const getResponse = await fetch(`${BASE_URL}/api/journal-entries?niche=creators`);
    console.log('📖 GET /api/journal-entries status:', getResponse.status);
    if (getResponse.ok) {
      const entries = await getResponse.json();
      console.log('📖 Found journal entries:', entries.length);
    }
    
    // Test POST journal entry
    const postData = {
      title: 'Test Journal Entry',
      content: 'This is a test journal entry',
      mood: 'happy',
      niche: 'creators'
    };
    
    const postResponse = await fetch(`${BASE_URL}/api/journal-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    
    console.log('📝 POST /api/journal-entries status:', postResponse.status);
    if (postResponse.ok) {
      const newEntry = await postResponse.json();
      console.log('📝 Created journal entry:', newEntry.id);
      
      // Test PUT journal entry
      const updateData = {
        title: 'Updated Test Journal Entry',
        content: 'This is an updated test journal entry',
        mood: 'excited',
        niche: 'creators'
      };
      
      const putResponse = await fetch(`${BASE_URL}/api/journal-entries/${newEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      console.log('✏️ PUT /api/journal-entries/[id] status:', putResponse.status);
      if (putResponse.ok) {
        const updatedEntry = await putResponse.json();
        console.log('✏️ Updated journal entry:', updatedEntry.title);
      }
      
      // Test DELETE journal entry
      const deleteResponse = await fetch(`${BASE_URL}/api/journal-entries/${newEntry.id}`, {
        method: 'DELETE'
      });
      
      console.log('🗑️ DELETE /api/journal-entries/[id] status:', deleteResponse.status);
      if (deleteResponse.ok) {
        console.log('🗑️ Deleted journal entry successfully');
      }
    }
  } catch (error) {
    console.error('❌ Journal API test failed:', error);
  }
}

async function testGoalsAPI() {
  console.log('\n🎯 Testing Goals API...');
  
  try {
    // Test GET goals
    const getResponse = await fetch(`${BASE_URL}/api/goals?niche=creators`);
    console.log('📖 GET /api/goals status:', getResponse.status);
    if (getResponse.ok) {
      const goals = await getResponse.json();
      console.log('📖 Found goals:', goals.length);
    }
    
    // Test POST goal
    const postData = {
      title: 'Test Goal',
      description: 'This is a test goal',
      status: 'active',
      category: 'personal',
      niche: 'creators'
    };
    
    const postResponse = await fetch(`${BASE_URL}/api/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    
    console.log('🎯 POST /api/goals status:', postResponse.status);
    if (postResponse.ok) {
      const newGoal = await postResponse.json();
      console.log('🎯 Created goal:', newGoal.id);
      
      // Test PUT goal
      const updateData = {
        title: 'Updated Test Goal',
        description: 'This is an updated test goal',
        status: 'completed',
        category: 'personal',
        niche: 'creators'
      };
      
      const putResponse = await fetch(`${BASE_URL}/api/goals/${newGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      console.log('✏️ PUT /api/goals/[id] status:', putResponse.status);
      if (putResponse.ok) {
        const updatedGoal = await putResponse.json();
        console.log('✏️ Updated goal:', updatedGoal.title);
      }
      
      // Test DELETE goal
      const deleteResponse = await fetch(`${BASE_URL}/api/goals/${newGoal.id}`, {
        method: 'DELETE'
      });
      
      console.log('🗑️ DELETE /api/goals/[id] status:', deleteResponse.status);
      if (deleteResponse.ok) {
        console.log('🗑️ Deleted goal successfully');
      }
    }
  } catch (error) {
    console.error('❌ Goals API test failed:', error);
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  await testJournalAPI();
  await testGoalsAPI();
  
  console.log('\n✅ API tests completed!');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}
