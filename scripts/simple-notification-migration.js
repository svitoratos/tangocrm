require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySimpleMigration() {
  console.log('🔧 Applying simple notification preferences migration...\n');

  try {
    // First, let's check the current table structure
    console.log('🔍 Checking current table structure...');
    
    const { data: currentColumns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'users')
      .order('column_name');

    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError);
    } else {
      console.log('📊 Current users table columns:');
      console.table(currentColumns);
    }

    // Check if the columns already exist
    const hasEmailNotifications = currentColumns?.some(col => col.column_name === 'email_notifications_enabled');
    const hasNotificationPreferences = currentColumns?.some(col => col.column_name === 'notification_preferences');

    console.log('\n🔍 Column existence check:');
    console.log(`- email_notifications_enabled: ${hasEmailNotifications ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`- notification_preferences: ${hasNotificationPreferences ? '✅ EXISTS' : '❌ MISSING'}`);

    if (hasEmailNotifications && hasNotificationPreferences) {
      console.log('\n✅ All notification columns already exist!');
      
      // Check existing users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, email_notifications_enabled, notification_preferences')
        .limit(5);

      if (usersError) {
        console.error('❌ Error checking users:', usersError);
      } else {
        console.log('\n👥 Sample users with notification preferences:');
        console.table(users);
      }
      
      return;
    }

    console.log('\n⚠️ Note: This script can only verify existing columns.');
    console.log('   To add new columns, you need to run the SQL directly in your Supabase dashboard:');
    console.log('\n📝 SQL to run in Supabase SQL Editor:');
    console.log(`
-- Add notification preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true}'::jsonb;

-- Update existing users
UPDATE users 
SET 
  email_notifications_enabled = true,
  notification_preferences = '{"email": true}'::jsonb
WHERE email_notifications_enabled IS NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_email_notifications_enabled 
ON users(email_notifications_enabled);
    `);

    console.log('\n🔧 After running the SQL, you can verify with this script again.');
    console.log('📋 The application will work with default values until the columns are added.');

  } catch (error) {
    console.error('❌ Migration check failed:', error);
  }
}

async function testNotificationAPI() {
  console.log('\n🧪 Testing notification API functionality...\n');

  try {
    // Get a sample user
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.log('❌ No users found to test with');
      return;
    }

    const testUser = users[0];
    console.log(`👤 Testing with user: ${testUser.email} (${testUser.id})`);

    // Test updating notification preferences
    const testPreferences = {
      email_notifications_enabled: true,
      notification_preferences: { email: true }
    };

    console.log('📝 Testing notification preferences update...');
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(testPreferences)
      .eq('id', testUser.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Error updating notification preferences:', updateError.message);
      
      if (updateError.message.includes('column "email_notifications_enabled" does not exist')) {
        console.log('💡 This confirms the columns need to be added via SQL migration.');
      }
    } else {
      console.log('✅ Successfully updated notification preferences:');
      console.log('   - email_notifications_enabled:', updatedUser.email_notifications_enabled);
      console.log('   - notification_preferences:', updatedUser.notification_preferences);
    }

  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

async function main() {
  await applySimpleMigration();
  await testNotificationAPI();
}

main().catch(console.error); 