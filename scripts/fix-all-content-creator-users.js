const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixAllContentCreatorUsers() {
  try {
    console.log('🔧 Finding all users with "content-creator" niche...');
    
    // Find all users with content-creator niche
    const { data: usersWithContentCreator, error: findError } = await supabase
      .from('users')
      .select('id, email, niches, primary_niche')
      .contains('niches', ['content-creator']);
    
    if (findError) {
      console.error('❌ Error finding users:', findError);
      return;
    }
    
    if (!usersWithContentCreator || usersWithContentCreator.length === 0) {
      console.log('✅ No users found with "content-creator" niche');
      return;
    }
    
    console.log(`🔧 Found ${usersWithContentCreator.length} users with "content-creator" niche:`);
    usersWithContentCreator.forEach(user => {
      console.log(`  - ${user.email} (${user.id}): niches=${JSON.stringify(user.niches)}, primary=${user.primary_niche}`);
    });
    
    // Update each user
    for (const user of usersWithContentCreator) {
      console.log(`🔧 Updating ${user.email}...`);
      
      // Replace content-creator with creator in niches array
      const updatedNiches = user.niches.map(niche => 
        niche === 'content-creator' ? 'creator' : niche
      );
      
      // Update primary_niche if it's content-creator
      const updatedPrimaryNiche = user.primary_niche === 'content-creator' ? 'creator' : user.primary_niche;
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          niches: updatedNiches,
          primary_niche: updatedPrimaryNiche,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) {
        console.error(`❌ Error updating ${user.email}:`, updateError);
      } else {
        console.log(`✅ Successfully updated ${user.email}:`, {
          niches: updatedUser.niches,
          primary_niche: updatedUser.primary_niche
        });
      }
    }
    
    console.log('🎉 Finished updating all users with "content-creator" niche');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAllContentCreatorUsers(); 