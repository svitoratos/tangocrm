# Opportunity Timezone Setup

## Overview

This document outlines the changes made to support timezone-aware due dates for opportunities in the Creator CRM Platform. The system now properly handles user timezones to ensure due dates are displayed and stored correctly regardless of the user's location.

## Changes Made

### 1. Database Schema Updates

#### Updated `deals` table structure:
```sql
-- Before
expected_close_date DATE,
actual_close_date DATE,

-- After  
expected_close_date TIMESTAMP WITH TIME ZONE,
actual_close_date TIMESTAMP WITH TIME ZONE,
user_timezone TEXT DEFAULT 'UTC',
```

#### Key improvements:
- **TIMESTAMP WITH TIME ZONE**: Stores dates with timezone information
- **user_timezone field**: Tracks the user's timezone for proper conversion
- **Automatic timezone detection**: Uses the user's stored timezone from the users table

### 2. Migration Script

The `add_timezone_to_opportunities.sql` file contains a complete migration script that:

1. **Adds user_timezone column** to existing deals table
2. **Converts DATE fields** to TIMESTAMP WITH TIME ZONE
3. **Creates helper functions** for timezone conversion
4. **Sets up triggers** to automatically set user timezone on new deals
5. **Creates indexes** for better performance
6. **Provides verification queries** to confirm migration success

### 3. API Updates

#### Updated `/api/opportunities` route:
- **Fetches user timezone** from the users table
- **Converts dates to UTC** before storing in database
- **Handles both date-only strings** and full ISO datetime strings
- **Preserves timezone information** for proper retrieval

#### Key functions:
```typescript
// Convert user input to UTC for storage
const expectedCloseDate = this.convertUserDateToUTC(userInput, userTimezone);

// Convert database date to user timezone for display  
const userDate = this.convertDatabaseDateToUserTimezone(databaseDate, userTimezone);
```

### 4. Frontend Utilities

#### New `OpportunityDateUtils` class (`src/lib/timezone-utils.ts`):
- **convertDatabaseDateToUserTimezone()**: Converts UTC dates to user's timezone
- **convertUserDateToUTC()**: Converts user dates to UTC for storage
- **formatDueDateForDisplay()**: Formats dates for UI display
- **formatDueDateForInput()**: Formats dates for input fields
- **createDatabaseDateString()**: Creates proper date strings for API calls
- **getDueDateRelativeTime()**: Shows relative time (e.g., "Due in 3 days")
- **isOverdue()**: Checks if a due date is overdue

## Implementation Steps

### 1. Run Database Migration

```bash
# Connect to your Supabase database and run:
psql -h your-supabase-host -U your-username -d your-database -f add_timezone_to_opportunities.sql
```

### 2. Update Frontend Components

#### In opportunity modals:
```typescript
import { OpportunityDateUtils } from '@/lib/timezone-utils';

// When loading opportunity data
const userTimezone = OpportunityDateUtils.getUserTimezone();
const dueDate = OpportunityDateUtils.convertDatabaseDateToUserTimezone(
  opportunity.expected_close_date, 
  userTimezone
);

// When saving opportunity data
const databaseDate = OpportunityDateUtils.createDatabaseDateString(
  formData.dueDate, 
  userTimezone
);
```

#### In opportunity cards:
```typescript
// Display due date in user's timezone
const displayDate = OpportunityDateUtils.formatDueDateForDisplay(
  opportunity.expected_close_date,
  userTimezone
);

// Show relative time
const relativeTime = OpportunityDateUtils.getDueDateRelativeTime(
  opportunity.expected_close_date,
  userTimezone
);

// Check if overdue
const isOverdue = OpportunityDateUtils.isOverdue(
  opportunity.expected_close_date,
  userTimezone
);
```

### 3. Update API Calls

The API routes have been updated to:
- Automatically fetch user timezone
- Convert dates to UTC before storage
- Handle timezone conversion transparently

## Benefits

### 1. **Accurate Date Display**
- Due dates always show in the user's local timezone
- No more date shifting when users travel or change timezones

### 2. **Consistent Data Storage**
- All dates stored in UTC format
- Timezone information preserved for proper conversion

### 3. **Better User Experience**
- Relative time display ("Due in 3 days")
- Overdue detection
- Proper date formatting for different locales

### 4. **Scalability**
- Supports users across multiple timezones
- Handles daylight saving time changes automatically

## Testing

### 1. Test with Different Timezones
```typescript
// Test timezone conversion
const testDate = '2024-01-15T00:00:00.000Z';
const userTimezone = 'America/New_York';

const localDate = OpportunityDateUtils.convertDatabaseDateToUserTimezone(testDate, userTimezone);
console.log('Local date:', localDate); // Should show Jan 14, 2024 (previous day due to timezone)
```

### 2. Test Date Storage
```typescript
// Test saving dates
const userInput = '2024-01-15';
const userTimezone = 'America/New_York';

const databaseDate = OpportunityDateUtils.createDatabaseDateString(userInput, userTimezone);
console.log('Database date:', databaseDate); // Should be in UTC format
```

### 3. Test Relative Time
```typescript
// Test relative time display
const dueDate = '2024-01-20T00:00:00.000Z';
const userTimezone = 'America/New_York';

const relativeTime = OpportunityDateUtils.getDueDateRelativeTime(dueDate, userTimezone);
console.log('Relative time:', relativeTime); // Should show "Due in X days"
```

## Migration Notes

### For Existing Data:
- Existing DATE fields will be converted to TIMESTAMP WITH TIME ZONE
- User timezone will be set based on the user's stored timezone
- No data loss during migration

### For New Data:
- All new opportunities will automatically get the user's timezone
- Dates will be stored in UTC format
- Display will be in user's local timezone

## Troubleshooting

### Common Issues:

1. **Date shifting**: Ensure you're using the new utility functions instead of direct date manipulation
2. **Timezone not detected**: Check that the user's timezone is properly set in the users table
3. **Migration errors**: Run the migration script step by step and check for any constraint violations

### Debug Queries:
```sql
-- Check timezone conversion
SELECT 
    id,
    title,
    expected_close_date,
    user_timezone,
    convert_deal_date_to_user_timezone(expected_close_date, user_timezone) as local_date
FROM deals 
WHERE expected_close_date IS NOT NULL 
LIMIT 5;

-- Check user timezones
SELECT id, timezone FROM users WHERE timezone IS NOT NULL;
```

## Future Enhancements

1. **Automatic timezone detection**: Detect user timezone from browser and update automatically
2. **Timezone preferences**: Allow users to set preferred timezone for different contexts
3. **Calendar integration**: Sync opportunity due dates with calendar events
4. **Notifications**: Send timezone-aware reminders for due dates 