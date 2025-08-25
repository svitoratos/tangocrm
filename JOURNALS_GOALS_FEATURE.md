# Journals & Goals Feature

## Overview

The Journals & Goals feature provides users with a comprehensive system to track their personal thoughts, progress, and achievements. This feature includes two main components:

1. **Journal Entries** - For capturing daily thoughts, ideas, and reflections
2. **Goals Management** - For setting and tracking personal and professional goals

## Features

### Journal Entries

- **Create, Edit, Delete** journal entries
- **Mood Tracking** - Select from 8 different mood options with emojis
- **Tagging System** - Add custom tags to organize entries
- **Rich Content** - Support for titles and detailed content
- **Date Tracking** - Automatic timestamps for creation and updates
- **Responsive Design** - Works on desktop and mobile devices

### Goals Management

- **Goal Creation** - Set goals with titles, descriptions, and categories
- **Progress Tracking** - Track current vs target values with visual progress bars
- **Multiple Categories** - Revenue, Clients, Content, Personal, Fitness, Learning, Business, Other
- **Status Management** - Active, Completed, Cancelled statuses
- **Deadline Support** - Set target dates for goal completion
- **Niche Integration** - Goals are associated with user's selected niche
- **Filtering** - Filter goals by status
- **Tagging System** - Add custom tags to organize goals

## Technical Implementation

### API Routes

#### Journal Entries
- `GET /api/journal-entries` - Fetch all journal entries with pagination
- `POST /api/journal-entries` - Create new journal entry
- `GET /api/journal-entries/[id]` - Fetch specific journal entry
- `PUT /api/journal-entries/[id]` - Update journal entry
- `DELETE /api/journal-entries/[id]` - Delete journal entry

#### Goals
- `GET /api/goals` - Fetch all goals with pagination and filtering
- `POST /api/goals` - Create new goal
- `GET /api/goals/[id]` - Fetch specific goal
- `PUT /api/goals/[id]` - Update goal
- `DELETE /api/goals/[id]` - Delete goal

### Database Schema

#### journal_entries table
```sql
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### goals table
```sql
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit TEXT,
    deadline DATE,
    status TEXT DEFAULT 'active',
    category TEXT NOT NULL,
    niche TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Components

- `src/app/dashboard/journals-goals/page.tsx` - Main page with tabs
- `src/components/app/journal-entries.tsx` - Journal entries management
- `src/components/app/goals-management.tsx` - Goals management
- Updated sidebar navigation to include "Journals & Goals" link

### Security

- All API routes require authentication via Clerk
- Row Level Security (RLS) policies ensure users can only access their own data
- User ID is automatically set from authenticated user context

## Usage

1. Navigate to the dashboard
2. Click on "Journals & Goals" in the sidebar
3. Switch between "Journal Entries" and "Goals" tabs
4. Use the "New Entry" or "New Goal" buttons to create items
5. Edit or delete existing items using the action buttons

## Future Enhancements

- Export functionality for journal entries and goals
- Goal templates for common goal types
- Journal entry templates for different types of reflections
- Goal sharing and collaboration features
- Advanced analytics and insights
- Integration with calendar events
- Mobile app support
