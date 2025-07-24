const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyActivityMigration() {
  try {
    console.log('🚀 Starting opportunity activities table migration...');
    
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '..', 'create_opportunity_activities_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL migration content:');
    console.log(sqlContent);
    
    // Execute the SQL migration
    console.log('⚡ Executing SQL migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error executing migration:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration executed successfully!');
    console.log('📊 Migration result:', data);
    
    // Verify the table was created
    console.log('🔍 Verifying table creation...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('opportunity_activities')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error verifying table:', tableError);
      process.exit(1);
    }
    
    console.log('✅ Table verification successful!');
    console.log('📋 Table structure verified');
    
    // Test inserting a sample activity
    console.log('🧪 Testing activity insertion...');
    const { data: testActivity, error: insertError } = await supabase
      .from('opportunity_activities')
      .insert({
        opportunity_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        type: 'created',
        description: 'Test activity for migration verification',
        metadata: { test: true }
      })
      .select();
    
    if (insertError) {
      console.error('❌ Error testing activity insertion:', insertError);
      process.exit(1);
    }
    
    console.log('✅ Activity insertion test successful!');
    console.log('📝 Test activity created:', testActivity);
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('opportunity_activities')
      .delete()
      .eq('description', 'Test activity for migration verification');
    
    if (deleteError) {
      console.error('⚠️ Warning: Could not clean up test data:', deleteError);
    } else {
      console.log('✅ Test data cleaned up successfully!');
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log('📋 Opportunity activities table is ready for use.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
applyActivityMigration(); 