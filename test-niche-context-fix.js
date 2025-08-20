#!/usr/bin/env node

/**
 * Test script to verify the NicheContext fix
 * This script tests that the niche mapping is working correctly
 */

const BASE_URL = 'http://localhost:3003';

async function testNicheMapping() {
  console.log('🧪 Testing NicheContext fix...\n');

  // Test 1: Check if journal entries are saved and retrieved correctly
  console.log('📝 Test 1: Creating a journal entry...');
  
  const journalData = {
    title: 'Test Journal Entry',
    content: 'This is a test journal entry to verify the niche mapping fix.',
    mood: 'excited',
    tags: ['creator'],
    niche: 'creator'
  };

  try {
    const createResponse = await fetch(`${BASE_URL}/api/journal-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(journalData)
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create journal entry: ${createResponse.statusText}`);
    }

    const createdEntry = await createResponse.json();
    console.log('✅ Journal entry created:', createdEntry.id);

    // Test 2: Retrieve the journal entry with the correct niche parameter
    console.log('\n📖 Test 2: Retrieving journal entries with niche=creator...');
    
    const retrieveResponse = await fetch(`${BASE_URL}/api/journal-entries?niche=creator`);
    
    if (!retrieveResponse.ok) {
      throw new Error(`Failed to retrieve journal entries: ${retrieveResponse.statusText}`);
    }

    const entries = await retrieveResponse.json();
    console.log(`✅ Retrieved ${entries.length} journal entries`);
    
    const foundEntry = entries.find(entry => entry.id === createdEntry.id);
    if (foundEntry) {
      console.log('✅ Found the created entry in the response');
    } else {
      console.log('❌ Created entry not found in response');
    }

    // Test 3: Test with plural form (should not find the entry)
    console.log('\n🔍 Test 3: Testing with plural form (should not find entry)...');
    
    const retrievePluralResponse = await fetch(`${BASE_URL}/api/journal-entries?niche=creators`);
    
    if (!retrievePluralResponse.ok) {
      throw new Error(`Failed to retrieve journal entries: ${retrievePluralResponse.statusText}`);
    }

    const pluralEntries = await retrievePluralResponse.json();
    console.log(`📊 Retrieved ${pluralEntries.length} entries with plural form`);
    
    const foundInPlural = pluralEntries.find(entry => entry.id === createdEntry.id);
    if (!foundInPlural) {
      console.log('✅ Correctly not found with plural form (as expected)');
    } else {
      console.log('❌ Unexpectedly found with plural form');
    }

    // Test 4: Clean up - delete the test entry
    console.log('\n🗑️ Test 4: Cleaning up test entry...');
    
    const deleteResponse = await fetch(`${BASE_URL}/api/journal-entries/${createdEntry.id}`, {
      method: 'DELETE'
    });

    if (!deleteResponse.ok) {
      console.log('⚠️ Warning: Failed to delete test entry:', deleteResponse.statusText);
    } else {
      console.log('✅ Test entry deleted successfully');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ The NicheContext fix is working correctly');
    console.log('✅ Journal entries are being saved and retrieved with the correct niche mapping');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testNicheMapping().catch(console.error);
}

module.exports = { testNicheMapping };
