# Activity Timeline Setup Guide

## 🚨 **IMPORTANT: Step-by-Step Setup to Avoid Errors**

The error you're seeing suggests there might be a syntax issue. Follow these steps carefully:

### **Step 1: Clear the SQL Editor**
1. Go to **Supabase Dashboard** → **SQL Editor**
2. **Clear any existing text** in the editor
3. Make sure you're starting with a clean slate

### **Step 2: Run the Complete Script**
Copy and paste the **entire** script below into the SQL Editor:

```sql
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
```

### **Step 3: Execute the Script**
1. **Click "Run"** in the SQL Editor
2. **Wait for completion** - you should see success messages

### **Step 4: Verify the Setup**
Run this verification query:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'opportunity_activities';

-- Check if policies exist
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'opportunity_activities';
```

## 🔧 **Troubleshooting**

### **If you get a syntax error:**
1. **Make sure you copied the entire script** - not just a portion
2. **Check for extra characters** - sometimes copying from markdown adds extra formatting
3. **Try running in smaller chunks** (see alternative method below)

### **Alternative: Run Step by Step**
If the full script fails, try running these commands one by one:

**Step 1: Create table only**
```sql
CREATE TABLE IF NOT EXISTS opportunity_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('created', 'updated', 'note', 'stage_changed', 'value_changed', 'contact_added', 'file_uploaded', 'meeting_scheduled', 'follow_up', 'contract_signed')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Step 2: Enable RLS**
```sql
ALTER TABLE opportunity_activities ENABLE ROW LEVEL SECURITY;
```

**Step 3: Create policies one by one**
```sql
CREATE POLICY "Users can view their own opportunity activities" ON opportunity_activities
  FOR SELECT USING (
    opportunity_id IN (
      SELECT id FROM opportunities WHERE user_id = auth.uid()::uuid
    )
  );
```

Continue with the other policies...

### **Common Issues:**
- **"relation does not exist"**: Make sure the `opportunities` table exists first
- **"function does not exist"**: The `gen_random_uuid()` function should be available by default
- **Permission errors**: Make sure you're using the service role key or have proper permissions

## ✅ **Success Indicators**
After running the script successfully, you should see:
- ✅ Table `opportunity_activities` created
- ✅ 4 RLS policies created
- ✅ Indexes created
- ✅ Trigger function created
- ✅ Trigger created

## 🎯 **Next Steps**
Once the table is created:
1. **Refresh your application** (http://localhost:3001)
2. **Open an opportunity** in the modal
3. **Go to the Activity tab** - it should now show live data instead of the setup message
4. **Try adding a note** - it should work in real-time!

## 📋 **Supported Activity Types**
The table supports these activity types:
- `created` - Opportunity was created
- `updated` - Opportunity was updated
- `note` - Note added
- `stage_changed` - Stage was changed
- `value_changed` - Deal value was changed
- `contact_added` - Contact was added
- `file_uploaded` - File was uploaded
- `meeting_scheduled` - Meeting was scheduled
- `follow_up` - Follow-up was scheduled
- `contract_signed` - Contract was signed 