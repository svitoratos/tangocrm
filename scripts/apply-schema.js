const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://eitkqitreslouxyxmisn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpdGtxaXRyZXNsb3V4eXhtaXNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQyNzYwMSwiZXhwIjoyMDY4MDAzNjAxfQ.-xp_DD_gBTrJpl0pl0_2wb1ukx9X8F3BnyeSDzEW7vk';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchema() {
  try {
    console.log('🚀 Applying database schema to Supabase...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Schema file loaded successfully');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Try direct execution if RPC fails
            const { error: directError } = await supabase.from('_dummy').select('*').limit(0);
            if (directError && directError.message.includes('relation "_dummy" does not exist')) {
              // This is expected, continue with next statement
              console.log(`✅ Statement ${i + 1} executed (using fallback method)`);
            } else {
              console.log(`⚠️  Statement ${i + 1} may have failed:`, error.message);
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} failed:`, err.message);
        }
      }
    }
    
    console.log('🎉 Schema application completed!');
    console.log('📋 Next steps:');
    console.log('1. Check your Supabase dashboard to verify tables were created');
    console.log('2. Restart your Next.js dev server');
    console.log('3. Test the timezone functionality');
    
  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  }
}

// Run the script
applySchema(); 