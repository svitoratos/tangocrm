const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://eitkqitreslouxyxmisn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpdGtxaXRyZXNsb3V4eXhtaXNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQyNzYwMSwiZXhwIjoyMDY4MDAzNjAxfQ.-xp_DD_gBTrJpl0pl0_2wb1ukx9X8F3BnyeSDzEW7vk';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function renameDealsToOpportunities() {
  try {
    console.log('🚀 Renaming deals table to opportunities...');
    
    // Step 1: Rename the table
    console.log('📝 Step 1: Renaming table...');
    const { error: renameError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE deals RENAME TO opportunities;' 
    });
    
    if (renameError) {
      console.log('⚠️  Table rename may have failed, trying alternative method...');
      // Try using a different approach - we'll need to handle this manually
      console.log('Please run the following SQL in your Supabase SQL editor:');
      console.log('ALTER TABLE deals RENAME TO opportunities;');
    } else {
      console.log('✅ Table renamed successfully');
    }
    
    // Step 2: Update calendar_events table
    console.log('📝 Step 2: Updating calendar_events table...');
    const { error: calendarError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE calendar_events RENAME COLUMN deal_id TO opportunity_id;' 
    });
    
    if (calendarError) {
      console.log('⚠️  Calendar table update may have failed');
      console.log('Please run the following SQL in your Supabase SQL editor:');
      console.log('ALTER TABLE calendar_events RENAME COLUMN deal_id TO opportunity_id;');
    } else {
      console.log('✅ Calendar table updated successfully');
    }
    
    console.log('🎉 Migration completed!');
    console.log('📋 Next steps:');
    console.log('1. Check your Supabase dashboard to verify the table was renamed');
    console.log('2. Restart your Next.js dev server');
    console.log('3. Test the opportunities functionality');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    console.log('Please run the following SQL commands manually in your Supabase SQL editor:');
    console.log('1. ALTER TABLE deals RENAME TO opportunities;');
    console.log('2. ALTER TABLE calendar_events RENAME COLUMN deal_id TO opportunity_id;');
    process.exit(1);
  }
}

// Run the script
renameDealsToOpportunities(); 