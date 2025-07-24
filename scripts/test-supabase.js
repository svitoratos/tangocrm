const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.log('Please check your .env.local file contains:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  console.log('✅ Environment variables found');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key: ${supabaseKey.substring(0, 20)}...\n`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test basic connection
    console.log('🔗 Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }

    console.log('✅ Connection successful!\n');

    // Test table access
    console.log('📊 Testing table access...');
    const tables = ['users', 'clients', 'deals', 'content', 'calendar_events', 'journal_entries', 'goals'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    console.log('\n🎉 Supabase setup test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSupabaseConnection(); 