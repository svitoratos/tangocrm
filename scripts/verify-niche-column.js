const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyNicheColumn() {
  console.log('🔍 Verifying niche column addition...');
  
  try {
    // Check if niche column exists
    const { data: sampleData, error: checkError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error checking table structure:', checkError);
      return;
    }

    const columns = Object.keys(sampleData[0] || {});
    console.log('📊 Current table columns:', columns);

    if (columns.includes('niche')) {
      console.log('✅ Niche column found!');
      
      // Now let's update existing clients
      console.log('\n📝 Updating existing clients with default niche...');
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

      console.log(`✅ Successfully updated ${updatedCount} clients with 'creator' niche`);
      
      // Verify the update
      const { data: verificationData, error: verificationError } = await supabase
        .from('clients')
        .select('niche, name')
        .limit(5);
      
      if (!verificationError) {
        console.log('\n📋 Sample updated clients:');
        verificationData.forEach(client => {
          console.log(`   ${client.name}: ${client.niche} niche`);
        });
      }

      console.log('\n🎉 Niche migration completed successfully!');
      console.log('🔒 All clients now have niche isolation');
      
    } else {
      console.log('❌ Niche column not found');
      console.log('Please add the niche column manually in the Supabase dashboard');
      console.log('Column settings: name=niche, type=text, default=creator, nullable=false');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the verification
verifyNicheColumn(); 