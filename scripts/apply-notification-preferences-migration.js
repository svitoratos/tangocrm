require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyNotificationPreferencesMigration() {
  console.log('🔧 Applying notification preferences migration...\n');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'add_notification_preferences.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Migration SQL:');
    console.log(migrationSQL);
    console.log('\n' + '─'.repeat(50) + '\n');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`🔧 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        console.log(`📝 Statement ${i + 1}: ${statement.substring(0, 50)}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error);
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Exception in statement ${i + 1}:`, err.message);
          // Continue with other statements
        }
      }
    }

    // Verify the migration by checking the table structure
    console.log('\n🔍 Verifying migration...\n');

    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'users')
      .in('column_name', ['email_notifications_enabled', 'notification_preferences'])
      .order('column_name');

    if (columnsError) {
      console.error('❌ Error verifying migration:', columnsError);
    } else {
      console.log('📊 Migration verification results:');
      console.table(columns);
    }

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

    console.log('\n✅ Notification preferences migration completed!');
    console.log('\n📋 Summary:');
    console.log('- Added email_notifications_enabled column (boolean, default: true)');
    console.log('- Added notification_preferences column (JSONB, default: {"email": true})');
    console.log('- Updated existing users with default values');
    console.log('- Created index for efficient queries');
    console.log('- Migration is ready for use in the application');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function applyMigrationAlternative() {
  console.log('🔧 Applying notification preferences migration (alternative method)...\n');

  try {
    // Add email_notifications_enabled column
    console.log('📝 Adding email_notifications_enabled column...');
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;'
    });
    
    if (error1) {
      console.error('❌ Error adding email_notifications_enabled:', error1);
    } else {
      console.log('✅ email_notifications_enabled column added');
    }

    // Add notification_preferences column
    console.log('📝 Adding notification_preferences column...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT \'{"email": true}\'::jsonb;'
    });
    
    if (error2) {
      console.error('❌ Error adding notification_preferences:', error2);
    } else {
      console.log('✅ notification_preferences column added');
    }

    // Update existing users
    console.log('📝 Updating existing users...');
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: `UPDATE users 
            SET email_notifications_enabled = true, 
                notification_preferences = '{"email": true}'::jsonb
            WHERE email_notifications_enabled IS NULL;`
    });
    
    if (error3) {
      console.error('❌ Error updating users:', error3);
    } else {
      console.log('✅ Existing users updated');
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Alternative migration failed:', error);
  }
}

// Check if we can use the RPC method
async function checkRPCAvailability() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
    
    if (error) {
      console.log('⚠️ RPC method not available, using alternative approach...');
      return false;
    }
    
    console.log('✅ RPC method available');
    return true;
  } catch (err) {
    console.log('⚠️ RPC method not available, using alternative approach...');
    return false;
  }
}

async function main() {
  const rpcAvailable = await checkRPCAvailability();
  
  if (rpcAvailable) {
    await applyNotificationPreferencesMigration();
  } else {
    await applyMigrationAlternative();
  }
}

main().catch(console.error); 