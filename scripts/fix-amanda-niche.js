const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixAmandaNiche() {
  try {
    console.log('🔧 Fixing Amanda\'s niche from "content-creator" to "creator"...');
    
    // Update Amanda's user record
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        niches: ['creator'],
        primary_niche: 'creator',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'amanda.carluccio@gmail.com')
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error updating Amanda\'s niche:', updateError);
      return;
    }
    
    if (updatedUser) {
      console.log('✅ Successfully updated Amanda\'s niche:', {
        id: updatedUser.id,
        email: updatedUser.email,
        niches: updatedUser.niches,
        primary_niche: updatedUser.primary_niche,
        updated_at: updatedUser.updated_at
      });
    } else {
      console.log('❌ No user found to update');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAmandaNiche(); 