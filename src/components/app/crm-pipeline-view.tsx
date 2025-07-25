"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  DollarSign, 
  Users,
  TrendingUp,
  Grid3x3,
  List,
  User
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OpportunityModal from './opportunity-modal';
import { 
  CreatorOpportunityCard, 
  CoachOpportunityCard, 
  PodcasterOpportunityCard, 
  FreelancerOpportunityCard 
} from './opportunity-cards';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  mapFormDataToOpportunity,
  mapStatusToDatabase,
  type Opportunity as DatabaseOpportunity 
} from '@/lib/opportunity-service';

interface Opportunity {
  id: string;
  clientName: string;
  dealValue: number;
  probability: number;
  nextAction: string;
  assignee: string;
  createdDate: string;
  stageId: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  niche?: string;
  customFields?: Record<string, any>;
  expected_close_date?: string;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  opportunities: Opportunity[];
  order: number;
}

interface CRMPipelineViewProps {
  activeNiche?: 'creator' | 'coach' | 'podcaster' | 'freelancer';
}

const STAGE_COLORS = [
  '#10b981',
  '#f97316', 
  '#3b82f6',
  '#8b5cf6',
  '#ef4444'
];

function getNicheStages(niche?: string): PipelineStage[] {
  switch (niche) {
    case 'creator':
      return [
        { id: 'outreach', name: 'Outreach / Pitched', color: STAGE_COLORS[0], opportunities: [], order: 1 },
        { id: 'awaiting', name: 'Awaiting Response', color: STAGE_COLORS[1], opportunities: [], order: 2 },
        { id: 'conversation', name: 'In Conversation', color: STAGE_COLORS[2], opportunities: [], order: 3 },
        { id: 'negotiation', name: 'Negotiation', color: STAGE_COLORS[3], opportunities: [], order: 4 },
        { id: 'contract', name: 'Contract Signed', color: STAGE_COLORS[4], opportunities: [], order: 5 },
        { id: 'progress', name: 'Content in Progress', color: '#06b6d4', opportunities: [], order: 6 },
        { id: 'delivered', name: 'Delivered', color: '#10b981', opportunities: [], order: 7 },
        { id: 'paid', name: 'Paid', color: '#059669', opportunities: [], order: 8 },
        { id: 'archived', name: 'Archived / Lost', color: '#6b7280', opportunities: [], order: 9 }
      ];
    case 'coach':
      return [
        { id: 'new-lead', name: 'New Lead', color: STAGE_COLORS[0], opportunities: [], order: 1 },
        { id: 'discovery-scheduled', name: 'Discovery Call Scheduled', color: STAGE_COLORS[1], opportunities: [], order: 2 },
        { id: 'discovery-completed', name: 'Discovery Call Completed', color: STAGE_COLORS[2], opportunities: [], order: 3 },
        { id: 'proposal', name: 'Proposal Sent', color: STAGE_COLORS[3], opportunities: [], order: 4 },
        { id: 'follow-up', name: 'Follow-Up', color: STAGE_COLORS[4], opportunities: [], order: 5 },
        { id: 'negotiation', name: 'Negotiation', color: '#06b6d4', opportunities: [], order: 6 },
        { id: 'signed', name: 'Signed Client', color: '#10b981', opportunities: [], order: 7 },
        { id: 'paid', name: 'Paid', color: '#059669', opportunities: [], order: 8 },
        { id: 'active', name: 'Active Program', color: '#06b6d4', opportunities: [], order: 9 },
        { id: 'completed', name: 'Completed', color: '#7c3aed', opportunities: [], order: 10 },
        { id: 'archived', name: 'Archived / Lost', color: '#6b7280', opportunities: [], order: 11 }
      ];
    case 'podcaster':
      return [
        { id: 'outreach', name: 'Guest/Sponsor Outreach', color: STAGE_COLORS[0], opportunities: [], order: 1 },
        { id: 'awaiting', name: 'Awaiting Response', color: STAGE_COLORS[1], opportunities: [], order: 2 },
        { id: 'conversation', name: 'In Conversation', color: STAGE_COLORS[2], opportunities: [], order: 3 },
        { id: 'negotiation', name: 'Negotiation', color: STAGE_COLORS[3], opportunities: [], order: 4 },
        { id: 'agreement', name: 'Agreement in Place', color: STAGE_COLORS[4], opportunities: [], order: 5 },
        { id: 'scheduled', name: 'Scheduled', color: '#06b6d4', opportunities: [], order: 6 },
        { id: 'recorded', name: 'Recorded', color: '#10b981', opportunities: [], order: 7 },
        { id: 'published', name: 'Published', color: '#059669', opportunities: [], order: 8 },
        { id: 'paid', name: 'Paid', color: '#7c3aed', opportunities: [], order: 9 },
        { id: 'archived', name: 'Archived / Lost', color: '#6b7280', opportunities: [], order: 10 }
      ];
    case 'freelancer':
      return [
        { id: 'new-inquiry', name: 'New Inquiry', color: STAGE_COLORS[0], opportunities: [], order: 1 },
        { id: 'discovery', name: 'Discovery Call', color: STAGE_COLORS[1], opportunities: [], order: 2 },
        { id: 'proposal', name: 'Proposal Sent', color: STAGE_COLORS[2], opportunities: [], order: 3 },
        { id: 'follow-up', name: 'Follow-Up', color: STAGE_COLORS[3], opportunities: [], order: 4 },
        { id: 'negotiation', name: 'In Negotiation', color: STAGE_COLORS[4], opportunities: [], order: 5 },
        { id: 'contract', name: 'Contract Signed', color: '#06b6d4', opportunities: [], order: 6 },
        { id: 'progress', name: 'Project In Progress', color: '#10b981', opportunities: [], order: 7 },
        { id: 'delivered', name: 'Delivered', color: '#059669', opportunities: [], order: 8 },
        { id: 'paid', name: 'Paid', color: '#7c3aed', opportunities: [], order: 9 },
        { id: 'archived', name: 'Archived / Lost', color: '#6b7280', opportunities: [], order: 10 }
      ];
    default: // fallback to creator
      return [
        { id: 'outreach', name: 'Outreach / Pitched', color: STAGE_COLORS[0], opportunities: [], order: 1 },
        { id: 'awaiting', name: 'Awaiting Response', color: STAGE_COLORS[1], opportunities: [], order: 2 },
        { id: 'conversation', name: 'In Conversation', color: STAGE_COLORS[2], opportunities: [], order: 3 },
        { id: 'negotiation', name: 'Negotiation', color: STAGE_COLORS[3], opportunities: [], order: 4 },
        { id: 'contract', name: 'Contract Signed', color: STAGE_COLORS[4], opportunities: [], order: 5 },
        { id: 'progress', name: 'Content in Progress', color: '#06b6d4', opportunities: [], order: 6 },
        { id: 'delivered', name: 'Delivered', color: '#10b981', opportunities: [], order: 7 },
        { id: 'paid', name: 'Paid', color: '#059669', opportunities: [], order: 8 },
        { id: 'archived', name: 'Archived / Lost', color: '#6b7280', opportunities: [], order: 9 }
      ];
  }
}

// Helper function to map database status to UI stage ID
function mapDatabaseStatusToStageId(dbStatus: string, niche: string): string {
  const statusMap: Record<string, Record<string, string>> = {
    creator: {
      'prospecting': 'outreach',
      'qualification': 'awaiting',
      'proposal': 'contract',
      'negotiation': 'negotiation',
      'won': 'paid',
      'lost': 'archived'
    },
    coach: {
      'prospecting': 'new-lead',
      'qualification': 'discovery-scheduled',
      'proposal': 'proposal',
      'negotiation': 'negotiation',
      'won': 'paid',
      'lost': 'archived'
    },
    podcaster: {
      'prospecting': 'outreach',
      'qualification': 'conversation',
      'proposal': 'agreement',
      'negotiation': 'negotiation',
      'won': 'published',
      'lost': 'archived'
    },
    freelancer: {
      'prospecting': 'new-inquiry',
      'qualification': 'discovery',
      'proposal': 'proposal',
      'negotiation': 'contract',
      'won': 'delivered',
      'lost': 'archived'
    }
  };

  return statusMap[niche]?.[dbStatus] || 'outreach';
}

const getNicheName = (niche?: string) => {
  switch (niche) {
    case 'coach': return 'Coach Pipeline';
    case 'podcaster': return 'Podcast Pipeline';
    case 'freelancer': return 'Freelance Pipeline';
    default: return 'Creator Pipeline';
  }
};

export default function CRMPipelineView({ activeNiche = 'creator' }: CRMPipelineViewProps) {
  const router = useRouter();

  const [view, setView] = useState<'board' | 'list'>('board');
  const [stages, setStages] = useState<PipelineStage[]>(() => {
    const initialStages = getNicheStages(activeNiche);
    
    console.log('Initializing stages for niche:', activeNiche);
    
    // Start with empty opportunities, they'll be loaded from database
    const updatedStages = initialStages.map(stage => ({
      ...stage,
      opportunities: []
    }));
    
    return updatedStages;
  });

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [rawOpportunities, setRawOpportunities] = useState<any[]>([]); // Store raw database opportunities
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState<Opportunity | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [showClientConversionModal, setShowClientConversionModal] = useState(false);
  const [convertedOpportunity, setConvertedOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState("all");
  const [addOpportunityStage, setAddOpportunityStage] = useState<string | null>(null);

  // Stages that should trigger client conversion notification
  // Note: 'completed' stage should keep opportunities in place for tracking
  const clientConversionStages = ['published', 'paid', 'completed', 'active'];

  // Load opportunities from database when activeNiche changes
  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setIsLoading(true);
        
        // Fetch opportunities from API instead of localStorage
        const response = await fetch(`/api/opportunities?niche=${activeNiche}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to fetch opportunities: ${response.status} ${response.statusText}`);
        }
        const opportunities = await response.json();
        
              // Process raw opportunities to include custom fields for modal editing
      const processedRawOpportunities = opportunities.map((opp: any) => {
        // Use customFields from API response, fallback to parsing from notes if needed
        let customFields = opp.customFields || {};
        
        // If no customFields from API, try to parse from notes (legacy fallback)
        if (!opp.customFields || Object.keys(opp.customFields).length === 0) {
          try {
            if (opp.notes && opp.notes.startsWith('{')) {
              const parsed = JSON.parse(opp.notes);
              if (parsed.customFields) {
                customFields = parsed.customFields;
              }
            }
          } catch (error) {
            console.log('Could not parse custom fields from notes for raw opportunity:', opp.id);
          }
        }
        
        // Add expected_close_date to custom fields for freelancer opportunities
        if (activeNiche === 'freelancer' && opp.expected_close_date) {
          console.log('CRM Pipeline - Adding dueDate to customFields for freelancer in save:', {
            opportunityId: opp.id,
            expected_close_date: opp.expected_close_date,
            expected_close_date_type: typeof opp.expected_close_date
          });
          customFields = {
            ...customFields,
            dueDate: opp.expected_close_date
          };
        }
        

        
        return {
          ...opp,
          customFields
        };
      });
      
      // Store processed raw opportunities for modal editing
      setRawOpportunities(processedRawOpportunities);
        
        // Map database opportunities to UI format
        const uiOpportunities: Opportunity[] = opportunities.map((opp: any) => {
          // Try to get the original stage ID from notes metadata
          let stageId = mapDatabaseStatusToStageId(opp.status, activeNiche);
          let notes = opp.notes || '';
          let extractedCustomFields: Record<string, any> = {};
          
          try {
            if (opp.notes && opp.notes.startsWith('{')) {
              const metadata = JSON.parse(opp.notes);
              if (metadata.stageId && metadata.niche === activeNiche) {
                stageId = metadata.stageId;
                notes = metadata.notes || '';
              }
              // Extract custom fields from metadata
              if (metadata.customFields) {
                extractedCustomFields = metadata.customFields;
              }
            }
          } catch (error) {
            console.log('Could not parse notes metadata, using default mapping');
          }
          
          // Extract custom fields from the opportunity data
          let customFields: Record<string, any> = {
            notes: notes,
            tags: opp.tags,
            ...extractedCustomFields
          };

          // If the opportunity has customFields property, merge them
          if (opp.customFields) {
            customFields = {
              ...customFields,
              ...opp.customFields
            };
          }

          return {
            id: opp.id,
            clientName: opp.title,
            dealValue: opp.value,
            probability: opp.probability,
            nextAction: notes || 'Follow up',
            assignee: 'You',
            createdDate: opp.created_at,
            stageId: stageId,
            priority: 'medium',
            tags: opp.tags || [],
            niche: opp.niche,
            customFields: customFields,
            expected_close_date: opp.expected_close_date
          };
        });
        const nicheStages = getNicheStages(activeNiche);
        // Distribute opportunities across stages
        const stagesWithOpportunities = nicheStages.map(stage => ({
          ...stage,
          opportunities: uiOpportunities.filter(opp => opp.stageId === stage.id)
        }));
        setStages(stagesWithOpportunities);
      } catch (error) {
        console.error('Error loading opportunities:', error);
        
        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.error('Network error - possible causes:');
          console.error('1. Server not running');
          console.error('2. Authentication issue');
          console.error('3. CORS issue');
          console.error('4. Network connectivity problem');
        }
        
        // Show empty state instead of fallback to sample data
        const nicheStages = getNicheStages(activeNiche);
        const emptyStages = nicheStages.map(stage => ({
          ...stage,
          opportunities: []
        }));
        setStages(emptyStages);
      } finally {
        setIsLoading(false);
      }
    };
    loadOpportunities();
  }, [activeNiche]);


  const filteredStages = useMemo(() => {
    let filtered = stages;
    
    // Apply stage filter
    if (selectedStage !== "all") {
      filtered = stages.filter(stage => stage.id === selectedStage);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.map(stage => ({
        ...stage,
        opportunities: stage.opportunities.filter(opp => 
          opp.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (opp.customFields?.campaignName && opp.customFields.campaignName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (opp.tags && opp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
        )
      }));
    }
    
    return filtered;
  }, [stages, searchQuery, selectedStage]);

  const allOpportunities = useMemo(() => {
    return stages.flatMap(stage => stage.opportunities);
  }, [stages]);

  const totalValue = useMemo(() => {
    // Exclude opportunities in 'paid', 'completed', 'published', 'delivered', and 'archived' stages from potential value
    const excludedStageIds = ['paid', 'completed', 'published', 'delivered', 'archived'];
    return stages.reduce((total, stage) => {
      if (excludedStageIds.includes(stage.id)) return total;
      return total + stage.opportunities.reduce((stageTotal, opp) => {
        return stageTotal + opp.dealValue;
      }, 0);
    }, 0);
  }, [stages]);

  const handleDragStart = useCallback((e: React.DragEvent, opportunity: Opportunity) => {
    setDraggedItem(opportunity);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
    
    // Add visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedItem(null);
    setDragOverStage(null);
    
    // Reset visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we're leaving the drop zone entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverStage(null);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    setDragOverStage(null);

    if (draggedItem && draggedItem.stageId !== targetStageId) {
      try {
        // Get the current opportunity data to preserve existing notes
        const currentOpportunity = rawOpportunities.find(opp => opp.id === draggedItem.id);
        let currentNotes = '';
        let currentMetadata = {};
        
        try {
          if (currentOpportunity?.notes && currentOpportunity.notes.startsWith('{')) {
            const metadata = JSON.parse(currentOpportunity.notes);
            currentNotes = metadata.notes || '';
            currentMetadata = metadata;
          } else {
            currentNotes = currentOpportunity?.notes || '';
          }
        } catch (error) {
          currentNotes = currentOpportunity?.notes || '';
        }
        
        // Update metadata with new stage ID
        const updatedMetadata = {
          ...currentMetadata,
          notes: currentNotes,
          stageId: targetStageId,
          niche: activeNiche
        };
        
        // Update the opportunity in the database via API
        const response = await fetch(`/api/opportunities`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: draggedItem.id,
            status: mapStatusToDatabase(targetStageId, activeNiche),
            notes: JSON.stringify(updatedMetadata)
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update opportunity status');
        }

        // Update local state
        setStages(prevStages => 
          prevStages.map(stage => {
            if (stage.id === draggedItem.stageId) {
              // Remove from current stage
              return {
                ...stage,
                opportunities: stage.opportunities.filter(opp => opp.id !== draggedItem.id)
              };
            } else if (stage.id === targetStageId) {
              // Add to target stage
              return {
                ...stage,
                opportunities: [...stage.opportunities, { ...draggedItem, stageId: targetStageId }]
              };
            }
            return stage;
          })
        );

        // Check if moving to a client conversion stage
        if (clientConversionStages.includes(targetStageId)) {
          setConvertedOpportunity(draggedItem);
          setShowClientConversionModal(true);
        }
      } catch (error) {
        console.error('Error updating opportunity status:', error);
        alert('Failed to update opportunity status. Please try again.');
      }
    }
  }, [draggedItem, clientConversionStages, rawOpportunities, activeNiche]);

  const handleOpportunityClick = useCallback((opportunity: Opportunity) => {
    // Find the raw opportunity data for editing
    const rawOpportunity = rawOpportunities.find(opp => opp.id === opportunity.id);
    if (rawOpportunity) {
      // Create a stable reference to prevent unnecessary re-renders
      const stableOpportunity = {
        ...rawOpportunity,
        id: rawOpportunity.id,
        customFields: { ...rawOpportunity.customFields }
      };
      setSelectedOpportunity(stableOpportunity);
    } else {
      setSelectedOpportunity(opportunity);
    }
    setIsOpportunityModalOpen(true);
  }, [activeNiche, rawOpportunities]);

  const handleOpportunityDeleted = useCallback((opportunityId: string) => {
    // Update local state
    setStages(prevStages => 
      prevStages.map(stage => ({
        ...stage,
        opportunities: stage.opportunities.filter(opp => opp.id !== opportunityId)
      }))
    );
    
    console.log('Opportunity deleted from UI:', opportunityId);
  }, []);







  const handleAddOpportunity = useCallback((stageId?: string) => {
    setSelectedOpportunity(null);
    setAddOpportunityStage(stageId || null);
    setIsOpportunityModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsOpportunityModalOpen(false);
    setSelectedOpportunity(null);
    setAddOpportunityStage(null);
  }, []);

  const handleOpportunitySave = useCallback(async (formData: any) => {
    console.log('CRM Pipeline - handleOpportunitySave called with formData:', formData);
    setIsLoading(true);
    try {
      console.log('CRM Pipeline - Received form data:', formData);
      console.log('CRM Pipeline - Expected close date:', formData.expected_close_date);
      console.log('CRM Pipeline - Due date:', formData.customFields?.dueDate);
      
      // The formData is already in the correct format with title, description, etc.
      // We need to map the status properly based on the niche
      // Store the original stage ID in the notes field as JSON metadata
      const originalNotes = formData.notes || '';
      const notesWithMetadata = {
        notes: originalNotes,
        stageId: formData.status,
        niche: activeNiche
      };
      
      const opportunityData = {
        title: formData.title,
        description: formData.description,
        value: formData.value,
        status: mapStatusToDatabase(formData.status, activeNiche),
        type: formData.type,
        probability: formData.probability,
        expected_close_date: formData.expected_close_date,
        notes: JSON.stringify(notesWithMetadata),
        tags: formData.tags,
        niche: activeNiche,
        customFields: formData.customFields
      };
      
      console.log('CRM Pipeline - Using opportunity data:', opportunityData);
      console.log('CRM Pipeline - customFields being sent:', opportunityData.customFields);
      
      let savedOpportunity: DatabaseOpportunity;
      
      if (selectedOpportunity) {
        // Update existing opportunity via API
        const response = await fetch(`/api/opportunities`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: selectedOpportunity.id,
            ...opportunityData
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update opportunity');
        }
        
        savedOpportunity = await response.json();
      } else {
        // Create new opportunity via API
        const response = await fetch(`/api/opportunities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(opportunityData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create opportunity');
        }
        
        savedOpportunity = await response.json();
      }

      console.log('Successfully saved opportunity:', savedOpportunity);

      // Reload all opportunities from database to ensure UI is in sync
      const response = await fetch(`/api/opportunities?niche=${activeNiche}`);
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }
      const opportunities = await response.json();
      console.log('CRM Pipeline - Fresh opportunities from database:', opportunities.map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        expected_close_date: opp.expected_close_date,
        customFields: opp.customFields,
        niche: opp.niche
      })));
      
      // Log which opportunities are being processed for cards
      console.log('CRM Pipeline - Processing opportunities for cards:', opportunities.map((opp: any) => ({
        id: opp.id,
        niche: opp.niche,
        expected_close_date: opp.expected_close_date
      })));
      
      // Force a re-render by updating the raw opportunities state
      setRawOpportunities(opportunities);
      console.log('CRM Pipeline - Updated raw opportunities state with fresh data');
      
      // Process raw opportunities to include custom fields for modal editing
      const processedRawOpportunities = opportunities.map((opp: any) => {
        // Use custom fields directly from the API response
        let customFields: Record<string, any> = opp.customFields || {};
        
        // Fallback to parsing from notes for backward compatibility
        if (!customFields || Object.keys(customFields).length === 0) {
          try {
            if (opp.notes && opp.notes.startsWith('{')) {
              const parsed = JSON.parse(opp.notes);
              if (parsed.customFields) {
                customFields = parsed.customFields;
              }
            }
          } catch (error) {
            console.log('Could not parse custom fields from notes for raw opportunity:', opp.id);
          }
        }
        
        // Add expected_close_date to custom fields for freelancer opportunities
        if (activeNiche === 'freelancer' && opp.expected_close_date) {
          console.log('CRM Pipeline - Adding dueDate to customFields for freelancer:', {
            opportunityId: opp.id,
            expected_close_date: opp.expected_close_date,
            expected_close_date_type: typeof opp.expected_close_date
          });
          customFields = {
            ...customFields,
            dueDate: opp.expected_close_date
          };
        }
        
        // For freelancer opportunities, ensure companyName and projectTitle are populated
        if (activeNiche === 'freelancer') {
          if (!customFields.companyName && opp.title) {
            customFields = {
              ...customFields,
              companyName: opp.title
            };
          }
          if (!customFields.projectTitle && opp.description) {
            customFields = {
              ...customFields,
              projectTitle: opp.description
            };
          }
        }
        
        return {
          ...opp,
          customFields
        };
      });
      
      // Store processed raw opportunities for modal editing
      // Create stable references to prevent unnecessary re-renders in modal
      const stableRawOpportunities = processedRawOpportunities.map((opp: any) => ({
        ...opp,
        // Ensure stable reference by creating a new object with stable properties
        id: opp.id,
        customFields: { ...opp.customFields }
      }));
      setRawOpportunities(stableRawOpportunities);
      
              // Map database opportunities to UI format
        const uiOpportunities: Opportunity[] = opportunities.map((opp: any) => {
          // Try to get the original stage ID from notes metadata
          let stageId = mapDatabaseStatusToStageId(opp.status, activeNiche);
          let notes = opp.notes || '';
          
          try {
            if (opp.notes && opp.notes.startsWith('{')) {
              const metadata = JSON.parse(opp.notes);
              if (metadata.stageId && metadata.niche === activeNiche) {
                stageId = metadata.stageId;
                notes = metadata.notes || '';
              }
            }
          } catch (error) {
            console.log('Could not parse notes metadata, using default mapping');
          }
          
          console.log('CRM Pipeline - Mapping opportunity:', { id: opp.id, dbStatus: opp.status, mappedStageId: stageId, niche: activeNiche, title: opp.title });
        
        // Use custom fields directly from the API response
        let customFields = opp.customFields || {};
        
        // Fallback to parsing from notes for backward compatibility
        if (!customFields || Object.keys(customFields).length === 0) {
          try {
            if (opp.notes && opp.notes.startsWith('{')) {
              const parsed = JSON.parse(opp.notes);
              if (parsed.customFields) {
                customFields = parsed.customFields;
              }
            }
          } catch (error) {
            console.log('Could not parse custom fields from notes for opportunity:', opp.id);
          }
        }
        
        // Add expected_close_date to custom fields for freelancer opportunities
        if (activeNiche === 'freelancer' && opp.expected_close_date) {
          customFields = {
            ...customFields,
            dueDate: opp.expected_close_date
          };
        }
        
        return {
          id: opp.id,
          clientName: opp.title,
          dealValue: opp.value,
          probability: opp.probability,
          nextAction: notes || 'Follow up',
          assignee: 'You',
          createdDate: opp.created_at,
          stageId: stageId,
          priority: 'medium',
          tags: opp.tags || [],
          niche: activeNiche,
          expected_close_date: opp.expected_close_date,
          customFields: {
            ...customFields,
            notes: notes,
            tags: opp.tags
          }
        };
      });

      const nicheStages = getNicheStages(activeNiche);
      
      // Distribute opportunities across stages
      const stagesWithOpportunities = nicheStages.map(stage => ({
        ...stage,
        opportunities: uiOpportunities.filter(opp => opp.stageId === stage.id)
      }));
      
      setStages(stagesWithOpportunities);
      console.log('Reloaded opportunities:', uiOpportunities.length);
      
      // Check if this is an existing opportunity and the stage has changed to a trigger stage
      const stageChanged = selectedOpportunity && selectedOpportunity.stageId !== savedOpportunity.status;
      
      // Get the original stage ID from the saved opportunity's notes metadata
      let originalStageId = mapDatabaseStatusToStageId(savedOpportunity.status, activeNiche);
      try {
        if (savedOpportunity.notes && savedOpportunity.notes.startsWith('{')) {
          const metadata = JSON.parse(savedOpportunity.notes);
          if (metadata.stageId && metadata.niche === activeNiche) {
            originalStageId = metadata.stageId;
          }
        }
      } catch (error) {
        console.log('Could not parse notes metadata for client conversion check');
      }
      
      const movedToTriggerStage = clientConversionStages.includes(originalStageId);
      
      // Show notification if stage changed to a trigger stage
      if (stageChanged && movedToTriggerStage) {
        console.log('Triggering client conversion modal for:', savedOpportunity.title, 'stage:', originalStageId);
        const uiOpportunity = uiOpportunities.find(opp => opp.id === savedOpportunity.id);
        if (uiOpportunity) {
          setConvertedOpportunity(uiOpportunity);
          setShowClientConversionModal(true);
        }
      }
      
      console.log('CRM Pipeline - handleOpportunitySave completed successfully');
      handleModalClose();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      // You might want to show a toast notification here
      alert('Failed to save opportunity. Please try again.');
    } finally {
      console.log('CRM Pipeline - handleOpportunitySave finally block executed');
      setIsLoading(false);
    }
  }, [selectedOpportunity, handleModalClose, clientConversionStages, activeNiche]);

  const renderOpportunityCard = useCallback((opportunity: Opportunity, stage: PipelineStage, isDraggable = false, isExpandable = false) => {
    const commonProps = {
      opportunity,
      stage,
      onClick: () => handleOpportunityClick(opportunity),
      onOpportunityDeleted: handleOpportunityDeleted,
      className: "mb-3",
      disableClick: isExpandable
    };

    const cardElement = (() => {
      switch (activeNiche) {
        case 'coach': {
          // Convert discoveryCallDate string to ISO string if it exists
          let discoveryCallDate = new Date().toISOString();
          if (opportunity.customFields?.discoveryCallDate) {
            try {
              // Parse the date string to avoid timezone conversion issues
              const date = new Date(opportunity.customFields.discoveryCallDate);
              
              // Extract the date components in UTC to avoid timezone shifts
              const year = date.getUTCFullYear();
              const month = date.getUTCMonth();
              const day = date.getUTCDate();
              
              // Create a new date object with the local date components and convert to ISO string
              const localDate = new Date(year, month, day);
              discoveryCallDate = localDate.toISOString();
            } catch (error) {
              console.log('Could not parse discoveryCallDate:', opportunity.customFields.discoveryCallDate);
              discoveryCallDate = new Date().toISOString();
            }
          } else if (opportunity.expected_close_date) {
            try {
              // Parse the date string to avoid timezone conversion issues
              const date = new Date(opportunity.expected_close_date);
              
              // Extract the date components in UTC to avoid timezone shifts
              const year = date.getUTCFullYear();
              const month = date.getUTCMonth();
              const day = date.getUTCDate();
              
              // Create a new date object with the local date components and convert to ISO string
              const localDate = new Date(year, month, day);
              discoveryCallDate = localDate.toISOString();
            } catch (error) {
              console.log('Could not parse expected_close_date for discoveryCallDate:', opportunity.expected_close_date);
              discoveryCallDate = new Date().toISOString();
            }
          }
          
          const coachOpportunity = {
            id: opportunity.id,
            clientName: opportunity.clientName,
            programName: opportunity.customFields?.programName || 'Program',
            packageType: opportunity.customFields?.packageType || 'Package',
            proposedValue: opportunity.customFields?.proposedValue || opportunity.dealValue,
            discoveryCallDate: discoveryCallDate,
            notes: opportunity.customFields?.notes || '',
            priority: opportunity.priority || 'medium',
            lastContact: opportunity.customFields?.lastContact || opportunity.createdDate,
            sessionCount: opportunity.customFields?.sessionCount,
            duration: opportunity.customFields?.duration
          };
          const coachStage = {
            name: stage.name,
            color: stage.color,
            progress: opportunity.probability
          };
          return (
            <CoachOpportunityCard 
              opportunity={coachOpportunity}
              stage={coachStage}
              onClick={() => handleOpportunityClick(opportunity)}
              onOpportunityDeleted={handleOpportunityDeleted}
              className="mb-3"
              disableClick={isExpandable}
            />
          );
        }
        case 'podcaster': {
          // Convert scheduledDate string to ISO string if it exists
          let scheduledDate = '';
          if (opportunity.customFields?.scheduledDate) {
            try {
              // Parse the date string to avoid timezone conversion issues
              const date = new Date(opportunity.customFields.scheduledDate);
              
              // Extract the date components in UTC to avoid timezone shifts
              const year = date.getUTCFullYear();
              const month = date.getUTCMonth();
              const day = date.getUTCDate();
              
              // Create a new date object with the local date components and convert to ISO string
              const localDate = new Date(year, month, day);
              scheduledDate = localDate.toISOString();
            } catch (error) {
              console.log('Could not parse scheduledDate:', opportunity.customFields.scheduledDate);
              scheduledDate = '';
            }
          } else if (opportunity.expected_close_date) {
            try {
              // Parse the date string to avoid timezone conversion issues
              const date = new Date(opportunity.expected_close_date);
              
              // Extract the date components in UTC to avoid timezone shifts
              const year = date.getUTCFullYear();
              const month = date.getUTCMonth();
              const day = date.getUTCDate();
              
              // Create a new date object with the local date components and convert to ISO string
              const localDate = new Date(year, month, day);
              scheduledDate = localDate.toISOString();
            } catch (error) {
              console.log('Could not parse expected_close_date for scheduledDate:', opportunity.expected_close_date);
              scheduledDate = '';
            }
          }
          
          const podcasterOpportunity = {
            id: opportunity.id,
            guestOrSponsorName: opportunity.customFields?.guestOrSponsorName || opportunity.clientName,
            episodeTitle: opportunity.customFields?.episodeTitle,
            sponsorshipCampaign: opportunity.customFields?.sponsorshipCampaign,
            scheduledDate: scheduledDate,
            sponsorshipValue: opportunity.customFields?.sponsorshipValue,
            type: opportunity.customFields?.type || 'Guest',
            confirmed: opportunity.customFields?.confirmed || false,
            paid: opportunity.customFields?.paid || false,
            notes: opportunity.customFields?.notes
          };
          return (
            <PodcasterOpportunityCard 
              opportunity={podcasterOpportunity}
              stage={stage}
              onClick={() => handleOpportunityClick(opportunity)}
              onOpportunityDeleted={handleOpportunityDeleted}
              className="mb-3"
              disableClick={isExpandable}
            />
          );
        }
        case 'freelancer': {
          // Convert dueDate string to Date object if it exists
          console.log('Processing freelancer opportunity:', {
            id: opportunity.id,
            customFields: opportunity.customFields,
            expected_close_date: opportunity.expected_close_date
          });
          
          let dueDate: Date | undefined = undefined;
          
          // First try to parse from customFields.dueDate
          if (opportunity.customFields?.dueDate) {
            try {
              const dateString = opportunity.customFields.dueDate;
              // Parse the date string to avoid timezone conversion issues
              const date = new Date(dateString);
              
              // Extract the date components in UTC to avoid timezone shifts
              const year = date.getUTCFullYear();
              const month = date.getUTCMonth();
              const day = date.getUTCDate();
              
              // Create a new date object with the local date components
              dueDate = new Date(year, month, day);
              console.log('Parsed dueDate from customFields:', dueDate, 'Original:', opportunity.customFields.dueDate);
            } catch (error) {
              console.log('Could not parse dueDate from customFields:', opportunity.customFields.dueDate);
            }
          }
          
          // If customFields.dueDate parsing failed or doesn't exist, try expected_close_date
          if (!dueDate && opportunity.expected_close_date) {
            try {
              const dateString = opportunity.expected_close_date;
              // Parse the date string to avoid timezone conversion issues
              const date = new Date(dateString);
              
              // Extract the date components in UTC to avoid timezone shifts
              const year = date.getUTCFullYear();
              const month = date.getUTCMonth();
              const day = date.getUTCDate();
              
              // Create a new date object with the local date components
              dueDate = new Date(year, month, day);
              console.log('Parsed dueDate from expected_close_date:', dueDate, 'Original:', opportunity.expected_close_date);
            } catch (error) {
              console.log('Could not parse expected_close_date:', opportunity.expected_close_date);
            }
          }
          
          if (!dueDate) {
            console.log('No valid date found for freelancer opportunity');
          }
          
          const freelancerOpportunity = {
            id: opportunity.id,
            clientName: opportunity.clientName,
            projectTitle: opportunity.customFields?.projectTitle || 'Project',
            projectValue: opportunity.customFields?.projectValue || opportunity.dealValue,
            dueDate: dueDate,
            hasAttachments: opportunity.customFields?.hasAttachments || false,
            status: opportunity.customFields?.status || 'New',
            description: opportunity.customFields?.description
          };
          
          console.log('CRM Pipeline - Created freelancer opportunity for card:', {
            id: freelancerOpportunity.id,
            dueDate: freelancerOpportunity.dueDate,
            dueDateType: typeof freelancerOpportunity.dueDate,
            dueDateString: freelancerOpportunity.dueDate ? freelancerOpportunity.dueDate.toISOString() : 'undefined',
            customFieldsDueDate: opportunity.customFields?.dueDate,
            expectedCloseDate: opportunity.expected_close_date,
            opportunityId: opportunity.id
          });
          return (
            <FreelancerOpportunityCard 
              opportunity={freelancerOpportunity}
              stage={stage}
              onClick={() => handleOpportunityClick(opportunity)}
              onOpportunityDeleted={handleOpportunityDeleted}
              className="mb-3"
              disableClick={isExpandable}
            />
          );
        }
        default: { // creator
          // Convert followUpDate string to ISO string if it exists
          let nextFollowUpDate = new Date().toISOString();
          if (opportunity.customFields?.followUpDate) {
            try {
              // Parse the date string to avoid timezone conversion issues
              const date = new Date(opportunity.customFields.followUpDate);
              
              // Extract the date components in UTC to avoid timezone shifts
              const year = date.getUTCFullYear();
              const month = date.getUTCMonth();
              const day = date.getUTCDate();
              
              // Create a new date object with the local date components and convert to ISO string
              const localDate = new Date(year, month, day);
              nextFollowUpDate = localDate.toISOString();
            } catch (error) {
              console.log('Could not parse followUpDate:', opportunity.customFields.followUpDate);
              nextFollowUpDate = new Date().toISOString();
            }
          } else if (opportunity.expected_close_date) {
            try {
              // Parse the date string to avoid timezone conversion issues
              const date = new Date(opportunity.expected_close_date);
              
              // Extract the date components in UTC to avoid timezone shifts
              const year = date.getUTCFullYear();
              const month = date.getUTCMonth();
              const day = date.getUTCDate();
              
              // Create a new date object with the local date components and convert to ISO string
              const localDate = new Date(year, month, day);
              nextFollowUpDate = localDate.toISOString();
            } catch (error) {
              console.log('Could not parse expected_close_date for followUpDate:', opportunity.expected_close_date);
              nextFollowUpDate = new Date().toISOString();
            }
          }
          
          const creatorOpportunity = {
            id: opportunity.id,
            campaignName: opportunity.customFields?.campaignName || opportunity.clientName,
            brandName: opportunity.customFields?.brandName || opportunity.clientName,
            dealValue: opportunity.customFields?.dealValue || opportunity.dealValue,
            deliverables: opportunity.customFields?.deliverables || [],
            platforms: opportunity.customFields?.platforms || [],
            nextFollowUpDate: nextFollowUpDate,
            tags: opportunity.tags || [],
            contactName: opportunity.customFields?.contactName || opportunity.assignee,
            contactEmail: opportunity.customFields?.contactEmail,
            contactPhone: opportunity.customFields?.contactPhone,
            hasContract: opportunity.customFields?.contractUploaded || false,
            contractLink: opportunity.customFields?.contractLink,
            priority: opportunity.priority || 'medium',
            notes: opportunity.customFields?.notes
          };
          return (
            <CreatorOpportunityCard 
              opportunity={creatorOpportunity}
              stage={stage}
              onClick={() => handleOpportunityClick(opportunity)}
              onOpportunityDeleted={handleOpportunityDeleted}
              className="mb-3"
              disableClick={isExpandable}
            />
          );
        }
      }
    })();

    if (isDraggable && view === 'board') {
      return (
        <div 
          key={opportunity.id}
          draggable
          onDragStart={(e) => handleDragStart(e, opportunity)}
          onDragEnd={handleDragEnd}
          className="cursor-move"
        >
          {cardElement}
        </div>
      );
    }

    return cardElement;
  }, [activeNiche, handleOpportunityClick, handleOpportunityDeleted, handleDragStart, handleDragEnd, view]);

  const renderBoardView = () => {
    // Filter stages based on selectedStage
    const stagesToShow = selectedStage === "all" 
      ? filteredStages 
      : filteredStages.filter(stage => stage.id === selectedStage);

    return (
      <div className="flex gap-6 min-w-fit">
        {stagesToShow.map((stage) => {
          const isDropTarget = dragOverStage === stage.id && draggedItem;
          
          // Sort opportunities by created date (most recent first) and get the most recent one
          const sortedOpportunities = [...stage.opportunities].sort((a, b) => 
            new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
          );
          const mostRecentOpportunity = sortedOpportunities[0];
          const otherOpportunities = sortedOpportunities.slice(1);
          
          return (
            <div 
              key={stage.id} 
              className={`flex-shrink-0 w-80 transition-all duration-200 ${
                isDropTarget ? 'bg-emerald-50/50 rounded-lg' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    {stage.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {stage.opportunities.length}
                  </Badge>
                </div>
              </div>
              
              {isDropTarget && (
                <div className="mb-3 p-3 border-2 border-dashed border-emerald-400 rounded-lg bg-emerald-50 text-center">
                  <p className="text-sm text-emerald-600 font-medium">
                    Drop here to move to {stage.name}
                  </p>
                </div>
              )}
              
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {mostRecentOpportunity && (
                  <motion.div
                    key={mostRecentOpportunity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      {renderOpportunityCard(mostRecentOpportunity, stage, true, true)}
                      {otherOpportunities.length > 0 && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          +{otherOpportunities.length}
                        </div>
                      )}
                      {otherOpportunities.length > 0 && (
                        <div className="absolute bottom-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                          View all ({otherOpportunities.length + 1})
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpportunityClick(mostRecentOpportunity);
                        }}
                        className="absolute top-2 left-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </motion.div>
                )}
                

                
                {stage.opportunities.length === 0 && (
                  <div className="text-center py-6">
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200/50 p-4">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm">
                          <Plus className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            No opportunities in {stage.name}
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            Add your first opportunity to get started
                          </p>
                        </div>
                        <Button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            handleAddOpportunity(stage.id);
                          }}
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Opportunity
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    // Filter opportunities based on selected stage
    const opportunitiesToShow = selectedStage === "all" 
      ? allOpportunities 
      : allOpportunities.filter(opp => opp.stageId === selectedStage);

    return (
      <div className="space-y-4">
        {opportunitiesToShow.map((opportunity) => {
          const stage = stages.find(s => s.id === opportunity.stageId);
          return stage ? (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hover:shadow-md transition-shadow"
            >
              <div className="relative">
                {renderOpportunityCard(opportunity, stage, false, true)}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpportunityClick(opportunity);
                  }}
                  className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full transition-colors"
                >
                  Edit
                </button>
              </div>
            </motion.div>
          ) : null;
        })}
        
        {opportunitiesToShow.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div>
              {selectedStage !== "all" && allOpportunities.length > 0 
                ? `No opportunities found in ${stages.find(s => s.id === selectedStage)?.name || selectedStage} stage`
                : "No opportunities found"
              }
            </div>
          </div>
        )}
      </div>
    );
  };



  return (
    <div className={`flex flex-col h-full ${
      activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
        ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100' 
        : 'bg-background'
    }`}>
      <div className={`border-b p-6 ${
        activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
          ? 'bg-white/40 backdrop-blur-md border-slate-200/50 shadow-xl' 
          : 'bg-card'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h1 className={`text-2xl font-semibold ${
              activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer' ? 'text-slate-900' : 'text-foreground'
            }`}>{getNicheName(activeNiche)}</h1>
            <Badge 
              variant="secondary" 
              className={`text-sm ${
                activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                  : ''
              }`}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              ${totalValue.toLocaleString()} potential value
            </Badge>
          </div>
          <Button 
            onClick={() => handleAddOpportunity()} 
            className={`gap-2 ${
              activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300' 
                : ''
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Opportunity
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${
                activeNiche === 'creator' 
                  ? 'bg-white/30 backdrop-blur-md border-slate-300/70 focus:border-blue-500 focus:ring-blue-500' 
                  : ''
              }`}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className={`w-40 ${
                activeNiche === 'creator' 
                  ? 'bg-white/30 backdrop-blur-md border-slate-300/70 focus:border-blue-500 focus:ring-blue-500' 
                  : ''
              }`}>
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages ({allOpportunities.length})</SelectItem>
                {stages.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name} ({stage.opportunities.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className={`flex rounded-md ${
              activeNiche === 'creator' 
                ? 'border border-slate-300/70 bg-white/30 backdrop-blur-md' 
                : 'border border-slate-200'
            }`}>
              <Button
                variant={view === "board" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("board")}
                className={`rounded-r-none ${
                  activeNiche === 'creator' && view === "board"
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : ''
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                className={`rounded-l-none ${
                  activeNiche === 'creator' && view === "list"
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : ''
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {view === "board" && (
          <div className={`mt-4 p-3 rounded-lg ${
            activeNiche === 'creator' 
              ? 'bg-blue-50/80 backdrop-blur-sm border border-blue-200' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center gap-2 text-blue-700">
              <div className="text-lg">✋</div>
              <span className="text-sm font-medium">Drag & Drop Enabled - Move opportunities between stages by dragging</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        {view === "board" && renderBoardView()}
        {view === "list" && renderListView()}
      </div>
      
              <OpportunityModal
          isOpen={isOpportunityModalOpen}
          onClose={handleModalClose}
          opportunity={selectedOpportunity}
          onSave={handleOpportunitySave}
          userNiche={activeNiche}
          isLoading={isLoading}
        />

        
        {/* Client Conversion Notification Modal */}
      <Dialog open={showClientConversionModal} onOpenChange={setShowClientConversionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              Convert to Client
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Great news! You've moved <strong>{convertedOpportunity?.clientName}</strong> to the <strong>{stages.find(s => s.id === convertedOpportunity?.stageId)?.name}</strong> stage.
              </p>
              <p className="text-sm text-muted-foreground">
                Would you like to add them as a client in your contacts?
              </p>
              {convertedOpportunity?.stageId === 'completed' && (
                <p className="text-xs text-blue-600 mt-2">
                  💡 This opportunity will remain in the Completed stage for revenue tracking
                </p>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs">💡</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Benefits of adding as a client:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Track their contact information</li>
                    <li>• Add notes and follow-up reminders</li>
                    <li>• Link to future opportunities</li>
                    <li>• Generate client reports</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => {
                  setShowClientConversionModal(false);
                  setConvertedOpportunity(null);
                  // Navigate to clients page with pre-filled data
                  router.push(`/dashboard?section=clients&addClient=true&name=${encodeURIComponent(convertedOpportunity?.clientName || '')}&email=${encodeURIComponent(convertedOpportunity?.customFields?.email || '')}&status=active`);
                }}
                className="flex-1"
              >
                Add as Client
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowClientConversionModal(false);
                  setConvertedOpportunity(null);
                }}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
