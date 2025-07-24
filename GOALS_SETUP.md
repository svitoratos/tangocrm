# Goals Database Setup Guide

This guide will help you set up the goals database for the Creator Journal feature.

## 1. Database Migration

Run the following SQL in your Supabase SQL editor to create the goals table:

```sql
-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'paused')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT DEFAULT 'personal',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  niche TEXT DEFAULT 'creator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority);
CREATE INDEX IF NOT EXISTS idx_goals_niche ON goals(niche);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own goals" ON goals
  FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can insert their own goals" ON goals
  FOR INSERT WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update their own goals" ON goals
  FOR UPDATE USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can delete their own goals" ON goals
  FOR DELETE USING (user_id = (auth.jwt() ->> 'sub'));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 2. API Routes

The following API routes have been created:

- `GET /api/goals?niche=creator` - Fetch goals for a specific niche
- `POST /api/goals` - Create a new goal
- `PUT /api/goals/[id]` - Update an existing goal
- `DELETE /api/goals/[id]` - Delete a goal

## 3. Features

The goals system includes:

### Goal Properties
- **Title**: Required field for the goal name
- **Description**: Optional detailed description
- **Target Date**: Optional deadline
- **Status**: not-started, in-progress, completed, paused
- **Priority**: low, medium, high
- **Category**: personal, business, health, etc.
- **Progress**: 0-100 percentage
- **Niche**: creator, coach, podcaster, freelancer

### Functionality
- ✅ Create new goals with full details
- ✅ Edit existing goals
- ✅ Delete goals
- ✅ Toggle goal completion status
- ✅ Filter goals by niche
- ✅ Loading states and error handling
- ✅ Real-time updates
- ✅ Responsive design

### UI Features
- **Empty State**: Beautiful empty state with call-to-action
- **Loading Skeletons**: Smooth loading animations
- **Goal Cards**: Clean, organized goal display
- **Status Indicators**: Visual status and priority badges
- **Achievement Celebration**: Special styling for completed goals
- **Quick Actions**: Edit, delete, and toggle completion

## 4. Testing

To test the goals functionality:

1. Navigate to the Creator Journal in your dashboard
2. Scroll down to the "Goals & Aspirations" section
3. Click "Add Your First Goal" or the "+" button
4. Fill in the goal details and save
5. Test editing, completing, and deleting goals
6. Verify goals are niche-specific (only show for the current niche)

## 5. Database Schema

```sql
goals table:
- id: UUID (Primary Key)
- user_id: TEXT (User identifier)
- title: TEXT (Required)
- description: TEXT (Optional)
- target_date: DATE (Optional)
- status: TEXT (not-started, in-progress, completed, paused)
- priority: TEXT (low, medium, high)
- category: TEXT (Default: personal)
- progress: INTEGER (0-100)
- completed_at: TIMESTAMP (When goal was completed)
- niche: TEXT (Default: creator)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 6. Security

- Row Level Security (RLS) enabled
- Users can only access their own goals
- All operations require authentication
- Input validation on all fields

## 7. Performance

- Indexes on frequently queried columns
- Efficient queries with proper filtering
- Optimized for niche-based filtering

The goals system is now fully integrated with your Creator Journal and ready to use! 🎯 