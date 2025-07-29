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

async function fixUserNiches() {
  try {
    console.log('🔧 Checking and fixing user niches...');
    
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }
    
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      console.log(`\n🔧 Checking user: ${user.email} (${user.id})`);
      console.log('Current niches:', user.niches);
      console.log('Primary niche:', user.primary_niche);
      console.log('Subscription status:', user.subscription_status);
      
      // Check if user has creator niche
      const hasCreatorNiche = user.niches && user.niches.includes('creator');
      const hasPodcasterNiche = user.niches && user.niches.includes('podcaster');
      
      console.log('Has creator niche:', hasCreatorNiche);
      console.log('Has podcaster niche:', hasPodcasterNiche);
      
      // If user has podcaster but not creator, add creator
      if (hasPodcasterNiche && !hasCreatorNiche) {
        console.log('✅ Adding creator niche to user...');
        
        const updatedNiches = [...(user.niches || []), 'creator'];
        
        const { error: updateError } = await supabase
          .from('users')
          .update({
            niches: updatedNiches,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('❌ Error updating user niches:', updateError);
        } else {
          console.log('✅ Successfully added creator niche');
        }
      }
      
      // If user has no niches at all but has active subscription, add creator
      if ((!user.niches || user.niches.length === 0) && 
          (user.subscription_status === 'active' || user.subscription_status === 'trialing')) {
        console.log('✅ Adding creator niche to user with active subscription...');
        
        const { error: updateError } = await supabase
          .from('users')
          .update({
            niches: ['creator'],
            primary_niche: 'creator',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('❌ Error updating user niches:', updateError);
        } else {
          console.log('✅ Successfully added creator niche');
        }
      }
    }
    
    console.log('\n✅ Finished checking and fixing user niches');
    
  } catch (error) {
    console.error('❌ Error in fixUserNiches:', error);
  }
}

fixUserNiches(); 