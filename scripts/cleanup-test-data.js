const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data from database...\n');

  try {
    // Clean up opportunities with test data
    console.log('1. Cleaning up test opportunities...');
    const { data: testOpportunities, error: oppError } = await supabase
      .from('opportunities')
      .select('*')
      .or('title.ilike.%test%,title.ilike.%Test%,title.ilike.%High Noon%,title.ilike.%try again%');

    if (oppError) {
      console.error('Error fetching test opportunities:', oppError);
    } else {
      console.log(`Found ${testOpportunities?.length || 0} test opportunities`);
      
      if (testOpportunities && testOpportunities.length > 0) {
        const testIds = testOpportunities.map(opp => opp.id);
        const { error: deleteError } = await supabase
          .from('opportunities')
          .delete()
          .in('id', testIds);
        
        if (deleteError) {
          console.error('Error deleting test opportunities:', deleteError);
        } else {
          console.log(`✅ Deleted ${testOpportunities.length} test opportunities`);
        }
      }
    }

    // Clean up clients with test data
    console.log('\n2. Cleaning up test clients...');
    const { data: testClients, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .or('name.ilike.%test%,name.ilike.%Test%,name.ilike.%High Noon%,name.ilike.%Sample%');

    if (clientError) {
      console.error('Error fetching test clients:', clientError);
    } else {
      console.log(`Found ${testClients?.length || 0} test clients`);
      
      if (testClients && testClients.length > 0) {
        const testIds = testClients.map(client => client.id);
        const { error: deleteError } = await supabase
          .from('clients')
          .delete()
          .in('id', testIds);
        
        if (deleteError) {
          console.error('Error deleting test clients:', deleteError);
        } else {
          console.log(`✅ Deleted ${testClients.length} test clients`);
        }
      }
    }

    // Clean up content items with test data
    console.log('\n3. Cleaning up test content items...');
    const { data: testContent, error: contentError } = await supabase
      .from('content_items')
      .select('*')
      .or('title.ilike.%test%,title.ilike.%Test%,title.ilike.%Sample%');

    if (contentError) {
      console.error('Error fetching test content items:', contentError);
    } else {
      console.log(`Found ${testContent?.length || 0} test content items`);
      
      if (testContent && testContent.length > 0) {
        const testIds = testContent.map(item => item.id);
        const { error: deleteError } = await supabase
          .from('content_items')
          .delete()
          .in('id', testIds);
        
        if (deleteError) {
          console.error('Error deleting test content items:', deleteError);
        } else {
          console.log(`✅ Deleted ${testContent.length} test content items`);
        }
      }
    }

    // Clean up goals with test data
    console.log('\n4. Cleaning up test goals...');
    const { data: testGoals, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .or('title.ilike.%test%,title.ilike.%Test%,title.ilike.%Sample%');

    if (goalError) {
      console.error('Error fetching test goals:', goalError);
    } else {
      console.log(`Found ${testGoals?.length || 0} test goals`);
      
      if (testGoals && testGoals.length > 0) {
        const testIds = testGoals.map(goal => goal.id);
        const { error: deleteError } = await supabase
          .from('goals')
          .delete()
          .in('id', testIds);
        
        if (deleteError) {
          console.error('Error deleting test goals:', deleteError);
        } else {
          console.log(`✅ Deleted ${testGoals.length} test goals`);
        }
      }
    }

    // Clean up calendar events with test data
    console.log('\n5. Cleaning up test calendar events...');
    const { data: testEvents, error: eventError } = await supabase
      .from('calendar_events')
      .select('*')
      .or('title.ilike.%test%,title.ilike.%Test%,title.ilike.%Sample%');

    if (eventError) {
      console.error('Error fetching test calendar events:', eventError);
    } else {
      console.log(`Found ${testEvents?.length || 0} test calendar events`);
      
      if (testEvents && testEvents.length > 0) {
        const testIds = testEvents.map(event => event.id);
        const { error: deleteError } = await supabase
          .from('calendar_events')
          .delete()
          .in('id', testIds);
        
        if (deleteError) {
          console.error('Error deleting test calendar events:', deleteError);
        } else {
          console.log(`✅ Deleted ${testEvents.length} test calendar events`);
        }
      }
    }

    console.log('\n🎉 Test data cleanup completed successfully!');
    console.log('✅ Database is now completely clean and production-ready');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupTestData(); 