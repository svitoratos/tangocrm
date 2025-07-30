"use client";

import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Search, 
  Plus,
  X,
  Video,
  Users,
  Mic,
  Briefcase,
  Edit,
  Trash2,
  CheckCircle,
  FileText,
  DollarSign,
  Calendar,
  Target,
  Link,
  User,
  Star,
  Play
} from 'lucide-react';
import { createBulletproofDateHandler } from '@/lib/date-utils';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

interface ContentItem {
  id: string;
  title: string;
  stage: string;
  niche?: string;
  type?: string;
  platform?: string;
  brand?: string;
  postDate?: string;
  hashtags?: string[];
  hook?: string;
  notes?: string;
  analytics?: {
    views: number;
    likes: number;
    comments: number;
  };
  revenue?: number;
  // Coach program specific
  length?: string;
  price?: number;
  enrolled?: number;
  milestones?: number;
  programType?: string;
  customProgramType?: string;
  startDate?: string;
  endDate?: string;
  enrollmentDeadline?: string;
  clientProgress?: string;
  hostingPlatform?: string;
  // Podcast specific
  guest?: string;
  sponsor?: string;
  duration?: string;
  // Freelancer specific
  client?: string;
  deadline?: string;
  budget?: number;
  deliverables?: string[];
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
    stages: ["Planning", "Recording", "Editing", "Published", "Promoted", "Archived"],
    stageColors: {
      "planning": "bg-blue-100 text-blue-800",
      "recording": "bg-orange-100 text-orange-800",
      "editing": "bg-purple-100 text-purple-800",
      "published": "bg-green-100 text-green-800",
      "promoted": "bg-emerald-100 text-emerald-800",
      "archived": "bg-slate-100 text-slate-800"
    }
  }
};

function ContentStageDetailPageWithSearchParams() {
  const router = useRouter();
  const { stageId } = useParams();
  const searchParams = useSearchParams();
  const [activeNiche, setActiveNiche] = useState<string>('creator');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'revenue'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Decode the stageId to handle URL encoding
  const decodedStageId = stageId ? decodeURIComponent(stageId as string) : '';
  
  console.log('Raw stageId from params:', stageId);
  console.log('Decoded stageId:', decodedStageId);
  
  // Create bulletproof date handler
  const dateHandler = createBulletproofDateHandler();
  const [editFormData, setEditFormData] = useState({
    // Content Info (for creator)
    contentTitle: "",
    platform: "",
    postType: "",
    status: "",
    
    // Creative & Strategy (for creator)
    hook: "",
    hashtags: "",
    brandLink: "",
    
    // Schedule & Workflow (for creator)
    publishDate: "",
    
    // Analytics (for creator)
    views: "",
    likes: "",
    comments: "",
    revenue: "",
    
    // Notes & Extras (for creator)
    notes: "",
    
    // Program Details (for coach)
    programName: "",
    programType: "",
    customProgramType: "",
    programStatus: "",
    
    // Structure & Curriculum (for coach)
    sessionCount: "",
    
    // Pricing & Sales Info (for coach)
    price: "",
    currentEnrollments: "",
    progressMilestones: "",
    hostingPlatform: "",
    
    // Schedule & Timeline (for coach)
    startDate: "",
    endDate: "",
    enrollmentDeadline: ""
  });

  // Set active niche from search params
  useEffect(() => {
    const nicheFromParams = searchParams.get('niche');
    if (nicheFromParams) {
      setActiveNiche(nicheFromParams);
    }
  }, [searchParams]);

  // Load content items from database
  useEffect(() => {
    const loadContentItems = async () => {
      try {
        setIsLoading(true);
        console.log('Loading content items for stage:', decodedStageId, 'niche:', activeNiche);
        
        const response = await fetch(`/api/content-items?niche=${activeNiche}&t=${Date.now()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch content items');
        }
        
        const data = await response.json();
        const rawItems = Array.isArray(data) ? data : [];
        
        // Transform database data to match ContentItem interface (same as programs-content-hub.tsx)
        const allItems: ContentItem[] = rawItems.map((item: any) => ({
          id: item.id,
          title: item.title,
          stage: item.stage,
          niche: item.niche, // Include the niche field
          type: item.type,
          platform: item.platform,
          brand: item.brand,
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
          client: item.client,
          deadline: item.deadline,
          budget: item.budget,
          deliverables: item.deliverables || []
        }));
        
        console.log('All items fetched:', allItems.length);
        console.log('Decoded stage ID:', decodedStageId);
        console.log('All items stages:', allItems.map((item: ContentItem) => ({ title: item.title, stage: item.stage, niche: item.niche })));
        
        // Debug: Show all coach items regardless of stage
        const coachItems = allItems.filter((item: ContentItem) => item.niche === activeNiche);
        console.log(`All ${activeNiche} items (any stage):`, coachItems.map((item: ContentItem) => ({ title: item.title, stage: item.stage, niche: item.niche })));
        
        // Filter items for the specific stage AND niche
        const stageItems = allItems.filter((item: ContentItem) => {
          console.log(`Comparing item stage "${item.stage}" with decodedStageId "${decodedStageId}" and item niche "${item.niche}" with activeNiche "${activeNiche}"`);
          return item.stage === decodedStageId && item.niche === activeNiche;
        });
        
        console.log('Filtered items for stage:', decodedStageId, 'count:', stageItems.length);
        console.log('Stage items:', stageItems.map((item: ContentItem) => ({ title: item.title, stage: item.stage })));
        setContentItems(stageItems);
      } catch (error) {
        console.error('Error loading content items:', error);
        setContentItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (decodedStageId && activeNiche) {
      loadContentItems();
    }
  }, [decodedStageId, activeNiche]);

  const handleBackToContentHub = () => {
    router.push(`/dashboard?section=programs&niche=${activeNiche}`);
  };

  const handleAddNewItem = () => {
    router.push(`/dashboard?section=programs&niche=${activeNiche}&stage=${decodedStageId}`);
  };

  const handleItemClick = (item: ContentItem) => {
    // Navigate to content hub with the item selected for editing
    router.push(`/dashboard?section=programs&niche=${activeNiche}&edit=${item.id}`);
  };

  const handleEditItem = (e: React.MouseEvent, item: ContentItem) => {
    e.stopPropagation();
    setSelectedItem(item);
    
    console.log('🎯 Content Stage - Edit item clicked for niche:', activeNiche);
    console.log('🎯 Content Stage - Selected item:', item);
    
    // Test the date handler
    // dateHandler.test();
    
    // Populate edit form with selected item data using bulletproof date handling
    setEditFormData({
      contentTitle: String(item.title || ""),
      platform: String(item.platform || ""),
      postType: String(item.type || ""),
      status: String(item.stage || ""),
      hook: String(item.hook || ""),
      hashtags: String(item.hashtags?.join(", ") || ""),
      brandLink: String(item.brand || ""),
      publishDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(item.postDate)),
      views: String(item.analytics?.views || ""),
      likes: String(item.analytics?.likes || ""),
      comments: String(item.analytics?.comments || ""),
      revenue: String(item.revenue || ""),
      notes: String(item.notes || ""),
      programName: String(item.title || ""),
      programType: String(item.programType || ""),
      customProgramType: String(item.customProgramType || ""),
      programStatus: String(item.stage || ""),
      sessionCount: String(item.length || ""),
      price: String(item.price || ""),
      currentEnrollments: String(item.enrolled || ""),
      progressMilestones: String(item.milestones || ""),
      hostingPlatform: String(item.hostingPlatform || ""),
      startDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(item.startDate)),
      endDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(item.endDate)),
      enrollmentDeadline: dateHandler.formatDateForInput(dateHandler.parseDateForForm(item.enrollmentDeadline))
    });
    
    console.log('🎯 Content Stage - Edit form data set with bulletproof date handling:', {
      contentTitle: item.title || "",
      platform: item.platform || "",
      status: item.stage || "",
      publishDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(item.postDate)),
      startDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(item.startDate)),
      endDate: dateHandler.formatDateForInput(dateHandler.parseDateForForm(item.endDate)),
      niche: activeNiche
    });
    
    setIsEditMode(true);
    setIsEditModalOpen(true);
  };

  const handleDeleteItem = async (e: React.MouseEvent, item: ContentItem) => {
    e.stopPropagation();
            if (confirm(`Tango CRM says: Are you sure you want to delete "${item.title}"?`)) {
      try {
        const response = await fetch(`/api/content-items/${item.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Remove the item from the local state
          setContentItems(prevItems => prevItems.filter(i => i.id !== item.id));
        } else {
          console.error('Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (selectedItem) {
      try {
        // Prepare the updated data
        let updatedData: any = {
          title: editFormData.programName || editFormData.contentTitle || selectedItem.title,
          stage: activeNiche === "coach" ? (editFormData.programStatus || selectedItem.stage) : (editFormData.status || selectedItem.stage),
          niche: activeNiche,
        };

        if (activeNiche === "creator") {
          // Creator-specific fields with bulletproof date handling
          updatedData = {
            ...updatedData,
            platform: editFormData.platform || selectedItem.platform,
            type: editFormData.postType || selectedItem.type,
            hook: editFormData.hook || selectedItem.hook,
            hashtags: editFormData.hashtags ? editFormData.hashtags.split(", ") : selectedItem.hashtags,
            brand: editFormData.brandLink || selectedItem.brand,
            postDate: dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.publishDate)),
            notes: editFormData.notes || selectedItem.notes,
            views: parseInt(editFormData.views) || selectedItem.analytics?.views || 0,
            likes: parseInt(editFormData.likes) || selectedItem.analytics?.likes || 0,
            comments: parseInt(editFormData.comments) || selectedItem.analytics?.comments || 0,
            revenue: parseFloat(editFormData.revenue) || selectedItem.revenue,
          };
        } else if (activeNiche === "coach") {
          // Coach-specific fields with bulletproof date handling
          updatedData = {
            ...updatedData,
            programType: editFormData.programType || selectedItem.programType,
            customProgramType: editFormData.customProgramType || selectedItem.customProgramType,
            length: editFormData.sessionCount || selectedItem.length,
            price: parseFloat(editFormData.price) || selectedItem.price,
            enrolled: parseInt(editFormData.currentEnrollments) || selectedItem.enrolled,
            milestones: parseInt(editFormData.progressMilestones) || selectedItem.milestones,
            startDate: dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.startDate)),
            endDate: dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.endDate)),
            enrollmentDeadline: dateHandler.formatDateForStorage(dateHandler.parseDateForForm(editFormData.enrollmentDeadline)),
            hostingPlatform: editFormData.hostingPlatform || selectedItem.hostingPlatform,
            notes: editFormData.notes || selectedItem.notes,
          };
        } else {
          // Default fields for other niches with bulletproof date handling
          updatedData = {
            ...updatedData,
            platform: editFormData.platform || selectedItem.platform,
            type: editFormData.postType || selectedItem.type,
            hook: editFormData.hook || selectedItem.hook,
            hashtags: editFormData.hashtags ? editFormData.hashtags.split(", ") : selectedItem.hashtags,
            brand: editFormData.brandLink || selectedItem.brand,
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

        // Update the item in the database
        const response = await fetch(`/api/content-items/${selectedItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        });

        if (response.ok) {
          // If the item's stage changed, redirect to the new stage's detail page
          if (updatedData.stage !== decodedStageId) {
            // Add a small delay to ensure the database update is complete
            setTimeout(() => {
              // Force a complete page reload to ensure fresh data
              window.location.href = `/dashboard/content-stage/${encodeURIComponent(updatedData.stage)}?niche=${activeNiche}`;
            }, 200);
          } else {
            // Otherwise, refresh the current stage's items
            const loadContentItems = async () => {
              try {
                const response = await fetch(`/api/content-items?niche=${activeNiche}&t=${Date.now()}`);
                if (response.ok) {
                  const data = await response.json();
                  const rawItems = Array.isArray(data) ? data : [];
                  
                  // Transform database data to match ContentItem interface
                  const allItems: ContentItem[] = rawItems.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    stage: item.stage,
                    niche: item.niche,
                    type: item.type,
                    platform: item.platform,
                    brand: item.brand,
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
                    clientProgress: item.client_progress,
                    hostingPlatform: item.hosting_platform,
                    guest: item.guest,
                    sponsor: item.sponsor,
                    duration: item.duration,
                    client: item.client,
                    deadline: item.deadline,
                    budget: item.budget,
                    deliverables: item.deliverables || []
                  }));
                  
                  const stageItems = allItems.filter((item: ContentItem) => 
                    item.stage === decodedStageId && item.niche === activeNiche
                  );
                  setContentItems(stageItems);
                }
              } catch (error) {
                console.error('Error refreshing content items:', error);
              }
            };
            await loadContentItems();
          }
          setIsEditMode(false);
          setIsEditModalOpen(false);
        } else {
          console.error('Failed to update item');
        }
      } catch (error) {
        console.error('Error saving edit:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setIsEditModalOpen(false);
  };

  const filteredAndSortedItems = useMemo(() => {
    let filtered = contentItems;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.platform && item.platform.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.postDate || a.startDate || '');
          bValue = new Date(b.postDate || b.startDate || '');
          break;
        case 'revenue':
          aValue = a.revenue || 0;
          bValue = b.revenue || 0;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [contentItems, searchQuery, sortBy, sortOrder]);

  const currentConfig = nicheConfigs[activeNiche] || nicheConfigs.creator;
  const stageName = decodedStageId as string;
  const stageColor = currentConfig.stageColors[stageName] || 'bg-gray-100 text-gray-800';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToContentHub}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {currentConfig.name}
            </Button>
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: stageColor.includes('bg-') ? '' : '#e5e7eb' }}
              />
              <h1 className="text-2xl font-semibold text-foreground">
                {stageName}
              </h1>
              <Badge variant="outline" className="text-sm">
                {filteredAndSortedItems.length} items
              </Badge>
            </div>
          </div>
          <Button onClick={handleAddNewItem} className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Item
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search items in this stage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'title' | 'date' | 'revenue')}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="title">Sort by Title</option>
              <option value="date">Sort by Date</option>
              <option value="revenue">Sort by Revenue</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredAndSortedItems.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <currentConfig.icon className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No items in {stageName}</h3>
                  <p className="text-muted-foreground">
                    Get started by adding your first item to this stage.
                  </p>
                </div>
                <Button onClick={handleAddNewItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Item
                </Button>
              </div>
            </Card>
          ) : (
            filteredAndSortedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {item.title}
                          </h3>
                          <Badge className={stageColor}>
                            {item.stage}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          {activeNiche === "coach" ? (
                            // Coach-specific fields
                            <>
                              {item.programType && (
                                <div>
                                  <span className="font-medium">Program Type:</span> {item.programType}
                                </div>
                              )}
                              {item.price && (
                                <div>
                                  <span className="font-medium">Price:</span> ${item.price.toLocaleString()}
                                </div>
                              )}
                              {item.enrolled && (
                                <div>
                                  <span className="font-medium">Enrolled:</span> {item.enrolled}
                                </div>
                              )}
                              {item.length && (
                                <div>
                                  <span className="font-medium">Sessions:</span> {item.length}
                                </div>
                              )}
                              {item.hostingPlatform && (
                                <div>
                                  <span className="font-medium">Platform:</span> {item.hostingPlatform}
                                </div>
                              )}
                              {item.startDate && (
                                <div>
                                  <span className="font-medium">Start Date:</span> {new Date(item.startDate).toLocaleDateString()}
                                </div>
                              )}
                            </>
                          ) : (
                            // Creator and other niche fields
                            <>
                              {item.platform && (
                                <div>
                                  <span className="font-medium">Platform:</span> {item.platform}
                                </div>
                              )}
                              {item.type && (
                                <div>
                                  <span className="font-medium">Type:</span> {item.type}
                                </div>
                              )}
                              {item.postDate && (
                                <div>
                                  <span className="font-medium">Date:</span> {new Date(item.postDate).toLocaleDateString()}
                                </div>
                              )}
                              {item.revenue && (
                                <div>
                                  <span className="font-medium">Revenue:</span> ${item.revenue.toLocaleString()}
                                </div>
                              )}
                              {item.brand && (
                                <div>
                                  <span className="font-medium">Brand:</span> {item.brand}
                                </div>
                              )}
                              {item.analytics && (
                                <div>
                                  <span className="font-medium">Views:</span> {item.analytics.views.toLocaleString()}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleEditItem(e, item)}
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDeleteItem(e, item)}
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? `Edit ${selectedItem?.title}` : 'View Details'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Make changes to your content item below.' : 'View the details of your content item.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {activeNiche === "creator" ? (
              <>
                {/* Content Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    📝 Content Info
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editContentTitle">Content Title</Label>
                      <Input
                        id="editContentTitle"
                        value={editFormData.contentTitle}
                        onChange={(e) => setEditFormData({...editFormData, contentTitle: e.target.value})}
                        placeholder="Enter content title"
                        disabled={!isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPlatform">Platform</Label>
                      <Select value={editFormData.platform || ""} onValueChange={(value) => setEditFormData({...editFormData, platform: value})} disabled={!isEditMode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="TikTok">TikTok</SelectItem>
                          <SelectItem value="YouTube">YouTube</SelectItem>
                          <SelectItem value="Twitter">Twitter</SelectItem>
                          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="Pinterest">Pinterest</SelectItem>
                          <SelectItem value="Snapchat">Snapchat</SelectItem>
                          <SelectItem value="Twitch">Twitch</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPostType">Post Type</Label>
                      <Select value={editFormData.postType || ""} onValueChange={(value) => setEditFormData({...editFormData, postType: value})} disabled={!isEditMode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select post type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Reel">Reel</SelectItem>
                          <SelectItem value="Post">Post</SelectItem>
                          <SelectItem value="Story">Story</SelectItem>
                          <SelectItem value="Video">Video</SelectItem>
                          <SelectItem value="Carousel">Carousel</SelectItem>
                          <SelectItem value="IGTV">IGTV</SelectItem>
                          <SelectItem value="Live">Live</SelectItem>
                          <SelectItem value="UGC">UGC</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editStatus">Status</Label>
                      <Select value={editFormData.status || ""} onValueChange={(value) => setEditFormData({...editFormData, status: value})} disabled={!isEditMode}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currentConfig.stages.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Creative & Strategy Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    🎯 Creative & Strategy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editHook">Hook</Label>
                      <Textarea
                        id="editHook"
                        value={editFormData.hook}
                        onChange={(e) => setEditFormData({...editFormData, hook: e.target.value})}
                        placeholder="What's your hook?"
                        rows={3}
                        disabled={!isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editHashtags">Hashtags</Label>
                      <Input
                        id="editHashtags"
                        value={editFormData.hashtags}
                        onChange={(e) => setEditFormData({...editFormData, hashtags: e.target.value})}
                        placeholder="Enter hashtags separated by commas"
                        disabled={!isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editBrandLink">Brand Link</Label>
                      <Input
                        id="editBrandLink"
                        value={editFormData.brandLink}
                        onChange={(e) => setEditFormData({...editFormData, brandLink: e.target.value})}
                        placeholder="Enter brand link"
                        disabled={!isEditMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Analytics Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    📊 Analytics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editViews">Views</Label>
                      <Input
                        id="editViews"
                        type="number"
                        value={editFormData.views}
                        onChange={(e) => setEditFormData({...editFormData, views: e.target.value})}
                        placeholder="0"
                        disabled={!isEditMode}
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
                        disabled={!isEditMode}
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
                        disabled={!isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editRevenue">Revenue</Label>
                      <Input
                        id="editRevenue"
                        type="number"
                        step="0.01"
                        value={editFormData.revenue}
                        onChange={(e) => setEditFormData({...editFormData, revenue: e.target.value})}
                        placeholder="0.00"
                        disabled={!isEditMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    📅 Schedule
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="editPublishDate">Publish Date</Label>
                    <Input
                      id="editPublishDate"
                      type="date"
                      value={editFormData.publishDate}
                      onChange={(e) => setEditFormData({...editFormData, publishDate: e.target.value})}
                      disabled={!isEditMode}
                    />
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
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                      placeholder="Add any additional notes..."
                      rows={3}
                      disabled={!isEditMode}
                    />
                  </div>
                </div>
              </>
            ) : activeNiche === "coach" ? (
              // Coach program form
              <>
                {/* Program Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    🎓 Program Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editProgramName">Program Name</Label>
                      <Input
                        id="editProgramName"
                        value={editFormData.programName}
                        onChange={(e) => setEditFormData({...editFormData, programName: e.target.value})}
                        placeholder="Enter program name"
                        disabled={!isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editProgramType">Program Type</Label>
                      <Select value={editFormData.programType || ""} onValueChange={(value) => setEditFormData({...editFormData, programType: value})} disabled={!isEditMode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-on-1">1-on-1 Coaching</SelectItem>
                          <SelectItem value="Group">Group Program</SelectItem>
                          <SelectItem value="Course">Online Course</SelectItem>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                          <SelectItem value="Mastermind">Mastermind</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editCustomProgramType">Custom Program Type</Label>
                      <Input
                        id="editCustomProgramType"
                        value={editFormData.customProgramType}
                        onChange={(e) => setEditFormData({...editFormData, customProgramType: e.target.value})}
                        placeholder="Enter custom program type"
                        disabled={!isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editProgramStatus">Program Status</Label>
                      <Select value={editFormData.programStatus || ""} onValueChange={(value) => setEditFormData({...editFormData, programStatus: value})} disabled={!isEditMode}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currentConfig.stages.map(stage => (
                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Structure & Curriculum Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    📚 Structure & Curriculum
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editSessionCount">Session Count</Label>
                      <Input
                        id="editSessionCount"
                        value={editFormData.sessionCount}
                        onChange={(e) => setEditFormData({...editFormData, sessionCount: e.target.value})}
                        placeholder="e.g., 8 sessions"
                        disabled={!isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editHostingPlatform">Hosting Platform</Label>
                      <Select value={editFormData.hostingPlatform || ""} onValueChange={(value) => setEditFormData({...editFormData, hostingPlatform: value})} disabled={!isEditMode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kajabi">Kajabi</SelectItem>
                          <SelectItem value="Teachable">Teachable</SelectItem>
                          <SelectItem value="Thinkific">Thinkific</SelectItem>
                          <SelectItem value="Zoom">Zoom</SelectItem>
                          <SelectItem value="Google Meet">Google Meet</SelectItem>
                          <SelectItem value="Calendly">Calendly</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Pricing & Sales Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    💰 Pricing & Sales Info
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editPrice">Price</Label>
                      <Input
                        id="editPrice"
                        type="number"
                        step="0.01"
                        value={editFormData.price}
                        onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                        placeholder="0.00"
                        disabled={!isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editCurrentEnrollments">Current Enrollments</Label>
                      <Input
                        id="editCurrentEnrollments"
                        type="number"
                        value={editFormData.currentEnrollments}
                        onChange={(e) => setEditFormData({...editFormData, currentEnrollments: e.target.value})}
                        placeholder="0"
                        disabled={!isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editProgressMilestones">Progress Milestones</Label>
                      <Input
                        id="editProgressMilestones"
                        type="number"
                        value={editFormData.progressMilestones}
                        onChange={(e) => setEditFormData({...editFormData, progressMilestones: e.target.value})}
                        placeholder="0"
                        disabled={!isEditMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule & Timeline Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    📅 Schedule & Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editStartDate">Start Date</Label>
                      <Input
                        id="editStartDate"
                        type="date"
                        value={editFormData.startDate}
                        onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})}
                        disabled={!isEditMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editEndDate">End Date</Label>
                      <Input
                        id="editEndDate"
                        type="date"
                        value={editFormData.endDate}
                        onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})}
                        disabled={!isEditMode}
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
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                      placeholder="Add any additional notes..."
                      rows={3}
                      disabled={!isEditMode}
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
                      value={editFormData.contentTitle}
                      onChange={(e) => setEditFormData({...editFormData, contentTitle: e.target.value})}
                      placeholder="Enter title"
                      disabled={!isEditMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editStatus">Status</Label>
                    <Select value={editFormData.status || ""} onValueChange={(value) => setEditFormData({...editFormData, status: value})} disabled={!isEditMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentConfig.stages.map(stage => (
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
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {!isEditMode ? (
              <>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => setIsEditMode(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Item
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentStageDetailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ContentStageDetailPageWithSearchParams />
    </Suspense>
  );
}

export default function ProtectedContentStageDetail() {
  return (
    <>
      <SignedIn>
        <ContentStageDetailPage />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
} 