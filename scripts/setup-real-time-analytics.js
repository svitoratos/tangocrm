const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupRealTimeAnalytics() {
  console.log('🚀 Setting up Real-Time Analytics for Tango CRM...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'real_time_analytics_triggers.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📋 Applying real-time analytics triggers...');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error executing statement: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error executing statement: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Successfully executed ${successCount} statements`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} statements had errors (some may already exist)`);
    }

    // Verify setup
    console.log('\n🔍 Verifying setup...');
    
    // Check if analytics_cache table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'analytics_cache');

    if (tableError) {
      console.error('❌ Error checking tables:', tableError.message);
    } else if (tables && tables.length > 0) {
      console.log('✅ Analytics cache table created successfully');
    } else {
      console.log('❌ Analytics cache table not found');
    }

    // Check if triggers exist
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name')
      .like('trigger_name', '%analytics%');

    if (triggerError) {
      console.error('❌ Error checking triggers:', triggerError.message);
    } else if (triggers && triggers.length > 0) {
      console.log(`✅ Found ${triggers.length} analytics triggers:`);
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name}`);
      });
    } else {
      console.log('❌ No analytics triggers found');
    }

    // Initialize analytics cache for existing users
    console.log('\n🔄 Initializing analytics cache for existing users...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, niche');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else if (users && users.length > 0) {
      console.log(`📊 Found ${users.length} users to initialize`);
      
      let initCount = 0;
      for (const user of users) {
        try {
          // Initialize cache for each user
          await supabase.rpc('initialize_user_analytics_cache', {
            user_id: user.id,
            user_niche: user.niche || 'creator'
          });
          initCount++;
        } catch (err) {
          console.error(`❌ Error initializing cache for user ${user.id}:`, err.message);
        }
      }
      
      console.log(`✅ Initialized analytics cache for ${initCount} users`);
    }

    console.log('\n🎉 Real-Time Analytics setup completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Restart your Next.js development server');
    console.log('   2. Test the analytics dashboard with real data');
    console.log('   3. Monitor the real-time updates in the browser console');
    console.log('   4. Check the analytics_cache table for cached data');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Helper function to initialize user analytics cache
async function createInitializeFunction() {
  const initFunction = `
    CREATE OR REPLACE FUNCTION initialize_user_analytics_cache(user_id TEXT, user_niche TEXT)
    RETURNS void AS $$
    BEGIN
      -- Initialize opportunities analytics
      PERFORM update_opportunities_analytics();
      
      -- Initialize clients analytics
      PERFORM update_clients_analytics();
      
      -- Initialize revenue analytics
      PERFORM update_revenue_analytics();
      
      -- Initialize content analytics
      PERFORM update_content_analytics();
      
      RAISE NOTICE 'Analytics cache initialized for user % with niche %', user_id, user_niche;
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: initFunction });
    if (error) {
      console.error('❌ Error creating initialize function:', error.message);
    } else {
      console.log('✅ Analytics cache initialization function created');
    }
  } catch (err) {
    console.error('❌ Error creating initialize function:', err.message);
  }
}

// Run setup
if (require.main === module) {
  setupRealTimeAnalytics()
    .then(() => {
      console.log('\n✨ Setup script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup script failed:', error);
      process.exit(1);
    });
}

module.exports = { setupRealTimeAnalytics, createInitializeFunction }; 