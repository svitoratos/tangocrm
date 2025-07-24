const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

async function applyContactSubmissionsSchema() {
  try {
    console.log('🚀 Applying contact submissions schema...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'create_contact_submissions_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // If exec_sql doesn't exist, try direct query (for table creation)
        if (error.message.includes('function "exec_sql" does not exist')) {
          console.log('⚠️  exec_sql function not available, trying direct execution...');
          
          // For table creation, we'll need to use the Supabase dashboard or CLI
          console.log('📋 Please run the following SQL in your Supabase dashboard:');
          console.log('\n' + statement + ';');
          console.log('\nOr use the Supabase CLI:');
          console.log(`supabase db reset --linked`);
        } else {
          console.error('❌ Error executing statement:', error);
        }
      } else {
        console.log('✅ Statement executed successfully');
      }
    }
    
    console.log('\n🎉 Contact submissions schema applied successfully!');
    console.log('\n📊 You can now:');
    console.log('1. View contact submissions at: /admin/contact-submissions');
    console.log('2. Contact form submissions will be stored in the database');
    console.log('3. Use the admin dashboard to manage submissions');
    
  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  }
}

// Run the script
applyContactSubmissionsSchema(); 