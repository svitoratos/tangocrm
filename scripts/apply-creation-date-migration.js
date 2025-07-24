const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://eitkqitreslouxyxmisn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpdGtxaXRyZXNsb3V4eXhtaXNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQyNzYwMSwiZXhwIjoyMDY4MDAzNjAxfQ.-xp_DD_gBTrJpl0pl0_2wb1ukx9X8F3BnyeSDzEW7vk';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyCreationDateMigration() {
  try {
    console.log('🚀 Applying creation date migration to content_items table...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'add_creation_date_to_content_items.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📖 Migration file loaded successfully');
    
    // Split the migration into individual statements
    const statements = migration
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          console.log(`SQL: ${statement}`);
          
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.log(`❌ Statement ${i + 1} failed:`, error.message);
            // Continue with next statement even if this one fails
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`❌ Statement ${i + 1} failed:`, err.message);
        }
      }
    }
    
    console.log('🎉 Creation date migration completed!');
    console.log('📋 Next steps:');
    console.log('1. Check your Supabase dashboard to verify the creation_date column was added');
    console.log('2. Restart your Next.js dev server');
    console.log('3. Test the creation date functionality');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
}

// Run the script
applyCreationDateMigration(); 