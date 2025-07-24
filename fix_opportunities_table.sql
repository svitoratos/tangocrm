-- Fix opportunities table - Add missing type column
-- This script adds the missing 'type' column to the opportunities table

-- Check if opportunities table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'opportunities') THEN
        -- Add type column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'opportunities' AND column_name = 'type') THEN
            ALTER TABLE opportunities ADD COLUMN type TEXT DEFAULT 'other';
            RAISE NOTICE 'Successfully added type column to opportunities table';
        ELSE
            RAISE NOTICE 'Type column already exists in opportunities table';
        END IF;
    ELSE
        -- Create the table if it doesn't exist
        CREATE TABLE opportunities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id TEXT NOT NULL,
            client_id UUID,
            title TEXT NOT NULL,
            description TEXT,
            value DECIMAL(10,2) DEFAULT 0,
            status TEXT DEFAULT 'prospecting',
            stage TEXT DEFAULT 'prospecting',
            type TEXT DEFAULT 'other',
            niche TEXT NOT NULL,
            source TEXT,
            expected_close_date TIMESTAMP WITH TIME ZONE,
            actual_close_date TIMESTAMP WITH TIME ZONE,
            follow_up_date TIMESTAMP WITH TIME ZONE,
            discovery_call_date TIMESTAMP WITH TIME ZONE,
            scheduled_date TIMESTAMP WITH TIME ZONE,
            user_timezone TEXT NOT NULL DEFAULT 'UTC',
            probability INTEGER DEFAULT 0,
            notes TEXT,
            tags TEXT[] DEFAULT '{}',
            custom_fields JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add foreign key constraints
        ALTER TABLE opportunities 
        ADD CONSTRAINT opportunities_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        
        ALTER TABLE opportunities 
        ADD CONSTRAINT opportunities_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
        
        -- Enable RLS
        ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
        
        -- Create basic RLS policies
        CREATE POLICY "Users can view own opportunities" ON opportunities
            FOR SELECT USING (auth.uid()::text = user_id);
        
        CREATE POLICY "Users can insert own opportunities" ON opportunities
            FOR INSERT WITH CHECK (auth.uid()::text = user_id);
        
        CREATE POLICY "Users can update own opportunities" ON opportunities
            FOR UPDATE USING (auth.uid()::text = user_id);
        
        CREATE POLICY "Users can delete own opportunities" ON opportunities
            FOR DELETE USING (auth.uid()::text = user_id);
        
        RAISE NOTICE 'Successfully created opportunities table with type column';
    END IF;
END $$;

-- Show the current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'opportunities' 
ORDER BY ordinal_position;

-- Count opportunities to verify table is working
SELECT COUNT(*) as total_opportunities FROM opportunities; 