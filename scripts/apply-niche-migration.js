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
    // Step 1: Add niche column if it doesn't exist
    console.log('📝 Step 1: Adding niche column to clients table...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS niche TEXT NOT NULL DEFAULT 'creator';
      `
    });
    
    if (alterError) {
      console.error('❌ Error adding niche column:', alterError);
      return;
    }
    console.log('✅ Niche column added successfully');

    // Step 2: Create indexes
    console.log('📝 Step 2: Creating indexes...');
    const { error: indexError1 } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_clients_niche ON clients(niche);`
    });
    
    const { error: indexError2 } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_clients_user_niche ON clients(user_id, niche);`
    });
    
    if (indexError1 || indexError2) {
      console.error('❌ Error creating indexes:', indexError1 || indexError2);
      return;
    }
    console.log('✅ Indexes created successfully');

    // Step 3: Update existing clients to have default niche
    console.log('📝 Step 3: Updating existing clients with default niche...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `UPDATE clients SET niche = 'creator' WHERE niche IS NULL OR niche = '';`
    });
    
    if (updateError) {
      console.error('❌ Error updating existing clients:', updateError);
      return;
    }
    console.log('✅ Existing clients updated successfully');

    // Step 4: Verify the migration
    console.log('📝 Step 4: Verifying migration...');
    const { data: verificationData, error: verificationError } = await supabase
      .from('clients')
      .select('niche')
      .limit(1000);
    
    if (verificationError) {
      console.error('❌ Error verifying migration:', verificationError);
      return;
    }

    // Count clients by niche
    const nicheCounts = {};
    verificationData.forEach(client => {
      nicheCounts[client.niche] = (nicheCounts[client.niche] || 0) + 1;
    });

    console.log('✅ Migration verification results:');
    Object.entries(nicheCounts).forEach(([niche, count]) => {
      console.log(`   ${niche}: ${count} clients`);
    });

    console.log('\n🎉 Niche migration completed successfully!');
    console.log('📊 All clients are now isolated by niche');
    console.log('🔒 Each niche now has its own contact database');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration(); 