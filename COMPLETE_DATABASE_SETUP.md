# 🗄️ Complete Database Setup Guide

## **Overview**

This guide sets up all the database tables needed for the complete cancellation flow with feedback collection.

## **Tables to Create**

### **1. Cancellation Feedback Table**

```sql
-- Create cancellation_feedback table
CREATE TABLE IF NOT EXISTS cancellation_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_email TEXT,
    user_name TEXT,
    primary_niche TEXT,
    subscription_tier TEXT,
    reason TEXT NOT NULL,
    improvement_feedback TEXT,
    return_likelihood TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_user_id ON cancellation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_submitted_at ON cancellation_feedback(submitted_at);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_reason ON cancellation_feedback(reason);

-- Enable Row Level Security (RLS)
ALTER TABLE cancellation_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to insert their own feedback
CREATE POLICY "Users can insert their own cancellation feedback" ON cancellation_feedback
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Allow users to view their own feedback
CREATE POLICY "Users can view their own cancellation feedback" ON cancellation_feedback
    FOR SELECT USING (auth.uid()::text = user_id);

-- Allow admins to view all feedback
CREATE POLICY "Admins can view all cancellation feedback" ON cancellation_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.is_admin = true
        )
    );
```

### **2. Positive Feedback Table**

```sql
-- Create positive_feedback table
CREATE TABLE IF NOT EXISTS positive_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_email TEXT,
    user_name TEXT,
    primary_niche TEXT,
    subscription_tier TEXT,
    selected_options TEXT[],
    other_feedback TEXT,
    favorite_feature TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_positive_feedback_user_id ON positive_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_positive_feedback_submitted_at ON positive_feedback(submitted_at);
CREATE INDEX IF NOT EXISTS idx_positive_feedback_niche ON positive_feedback(primary_niche);

-- Enable Row Level Security (RLS)
ALTER TABLE positive_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to insert their own feedback
CREATE POLICY "Users can insert their own positive feedback" ON positive_feedback
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Allow users to view their own feedback
CREATE POLICY "Users can view their own positive feedback" ON positive_feedback
    FOR SELECT USING (auth.uid()::text = user_id);

-- Allow admins to view all feedback
CREATE POLICY "Admins can view all positive feedback" ON positive_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.is_admin = true
        )
    );
```

### **3. Optional: Add Discount Tracking to Users Table**

```sql
-- Add discount tracking columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS discount_applied TEXT,
ADD COLUMN IF NOT EXISTS discount_applied_at TIMESTAMP WITH TIME ZONE;
```

## **How to Apply**

### **Option 1: Supabase Dashboard (Recommended)**

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy and paste** each table creation script above
3. **Run each script** separately
4. **Verify tables** in the Table Editor

### **Option 2: Command Line (if you have psql)**

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the SQL scripts
\i create_cancellation_feedback_table.sql
\i create_positive_feedback_table.sql
```

## **Testing the Setup**

1. **Start your dev server**: `npm run dev`
2. **Navigate to**: Dashboard → Settings → Subscription
3. **Click**: "Cancel Subscription"
4. **Fill out** the cancellation form
5. **Fill out** the positive feedback form
6. **Check the database** to see if data is stored

## **Expected Flow**

1. **Cancellation Form** → Stores in `cancellation_feedback`
2. **Positive Feedback Form** → Stores in `positive_feedback`
3. **Retention Offer** → Applies Stripe coupon
4. **Final Decision** → User cancels or stays

## **Troubleshooting**

### **Error: "relation does not exist"**
- Run the table creation scripts above
- Check that you're connected to the right database

### **Error: "column does not exist"**
- Drop the existing table and recreate it
- Or alter the table to add missing columns

### **Error: "RLS policy" issues**
- Check that RLS is enabled
- Verify the policy syntax matches your Supabase version

### **Data not appearing**
- Check the browser console for API errors
- Verify the API endpoints are working
- Check Supabase logs for database errors

## **Monitoring**

### **View Feedback Data**

```sql
-- View cancellation feedback
SELECT * FROM cancellation_feedback ORDER BY submitted_at DESC;

-- View positive feedback
SELECT * FROM positive_feedback ORDER BY submitted_at DESC;

-- Count feedback by reason
SELECT reason, COUNT(*) FROM cancellation_feedback GROUP BY reason;

-- Count positive feedback by option
SELECT unnest(selected_options) as option, COUNT(*) 
FROM positive_feedback 
GROUP BY option;
```

### **Analytics Queries**

```sql
-- Most common cancellation reasons
SELECT reason, COUNT(*) as count 
FROM cancellation_feedback 
GROUP BY reason 
ORDER BY count DESC;

-- Most liked features
SELECT unnest(selected_options) as feature, COUNT(*) as count 
FROM positive_feedback 
GROUP BY feature 
ORDER BY count DESC;

-- Feedback by user niche
SELECT primary_niche, COUNT(*) as feedback_count 
FROM cancellation_feedback 
GROUP BY primary_niche;
```

## **Security Notes**

- ✅ **RLS enabled** on all feedback tables
- ✅ **Users can only see their own data**
- ✅ **Admins can view all feedback**
- ✅ **No sensitive data exposed**

## **Next Steps**

After setting up the database:

1. **Test the complete flow**
2. **Monitor feedback collection**
3. **Analyze user insights**
4. **Improve product based on feedback**
5. **Track retention rates**

The feedback system will now work properly and collect valuable insights about why users leave and what they liked about your platform! 