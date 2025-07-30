# Cancellation Form Setup

## Overview
The cancellation form has been implemented to collect user feedback before they cancel their subscription. This helps improve the product and understand why users are leaving.

## What's Been Implemented

### 1. Cancellation Form Component
- **Location**: `src/components/app/cancellation-form.tsx`
- **Features**:
  - Collects cancellation reason (required)
  - Collects improvement feedback (optional)
  - Collects return likelihood (optional)
  - Shows next billing date
  - Redirects to Stripe billing portal after feedback submission

### 2. API Route
- **Location**: `src/app/api/user/cancellation-feedback/route.ts`
- **Purpose**: Stores cancellation feedback in the database
- **Fallback**: If table doesn't exist, logs feedback to console

### 3. Updated Billing Management
- **Location**: `src/components/app/billing-management.tsx`
- **Changes**: 
  - "Cancel Subscription" button now opens the feedback form
  - Form appears as a modal overlay
  - After feedback submission, redirects to Stripe billing portal

## Database Setup

### Option 1: Manual Setup (Recommended)
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following SQL:

```sql
-- Create cancellation_feedback table
CREATE TABLE IF NOT EXISTS cancellation_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT,
  primary_niche TEXT,
  subscription_tier TEXT,
  cancellation_reason TEXT NOT NULL,
  improvement_feedback TEXT,
  return_likelihood TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_user_id ON cancellation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_submitted_at ON cancellation_feedback(submitted_at);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_reason ON cancellation_feedback(cancellation_reason);

-- Enable RLS
ALTER TABLE cancellation_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can insert their own cancellation feedback" ON cancellation_feedback
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can view their own cancellation feedback" ON cancellation_feedback
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Admins can view all cancellation feedback" ON cancellation_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );
```

### Option 2: Using the Script
Run the provided script (though it may not work if `exec_sql` function doesn't exist):
```bash
node scripts/apply-cancellation-feedback-schema.js
```

## How It Works

1. **User clicks "Cancel Subscription"** in the billing management section
2. **Cancellation form modal appears** with:
   - Sad emoji and apologetic message
   - Required cancellation reason selection
   - Optional improvement feedback text area
   - Optional return likelihood question
   - Next billing date information
3. **User fills out the form** and clicks "Cancel Subscription"
4. **Feedback is stored** in the database (or logged if table doesn't exist)
5. **User is redirected** to Stripe billing portal to complete cancellation
6. **User can also click "Keep Subscription"** to close the form without canceling

## Cancellation Reasons Available
- I'm not using it enough
- Too expensive
- Found an alternative
- Missing features I need
- Too complicated
- Just taking a break
- Other (with text field)

## Return Likelihood Options
- Yes
- No
- Not sure

## Benefits
- **Product Improvement**: Collects valuable feedback on why users leave
- **User Experience**: Provides a thoughtful cancellation process
- **Data Insights**: Helps identify common cancellation reasons
- **Recovery Opportunities**: Understands likelihood of users returning

## Testing
1. Go to `/dashboard/settings`
2. Click "Cancel Subscription"
3. Fill out the form
4. Verify feedback is stored in database
5. Verify redirect to Stripe portal works

## Notes
- The form is fully responsive and accessible
- All form fields are properly validated
- Error handling is implemented for both form and API
- The form gracefully handles missing database table
- Feedback is stored with user context (email, niche, subscription tier) 