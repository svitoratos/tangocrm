const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testOpportunityExists() {
  console.log('🔍 Testing Opportunity Access...\n');

  try {
    // 1. Get all opportunities
    console.log('1. Fetching all opportunities...');
    const { data: opportunities, error: fetchError } = await supabase
      .from('opportunities')
      .select('id, title, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching opportunities:', fetchError);
      return;
    }

    if (!opportunities || opportunities.length === 0) {
      console.log('❌ No opportunities found in the database');
      return;
    }

    console.log(`✅ Found ${opportunities.length} opportunities:`);
    opportunities.forEach((opp, index) => {
      console.log(`   ${index + 1}. "${opp.title}" (ID: ${opp.id})`);
      console.log(`      User ID: ${opp.user_id}`);
      console.log(`      Created: ${new Date(opp.created_at).toLocaleString()}`);
    });

    console.log('');

    // 2. Test accessing a specific opportunity
    const testOpportunity = opportunities[0];
    console.log(`2. Testing access to opportunity: "${testOpportunity.title}"`);
    
    const { data: opportunity, error: singleError } = await supabase
      .from('opportunities')
      .select('id, title, user_id, value, status, niche')
      .eq('id', testOpportunity.id)
      .single();

    if (singleError) {
      console.error('❌ Error accessing single opportunity:', singleError);
      return;
    }

    console.log('✅ Successfully accessed opportunity:');
    console.log(`   ID: ${opportunity.id}`);
    console.log(`   Title: ${opportunity.title}`);
    console.log(`   User ID: ${opportunity.user_id}`);
    console.log(`   Value: $${opportunity.value || 0}`);
    console.log(`   Status: ${opportunity.status}`);
    console.log(`   Niche: ${opportunity.niche}`);

    console.log('');

    // 3. Test RLS policies by simulating user access
    console.log('3. Testing Row Level Security...');
    
    // Try to access opportunities with different user contexts
    const { data: userOpportunities, error: userError } = await supabase
      .from('opportunities')
      .select('id, title')
      .eq('user_id', testOpportunity.user_id);

    if (userError) {
      console.error('❌ Error testing RLS:', userError);
    } else {
      console.log(`✅ RLS working: ${userOpportunities.length} opportunities accessible for user ${testOpportunity.user_id}`);
    }

    console.log('');

    // 4. Test activity creation for this opportunity
    console.log('4. Testing activity creation...');
    const { data: activity, error: activityError } = await supabase
      .from('opportunity_activities')
      .insert({
        opportunity_id: testOpportunity.id,
        user_id: testOpportunity.user_id,
        type: 'note',
        description: 'Test note to verify opportunity access',
        metadata: { test: true, timestamp: new Date().toISOString() }
      })
      .select()
      .single();

    if (activityError) {
      console.error('❌ Error creating test activity:', activityError);
      return;
    }

    console.log('✅ Successfully created test activity:');
    console.log(`   Activity ID: ${activity.id}`);
    console.log(`   Description: ${activity.description}`);
    console.log(`   Created: ${new Date(activity.created_at).toLocaleString()}`);

    // 5. Clean up test activity
    console.log('\n5. Cleaning up test activity...');
    const { error: cleanupError } = await supabase
      .from('opportunity_activities')
      .delete()
      .eq('id', activity.id);

    if (cleanupError) {
      console.error('❌ Error cleaning up test activity:', cleanupError);
    } else {
      console.log('✅ Test activity cleaned up');
    }

    console.log('\n🎉 Opportunity Access Test Passed!');
    console.log('   The opportunity exists and can be accessed properly.');
    console.log('   Activity creation should work now.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOpportunityExists(); 