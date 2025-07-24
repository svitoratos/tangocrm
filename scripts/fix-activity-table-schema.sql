-- Fix opportunity_activities table schema to handle Clerk user IDs
-- This script will drop and recreate the table with the correct schema

-- Step 1: Drop existing table and related objects
DROP TABLE IF EXISTS opportunity_activities CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 2: Create the table with correct schema
CREATE TABLE opportunity_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- TEXT to handle Clerk user IDs (e.g., user_2zmMw9vD4wiYXnUnGe7sCiS3F11)
  type VARCHAR(50) NOT NULL CHECK (type IN ('created', 'updated', 'note', 'stage_changed', 'value_changed', 'contact_added', 'file_uploaded', 'meeting_scheduled', 'follow_up', 'contract_signed')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_opportunity_activities_opportunity_id ON opportunity_activities(opportunity_id);
CREATE INDEX idx_opportunity_activities_user_id ON opportunity_activities(user_id);
CREATE INDEX idx_opportunity_activities_created_at ON opportunity_activities(created_at DESC);
CREATE INDEX idx_opportunity_activities_type ON opportunity_activities(type);

-- Step 4: Enable Row Level Security
ALTER TABLE opportunity_activities ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for Clerk user IDs
CREATE POLICY "Users can view their own opportunity activities" ON opportunity_activities
  FOR SELECT USING (
    opportunity_id IN (
      SELECT id FROM opportunities WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activities for their own opportunities" ON opportunity_activities
  FOR INSERT WITH CHECK (
    opportunity_id IN (
      SELECT id FROM opportunities WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own activities" ON opportunity_activities
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own activities" ON opportunity_activities
  FOR DELETE USING (user_id = auth.uid());

-- Step 6: Create trigger function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create trigger
CREATE TRIGGER update_opportunity_activities_updated_at 
  BEFORE UPDATE ON opportunity_activities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Verify the table was created correctly
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'opportunity_activities'
ORDER BY ordinal_position; 