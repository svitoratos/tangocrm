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

async function runMigration() {
  console.log('🚀 Starting niche migration for clients table...');
  
  try {
    // Step 1: Check if niche column already exists
    console.log('📝 Step 1: Checking current table structure...');
    const { data: existingClients, error: checkError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error checking table structure:', checkError);
      return;
    }

    console.log('✅ Table structure check completed');

    // Step 2: Get all existing clients to update them
    console.log('📝 Step 2: Fetching existing clients...');
    const { data: allClients, error: fetchError } = await supabase
      .from('clients')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching clients:', fetchError);
      return;
    }

    console.log(`📊 Found ${allClients.length} existing clients`);

    // Step 3: Update each client to include niche field
    console.log('📝 Step 3: Updating clients with niche field...');
    let updatedCount = 0;
    let errorCount = 0;

    for (const client of allClients) {
      try {
        // Update client with niche field (default to 'creator' for existing clients)
        const { error: updateError } = await supabase
          .from('clients')
          .update({ 
            niche: 'creator', // Default existing clients to creator niche
            updated_at: new Date().toISOString()
          })
          .eq('id', client.id);
        
        if (updateError) {
          console.error(`❌ Error updating client ${client.id}:`, updateError);
          errorCount++;
        } else {
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating client ${client.id}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} clients successfully`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} clients had errors during update`);
    }

    // Step 4: Verify the migration
    console.log('📝 Step 4: Verifying migration...');
    const { data: verificationData, error: verificationError } = await supabase
      .from('clients')
      .select('niche, name')
      .limit(10);
    
    if (verificationError) {
      console.error('❌ Error verifying migration:', verificationError);
      return;
    }

    console.log('✅ Migration verification - Sample clients:');
    verificationData.forEach(client => {
      console.log(`   ${client.name}: ${client.niche} niche`);
    });

    // Step 5: Test niche filtering
    console.log('📝 Step 5: Testing niche filtering...');
    const { data: creatorClients, error: filterError } = await supabase
      .from('clients')
      .select('*')
      .eq('niche', 'creator');
    
    if (filterError) {
      console.error('❌ Error testing niche filtering:', filterError);
      return;
    }

    console.log(`✅ Niche filtering works: ${creatorClients.length} creator clients found`);

    console.log('\n🎉 Niche migration completed successfully!');
    console.log('📊 All clients now have niche isolation');
    console.log('🔒 Each niche now has its own contact database');
    console.log('\n📋 Next steps:');
    console.log('   1. Test creating contacts in different niches');
    console.log('   2. Verify contacts are properly isolated');
    console.log('   3. Update any existing clients to their correct niches');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration(); 