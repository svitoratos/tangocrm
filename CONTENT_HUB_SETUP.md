# Content Hub Database Setup Guide

This guide will help you set up the real data integration for the Programs/Content Hub feature.

## Database Migration

1. **Run the SQL migration** in your Supabase SQL editor:

```sql
-- Copy and paste the contents of content_items_table.sql
-- This creates the content_items table with all necessary fields and RLS policies
```

2. **Verify the table was created** by checking your Supabase dashboard under Database > Tables.

## API Endpoints

The following API endpoints have been created:

- `GET /api/content-items` - Fetch content items with optional niche and stage filters
- `POST /api/content-items` - Create a new content item
- `PUT /api/content-items/[id]` - Update an existing content item
- `DELETE /api/content-items/[id]` - Delete a content item

## Features Implemented

### Real Data Integration
- ✅ Database table with proper schema for all niches (creator, coach, podcaster, freelancer)
- ✅ API endpoints with authentication and RLS policies
- ✅ Frontend integration with loading states and error handling
- ✅ Data transformation between database and frontend formats

### Functionality
- ✅ Fetch content items by niche
- ✅ Create new content items
- ✅ Update content items (including drag & drop stage changes)
- ✅ Delete content items
- ✅ Loading states and error handling
- ✅ Empty state with call-to-action

### Niche Support
- ✅ **Creator**: Content planning with platforms, analytics, hashtags
- ✅ **Coach**: Program management with enrollment, pricing, milestones
- ✅ **Podcaster**: Episode planning with guests, sponsors, duration
- ✅ **Freelancer**: Project management with clients, budgets, deliverables

## Testing

1. **Test the API endpoints**:
   ```bash
   # Test GET endpoint
   curl -X GET "http://localhost:3001/api/content-items?niche=creator"
   
   # Test POST endpoint
   curl -X POST "http://localhost:3001/api/content-items" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Content",
       "stage": "Idea",
       "niche": "creator",
       "platform": "YouTube",
       "type": "Video"
     }'
   ```

2. **Test the UI**:
   - Navigate to the dashboard and select the "Content Hub" section
   - Try creating a new content item
   - Test drag & drop between stages
   - Verify loading states and error handling

## Data Structure

The `content_items` table supports all fields needed for different niches:

### Common Fields
- `id`, `user_id`, `niche`, `title`, `stage`
- `type`, `platform`, `brand`, `post_date`, `hashtags`
- `hook`, `notes`, `views`, `likes`, `comments`, `revenue`

### Coach-Specific Fields
- `length`, `price`, `enrolled`, `milestones`
- `program_type`, `custom_program_type`
- `start_date`, `end_date`, `client_progress`, `hosting_platform`

### Podcast-Specific Fields
- `guest`, `sponsor`, `duration`

### Freelancer-Specific Fields
- `client`, `deadline`, `budget`, `deliverables`

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**: Make sure you're logged in and the user has proper authentication
2. **"Table not found" errors**: Ensure the SQL migration was run successfully
3. **RLS policy errors**: Check that the RLS policies are properly configured

### Debug Steps

1. Check the browser console for any JavaScript errors
2. Check the server logs for API errors
3. Verify the database table exists and has the correct schema
4. Test the API endpoints directly using curl or Postman

## Next Steps

The content hub now uses real data from the database. You can:

1. Add more sophisticated filtering and search
2. Implement bulk operations (delete multiple items, move multiple items)
3. Add export functionality (CSV, PDF reports)
4. Implement real-time updates using Supabase subscriptions
5. Add file upload support for attachments
6. Implement advanced analytics and reporting

## Notes

- The component automatically fetches data when the niche changes
- All CRUD operations refresh the data automatically
- Error states are handled gracefully with retry options
- The interface adapts to show relevant fields based on the selected niche 