-- Step 1: Create the opportunity_activities table
CREATE TABLE IF NOT EXISTS opportunity_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT to handle Clerk user IDs
  type VARCHAR(50) NOT NULL CHECK (type IN ('created', 'updated', 'note', 'stage_changed', 'value_changed', 'contact_added', 'file_uploaded', 'meeting_scheduled', 'follow_up', 'contract_signed')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_opportunity_id ON opportunity_activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_user_id ON opportunity_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_created_at ON opportunity_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_activities_type ON opportunity_activities(type);

-- Step 3: Enable Row Level Security
ALTER TABLE opportunity_activities ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies (run these one by one if needed)
-- Policy for SELECT
CREATE POLICY "Users can view their own opportunity activities" ON opportunity_activities
  FOR SELECT USING (
    opportunity_id IN (
      SELECT id FROM opportunities WHERE user_id = auth.uid()
    )
  );

-- Policy for INSERT
CREATE POLICY "Users can create activities for their own opportunities" ON opportunity_activities
  FOR INSERT WITH CHECK (
    opportunity_id IN (
      SELECT id FROM opportunities WHERE user_id = auth.uid()
    )
  );

-- Policy for UPDATE
CREATE POLICY "Users can update their own activities" ON opportunity_activities
  FOR UPDATE USING (user_id = auth.uid());

-- Policy for DELETE
CREATE POLICY "Users can delete their own activities" ON opportunity_activities
  FOR DELETE USING (user_id = auth.uid());

-- Step 5: Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create trigger for automatic timestamp updates
CREATE TRIGGER update_opportunity_activities_updated_at 
  BEFORE UPDATE ON opportunity_activities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 