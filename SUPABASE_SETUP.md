# Supabase Setup Guide for Creator CRM Platform

## 🚀 Quick Start

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project name: `creator-crm-platform`
5. Enter a strong database password (save this!)
6. Choose region closest to your users
7. Click "Create new project"

### Step 2: Get Your Credentials

1. Go to **Settings → API** in your Supabase dashboard
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon/Public Key**: `eyJ...` (starts with eyJ)

### Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clerk Configuration (if you have it)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe Configuration (if you have it)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Step 4: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire content from `database_schema.sql`
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

### Step 5: Configure Row Level Security (RLS)

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Create policies for clients table
CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create policies for deals table
CREATE POLICY "Users can view own deals" ON deals
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own deals" ON deals
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own deals" ON deals
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own deals" ON deals
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create policies for content table
CREATE POLICY "Users can view own content" ON content
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own content" ON content
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own content" ON content
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own content" ON content
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create policies for calendar_events table
CREATE POLICY "Users can view own calendar events" ON calendar_events
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own calendar events" ON calendar_events
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own calendar events" ON calendar_events
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own calendar events" ON calendar_events
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create policies for journal_entries table
CREATE POLICY "Users can view own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create policies for goals table
CREATE POLICY "Users can view own goals" ON goals
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own goals" ON goals
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own goals" ON goals
    FOR DELETE USING (auth.uid()::text = user_id::text);
```

### Step 6: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Check the browser console for any Supabase connection errors

## 🔧 Configuration Details

### Database Tables

Your database includes these tables:

- **users** - User profiles and subscription info
- **clients** - Client/contact information
- **deals** - Opportunities and deals
- **content** - Content items and campaigns
- **calendar_events** - Calendar events and meetings
- **journal_entries** - Personal journal entries
- **goals** - User goals and targets

### Timezone Support

All date/time fields use `TIMESTAMP WITH TIME ZONE` for proper timezone handling:

- `created_at` and `updated_at` - Automatic timestamps
- `start_time` and `end_time` - Calendar event times
- `scheduled_date` and `published_date` - Content scheduling

### Row Level Security (RLS)

- Each user can only access their own data
- Policies ensure data isolation between users
- Secure by default - no data leakage between accounts

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check your `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
   - Make sure you copied the anon key, not the service role key

2. **"Project not found" error**
   - Verify your `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Check that your project is active in Supabase dashboard

3. **Database connection errors**
   - Ensure your database is running (check Supabase dashboard)
   - Verify your database password is correct

4. **RLS policy errors**
   - Make sure you ran the RLS policies SQL
   - Check that auth.uid() is working correctly

### Debug Mode

Add this to your component to debug Supabase connection:

```typescript
import { supabase } from '@/lib/supabase'

// Test connection
supabase.from('users').select('*').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase error:', error)
    } else {
      console.log('Supabase connected successfully:', data)
    }
  })
```

## 📊 Monitoring

### Supabase Dashboard

Monitor your database in the Supabase dashboard:

- **Table Editor** - View and edit data
- **SQL Editor** - Run custom queries
- **Logs** - Check for errors
- **API** - Monitor API usage

### Performance Tips

1. **Use indexes** - Already included in the schema
2. **Limit queries** - Use `.limit()` for large datasets
3. **Cache data** - Implement client-side caching
4. **Monitor usage** - Check Supabase dashboard regularly

## 🔐 Security Best Practices

1. **Never expose service role key** - Only use anon key in frontend
2. **Use RLS policies** - Always enable row level security
3. **Validate input** - Sanitize user input before database operations
4. **Monitor access** - Check Supabase logs regularly
5. **Backup data** - Use Supabase's automatic backups

## 🎯 Next Steps

After setting up Supabase:

1. **Test the application** - Create some sample data
2. **Set up Clerk authentication** - For user management
3. **Configure Stripe** - For payment processing
4. **Deploy to production** - Use Vercel or similar

## 📞 Support

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the [Supabase Discord](https://discord.supabase.com)
3. Check your project logs in the Supabase dashboard
4. Verify your environment variables are correct 