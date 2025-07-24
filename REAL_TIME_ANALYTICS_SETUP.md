# Real-Time Analytics System for Tango CRM

## 🎯 Overview

Tango CRM now features a comprehensive real-time analytics system that automatically aggregates data from all user activities and provides instant insights across all niches (Creator, Coach, Podcaster, Freelancer/Consultant).

## 🏗️ Architecture

### Core Components

1. **Analytics Service** (`src/lib/analytics-service.ts`)
   - Central service for data aggregation
   - Real-time calculations and metrics
   - Niche-specific analytics logic

2. **Analytics Context** (`src/contexts/AnalyticsContext.tsx`)
   - React context for state management
   - Real-time data subscriptions
   - Automatic refresh capabilities

3. **Analytics Hook** (`src/hooks/use-analytics.ts`)
   - Custom React hook for data fetching
   - Loading states and error handling
   - Real-time update subscriptions

4. **Database Triggers** (`real_time_analytics_triggers.sql`)
   - Automatic cache invalidation
   - Real-time data updates
   - Performance optimization

5. **API Endpoints** (`src/app/api/analytics/route.ts`)
   - RESTful analytics data access
   - Niche-specific filtering
   - Authentication and authorization

## 🚀 Quick Start

### 1. Apply Database Triggers

```bash
# Run the setup script
node scripts/setup-real-time-analytics.js
```

### 2. Restart Development Server

```bash
npm run dev
```

### 3. Test Real-Time Analytics

1. Navigate to the Analytics Dashboard
2. Create/update opportunities, clients, or content
3. Watch the analytics update in real-time

## 📊 Analytics Data Structure

### Core Metrics (All Niches)

```typescript
interface AnalyticsData {
  opportunities: {
    total: number;
    byStage: Record<string, number>;
    totalValue: number;
    averageValue: number;
    conversionRate: number;
    recentActivity: any[];
  };
  clients: {
    total: number;
    active: number;
    newThisMonth: number;
    retentionRate: number;
    byStatus: Record<string, number>;
  };
  revenue: {
    total: number;
    monthly: number;
    averageDealSize: number;
    growthRate: number;
    byMonth: Array<{ month: string; value: number }>;
  };
  content: {
    total: number;
    published: number;
    engagement: number;
    averageViews: number;
    byType: Record<string, number>;
  };
  goals: {
    total: number;
    completed: number;
    progress: number;
    averageProgress: number;
  };
  calendar: {
    totalEvents: number;
    upcoming: number;
    completed: number;
    byType: Record<string, number>;
  };
}
```

### Niche-Specific Metrics

#### Creator Analytics
```typescript
creator?: {
  brandDeals: number;
  sponsoredContent: number;
  averageDealValue: number;
  topBrands: any[];
}
```

#### Coach Analytics
```typescript
coach?: {
  programs: number;
  studentsEnrolled: number;
  averageProgramValue: number;
  completionRate: number;
}
```

#### Podcaster Analytics
```typescript
podcaster?: {
  episodes: number;
  totalViews: number;
  averageViews: number;
  topEpisodes: any[];
}
```

#### Freelancer Analytics
```typescript
freelancer?: {
  projects: number;
  billableHours: number;
  utilizationRate: number;
  averageProjectValue: number;
}
```

## 🔄 Real-Time Updates

### Automatic Triggers

The system uses PostgreSQL triggers to automatically update analytics when data changes:

- **Opportunities**: Updates when deals are created, updated, or deleted
- **Clients**: Updates when contacts are added, modified, or removed
- **Content**: Updates when content items are published or modified
- **Revenue**: Updates when opportunities are won or values change

### Cache System

- **Analytics Cache Table**: Stores pre-calculated metrics for performance
- **Automatic Invalidation**: Cache is cleared when source data changes
- **Real-Time Notifications**: Supabase real-time subscriptions for instant updates

## 🎨 Usage Examples

### Basic Analytics Hook

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

function MyComponent() {
  const { data, loading, error, refresh } = useAnalytics({
    niche: 'creator',
    autoRefresh: true,
    refreshInterval: 30000
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Total Opportunities: {data?.opportunities?.total}</h2>
      <h2>Total Revenue: ${data?.revenue?.total}</h2>
    </div>
  );
}
```

### Analytics Context

```typescript
import { useAnalyticsContext } from '@/contexts/AnalyticsContext';

function AnalyticsDashboard() {
  const { 
    data, 
    loading, 
    activeNiche, 
    setActiveNiche,
    isRealTimeEnabled,
    toggleRealTime,
    lastUpdated 
  } = useAnalyticsContext();

  return (
    <div>
      <button onClick={() => setActiveNiche('creator')}>
        Creator Analytics
      </button>
      <button onClick={toggleRealTime}>
        {isRealTimeEnabled ? 'Disable' : 'Enable'} Real-Time
      </button>
      <p>Last Updated: {lastUpdated?.toLocaleTimeString()}</p>
    </div>
  );
}
```

### Niche-Specific Hooks

```typescript
import { useCreatorAnalytics, useCoachAnalytics } from '@/hooks/use-analytics';

// Creator-specific analytics
function CreatorDashboard() {
  const { data, loading } = useCreatorAnalytics();
  return (
    <div>
      <h2>Brand Deals: {data?.creator?.brandDeals}</h2>
      <h2>Average Deal Value: ${data?.creator?.averageDealValue}</h2>
    </div>
  );
}

// Coach-specific analytics
function CoachDashboard() {
  const { data, loading } = useCoachAnalytics();
  return (
    <div>
      <h2>Programs: {data?.coach?.programs}</h2>
      <h2>Students Enrolled: {data?.coach?.studentsEnrolled}</h2>
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables

```env
# Required for real-time analytics
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Analytics Settings

```typescript
// Default refresh interval (30 seconds)
const DEFAULT_REFRESH_INTERVAL = 30000;

// Cache expiration (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Real-time subscription channels
const ANALYTICS_CHANNELS = [
  'opportunities',
  'clients', 
  'content_items',
  'calendar_events'
];
```

## 📈 Performance Optimization

### Database Indexes

The system creates optimized indexes for analytics queries:

```sql
-- Opportunities analytics indexes
CREATE INDEX idx_opportunities_user_niche ON opportunities(user_id, niche);
CREATE INDEX idx_opportunities_status_stage ON opportunities(status, stage);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at);

-- Clients analytics indexes
CREATE INDEX idx_clients_user_status ON clients(user_id, status);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- Content analytics indexes
CREATE INDEX idx_content_items_user_niche ON content_items(user_id, niche);
CREATE INDEX idx_content_items_status ON content_items(status);
```

### Caching Strategy

1. **Analytics Cache Table**: Pre-calculated metrics stored in database
2. **React Query**: Client-side caching for API responses
3. **Real-Time Updates**: Instant updates via Supabase subscriptions
4. **Background Refresh**: Periodic updates to ensure data freshness

## 🐛 Troubleshooting

### Common Issues

1. **Analytics Not Updating**
   - Check if real-time is enabled
   - Verify database triggers are installed
   - Check browser console for errors

2. **Slow Performance**
   - Ensure database indexes are created
   - Check cache table for stale data
   - Monitor API response times

3. **Missing Data**
   - Verify user authentication
   - Check niche-specific data exists
   - Run analytics cache initialization

### Debug Commands

```bash
# Check if triggers exist
SELECT trigger_name FROM information_schema.triggers WHERE trigger_name LIKE '%analytics%';

# Check analytics cache
SELECT * FROM analytics_cache WHERE user_id = 'your_user_id';

# Manually refresh analytics
SELECT update_opportunities_analytics();
SELECT update_clients_analytics();
SELECT update_revenue_analytics();
```

## 🔮 Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Predictive analytics
   - Trend analysis
   - Custom date ranges

2. **Export Capabilities**
   - PDF reports
   - CSV exports
   - Scheduled reports

3. **Real-Time Notifications**
   - Goal achievement alerts
   - Revenue milestones
   - Performance insights

4. **Integration APIs**
   - Third-party analytics
   - Social media metrics
   - Payment platform data

## 📚 API Reference

### Analytics Endpoint

```
GET /api/analytics?niche=creator
```

**Response:**
```json
{
  "opportunities": { ... },
  "clients": { ... },
  "revenue": { ... },
  "content": { ... },
  "creator": { ... }
}
```

### Real-Time Events

The system emits real-time events when data changes:

```typescript
// Subscribe to analytics updates
supabase
  .channel('analytics-updates')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'opportunities' 
  }, (payload) => {
    console.log('Analytics updated:', payload);
  })
  .subscribe();
```

## 🤝 Contributing

When adding new analytics features:

1. **Update Analytics Service**: Add new calculation methods
2. **Extend Interfaces**: Update TypeScript interfaces
3. **Add Database Triggers**: Create triggers for new data sources
4. **Update Documentation**: Document new metrics and features
5. **Add Tests**: Create unit tests for new functionality

## 📄 License

This real-time analytics system is part of Tango CRM and follows the same licensing terms. 