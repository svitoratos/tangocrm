# Supabase Database Setup Guide

## Step 1: Access Your Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `eitkqitreslouxyxmisn`

## Step 2: Open the SQL Editor

1. In your Supabase dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query" to create a new SQL query

## Step 3: Apply the Database Schema

1. Copy the entire contents of the `database_schema.sql` file
2. Paste it into the SQL editor
3. Click "Run" to execute the schema

## Step 4: Verify the Setup

1. Go to "Table Editor" in the left sidebar
2. You should see the following tables:
   - `users`
   - `clients`
   - `deals`
   - `content`
   - `calendar_events`
   - `journal_entries`
   - `goals`

## Step 5: Test the Connection

After applying the schema, restart your Next.js dev server:

```bash
npm run dev
```

The timezone functionality should now work without errors.

## Alternative: Use the Automated Script

If you prefer, you can run the automated script:

```bash
node scripts/apply-schema.js
```

This script will attempt to apply the schema programmatically using your service role key.

## Troubleshooting

If you encounter any errors:

1. **Check your Supabase project URL and keys** in `.env.local`
2. **Verify the schema was applied** by checking the Table Editor
3. **Check the SQL logs** in your Supabase dashboard for any errors
4. **Restart your Next.js dev server** after applying the schema

## Next Steps

Once the schema is applied:

1. Your timezone picker should work
2. All CRM features (clients, deals, content) will be functional
3. The "Failed to update timezone" error should disappear 