const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupCoachMockData() {
  try {
    console.log('🔍 Checking for coach content items...');
    
    // First, let's see what content items exist for coach niche
    const { data: coachItems, error: fetchError } = await supabase
      .from('content_items')
      .select('*')
      .eq('niche', 'coach');
    
    if (fetchError) {
      console.error('❌ Error fetching coach items:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${coachItems.length} coach content items:`);
    
    if (coachItems.length > 0) {
      coachItems.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}`);
        console.log(`   Title: ${item.title}`);
        console.log(`   Type: ${item.type}`);
        console.log(`   Stage: ${item.stage}`);
        console.log(`   User ID: ${item.user_id}`);
        console.log(`   Created: ${item.created_at}`);
        console.log('---');
      });
    }
    
    // Check if there are any items with demo_user_001
    const demoItems = coachItems.filter(item => item.user_id === 'demo_user_001');
    console.log(`🎭 Found ${demoItems.length} demo user items`);
    
    // Check if there are any items that look like mock data
    const mockItems = coachItems.filter(item => 
      item.title.includes('Business Mastery Program') || 
      item.title.includes('Life Balance Workshop') ||
      item.user_id === 'demo_user_001'
    );
    
    console.log(`🎭 Found ${mockItems.length} potential mock items`);
    
    if (mockItems.length > 0) {
      console.log('⚠️  Found mock items. Cleaning up demo data.');
      
      console.log('\n📋 Items that will be deleted:');
      mockItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title} (${item.user_id})`);
      });
      
      // Delete the mock data
      console.log('\n🗑️  Deleting mock data...');
      const { error: deleteError } = await supabase
        .from('content_items')
        .delete()
        .eq('niche', 'coach')
        .eq('user_id', 'demo_user_001');
      
      if (deleteError) {
        console.error('❌ Error deleting mock data:', deleteError);
        return;
      }
      
      console.log('✅ Mock data cleaned up successfully!');
      
    } else {
      console.log('✅ No mock data found.');
    }
    
    // Also check if there are any items that might be incorrectly categorized as programs
    const programLikeItems = coachItems.filter(item => 
      item.content_type === 'program' || 
      item.type === 'program' ||
      item.program_type
    );
    
    if (programLikeItems.length > 0) {
      console.log(`⚠️  Found ${programLikeItems.length} items that look like programs for coach niche:`);
      programLikeItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title} (content_type: ${item.content_type}, type: ${item.type})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error in cleanup script:', error);
  }
}

cleanupCoachMockData()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 