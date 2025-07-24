import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MessageSquare, DollarSign, Target, User, FileText, Plus, Loader2 } from 'lucide-react';
import { useOpportunityActivities } from '@/hooks/use-opportunity-activities';
import { OpportunityActivity } from '@/lib/opportunity-activity-service';
import { opportunityActivityService } from '@/lib/opportunity-activity-service';
import { activityEventBus } from '@/lib/opportunity-activity-service';

interface OpportunityActivityTimelineProps {
  opportunityId: string;
  className?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'note':
      return <MessageSquare className="h-4 w-4" />;
    case 'meeting_scheduled':
    case 'follow_up':
      return <Calendar className="h-4 w-4" />;
    case 'value_changed':
      return <DollarSign className="h-4 w-4" />;
    case 'stage_changed':
      return <Target className="h-4 w-4" />;
    case 'contact_added':
      return <User className="h-4 w-4" />;
    case 'file_uploaded':
      return <FileText className="h-4 w-4" />;
    case 'created':
      return <Plus className="h-4 w-4" />;
    case 'updated':
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'note':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'meeting_scheduled':
    case 'follow_up':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'value_changed':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'stage_changed':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'contact_added':
      return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    case 'file_uploaded':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'created':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'updated':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const formatActivityTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInMinutes / 1440);
    return `${diffInDays}d ago`;
  }
};

export const OpportunityActivityTimeline: React.FC<OpportunityActivityTimelineProps> = ({
  opportunityId,
  className = ""
}) => {
  // Add debugging
  console.log('🔍 ActivityTimeline: opportunityId =', opportunityId);
  console.log('🔍 ActivityTimeline: opportunityId type =', typeof opportunityId);
  console.log('🔍 ActivityTimeline: opportunityId length =', opportunityId?.length);

  const {
    activities,
    loading,
    error,
    createActivity,
    createNoteActivity,
    createFollowUpActivity,
    refetch
  } = useOpportunityActivities(opportunityId);

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Subscribe to real-time activity events
  React.useEffect(() => {
    const unsubscribe = activityEventBus.subscribe((event) => {
      if (event.type === 'note_added' && event.opportunityId === opportunityId) {
        refetch();
      }
    });

    return unsubscribe;
  }, [opportunityId, refetch]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    setIsAddingNote(true);
    try {
      await createNoteActivity(noteText.trim());
      setNoteText('');
      console.log('✅ Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to add note. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          errorMessage = 'Opportunity not found. Please refresh the page and try again.';
        } else if (error.message.includes('not available yet')) {
          errorMessage = 'Activity tracking is not set up yet. Please contact support.';
        } else if (error.message.includes('permission') || error.message.includes('auth')) {
          errorMessage = 'Permission denied. Please make sure you are logged in.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // You could show this error in a toast or alert
      alert(errorMessage);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleAddFollowUp = async () => {
    if (!followUpDate) return;

    setIsAddingFollowUp(true);
    try {
      await createFollowUpActivity(followUpDate, followUpNotes.trim() || undefined);
      setFollowUpDate('');
      setFollowUpNotes('');
      console.log('✅ Follow-up scheduled successfully');
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to schedule follow-up. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          errorMessage = 'Opportunity not found. Please refresh the page and try again.';
        } else if (error.message.includes('not available yet')) {
          errorMessage = 'Activity tracking is not set up yet. Please contact support.';
        } else if (error.message.includes('permission') || error.message.includes('auth')) {
          errorMessage = 'Permission denied. Please make sure you are logged in.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // You could show this error in a toast or alert
      alert(errorMessage);
    } finally {
      setIsAddingFollowUp(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading activities...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
        <Card>
          <CardContent className="p-6">
            {error.includes('does not exist') || error.includes('not available yet') ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Activity Tracking Not Set Up</h4>
                <p className="text-gray-600 mb-4">
                  The activity timeline feature requires a database table to be created first.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                  <h5 className="font-medium text-amber-800 mb-2">Setup Required:</h5>
                  <ol className="text-sm text-amber-700 space-y-1">
                    <li>1. Go to your Supabase Dashboard</li>
                    <li>2. Navigate to SQL Editor</li>
                    <li>3. Run the migration from <code className="bg-amber-100 px-1 rounded">scripts/fix-activity-table-schema.sql</code></li>
                    <li>4. Refresh this page</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Activities</h4>
                <p className="text-red-600 text-sm">{error}</p>
                <Button 
                  onClick={refetch} 
                  variant="outline" 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4 mr-1" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter your note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNoteText('')}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddNote} 
                    disabled={!noteText.trim() || isAddingNote}
                  >
                    {isAddingNote ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Note'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-1" />
                Follow Up
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Follow Up</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
                  <Textarea
                    placeholder="Add any notes about the follow-up..."
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setFollowUpDate('');
                    setFollowUpNotes('');
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddFollowUp} 
                    disabled={!followUpDate || isAddingFollowUp}
                  >
                    {isAddingFollowUp ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      'Schedule Follow Up'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h4>
              <p className="text-gray-500 text-sm mb-4">
                Start by adding a note or scheduling a follow up.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg border ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatActivityTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 