const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCancellationFeedbackTable() {
  console.log('🔧 Creating cancellation_feedback table...');

  try {
    // Create the table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS cancellation_feedback (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_email TEXT,
          user_name TEXT,
          primary_niche TEXT,
          subscription_tier TEXT,
          cancellation_reason TEXT NOT NULL,
          improvement_feedback TEXT,
          return_likelihood TEXT,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (tableError) {
      console.error('❌ Error creating table:', tableError);
      return;
    }

    console.log('✅ Table created successfully');

    // Create indexes
    console.log('🔧 Creating indexes...');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_user_id ON cancellation_feedback(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_submitted_at ON cancellation_feedback(submitted_at);',
      'CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_reason ON cancellation_feedback(cancellation_reason);'
    ];

    for (const indexSql of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (indexError) {
        console.error('❌ Error creating index:', indexError);
      } else {
        console.log('✅ Index created successfully');
      }
    }

    // Enable RLS
    console.log('🔧 Enabling Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE cancellation_feedback ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled successfully');
    }

    // Create RLS policies
    console.log('🔧 Creating RLS policies...');

    const policies = [
      `CREATE POLICY "Users can insert their own cancellation feedback" ON cancellation_feedback
        FOR INSERT WITH CHECK (auth.uid()::text = user_id);`,
      
      `CREATE POLICY "Users can view their own cancellation feedback" ON cancellation_feedback
        FOR SELECT USING (auth.uid()::text = user_id);`,
      
      `CREATE POLICY "Admins can view all cancellation feedback" ON cancellation_feedback
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.role = 'admin'
          )
        );`
    ];

    for (const policySql of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policySql });
      if (policyError) {
        console.error('❌ Error creating policy:', policyError);
      } else {
        console.log('✅ Policy created successfully');
      }
    }

    console.log('🎉 Cancellation feedback table setup completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createCancellationFeedbackTable(); 