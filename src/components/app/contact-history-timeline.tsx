import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { useOpportunityActivities } from '@/hooks/use-opportunity-activities';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { OpportunityActivity } from '@/lib/opportunity-activity-service';
import { opportunityActivityService } from '@/lib/opportunity-activity-service';

interface ContactHistoryItem {
  id: string;
  type: string;
  description: string;
  created_at: string;
  metadata?: Record<string, any>;
  isOpportunityNotes?: boolean;
}

interface ContactSummary {
  lastContact: ContactHistoryItem | null;
  lastAttempted: ContactHistoryItem | null;
  totalContacts: number;
  successfulContacts: number;
  failedAttempts: number;
}

interface ContactHistoryTimelineProps {
  opportunityId: string;
  opportunity?: any; // Add opportunity prop to access notes
  className?: string;
}

export const ContactHistoryTimeline: React.FC<ContactHistoryTimelineProps> = ({
  opportunityId,
  opportunity,
  className = ""
}) => {
  const [selectedActivity, setSelectedActivity] = useState<ContactHistoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    notes: '',
    outreachTouchpoint: '',
    outreachDate: ''
  });

  const {
    activities,
    loading,
    error,
    createActivity,
    refetch
  } = useOpportunityActivities(opportunityId);

  // Parse opportunity notes if they exist
  const opportunityNotes = React.useMemo(() => {
    if (!opportunity?.notes) return null;
    
    try {
      const parsedNotes = JSON.parse(opportunity.notes);
      
      // If we have noteHistory, show the most recent note
      if (parsedNotes.noteHistory && parsedNotes.noteHistory.length > 0) {
        const latestNote = parsedNotes.noteHistory[parsedNotes.noteHistory.length - 1];
        return latestNote.notes || parsedNotes.notes || opportunity.notes;
      }
      
      // Fallback to the current notes
      return parsedNotes.notes || opportunity.notes;
    } catch {
      return opportunity.notes;
    }
  }, [opportunity?.notes]);

  // Get all notes from history for display
  const allOpportunityNotes = React.useMemo(() => {
    if (!opportunity?.notes) return [];
    
    try {
      const parsedNotes = JSON.parse(opportunity.notes);
      
      // If we have noteHistory, return all notes with timestamps
      if (parsedNotes.noteHistory && parsedNotes.noteHistory.length > 0) {
        return parsedNotes.noteHistory.map((noteEntry: any, index: number) => ({
          id: `opportunity-note-${index}`,
          type: 'note' as const,
          description: noteEntry.notes,
          created_at: noteEntry.timestamp || opportunity?.created_at || new Date().toISOString(),
          metadata: {
            isOpportunityNotes: true,
            source: 'opportunity',
            noteIndex: index,
            totalNotes: parsedNotes.noteHistory.length
          }
        }));
      }
      
      // Fallback to single note
      return [{
        id: 'opportunity-notes',
        type: 'note' as const,
        description: parsedNotes.notes || opportunity.notes,
        created_at: opportunity?.created_at || new Date().toISOString(),
        metadata: {
          isOpportunityNotes: true,
          source: 'opportunity'
        }
      }];
    } catch {
      // If parsing fails, treat as single note
      return [{
        id: 'opportunity-notes',
        type: 'note' as const,
        description: opportunity.notes,
        created_at: opportunity?.created_at || new Date().toISOString(),
        metadata: {
          isOpportunityNotes: true,
          source: 'opportunity'
        }
      }];
    }
  }, [opportunity?.notes, opportunity?.created_at]);

  // Combine activities with opportunity notes
  const allContactHistory = React.useMemo(() => {
    const contactActivities = activities.filter(activity => 
      ['call', 'email', 'meeting', 'note', 'follow_up'].includes(activity.type)
    );

    // Add all opportunity notes from history
    const allNotes = [...allOpportunityNotes, ...contactActivities];
    
    // Sort by creation date (newest first)
    return allNotes.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [activities, allOpportunityNotes]);

  // Calculate contact summary
  const contactSummary: ContactSummary = React.useMemo(() => {
    const contactActivities = allContactHistory.filter(activity => 
      ['call', 'email', 'meeting', 'note', 'follow_up'].includes(activity.type)
    );

    const lastContact = contactActivities[0] || null;
    const lastAttempted = contactActivities.find(activity => 
      ['call', 'email'].includes(activity.type)
    ) || null;

    const successfulContacts = contactActivities.filter(activity => 
      (activity.metadata as any)?.outcome === 'successful'
    ).length;

    const failedAttempts = contactActivities.filter(activity => 
      (activity.metadata as any)?.outcome === 'failed'
    ).length;

    return {
      lastContact,
      lastAttempted,
      totalContacts: contactActivities.length,
      successfulContacts,
      failedAttempts
    };
  }, [allContactHistory]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      case 'follow_up': return <MoreHorizontal className="h-4 w-4" />; // Changed from Target to MoreHorizontal
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string, outcome?: string) => {
    if (outcome === 'successful') return 'bg-green-100 text-green-700';
    if (outcome === 'failed') return 'bg-red-100 text-red-700';
    if (outcome === 'no_response') return 'bg-yellow-100 text-yellow-700';
    
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-700';
      case 'email': return 'bg-purple-100 text-purple-700';
      case 'meeting': return 'bg-indigo-100 text-indigo-700';
      case 'note': return 'bg-gray-100 text-gray-700';
      case 'follow_up': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const formatFullDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewActivity = (activity: ContactHistoryItem) => {
    setSelectedActivity(activity);
    setIsViewDialogOpen(true);
  };

  const handleEditActivity = (activity: ContactHistoryItem) => {
    if ((activity as any).isOpportunityNotes) return; // Don't allow editing opportunity notes
    
    setSelectedActivity(activity);
    setEditForm({
      notes: activity.description || (activity.metadata as any)?.notes || '',
      outreachTouchpoint: (activity.metadata as any)?.outreachTouchpoint || '',
      outreachDate: (activity.metadata as any)?.outreachDate || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteActivity = async (activity: ContactHistoryItem) => {
    if ((activity as any).isOpportunityNotes) return; // Don't allow deleting opportunity notes
    
            if (!confirm('Tango CRM says: Are you sure you want to delete this contact entry? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Note: You'll need to implement delete functionality in your API
      // For now, we'll just show a message
      alert('Delete functionality needs to be implemented in the API');
      await refetch();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete contact entry. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedActivity || (selectedActivity as any).isOpportunityNotes) return;

    try {
      const metadata = {
        notes: editForm.notes,
        outreachTouchpoint: editForm.outreachTouchpoint,
        outreachDate: editForm.outreachDate,
        timestamp: new Date().toISOString()
      };

      // Note: You'll need to implement update functionality in your API
      // For now, we'll just show a message
      alert('Update functionality needs to be implemented in the API');
      setIsEditDialogOpen(false);
      await refetch();
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Failed to update contact entry. Please try again.');
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-amber-600 mb-4">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <h3 className="font-semibold">Contact History Not Available</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              The contact history system needs to be set up.
            </p>
            <ol className="text-sm text-amber-700 space-y-1">
              <li>1. Go to your Supabase Dashboard</li>
              <li>2. Navigate to SQL Editor</li>
              <li>3. Run the migration from <code className="bg-amber-100 px-1 rounded">scripts/fix-activity-table-schema.sql</code></li>
              <li>4. Refresh this page</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contact History Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Contact History</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading contact history...</span>
          </div>
        ) : allContactHistory.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No contact history yet</p>
              <p className="text-gray-400 text-xs mt-1">Contact history will appear here as you interact with this opportunity</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {allContactHistory.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          {activity.type === 'call' && <Phone className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'email' && <Mail className="h-4 w-4 text-green-500" />}
                          {activity.type === 'meeting' && <Calendar className="h-4 w-4 text-purple-500" />}
                          {activity.type === 'note' && <FileText className="h-4 w-4 text-gray-500" />}
                          {activity.type === 'follow_up' && <Clock className="h-4 w-4 text-orange-500" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {activity.type.replace(/_/g, ' ')}
                        </span>
                        {(activity.metadata as any)?.isOpportunityNotes && (
                          <Badge variant="secondary" className="text-xs">Opportunity Note</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {activity.description}
                      </p>

                      {(activity.metadata as any)?.outreachTouchpoint && (
                        <p className="text-xs text-purple-600">
                          Outreach: {(activity.metadata as any).outreachTouchpoint.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          {(activity.metadata as any)?.outreachDate && (
                            <span> on {new Date((activity.metadata as any).outreachDate).toLocaleDateString()}</span>
                          )}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatActivityTime(activity.created_at)}</span>
                        <span>•</span>
                        <span>{formatFullDate(activity.created_at)}</span>
                      </div>
                    </div>

                    {!((activity as any).isOpportunityNotes) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewActivity(activity)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteActivity(activity)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* View Activity Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`p-2 rounded-full ${getActivityColor(selectedActivity.type, (selectedActivity.metadata as any)?.outcome)}`}>
                    {getActivityIcon(selectedActivity.type)}
                  </div>
                  <span className="capitalize">{selectedActivity.type}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-1 text-sm text-gray-700">{selectedActivity.description}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Date & Time</Label>
                <p className="mt-1 text-sm text-gray-700">{formatFullDate(selectedActivity.created_at)}</p>
              </div>
              
              {(selectedActivity.metadata as any)?.outcome && (
                <div>
                  <Label className="text-sm font-medium">Outcome</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {(selectedActivity.metadata as any).outcome === 'successful' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {(selectedActivity.metadata as any).outcome === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                    {(selectedActivity.metadata as any).outcome === 'no_response' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                    <span className="capitalize">{(selectedActivity.metadata as any).outcome}</span>
                  </div>
                </div>
              )}
              
              {(selectedActivity.metadata as any)?.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="mt-1 text-sm text-gray-700">{(selectedActivity.metadata as any).notes}</p>
                </div>
              )}
              
              {(selectedActivity.metadata as any)?.nextFollowUp && (
                <div>
                  <Label className="text-sm font-medium">Next Follow-up</Label>
                  <p className="mt-1 text-sm text-gray-700">
                    {new Date((selectedActivity.metadata as any).nextFollowUp).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Outreach Method</Label>
              <Select value={editForm.outreachTouchpoint} onValueChange={(value) => setEditForm({...editForm, outreachTouchpoint: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select outreach method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left-voicemail">Left Voicemail</SelectItem>
                  <SelectItem value="sent-email">Sent Email</SelectItem>
                  <SelectItem value="text-message-sent">Text Message Sent</SelectItem>
                  <SelectItem value="dm-sent">DM Sent</SelectItem>
                  <SelectItem value="brand-emailed">Brand Emailed</SelectItem>
                  <SelectItem value="spoke-with-rep">Spoke with Rep</SelectItem>
                  <SelectItem value="contacted-no-response">Contacted No Response</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="not-interested">Not Interested</SelectItem>
                  <SelectItem value="do-not-contact">Do Not Contact</SelectItem>
                  <SelectItem value="bad-number-email">Bad Number/Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Outreach Date</Label>
              <Input
                type="date"
                value={editForm.outreachDate}
                onChange={(e) => setEditForm({...editForm, outreachDate: e.target.value})}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Add notes about this contact..."
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSaveEdit}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 