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

async function testNicheAccess() {
  try {
    console.log('🔧 Testing user niche access...');
    
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
      console.log(`\n🔧 User: ${user.email} (${user.id})`);
      console.log('Current niches:', user.niches);
      console.log('Primary niche:', user.primary_niche);
      console.log('Subscription status:', user.subscription_status);
      console.log('Subscription tier:', user.subscription_tier);
      
      // Check if user has both creator and podcaster niches
      const hasCreatorNiche = user.niches && user.niches.includes('creator');
      const hasPodcasterNiche = user.niches && user.niches.includes('podcaster');
      
      console.log('Has creator niche:', hasCreatorNiche);
      console.log('Has podcaster niche:', hasPodcasterNiche);
      
      if (hasCreatorNiche && hasPodcasterNiche) {
        console.log('✅ User has both creator and podcaster niches!');
      } else if (hasCreatorNiche || hasPodcasterNiche) {
        console.log('⚠️ User has only one niche');
      } else {
        console.log('❌ User has no niches');
      }
      
      // Check if user should have access based on subscription
      if (user.subscription_status === 'active' || user.subscription_status === 'trialing') {
        console.log('✅ User has active subscription');
      } else {
        console.log('❌ User has inactive subscription');
      }
    }
    
    console.log('\n✅ Finished testing user niche access');
    
  } catch (error) {
    console.error('❌ Error in testNicheAccess:', error);
  }
}

testNicheAccess(); 