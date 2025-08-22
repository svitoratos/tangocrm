// Use ES modules syntax and read .env file
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { existsSync } from 'fs';

// Load environment variables from .env.local if it exists
if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config(); // Load from .env
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Environment check:');
console.log('- Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('- Service Role Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please make sure .env.local contains:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_key');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addNicheColumnToJournalEntries() {
  try {
    console.log('🔄 Adding niche column to journal_entries table...');
    
    // Add niche column to journal_entries table
    const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS niche TEXT;
        CREATE INDEX IF NOT EXISTS idx_journal_entries_niche ON journal_entries(niche);
      `
    });

    if (alterError) {
      console.error('❌ Error adding niche column:', alterError);
      // Try alternative method
      console.log('🔄 Trying alternative approach...');
      
      const { error: directError } = await supabaseAdmin
        .from('journal_entries')
        .select('niche')
        .limit(1);
      
      if (directError && directError.message.includes('column "niche" does not exist')) {
        throw new Error('Niche column needs to be added manually in Supabase dashboard');
      }
    } else {
      console.log('✅ Niche column added successfully');
    }

    // Update existing entries to have niche based on tags
    console.log('🔄 Updating existing entries with niche values...');
    
    // Get all journal entries
    const { data: entries, error: fetchError } = await supabaseAdmin
      .from('journal_entries')
      .select('id, tags, niche');

    if (fetchError) {
      console.error('❌ Error fetching entries:', fetchError);
      return;
    }

    console.log(`📊 Found ${entries.length} journal entries to update`);

    // Update entries that don't have niche set
    let updatedCount = 0;
    for (const entry of entries) {
      if (!entry.niche) {
        let niche = 'creator'; // default
        
        if (entry.tags && Array.isArray(entry.tags)) {
          if (entry.tags.includes('creator') || entry.tags.includes('creators')) {
            niche = 'creator';
          } else if (entry.tags.includes('podcaster') || entry.tags.includes('podcasters')) {
            niche = 'podcaster';
          } else if (entry.tags.includes('coach') || entry.tags.includes('coaches')) {
            niche = 'coach';
          } else if (entry.tags.includes('freelancer') || entry.tags.includes('freelancers')) {
            niche = 'freelancer';
          }
        }

        const { error: updateError } = await supabaseAdmin
          .from('journal_entries')
          .update({ niche })
          .eq('id', entry.id);

        if (updateError) {
          console.error(`❌ Error updating entry ${entry.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`✅ Updated entry ${entry.id} with niche: ${niche}`);
        }
      }
    }

    console.log(`🎉 Migration completed! Updated ${updatedCount} entries`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
addNicheColumnToJournalEntries()
  .then(() => {
    console.log('✅ Journal entries niche migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });