"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { createBulletproofDateHandler } from '@/lib/date-utils';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  FileText,
  Video,
  Users,
  Mic,
  Briefcase,
  Edit3,
  Trash2,
  MoreVertical,
  Eye,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Target,
  Link,
  User,
  Star,
  Play,
  DollarSign,
  Edit,
  Copy,
  Archive,
  Brain,
  CalendarCheck,
  BarChart,
  MessageCircle,
  Activity,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  stage: string;
  type?: string;
  platform?: string;
  brand?: string;
  creationDate?: string;
  postDate?: string;
  hashtags?: string[];
  hook?: string;
  notes?: string;
  analytics?: {
    views: number;
    likes: number;
    comments: number;
  };
  // Coach program specific
  length?: string;
  price?: number;
  enrolled?: number;
  milestones?: number;
  programType?: string;
  customProgramType?: string;
  revenue?: number;
  startDate?: string;
  endDate?: string;
  clientProgress?: string;
  hostingPlatform?: string;
  enrollmentDeadline?: string;
  // Podcast specific
  guest?: string;
  sponsor?: string;
  duration?: string;
  customDuration?: string;
  topics?: string;
  script?: string;
  // Freelancer specific
  client?: string;
  deadline?: string;
  budget?: number;
  deliverables?: string[];
  // Additional date fields that might be missing
  created_at?: string;
  updated_at?: string;
}

const nicheConfigs: Record<string, {
  name: string;
  icon: React.ComponentType<any>;
  stages: string[];
  stageColors: Record<string, string>;
}> = {
  creator: {
    name: "Content Dashboard",
    icon: Video,
    stages: ["idea", "script", "filming/writing", "editing", "scheduled", "posted", "archived"],
    stageColors: {
      "idea": "bg-gray-100 text-gray-800",
      "script": "bg-blue-100 text-blue-800",
      "filming/writing": "bg-yellow-100 text-yellow-800", 
      "editing": "bg-orange-100 text-orange-800",
      "scheduled": "bg-purple-100 text-purple-800",
      "posted": "bg-green-100 text-green-800",
      "archived": "bg-slate-100 text-slate-800"
    }
  },
  coach: {
    name: "Programs Dashboard",
    icon: Users,
    stages: ["Draft", "Active", "Completed", "Archived"],
    stageColors: {
      "Draft": "bg-blue-100 text-blue-800",
      "Active": "bg-emerald-100 text-emerald-800",
      "Completed": "bg-green-100 text-green-800",
      "Archived": "bg-slate-100 text-slate-800"
    }
  },
  podcaster: {
    name: "Episodes Hub",
    icon: Mic,
    stages: ["idea", "script", "filming/writing", "editing", "scheduled", "posted", "archived"],
    stageColors: {
      "idea": "bg-gray-100 text-gray-800",
      "script": "bg-blue-100 text-blue-800",
      "filming/writing": "bg-yellow-100 text-yellow-800",
      "editing": "bg-orange-100 text-orange-800",
      "scheduled": "bg-purple-100 text-purple-800",
      "posted": "bg-green-100 text-green-800",
      "archived": "bg-slate-100 text-slate-800"
    }
  },
  freelancer: {
    name: "Projects Hub",
    icon: Briefcase,
    stages: ["Inquiry", "Proposal", "Contract", "Execution", "Delivery", "Payment"],
    stageColors: {
      "Inquiry": "bg-gray-100 text-gray-800",
      "Proposal": "bg-blue-100 text-blue-800",
      "Contract": "bg-yellow-100 text-yellow-800",
      "Execution": "bg-orange-100 text-orange-800",
      "Delivery": "bg-emerald-100 text-emerald-800",
      "Payment": "bg-green-100 text-green-800"
    }
  }
};

interface ProgramsContentHubProps {
  activeNiche?: string;
  onNavigate?: (section: string) => void;
}

export const ProgramsContentHub = ({ activeNiche = "creator" }: ProgramsContentHubProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [draggedItem, setDraggedItem] = useState<ContentItem | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [createWithStage, setCreateWithStage] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<{ [key: string]: string }>({});
  
  // Create bulletproof date handler
  const dateHandler = createBulletproofDateHandler();
  const [editFormData, setEditFormData] = useState({
    // Content Info (for creator)
    contentTitle: "",
    platform: [] as string[],
    postType: "",
    status: "Idea",
    // Podcast-specific fields
    episodeTitle: "",
    guest: "",
    sponsor: "",
    duration: "",
    customDuration: "",
    topics: "",
    script: "",
    
    // Creative & Strategy (for creator)
    hook: "",
    concept: "",
    hashtags: "",
    description: "",
    
    // Schedule & Workflow (for creator)
    creationDate: "",
    publishDate: "",
    deadline: "",
    
    // Analytics (for creator)
    views: "",
    likes: "",
    comments: "",
    shares: "",
    saves: "",
    revenue: "",
    
    // Notes & Extras (for creator)
    notes: "",
    collaborationTag: "",
    repurposeTag: "",
    
    // Program Details (for coach)
    programName: "",
    programType: "",
    customProgramType: "",
    programStatus: "Draft",
    
    // Structure & Curriculum (for coach)
    programOverview: "",
    sessionCount: "",
    deliveryFormat: "",
    supportOffered: "",
    
    // Pricing & Sales Info (for coach)
    price: "",
    paymentOptions: "",
    enrollmentLink: "",
    tags: "",
    
    // Client Enrollment (for coach)
    enrollmentType: "",
    clientLimit: "",
    currentEnrollments: "",
    enrollmentDeadline: "",
    
    // Schedule & Timeline (for coach)
    startDate: "",
    endDate: "",
    linkedEvents: "",
    progressMilestones: "",
    hostingPlatform: "",
    
    // Budget & Payment (for freelancer)
    budget: "",
    paymentTerms: "",
    milestonePayments: "",
    
    // Project Management (for freelancer)
    projectStartDate: "",
    dueDate: "",
    projectManager: "",
    teamMembers: "",
    
    // Technical Details (for freelancer)
    technology: "",
    integrations: "",
    
    // Freelancer-specific fields
    clientName: ""
  });
  const [createFormData, setCreateFormData] = useState({
    // Content Info (for creator)
    contentTitle: "",
    platform: [] as string[],
    postType: "",
    status: "Idea",
    // Podcast-specific fields
    episodeTitle: "",
    guest: "",
    sponsor: "",
    duration: "",
    customDuration: "",
    topics: "",
    script: "",
    
    // Creative & Strategy (for creator)
    hook: "",
    concept: "",
    hashtags: "",
    description: "",
    
    // Schedule & Workflow (for creator)
    creationDate: "",
    publishDate: "",
    deadline: "",
    
    // Analytics (for creator)
    views: "",
    likes: "",
    comments: "",
    shares: "",
    saves: "",
    revenue: "",
    
    // Notes & Extras (for creator)
    notes: "",
    collaborationTag: "",
    repurposeTag: "",
    
    // Program Details (for coach)
    programName: "",
    programType: "",
    customProgramType: "",
    programStatus: "Draft",
    
    // Structure & Curriculum (for coach)
    programOverview: "",
    sessionCount: "",
    deliveryFormat: "",
    supportOffered: "",
    
    // Pricing & Sales Info (for coach)
    price: "",
    paymentOptions: "",
    enrollmentLink: "",
    tags: "",
    
    // Client Enrollment (for coach)
    enrollmentType: "",
    clientLimit: "",
    currentEnrollments: "",
    enrollmentDeadline: "",
    
    // Scheduling & Progress (for coach)
    linkedEvents: "",
    progressMilestones: "",
    
    // Schedule & Timeline (for coach)
    startDate: "",
    endDate: "",
    
    // Program Hosting Platform (for coach)
    hostingPlatform: "",
    
    // Project Details (for freelancer)
    projectName: "",
    projectType: "",
    clientName: "",
    projectStatus: "Inquiry",
    
    // Project Scope & Requirements (for freelancer)
    projectDescription: "",
    deliverables: "",
    requirements: "",
    timeline: "",
    
    // Budget & Payment (for freelancer)
    budget: "",
    paymentTerms: "",
    milestonePayments: "",
    
    // Project Management (for freelancer)
    projectStartDate: "",
    dueDate: "",
    projectManager: "",
    teamMembers: "",
    
    // Technical Details (for freelancer)
    technology: "",
    integrations: ""
  });

  // Handle URL parameters for edit mode
  useEffect(() => {
    const editParam = searchParams.get('edit');
    console.log('URL edit parameter:', editParam);
    console.log('Available items:', items.length);
    console.log('Items IDs:', items.map(item => item.id));
    
    if (editParam) {
      if (items.length > 0) {
        const itemToEdit = items.find(item => item.id === editParam);
        console.log('Found item to edit:', itemToEdit);
        
        if (itemToEdit) {
          setSelectedItem(itemToEdit);
          // Open the modal and populate the form data
          setIsDetailModalOpen(true);
          setTimeout(() => {
            handleEditItem();
          }, 0);
          // Clear the edit parameter from URL
          const url = new URL(window.location.href);
          url.searchParams.delete('edit');
          window.history.replaceState({}, '', url.toString());
        } else {
          console.warn('Item not found for edit ID:', editParam);
        }
      } else {
        console.log('Items not loaded yet, will retry when items are available');
        // If items aren't loaded yet, we'll retry when they are
      }
    }
  }, [searchParams, items]);

  // API Functions
  const fetchContentItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/content-items?niche=${activeNiche}&t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch content items');
      }
      
      const data = await response.json();
      
      // Debug: Check raw database response
      console.log('=== RAW DATABASE RESPONSE DEBUG ===');
      console.log('Raw data from API:', data);
      if (Array.isArray(data) && data.length > 0) {
        console.log('First item raw data:', data[0]);
        console.log('First item post_date:', data[0].post_date);
        console.log('First item start_date:', data[0].start_date);
        console.log('First item end_date:', data[0].end_date);
        console.log('First item deadline:', data[0].deadline);
        console.log('First item enrollment_deadline:', data[0].enrollment_deadline);
      }
      
      // Transform database data to match ContentItem interface
      const transformedItems: ContentItem[] = (Array.isArray(data) ? data : []).map((item: any) => {
        // Debug: Check what we're transforming
        console.log('=== TRANSFORMATION DEBUG ===');
        console.log('Raw item.post_date:', item.post_date);
        console.log('Raw item.start_date:', item.start_date);
        console.log('Raw item.end_date:', item.end_date);
        console.log('Raw item.deadline:', item.deadline);
        console.log('Raw item.enrollment_deadline:', item.enrollment_deadline);
        
        return {
          id: item.id,
          title: item.title,
          stage: item.stage,
          type: item.type,
          platform: item.platform,
          brand: item.brand,
          creationDate: item.creation_date,
          postDate: item.post_date,
          hashtags: item.hashtags || [],
          hook: item.hook,
          notes: item.notes,
        analytics: item.views || item.likes || item.comments ? {
          views: item.views || 0,
          likes: item.likes || 0,
          comments: item.comments || 0
        } : undefined,
        length: item.length,
        price: item.price,
        enrolled: item.enrolled,
        milestones: item.milestones,
        programType: item.program_type,
        customProgramType: item.custom_program_type,
        revenue: item.revenue,
        startDate: item.start_date,
        endDate: item.end_date,
        enrollmentDeadline: item.enrollment_deadline,
        clientProgress: item.client_progress,
        hostingPlatform: item.hosting_platform,
        guest: item.guest,
        sponsor: item.sponsor,
        duration: item.duration,
        customDuration: item.custom_duration,
        topics: item.topics,
        script: item.script,
        client: item.client,
        deadline: item.deadline,
        budget: item.budget,
        deliverables: item.deliverables || [],
        created_at: item.created_at,
        updated_at: item.updated_at
        };
      });
      
      setItems(transformedItems);
    } catch (err) {
      console.error('Error fetching content items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content items');
    } finally {
      setIsLoading(false);
    }
  };

  const createContentItem = async (itemData: any) => {
    try {
      console.log('=== createContentItem DEBUG ===');
      console.log('Creating content item:', itemData);
      console.log('JSON.stringify(itemData):', JSON.stringify(itemData, null, 2));
      
      // Debug: Check specific date fields
      console.log('=== CREATE DATE FIELD CHECK ===');
      console.log('itemData.postDate:', itemData.postDate);
      console.log('itemData.startDate:', itemData.startDate);
      console.log('itemData.endDate:', itemData.endDate);
      console.log('itemData.deadline:', itemData.deadline);
      console.log('itemData.enrollmentDeadline:', itemData.enrollmentDeadline);
      
      const response = await fetch('/api/content-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to create content item: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      await fetchContentItems(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error creating content item:', err);
      throw err;
    }
  };

  const updateContentItem = async (id: string, itemData: any) => {
    try {
      console.log('=== updateContentItem DEBUG ===');
      console.log('Updating content item ID:', id);
      console.log('Item data being sent:', itemData);
      console.log('JSON.stringify(itemData):', JSON.stringify(itemData, null, 2));
      
      // Debug: Check specific date fields
      console.log('=== DATE FIELD CHECK IN updateContentItem ===');
      console.log('itemData.postDate:', itemData.postDate);
      console.log('itemData.startDate:', itemData.startDate);
      console.log('itemData.endDate:', itemData.endDate);
      console.log('itemData.deadline:', itemData.deadline);
      console.log('itemData.enrollmentDeadline:', itemData.enrollmentDeadline);
      
      const response = await fetch(`/api/content-items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      console.log('=== API RESPONSE DEBUG ===');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to update content item: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('=== API SUCCESS RESPONSE ===');
      console.log('Response data:', data);
      console.log('Response data JSON:', JSON.stringify(data, null, 2));
      
      await fetchContentItems(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error updating content item:', err);
      throw err;
    }
  };

  const deleteContentItem = async (id: string) => {
    try {
      const response = await fetch(`/api/content-items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete content item');
      }

      await fetchContentItems(); // Refresh the list
    } catch (err) {
      console.error('Error deleting content item:', err);
      throw err;
    }
  };

  // Load content items on component mount and when niche changes
  useEffect(() => {
    fetchContentItems();
  }, [activeNiche]);

  // Debug edit form rendering
  useEffect(() => {
    if (selectedItem && isEditMode) {
      console.log('Edit form should be rendering for niche:', activeNiche);
      console.log('Selected item:', selectedItem);
    }
  }, [selectedItem, isEditMode, activeNiche]);

  // Get dynamic stages for coach based on actual data
  const getDynamicStages = () => {
    // Always use the configured stages for each niche, don't derive from data
    return nicheConfigs[activeNiche]?.stages || nicheConfigs.creator.stages;
  };

  const config = {
    ...nicheConfigs[activeNiche] || nicheConfigs.creator,
    stages: getDynamicStages()
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = selectedStage === "all" || item.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const getItemsByStage = (stage: string) => {
    // For board view, always show all items for each stage (ignore stage filter)
    return items.filter(item => item.stage === stage);
  };

  const getFilteredItemsByStage = (stage: string) => {
    // For list view, respect the stage filter
    return filteredItems.filter(item => item.stage === stage);
  };

  // Calculate total revenue from content items
  const calculateTotalRevenue = () => {
    return filteredItems.reduce((total, item) => {
      return total + (item.revenue || 0);
    }, 0);
  };

  // Format revenue for display
  const formatRevenue = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  // Format duration for display
  const formatDuration = (duration: string, customDuration?: string) => {
    if (!duration) return null;
    
    if (duration === 'custom' && customDuration) {
      return customDuration;
    }
    
    const minutes = parseInt(duration);
    if (isNaN(minutes)) return duration;
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
      }
    } else {
      return `${minutes} min`;
    }
  };

  // Calculate items created this month
  const calculateThisMonthItems = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return filteredItems.filter(item => {
      // Check if item has a creation date and it's within this month
      if (item.postDate) {
        const itemDate = new Date(item.postDate);
        return itemDate >= startOfMonth && itemDate <= now;
      }
      // For now, return all items since we don't have reliable creation dates
      // This can be improved when we add proper createdAt timestamps
      return true;
    }).length;
  };

  // Calculate in progress items (excluding completed/final stages)
  const calculateInProgressItems = () => {
    const completedStages = ["posted", "archived"];
    return filteredItems.filter(item => !completedStages.includes(item.stage)).length;
  };

  const getStageCounts = () => {
    const counts: Record<string, number> = {};
    config.stages.forEach(stage => {
      counts[stage] = items.filter(item => item.stage === stage).length;
    });
    return counts;
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, item: ContentItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
    
    // Add visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setDragOverStage(null);
    
    // Reset visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if we're leaving the drop zone entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverStage(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);

    if (draggedItem && draggedItem.stage !== targetStage) {
      try {
        // Update the item in the database
        await updateContentItem(draggedItem.id, {
          title: draggedItem.title,
          stage: targetStage,
          niche: activeNiche, // Use the current activeNiche, not draggedItem.niche
          // Optionally include other fields if needed
        });
        // The fetchContentItems will be called by updateContentItem
      } catch (err) {
        console.error('Error updating item stage:', err);
        // Optionally show an error message to the user
      }
    }
  };

  const handleAddToStage = (stage: string) => {
    setCreateWithStage(stage);
    setIsCreateModalOpen(true);
  };

  const handleStageClick = (stage: string) => {
    // Disable detail view navigation for coach and podcaster niches
    if (activeNiche === "coach" || activeNiche === "podcaster") {
      return;
    }
    router.push(`/dashboard/content-stage/${encodeURIComponent(stage)}?niche=${activeNiche}`);
  };

  const handleEditItem = () => {
    if (selectedItem) {
      console.log('🎯 Content Card - Edit item clicked for niche:', activeNiche);
      console.log('🎯 Content Card - Selected item:', selectedItem);
      
      // Debug: Check what date fields are in the selected item
      console.log('=== SELECTED ITEM DATE DEBUG ===');
      console.log('selectedItem.postDate:', selectedItem.postDate);
      console.log('selectedItem.startDate:', selectedItem.startDate);
      console.log('selectedItem.endDate:', selectedItem.endDate);
      console.log('selectedItem.deadline:', selectedItem.deadline);
      console.log('selectedItem.enrollmentDeadline:', selectedItem.enrollmentDeadline);
      console.log('selectedItem.created_at:', selectedItem.created_at);
      console.log('Type of selectedItem.postDate:', typeof selectedItem.postDate);
      console.log('Type of selectedItem.startDate:', typeof selectedItem.startDate);
      console.log('Type of selectedItem.endDate:', typeof selectedItem.endDate);
      console.log('Type of selectedItem.deadline:', typeof selectedItem.deadline);
      console.log('Type of selectedItem.enrollmentDeadline:', typeof selectedItem.enrollmentDeadline);
      console.log('Type of selectedItem.created_at:', typeof selectedItem.created_at);
      
      // Test the date handler
      // dateHandler.test();
      
      // Populate edit form with selected item data using bulletproof date handling
      setEditFormData({
        // Content Info (for creator)
        contentTitle: String(selectedItem.title || ""),
        platform: selectedItem.platform ? selectedItem.platform.split(', ').filter(Boolean) : [],
        postType: String(selectedItem.type || ""),
        status: String(selectedItem.stage || "Idea"),
        
        // Podcast-specific fields
        episodeTitle: String(selectedItem.title || ""),
        guest: String(selectedItem.guest || ""),
        sponsor: String(selectedItem.sponsor || ""),
        duration: String(selectedItem.duration || ""),
        customDuration: String(selectedItem.customDuration || ""),
        topics: String(selectedItem.topics || ""),
        script: String(selectedItem.script || ""),
        
        // Creative & Strategy (for creator)
        hook: String(selectedItem.hook || ""),
        concept: "",
        hashtags: String(selectedItem.hashtags?.join(", ") || ""),
        description: "",
        
        // Schedule & Workflow (for creator) - with bulletproof date handling
        creationDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.creationDate)),
        publishDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.postDate)),
        deadline: dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.deadline)),
        
        // Analytics (for creator)
        views: String(selectedItem.analytics?.views || ""),
        likes: String(selectedItem.analytics?.likes || ""),
        comments: String(selectedItem.analytics?.comments || ""),
        shares: "",
        saves: "",
        revenue: String(selectedItem.revenue || ""),
        
        // Notes & Extras (for creator)
        notes: String(selectedItem.notes || ""),
        collaborationTag: "",
        repurposeTag: "",
        
        // Program Details (for coach)
        programName: String(selectedItem.title || ""),
        programType: String(selectedItem.programType || ""),
        customProgramType: String(selectedItem.customProgramType || ""),
        programStatus: String(selectedItem.stage || "Draft"),
        
        // Structure & Curriculum (for coach)
        programOverview: "",
        sessionCount: String(selectedItem.length || ""),
        deliveryFormat: "",
        supportOffered: "",
        
        // Pricing & Sales Info (for coach)
        price: String(selectedItem.price || ""),
        paymentOptions: "",
        enrollmentLink: "",
        tags: "",
        
        // Client Enrollment (for coach)
        enrollmentType: "",
        clientLimit: "",
        currentEnrollments: String(selectedItem.enrolled || ""),
        enrollmentDeadline: dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.enrollmentDeadline)),
        
        // Schedule & Timeline (for coach) - with bulletproof date handling
        startDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.startDate)),
        endDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.endDate)),
        linkedEvents: "",
        progressMilestones: String(selectedItem.milestones || ""),
        hostingPlatform: String(selectedItem.hostingPlatform || ""),
        
        // Budget & Payment (for freelancer)
        budget: String(selectedItem.budget || ""),
        paymentTerms: "",
        milestonePayments: "",
        
        // Project Management (for freelancer) - with bulletproof date handling
        projectStartDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.startDate)),
        dueDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.deadline)),
        projectManager: "",
        teamMembers: "",
        
        // Technical Details (for freelancer)
        technology: "",
        integrations: "",
        
        // Freelancer-specific fields
        clientName: String(selectedItem.client || "")
      });
      
      // Debug: Check what the date handler is returning for form pre-population
      console.log('=== DATE HANDLER FORM PRE-POPULATION DEBUG ===');
      console.log('selectedItem.postDate (raw):', selectedItem.postDate);
      console.log('dateHandler.parseDateForForm(selectedItem.postDate):', dateHandler.parseDateForForm(selectedItem.postDate));
      console.log('dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.postDate)):', dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.postDate)));
      console.log('selectedItem.deadline (raw):', selectedItem.deadline);
      console.log('dateHandler.parseDateForForm(selectedItem.deadline):', dateHandler.parseDateForForm(selectedItem.deadline));
      console.log('dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.deadline)):', dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.deadline)));
      
      console.log('🎯 Content Card - Edit form data set with bulletproof date handling:', {
        contentTitle: selectedItem.title || "",
        platform: selectedItem.platform || "",
        status: selectedItem.stage || "Idea",
        creationDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.creationDate)),
        publishDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.postDate)),
        startDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.startDate)),
        endDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(selectedItem.endDate)),
        niche: activeNiche
      });
      
      setIsEditMode(true);
      console.log('🎯 Content Card - Edit mode set to true');
    }
  };

  const handleSaveEdit = async () => {
    if (selectedItem) {
      setIsSaving(true);
      try {
        // Log basic save operation info
        console.log('Saving content item:', selectedItem.id);
        
        // Prepare the updated data
        let updatedData: any = {
          title: editFormData.programName || editFormData.contentTitle || selectedItem.title,
          stage: activeNiche === "creator" ? editFormData.status : (editFormData.programStatus || editFormData.status || selectedItem.stage),
          niche: activeNiche,
        };



        if (activeNiche === "creator") {
          // Creator-specific fields with bulletproof date handling
          const formattedCreationDate = dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.creationDate));
          const formattedPublishDate = dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.publishDate));
          const formattedDeadline = dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.deadline));
          
          // NUCLEAR TEST: Try with hardcoded ISO dates to see if the issue is in formatting
          const nuclearPublishDate = new Date().toISOString();
          const nuclearDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now
          

          
          updatedData = {
            ...updatedData,
            platform: editFormData.platform.join(', '),
            type: editFormData.postType || selectedItem.type,
            hook: editFormData.hook || selectedItem.hook,
            hashtags: editFormData.hashtags ? editFormData.hashtags.split(", ") : selectedItem.hashtags,
            brand: selectedItem.brand,
            creationDate: formattedCreationDate,
            postDate: formattedPublishDate,
            deadline: formattedDeadline,
            // NUCLEAR TEST: Uncomment these lines to test with hardcoded dates
            // postDate: nuclearPublishDate,
            // deadline: nuclearDeadline,
            notes: editFormData.notes || selectedItem.notes,
            views: parseInt(editFormData.views) || selectedItem.analytics?.views || 0,
            likes: parseInt(editFormData.likes) || selectedItem.analytics?.likes || 0,
            comments: parseInt(editFormData.comments) || selectedItem.analytics?.comments || 0,
            shares: parseInt(editFormData.shares) || 0,
            saves: parseInt(editFormData.saves) || 0,
            revenue: parseFloat(editFormData.revenue) || selectedItem.revenue,
          };
          

        } else if (activeNiche === "coach") {
          // Coach-specific fields with bulletproof date handling
          const formattedStartDate = dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.startDate));
          const formattedEndDate = dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.endDate));
          const formattedEnrollmentDeadline = dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.enrollmentDeadline));
          

          
          updatedData = {
            ...updatedData,
            programType: editFormData.programType || selectedItem.programType,
            customProgramType: editFormData.customProgramType || selectedItem.customProgramType,
            length: editFormData.sessionCount || selectedItem.length,
            price: parseFloat(editFormData.price) || selectedItem.price,
            enrolled: parseInt(editFormData.currentEnrollments) || selectedItem.enrolled,
            milestones: parseInt(editFormData.progressMilestones) || selectedItem.milestones,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            enrollmentDeadline: formattedEnrollmentDeadline,
            hostingPlatform: editFormData.hostingPlatform || selectedItem.hostingPlatform,
            notes: editFormData.notes || selectedItem.notes,
          };
        } else if (activeNiche === "freelancer") {
          // Freelancer-specific fields with bulletproof date handling
          const formattedProjectStartDate = dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.projectStartDate));
          const formattedDueDate = dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.dueDate));
          

          
          updatedData = {
            ...updatedData,
            client: editFormData.clientName || selectedItem.client,
            budget: parseFloat(editFormData.budget) || selectedItem.budget,
            startDate: formattedProjectStartDate,
            deadline: formattedDueDate,
            notes: editFormData.notes || selectedItem.notes,
          };
        } else if (activeNiche === "podcaster") {
          // Podcaster-specific fields with bulletproof date handling
          const formattedPodcastPublishDate = dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.publishDate));
          
          updatedData = {
            ...updatedData,
            stage: editFormData.status || selectedItem.stage,
            guest: editFormData.guest || selectedItem.guest,
            sponsor: editFormData.sponsor || selectedItem.sponsor,
            duration: editFormData.duration || selectedItem.duration,
            customDuration: editFormData.customDuration || selectedItem.customDuration,
            topics: editFormData.topics || selectedItem.topics,
            script: editFormData.script || selectedItem.script,
            postDate: formattedPodcastPublishDate,
            notes: editFormData.notes || selectedItem.notes,
          };
        } else {
          // Default fields for other niches with bulletproof date handling
          updatedData = {
            ...updatedData,
            platform: editFormData.platform.join(', '),
            type: editFormData.postType || selectedItem.type,
            hook: editFormData.hook || selectedItem.hook,
            hashtags: editFormData.hashtags ? editFormData.hashtags.split(", ") : selectedItem.hashtags,
            brand: selectedItem.brand,
            postDate: dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.publishDate)),
            notes: editFormData.notes || selectedItem.notes,
            views: parseInt(editFormData.views) || selectedItem.analytics?.views || 0,
            likes: parseInt(editFormData.likes) || selectedItem.analytics?.likes || 0,
            comments: parseInt(editFormData.comments) || selectedItem.analytics?.comments || 0,
            revenue: parseFloat(editFormData.revenue) || selectedItem.revenue,
            programType: editFormData.programType || selectedItem.programType,
            customProgramType: editFormData.customProgramType || selectedItem.customProgramType,
            length: editFormData.sessionCount || selectedItem.length,
            price: parseFloat(editFormData.price) || selectedItem.price,
            enrolled: parseInt(editFormData.currentEnrollments) || selectedItem.enrolled,
            milestones: parseInt(editFormData.progressMilestones) || selectedItem.milestones,
            startDate: dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.startDate)),
            endDate: dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.endDate)),
            hostingPlatform: editFormData.hostingPlatform || selectedItem.hostingPlatform
          };
        }


        const updatedItem = await updateContentItem(selectedItem.id, updatedData);
        // Immediately update the items list with the new data for instant UI reflection
        if (updatedItem && selectedItem) {
          const updatedItemForList = {
            ...selectedItem,
            ...updatedItem,
            // Ensure date fields are properly mapped back
            creationDate: updatedItem.creation_date || updatedItem.creationDate,
            postDate: updatedItem.post_date || updatedItem.postDate,
            startDate: updatedItem.start_date || updatedItem.startDate,
            endDate: updatedItem.end_date || updatedItem.endDate,
            deadline: updatedItem.deadline,
            enrollmentDeadline: updatedItem.enrollment_deadline || updatedItem.enrollmentDeadline,
          };
          
          // Update the items list immediately
          setItems(prevItems => 
            prevItems.map(item => 
              item.id === selectedItem.id ? updatedItemForList : item
            )
          );
          
          // Update the selectedItem for the modal
          setSelectedItem(updatedItemForList);
        }
        
        // Fetch fresh data from server in background
        await fetchContentItems();
        
        setIsEditMode(false);
        setIsDetailModalOpen(false);
        setSelectedStage("all");
      } catch (err) {
        console.error('Error saving edit:', err);
        // Optionally show an error message to the user
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const renderContentCard = (item: ContentItem) => {
    const handleCardClick = (e: React.MouseEvent) => {
      // Prevent card click when clicking on buttons or drag handle
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-drag-handle]')) {
        return;
      }
      // Disable detail view navigation for coach and podcaster niches
      if (activeNiche === "coach" || activeNiche === "podcaster") {
        return;
      }
      // Navigate to stage detail page instead of opening edit modal
      router.push(`/dashboard/content-stage/${encodeURIComponent(item.stage)}?niche=${activeNiche}`);
    };

    return (
      <Card 
        key={item.id} 
        className="mb-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-l-4 border-l-emerald-500 cursor-pointer min-h-[140px] group"
        draggable
        onDragStart={(e) => handleDragStart(e, item)}
        onDragEnd={handleDragEnd}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold text-slate-900 mb-1">
                {item.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${config.stageColors[item.stage]} text-xs`}>
                  {item.stage}
                </Badge>
                {activeNiche === "podcaster" && item.duration && formatDuration(item.duration, item.customDuration) && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Play className="h-3 w-3 mr-1" />
                    {formatDuration(item.duration, item.customDuration)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {activeNiche === "creator" && (
            <>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Video className="h-3 w-3" />
                  <span>{item.platform}</span>
                  {item.brand && <Badge variant="outline" className="text-xs">{item.brand}</Badge>}
                </div>
                {item.hook && (
                  <p className="text-xs italic">"{item.hook}"</p>
                )}
                {item.analytics && (
                  <div className="flex gap-3 text-xs">
                    <span><Eye className="h-3 w-3 inline mr-1" />{item.analytics.views.toLocaleString()}</span>
                    <span>❤️ {item.analytics.likes}</span>
                    <span><MessageSquare className="h-3 w-3 inline mr-1" />{item.analytics.comments}</span>
                  </div>
                )}
                {item.deadline && (
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {activeNiche === "coach" && (
            <div className="space-y-2 text-sm text-slate-600">
              {/* Program Type and Status */}
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-xs">
                  {item.programType}
                </Badge>
                <Badge className={`${config.stageColors[item.stage]} text-xs`}>
                  {item.stage}
                </Badge>
              </div>
              
              {/* Enrollment Count */}
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {item.enrolled || 0} clients
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Target className="h-3 w-3" />
                  {item.milestones || 0} milestones
                </span>
              </div>
              
              {/* Dates and Progress - Combined to save space */}
              <div className="flex justify-between items-center text-xs">
                {item.startDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.startDate).toLocaleDateString()}
                  </span>
                )}
                {item.clientProgress && (
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {item.clientProgress}
                  </span>
                )}
              </div>
              
              {/* Hosting Platform - Only show if not empty */}
              {item.hostingPlatform && item.hostingPlatform !== "" && (
                <div className="flex items-center gap-1 text-xs">
                  <Link className="h-3 w-3" />
                  <span className="truncate">{item.hostingPlatform}</span>
                </div>
              )}
            </div>
          )}

          {activeNiche === "podcaster" && (
            <Tabs 
              value={activeTabs[item.id] || "overview"} 
              onValueChange={(value) => setActiveTabs(prev => ({ ...prev, [item.id]: value }))}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2 text-xs">
                  <User className="h-3 w-3" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="script" className="flex items-center gap-2 text-xs">
                  <FileText className="h-3 w-3" />
                  Script
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2 text-xs">
                  <Activity className="h-3 w-3" />
                  Activity
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <User className="h-3 w-3" />
                    Overview
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>Guest: {item.guest || 'No guest specified'}</span>
                    </div>
                    {item.sponsor && (
                      <div className="flex items-center gap-2">
                        <Star className="h-3 w-3" />
                        <span>Sponsor: </span>
                        <Badge variant="outline" className="text-xs">{item.sponsor}</Badge>
                      </div>
                    )}
                    {item.duration && (
                      <div className="flex items-center gap-2">
                        <Play className="h-3 w-3" />
                        <span>Duration: {formatDuration(item.duration, item.customDuration)}</span>
                      </div>
                    )}
                    {item.topics && (
                      <div className="flex items-start gap-2">
                        <MessageCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-slate-700">Topics:</span>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {item.topics}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="script" className="mt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <FileText className="h-3 w-3" />
                      Script
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0" 
                      title="Edit Script"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open edit modal with script focus
                        setEditFormData({
                          ...editFormData,
                          script: item.script || ""
                        });
                        setIsDetailModalOpen(true);
                        setIsEditMode(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  {item.script ? (
                    <div className="bg-slate-50 p-3 rounded border">
                      <p className="text-xs text-slate-600 font-mono whitespace-pre-wrap line-clamp-6">
                        {item.script}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-500">
                      <FileText className="h-4 w-4 mx-auto mb-2 opacity-50" />
                      No script available
                      <br />
                      <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={(e) => {
                        e.stopPropagation();
                        setEditFormData({
                          ...editFormData,
                          script: ""
                        });
                        setIsDetailModalOpen(true);
                        setIsEditMode(true);
                      }}>
                        Click to add script
                      </span>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <Activity className="h-3 w-3" />
                    Activity
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Created: {new Date(item.created_at || '').toLocaleDateString()}</span>
                    </div>
                    {item.updated_at && item.updated_at !== item.created_at && (
                      <div className="flex items-center gap-2">
                        <Edit className="h-3 w-3" />
                        <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge className={`${config.stageColors[item.stage]} text-xs`}>
                        {item.stage}
                      </Badge>
                    </div>
                    {item.notes && (
                      <div className="flex items-start gap-2">
                        <MessageCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-slate-700">Notes:</span>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {item.notes}
                          </p>
                        </div>
                      </div>
                    )}
                    {(item as any).description && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-slate-700">Description:</span>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {(item as any).description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {activeNiche === "freelancer" && (
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {item.client}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  ${item.budget?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                Due: {item.deadline}
              </div>
              {item.deliverables && (
                <div className="flex flex-wrap gap-1">
                  {item.deliverables.map((deliverable, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {deliverable}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-1 mt-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0" 
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard?section=programs&niche=${activeNiche}&edit=${item.id}`);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0" 
              title="Delete"
              onClick={async (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                  await deleteContentItem(item.id);
                }
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBoardView = () => {
    // Filter stages based on selectedStage
    const stagesToShow = selectedStage === "all" 
      ? config.stages 
      : config.stages.filter(stage => stage === selectedStage);

    return (
      <div className="relative">
        {/* Horizontal scrollable container */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max">
            {stagesToShow.map(stage => {
              const stageItems = getItemsByStage(stage);
              const isDropTarget = dragOverStage === stage && draggedItem;
              
              return (
                <div 
                  key={stage} 
                  className={`bg-slate-50 rounded-lg p-4 transition-all duration-200 min-h-[200px] w-80 flex-shrink-0 ${
                    isDropTarget ? 'bg-emerald-50 border-2 border-emerald-300 border-dashed' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, stage)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 
                      className="font-semibold text-slate-700 text-sm cursor-pointer hover:text-emerald-600 transition-colors"
                      onClick={() => handleStageClick(stage)}
                    >
                      {stage}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {stageItems.length}
                    </Badge>
                  </div>
                  
                  {isDropTarget && (
                    <div className="mb-3 p-3 border-2 border-dashed border-emerald-400 rounded-lg bg-emerald-50 text-center">
                      <p className="text-sm text-emerald-600 font-medium">
                        Drop here to move to {stage}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {stageItems.map(renderContentCard)}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full border-2 border-dashed border-slate-300 text-slate-500 hover:border-emerald-300 hover:text-emerald-600"
                      onClick={() => handleAddToStage(stage)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {activeNiche === "coach" ? (
                        stage === "Draft" ? "Add Draft Program" :
                        stage === "Active" ? "Add Active Program" :
                        stage === "Completed" ? "Add Completed Program" :
                        stage === "Archived" ? "Add Archived Program" :
                        `Add ${stage.toLowerCase()} program`
                      ) : (
                        `Add ${stage.toLowerCase()} item`
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Horizontal scroll indicator */}
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
              <span>Scroll horizontally to see all stages</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-4">
        {filteredItems.map(renderContentCard)}
      </div>
    );
  };



  const Icon = config.icon;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Icon className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{config.name}</h1>
              <p className="text-slate-600">Manage your {activeNiche} workflow efficiently</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {activeNiche === "creator" ? "Content Card – For Creators & Influencers" : 
                     activeNiche === "coach" ? "Add New Program Card – For Online Coaches" :
                     activeNiche === "podcaster" ? "Episode Card – For Podcasters" :
                     activeNiche === "freelancer" ? "Create New Project Card – For Freelancers" :
                     "Create New"}
                  </DialogTitle>
                  <DialogDescription>
                    {activeNiche === "creator" ? "Create a comprehensive content plan with all the details you need" :
                     activeNiche === "coach" ? "Create a new coaching program with all the details you need" :
                     activeNiche === "podcaster" ? "Create a new podcast episode with all the details you need." :
                     activeNiche === "freelancer" ? "Create a new project with all the details you need" :
                     "Create a new item"}
                  </DialogDescription>
                  <div className="text-xs text-gray-500 mt-2">
                    Current niche: {activeNiche}
                  </div>
                </DialogHeader>
                {/* FREELANCER FORM SECTION */}
                {activeNiche === "freelancer" && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Project Name</Label>
                      <Input value={createFormData.projectName} onChange={e => setCreateFormData({ ...createFormData, projectName: e.target.value })} placeholder="e.g. Website Redesign" />
                    </div>
                    <div>
                      <Label>Client Name</Label>
                      <Input value={createFormData.clientName} onChange={e => setCreateFormData({ ...createFormData, clientName: e.target.value })} placeholder="e.g. Acme Corp" />
                    </div>
                    <div>
                      <Label>Project Type</Label>
                      <Input value={createFormData.projectType} onChange={e => setCreateFormData({ ...createFormData, projectType: e.target.value })} placeholder="e.g. Web Development" />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={createFormData.projectStatus} onValueChange={value => setCreateFormData({ ...createFormData, projectStatus: value })}>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inquiry">Inquiry</SelectItem>
                          <SelectItem value="Proposal">Proposal</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Execution">Execution</SelectItem>
                          <SelectItem value="Delivery">Delivery</SelectItem>
                          <SelectItem value="Payment">Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Project Description</Label>
                      <Textarea value={createFormData.projectDescription} onChange={e => setCreateFormData({ ...createFormData, projectDescription: e.target.value })} placeholder="Describe the project scope, requirements, and goals..." />
                    </div>
                    <div>
                      <Label>Deliverables</Label>
                      <Input value={createFormData.deliverables} onChange={e => setCreateFormData({ ...createFormData, deliverables: e.target.value })} placeholder="e.g. Website, Logo, Brand Guidelines" />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label>Budget (USD)</Label>
                        <Input type="number" value={createFormData.budget} onChange={e => setCreateFormData({ ...createFormData, budget: e.target.value })} placeholder="e.g. 5000" />
                      </div>
                      <div className="flex-1">
                        <Label>Due Date</Label>
                        <Input type="date" value={createFormData.dueDate} onChange={e => setCreateFormData({ ...createFormData, dueDate: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea value={createFormData.notes} onChange={e => setCreateFormData({ ...createFormData, notes: e.target.value })} placeholder="Any additional notes..." />
                    </div>
                  </div>
                )}
                {/* END FREELANCER FORM SECTION */}
                
                <div className="space-y-6">
                  {/* Debug info - remove this later */}
                  <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
                    Form type: {activeNiche === "creator" ? "Creator Form" : activeNiche === "coach" ? "Coach Form" : "Default Form"}
                  </div>
                  
                  {activeNiche === "creator" ? (
                    // Creator/Influencer Form
                    <>
                      {/* Content Info Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <FileText className="h-5 w-5 text-emerald-600" />
                          🔤 Content Info
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contentTitle">Content Title</Label>
                            <Input
                              id="contentTitle"
                              value={createFormData.contentTitle}
                              onChange={(e) => setCreateFormData({...createFormData, contentTitle: e.target.value})}
                              placeholder="Enter your content title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="platform">Platform</Label>
                            <Select value={Array.isArray(createFormData.platform) ? createFormData.platform[0] || "" : createFormData.platform} onValueChange={(value) => setCreateFormData({...createFormData, platform: [value]})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TikTok">TikTok</SelectItem>
                                <SelectItem value="Instagram">Instagram</SelectItem>
                                <SelectItem value="YouTube">YouTube</SelectItem>
                                <SelectItem value="Facebook">Facebook</SelectItem>
                                <SelectItem value="Snapchat">Snapchat</SelectItem>
                                <SelectItem value="Pinterest">Pinterest</SelectItem>
                                <SelectItem value="Twitch">Twitch</SelectItem>
                                <SelectItem value="Twitter">Twitter (X)</SelectItem>
                                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                <SelectItem value="Substack">Substack</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="OnlyFans">OnlyFans</SelectItem>
                                <SelectItem value="Patreon">Patreon</SelectItem>
                                <SelectItem value="Discord">Discord</SelectItem>
                                <SelectItem value="Reddit">Reddit</SelectItem>
                                <SelectItem value="Telegram">Telegram</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postType">Post Type</Label>
                            <Select value={createFormData.postType} onValueChange={(value) => setCreateFormData({...createFormData, postType: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select post type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Reel">Reel</SelectItem>
                                <SelectItem value="Story">Story</SelectItem>
                                <SelectItem value="YouTube">YouTube</SelectItem>
                                <SelectItem value="YouTube Shorts">YouTube Shorts</SelectItem>
                                <SelectItem value="X">X</SelectItem>
                                <SelectItem value="Threads">Threads</SelectItem>
                                <SelectItem value="Static">Static</SelectItem>
                                <SelectItem value="Carousel">Carousel</SelectItem>
                                <SelectItem value="Short">Short</SelectItem>
                                <SelectItem value="Long-form">Long-form</SelectItem>
                                <SelectItem value="Livestream">Livestream</SelectItem>
                                <SelectItem value="UGC">UGC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={createFormData.status} onValueChange={(value) => setCreateFormData({...createFormData, status: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="idea">Idea</SelectItem>
                                <SelectItem value="script">Script</SelectItem>
                                <SelectItem value="filming/writing">Filming/Writing</SelectItem>
                                <SelectItem value="editing">Editing</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="posted">Posted</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Creative & Strategy Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Brain className="h-5 w-5 text-purple-600" />
                          🧠 Creative & Strategy
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="hook">Hook / Opening Line</Label>
                            <Input
                              id="hook"
                              value={createFormData.hook}
                              onChange={(e) => setCreateFormData({...createFormData, hook: e.target.value})}
                              placeholder="The hook that will grab attention"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="concept">Concept or Theme</Label>
                            <Textarea
                              id="concept"
                              value={createFormData.concept}
                              onChange={(e) => setCreateFormData({...createFormData, concept: e.target.value})}
                              placeholder="Describe the overall concept or theme"
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hashtags">Hashtags Used</Label>
                            <Input
                              id="hashtags"
                              value={createFormData.hashtags}
                              onChange={(e) => setCreateFormData({...createFormData, hashtags: e.target.value})}
                              placeholder="#hashtag1 #hashtag2 #hashtag3"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description / Caption Draft</Label>
                            <Textarea
                              id="description"
                              value={createFormData.description}
                              onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                              placeholder="Write your caption or description"
                              rows={4}
                            />
                          </div>

                        </div>
                      </div>

                      {/* Schedule & Workflow Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <CalendarCheck className="h-5 w-5 text-blue-600" />
                          📅 Schedule & Workflow
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="creationDate">Creation Date</Label>
                            <Input
                              id="creationDate"
                              type="date"
                              value={createFormData.creationDate}
                              onChange={(e) => setCreateFormData({...createFormData, creationDate: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="publishDate">Publish Date</Label>
                            <Input
                              id="publishDate"
                              type="date"
                              value={createFormData.publishDate}
                              onChange={(e) => setCreateFormData({...createFormData, publishDate: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline</Label>
                            <Input
                              id="deadline"
                              type="date"
                              value={createFormData.deadline}
                              onChange={(e) => setCreateFormData({...createFormData, deadline: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Analytics Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <BarChart className="h-5 w-5 text-green-600" />
                          📈 Analytics (Auto or Manual)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="views">Views</Label>
                            <Input
                              id="views"
                              type="number"
                              value={createFormData.views}
                              onChange={(e) => setCreateFormData({...createFormData, views: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="likes">Likes</Label>
                            <Input
                              id="likes"
                              type="number"
                              value={createFormData.likes}
                              onChange={(e) => setCreateFormData({...createFormData, likes: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="comments">Comments</Label>
                            <Input
                              id="comments"
                              type="number"
                              value={createFormData.comments}
                              onChange={(e) => setCreateFormData({...createFormData, comments: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="shares">Shares</Label>
                            <Input
                              id="shares"
                              type="number"
                              value={createFormData.shares}
                              onChange={(e) => setCreateFormData({...createFormData, shares: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="saves">Saves</Label>
                            <Input
                              id="saves"
                              type="number"
                              value={createFormData.saves}
                              onChange={(e) => setCreateFormData({...createFormData, saves: e.target.value})}
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="revenue">Revenue</Label>
                            <Input
                              id="revenue"
                              type="number"
                              step="0.01"
                              value={createFormData.revenue}
                              onChange={(e) => setCreateFormData({...createFormData, revenue: e.target.value})}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notes & Extras Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-orange-600" />
                          📝 Notes & Extras
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="notes">Personal Notes (freeform ideas, tweaks, edits)</Label>
                            <Textarea
                              id="notes"
                              value={createFormData.notes}
                              onChange={(e) => setCreateFormData({...createFormData, notes: e.target.value})}
                              placeholder="Any additional notes or ideas"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="collaborationTag">Collaboration Tag (if working with another creator)</Label>
                              <Input
                                id="collaborationTag"
                                value={createFormData.collaborationTag}
                                onChange={(e) => setCreateFormData({...createFormData, collaborationTag: e.target.value})}
                                placeholder="Collaborator name or tag"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="repurposeTag">Repurpose Tag (e.g. "turn into YouTube short")</Label>
                              <Input
                                id="repurposeTag"
                                value={createFormData.repurposeTag}
                                onChange={(e) => setCreateFormData({...createFormData, repurposeTag: e.target.value})}
                                placeholder="Repurpose instructions"
                              />
                            </div>
                          </div>

                        </div>
                      </div>
                    </>
                  ) : activeNiche === "coach" ? (
                    // Coach Program Form
                    <>
                      {/* Program Details Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <FileText className="h-5 w-5 text-emerald-600" />
                          📛 Program Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="programName">Program Name</Label>
                            <Input
                              id="programName"
                              value={createFormData.programName}
                              onChange={(e) => setCreateFormData({...createFormData, programName: e.target.value})}
                              placeholder="e.g. '90-Day Confidence Accelerator'"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="programType">Program Type</Label>
                            <Select value={createFormData.programType} onValueChange={(value) => setCreateFormData({...createFormData, programType: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select program type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1:1 Coaching">1:1 Coaching</SelectItem>
                                <SelectItem value="Group Coaching">Group Coaching</SelectItem>
                                <SelectItem value="Online Course">Online Course</SelectItem>
                                <SelectItem value="Self-Paced Course">Self-Paced Course</SelectItem>
                                <SelectItem value="Challenge">Challenge</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {createFormData.programType === "Other" && (
                              <div className="space-y-2">
                                <Label htmlFor="customProgramType">Custom Program Type</Label>
                                <Input
                                  id="customProgramType"
                                  value={createFormData.customProgramType}
                                  onChange={(e) => setCreateFormData({...createFormData, customProgramType: e.target.value})}
                                  placeholder="Enter custom program type"
                                />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="programStatus">Status</Label>
                            <Select 
                              value={createWithStage || createFormData.programStatus} 
                              onValueChange={(value) => setCreateFormData({...createFormData, programStatus: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Structure & Curriculum Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Brain className="h-5 w-5 text-purple-600" />
                          🧠 Structure & Curriculum
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="programOverview">Program Overview / Description</Label>
                            <Textarea
                              id="programOverview"
                              value={createFormData.programOverview}
                              onChange={(e) => setCreateFormData({...createFormData, programOverview: e.target.value})}
                              placeholder="Summary of transformation, goals, or outcomes"
                              rows={4}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="sessionCount">Session Count / Modules</Label>
                              <Input
                                id="sessionCount"
                                value={createFormData.sessionCount}
                                onChange={(e) => setCreateFormData({...createFormData, sessionCount: e.target.value})}
                                placeholder="e.g. '12 Weekly Sessions' or '6 Course Modules'"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="deliveryFormat">Delivery Format</Label>
                              <Select value={createFormData.deliveryFormat} onValueChange={(value) => setCreateFormData({...createFormData, deliveryFormat: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select delivery format" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Live Calls">Live Calls</SelectItem>
                                  <SelectItem value="Pre-recorded">Pre-recorded</SelectItem>
                                  <SelectItem value="Mix of Both">Mix of Both</SelectItem>
                                  <SelectItem value="Access Platform">Access Platform</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="supportOffered">Support Offered</Label>
                            <Input
                              id="supportOffered"
                              value={createFormData.supportOffered}
                              onChange={(e) => setCreateFormData({...createFormData, supportOffered: e.target.value})}
                              placeholder="Slack, Voxer, Email, Group Chat, Community Portal, etc."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hostingPlatform">Program Hosting Platform</Label>
                            <Select value={createFormData.hostingPlatform} onValueChange={(value) => setCreateFormData({...createFormData, hostingPlatform: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select hosting platform" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Kajabi">Kajabi</SelectItem>
                                <SelectItem value="Thinkific">Thinkific</SelectItem>
                                <SelectItem value="Teachable">Teachable</SelectItem>
                                <SelectItem value="Podia">Podia</SelectItem>
                                <SelectItem value="Circle">Circle</SelectItem>
                                <SelectItem value="Mighty Networks">Mighty Networks</SelectItem>
                                <SelectItem value="CoachAccountable">CoachAccountable</SelectItem>
                                <SelectItem value="Kartra">Kartra</SelectItem>
                                <SelectItem value="Systeme.io">Systeme.io</SelectItem>
                                <SelectItem value="ClickFunnels">ClickFunnels</SelectItem>
                                <SelectItem value="Notion">Notion (for DIY or mini-courses)</SelectItem>
                                <SelectItem value="Google Drive / Dropbox">Google Drive / Dropbox</SelectItem>
                                <SelectItem value="Custom Website">Custom Website</SelectItem>
                                <SelectItem value="Other">Other (manual entry field)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Sales Info Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          💵 Pricing & Sales Info
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={createFormData.price}
                              onChange={(e) => setCreateFormData({...createFormData, price: e.target.value})}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="paymentOptions">Payment Options</Label>
                            <Select value={createFormData.paymentOptions} onValueChange={(value) => setCreateFormData({...createFormData, paymentOptions: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Full">Full</SelectItem>
                                <SelectItem value="Installments">Installments</SelectItem>
                                <SelectItem value="Pay What You Can">Pay What You Can</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="enrollmentLink">Enrollment Link or Waitlist Form</Label>
                            <Input
                              id="enrollmentLink"
                              value={createFormData.enrollmentLink}
                              onChange={(e) => setCreateFormData({...createFormData, enrollmentLink: e.target.value})}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <Input
                              id="tags"
                              value={createFormData.tags}
                              onChange={(e) => setCreateFormData({...createFormData, tags: e.target.value})}
                              placeholder="e.g. High Ticket, Digital Product, Mindset, Course, Business"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Client Enrollment Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          👥 Client Enrollment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="enrollmentType">Enrollment Type</Label>
                            <Select value={createFormData.enrollmentType} onValueChange={(value) => setCreateFormData({...createFormData, enrollmentType: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select enrollment type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Open Enrollment">Open Enrollment</SelectItem>
                                <SelectItem value="Cohort-Based">Cohort-Based</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="clientLimit">Client Limit (optional)</Label>
                            <Input
                              id="clientLimit"
                              type="number"
                              value={createFormData.clientLimit}
                              onChange={(e) => setCreateFormData({...createFormData, clientLimit: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currentEnrollments">Current Enrollments</Label>
                            <Input
                              id="currentEnrollments"
                              type="number"
                              value={createFormData.currentEnrollments}
                              onChange={(e) => setCreateFormData({...createFormData, currentEnrollments: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="enrollmentDeadline">Enrollment Deadline / Program Start Date</Label>
                            <Input
                              id="enrollmentDeadline"
                              type="date"
                              value={createFormData.enrollmentDeadline}
                              onChange={(e) => setCreateFormData({...createFormData, enrollmentDeadline: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Scheduling & Progress Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <CalendarCheck className="h-5 w-5 text-orange-600" />
                          📅 Scheduling & Progress
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={createFormData.startDate}
                              onChange={(e) => setCreateFormData({...createFormData, startDate: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">End Date (if applicable)</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={createFormData.endDate}
                              onChange={(e) => setCreateFormData({...createFormData, endDate: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="linkedEvents">Linked Calendar Events / Weekly Sessions</Label>
                            <Input
                              id="linkedEvents"
                              value={createFormData.linkedEvents}
                              onChange={(e) => setCreateFormData({...createFormData, linkedEvents: e.target.value})}
                              placeholder="Calendar event details"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="progressMilestones">Progress Milestones (optional tracking)</Label>
                            <Textarea
                              id="progressMilestones"
                              value={createFormData.progressMilestones}
                              onChange={(e) => setCreateFormData({...createFormData, progressMilestones: e.target.value})}
                              placeholder="Key milestones and progress tracking points"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : activeNiche === "podcaster" ? (
                    <>
                      {/* Podcaster/Episode Form */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Mic className="h-5 w-5 text-emerald-600" />
                          🎙️ Episode Info
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="episodeTitle">Episode Title</Label>
                            <Input
                              id="episodeTitle"
                              value={createFormData.episodeTitle || ""}
                              onChange={e => setCreateFormData({ ...createFormData, episodeTitle: e.target.value })}
                              placeholder="Enter episode title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="platform">Platform</Label>
                            <Select value={Array.isArray(createFormData.platform) ? createFormData.platform[0] || "" : createFormData.platform} onValueChange={(value) => setCreateFormData({...createFormData, platform: [value]})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                <SelectItem value="Spotify">Spotify</SelectItem>
                                <SelectItem value="Apple Podcasts">Apple Podcasts</SelectItem>
                                <SelectItem value="YouTube">YouTube</SelectItem>
                                <SelectItem value="Google Podcasts">Google Podcasts</SelectItem>
                                <SelectItem value="Amazon Music">Amazon Music</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="guest">Guest</Label>
                            <Input
                              id="guest"
                              value={createFormData.guest || ""}
                              onChange={e => setCreateFormData({ ...createFormData, guest: e.target.value })}
                              placeholder="Enter guest name(s)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sponsor">Sponsor</Label>
                            <Input
                              id="sponsor"
                              value={createFormData.sponsor || ""}
                              onChange={e => setCreateFormData({ ...createFormData, sponsor: e.target.value })}
                              placeholder="Enter sponsor name (optional)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Select value={createFormData.duration || ""} onValueChange={value => setCreateFormData({ ...createFormData, duration: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="45">45 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="75">1 hour 15 minutes</SelectItem>
                                <SelectItem value="90">1 hour 30 minutes</SelectItem>
                                <SelectItem value="105">1 hour 45 minutes</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                                <SelectItem value="135">2 hours 15 minutes</SelectItem>
                                <SelectItem value="150">2 hours 30 minutes</SelectItem>
                                <SelectItem value="165">2 hours 45 minutes</SelectItem>
                                <SelectItem value="180">3 hours</SelectItem>
                                <SelectItem value="195">3 hours 15 minutes</SelectItem>
                                <SelectItem value="210">3 hours 30 minutes</SelectItem>
                                <SelectItem value="225">3 hours 45 minutes</SelectItem>
                                <SelectItem value="240">4 hours</SelectItem>
                                <SelectItem value="custom">Custom duration</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {createFormData.duration === "custom" && (
                            <div className="space-y-2">
                              <Label htmlFor="customDuration">Custom Duration</Label>
                              <Input
                                id="customDuration"
                                value={createFormData.customDuration || ""}
                                onChange={e => setCreateFormData({ ...createFormData, customDuration: e.target.value })}
                                placeholder="e.g. 2 hours 30 minutes"
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label htmlFor="topics">Topics</Label>
                            <Textarea
                              id="topics"
                              value={createFormData.topics || ""}
                              onChange={e => setCreateFormData({ ...createFormData, topics: e.target.value })}
                              placeholder="Enter episode topics, discussion points, or key themes..."
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={createFormData.status || ""} onValueChange={value => setCreateFormData({ ...createFormData, status: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="idea">Idea</SelectItem>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="recording">Recording</SelectItem>
                                <SelectItem value="editing">Editing</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={createFormData.description || ""}
                            onChange={e => setCreateFormData({ ...createFormData, description: e.target.value })}
                            placeholder="Describe the episode, topics, and highlights"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={createFormData.notes || ""}
                            onChange={e => setCreateFormData({ ...createFormData, notes: e.target.value })}
                            placeholder="Any additional notes..."
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    // Default form for other niches
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Form for {activeNiche} niche coming soon...</p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={async () => {
                      try {
                        let itemData: any;
                      
                      if (activeNiche === "creator") {
                          // Prepare data for creator content item with bulletproof date handling
                          const createFormattedPublishDate = dateHandler.formatDateForStorage(dateHandler.parseDateForForm(createFormData.publishDate));
                          const createFormattedDeadline = dateHandler.formatDateForStorage(dateHandler.parseDateForForm(createFormData.deadline));
                          
                          console.log('=== CREATE FORM CREATOR DEBUG ===');
                          console.log('createFormData.publishDate (raw):', createFormData.publishDate);
                          console.log('createFormattedPublishDate:', createFormattedPublishDate);
                          console.log('createFormData.deadline (raw):', createFormData.deadline);
                          console.log('createFormattedDeadline:', createFormattedDeadline);
                          
                          itemData = {
                          title: createFormData.contentTitle,
                            stage: createWithStage || createFormData.status,
                            niche: activeNiche,
                          type: createFormData.postType,
                          platform: createFormData.platform.join(', '),
                            brand: null,
                            creationDate: dateHandler.formatDateForStorage(dateHandler.parseDateForForm(createFormData.creationDate)),
                            postDate: createFormattedPublishDate,
                            deadline: createFormattedDeadline,
                            hashtags: createFormData.hashtags ? createFormData.hashtags.split(' ').filter((tag: string) => tag.startsWith('#')) : [],
                            hook: createFormData.hook || null,
                            notes: createFormData.notes || null,
                            views: parseInt(createFormData.views) || 0,
                            likes: parseInt(createFormData.likes) || 0,
                            comments: parseInt(createFormData.comments) || 0,
                            shares: parseInt(createFormData.shares) || 0,
                            saves: parseInt(createFormData.saves) || 0,
                            revenue: parseFloat(createFormData.revenue) || null
                        };
                                              } else if (activeNiche === "coach") {
                          // Prepare data for coach program item with bulletproof date handling
                          // Prepare data for coach program item with bulletproof date handling
                          const coachCreationDate = createFormData.creationDate ? dateHandler.formatDateForStorage(dateHandler.parseDateForForm(createFormData.creationDate)) : new Date().toISOString();
                          const coachStartDate = createFormData.startDate ? dateHandler.formatDateForStorage(dateHandler.parseDateForForm(createFormData.startDate)) : null;
                          const coachEndDate = createFormData.endDate ? dateHandler.formatDateForStorage(dateHandler.parseDateForForm(createFormData.endDate)) : null;
                          const coachEnrollmentDeadline = createFormData.enrollmentDeadline ? dateHandler.formatDateForStorage(dateHandler.parseDateForForm(createFormData.enrollmentDeadline)) : null;
                          
                          console.log('=== COACH CREATE DATE DEBUG ===');
                          console.log('createFormData.startDate (raw):', createFormData.startDate);
                          console.log('coachStartDate:', coachStartDate);
                          console.log('createFormData.endDate (raw):', createFormData.endDate);
                          console.log('coachEndDate:', coachEndDate);
                          console.log('createFormData.enrollmentDeadline (raw):', createFormData.enrollmentDeadline);
                          console.log('coachEnrollmentDeadline:', coachEnrollmentDeadline);
                          
                          itemData = {
                          title: createFormData.programName,
                          stage: createWithStage || createFormData.programStatus,
                            niche: activeNiche,
                            creationDate: coachCreationDate,
                            programType: createFormData.programType || null,
                            customProgramType: createFormData.customProgramType || null,
                            length: createFormData.sessionCount || null,
                            price: parseFloat(createFormData.price) || null,
                          enrolled: parseInt(createFormData.currentEnrollments) || 0,
                          revenue: parseFloat(createFormData.price) * parseInt(createFormData.currentEnrollments) || 0,
                            startDate: coachStartDate,
                            endDate: coachEndDate,
                            enrollmentDeadline: coachEnrollmentDeadline,
                          clientProgress: `${parseInt(createFormData.currentEnrollments) || 0}/${parseInt(createFormData.clientLimit) || 0} completed`,
                            hostingPlatform: createFormData.hostingPlatform || null,
                          milestones: createFormData.progressMilestones ? 1 : 0
                        };
                      } else if (activeNiche === "podcaster") {
                        // Prepare data for podcaster episode item with bulletproof date handling
                        const podcasterCreationDate = createFormData.creationDate ? dateHandler.formatDateForStorage(dateHandler.parseDateForForm(createFormData.creationDate)) : new Date().toISOString();
                        const podcasterPublishDate = createFormData.publishDate ? dateHandler.formatDateForStorage(dateHandler.parseDateForForm(createFormData.publishDate)) : null;
                        
                        itemData = {
                          title: createFormData.episodeTitle,
                          stage: createWithStage || createFormData.status,
                          niche: activeNiche,
                          creationDate: podcasterCreationDate,
                          type: 'episode',
                          platform: createFormData.platform.join(', '),
                          guest: createFormData.guest || null,
                          sponsor: createFormData.sponsor || null,
                          duration: createFormData.duration || null,
                          customDuration: createFormData.customDuration || null,
                          topics: createFormData.topics || null,
                          script: createFormData.script || null,
                          postDate: podcasterPublishDate,
                          description: createFormData.description || null,
                          notes: createFormData.notes || null
                        };
                      } else if (activeNiche === "freelancer") {
                          // Prepare data for freelancer project item with bulletproof date handling
                          const freelancerCreationDate = createFormData.creationDate ? dateHandler.formatDateForStorage(dateHandler.parseDateForForm(createFormData.creationDate)) : new Date().toISOString();
                          itemData = {
                          title: createFormData.projectName,
                          stage: createFormData.projectStatus,
                            niche: activeNiche,
                            creationDate: freelancerCreationDate,
                            client: createFormData.clientName || null,
                            budget: parseFloat(createFormData.budget) || null,
                            startDate: dateHandler.formatDateForStorage(dateHandler.parseDateForForm(createFormData.projectStartDate)),
                            deadline: dateHandler.formatDateForStorage(dateHandler.parseDateForForm(createFormData.dueDate)),
                            deliverables: createFormData.deliverables ? createFormData.deliverables.split(',').map((d: string) => d.trim()).filter(Boolean) : [],
                            notes: createFormData.notes || null
                        };
                      } else {
                        // Default fallback
                          itemData = {
                          title: "New Item",
                            stage: "Planning",
                            niche: activeNiche
                        };
                      }
                      
                        // Create the item in the database
                        await createContentItem(itemData);
                        
                        // Close modal and reset form
                      setIsCreateModalOpen(false);
                      setCreateWithStage("");
                      setCreateFormData({
                        contentTitle: "",
                        platform: [],
                        postType: "",
                        status: "Idea",
                        // Podcast-specific fields
                        episodeTitle: "",
                        guest: "",
                        sponsor: "",
                        duration: "",
                        customDuration: "",
                        topics: "",
                        script: "",
                        hook: "",
                        concept: "",
                        hashtags: "",
                        description: "",

                        creationDate: "",
                        publishDate: "",
                        deadline: "",
                        views: "",
                        likes: "",
                        comments: "",
                        shares: "",
                        saves: "",
                        revenue: "",
                        notes: "",
                        collaborationTag: "",
                        repurposeTag: "",
                        programName: "",
                        programType: "",
                        customProgramType: "",
                        programStatus: "Draft",
                        programOverview: "",
                        sessionCount: "",
                        deliveryFormat: "",
                        supportOffered: "",
                        price: "",
                        paymentOptions: "",
                        enrollmentLink: "",
                        tags: "",
                        enrollmentType: "",
                        clientLimit: "",
                        currentEnrollments: "",
                        enrollmentDeadline: "",
                        startDate: "",
                        endDate: "",
                        linkedEvents: "",
                        progressMilestones: "",
                        hostingPlatform: "",
                        projectName: "",
                        clientName: "",
                        projectType: "",
                        projectStatus: "Inquiry",
                        projectDescription: "",
                        deliverables: "",
                        requirements: "",
                        timeline: "",
                        budget: "",
                        paymentTerms: "",
                        milestonePayments: "",
                        projectStartDate: "",
                        dueDate: "",
                        projectManager: "",
                        teamMembers: "",
                        technology: "",
                        integrations: ""
                      });
                      } catch (err) {
                        console.error('Error creating content item:', err);
                        // Optionally show an error message to the user
                      }
                    }}
                  >
                    {activeNiche === "freelancer" ? "Create Project" : "Create Content"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Drag & Drop Indicator */}
        {view === "board" && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="text-lg">✋</div>
              <span className="text-sm font-medium">Drag & Drop Enabled - Move items between stages by dragging</span>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {activeNiche === "creator" ? (
            <>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Content</p>
                      <p className="text-2xl font-bold text-slate-900">{items.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">In Progress</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {calculateInProgressItems()}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">This Month</p>
                      <p className="text-2xl font-bold text-slate-900">{calculateThisMonthItems()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Revenue</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatRevenue(calculateTotalRevenue())}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : activeNiche === "coach" ? (
            <>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Programs</p>
                      <p className="text-2xl font-bold text-slate-900">{items.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">In Progress</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {calculateInProgressItems()}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">This Month</p>
                      <p className="text-2xl font-bold text-slate-900">{calculateThisMonthItems()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Clients</p>
                      <p className="text-2xl font-bold text-slate-900">47</p>
                    </div>
                    <Users className="h-8 w-8 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : activeNiche === "podcaster" ? (
            <>
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Episodes</p>
                      <p className="text-2xl font-bold text-slate-900">{items.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">In Progress</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {calculateInProgressItems()}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">This Month</p>
                      <p className="text-2xl font-bold text-slate-900">{calculateThisMonthItems()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Revenue</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatRevenue(calculateTotalRevenue())}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Content</p>
                      <p className="text-2xl font-bold text-slate-900">{items.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">In Progress</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {calculateInProgressItems()}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">This Month</p>
                      <p className="text-2xl font-bold text-slate-900">{calculateThisMonthItems()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Revenue</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatRevenue(calculateTotalRevenue())}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages ({items.length})</SelectItem>
              {config.stages.map(stage => {
                const stageCounts = getStageCounts();
                const count = stageCounts[stage] || 0;
                return (
                  <SelectItem key={stage} value={stage}>
                    {stage} ({count})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          <div className="flex border border-slate-200 rounded-md">
            <Button
              variant={view === "board" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("board")}
              className="rounded-r-none"
            >
                                  <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading content items...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchContentItems} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Icon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">No content items yet</p>
              <p className="text-sm text-slate-500 mb-4">Create your first {activeNiche} item to get started</p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
          </div>
        ) : (
          <>
        {view === "board" && renderBoardView()}
        {view === "list" && renderListView()}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeNiche === "coach" ? <Users className="h-5 w-5" /> : 
               activeNiche === "creator" ? <Video className="h-5 w-5" /> :
               activeNiche === "podcaster" ? <Mic className="h-5 w-5" /> :
               <Briefcase className="h-5 w-5" />}
              {selectedItem?.title}
            </DialogTitle>
            <DialogDescription>
              {activeNiche === "coach" ? "Program Details" :
               activeNiche === "creator" ? "Content Details" :
               activeNiche === "podcaster" ? "Episode Details" :
               "Project Details"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && !isEditMode && (
            <div className="space-y-6">
              {/* Status and Stage */}
              <div className="flex items-center justify-between">
                <Badge className={`${config.stageColors[selectedItem.stage]} text-sm`}>
                  {selectedItem.stage}
                </Badge>
              </div>

              {/* Coach Program Details */}
              {activeNiche === "coach" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Program Type</Label>
                      <p className="text-sm">{selectedItem.programType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Custom Program Type</Label>
                      <p className="text-sm">{selectedItem.customProgramType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Clients</Label>
                      <p className="text-sm">{selectedItem.enrolled || 0}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Milestones</Label>
                      <p className="text-sm">{selectedItem.milestones || 0}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Progress</Label>
                      <p className="text-sm">{selectedItem.clientProgress}</p>
                    </div>
                  </div>
                  
                  {selectedItem.startDate && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Start Date</Label>
                      <p className="text-sm">{new Date(selectedItem.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {selectedItem.endDate && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">End Date</Label>
                      <p className="text-sm">{new Date(selectedItem.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {selectedItem.hostingPlatform && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Hosting Platform</Label>
                      <p className="text-sm">{selectedItem.hostingPlatform}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Creator Content Details */}
              {activeNiche === "creator" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Platform</Label>
                      <p className="text-sm">{selectedItem.platform}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Brand</Label>
                      <p className="text-sm">{selectedItem.brand || "N/A"}</p>
                    </div>
                  </div>
                  
                  {selectedItem.hook && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Hook</Label>
                      <p className="text-sm italic">"{selectedItem.hook}"</p>
                    </div>
                  )}
                  
                  {selectedItem.analytics && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Analytics</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="text-lg font-semibold">{selectedItem.analytics.views.toLocaleString()}</p>
                          <p className="text-xs text-slate-600">Views</p>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="text-lg font-semibold">{selectedItem.analytics.likes}</p>
                          <p className="text-xs text-slate-600">Likes</p>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="text-lg font-semibold">{selectedItem.analytics.comments}</p>
                          <p className="text-xs text-slate-600">Comments</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Podcaster Episode Details */}
              {activeNiche === "podcaster" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Guest</Label>
                      <p className="text-sm">{selectedItem.guest}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Duration</Label>
                      <p className="text-sm">{selectedItem.duration}</p>
                    </div>
                  </div>
                  
                  {selectedItem.sponsor && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Sponsor</Label>
                      <p className="text-sm">{selectedItem.sponsor}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Freelancer Project Details */}
              {activeNiche === "freelancer" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Client</Label>
                      <p className="text-sm">{selectedItem.client}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Budget</Label>
                      <p className="text-sm">${selectedItem.budget?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Deadline</Label>
                    <p className="text-sm">{selectedItem.deadline}</p>
                  </div>
                  
                  {selectedItem.deliverables && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Deliverables</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedItem.deliverables.map((deliverable, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {deliverable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedItem.notes && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Notes</Label>
                  <p className="text-sm text-slate-700 mt-1">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Edit Form */}
          {selectedItem && isEditMode && (
            <div className="space-y-6">
              {activeNiche === "creator" ? (
                // Creator/Influencer Edit Form
                <>
                  {/* Content Info Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      🔤 Content Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editContentTitle">Content Title</Label>
                        <Input
                          id="editContentTitle"
                          value={editFormData.contentTitle}
                          onChange={(e) => setEditFormData({...editFormData, contentTitle: e.target.value})}
                          placeholder="Enter your content title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editPlatform">Platform</Label>
                        <Select value={Array.isArray(editFormData.platform) ? editFormData.platform[0] || "" : editFormData.platform} onValueChange={(value) => setEditFormData({...editFormData, platform: [value]})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TikTok">TikTok</SelectItem>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                            <SelectItem value="Snapchat">Snapchat</SelectItem>
                            <SelectItem value="Pinterest">Pinterest</SelectItem>
                            <SelectItem value="Twitch">Twitch</SelectItem>
                            <SelectItem value="Twitter">Twitter (X)</SelectItem>
                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                            <SelectItem value="Substack">Substack</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="OnlyFans">OnlyFans</SelectItem>
                            <SelectItem value="Patreon">Patreon</SelectItem>
                            <SelectItem value="Discord">Discord</SelectItem>
                            <SelectItem value="Reddit">Reddit</SelectItem>
                            <SelectItem value="Telegram">Telegram</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editPostType">Post Type</Label>
                        <Select value={editFormData.postType} onValueChange={(value) => setEditFormData({...editFormData, postType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select post type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Reel">Reel</SelectItem>
                            <SelectItem value="Story">Story</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="YouTube Shorts">YouTube Shorts</SelectItem>
                            <SelectItem value="X">X</SelectItem>
                            <SelectItem value="Threads">Threads</SelectItem>
                            <SelectItem value="Static">Static</SelectItem>
                            <SelectItem value="Carousel">Carousel</SelectItem>
                            <SelectItem value="Short">Short</SelectItem>
                            <SelectItem value="Long-form">Long-form</SelectItem>
                            <SelectItem value="Livestream">Livestream</SelectItem>
                            <SelectItem value="UGC">UGC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editStatus">Status</Label>
                        <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="idea">Idea</SelectItem>
                            <SelectItem value="script">Script</SelectItem>
                            <SelectItem value="filming/writing">Filming/Writing</SelectItem>
                            <SelectItem value="editing">Editing</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="posted">Posted</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Creative & Strategy Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      🧠 Creative & Strategy
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="editHook">Hook / Opening Line</Label>
                        <Input
                          id="editHook"
                          value={editFormData.hook}
                          onChange={(e) => setEditFormData({...editFormData, hook: e.target.value})}
                          placeholder="The hook that will grab attention"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editConcept">Concept or Theme</Label>
                        <Textarea
                          id="editConcept"
                          value={editFormData.concept}
                          onChange={(e) => setEditFormData({...editFormData, concept: e.target.value})}
                          placeholder="Describe the overall concept or theme"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editHashtags">Hashtags Used</Label>
                        <Input
                          id="editHashtags"
                          value={editFormData.hashtags}
                          onChange={(e) => setEditFormData({...editFormData, hashtags: e.target.value})}
                          placeholder="#hashtag1 #hashtag2 #hashtag3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editDescription">Description / Caption Draft</Label>
                        <Textarea
                          id="editDescription"
                          value={editFormData.description}
                          onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                          placeholder="Write your caption or description"
                          rows={4}
                        />
                      </div>

                    </div>
                  </div>

                  {/* Schedule & Workflow Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CalendarCheck className="h-5 w-5 text-blue-600" />
                      📅 Schedule & Workflow
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editCreationDate">Creation Date</Label>
                        <Input
                          id="editCreationDate"
                          type="date"
                          value={editFormData.creationDate}
                          onChange={(e) => setEditFormData({...editFormData, creationDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editPublishDate">Publish Date</Label>
                        <Input
                          id="editPublishDate"
                          type="date"
                          value={editFormData.publishDate}
                          onChange={(e) => setEditFormData({...editFormData, publishDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editDeadline">Deadline</Label>
                        <Input
                          id="editDeadline"
                          type="date"
                          value={editFormData.deadline}
                          onChange={(e) => setEditFormData({...editFormData, deadline: e.target.value})}
                        />
                      </div>

                    </div>
                  </div>

                  {/* Analytics Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-green-600" />
                      📊 Analytics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editViews">Views</Label>
                        <Input
                          id="editViews"
                          type="number"
                          value={editFormData.views}
                          onChange={(e) => setEditFormData({...editFormData, views: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editLikes">Likes</Label>
                        <Input
                          id="editLikes"
                          type="number"
                          value={editFormData.likes}
                          onChange={(e) => setEditFormData({...editFormData, likes: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editComments">Comments</Label>
                        <Input
                          id="editComments"
                          type="number"
                          value={editFormData.comments}
                          onChange={(e) => setEditFormData({...editFormData, comments: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editShares">Shares</Label>
                        <Input
                          id="editShares"
                          type="number"
                          value={editFormData.shares}
                          onChange={(e) => setEditFormData({...editFormData, shares: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editSaves">Saves</Label>
                        <Input
                          id="editSaves"
                          type="number"
                          value={editFormData.saves}
                          onChange={(e) => setEditFormData({...editFormData, saves: e.target.value})}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="editRevenue">Revenue Generated</Label>
                        <Input
                          id="editRevenue"
                          type="number"
                          step="0.01"
                          value={editFormData.revenue}
                          onChange={(e) => setEditFormData({...editFormData, revenue: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes & Extras Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      📝 Notes & Extras
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="editNotes">Notes</Label>
                        <Textarea
                          id="editNotes"
                          value={editFormData.notes}
                          onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                          placeholder="Any additional notes..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="editCollaborationTag">Collaboration Tag</Label>
                          <Input
                            id="editCollaborationTag"
                            value={editFormData.collaborationTag}
                            onChange={(e) => setEditFormData({...editFormData, collaborationTag: e.target.value})}
                            placeholder="e.g. #collab, #sponsored, #gifted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editRepurposeTag">Repurpose Tag</Label>
                          <Input
                            id="editRepurposeTag"
                            value={editFormData.repurposeTag}
                            onChange={(e) => setEditFormData({...editFormData, repurposeTag: e.target.value})}
                            placeholder="e.g. #reel, #story, #tiktok"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeNiche === "coach" ? (
                // Coach Program Edit Form
                <>
                  {/* Program Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      📛 Program Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editProgramName">Program Name</Label>
                        <Input
                          id="editProgramName"
                          value={editFormData.programName || ""}
                          onChange={(e) => setEditFormData({...editFormData, programName: e.target.value})}
                          placeholder="e.g. '90-Day Confidence Accelerator'"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editProgramType">Program Type</Label>
                        <Select value={editFormData.programType || ""} onValueChange={(value) => setEditFormData({...editFormData, programType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select program type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1:1 Coaching">1:1 Coaching</SelectItem>
                            <SelectItem value="Group Coaching">Group Coaching</SelectItem>
                            <SelectItem value="Online Course">Online Course</SelectItem>
                            <SelectItem value="Self-Paced Course">Self-Paced Course</SelectItem>
                            <SelectItem value="Challenge">Challenge</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {editFormData.programType === "Other" && (
                          <div className="space-y-2">
                            <Label htmlFor="customProgramType">Custom Program Type</Label>
                            <Input
                              id="customProgramType"
                              value={editFormData.customProgramType || ""}
                              onChange={(e) => setEditFormData({...editFormData, customProgramType: e.target.value})}
                              placeholder="Enter custom program type"
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editProgramStatus">Status</Label>
                        <Select value={editFormData.programStatus || ""} onValueChange={(value) => setEditFormData({...editFormData, programStatus: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editSessionCount">Session Count / Modules</Label>
                        <Input
                          id="editSessionCount"
                          value={editFormData.sessionCount || ""}
                          onChange={(e) => setEditFormData({...editFormData, sessionCount: e.target.value})}
                          placeholder="e.g. '12 Weekly Sessions' or '6 Course Modules'"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Enrollment Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      💵 Pricing & Enrollment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editPrice">Price</Label>
                        <Input
                          id="editPrice"
                          type="number"
                          step="0.01"
                          value={editFormData.price || ""}
                          onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editCurrentEnrollments">Clients</Label>
                        <Input
                          id="editCurrentEnrollments"
                          type="number"
                          value={editFormData.currentEnrollments || ""}
                          onChange={(e) => setEditFormData({...editFormData, currentEnrollments: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editProgressMilestones">Milestones</Label>
                        <Input
                          id="editProgressMilestones"
                          type="number"
                          value={editFormData.progressMilestones || ""}
                          onChange={(e) => setEditFormData({...editFormData, progressMilestones: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editHostingPlatform">Hosting Platform</Label>
                        <Select value={editFormData.hostingPlatform || ""} onValueChange={(value) => setEditFormData({...editFormData, hostingPlatform: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hosting platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kajabi">Kajabi</SelectItem>
                            <SelectItem value="Thinkific">Thinkific</SelectItem>
                            <SelectItem value="Teachable">Teachable</SelectItem>
                            <SelectItem value="Podia">Podia</SelectItem>
                            <SelectItem value="Circle">Circle</SelectItem>
                            <SelectItem value="Mighty Networks">Mighty Networks</SelectItem>
                            <SelectItem value="CoachAccountable">CoachAccountable</SelectItem>
                            <SelectItem value="Kartra">Kartra</SelectItem>
                            <SelectItem value="Systeme.io">Systeme.io</SelectItem>
                            <SelectItem value="ClickFunnels">ClickFunnels</SelectItem>
                            <SelectItem value="Notion">Notion (for DIY or mini-courses)</SelectItem>
                            <SelectItem value="Google Drive / Dropbox">Google Drive / Dropbox</SelectItem>
                            <SelectItem value="Custom Website">Custom Website</SelectItem>
                            <SelectItem value="Other">Other (manual entry field)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      📅 Schedule
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editStartDate">Start Date</Label>
                        <Input
                          id="editStartDate"
                          type="date"
                          value={editFormData.startDate || ""}
                          onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editEndDate">End Date</Label>
                        <Input
                          id="editEndDate"
                          type="date"
                          value={editFormData.endDate || ""}
                          onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      📝 Notes
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="editNotes">Notes</Label>
                      <Textarea
                        id="editNotes"
                        value={editFormData.notes || ""}
                        onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                        placeholder="Add any additional notes..."
                        rows={3}
                      />
                    </div>
                  </div>
                </>
              ) : activeNiche === "podcaster" ? (
                <>
                  {/* Podcaster/Episode Form */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Mic className="h-5 w-5 text-emerald-600" />
                      🎙️ Episode Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="episodeTitle">Episode Title</Label>
                        <Input
                          id="episodeTitle"
                          value={editFormData.episodeTitle || ""}
                          onChange={(e) => setEditFormData({...editFormData, episodeTitle: e.target.value})}
                          placeholder="Enter episode title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="platform">Platform</Label>
                        <Select value={Array.isArray(editFormData.platform) ? editFormData.platform[0] || "" : editFormData.platform} onValueChange={(value) => setEditFormData({...editFormData, platform: [value]})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Spotify">Spotify</SelectItem>
                            <SelectItem value="Apple Podcasts">Apple Podcasts</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="Google Podcasts">Google Podcasts</SelectItem>
                            <SelectItem value="Amazon Music">Amazon Music</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guest">Guest</Label>
                        <Input
                          id="guest"
                          value={editFormData.guest || ""}
                          onChange={(e) => setEditFormData({...editFormData, guest: e.target.value})}
                          placeholder="Enter guest name(s)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sponsor">Sponsor</Label>
                        <Input
                          id="sponsor"
                          value={editFormData.sponsor || ""}
                          onChange={(e) => setEditFormData({...editFormData, sponsor: e.target.value})}
                          placeholder="Enter sponsor name (optional)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Select value={editFormData.duration || ""} onValueChange={value => setEditFormData({...editFormData, duration: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="75">1 hour 15 minutes</SelectItem>
                            <SelectItem value="90">1 hour 30 minutes</SelectItem>
                            <SelectItem value="105">1 hour 45 minutes</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                            <SelectItem value="135">2 hours 15 minutes</SelectItem>
                            <SelectItem value="150">2 hours 30 minutes</SelectItem>
                            <SelectItem value="165">2 hours 45 minutes</SelectItem>
                            <SelectItem value="180">3 hours</SelectItem>
                            <SelectItem value="195">3 hours 15 minutes</SelectItem>
                            <SelectItem value="210">3 hours 30 minutes</SelectItem>
                            <SelectItem value="225">3 hours 45 minutes</SelectItem>
                            <SelectItem value="240">4 hours</SelectItem>
                            <SelectItem value="custom">Custom duration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {editFormData.duration === "custom" && (
                        <div className="space-y-2">
                          <Label htmlFor="customDuration">Custom Duration</Label>
                          <Input
                            id="customDuration"
                            value={editFormData.customDuration || ""}
                            onChange={(e) => setEditFormData({...editFormData, customDuration: e.target.value})}
                            placeholder="e.g. 2 hours 30 minutes"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="topics">Topics</Label>
                        <Textarea
                          id="topics"
                          value={editFormData.topics || ""}
                          onChange={(e) => setEditFormData({...editFormData, topics: e.target.value})}
                          placeholder="Enter episode topics, discussion points, or key themes..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="script">Script</Label>
                        <Textarea
                          id="script"
                          value={editFormData.script || ""}
                          onChange={(e) => setEditFormData({...editFormData, script: e.target.value})}
                          placeholder="Paste or type your script here..."
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={editFormData.status || ""} onValueChange={value => setEditFormData({...editFormData, status: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="idea">Idea</SelectItem>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="recording">Recording</SelectItem>
                            <SelectItem value="editing">Editing</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editFormData.description || ""}
                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                        placeholder="Describe the episode, topics, and highlights"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={editFormData.notes || ""}
                        onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                        placeholder="Any additional notes..."
                      />
                    </div>
                  </div>
                </>
              ) : (
                // Default edit form for other niches
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editTitle">Title</Label>
                      <Input
                        id="editTitle"
                        value={editFormData.contentTitle || ""}
                        onChange={(e) => setEditFormData({...editFormData, contentTitle: e.target.value})}
                        placeholder="Enter title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editStatus">Status</Label>
                      <Select value={editFormData.status || ""} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config.stages.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editNotes">Notes</Label>
                    <Textarea
                      id="editNotes"
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                      placeholder="Add any additional notes..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {!isEditMode ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsEditMode(false);
                }}>
                  Close
                </Button>
                <Button onClick={handleEditItem}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Item
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};