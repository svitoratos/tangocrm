"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarIcon, 
  Plus, 
  X, 
  User, 
  Clock, 
  DollarSign,
  MessageSquare,
  FileText,
  Calendar as CalendarClock,
  Trash2,
  Copy,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { DateUtils } from "@/lib/date-utils";
import { ContactHistoryTimeline } from "./contact-history-timeline";


// Platform options for social handles
const SOCIAL_PLATFORMS = [
  { value: "tiktok", label: "TikTok", placeholder: "@username" },
  { value: "instagram", label: "Instagram", placeholder: "@username" },
  { value: "youtube", label: "YouTube", placeholder: "@username or channel name" },
  { value: "facebook", label: "Facebook", placeholder: "username or page name" },
  { value: "snapchat", label: "Snapchat", placeholder: "username" },
  { value: "pinterest", label: "Pinterest", placeholder: "username" },
  { value: "twitch", label: "Twitch", placeholder: "username" },
  { value: "twitter", label: "Twitter (X)", placeholder: "@username" },
  { value: "linkedin", label: "LinkedIn", placeholder: "username or profile URL" },
  { value: "substack", label: "Substack", placeholder: "publication name" },
  { value: "medium", label: "Medium", placeholder: "@username" },
  { value: "onlyfans", label: "OnlyFans", placeholder: "username" },
  { value: "patreon", label: "Patreon", placeholder: "creator name" },
  { value: "discord", label: "Discord", placeholder: "username#1234" },
  { value: "reddit", label: "Reddit", placeholder: "u/username" },
  { value: "telegram", label: "Telegram", placeholder: "@username" },
  { value: "other", label: "Other", placeholder: "handle or username" }
];

// Helper function to format handle based on platform
const formatHandleForPlatform = (handle: string, platform: string): string => {
  if (!handle) return handle;
  
  const trimmedHandle = handle.trim();
  
  // Remove @ if already present for platforms that don't need it
  if (platform === "youtube" && trimmedHandle.startsWith("@")) {
    return trimmedHandle;
  }
  
  if (platform === "facebook" && trimmedHandle.startsWith("@")) {
    return trimmedHandle.substring(1);
  }
  
  if (platform === "snapchat" && trimmedHandle.startsWith("@")) {
    return trimmedHandle.substring(1);
  }
  
  if (platform === "pinterest" && trimmedHandle.startsWith("@")) {
    return trimmedHandle.substring(1);
  }
  
  if (platform === "twitch" && trimmedHandle.startsWith("@")) {
    return trimmedHandle.substring(1);
  }
  
  if (platform === "onlyfans" && trimmedHandle.startsWith("@")) {
    return trimmedHandle.substring(1);
  }
  
  if (platform === "patreon" && trimmedHandle.startsWith("@")) {
    return trimmedHandle.substring(1);
  }
  
  if (platform === "substack" && trimmedHandle.startsWith("@")) {
    return trimmedHandle.substring(1);
  }
  
  // Add @ for platforms that need it
  if (["instagram", "twitter", "tiktok", "medium", "telegram"].includes(platform) && !trimmedHandle.startsWith("@")) {
    return `@${trimmedHandle}`;
  }
  
  // Reddit special case
  if (platform === "reddit" && !trimmedHandle.startsWith("u/")) {
    return `u/${trimmedHandle}`;
  }
  
  return trimmedHandle;
};

// Helper function to get platform placeholder
const getPlatformPlaceholder = (platform: string): string => {
  const platformData = SOCIAL_PLATFORMS.find(p => p.value === platform);
  return platformData?.placeholder || "@username";
};

// Revenue calculation engine
const calculateRevenueSplit = (dealValue: number, revenueSplits: Array<{ amount: number | undefined; type: '%' | '$'; with: string }> = []) => {
  const grossRevenue = dealValue || 0;
  let totalDeductions = 0;
  const splitBreakdown: Array<{ with: string; amount: number; type: '%' | '$'; deduction: number }> = [];

  // Calculate deductions for each split
  revenueSplits.forEach(split => {
    let deduction = 0;
    
    if (split.amount !== undefined) {
      if (split.type === '%') {
        // Percentage-based split
        deduction = (grossRevenue * split.amount / 100);
      } else if (split.type === '$') {
        // Dollar amount split
        deduction = split.amount;
      }
    }
    
    totalDeductions += deduction;
    splitBreakdown.push({
      with: split.with,
      amount: split.amount || 0,
      type: split.type,
      deduction: deduction
    });
  });

  const netRevenue = Math.max(0, grossRevenue - totalDeductions);
  
  return {
    grossRevenue,
    totalDeductions,
    netRevenue,
    splitBreakdown,
    margin: grossRevenue > 0 ? ((netRevenue / grossRevenue) * 100) : 0
  };
};

// Validation functions for revenue splits
const validateRevenueSplits = (revenueSplits: Array<{ amount: number | undefined; type: '%' | '$'; with: string }> = [], dealValue: number = 0) => {
  const errors: string[] = [];
  
  if (!revenueSplits || revenueSplits.length === 0) {
    return { isValid: true, errors: [] };
  }

  let totalPercentage = 0;
  let totalDollarAmount = 0;

  revenueSplits.forEach((split, index) => {
    // Validate required fields
    if (!split.with || split.with.trim() === '') {
      errors.push(`Split ${index + 1}: "Split with" is required`);
    }
    
    if (split.amount === undefined || split.amount <= 0) {
      errors.push(`Split ${index + 1}: Amount must be greater than 0`);
    }
    
    // Track totals for validation
    if (split.amount !== undefined) {
      if (split.type === '%') {
        totalPercentage += split.amount;
      } else if (split.type === '$') {
        totalDollarAmount += split.amount;
      }
    }
  });

  // Validate percentage splits don't exceed 100%
  if (totalPercentage > 100) {
    errors.push(`Total percentage splits (${totalPercentage}%) exceed 100%`);
  }

  // Validate dollar splits don't exceed gross revenue
  if (totalDollarAmount > dealValue) {
    errors.push(`Total dollar splits ($${totalDollarAmount}) exceed gross revenue ($${dealValue})`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

interface OpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity?: any;
  onSave: (data: any) => void;
  userNiche?: string;
  isLoading?: boolean;
}

interface FormData {
  // Common fields
  status: string;
  priority: string;
  notes: string;
  tags: string[];
  clientBudget?: number;
  outreachTouchpoint?: string;
  
  // Creator fields
  campaignName?: string;
  brandName?: string;
  dealValue?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialHandles?: Array<{ platform: string; handle: string }>;
  followUpDate?: Date;
  deliverables?: string;
  platform?: string;
  customPlatformCreator?: string;
  postType?: string;
  customPostType?: string;
  script?: string;
  
  // Revenue splits (available for all niches)
  revenueSplits?: Array<{ amount: number | undefined; type: '%' | '$'; with: string }>;
  
  // Calculated revenue fields (auto-generated)
  calculatedGrossRevenue?: number;
  calculatedSplitAmount?: number;
  calculatedNetRevenue?: number;
  lastCalculatedAt?: string;
  
  // Coach fields
  clientName?: string;
  programName?: string;
  packageType?: string;
  customPackageType?: string;
  proposedValue?: number;
  discoveryCallDate?: Date;
  sessionCount?: number;
  focusArea?: string;
  programHostingPlatform?: string;
  customPlatform?: string;
  
  // Podcaster fields
  guestOrSponsorName?: string;
  type?: string;
  customType?: string;
  episodeTitle?: string;
  sponsorshipCampaign?: string;
  scheduledDate?: Date;
  sponsorshipValue?: number;
  confirmed?: boolean;
  paid?: boolean;
  duration?: string;
  customDuration?: string;
  topics?: string;
  
  // Freelancer fields
  companyName?: string;
  projectTitle?: string;
  projectValue?: number;
  dueDate?: Date;
  hasAttachments?: boolean;
  

}

// Add this new utility function at the top of the file, after the imports
const createBulletproofDateHandler = () => {
  const userTimezone = DateUtils.getUserTimezone();
  
  return {
    // Convert any date input to a proper Date object for the form
    parseDateForForm: (dateInput: any): Date | undefined => {
      if (!dateInput) return undefined;
      
      try {
        // If it's already a Date object, return it
        if (dateInput instanceof Date) {
          return dateInput;
        }
        
        // If it's a string, parse it
        if (typeof dateInput === 'string') {
          // Handle ISO strings (from database)
          if (dateInput.includes('T') || dateInput.includes('Z')) {
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return undefined;
            
            // Convert to user's timezone for form display
            const userDate = DateUtils.toUserTimezone(date, userTimezone);
            return userDate || undefined;
          }
          
          // Handle YYYY-MM-DD format (from HTML date inputs)
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            const date = new Date(dateInput + 'T00:00:00');
            if (isNaN(date.getTime())) return undefined;
            return date;
          }
        }
        
        return undefined;
      } catch (error) {
        console.error('Error parsing date for form:', dateInput, error);
        return undefined;
      }
    },
    
    // Convert form Date object to ISO string for database storage
    formatDateForStorage: (date: Date | undefined): string | undefined => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return undefined;
      }
      
      try {
        // Convert to UTC for storage
        const utcDate = DateUtils.fromUserTimezoneToUTC(date, userTimezone);
        return utcDate ? utcDate.toISOString() : undefined;
      } catch (error) {
        console.error('Error formatting date for storage:', date, error);
        return undefined;
      }
    },
    
    // Convert form Date object to YYYY-MM-DD for HTML date inputs
    formatDateForInput: (date: Date | undefined): string => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '';
      }
      
      try {
        return DateUtils.formatForInput(date, userTimezone);
      } catch (error) {
        console.error('Error formatting date for input:', date, error);
        return '';
      }
    },
  };
};

const OpportunityModal = ({ isOpen, onClose, opportunity, onSave, userNiche = "general", isLoading = false }: OpportunityModalProps) => {
  
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState<FormData>({
    status: "new",
    priority: "medium",
    notes: "",
    tags: [],
    // Initialize all contact fields to empty strings
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    socialHandles: [],
    clientBudget: undefined,
    revenueSplits: [],
    
    // Calculated revenue fields
    calculatedGrossRevenue: undefined,
    calculatedSplitAmount: undefined,
    calculatedNetRevenue: undefined,
    lastCalculatedAt: undefined,
    
    // File uploads
    
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const lastLoadedOpportunityId = useRef<string | null>(null);
  const formInitialized = useRef<boolean>(false);
  const userHasMadeChanges = useRef<boolean>(false);
  
  // Create bulletproof date handler
  const dateHandler = createBulletproofDateHandler();
  


  // Remove the mock activityItems array
  // const activityItems = [
  //   { type: "created", user: "You", time: "2 hours ago", description: "Opportunity created" },
  //   { type: "updated", user: "You", time: "1 hour ago", description: "Updated deal value" },
  //   { type: "note", user: "Team Member", time: "30 minutes ago", description: "Added follow-up note" }
  // ];

    useEffect(() => {
    // SIMPLIFIED LOGIC: Always load opportunity data when provided
    if (opportunity && opportunity.id !== lastLoadedOpportunityId.current) {
      lastLoadedOpportunityId.current = opportunity.id;
      formInitialized.current = true;
      userHasMadeChanges.current = false;
      
      // Get custom fields and notes from the opportunity object
      let customFields: any = {};
      let notes = opportunity.notes || "";
      
      // First try to get custom fields from the opportunity object
      if (opportunity.customFields) {
        customFields = opportunity.customFields;
      }
      
      // Also check if custom_fields exists (database column name)
      if (opportunity.custom_fields && Object.keys(customFields).length === 0) {
        customFields = opportunity.custom_fields;
      }
      
      // Handle notes properly - extract the actual notes content from metadata
      
        if (opportunity.notes && opportunity.notes.startsWith('{')) {
        try {
          const parsedNotes = JSON.parse(opportunity.notes);
          
          // Extract the actual notes content
          if (parsedNotes.notes !== undefined) {
            notes = parsedNotes.notes;
          } else {
            notes = "";
          }
          
          // If no custom fields from opportunity object, try to get from notes metadata
          if (!opportunity.customFields && !opportunity.custom_fields && parsedNotes.customFields) {
            customFields = parsedNotes.customFields;
        }
      } catch (error) {
          notes = opportunity.notes || "";
        }
      } else {
        notes = opportunity.notes || "";
      }
      

      
      // Map database status to UI stage ID
      const mapDatabaseStatusToStageId = (dbStatus: string, niche: string): string => {
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
            'won': 'paid',
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
      };
      
      const formDataToSet = {
        status: mapDatabaseStatusToStageId(opportunity.status || "prospecting", userNiche),
        priority: customFields.priority || "medium",
        notes: notes,
        tags: opportunity.tags || [],
        clientBudget: customFields.clientBudget || undefined,
        
        // Creator fields
        campaignName: customFields.campaignName || opportunity.title || "",
        brandName: customFields.brandName || opportunity.description || "",
        dealValue: customFields.dealValue || opportunity.value || 0,
        contactName: customFields.contactName || "",
        contactEmail: customFields.contactEmail || "",
        contactPhone: customFields.contactPhone || "",
        socialHandles: customFields.socialHandles || [],
        followUpDate: dateHandler.parseDateForForm(customFields.followUpDate || opportunity.expected_close_date),
        deliverables: customFields.deliverables || "",
        platform: customFields.platform || "",
        customPlatformCreator: customFields.customPlatformCreator || "",
        postType: customFields.postType || "",
        customPostType: customFields.customPostType || "",
        script: customFields.script || "",
        revenueSplits: customFields.revenueSplits || [],
        
        // Calculated revenue fields
        calculatedGrossRevenue: customFields.calculatedGrossRevenue || undefined,
        calculatedSplitAmount: customFields.calculatedSplitAmount || undefined,
        calculatedNetRevenue: customFields.calculatedNetRevenue || undefined,
        lastCalculatedAt: customFields.lastCalculatedAt || undefined,
        
        // Coach fields
        clientName: userNiche === "freelancer" ? (customFields.companyName || opportunity.title || "") : (customFields.clientName || opportunity.title || ""),
        programName: customFields.programName || opportunity.description || "",
        packageType: customFields.packageType || "",
        customPackageType: customFields.customPackageType || "",
        proposedValue: customFields.proposedValue || opportunity.value || 0,
        discoveryCallDate: dateHandler.parseDateForForm(customFields.discoveryCallDate || opportunity.expected_close_date),
        sessionCount: customFields.sessionCount || opportunity.probability || 50,
        focusArea: customFields.focusArea || "",
        programHostingPlatform: customFields.programHostingPlatform || "",
        customPlatform: customFields.customPlatform || "",
        
        // Podcaster fields
        guestOrSponsorName: customFields.guestOrSponsorName || opportunity.title || "",
        type: customFields.type || "",
        customType: customFields.customType || "",
        episodeTitle: customFields.episodeTitle || opportunity.description || "",
        sponsorshipCampaign: customFields.sponsorshipCampaign || opportunity.title || "",
        scheduledDate: dateHandler.parseDateForForm(customFields.scheduledDate || opportunity.expected_close_date),
        sponsorshipValue: customFields.sponsorshipValue || opportunity.value || 0,
        confirmed: customFields.confirmed || opportunity.status === "won",
        paid: customFields.paid || opportunity.status === "won",
        duration: customFields.duration || "",
        customDuration: customFields.customDuration || "",
        topics: customFields.topics || "",
        
        // Freelancer fields
        companyName: customFields.companyName || opportunity.title || "",
        projectTitle: customFields.projectTitle || opportunity.description || "",
        projectValue: customFields.projectValue || opportunity.value || 0,
        dueDate: dateHandler.parseDateForForm(customFields.dueDate || opportunity.expected_close_date),
        hasAttachments: customFields.hasAttachments || false
      };
      
      setFormData(formDataToSet);
      formInitialized.current = true;
    } else if (opportunity && opportunity.id === lastLoadedOpportunityId.current) {
        
      // Get custom fields and notes from the opportunity object
        let customFields: any = {};
        let notes = opportunity.notes || "";
        
      // First try to get custom fields from the opportunity object
      if (opportunity.customFields) {
        customFields = opportunity.customFields;
        console.log('Using custom fields from opportunity object:', customFields);
      }
      
      // Also check if custom_fields exists (database column name)
      if (opportunity.custom_fields && Object.keys(customFields).length === 0) {
        customFields = opportunity.custom_fields;
        console.log('Using custom_fields from database column:', customFields);
      }
      
      // Handle notes properly - extract the actual notes content from metadata
      console.log('🔍 Processing notes:', {
        originalNotes: opportunity.notes,
        notesType: typeof opportunity.notes,
        startsWithBrace: opportunity.notes?.startsWith('{'),
        notesLength: opportunity.notes?.length
      });
      
          if (opportunity.notes && opportunity.notes.startsWith('{')) {
        try {
          const parsedNotes = JSON.parse(opportunity.notes);
          console.log('✅ Parsed notes metadata:', parsedNotes);
          
          // Extract the actual notes content
          if (parsedNotes.notes !== undefined) {
            notes = parsedNotes.notes;
            console.log('✅ Extracted actual notes from metadata:', notes);
          } else {
            console.log('⚠️ No notes field found in metadata, using empty string');
            notes = "";
          }
          
          // If no custom fields from opportunity object, try to get from notes metadata
          if (!opportunity.customFields && !opportunity.custom_fields && parsedNotes.customFields) {
            customFields = parsedNotes.customFields;
            console.log('✅ Extracted custom fields from notes metadata:', customFields);
          }
        } catch (error) {
          console.log('❌ Could not parse notes metadata, using notes as-is:', error);
          notes = opportunity.notes || "";
        }
      } else {
        console.log('📝 Notes are not JSON metadata, using as-is:', opportunity.notes);
        notes = opportunity.notes || "";
      }
      
      console.log('Final customFields being used for form initialization:', customFields);
      console.log('Script field from customFields:', customFields.script);
      console.log('Script field type:', typeof customFields.script);
      console.log('Script field length:', customFields.script?.length);
      console.log('Final notes being used for form initialization:', notes);
      console.log('📋 Notes summary:', {
        originalNotes: opportunity.notes,
        extractedNotes: notes,
        notesInFormData: notes
      });
      console.log('Contact fields from customFields:', {
        contactName: customFields.contactName,
        contactEmail: customFields.contactEmail,
        contactPhone: customFields.contactPhone
      });
        
        // Map database status to UI stage ID
        const mapDatabaseStatusToStageId = (dbStatus: string, niche: string): string => {
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
              'won': 'recorded',
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
        };
        
        const formDataToSet = {
          status: mapDatabaseStatusToStageId(opportunity.status || "prospecting", userNiche),
          priority: customFields.priority || "medium",
          notes: notes,
          tags: opportunity.tags || [],
          clientBudget: customFields.clientBudget || undefined,
          
          // Creator fields
          campaignName: customFields.campaignName || opportunity.title || "",
          brandName: customFields.brandName || opportunity.description || "",
          dealValue: customFields.dealValue || opportunity.value || 0,
          contactName: customFields.contactName || "",
        contactEmail: customFields.contactEmail || "",
        contactPhone: customFields.contactPhone || "",
        socialHandles: customFields.socialHandles || [],
          followUpDate: dateHandler.parseDateForForm(customFields.followUpDate || opportunity.expected_close_date),
          deliverables: customFields.deliverables || "",
          platform: customFields.platform || "",
          customPlatformCreator: customFields.customPlatformCreator || "",
          postType: customFields.postType || "",
          customPostType: customFields.customPostType || "",
        script: customFields.script || "",
          
          // Coach fields
          clientName: userNiche === "freelancer" ? (customFields.companyName || opportunity.title || "") : (customFields.clientName || opportunity.title || ""),
          programName: customFields.programName || opportunity.description || "",
          packageType: customFields.packageType || "",
          customPackageType: customFields.customPackageType || "",
          proposedValue: customFields.proposedValue || opportunity.value || 0,
          discoveryCallDate: dateHandler.parseDateForForm(customFields.discoveryCallDate || opportunity.expected_close_date),
          sessionCount: customFields.sessionCount || opportunity.probability || 50,
          focusArea: customFields.focusArea || "",
          programHostingPlatform: customFields.programHostingPlatform || "",
          customPlatform: customFields.customPlatform || "",
          
                  // Podcaster fields
        guestOrSponsorName: customFields.guestOrSponsorName || opportunity.title || "",
        type: customFields.type || "",
        customType: customFields.customType || "",
        episodeTitle: customFields.episodeTitle || opportunity.description || "",
        sponsorshipCampaign: customFields.sponsorshipCampaign || opportunity.title || "",
        scheduledDate: dateHandler.parseDateForForm(customFields.scheduledDate || opportunity.expected_close_date),
        sponsorshipValue: customFields.sponsorshipValue || opportunity.value || 0,
        confirmed: customFields.confirmed || opportunity.status === "won",
        paid: customFields.paid || opportunity.status === "won",
        duration: customFields.duration || "",
        customDuration: customFields.customDuration || "",
        topics: customFields.topics || "",
          
          // Freelancer fields
          companyName: customFields.companyName || opportunity.title || "",
          projectTitle: customFields.projectTitle || opportunity.description || "",
          projectValue: customFields.projectValue || opportunity.value || 0,
      dueDate: dateHandler.parseDateForForm(customFields.dueDate || opportunity.expected_close_date),
        hasAttachments: customFields.hasAttachments || false,
        revenueSplits: customFields.revenueSplits || [],
        
        // Calculated revenue fields
        calculatedGrossRevenue: customFields.calculatedGrossRevenue || undefined,
        calculatedSplitAmount: customFields.calculatedSplitAmount || undefined,
        calculatedNetRevenue: customFields.calculatedNetRevenue || undefined,
        lastCalculatedAt: customFields.lastCalculatedAt || undefined
        };
        

        setFormData(formDataToSet);
        formInitialized.current = true;
    } else if (!opportunity) {
      // Creating a new opportunity - reset form
      lastLoadedOpportunityId.current = null;
      formInitialized.current = false;
      userHasMadeChanges.current = false;
      
      let defaultStatus = "outreach";
      if (userNiche === "coach") {
        defaultStatus = "new-lead";
      } else if (userNiche === "podcaster") {
        defaultStatus = "outreach";
      } else if (userNiche === "freelancer") {
        defaultStatus = "new-inquiry";
      }
      
      setFormData({
        status: defaultStatus,
        priority: "medium",
        notes: "",
        tags: [],
        clientBudget: undefined,
        outreachTouchpoint: "",
        
        // Creator fields
        campaignName: "",
        brandName: "",
        dealValue: undefined,
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        socialHandles: [],
        followUpDate: undefined,
        deliverables: "",
        platform: "",
        customPlatformCreator: "",
        postType: "",
        customPostType: "",
        revenueSplits: [],
        script: "",
        
        // Calculated revenue fields
        calculatedGrossRevenue: undefined,
        calculatedSplitAmount: undefined,
        calculatedNetRevenue: undefined,
        lastCalculatedAt: undefined,
        
        // Coach fields
        clientName: "",
        programName: "",
        packageType: "",
        customPackageType: "",
        proposedValue: undefined,
        discoveryCallDate: undefined,
        sessionCount: undefined,
        focusArea: "",
        programHostingPlatform: "",
        customPlatform: "",
        
        // Podcaster fields
        guestOrSponsorName: "",
        type: "",
        customType: "",
        episodeTitle: "",
        sponsorshipCampaign: "",
        scheduledDate: undefined,
        sponsorshipValue: undefined,
        confirmed: false,
        paid: false,
        duration: "",
        customDuration: "",
        topics: "",
        
        // Freelancer fields
        companyName: "",
        projectTitle: "",
        projectValue: undefined,
        dueDate: undefined,
        hasAttachments: false,
        
        // File uploads

      });
    }
  }, [opportunity, userNiche, isOpen]);

  // Clear errors when form becomes complete
  useEffect(() => {
    if (isFormComplete() && Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [formData, errors]);

  // Calculate revenue when form data is loaded or deal value/revenue splits change
  useEffect(() => {
    if (formData.dealValue !== undefined && formData.revenueSplits) {
      const calculation = calculateRevenueSplit(formData.dealValue, formData.revenueSplits);
      setFormData(prev => ({
        ...prev,
        calculatedGrossRevenue: calculation.grossRevenue,
        calculatedSplitAmount: calculation.totalDeductions,
        calculatedNetRevenue: calculation.netRevenue,
        lastCalculatedAt: new Date().toISOString()
      }));
    }
  }, [formData.dealValue, formData.revenueSplits]);



  // Debug form completion status
  useEffect(() => {
    const complete = isFormComplete();
    console.log('Form completion status changed:', { 
      complete, 
      userNiche,
      formData: {
        status: formData.status,
        priority: formData.priority,
        campaignName: formData.campaignName,
        brandName: formData.brandName,
        platform: formData.platform,
        postType: formData.postType,
        clientName: formData.clientName,
        programName: formData.programName,
        packageType: formData.packageType,
        duration: formData.duration,
        guestOrSponsorName: formData.guestOrSponsorName,
        type: formData.type,
        episodeTitle: formData.episodeTitle,
        companyName: formData.companyName,
        projectTitle: formData.projectTitle,
        dueDate: formData.dueDate
      }
    });
  }, [formData, userNiche]);



  const handleInputChange = (field: string, value: any) => {
    
    // Mark that user has made changes
    userHasMadeChanges.current = true;
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
              // Auto-calculate revenue splits when deal value, proposed value, project value, revenue splits, or status changes
        if (field === 'dealValue' || field === 'proposedValue' || field === 'projectValue' || field === 'revenueSplits' || field === 'status') {
          // Get the appropriate value field based on niche
          let dealValue = 0;
          if (field === 'dealValue') {
            dealValue = value;
          } else if (field === 'proposedValue') {
            dealValue = value;
          } else if (field === 'projectValue') {
            dealValue = value;
          } else {
            // Use the appropriate value field for the current niche
            if (userNiche === 'creator') {
              dealValue = newData.dealValue || 0;
            } else if (userNiche === 'coach') {
              dealValue = newData.proposedValue || 0;
            } else if (userNiche === 'freelancer') {
              dealValue = newData.projectValue || 0;
            } else {
              dealValue = newData.dealValue || 0;
            }
          }
          const revenueSplits = field === 'revenueSplits' ? value : newData.revenueSplits || [];
          
          // Always calculate revenue when deal value or revenue splits change
          const calculation = calculateRevenueSplit(dealValue, revenueSplits);
          const validation = validateRevenueSplits(revenueSplits, dealValue);
        
          // Update calculated fields
          newData.calculatedGrossRevenue = calculation.grossRevenue;
          newData.calculatedSplitAmount = calculation.totalDeductions;
          newData.calculatedNetRevenue = calculation.netRevenue;
          newData.lastCalculatedAt = new Date().toISOString();
        
          // Log validation errors if any
          if (!validation.isValid) {
            console.warn('Revenue split validation errors:', validation.errors);
          }
          
          // Special handling for completed deals
          if (field === 'status' && (value === 'paid' || value === 'completed' || value === 'published' || value === 'delivered')) {
            // Store completion timestamp
            newData.lastCalculatedAt = new Date().toISOString();
          }
        }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleDateSelect = (field: string, date: Date | undefined) => {
    handleInputChange(field, date);
  };



  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Common mandatory fields for all niches
    if (!formData.status || formData.status.trim() === '') {
      newErrors.status = "Status is required";
    }
    
    // Outreach touchpoint is mandatory for all niches
    if (!formData.outreachTouchpoint || formData.outreachTouchpoint.trim() === '') {
      newErrors.outreachTouchpoint = "Outreach is required";
    }
    
    // Priority is optional for all niches
    // No validation needed for priority field
    
    // Niche-specific mandatory fields
    if (userNiche === "creator") {
      if (!formData.campaignName || formData.campaignName.trim() === '') {
        newErrors.campaignName = "Opportunity/Campaign name is required";
      }
      if (!formData.brandName || formData.brandName.trim() === '') {
        newErrors.brandName = "Brand/Client name is required";
      }
    } else if (userNiche === "coach") {
      if (!formData.clientName || formData.clientName.trim() === '') {
        newErrors.clientName = "Client name is required";
      }
    } else if (userNiche === "podcaster") {
      if (!formData.guestOrSponsorName || formData.guestOrSponsorName.trim() === '') {
        newErrors.guestOrSponsorName = "Guest or sponsor name is required";
      }
      if (!formData.type || formData.type.trim() === '') {
        newErrors.type = "Type is required";
      }
    } else if (userNiche === "freelancer") {
      if (!formData.companyName || formData.companyName.trim() === '') {
        newErrors.companyName = "Company name is required";
      }
      if (!formData.projectTitle || formData.projectTitle.trim() === '') {
        newErrors.projectTitle = "Project title is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is complete (all mandatory fields filled)
  const isFormComplete = () => {
    
    // Helper function to check if a field is empty
    const isEmpty = (value: any) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.trim() === '';
      if (typeof value === 'number') return false; // Numbers are never empty
      return !value;
    };
    
    // Common mandatory fields
    if (isEmpty(formData.status)) {
      return false;
    }
    
    // Outreach touchpoint is mandatory for all niches
    if (isEmpty(formData.outreachTouchpoint)) {
      return false;
    }
    
    // Priority is optional for all niches
    // No validation needed for priority field
    
    // Niche-specific mandatory fields
    if (userNiche === "creator") {
      if (isEmpty(formData.campaignName)) {
        return false;
      }
      if (isEmpty(formData.brandName)) {
        return false;
      }
    } else if (userNiche === "coach") {
      if (isEmpty(formData.clientName)) {
        return false;
      }
    } else if (userNiche === "podcaster") {
      if (isEmpty(formData.guestOrSponsorName)) {
        return false;
      }
      if (isEmpty(formData.type)) {
        return false;
      }
    } else if (userNiche === "freelancer") {
      if (isEmpty(formData.companyName)) {
        return false;
      }
      if (isEmpty(formData.projectTitle)) {
        return false;
      }
    }
    
    return true;
  };

  const handleSave = () => {
    console.log('=== SAVE FUNCTION CALLED ===');
    console.log('Save button clicked!');
    
    // Always validate the form first to show any errors
    const isValid = validateForm();
    
    // Check if form is complete
    const isComplete = isFormComplete();
    
    console.log('=== SAVE FUNCTION DEBUG ===');
    console.log('Current formData at save time:', formData);
    console.log('formData.dueDate at save time:', formData.dueDate);
    console.log('formData.dueDate type:', typeof formData.dueDate);
    console.log('formData.dueDate instanceof Date:', formData.dueDate instanceof Date);
    if (formData.dueDate) {
      console.log('formData.dueDate.toISOString():', formData.dueDate.toISOString());
      console.log('formData.dueDate.toLocaleDateString():', formData.dueDate.toLocaleDateString());
    }
    
    console.log('Validation check:', { 
      isValid, 
      isComplete, 
      errors,
      userNiche,
      formData: {
        status: formData.status,
        priority: formData.priority,
        clientName: formData.clientName,
        packageType: formData.packageType,
        duration: formData.duration,
        campaignName: formData.campaignName,
        brandName: formData.brandName,
        platform: formData.platform,
        postType: formData.postType,
        dueDate: formData.dueDate
      }
    });
    
    // Check if form is complete - this is the main validation
    if (!isComplete) {
      console.log('Form is incomplete. Cannot save.');
      // Don't close the modal, let user see the errors
      return;
    }
    
    // Additional validation check
    if (!isValid) {
      console.log('Form validation failed. Cannot save.');
      // Don't close the modal, let user see the errors
      return;
    }
    
    // If we get here, both checks passed
    console.log('Form validation passed. Proceeding with save.');
    
    // Reset user changes flag since we're saving
    userHasMadeChanges.current = false;
    
    // Create a comprehensive data object that includes all form fields
    const userTimezone = DateUtils.getUserTimezone();
    const comprehensiveData = {
      // Basic database fields
      title: formData.campaignName || formData.clientName || formData.guestOrSponsorName || formData.companyName || "",
      description: formData.brandName || formData.programName || formData.episodeTitle || formData.projectTitle || "",
      value: formData.dealValue || formData.proposedValue || formData.sponsorshipValue || formData.projectValue || 0,
      status: formData.status,
      type: userNiche === 'coach' ? 'coaching' : 
            userNiche === 'podcaster' ? 'sponsorship' : 
            userNiche === 'freelancer' ? 'consulting' : 
            'brand_deal', // default for creator
      probability: formData.sessionCount || 50,
      expected_close_date: (() => {
        // Use bulletproof date handler for all niches
        if (userNiche === 'creator' && formData.followUpDate) {
          return dateHandler.formatDateForStorage(formData.followUpDate);
        } else if (userNiche === 'coach' && formData.discoveryCallDate) {
          return dateHandler.formatDateForStorage(formData.discoveryCallDate);
        } else if (userNiche === 'podcaster' && formData.scheduledDate) {
          return dateHandler.formatDateForStorage(formData.scheduledDate);
        } else if (userNiche === 'freelancer' && formData.dueDate) {
          return dateHandler.formatDateForStorage(formData.dueDate);
        }
        return undefined;
      })(),
      notes: formData.notes || "",
      tags: formData.tags,
      
      // Store all niche-specific data as custom fields
      customFields: {
        // Common fields
        priority: formData.priority,
        clientBudget: formData.clientBudget,
        outreachTouchpoint: formData.outreachTouchpoint,
        
        // Creator fields
        campaignName: formData.campaignName,
        brandName: formData.brandName,
        dealValue: formData.dealValue,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        socialHandles: formData.socialHandles,
        followUpDate: dateHandler.formatDateForStorage(formData.followUpDate),
        deliverables: formData.deliverables,
        platform: formData.platform,
        customPlatformCreator: formData.customPlatformCreator,
        postType: formData.postType,
        customPostType: formData.customPostType,
        revenueSplits: formData.revenueSplits,
        script: formData.script,
        
        // Calculated revenue fields
        calculatedGrossRevenue: formData.calculatedGrossRevenue,
        calculatedSplitAmount: formData.calculatedSplitAmount,
        calculatedNetRevenue: formData.calculatedNetRevenue,
        lastCalculatedAt: formData.lastCalculatedAt,
        
        // Coach fields
        clientName: formData.clientName,
        programName: formData.programName,
        packageType: formData.packageType,
        customPackageType: formData.customPackageType,
        proposedValue: formData.proposedValue,
        discoveryCallDate: dateHandler.formatDateForStorage(formData.discoveryCallDate),
        sessionCount: formData.sessionCount,
        focusArea: formData.focusArea,
        programHostingPlatform: formData.programHostingPlatform,
        customPlatform: formData.customPlatform,
        
        // Podcaster fields
        guestOrSponsorName: formData.guestOrSponsorName,
        type: formData.type,
        customType: formData.customType,
        episodeTitle: formData.episodeTitle,
        sponsorshipCampaign: formData.sponsorshipCampaign,
        scheduledDate: dateHandler.formatDateForStorage(formData.scheduledDate),
        sponsorshipValue: formData.sponsorshipValue,
        confirmed: formData.confirmed,
        paid: formData.paid,
        duration: formData.duration,
        customDuration: formData.customDuration,
        topics: formData.topics,
        
        // Freelancer fields
        companyName: formData.companyName,
        projectTitle: formData.projectTitle,
        projectValue: formData.projectValue,
        dueDate: dateHandler.formatDateForStorage(formData.dueDate),
        hasAttachments: formData.hasAttachments,
        

      }
    };
    
    console.log('=== COMPREHENSIVE DATA DEBUG ===');
    console.log('formData.dueDate before comprehensive data creation:', formData.dueDate);
    console.log('formData.dueDate?.toISOString():', formData.dueDate?.toISOString());
    console.log('Saving comprehensive opportunity data:', comprehensiveData);
    console.log('comprehensiveData.expected_close_date:', comprehensiveData.expected_close_date);
    console.log('comprehensiveData.customFields.dueDate:', comprehensiveData.customFields.dueDate);
    console.log('Creator contact fields being saved:', {
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      socialHandles: formData.socialHandles,
      clientBudget: formData.clientBudget
    });
    console.log('Full customFields object being sent:', comprehensiveData.customFields);
    console.log('Form data at save time:', {
      clientName: formData.clientName,
      campaignName: formData.campaignName,
      guestOrSponsorName: formData.guestOrSponsorName,
      companyName: formData.companyName,
      title: comprehensiveData.title,
      dueDate: formData.dueDate,
      dueDateISO: formData.dueDate?.toISOString(),
      expected_close_date: comprehensiveData.expected_close_date,
      dueDateType: typeof formData.dueDate,
      expectedCloseDateType: typeof comprehensiveData.expected_close_date
    });
    console.log('Opportunity Modal - Calling onSave with comprehensiveData:', comprehensiveData);
    console.log('Script being saved:', comprehensiveData.customFields.script);
    
    
    try {
    onSave(comprehensiveData);
    onClose();
    } catch (error) {
      console.error('Error during save:', error);
      // Don't close the modal if there's an error
    }
  };



  const renderNicheSpecificFields = () => {
    switch (userNiche) {
      case "creator":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Opportunity/Campaign Name *</Label>
                <Input
                  id="campaignName"
                  value={formData.campaignName || ""}
                  onChange={(e) => handleInputChange("campaignName", e.target.value)}
                  className={errors.campaignName ? "border-red-500" : ""}
                />
                {errors.campaignName && <p className="text-sm text-red-500">{errors.campaignName}</p>}
                {/* Debug working field value */}

              </div>
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand/Client Name *</Label>
                <Input
                  id="brandName"
                  value={formData.brandName || ""}
                  onChange={(e) => handleInputChange("brandName", e.target.value)}
                  className={errors.brandName ? "border-red-500" : ""}
                />
                {errors.brandName && <p className="text-sm text-red-500">{errors.brandName}</p>}
                {/* Debug working field value */}

              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dealValue">Deal Value</Label>
                <Input
                  id="dealValue"
                  type="number"
                  value={formData.dealValue || ""}
                  onChange={(e) => handleInputChange("dealValue", parseFloat(e.target.value))}
                />
                {/* Debug working field value */}

              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName || ""}
                  onChange={(e) => handleInputChange("contactName", e.target.value)}
                />
                
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail || ""}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="contact@example.com"
                />
                
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone || ""}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={formData.platform} onValueChange={(value) => handleInputChange("platform", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="snapchat">Snapchat</SelectItem>
                  <SelectItem value="pinterest">Pinterest</SelectItem>
                  <SelectItem value="twitch">Twitch</SelectItem>
                  <SelectItem value="twitter">Twitter (X)</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="substack">Substack</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="onlyfans">OnlyFans</SelectItem>
                  <SelectItem value="patreon">Patreon</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.platform === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customPlatformCreator">Custom Platform</Label>
                <Input
                  id="customPlatformCreator"
                  value={formData.customPlatformCreator || ""}
                  onChange={(e) => handleInputChange("customPlatformCreator", e.target.value)}
                  placeholder="Enter custom platform name..."
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="postType">Post Type</Label>
              <Select value={formData.postType} onValueChange={(value) => handleInputChange("postType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="vlog">Vlog</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="ugc">UGC</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.postType === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customPostType">Custom Post Type</Label>
                <Input
                  id="customPostType"
                  value={formData.customPostType || ""}
                  onChange={(e) => handleInputChange("customPostType", e.target.value)}
                  placeholder="Enter custom post type..."
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="deliverables">Deliverables</Label>
              <Textarea
                id="deliverables"
                value={formData.deliverables || ""}
                onChange={(e) => handleInputChange("deliverables", e.target.value)}
                placeholder="Describe the deliverables..."
              />
            </div>
            <div className="space-y-2">
              <Label>Social Handles</Label>
              <div className="flex flex-col gap-2">
                {formData.socialHandles && formData.socialHandles.length > 0 && formData.socialHandles.map((sh, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Select
                      value={sh.platform}
                      onValueChange={platform => {
                        const updated = [...formData.socialHandles!];
                        updated[idx] = { ...updated[idx], platform };
                        handleInputChange("socialHandles", updated);
                      }}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOCIAL_PLATFORMS.filter(p => !formData.socialHandles!.some((h, i) => h.platform === p.value && i !== idx)).map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="w-48"
                      value={sh.handle}
                      placeholder={getPlatformPlaceholder(sh.platform)}
                      onChange={e => {
                        const updated = [...formData.socialHandles!];
                        updated[idx] = { ...updated[idx], handle: formatHandleForPlatform(e.target.value, sh.platform) };
                        handleInputChange("socialHandles", updated);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const updated = formData.socialHandles!.filter((_, i) => i !== idx);
                        handleInputChange("socialHandles", updated);
                      }}
                      aria-label="Remove handle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => navigator.clipboard.writeText(sh.handle)}
                      aria-label="Copy handle"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {sh.platform && sh.handle && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // Open profile in new tab if possible
                          let url = "";
                          switch (sh.platform) {
                            case "instagram": url = `https://instagram.com/${sh.handle.replace(/^@/, "")}`; break;
                            case "tiktok": url = `https://tiktok.com/@${sh.handle.replace(/^@/, "")}`; break;
                            case "twitter": url = `https://twitter.com/${sh.handle.replace(/^@/, "")}`; break;
                            case "youtube": url = `https://youtube.com/${sh.handle.replace(/^@/, "")}`; break;
                            case "facebook": url = `https://facebook.com/${sh.handle.replace(/^@/, "")}`; break;
                            case "reddit": url = `https://reddit.com/user/${sh.handle.replace(/^u\//, "")}`; break;
                            case "linkedin": url = `https://linkedin.com/in/${sh.handle.replace(/^@/, "")}`; break;
                            case "discord": url = "https://discord.com"; break;
                            case "telegram": url = `https://t.me/${sh.handle.replace(/^@/, "")}`; break;
                            default: url = "";
                          }
                          if (url) window.open(url, "_blank");
                        }}
                        aria-label="Visit profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    // Add new handle, default to first available platform
                    const used = formData.socialHandles!.map(h => h.platform);
                    const available = SOCIAL_PLATFORMS.find(p => !used.includes(p.value) && p.value !== "other");
                    handleInputChange("socialHandles", [
                      ...formData.socialHandles!,
                      { platform: available?.value || "instagram", handle: "" }
                    ]);
                  }}
                  disabled={formData.socialHandles && formData.socialHandles.length >= SOCIAL_PLATFORMS.length - 1}
                >
                  + Add Social Handle
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Revenue Split</Label>
              <div className="flex flex-col gap-2">
                {formData.revenueSplits && formData.revenueSplits.length > 0 && formData.revenueSplits.map((split, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-24"
                      value={split.amount || ""}
                      min={0}
                      onChange={e => {
                        const updated = [...formData.revenueSplits!];
                        const value = e.target.value === "" ? undefined : Number(e.target.value);
                        updated[idx] = { ...updated[idx], amount: value };
                        handleInputChange("revenueSplits", updated);
                      }}
                      placeholder="Amount"
                    />
                    <Select
                      value={split.type}
                      onValueChange={type => {
                        const updated = [...formData.revenueSplits!];
                        updated[idx] = { ...updated[idx], type: type as '%' | '$' };
                        handleInputChange("revenueSplits", updated);
                      }}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="$">$</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      className="w-48"
                      value={split.with}
                      onChange={e => {
                        const updated = [...formData.revenueSplits!];
                        updated[idx] = { ...updated[idx], with: e.target.value };
                        handleInputChange("revenueSplits", updated);
                      }}
                      placeholder="Split with (e.g. Manager, Agency)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const updated = formData.revenueSplits!.filter((_, i) => i !== idx);
                        handleInputChange("revenueSplits", updated);
                      }}
                      aria-label="Remove split"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    handleInputChange("revenueSplits", [
                      ...formData.revenueSplits!,
                      { amount: undefined, type: "%", with: "" }
                    ]);
                  }}
                >
                  + Add Revenue Split
                </Button>
              </div>
            </div>
            
            {/* Revenue Calculation Display */}
            {(formData.calculatedGrossRevenue !== undefined || formData.calculatedNetRevenue !== undefined) && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-900">Revenue Calculation</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Gross Revenue</p>
                    <p className="font-semibold text-green-600">
                      ${formData.calculatedGrossRevenue?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Revenue Splits</p>
                    <p className="font-semibold text-red-600">
                      -${formData.calculatedSplitAmount?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Net Revenue</p>
                    <p className="font-semibold text-blue-600">
                      ${formData.calculatedNetRevenue?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                {formData.lastCalculatedAt && (
                  <p className="text-xs text-gray-500 text-center">
                    Last calculated: {new Date(formData.lastCalculatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientBudget">Client Budget</Label>
                <Input
                  id="clientBudget"
                  type="number"
                  value={formData.clientBudget || ""}
                  onChange={(e) => handleInputChange("clientBudget", parseFloat(e.target.value))}
                  placeholder="Enter budget amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow Up Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.followUpDate ? format(formData.followUpDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" avoidCollisions={true} side="bottom" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.followUpDate}
                      onSelect={(date) => handleDateSelect("followUpDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </>
        );

      case "coach":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName || ""}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  className={errors.clientName ? "border-red-500" : ""}
                />
                {errors.clientName && <p className="text-sm text-red-500">{errors.clientName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="programName">Program Name</Label>
                <Input
                  id="programName"
                  value={formData.programName || ""}
                  onChange={(e) => handleInputChange("programName", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packageType">Package Type</Label>
                <Select value={formData.packageType} onValueChange={(value) => handleInputChange("packageType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposedValue">Deal Value</Label>
                <Input
                  id="proposedValue"
                  type="number"
                  value={formData.proposedValue || ""}
                  onChange={(e) => handleInputChange("proposedValue", parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Revenue Split</Label>
              <div className="flex flex-col gap-2">
                {formData.revenueSplits && formData.revenueSplits.length > 0 && formData.revenueSplits.map((split, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-24"
                      value={split.amount || ""}
                      min={0}
                      onChange={e => {
                        const updated = [...formData.revenueSplits!];
                        const value = e.target.value === "" ? undefined : Number(e.target.value);
                        updated[idx] = { ...updated[idx], amount: value };
                        handleInputChange("revenueSplits", updated);
                      }}
                      placeholder="Amount"
                    />
                    <Select
                      value={split.type}
                      onValueChange={type => {
                        const updated = [...formData.revenueSplits!];
                        updated[idx] = { ...updated[idx], type: type as '%' | '$' };
                        handleInputChange("revenueSplits", updated);
                      }}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="$">$</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      className="w-48"
                      value={split.with}
                      onChange={e => {
                        const updated = [...formData.revenueSplits!];
                        updated[idx] = { ...updated[idx], with: e.target.value };
                        handleInputChange("revenueSplits", updated);
                      }}
                      placeholder="Split with (e.g. Manager, Agency)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const updated = formData.revenueSplits!.filter((_, i) => i !== idx);
                        handleInputChange("revenueSplits", updated);
                      }}
                      aria-label="Remove split"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    handleInputChange("revenueSplits", [
                      ...formData.revenueSplits!,
                      { amount: undefined, type: "%", with: "" }
                    ]);
                  }}
                >
                  + Add Revenue Split
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientBudget">Client Budget</Label>
                <Input
                  id="clientBudget"
                  type="number"
                  value={formData.clientBudget || ""}
                  onChange={(e) => handleInputChange("clientBudget", parseFloat(e.target.value))}
                  placeholder="Enter budget amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discoveryCallDate">Discovery Call Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.discoveryCallDate ? format(formData.discoveryCallDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" avoidCollisions={true} side="bottom" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.discoveryCallDate}
                      onSelect={(date) => handleDateSelect("discoveryCallDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {formData.packageType === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customPackageType">Custom Package Type</Label>
                <Input
                  id="customPackageType"
                  value={formData.customPackageType || ""}
                  onChange={(e) => handleInputChange("customPackageType", e.target.value)}
                  placeholder="Enter custom package type..."
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionCount">Session Count</Label>
                <Input
                  id="sessionCount"
                  type="number"
                  value={formData.sessionCount || ""}
                  onChange={(e) => handleInputChange("sessionCount", parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4-weeks">4 weeks</SelectItem>
                    <SelectItem value="8-weeks">8 weeks</SelectItem>
                    <SelectItem value="12-weeks">12 weeks</SelectItem>
                    <SelectItem value="6-months">6 months</SelectItem>
                    <SelectItem value="1-year">1 year</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="focusArea">Focus Area</Label>
                <Input
                  id="focusArea"
                  value={formData.focusArea || ""}
                  onChange={(e) => handleInputChange("focusArea", e.target.value)}
                  placeholder="e.g., Business, Health, Life..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="programHostingPlatform">Program Hosting Platform</Label>
                <Select value={formData.programHostingPlatform} onValueChange={(value) => handleInputChange("programHostingPlatform", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kajabi">Kajabi</SelectItem>
                    <SelectItem value="thinkific">Thinkific</SelectItem>
                    <SelectItem value="teachable">Teachable</SelectItem>
                    <SelectItem value="podia">Podia</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="mighty-networks">Mighty Networks</SelectItem>
                    <SelectItem value="coach-accountable">CoachAccountable</SelectItem>
                    <SelectItem value="kartra">Kartra</SelectItem>
                    <SelectItem value="systeme-io">Systeme.io</SelectItem>
                    <SelectItem value="clickfunnels">ClickFunnels</SelectItem>
                    <SelectItem value="notion">Notion (for DIY or mini-courses)</SelectItem>
                    <SelectItem value="google-drive-dropbox">Google Drive / Dropbox</SelectItem>
                    <SelectItem value="custom-website">Custom Website</SelectItem>
                    <SelectItem value="other">Other (manual entry field)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.duration === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customDuration">Custom Duration</Label>
                <Input
                  id="customDuration"
                  value={formData.customDuration || ""}
                  onChange={(e) => handleInputChange("customDuration", e.target.value)}
                  placeholder="Enter custom duration..."
                />
              </div>
            )}

            {formData.programHostingPlatform === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customPlatform">Custom Platform</Label>
                <Input
                  id="customPlatform"
                  value={formData.customPlatform || ""}
                  onChange={(e) => handleInputChange("customPlatform", e.target.value)}
                  placeholder="Enter custom platform name..."
                />
              </div>
            )}
          </>
        );

      case "podcaster":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestOrSponsorName">Guest/Sponsor Name *</Label>
                <Input
                  id="guestOrSponsorName"
                  value={formData.guestOrSponsorName || ""}
                  onChange={(e) => handleInputChange("guestOrSponsorName", e.target.value)}
                  className={errors.guestOrSponsorName ? "border-red-500" : ""}
                />
                {errors.guestOrSponsorName && <p className="text-sm text-red-500">{errors.guestOrSponsorName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">Guest</SelectItem>
                    <SelectItem value="sponsorship">Sponsorship</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
              </div>
            </div>
            {formData.type === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customType">Custom Type</Label>
                <Input
                  id="customType"
                  value={formData.customType || ""}
                  onChange={(e) => handleInputChange("customType", e.target.value)}
                  placeholder="Enter custom type..."
                />
              </div>
            )}

            {formData.type === "sponsorship" && (
              <div className="space-y-2">
                <Label htmlFor="sponsorshipCampaign">Sponsorship Campaign</Label>
                <Input
                  id="sponsorshipCampaign"
                  value={formData.sponsorshipCampaign || ""}
                  onChange={(e) => handleInputChange("sponsorshipCampaign", e.target.value)}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <Label>Scheduled Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledDate ? format(formData.scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" avoidCollisions={true} side="bottom" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledDate}
                      onSelect={(date) => handleDateSelect("scheduledDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {formData.type === "sponsorship" && (
                <div className="space-y-2">
                  <Label htmlFor="sponsorshipValue">Sponsorship Value</Label>
                  <Input
                    id="sponsorshipValue"
                    type="number"
                    value={formData.sponsorshipValue || ""}
                    onChange={(e) => handleInputChange("sponsorshipValue", parseFloat(e.target.value))}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientBudget">Client Budget</Label>
                <Input
                  id="clientBudget"
                  type="number"
                  value={formData.clientBudget || ""}
                  onChange={(e) => handleInputChange("clientBudget", parseFloat(e.target.value))}
                  placeholder="Enter budget amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dealValue">Deal Value</Label>
                <Input
                  id="dealValue"
                  type="number"
                  value={formData.dealValue || ""}
                  onChange={(e) => handleInputChange("dealValue", parseFloat(e.target.value))}
                  placeholder="Enter deal value"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Revenue Split</Label>
              <div className="flex flex-col gap-2">
                {formData.revenueSplits && formData.revenueSplits.length > 0 && formData.revenueSplits.map((split, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-24"
                      value={split.amount || ""}
                      min={0}
                      onChange={e => {
                        const updated = [...formData.revenueSplits!];
                        const value = e.target.value === "" ? undefined : Number(e.target.value);
                        updated[idx] = { ...updated[idx], amount: value };
                        handleInputChange("revenueSplits", updated);
                      }}
                      placeholder="Amount"
                    />
                    <Select
                      value={split.type}
                      onValueChange={type => {
                        const updated = [...formData.revenueSplits!];
                        updated[idx] = { ...updated[idx], type: type as '%' | '$' };
                        handleInputChange("revenueSplits", updated);
                      }}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="$">$</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      className="w-48"
                      value={split.with}
                      onChange={e => {
                        const updated = [...formData.revenueSplits!];
                        updated[idx] = { ...updated[idx], with: e.target.value };
                        handleInputChange("revenueSplits", updated);
                      }}
                      placeholder="Split with (e.g. Manager, Agency)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const updated = formData.revenueSplits!.filter((_, i) => i !== idx);
                        handleInputChange("revenueSplits", updated);
                      }}
                      aria-label="Remove split"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    handleInputChange("revenueSplits", [
                      ...formData.revenueSplits!,
                      { amount: undefined, type: "%", with: "" }
                    ]);
                  }}
                >
                  + Add Revenue Split
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="episodeTitle">Episode Title</Label>
              <Input
                id="episodeTitle"
                value={formData.episodeTitle || ""}
                onChange={(e) => handleInputChange("episodeTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
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
            {formData.duration === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customDuration">Custom Duration</Label>
                <Input
                  id="customDuration"
                  value={formData.customDuration || ""}
                  onChange={(e) => handleInputChange("customDuration", e.target.value)}
                  placeholder="e.g. 2 hours 30 minutes"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="topics">Topics</Label>
              <Textarea
                id="topics"
                value={formData.topics || ""}
                onChange={(e) => handleInputChange("topics", e.target.value)}
                placeholder="Enter episode topics, discussion points, or key themes..."
                rows={3}
              />
            </div>
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirmed"
                  checked={formData.confirmed || false}
                  onCheckedChange={(checked) => handleInputChange("confirmed", checked)}
                />
                <Label htmlFor="confirmed">Confirmed</Label>
              </div>
              {formData.type === "sponsorship" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="paid"
                    checked={formData.paid || false}
                    onCheckedChange={(checked) => handleInputChange("paid", checked)}
                  />
                  <Label htmlFor="paid">Paid</Label>
                </div>
              )}
            </div>
          </>
        );

      case "freelancer":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName || ""}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                className={errors.companyName ? "border-red-500" : ""}
              />
              {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectTitle">Project Title *</Label>
              <Input
                id="projectTitle"
                value={formData.projectTitle || ""}
                onChange={(e) => handleInputChange("projectTitle", e.target.value)}
                className={errors.projectTitle ? "border-red-500" : ""}
              />
              {errors.projectTitle && <p className="text-sm text-red-500">{errors.projectTitle}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectValue">Project Value</Label>
                <Input
                  id="projectValue"
                  type="number"
                  value={formData.projectValue || ""}
                  onChange={(e) => handleInputChange("projectValue", parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientBudget">Client Budget</Label>
                <Input
                  id="clientBudget"
                  type="number"
                  value={formData.clientBudget || ""}
                  onChange={(e) => handleInputChange("clientBudget", parseFloat(e.target.value))}
                  placeholder="Enter budget amount"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Revenue Split</Label>
              <div className="flex flex-col gap-2">
                {formData.revenueSplits && formData.revenueSplits.length > 0 && formData.revenueSplits.map((split, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-24"
                      value={split.amount || ""}
                      min={0}
                      onChange={e => {
                        const updated = [...formData.revenueSplits!];
                        const value = e.target.value === "" ? undefined : Number(e.target.value);
                        updated[idx] = { ...updated[idx], amount: value };
                        handleInputChange("revenueSplits", updated);
                      }}
                      placeholder="Amount"
                    />
                    <Select
                      value={split.type}
                      onValueChange={type => {
                        const updated = [...formData.revenueSplits!];
                        updated[idx] = { ...updated[idx], type: type as '%' | '$' };
                        handleInputChange("revenueSplits", updated);
                      }}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="$">$</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      className="w-48"
                      value={split.with}
                      onChange={e => {
                        const updated = [...formData.revenueSplits!];
                        updated[idx] = { ...updated[idx], with: e.target.value };
                        handleInputChange("revenueSplits", updated);
                      }}
                      placeholder="Split with (e.g. Manager, Agency)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const updated = formData.revenueSplits!.filter((_, i) => i !== idx);
                        handleInputChange("revenueSplits", updated);
                      }}
                      aria-label="Remove split"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    handleInputChange("revenueSplits", [
                      ...formData.revenueSplits!,
                      { amount: undefined, type: "%", with: "" }
                    ]);
                  }}
                >
                  + Add Revenue Split
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" avoidCollisions={true} side="bottom" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => {
                        console.log('Calendar onSelect called with date:', date);
                        handleDateSelect("dueDate", date);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hasAttachments">Has Attachments</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAttachments"
                    checked={formData.hasAttachments || false}
                    onCheckedChange={(checked) => handleInputChange("hasAttachments", checked)}
                  />
                  <Label htmlFor="hasAttachments">Has attachments</Label>
                </div>
              </div>
            </div>

          </>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Opportunity Title</Label>
                <Input
                  id="title"
                  value={formData.clientName || ""}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.dealValue || ""}
                  onChange={(e) => handleInputChange("dealValue", parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {opportunity ? "Edit Opportunity" : "New Opportunity"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${userNiche === "creator" || userNiche === "podcaster" ? "grid-cols-3" : "grid-cols-2"}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            {(userNiche === "creator" || userNiche === "podcaster") && (
              <TabsTrigger value="script" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
                Script
            </TabsTrigger>
            )}
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Contact History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {userNiche === 'coach' ? (
                      <>
                        <SelectItem value="new-lead">New Lead</SelectItem>
                        <SelectItem value="discovery-scheduled">Discovery Call Scheduled</SelectItem>
                        <SelectItem value="discovery-completed">Discovery Call Completed</SelectItem>
                        <SelectItem value="proposal">Proposal Sent</SelectItem>
                        <SelectItem value="follow-up">Follow-Up</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="signed">Signed Client</SelectItem>
                        <SelectItem value="paid">Paid/Won</SelectItem>
                        <SelectItem value="archived">Closed/Lost</SelectItem>
                      </>
                    ) : userNiche === 'podcaster' ? (
                      <>
                        <SelectItem value="outreach">Guest Outreach</SelectItem>
                        <SelectItem value="awaiting">Awaiting Response</SelectItem>
                        <SelectItem value="conversation">In Conversation</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="agreement">Agreement in Place</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="recorded">Recorded/Won</SelectItem>
                        <SelectItem value="archived">Closed/Lost</SelectItem>
                      </>
                    ) : userNiche === 'freelancer' ? (
                      <>
                        <SelectItem value="new-inquiry">New Inquiry</SelectItem>
                        <SelectItem value="discovery">Discovery Call</SelectItem>
                        <SelectItem value="proposal">Proposal Sent</SelectItem>
                        <SelectItem value="follow-up">Follow-Up</SelectItem>
                        <SelectItem value="negotiation">In Negotiation</SelectItem>
                        <SelectItem value="contract">Contract Signed</SelectItem>
                        <SelectItem value="progress">Project In Progress</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="paid">Paid/Won</SelectItem>
                        <SelectItem value="archived">Closed/Lost</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="outreach">Outreach / Pitched</SelectItem>
                        <SelectItem value="awaiting">Awaiting Response</SelectItem>
                        <SelectItem value="conversation">In Conversation</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="contract">Contract Signed</SelectItem>
                        <SelectItem value="progress">Content in Progress</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="paid">Paid/Won</SelectItem>
                        <SelectItem value="archived">Closed/Lost</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger className={errors.priority ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-sm text-red-500">{errors.priority}</p>}
              </div>
            </div>

            {/* Outreach - Show for all niches */}
            <div className="space-y-2">
              <Label htmlFor="outreachTouchpoint">Outreach *</Label>
              <Select value={formData.outreachTouchpoint || ""} onValueChange={(value) => handleInputChange("outreachTouchpoint", value)}>
                <SelectTrigger className={errors.outreachTouchpoint ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select touchpoint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left-voicemail">Left Voicemail</SelectItem>
                  <SelectItem value="sent-email">Sent Email</SelectItem>
                  <SelectItem value="text-message-sent">Text Message Sent</SelectItem>
                  <SelectItem value="dm-sent">DM Sent</SelectItem>
                  <SelectItem value="brand-emailed">Brand Emailed</SelectItem>
                  <SelectItem value="spoke-with-rep">Spoke with Rep</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="no-response">No Response</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="not-interested">Not Interested</SelectItem>
                  <SelectItem value="do-not-contact">Do Not Contact</SelectItem>
                  <SelectItem value="bad-number-email">Bad Number/Email</SelectItem>
                </SelectContent>
              </Select>
              {errors.outreachTouchpoint && <p className="text-sm text-red-500">{errors.outreachTouchpoint}</p>}
            </div>

            {renderNicheSpecificFields()}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add any notes about this opportunity..."
              />
            </div>
          </TabsContent>

          {(userNiche === "creator" || userNiche === "podcaster") && (
            <TabsContent value="script" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="script">Script</Label>
                <Textarea
                  id="script"
                  rows={12}
                  value={formData.script || ""}
                  onChange={(e) => handleInputChange("script", e.target.value)}
                  placeholder="Paste or type your script here..."
                  className="font-mono text-sm"
                  onFocus={() => console.log('Script textarea focused, current value:', formData.script)}
                />
                </div>
          </TabsContent>
          )}

          <TabsContent value="activity" className="space-y-6">
            {opportunity?.id ? (
              <ContactHistoryTimeline opportunityId={opportunity.id} opportunity={opportunity} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Save the opportunity to view contact history</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>


        </Tabs>

        <Separator />

        {/* Form completion status */}
        <div className="p-3 border rounded-md">
          <p className="text-sm">
            Form completion: <span className={isFormComplete() ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
              {isFormComplete() ? "Complete ✓" : "Incomplete ✗"}
            </span>
          </p>
          {!isFormComplete() && (
            <p className="text-xs text-red-600 mt-1">
              Please complete all required fields marked with * before saving.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !isFormComplete()}
            className={!isFormComplete() ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isLoading ? "Saving..." : (opportunity ? "Update" : "Create") + " Opportunity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { OpportunityModal };
export default OpportunityModal;
