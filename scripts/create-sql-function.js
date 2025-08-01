const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSQLFunction() {
  console.log('🚀 Creating custom SQL function...');
  
  try {
    // Try to create a custom function that can execute DDL
    console.log('📝 Creating exec_sql function...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;
    
    // Try using the REST API directly to create the function
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: createFunctionSQL
      })
    });
    
    if (!response.ok) {
      console.log('❌ Could not create function via REST API');
      
      // Try alternative approach - create a migration file
      console.log('📝 Creating migration file instead...');
      
      const migrationContent = `
-- Migration: Add niche column to clients table
-- Run this in your Supabase SQL editor

-- Step 1: Add the niche column
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS niche TEXT NOT NULL DEFAULT 'creator';

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_niche ON public.clients(niche);
CREATE INDEX IF NOT EXISTS idx_clients_user_niche ON public.clients(user_id, niche);

-- Step 3: Update existing clients to have the default niche
UPDATE public.clients SET niche = 'creator' WHERE niche IS NULL OR niche = '';

-- Step 4: Add constraints
ALTER TABLE public.clients ADD CONSTRAINT IF NOT EXISTS clients_niche_not_empty CHECK (niche != '');
ALTER TABLE public.clients ADD CONSTRAINT IF NOT EXISTS clients_niche_valid CHECK (niche IN ('creator', 'coach', 'podcaster', 'freelancer'));

-- Step 5: Verify the migration
SELECT 
    niche,
    COUNT(*) as client_count
FROM public.clients 
GROUP BY niche 
ORDER BY niche;
      `;
      
      const fs = require('fs');
      fs.writeFileSync('supabase-migration.sql', migrationContent);
      
      console.log('✅ Created migration file: supabase-migration.sql');
      console.log('\n📋 Next steps:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of supabase-migration.sql');
      console.log('4. Click "Run" to execute the migration');
      console.log('\n🔗 Supabase Dashboard: https://app.supabase.com/project/eitkqitreslouxyxmisn.supabase.co');
      
      return;
    }
    
    console.log('✅ Function created successfully!');
    
    // Now try to use the function to add the column
    console.log('📝 Using function to add niche column...');
    
    const { data: alterResult, error: alterError } = await supabase
      .rpc('exec_sql', {
        sql: 'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS niche TEXT NOT NULL DEFAULT \'creator\';'
      });
    
    if (alterError) {
      console.error('❌ Error adding column:', alterError);
    } else {
      console.log('✅ Niche column added successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n📋 Creating migration file as fallback...');
    
    const migrationContent = `
-- Migration: Add niche column to clients table
-- Run this in your Supabase SQL editor

-- Step 1: Add the niche column
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS niche TEXT NOT NULL DEFAULT 'creator';

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_niche ON public.clients(niche);
CREATE INDEX IF NOT EXISTS idx_clients_user_niche ON public.clients(user_id, niche);

-- Step 3: Update existing clients to have the default niche
UPDATE public.clients SET niche = 'creator' WHERE niche IS NULL OR niche = '';

-- Step 4: Add constraints
ALTER TABLE public.clients ADD CONSTRAINT IF NOT EXISTS clients_niche_not_empty CHECK (niche != '');
ALTER TABLE public.clients ADD CONSTRAINT IF NOT EXISTS clients_niche_valid CHECK (niche IN ('creator', 'coach', 'podcaster', 'freelancer'));

-- Step 5: Verify the migration
SELECT 
    niche,
    COUNT(*) as client_count
FROM public.clients 
GROUP BY niche 
ORDER BY niche;
    `;
    
    const fs = require('fs');
    fs.writeFileSync('supabase-migration.sql', migrationContent);
    
    console.log('✅ Created migration file: supabase-migration.sql');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of supabase-migration.sql');
    console.log('4. Click "Run" to execute the migration');
    console.log('\n🔗 Supabase Dashboard: https://app.supabase.com/project/eitkqitreslouxyxmisn.supabase.co');
  }
}

// Run the script
createSQLFunction(); 