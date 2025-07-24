-- Real-Time Analytics Triggers for Tango CRM
-- These triggers ensure analytics data is always up-to-date

-- ========================================
-- ANALYTICS CACHE TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    niche TEXT NOT NULL,
    cache_type TEXT NOT NULL, -- 'opportunities', 'clients', 'revenue', 'content', 'goals', 'calendar'
    data JSONB NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, niche, cache_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_cache_user_niche ON analytics_cache(user_id, niche);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_type ON analytics_cache(cache_type);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_updated ON analytics_cache(last_updated);

-- ========================================
-- TRIGGER FUNCTIONS
-- ========================================

-- Function to invalidate analytics cache
CREATE OR REPLACE FUNCTION invalidate_analytics_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete cached analytics for the affected user
    DELETE FROM analytics_cache WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
    
    -- Notify real-time subscribers
    PERFORM pg_notify('analytics_update', json_build_object(
        'user_id', COALESCE(NEW.user_id, OLD.user_id),
        'table', TG_TABLE_NAME,
        'operation', TG_OP
    )::text);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update opportunities analytics
CREATE OR REPLACE FUNCTION update_opportunities_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_data JSONB;
    user_niche TEXT;
BEGIN
    -- Get user's niche
    SELECT niche INTO user_niche FROM users WHERE id = COALESCE(NEW.user_id, OLD.user_id);
    
    -- Calculate opportunities analytics
    WITH opp_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'won') as won_count,
            SUM(value) as total_value,
            AVG(value) as avg_value,
            COUNT(*) FILTER (WHERE stage = 'prospecting') as prospecting,
            COUNT(*) FILTER (WHERE stage = 'qualification') as qualification,
            COUNT(*) FILTER (WHERE stage = 'proposal') as proposal,
            COUNT(*) FILTER (WHERE stage = 'negotiation') as negotiation,
            COUNT(*) FILTER (WHERE stage = 'won') as won,
            COUNT(*) FILTER (WHERE stage = 'lost') as lost
        FROM opportunities 
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        AND niche = user_niche
    )
    SELECT jsonb_build_object(
        'total', total,
        'won_count', won_count,
        'total_value', total_value,
        'avg_value', avg_value,
        'conversion_rate', CASE WHEN total > 0 THEN (won_count::float / total * 100) ELSE 0 END,
        'by_stage', jsonb_build_object(
            'prospecting', prospecting,
            'qualification', qualification,
            'proposal', proposal,
            'negotiation', negotiation,
            'won', won,
            'lost', lost
        )
    ) INTO analytics_data
    FROM opp_stats;
    
    -- Update cache
    INSERT INTO analytics_cache (user_id, niche, cache_type, data)
    VALUES (COALESCE(NEW.user_id, OLD.user_id), user_niche, 'opportunities', analytics_data)
    ON CONFLICT (user_id, niche, cache_type)
    DO UPDATE SET 
        data = EXCLUDED.data,
        last_updated = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update clients analytics
CREATE OR REPLACE FUNCTION update_clients_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_data JSONB;
    user_niche TEXT;
BEGIN
    -- Get user's niche
    SELECT niche INTO user_niche FROM users WHERE id = COALESCE(NEW.user_id, OLD.user_id);
    
    -- Calculate clients analytics
    WITH client_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'active') as active_count,
            COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) as new_this_month,
            COUNT(*) FILTER (WHERE status = 'lead') as leads,
            COUNT(*) FILTER (WHERE status = 'client') as clients,
            COUNT(*) FILTER (WHERE status = 'archived') as archived
        FROM clients 
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    )
    SELECT jsonb_build_object(
        'total', total,
        'active', active_count,
        'new_this_month', new_this_month,
        'retention_rate', CASE WHEN total > 0 THEN (active_count::float / total * 100) ELSE 0 END,
        'by_status', jsonb_build_object(
            'leads', leads,
            'clients', clients,
            'archived', archived
        )
    ) INTO analytics_data
    FROM client_stats;
    
    -- Update cache
    INSERT INTO analytics_cache (user_id, niche, cache_type, data)
    VALUES (COALESCE(NEW.user_id, OLD.user_id), user_niche, 'clients', analytics_data)
    ON CONFLICT (user_id, niche, cache_type)
    DO UPDATE SET 
        data = EXCLUDED.data,
        last_updated = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update revenue analytics
CREATE OR REPLACE FUNCTION update_revenue_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_data JSONB;
    user_niche TEXT;
BEGIN
    -- Get user's niche
    SELECT niche INTO user_niche FROM users WHERE id = COALESCE(NEW.user_id, OLD.user_id);
    
    -- Calculate revenue analytics
    WITH revenue_stats AS (
        SELECT 
            SUM(value) as total_revenue,
            AVG(value) as avg_deal_size,
            COUNT(*) as total_deals,
            SUM(value) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) as monthly_revenue,
            SUM(value) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')) as last_month_revenue
        FROM opportunities 
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        AND niche = user_niche
        AND status = 'won'
    ),
    monthly_data AS (
        SELECT 
            to_char(date_trunc('month', created_at), 'Mon') as month,
            SUM(value) as value
        FROM opportunities 
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        AND niche = user_niche
        AND status = 'won'
        AND created_at >= date_trunc('year', CURRENT_DATE)
        GROUP BY date_trunc('month', created_at)
        ORDER BY date_trunc('month', created_at)
    )
    SELECT jsonb_build_object(
        'total', total_revenue,
        'monthly', monthly_revenue,
        'avg_deal_size', avg_deal_size,
        'growth_rate', CASE 
            WHEN last_month_revenue > 0 THEN ((monthly_revenue - last_month_revenue) / last_month_revenue * 100)
            ELSE 0 
        END,
        'by_month', COALESCE(jsonb_agg(jsonb_build_object('month', month, 'value', value)), '[]'::jsonb)
    ) INTO analytics_data
    FROM revenue_stats, monthly_data;
    
    -- Update cache
    INSERT INTO analytics_cache (user_id, niche, cache_type, data)
    VALUES (COALESCE(NEW.user_id, OLD.user_id), user_niche, 'revenue', analytics_data)
    ON CONFLICT (user_id, niche, cache_type)
    DO UPDATE SET 
        data = EXCLUDED.data,
        last_updated = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update content analytics
CREATE OR REPLACE FUNCTION update_content_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_data JSONB;
    user_niche TEXT;
BEGIN
    -- Get user's niche
    SELECT niche INTO user_niche FROM users WHERE id = COALESCE(NEW.user_id, OLD.user_id);
    
    -- Calculate content analytics
    WITH content_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'published') as published_count,
            SUM(COALESCE(views, 0)) as total_views,
            AVG(COALESCE(views, 0)) as avg_views,
            COUNT(*) FILTER (WHERE type = 'post') as posts,
            COUNT(*) FILTER (WHERE type = 'video') as videos,
            COUNT(*) FILTER (WHERE type = 'episode') as episodes,
            COUNT(*) FILTER (WHERE type = 'program') as programs
        FROM content_items 
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        AND niche = user_niche
    )
    SELECT jsonb_build_object(
        'total', total,
        'published', published_count,
        'engagement', total_views,
        'avg_views', avg_views,
        'by_type', jsonb_build_object(
            'posts', posts,
            'videos', videos,
            'episodes', episodes,
            'programs', programs
        )
    ) INTO analytics_data
    FROM content_stats;
    
    -- Update cache
    INSERT INTO analytics_cache (user_id, niche, cache_type, data)
    VALUES (COALESCE(NEW.user_id, OLD.user_id), user_niche, 'content', analytics_data)
    ON CONFLICT (user_id, niche, cache_type)
    DO UPDATE SET 
        data = EXCLUDED.data,
        last_updated = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CREATE TRIGGERS
-- ========================================

-- Opportunities triggers
DROP TRIGGER IF EXISTS trigger_update_opportunities_analytics ON opportunities;
CREATE TRIGGER trigger_update_opportunities_analytics
    AFTER INSERT OR UPDATE OR DELETE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_opportunities_analytics();

-- Clients triggers
DROP TRIGGER IF EXISTS trigger_update_clients_analytics ON clients;
CREATE TRIGGER trigger_update_clients_analytics
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_clients_analytics();

-- Revenue triggers (same as opportunities, but also triggers on status changes)
DROP TRIGGER IF EXISTS trigger_update_revenue_analytics ON opportunities;
CREATE TRIGGER trigger_update_revenue_analytics
    AFTER INSERT OR UPDATE OR DELETE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_revenue_analytics();

-- Content triggers
DROP TRIGGER IF EXISTS trigger_update_content_analytics ON content_items;
CREATE TRIGGER trigger_update_content_analytics
    AFTER INSERT OR UPDATE OR DELETE ON content_items
    FOR EACH ROW
    EXECUTE FUNCTION update_content_analytics();

-- General cache invalidation triggers
DROP TRIGGER IF EXISTS trigger_invalidate_analytics_cache_opportunities ON opportunities;
CREATE TRIGGER trigger_invalidate_analytics_cache_opportunities
    AFTER INSERT OR UPDATE OR DELETE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_analytics_cache();

DROP TRIGGER IF EXISTS trigger_invalidate_analytics_cache_clients ON clients;
CREATE TRIGGER trigger_invalidate_analytics_cache_clients
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_analytics_cache();

DROP TRIGGER IF EXISTS trigger_invalidate_analytics_cache_content ON content_items;
CREATE TRIGGER trigger_invalidate_analytics_cache_content
    AFTER INSERT OR UPDATE OR DELETE ON content_items
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_analytics_cache();

-- ========================================
-- ANALYTICS CACHE CLEANUP FUNCTION
-- ========================================

-- Function to clean up old analytics cache entries
CREATE OR REPLACE FUNCTION cleanup_analytics_cache()
RETURNS void AS $$
BEGIN
    -- Delete cache entries older than 24 hours
    DELETE FROM analytics_cache 
    WHERE last_updated < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up cache (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-analytics-cache', '0 2 * * *', 'SELECT cleanup_analytics_cache();');

-- ========================================
-- ANALYTICS CACHE VIEW
-- ========================================

-- Create a view for easy access to cached analytics
CREATE OR REPLACE VIEW user_analytics_summary AS
SELECT 
    user_id,
    niche,
    jsonb_build_object(
        'opportunities', (SELECT data FROM analytics_cache WHERE cache_type = 'opportunities' AND ac.user_id = user_id AND ac.niche = niche),
        'clients', (SELECT data FROM analytics_cache WHERE cache_type = 'clients' AND ac.user_id = user_id AND ac.niche = niche),
        'revenue', (SELECT data FROM analytics_cache WHERE cache_type = 'revenue' AND ac.user_id = user_id AND ac.niche = niche),
        'content', (SELECT data FROM analytics_cache WHERE cache_type = 'content' AND ac.user_id = user_id AND ac.niche = niche)
    ) as analytics_data,
    MAX(last_updated) as last_updated
FROM analytics_cache ac
GROUP BY user_id, niche;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if triggers are created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%analytics%'
ORDER BY trigger_name;

-- Check analytics cache table
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'analytics_cache'
ORDER BY ordinal_position; 