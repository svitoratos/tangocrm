# Date and Time Handling Setup

## Overview

The Creator CRM Platform now includes comprehensive timezone-aware date and time handling to ensure accurate scheduling and display across different user locations.

## Key Features

### 1. Timezone Detection
- Automatically detects user's browser timezone
- Falls back to 'America/New_York' if detection fails
- Users can manually set their timezone in Settings

### 2. Consistent Date Storage
- All dates are stored in UTC format in the database
- Uses `TIMESTAMP WITH TIME ZONE` for proper timezone support
- Prevents timezone-related data inconsistencies

### 3. User-Friendly Display
- Dates and times are displayed in the user's local timezone
- Calendar events show correct local times
- Input fields pre-populate with user's timezone

## Implementation Details

### DateUtils Class
Located in `src/lib/date-utils.ts`, provides:

- `toUserTimezone()` - Converts UTC dates to user's timezone
- `fromUserTimezoneToUTC()` - Converts user timezone dates to UTC
- `formatDateInTimezone()` - Formats dates in specific timezone
- `combineDateAndTime()` - Combines date/time strings with timezone handling
- `getUserTimezone()` - Gets user's timezone from browser

### useTimezone Hook
Located in `src/hooks/use-timezone.ts`, provides:

- `userTimezone` - Current user timezone
- `updateTimezone()` - Update user timezone
- `isLoading` - Loading state for timezone detection

## Database Schema

All date/time fields use `TIMESTAMP WITH TIME ZONE`:

```sql
-- Calendar events
start_time TIMESTAMP WITH TIME ZONE NOT NULL,
end_time TIMESTAMP WITH TIME ZONE NOT NULL,

-- Content items
scheduled_date TIMESTAMP WITH TIME ZONE,
published_date TIMESTAMP WITH TIME ZONE,

-- All tables
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
```

## Usage Examples

### Creating Calendar Events
```typescript
// Event creation automatically handles timezone conversion
const startDateTime = DateUtils.combineDateAndTime(
  formData.startDate, 
  formData.startTime, 
  DateUtils.getUserTimezone()
);
```

### Displaying Events
```typescript
// Events are displayed in user's timezone
const userTimezone = DateUtils.getUserTimezone();
const displayDate = DateUtils.toUserTimezone(event.start_date, userTimezone);
```

### Settings Integration
```typescript
// Users can change timezone in settings
const { userTimezone, updateTimezone } = useTimezone();
updateTimezone('Europe/London');
```

## Timezone Support

Supported timezones include:
- America/New_York (Eastern Time)
- America/Chicago (Central Time)
- America/Denver (Mountain Time)
- America/Los_Angeles (Pacific Time)
- Europe/London (London)
- Europe/Paris (Paris)
- Asia/Tokyo (Tokyo)
- Australia/Sydney (Sydney)

## Best Practices

1. **Always use UTC for storage** - Prevents timezone confusion
2. **Convert to user timezone for display** - Ensures correct local times
3. **Validate date ranges** - Use DateUtils.validateDateRange()
4. **Handle timezone changes gracefully** - Update displays when timezone changes
5. **Provide timezone selection** - Allow users to override browser detection

## Testing

To verify timezone handling:

1. Create a calendar event in one timezone
2. Switch to a different timezone in settings
3. Verify the event displays at the correct local time
4. Check that the stored UTC value remains unchanged

## Troubleshooting

### Common Issues

1. **Events showing wrong time**
   - Check if user timezone is set correctly
   - Verify DateUtils.toUserTimezone() is being used for display

2. **Date parsing errors**
   - Ensure all dates are properly validated with DateUtils.parseDate()
   - Check for invalid date strings

3. **Timezone not detected**
   - Falls back to 'America/New_York'
   - Users can manually set timezone in Settings

### Debug Mode

Enable debug logging to see timezone conversions:

```typescript
console.log('User timezone:', DateUtils.getUserTimezone());
console.log('UTC date:', utcDate);
console.log('User timezone date:', DateUtils.toUserTimezone(utcDate));
```

## Dependencies

- `date-fns` - Core date manipulation
- `date-fns-tz` - Timezone support
- Browser's `Intl.DateTimeFormat()` - Timezone detection

## Future Enhancements

1. **Automatic timezone updates** - Handle daylight saving time changes
2. **Meeting timezone conversion** - Show meeting times in all participants' timezones
3. **Timezone-aware notifications** - Send reminders at appropriate local times
4. **Calendar integration** - Sync with external calendars in user's timezone 