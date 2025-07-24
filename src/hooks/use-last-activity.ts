import { useState, useEffect } from 'react';

export interface LastActivity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  metadata?: any;
}

export function useLastActivity(opportunityId: string | null) {
  const [lastActivity, setLastActivity] = useState<LastActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!opportunityId) {
      setLastActivity(null);
      return;
    }

    const fetchLastActivity = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 useLastActivity: Fetching last activity for opportunity:', opportunityId);
        
        // Use the API route instead of direct database access
        const response = await fetch(`/api/opportunities/${opportunityId}/activity?limit=1`);
        
        console.log('🔍 useLastActivity: Response status:', response.status);

        if (!response.ok) {
          if (response.status === 404) {
            console.log('🔍 useLastActivity: Table does not exist, setting no activity');
            setLastActivity(null);
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch last activity: ${response.status}`);
        }

        const data = await response.json();
        console.log('🔍 useLastActivity: API response data:', data);

        if (data && data.length > 0) {
          console.log('🔍 useLastActivity: Found activity:', data[0]);
          setLastActivity(data[0]);
        } else {
          console.log('🔍 useLastActivity: No activities found');
          setLastActivity(null);
        }
      } catch (err) {
        console.error('Error fetching last activity:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch last activity');
        setLastActivity(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLastActivity();
  }, [opportunityId]);

  return { lastActivity, loading, error };
} 