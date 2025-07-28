const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseConnection() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Check environment variables
    console.log('\n🔧 Environment Check:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
    
    // Test basic connection
    console.log('\n🔗 Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Test users table
    console.log('\n👥 Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Users table query failed:', usersError);
      return;
    }
    
    console.log(`✅ Users table accessible, found ${users.length} users`);
    
    // Test inserting a test user
    console.log('\n📝 Testing user insertion...');
    const testUserId = 'test_user_' + Date.now();
    const testUserData = {
      id: testUserId,
      email: 'test@example.com',
      onboarding_completed: true,
      primary_niche: 'creator',
      niches: ['creator'],
      subscription_status: 'trialing',
      subscription_tier: 'core'
    };
    
    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .upsert(testUserData)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ User insertion failed:', insertError);
      console.error('❌ Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return;
    }
    
    console.log('✅ User insertion successful:', insertedUser);
    
    // Clean up test user
    console.log('\n🧹 Cleaning up test user...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', testUserId);
    
    if (deleteError) {
      console.error('❌ Test user cleanup failed:', deleteError);
    } else {
      console.log('✅ Test user cleaned up successfully');
    }
    
    // Check table schema
    console.log('\n📋 Checking table schema...');
    const { data: columns, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' })
      .catch(() => ({ data: null, error: { message: 'RPC function not available' } }));
    
    if (schemaError) {
      console.log('⚠️  Could not check schema via RPC, but table is accessible');
    } else {
      console.log('✅ Table schema check successful');
    }
    
    console.log('\n✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log('\n✅ Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }); 