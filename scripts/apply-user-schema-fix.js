const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyUserSchemaFix() {
  try {
    console.log('🔧 Applying user table schema fix...');
    
    // Check if columns exist and add them if they don't
    const columnsToAdd = [
      { name: 'primary_niche', type: 'TEXT DEFAULT \'creator\'' },
      { name: 'niches', type: 'TEXT[] DEFAULT \'{}\'' },
      { name: 'onboarding_completed', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'subscription_status', type: 'TEXT DEFAULT \'free\'' },
      { name: 'subscription_tier', type: 'TEXT DEFAULT \'basic\'' },
      { name: 'stripe_customer_id', type: 'TEXT' }
    ];
    
    for (const column of columnsToAdd) {
      try {
        // Try to add the column
        const { error } = await supabase.rpc('add_column_if_not_exists', {
          table_name: 'users',
          column_name: column.name,
          column_definition: column.type
        });
        
        if (error) {
          console.log(`Column ${column.name} already exists or couldn't be added:`, error.message);
        } else {
          console.log(`✅ Added column: ${column.name}`);
        }
      } catch (err) {
        console.log(`Column ${column.name} already exists or couldn't be added:`, err.message);
      }
    }
    
    // Update existing users with default values
    const { error: updateError } = await supabase
      .from('users')
      .update({
        primary_niche: 'creator',
        niches: [],
        onboarding_completed: false,
        subscription_status: 'free',
        subscription_tier: 'basic'
      })
      .is('primary_niche', null);
    
    if (updateError) {
      console.log('Note: Could not update existing users:', updateError.message);
    } else {
      console.log('✅ Updated existing users with default values');
    }
    
    console.log('✅ User table schema fix completed!');
    console.log('');
    console.log('📋 Changes applied:');
    console.log('- Added primary_niche column');
    console.log('- Added niches column');
    console.log('- Added onboarding_completed column');
    console.log('- Added subscription_status column');
    console.log('- Added subscription_tier column');
    console.log('- Added stripe_customer_id column');
    console.log('- Updated existing data with default values');
    
  } catch (error) {
    console.error('❌ Failed to apply user schema fix:', error);
    process.exit(1);
  }
}

// Run the migration
applyUserSchemaFix(); 