// Test script to verify journal/goals niche mapping fix
const BASE_URL = 'http://localhost:3003';

// Map plural niche forms to singular forms for API calls
const mapNicheToApiFormat = (niche) => {
  const nicheMap = {
    'creators': 'creator',
    'podcasters': 'podcaster',
    'freelancers': 'freelancer',
    'coaches': 'coach'
  };
  return nicheMap[niche] || niche;
};

async function testNicheMapping() {
  console.log('🧪 Testing Niche Mapping Fix...\n');
  
  const testNiches = ['creators', 'podcasters', 'freelancers', 'coaches'];
  
  for (const niche of testNiches) {
    const apiNiche = mapNicheToApiFormat(niche);
    console.log(`📋 Testing niche mapping: ${niche} -> ${apiNiche}`);
    
    try {
      // Test journal entries API
      const journalResponse = await fetch(`${BASE_URL}/api/journal-entries?niche=${apiNiche}`);
      console.log(`   Journal API status: ${journalResponse.status}`);
      
      // Test goals API
      const goalsResponse = await fetch(`${BASE_URL}/api/goals?niche=${apiNiche}`);
      console.log(`   Goals API status: ${goalsResponse.status}`);
      
      if (journalResponse.ok && goalsResponse.ok) {
        console.log(`   ✅ ${niche} -> ${apiNiche} mapping works correctly`);
      } else {
        console.log(`   ❌ ${niche} -> ${apiNiche} mapping has issues`);
      }
    } catch (error) {
      console.log(`   ❌ Error testing ${niche}:`, error.message);
    }
  }
}

async function testJournalCreation() {
  console.log('\n🧪 Testing Journal Entry Creation...\n');
  
  const testData = {
    title: 'Test Journal Entry',
    content: 'This is a test journal entry to verify niche mapping',
    mood: 'reflective',
    niche: 'creator', // Use singular form for API
    tags: ['creator']
  };
  
  try {
    console.log('📝 Creating test journal entry with data:', testData);
    
    const response = await fetch(`${BASE_URL}/api/journal-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    console.log('📝 POST /api/journal-entries status:', response.status);
    
    if (response.ok) {
      const newEntry = await response.json();
      console.log('✅ Journal entry created successfully:', newEntry.id);
      
      // Test retrieval
      const getResponse = await fetch(`${BASE_URL}/api/journal-entries?niche=creator`);
      if (getResponse.ok) {
        const entries = await getResponse.json();
        const foundEntry = entries.find(e => e.id === newEntry.id);
        if (foundEntry) {
          console.log('✅ Journal entry found in retrieval');
        } else {
          console.log('❌ Journal entry not found in retrieval');
        }
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to create journal entry:', errorText);
    }
  } catch (error) {
    console.error('❌ Journal creation test failed:', error);
  }
}

async function testGoalCreation() {
  console.log('\n🧪 Testing Goal Entry Creation...\n');
  
  const testData = {
    title: 'Test Goal',
    description: 'This is a test goal to verify niche mapping',
    status: 'active',
    category: 'personal',
    niche: 'creator', // Use singular form for API
    target_value: 100,
    current_value: 0
  };
  
  try {
    console.log('🎯 Creating test goal with data:', testData);
    
    const response = await fetch(`${BASE_URL}/api/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    console.log('🎯 POST /api/goals status:', response.status);
    
    if (response.ok) {
      const newGoal = await response.json();
      console.log('✅ Goal created successfully:', newGoal.id);
      
      // Test retrieval
      const getResponse = await fetch(`${BASE_URL}/api/goals?niche=creator`);
      if (getResponse.ok) {
        const goals = await getResponse.json();
        const foundGoal = goals.find(g => g.id === newGoal.id);
        if (foundGoal) {
          console.log('✅ Goal found in retrieval');
        } else {
          console.log('❌ Goal not found in retrieval');
        }
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to create goal:', errorText);
    }
  } catch (error) {
    console.error('❌ Goal creation test failed:', error);
  }
}

async function runTests() {
  console.log('🚀 Starting Niche Mapping Fix Tests...\n');
  
  await testNicheMapping();
  await testJournalCreation();
  await testGoalCreation();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📋 Summary:');
  console.log('   - Niche mapping should convert plural forms to singular');
  console.log('   - Journal entries should save and retrieve correctly');
  console.log('   - Goals should save and retrieve correctly');
  console.log('   - Data should persist when navigating between sections');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}
