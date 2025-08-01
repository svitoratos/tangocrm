const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addNicheColumnViaAPI() {
  console.log('🚀 Attempting to add niche column via API...');
  
  try {
    // Method 1: Try using the pg_catalog to add column
    console.log('📝 Method 1: Using pg_catalog to add column...');
    
    const { data: alterResult, error: alterError } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE public.clients 
          ADD COLUMN IF NOT EXISTS niche TEXT NOT NULL DEFAULT 'creator';
        `
      });
    
    if (alterError) {
      console.log('❌ Method 1 failed:', alterError.message);
      
      // Method 2: Try using a different approach with raw SQL
      console.log('📝 Method 2: Trying alternative SQL approach...');
      
      const { data: alterResult2, error: alterError2 } = await supabase
        .rpc('exec_sql', {
          sql: `
            DO $$ 
            BEGIN 
              IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'clients' 
                AND column_name = 'niche'
              ) THEN 
                ALTER TABLE public.clients ADD COLUMN niche TEXT NOT NULL DEFAULT 'creator';
              END IF;
            END $$;
          `
        });
      
      if (alterError2) {
        console.log('❌ Method 2 failed:', alterError2.message);
        
        // Method 3: Try using the REST API directly
        console.log('📝 Method 3: Using REST API directly...');
        
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            sql: 'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS niche TEXT NOT NULL DEFAULT \'creator\';'
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('❌ Method 3 failed:', errorText);
          
          // Method 4: Try creating a new table with the niche column
          console.log('📝 Method 4: Creating new table structure...');
          
          const { data: createResult, error: createError } = await supabase
            .rpc('exec_sql', {
              sql: `
                CREATE TABLE IF NOT EXISTS clients_new (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  user_id TEXT NOT NULL,
                  niche TEXT NOT NULL DEFAULT 'creator',
                  name TEXT NOT NULL,
                  email TEXT,
                  company TEXT,
                  phone TEXT,
                  website TEXT,
                  social_media JSONB,
                  notes TEXT,
                  tags TEXT[],
                  status TEXT NOT NULL DEFAULT 'client',
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
              `
            });
          
          if (createError) {
            console.log('❌ Method 4 failed:', createError.message);
            console.log('\n📋 All automated methods failed. Manual intervention required.');
            console.log('Please add the niche column manually in the Supabase dashboard.');
            return;
          }
          
          console.log('✅ New table structure created successfully');
        } else {
          console.log('✅ Method 3 succeeded!');
        }
      } else {
        console.log('✅ Method 2 succeeded!');
      }
    } else {
      console.log('✅ Method 1 succeeded!');
    }
    
    // Verify the column was added
    console.log('\n📝 Verifying column addition...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
      return;
    }
    
    const columns = Object.keys(verifyData[0] || {});
    console.log('📊 Current columns:', columns);
    
    if (columns.includes('niche')) {
      console.log('✅ Niche column successfully added!');
      
      // Update existing clients
      console.log('\n📝 Updating existing clients...');
      const { data: allClients, error: fetchError } = await supabase
        .from('clients')
        .select('*');
      
      if (fetchError) {
        console.error('❌ Error fetching clients:', fetchError);
        return;
      }
      
      console.log(`📊 Found ${allClients.length} clients to update`);
      
      let updatedCount = 0;
      for (const client of allClients) {
        const { error: updateError } = await supabase
          .from('clients')
          .update({ 
            niche: 'creator',
            updated_at: new Date().toISOString()
          })
          .eq('id', client.id);
        
        if (!updateError) {
          updatedCount++;
        }
      }
      
      console.log(`✅ Updated ${updatedCount} clients with 'creator' niche`);
      console.log('\n🎉 Niche migration completed successfully!');
      
    } else {
      console.log('❌ Niche column not found after addition attempt');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n📋 Manual intervention required.');
    console.log('Please add the niche column manually in the Supabase dashboard.');
  }
}

// Run the script
addNicheColumnViaAPI(); 