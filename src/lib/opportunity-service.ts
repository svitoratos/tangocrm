export interface Opportunity {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  description?: string;
  value: number;
  status: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';
  type: 'brand_deal' | 'sponsorship' | 'consulting' | 'coaching' | 'content_creation' | 'other';
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    name: string;
    email?: string;
    company?: string;
  };
  niche: 'creator' | 'coach' | 'podcaster' | 'freelancer';
  customFields?: Record<string, any>;
}

import { DateUtils } from './date-utils';

export interface CreateOpportunityData {
  client_id?: string;
  title: string;
  description?: string;
  value: number;
  status?: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';
  type?: 'brand_deal' | 'sponsorship' | 'consulting' | 'coaching' | 'content_creation' | 'other';
  probability?: number;
  expected_close_date?: string;
  notes?: string;
  tags?: string[];
  niche?: 'creator' | 'coach' | 'podcaster' | 'freelancer';
}

export interface UpdateOpportunityData extends Partial<CreateOpportunityData> {
  actual_close_date?: string;
}

// Local storage key
const OPPORTUNITIES_KEY = 'tango-opportunities';

// Generate a simple ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Get all opportunities for the current user
export async function fetchOpportunities(niche?: string): Promise<Opportunity[]> {
  try {
    const stored = localStorage.getItem(OPPORTUNITIES_KEY);
    let opportunities: Opportunity[] = [];
    
    if (stored) {
      opportunities = JSON.parse(stored);
    }
    
    // No timezone conversion needed here - dates are stored as-is
    // The modal will handle timezone conversion when displaying
    
    // Filter by niche if provided
    const filtered = niche ? opportunities.filter(opp => opp.niche === niche) : opportunities;
    
    console.log(`Fetched ${filtered.length} opportunities for niche: ${niche || 'all'}`);
    console.log('All opportunities in storage:', opportunities.map(opp => ({ id: opp.id, title: opp.title, niche: opp.niche })));
    console.log('Filtered opportunities:', filtered.map(opp => ({ id: opp.id, title: opp.title, niche: opp.niche })));
    return filtered;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return [];
  }
}

// Create a new opportunity
export async function createOpportunity(opportunityData: CreateOpportunityData): Promise<Opportunity> {
  try {
    // Handle timezone conversion for expected_close_date
    let expectedCloseDate = opportunityData.expected_close_date;
    if (expectedCloseDate) {
      // The date is already in UTC format from the modal, so we store it as-is
      // When we retrieve it, we'll convert it to user timezone for display
      console.log('createOpportunity - Storing expected_close_date:', expectedCloseDate);
    }

    const newOpportunity: Opportunity = {
      id: generateId(),
      user_id: 'local-user',
      client_id: opportunityData.client_id || generateId(),
      title: opportunityData.title,
      description: opportunityData.description,
      value: opportunityData.value || 0,
      status: opportunityData.status || 'prospecting',
      type: opportunityData.type || 'other',
      probability: opportunityData.probability || 50,
      expected_close_date: expectedCloseDate,
      notes: opportunityData.notes,
      tags: opportunityData.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      niche: opportunityData.niche || 'creator' // Use the niche from opportunityData
    };
    
    // Get existing opportunities
    const existing = await fetchOpportunities();
    existing.push(newOpportunity);
    
    // Save to local storage
    localStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(existing));
    
    console.log('Created new opportunity:', newOpportunity);
    console.log('Total opportunities in storage:', existing.length);
    console.log('Opportunities by niche:', existing.reduce((acc, opp) => {
      acc[opp.niche] = (acc[opp.niche] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    return newOpportunity;
  } catch (error) {
    console.error('Error creating opportunity:', error);
    throw error;
  }
}

// Update an existing opportunity
export async function updateOpportunity(id: string, opportunityData: UpdateOpportunityData): Promise<Opportunity> {
  try {
    console.log('updateOpportunity - Starting update for ID:', id);
    console.log('updateOpportunity - Data being sent:', opportunityData);
    
    const opportunities = await fetchOpportunities();
    const index = opportunities.findIndex(opp => opp.id === id);
    
    if (index === -1) {
      throw new Error('Opportunity not found');
    }
    
    // Handle timezone conversion for expected_close_date
    let expectedCloseDate = opportunityData.expected_close_date;
    if (expectedCloseDate) {
      // The date is already in UTC format from the modal, so we store it as-is
      console.log('updateOpportunity - Storing expected_close_date:', expectedCloseDate);
    }
    
    // Update the opportunity
    opportunities[index] = {
      ...opportunities[index],
      ...opportunityData,
      expected_close_date: expectedCloseDate,
      updated_at: new Date().toISOString()
    };
    
    // Save back to local storage
    localStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(opportunities));
    
    console.log('Updated opportunity:', opportunities[index]);
    return opportunities[index];
  } catch (error) {
    console.error('updateOpportunity - Error:', error);
    throw error;
  }
}

// Delete an opportunity
export async function deleteOpportunity(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/opportunities?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete opportunity');
    }

    console.log('Opportunity deleted successfully from database');
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    throw error;
  }
}

// Get a specific opportunity
export async function fetchOpportunity(id: string): Promise<Opportunity> {
  try {
    const opportunities = await fetchOpportunities();
    const opportunity = opportunities.find(opp => opp.id === id);
    
    if (!opportunity) {
      throw new Error('Opportunity not found');
    }
    
    return opportunity;
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    throw error;
  }
}

// Helper function to map form data to opportunity data
export function mapFormDataToOpportunity(formData: any, userNiche: string): CreateOpportunityData {
  // Get the value based on niche
  let value = 0;
  if (userNiche === 'creator') {
    value = formData.dealValue || 0;
  } else if (userNiche === 'coach') {
    value = formData.proposedValue || 0;
  } else if (userNiche === 'podcaster') {
    value = formData.sponsorshipValue || 0;
  } else if (userNiche === 'freelancer') {
    value = formData.projectValue || 0;
  } else {
    value = formData.dealValue || formData.proposedValue || formData.sponsorshipValue || formData.projectValue || 0;
  }

  const opportunityData: CreateOpportunityData = {
    title: formData.clientName || formData.campaignName || formData.guestOrSponsorName || 'New Opportunity',
    value: value,
    status: mapStatusToDatabase(formData.status, userNiche),
    type: mapTypeToDatabase(userNiche),
    probability: formData.probability || 50,
    notes: formData.notes,
    tags: formData.tags || [],
    niche: userNiche as 'creator' | 'coach' | 'podcaster' | 'freelancer'
  };

  // Add niche-specific fields
  if (formData.expected_close_date) {
    opportunityData.expected_close_date = formData.expected_close_date;
  }

  if (formData.description) {
    opportunityData.description = formData.description;
  }

  return opportunityData;
}

// Helper function to map status from form to database
export function mapStatusToDatabase(status: string, niche?: string): 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost' {
  // First, handle direct database status mappings
  const directStatusMap: Record<string, 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost'> = {
    'new': 'prospecting',
    'prospecting': 'prospecting',
    'qualification': 'qualification',
    'proposal': 'proposal',
    'negotiation': 'negotiation',
    'won': 'won',
    'lost': 'lost',
    'inquiry': 'prospecting',
    'qualified': 'qualification',
    'proposal_sent': 'proposal',
    'negotiating': 'negotiation',
    'published': 'won',
    'paid': 'won',
    'completed': 'won',
    'active': 'won',
    'declined': 'lost',
    'expired': 'lost'
  };

  // If it's a direct database status, return it
  if (directStatusMap[status]) {
    return directStatusMap[status];
  }

  // If it's a stage ID, map it based on niche (for backward compatibility)
  const stageToStatusMap: Record<string, Record<string, 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost'>> = {
    creator: {
      'outreach': 'prospecting',
      'awaiting': 'qualification',
      'conversation': 'qualification',
      'negotiation': 'negotiation',
      'contract': 'proposal',
      'progress': 'proposal',
      'delivered': 'won',
      'paid': 'won',
      'archived': 'lost'
    },
    coach: {
      'new-lead': 'prospecting',
      'discovery-scheduled': 'prospecting',
      'discovery-completed': 'qualification',
      'proposal': 'proposal',
      'follow-up': 'proposal',
      'negotiation': 'negotiation',
      'signed': 'negotiation',
      'paid': 'won',
      'active': 'won',
      'completed': 'won',
      'archived': 'lost'
    },
    podcaster: {
      'outreach': 'prospecting',
      'awaiting': 'prospecting',
      'conversation': 'qualification',
      'negotiation': 'negotiation',
      'agreement': 'proposal',
      'scheduled': 'proposal',
      'recorded': 'won',
      'published': 'won',
      'paid': 'won',
      'archived': 'lost'
    },
    freelancer: {
      'new-inquiry': 'prospecting',
      'discovery': 'qualification',
      'proposal': 'proposal',
      'follow-up': 'proposal',
      'negotiation': 'negotiation',
      'contract': 'negotiation',
      'progress': 'won',
      'delivered': 'won',
      'paid': 'won',
      'archived': 'lost'
    }
  };

  // Map stage ID to database status based on niche
  if (niche && stageToStatusMap[niche] && stageToStatusMap[niche][status]) {
    return stageToStatusMap[niche][status];
  }

  // Default fallback
  return 'prospecting';
}

// Helper function to map type based on niche
export function mapTypeToDatabase(niche: string): 'brand_deal' | 'sponsorship' | 'consulting' | 'coaching' | 'content_creation' | 'other' {
  const typeMap: Record<string, 'brand_deal' | 'sponsorship' | 'consulting' | 'coaching' | 'content_creation' | 'other'> = {
    'creator': 'brand_deal',
    'coach': 'coaching',
    'podcaster': 'sponsorship',
    'freelancer': 'consulting'
  };
  
  return typeMap[niche] || 'other';
}

// Clear all data (for testing)
export function clearAllOpportunities() {
  localStorage.removeItem(OPPORTUNITIES_KEY);
}
