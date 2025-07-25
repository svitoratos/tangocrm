// Script to set admin role for stevenvitoratos@gmail.com
// This script will help you set up admin access

const { createClient } = require('@supabase/supabase-js');
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

async function setAdminRole() {
  try {
    console.log('🔧 Setting up admin access for stevenvitoratos@gmail.com...');
    
    console.log('\n🎯 IMPORTANT: You need to set the admin role in Clerk first!');
    console.log('\n📋 Step-by-step instructions:');
    console.log('\n1. 🔐 Go to your Clerk Dashboard:');
    console.log('   https://dashboard.clerk.com');
    console.log('\n2. 👤 Find your user account:');
    console.log('   - Look for: stevenvitoratos@gmail.com');
    console.log('   - Click on the user to edit');
    console.log('\n3. 📝 Set the admin role:');
    console.log('   - Go to "Metadata" section');
    console.log('   - In "Public metadata", add this JSON:');
    console.log('     { "role": "admin" }');
    console.log('   - Save the changes');
    console.log('\n4. 🔄 Restart your development server:');
    console.log('   - Stop the current server (Ctrl+C)');
    console.log('   - Run: npm run dev');
    console.log('\n5. 🎯 Try accessing the dashboard again');
    
    console.log('\n🔗 Direct Clerk Dashboard Link:');
    console.log('https://dashboard.clerk.com/apps/[YOUR_APP_ID]/users');
    
    console.log('\n💡 Alternative: Use the built-in admin panel');
    console.log('1. First, temporarily add your email to admin config');
    console.log('2. Access /admin route');
    console.log('3. Use the "Make Admin" button for your user');
    
    console.log('\n⚠️  Note: The database user profile will be created automatically');
    console.log('   when you first access the dashboard with admin role set.');
    
  } catch (error) {
    console.error('❌ Failed to set admin role:', error);
    process.exit(1);
  }
}

setAdminRole(); 