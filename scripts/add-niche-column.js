const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addNicheColumn() {
  console.log('🚀 Adding niche column to clients table...');
  
  try {
    // First, let's check the current table structure
    console.log('📝 Checking current table structure...');
    const { data: sampleData, error: checkError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error checking table structure:', checkError);
      return;
    }

    console.log('✅ Current table structure:', Object.keys(sampleData[0] || {}));

    // Since we can't add columns directly through the client, let's provide instructions
    console.log('\n📋 MANUAL MIGRATION REQUIRED');
    console.log('================================');
    console.log('The niche column needs to be added manually in the Supabase dashboard.');
    console.log('\n📝 Steps to add the niche column:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Database > Tables');
    console.log('3. Find the "clients" table');
    console.log('4. Click "Edit table"');
    console.log('5. Add a new column with these settings:');
    console.log('   - Name: niche');
    console.log('   - Type: text');
    console.log('   - Default value: creator');
    console.log('   - Is Nullable: false');
    console.log('6. Save the changes');
    console.log('\n🔗 Supabase Dashboard URL:');
    console.log(`   ${supabaseUrl.replace('https://', 'https://app.supabase.com/project/')}`);
    
    console.log('\n📋 After adding the column, run this script again to update existing data.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
addNicheColumn(); 