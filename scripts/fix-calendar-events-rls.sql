-- Fix calendar_events RLS if showing as "Unrestricted"
-- Run this in your Supabase SQL editor

-- Enable RLS on calendar_events table
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can insert own calendar events" ON calendar_events; 
DROP POLICY IF EXISTS "Users can update own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar events" ON calendar_events;

-- Create proper user isolation policies
CREATE POLICY "Users can view own calendar events" ON calendar_events 
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own calendar events" ON calendar_events 
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own calendar events" ON calendar_events 
FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own calendar events" ON calendar_events 
FOR DELETE USING (auth.uid()::text = user_id);

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'calendar_events';

-- Verify policies exist  
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'calendar_events';