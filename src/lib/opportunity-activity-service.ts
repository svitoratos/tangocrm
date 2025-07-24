import { supabase } from '@/lib/supabase';

export interface OpportunityActivity {
  id: string;
  opportunity_id: string;
  user_id: string;
  type: 'created' | 'updated' | 'note' | 'stage_changed' | 'value_changed' | 'contact_added' | 'file_uploaded' | 'meeting_scheduled' | 'follow_up' | 'contract_signed' | 'call' | 'email' | 'meeting';
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityData {
  type: OpportunityActivity['type'];
  description: string;
  metadata?: Record<string, any>;
}

export interface ActivityChange {
  field: string;
  oldValue: any;
  newValue: any;
}

// Event types for activity tracking
export type ActivityEvent = 
  | { type: 'opportunity_created'; opportunity: any }
  | { type: 'opportunity_updated'; opportunity: any; changes: ActivityChange[] }
  | { type: 'note_added'; opportunityId: string; note: string }
  | { type: 'follow_up_scheduled'; opportunityId: string; date: string }
  | { type: 'stage_changed'; opportunityId: string; oldStage: string; newStage: string }
  | { type: 'value_changed'; opportunityId: string; oldValue: number; newValue: number };

// Event listeners for loose coupling
type ActivityEventListener = (event: ActivityEvent) => void;

class ActivityEventBus {
  private listeners: ActivityEventListener[] = [];

  subscribe(listener: ActivityEventListener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  publish(event: ActivityEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in activity event listener:', error);
      }
    });
  }
}

export const activityEventBus = new ActivityEventBus();

export class OpportunityActivityService {
  private supabase = supabase;

  async getActivities(opportunityId: string): Promise<OpportunityActivity[]> {
    try {
      // Use the API route instead of direct database access
      const response = await fetch(`/api/opportunities/${opportunityId}/activity`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Opportunity activities table does not exist yet. Please run the migration first.');
          return [];
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch activities: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  async createActivity(opportunityId: string, activityData: CreateActivityData): Promise<OpportunityActivity> {
    console.log('🔍 createActivity called with:', { opportunityId, activityData });
    
    try {
      // Use the API route instead of direct database access to avoid permission issues
      const response = await fetch(`/api/opportunities/${opportunityId}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `Failed to create activity: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔍 Successfully created activity via API:', data);

      // Publish event for real-time updates
      activityEventBus.publish({
        type: 'note_added',
        opportunityId,
        note: activityData.description
      });

      return data;
    } catch (error) {
      console.error('Error in createActivity:', error);
      throw error;
    }
  }

  // Specialized activity creation methods
  async createOpportunityCreatedActivity(opportunity: any): Promise<OpportunityActivity> {
    const description = `Opportunity "${opportunity.title}" was created`;
    const metadata = {
      title: opportunity.title,
      value: opportunity.value,
      status: opportunity.status,
      niche: opportunity.niche,
      type: 'opportunity_created'
    };

    return this.createActivity(opportunity.id, {
      type: 'created',
      description,
      metadata
    });
  }

  async createOpportunityUpdatedActivity(opportunity: any, changes: ActivityChange[]): Promise<OpportunityActivity> {
    const changeFields = changes.map(c => c.field).join(', ');
    const description = `Opportunity "${opportunity.title}" was updated (${changeFields})`;
    const metadata = {
      title: opportunity.title,
      value: opportunity.value,
      status: opportunity.status,
      changes: changes,
      type: 'opportunity_updated'
    };

    return this.createActivity(opportunity.id, {
      type: 'updated',
      description,
      metadata
    });
  }

  async createStageChangeActivity(opportunityId: string, oldStage: string, newStage: string): Promise<OpportunityActivity> {
    const description = `Stage changed from "${oldStage}" to "${newStage}"`;
    const metadata = {
      oldStage,
      newStage,
      type: 'stage_changed'
    };

    return this.createActivity(opportunityId, {
      type: 'stage_changed',
      description,
      metadata
    });
  }

  async createValueChangeActivity(opportunityId: string, oldValue: number, newValue: number): Promise<OpportunityActivity> {
    const description = `Deal value changed from $${oldValue.toLocaleString()} to $${newValue.toLocaleString()}`;
    const metadata = {
      oldValue,
      newValue,
      type: 'value_changed'
    };

    return this.createActivity(opportunityId, {
      type: 'value_changed',
      description,
      metadata
    });
  }

  async createNoteActivity(opportunityId: string, note: string): Promise<OpportunityActivity> {
    return this.createActivity(opportunityId, {
      type: 'note',
      description: note,
      metadata: { type: 'note' }
    });
  }

  async createFollowUpActivity(opportunityId: string, followUpDate: string, notes?: string): Promise<OpportunityActivity> {
    const description = `Follow-up scheduled for ${new Date(followUpDate).toLocaleDateString()}${notes ? `: ${notes}` : ''}`;
    const metadata = {
      followUpDate,
      notes,
      type: 'follow_up'
    };

    return this.createActivity(opportunityId, {
      type: 'follow_up',
      description,
      metadata
    });
  }

  async createContractActivity(opportunityId: string, action: 'signed' | 'sent' | 'reviewed'): Promise<OpportunityActivity> {
    const description = `Contract ${action}`;
    const metadata = {
      action,
      type: 'contract_signed'
    };

    return this.createActivity(opportunityId, {
      type: 'contract_signed',
      description,
      metadata
    });
  }

  async createMeetingActivity(opportunityId: string, meetingType: string, date: string): Promise<OpportunityActivity> {
    const description = `${meetingType} meeting scheduled for ${new Date(date).toLocaleDateString()}`;
    const metadata = {
      meetingType,
      date,
      type: 'meeting_scheduled'
    };

    return this.createActivity(opportunityId, {
      type: 'meeting_scheduled',
      description,
      metadata
    });
  }

  // Utility method to detect changes between old and new opportunity data
  detectChanges(oldData: any, newData: any): ActivityChange[] {
    const changes: ActivityChange[] = [];
    const fieldsToTrack = ['title', 'value', 'status', 'notes', 'expected_close_date', 'probability'];

    fieldsToTrack.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes.push({
          field,
          oldValue: oldData[field],
          newValue: newData[field]
        });
      }
    });

    return changes;
  }
}

export const opportunityActivityService = new OpportunityActivityService(); 