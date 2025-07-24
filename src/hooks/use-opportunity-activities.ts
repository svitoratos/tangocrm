import { useState, useEffect, useCallback } from 'react';
import { opportunityActivityService, OpportunityActivity, CreateActivityData } from '@/lib/opportunity-activity-service';
import { supabase } from '@/lib/supabase';

export function useOpportunityActivities(opportunityId: string) {
  const [activities, setActivities] = useState<OpportunityActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await opportunityActivityService.getActivities(opportunityId);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  }, [opportunityId]);

  // Create new activity
  const createActivity = useCallback(async (activityData: CreateActivityData) => {
    try {
      const newActivity = await opportunityActivityService.createActivity(opportunityId, activityData);
      setActivities(prev => [newActivity, ...prev]);
      return newActivity;
    } catch (err) {
      console.error('Error creating activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to create activity');
      throw err;
    }
  }, [opportunityId]);

  // Create stage change activity
  const createStageChangeActivity = useCallback(async (oldStage: string, newStage: string) => {
    return createActivity({
      type: 'stage_changed',
      description: `Moved from ${oldStage} to ${newStage}`,
      metadata: {
        oldStage,
        newStage,
        timestamp: new Date().toISOString()
      }
    });
  }, [createActivity]);

  // Create value change activity
  const createValueChangeActivity = useCallback(async (oldValue: number, newValue: number) => {
    return createActivity({
      type: 'value_changed',
      description: `Deal value changed from $${oldValue.toLocaleString()} to $${newValue.toLocaleString()}`,
      metadata: {
        oldValue,
        newValue,
        change: newValue - oldValue,
        timestamp: new Date().toISOString()
      }
    });
  }, [createActivity]);

  // Create note activity
  const createNoteActivity = useCallback(async (note: string) => {
    return createActivity({
      type: 'note',
      description: note,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  }, [createActivity]);

  // Create follow-up activity
  const createFollowUpActivity = useCallback(async (followUpDate: string, notes?: string) => {
    return createActivity({
      type: 'follow_up',
      description: `Follow-up scheduled for ${new Date(followUpDate).toLocaleDateString()}${notes ? `: ${notes}` : ''}`,
      metadata: {
        followUpDate,
        notes,
        timestamp: new Date().toISOString()
      }
    });
  }, [createActivity]);

  // Create contract activity
  const createContractActivity = useCallback(async (action: 'uploaded' | 'signed') => {
    const type = action === 'uploaded' ? 'file_uploaded' : 'contract_signed';
    const description = action === 'uploaded' ? 'Contract uploaded' : 'Contract signed';
    
    return createActivity({
      type,
      description,
      metadata: {
        action,
        timestamp: new Date().toISOString()
      }
    });
  }, [createActivity]);

  // Create meeting activity
  const createMeetingActivity = useCallback(async (meetingDate: string, meetingType: string) => {
    return createActivity({
      type: 'meeting_scheduled',
      description: `${meetingType} scheduled for ${new Date(meetingDate).toLocaleDateString()}`,
      metadata: {
        meetingDate,
        meetingType,
        timestamp: new Date().toISOString()
      }
    });
  }, [createActivity]);

  // Set up real-time subscription
  useEffect(() => {
    if (!opportunityId) return;

    // Initial fetch
    fetchActivities();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`opportunity_activities_${opportunityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'opportunity_activities',
          filter: `opportunity_id=eq.${opportunityId}`
        },
        (payload) => {
          console.log('Activity change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newActivity = payload.new as OpportunityActivity;
            setActivities(prev => [newActivity, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedActivity = payload.new as OpportunityActivity;
            setActivities(prev => 
              prev.map(activity => 
                activity.id === updatedActivity.id ? updatedActivity : activity
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedActivity = payload.old as OpportunityActivity;
            setActivities(prev => 
              prev.filter(activity => activity.id !== deletedActivity.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [opportunityId, fetchActivities]);

  return {
    activities,
    loading,
    error,
    createActivity,
    createStageChangeActivity,
    createValueChangeActivity,
    createNoteActivity,
    createFollowUpActivity,
    createContractActivity,
    createMeetingActivity,
    refetch: fetchActivities
  };
} 