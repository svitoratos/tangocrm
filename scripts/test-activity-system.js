const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testActivitySystem() {
  console.log('🧪 Testing Activity System...\n');

  try {
    // 1. Check if opportunity_activities table exists
    console.log('1. Checking if opportunity_activities table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('opportunity_activities')
      .select('id')
      .limit(1);

    if (tableError) {
      if (tableError.message?.includes('relation "opportunity_activities" does not exist')) {
        console.log('❌ Table does not exist. Please run the migration first.');
        console.log('   Follow the instructions in ACTIVITY_SETUP.md');
        return;
      }
      throw tableError;
    }
    console.log('✅ Table exists\n');

    // 2. Get a sample opportunity to test with
    console.log('2. Finding a sample opportunity...');
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select('id, title, user_id')
      .limit(1);

    if (oppError) {
      console.error('❌ Error fetching opportunities:', oppError);
      return;
    }

    if (!opportunities || opportunities.length === 0) {
      console.log('❌ No opportunities found. Please create an opportunity first.');
      return;
    }

    const testOpportunity = opportunities[0];
    console.log(`✅ Found opportunity: "${testOpportunity.title}" (ID: ${testOpportunity.id})`);
    console.log(`   User ID: ${testOpportunity.user_id} (Type: ${typeof testOpportunity.user_id})`);
    console.log(`   User ID length: ${testOpportunity.user_id?.length}`);
    console.log('');

    // Check if user_id is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValidUUID = uuidRegex.test(testOpportunity.user_id);
    console.log(`   Is valid UUID: ${isValidUUID}`);
    console.log('');

    // 3. Create a test activity
    console.log('3. Creating test activity...');
    const { data: activity, error: activityError } = await supabase
      .from('opportunity_activities')
      .insert({
        opportunity_id: testOpportunity.id,
        user_id: testOpportunity.user_id,
        type: 'note',
        description: 'Test activity - This is a test note to verify the activity system is working',
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (activityError) {
      console.error('❌ Error creating test activity:', activityError);
      return;
    }
    console.log('✅ Test activity created successfully');
    console.log('   Activity ID:', activity.id);
    console.log('   Type:', activity.type);
    console.log('   Description:', activity.description);
    console.log('   Created at:', activity.created_at);

    // 4. Verify the activity can be retrieved
    console.log('\n4. Verifying activity retrieval...');
    const { data: retrievedActivity, error: retrieveError } = await supabase
      .from('opportunity_activities')
      .select('*')
      .eq('opportunity_id', testOpportunity.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (retrieveError) {
      console.error('❌ Error retrieving activity:', retrieveError);
      return;
    }
    console.log('✅ Activity retrieved successfully');
    console.log('   Latest activity:', retrievedActivity.description);

    // 5. Clean up test activity
    console.log('\n5. Cleaning up test activity...');
    const { error: deleteError } = await supabase
      .from('opportunity_activities')
      .delete()
      .eq('id', activity.id);

    if (deleteError) {
      console.error('❌ Error deleting test activity:', deleteError);
      return;
    }
    console.log('✅ Test activity cleaned up');

    console.log('\n🎉 Activity system test completed successfully!');
    console.log('   The opportunity cards should now show the last activity.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testActivitySystem(); 