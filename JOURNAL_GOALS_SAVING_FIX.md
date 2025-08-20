# Journal and Goals Saving Fix

## Problem
The journals and goals were saving to Supabase but not appearing in the app. Users could create entries, but they wouldn't show up in the UI after saving.

## Root Cause
The issue was caused by **conflicting API routes** and **inconsistent user ID handling**:

1. **Conflicting Routes**: Both main routes (`/api/journal-entries/route.ts` and `/api/goals/route.ts`) and individual routes (`/api/journal-entries/[id]/route.ts` and `/api/goals/[id]/route.ts`) had PUT and DELETE methods, causing Next.js routing conflicts.

2. **Inconsistent User ID Logic**: The individual routes were using `supabase` (client-side) instead of `supabaseAdmin` (server-side) and didn't have the same user ID resolution logic as the main routes.

3. **Missing Niche Parameter**: The `nicheDataService.ts` wasn't passing the `niche` parameter in update requests, causing the API to not properly handle niche filtering.

## Solution

### 1. Fixed Individual Route Handlers
Updated `/api/journal-entries/[id]/route.ts` and `/api/goals/[id]/route.ts` to:
- Use `supabaseAdmin` instead of `supabase`
- Implement the same user ID resolution logic as main routes
- Handle niche parameter properly for journal entries (tags array)

### 2. Removed Conflicting Routes
Removed PUT and DELETE methods from main routes (`/api/journal-entries/route.ts` and `/api/goals/route.ts`) to avoid routing conflicts. Now:
- Main routes handle: GET (list) and POST (create)
- Individual routes handle: GET (single), PUT (update), DELETE (delete)

### 3. Enhanced NicheDataService
Updated `src/services/nicheDataService.ts` to:
- Include `niche` parameter in update requests
- Improve error handling and logging
- Ensure proper niche filtering

### 4. Improved Error Handling
Added better error messages and logging throughout the API chain to help with debugging.

## Files Modified

### API Routes
- `src/app/api/journal-entries/route.ts` - Removed conflicting PUT/DELETE methods
- `src/app/api/journal-entries/[id]/route.ts` - Fixed user ID logic and added niche handling
- `src/app/api/goals/route.ts` - Removed conflicting PUT/DELETE methods  
- `src/app/api/goals/[id]/route.ts` - Fixed user ID logic

### Service Layer
- `src/services/nicheDataService.ts` - Enhanced update method and error handling

## Testing
Created `test-journal-goals-api.js` to verify all CRUD operations work correctly:
- ✅ GET (list entries)
- ✅ POST (create entry)
- ✅ PUT (update entry)
- ✅ DELETE (delete entry)

## Result
Journals and goals now save properly and appear in the app immediately after creation/update. The data is properly filtered by niche and persists correctly in Supabase.

## Key Changes Summary
1. **Fixed routing conflicts** by removing duplicate HTTP methods
2. **Standardized user ID handling** across all API routes
3. **Added proper niche filtering** for journal entries
4. **Enhanced error handling** for better debugging
5. **Improved logging** throughout the data flow
