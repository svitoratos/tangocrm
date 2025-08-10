-- Clean Test Data Script
-- Run this to remove any existing test/sample data from the database

-- Remove all journal entries (keep structure)
DELETE FROM journal_entries WHERE id IS NOT NULL;

-- Remove all goal entries (keep structure)  
DELETE FROM goals WHERE id IS NOT NULL;

-- Remove all clients/contacts (keep structure)
DELETE FROM clients WHERE id IS NOT NULL;

-- Remove all opportunities (keep structure)
DELETE FROM opportunities WHERE id IS NOT NULL;

-- Remove all calendar events (keep structure)
DELETE FROM calendar_events WHERE id IS NOT NULL;

-- Remove all content items (keep structure)
DELETE FROM content_items WHERE id IS NOT NULL;

-- Remove all opportunity activities (keep structure)
DELETE FROM opportunity_activities WHERE id IS NOT NULL;

-- Optional: Reset user data to clean state (remove niches from test users)
-- UPDATE users SET 
--   niches = NULL,
--   primary_niche = 'creator',
--   subscription_status = 'inactive',
--   subscription_tier = 'free'
-- WHERE email LIKE '%test%' OR email LIKE '%demo%';

-- Show remaining record counts to verify cleanup
SELECT 
  'journal_entries' as table_name, 
  COUNT(*) as record_count 
FROM journal_entries
UNION ALL
SELECT 
  'goals' as table_name, 
  COUNT(*) as record_count 
FROM goals
UNION ALL
SELECT 
  'clients' as table_name, 
  COUNT(*) as record_count 
FROM clients
UNION ALL
SELECT 
  'opportunities' as table_name, 
  COUNT(*) as record_count 
FROM opportunities
UNION ALL
SELECT 
  'calendar_events' as table_name, 
  COUNT(*) as record_count 
FROM calendar_events
UNION ALL
SELECT 
  'content_items' as table_name, 
  COUNT(*) as record_count 
FROM content_items;