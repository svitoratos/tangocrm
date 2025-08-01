# Tango CRM Revenue Growth Rate Calculator

## Overview

The Revenue Growth Rate Calculator is a comprehensive solution for calculating and displaying revenue growth metrics across different time periods. It handles edge cases properly and provides accurate growth rate calculations for business analytics.

## Features

- **Multiple Time Periods**: Month-over-Month, Quarter-over-Quarter, Year-over-Year, Custom periods
- **Edge Case Handling**: Zero revenue, new business, missing data
- **Database Integration**: Direct integration with Tango CRM opportunities table
- **API Endpoints**: RESTful API for easy integration
- **React Components**: Ready-to-use UI components
- **Export Functionality**: CSV and JSON export capabilities
- **Trend Analysis**: Multi-period growth analysis

## Installation & Setup

The calculator is already integrated into your Tango CRM system. No additional installation required.

## Usage Examples

### 1. Basic Usage in React Components

```tsx
import { RevenueGrowthDisplay, RevenueGrowthCompact } from '@/components/app/revenue-growth-display';

// Full display component
function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <RevenueGrowthDisplay 
        periodType="month" 
        niche="creator"
        showDetails={true}
        title="Monthly Growth"
      />
      
      <RevenueGrowthDisplay 
        periodType="quarter" 
        niche="coach"
        showDetails={false}
        title="Quarterly Performance"
      />
      
      <RevenueGrowthDisplay 
        periodType="year" 
        niche="podcaster"
        title="Annual Growth"
      />
    </div>
  );
}

// Compact version for widgets
function MetricCard() {
  return (
    <div className="flex items-center justify-between">
      <span>Revenue Growth:</span>
      <RevenueGrowthCompact periodType="month" niche="creator" />
    </div>
  );
}
```

### 2. Using the Hook Directly

```tsx
import { useRevenueGrowth } from '@/hooks/use-revenue-growth';

function CustomGrowthWidget() {
  const { 
    growthRate, 
    loading, 
    error, 
    calculateGrowthRate,
    calculateCustomPeriod 
  } = useRevenueGrowth({
    periodType: 'month',
    niche: 'creator',
    autoFetch: true
  });

  const handleCustomCalculation = async () => {
    await calculateCustomPeriod({
      currentStartDate: new Date('2024-01-01'),
      currentEndDate: new Date('2024-01-31'),
      previousStartDate: new Date('2023-12-01'),
      previousEndDate: new Date('2023-12-31'),
      userId: 'user-id',
      niche: 'creator'
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!growthRate) return <div>No data</div>;

  return (
    <div>
      <h3>Growth Rate: {growthRate.growthRate}%</h3>
      <p>{growthRate.message}</p>
      <button onClick={handleCustomCalculation}>
        Calculate Custom Period
      </button>
    </div>
  );
}
```

### 3. API Usage

#### GET Request - Standard Periods

```javascript
// Month-over-Month growth
fetch('/api/analytics/revenue-growth?periodType=month&niche=creator')
  .then(response => response.json())
  .then(data => console.log(data));

// Quarter-over-Quarter with trend analysis
fetch('/api/analytics/revenue-growth?periodType=quarter&niche=coach&trendPeriods=4')
  .then(response => response.json())
  .then(data => console.log(data));

// Custom period
fetch('/api/analytics/revenue-growth?periodType=custom&startDate=2024-01-01&endDate=2024-01-31&niche=podcaster')
  .then(response => response.json())
  .then(data => console.log(data));
```

#### POST Request - Custom Periods

```javascript
fetch('/api/analytics/revenue-growth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    currentStartDate: '2024-01-01T00:00:00Z',
    currentEndDate: '2024-01-31T23:59:59Z',
    previousStartDate: '2023-12-01T00:00:00Z',
    previousEndDate: '2023-12-31T23:59:59Z',
    niche: 'creator'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### 4. Direct Calculator Usage

```typescript
import { revenueGrowthCalculator } from '@/lib/revenue-growth-calculator';

// Calculate month-over-month growth
const result = await revenueGrowthCalculator.calculateGrowthRate({
  periodType: 'month',
  userId: 'user-id',
  niche: 'creator',
  precision: 2
});

console.log(result);
// Output:
// {
//   growthRate: 15.75,
//   absoluteChange: 12500,
//   currentPeriod: 92500,
//   previousPeriod: 80000,
//   periodType: 'month',
//   isPositiveGrowth: true,
//   message: "15.75% growth compared to previous month"
// }

// Calculate custom period
const customResult = await revenueGrowthCalculator.calculateCustomPeriodGrowthRate({
  currentStartDate: new Date('2024-01-01'),
  currentEndDate: new Date('2024-01-31'),
  previousStartDate: new Date('2023-12-01'),
  previousEndDate: new Date('2023-12-31'),
  userId: 'user-id',
  niche: 'creator'
});

// Trend analysis
const trendResults = await revenueGrowthCalculator.calculateTrendAnalysis({
  periods: 6,
  periodType: 'month',
  userId: 'user-id',
  niche: 'creator'
});
```

## API Response Format

### Success Response

```json
{
  "growthRate": 15.75,
  "absoluteChange": 12500,
  "currentPeriod": 92500,
  "previousPeriod": 80000,
  "periodType": "month",
  "isPositiveGrowth": true,
  "message": "15.75% growth compared to previous month",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z",
  "previousStartDate": "2023-12-01T00:00:00.000Z",
  "previousEndDate": "2023-12-31T23:59:59.999Z"
}
```

### Error Response

```json
{
  "error": "Error message description"
}
```

## Edge Cases Handled

### 1. No Previous Revenue (New Business)

```json
{
  "growthRate": 100,
  "absoluteChange": 5000,
  "currentPeriod": 5000,
  "previousPeriod": 0,
  "periodType": "month",
  "isPositiveGrowth": true,
  "message": "New revenue generated (no previous month data)"
}
```

### 2. No Revenue in Either Period

```json
{
  "growthRate": 0,
  "absoluteChange": 0,
  "currentPeriod": 0,
  "previousPeriod": 0,
  "periodType": "month",
  "isPositiveGrowth": false,
  "message": "No revenue data available"
}
```

### 3. Revenue Decline

```json
{
  "growthRate": -25.5,
  "absoluteChange": -20000,
  "currentPeriod": 60000,
  "previousPeriod": 80000,
  "periodType": "month",
  "isPositiveGrowth": false,
  "message": "25.50% decline compared to previous month"
}
```

## Database Integration

The calculator integrates with your existing `opportunities` table:

- **Table**: `opportunities`
- **Revenue Field**: `value`
- **Date Field**: `created_at`
- **Status Filter**: 
  - Coach niche: `['won', 'paid']`
  - Other niches: `['won']`

## Performance Considerations

1. **Caching**: Consider implementing Redis caching for frequently requested periods
2. **Database Indexing**: Ensure `created_at`, `user_id`, `niche`, and `status` are indexed
3. **Batch Processing**: Use trend analysis for multiple periods instead of individual calls
4. **Query Optimization**: The calculator uses efficient date range queries

## Export Functionality

```typescript
// Export to CSV
const csvData = revenueGrowthCalculator.exportToCSV(results);
// Download or save CSV file

// Export to JSON
const jsonData = revenueGrowthCalculator.exportToJSON(results);
// Use JSON data for external systems
```

## Integration with Existing Analytics

The calculator can be integrated with your existing analytics dashboard:

```tsx
// Replace the old growth rate calculation in analytics-dashboard.tsx
import { useRevenueGrowth } from '@/hooks/use-revenue-growth';

function AnalyticsDashboard() {
  const { growthRate } = useRevenueGrowth({
    periodType: 'month',
    niche: activeNiche,
    autoFetch: true
  });

  // Use growthRate instead of the old calculatedGrowthRate
  return (
    <MetricCard
      title="Revenue Growth"
      value={`${growthRate?.growthRate.toFixed(1)}%`}
      change={growthRate?.absoluteChange}
      trend={growthRate?.isPositiveGrowth ? 'up' : 'down'}
      // ... other props
    />
  );
}
```

## Testing

The calculator includes comprehensive error handling and validation:

- Invalid date ranges
- Missing user authentication
- Database connection errors
- Invalid period types
- Empty result sets

## Best Practices

1. **Use Appropriate Periods**: Choose the right period type for your analysis
2. **Handle Loading States**: Always show loading indicators
3. **Error Handling**: Implement proper error boundaries
4. **Caching**: Cache results for better performance
5. **Validation**: Validate user inputs before API calls

## Support

For issues or questions about the Revenue Growth Rate Calculator, refer to the Tango CRM documentation or contact the development team. 