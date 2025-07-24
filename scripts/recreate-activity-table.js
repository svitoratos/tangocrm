const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function recreateActivityTable() {
  console.log('🔄 Recreating opportunity_activities table...\n');

  try {
    // 1. Drop existing table if it exists
    console.log('1. Dropping existing table...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS opportunity_activities CASCADE;'
    });

    if (dropError) {
      console.log('   Note: Could not drop table (might not exist or exec_sql not available)');
    } else {
      console.log('✅ Table dropped');
    }

    // 2. Create new table with correct schema
    console.log('\n2. Creating new table with correct schema...');
    const createTableSQL = `
      CREATE TABLE opportunity_activities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('created', 'updated', 'note', 'stage_changed', 'value_changed', 'contact_added', 'file_uploaded', 'meeting_scheduled', 'follow_up', 'contract_signed')),
        description TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (createError) {
      console.log('   Note: Could not create table via exec_sql, trying direct SQL...');
      // Try direct SQL execution
      const { error: directCreateError } = await supabase
        .from('opportunity_activities')
        .select('id')
        .limit(1);
      
      if (directCreateError && directCreateError.message?.includes('relation "opportunity_activities" does not exist')) {
        console.log('❌ Table creation failed. Please run the SQL manually in Supabase dashboard:');
        console.log('\n' + createTableSQL);
        return;
      }
    }

    console.log('✅ Table created');

    // 3. Create indexes
    console.log('\n3. Creating indexes...');
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_opportunity_activities_opportunity_id ON opportunity_activities(opportunity_id);
      CREATE INDEX IF NOT EXISTS idx_opportunity_activities_user_id ON opportunity_activities(user_id);
      CREATE INDEX IF NOT EXISTS idx_opportunity_activities_created_at ON opportunity_activities(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_opportunity_activities_type ON opportunity_activities(type);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: indexesSQL
    });

    if (indexError) {
      console.log('   Note: Could not create indexes via exec_sql');
    } else {
      console.log('✅ Indexes created');
    }

    // 4. Enable RLS
    console.log('\n4. Enabling Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE opportunity_activities ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.log('   Note: Could not enable RLS via exec_sql');
    } else {
      console.log('✅ RLS enabled');
    }

    // 5. Create policies
    console.log('\n5. Creating RLS policies...');
    const policiesSQL = `
      CREATE POLICY "Users can view their own opportunity activities" ON opportunity_activities
        FOR SELECT USING (
          opportunity_id IN (
            SELECT id FROM opportunities WHERE user_id = auth.uid()
          )
        );

      CREATE POLICY "Users can create activities for their own opportunities" ON opportunity_activities
        FOR INSERT WITH CHECK (
          opportunity_id IN (
            SELECT id FROM opportunities WHERE user_id = auth.uid()
          )
        );

      CREATE POLICY "Users can update their own activities" ON opportunity_activities
        FOR UPDATE USING (user_id = auth.uid());

      CREATE POLICY "Users can delete their own activities" ON opportunity_activities
        FOR DELETE USING (user_id = auth.uid());
    `;

    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: policiesSQL
    });

    if (policyError) {
      console.log('   Note: Could not create policies via exec_sql');
    } else {
      console.log('✅ Policies created');
    }

    // 6. Create trigger function and trigger
    console.log('\n6. Creating trigger function and trigger...');
    const triggerSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_opportunity_activities_updated_at 
        BEFORE UPDATE ON opportunity_activities 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: triggerSQL
    });

    if (triggerError) {
      console.log('   Note: Could not create trigger via exec_sql');
    } else {
      console.log('✅ Trigger created');
    }

    console.log('\n🎉 Table recreation completed!');
    console.log('   If any steps failed, please run the SQL manually in your Supabase dashboard.');
    console.log('   See ACTIVITY_SETUP.md for the complete SQL script.');

  } catch (error) {
    console.error('❌ Error recreating table:', error);
  }
}

recreateActivityTable(); 