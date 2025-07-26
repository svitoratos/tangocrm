"use client";

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  Target, 
  User, 
  Edit, 
  Trash2,
  DollarSign
} from 'lucide-react';
import { deleteOpportunity } from '@/lib/opportunity-service';
import { useLastActivity } from '@/hooks/use-last-activity';
import { LastActivityDisplay } from '@/components/app/last-activity-display';

interface OpportunityStage {
  name: string;
  color: string;
  progress: number;
}

interface CoachOpportunity {
  id: string;
  clientName: string;
  programName: string;
  packageType: string;
  proposedValue: number;
  discoveryCallDate: string;
  notes: string;
  priority: 'low' | 'medium' | 'high';
  lastContact: string;
  sessionCount?: number;
  duration?: string;
  outreachTouchpoint?: string;
  revenueSplits?: Array<{ amount: number | undefined; type: '%' | '$'; with: string }>;
  calculatedGrossRevenue?: number;
  calculatedNetRevenue?: number;
  calculatedSplitAmount?: number;
}

interface CoachOpportunityCardProps {
  opportunity: CoachOpportunity;
  stage: OpportunityStage;
  onClick: (opportunity: CoachOpportunity) => void;
  onDelete?: (opportunity: CoachOpportunity) => void;
  className?: string;
  disableClick?: boolean;
  collapsed?: boolean;
  onExpandToggle?: () => void;
  onOpportunityDeleted?: (opportunityId: string) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-green-100 text-green-800';
  }
};

export const CoachOpportunityCard = ({ 
  opportunity, 
  stage, 
  onClick, 
  onDelete,
  className = "",
  disableClick = false,
  collapsed = false,
  onExpandToggle,
  onOpportunityDeleted
}: CoachOpportunityCardProps) => {
  const { lastActivity, loading: activityLoading } = useLastActivity(opportunity.id);
  
  const handleClick = () => {
    if (!disableClick) {
      onClick(opportunity);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      try {
        // Delete from database
        await deleteOpportunity(opportunity.id);
        
        // Call the callback to notify parent component
        onOpportunityDeleted?.(opportunity.id);
        
        // Also call the onDelete prop if provided (for backward compatibility)
        onDelete?.(opportunity);
        
        console.log('Opportunity deleted successfully');
      } catch (error) {
        console.error('Error deleting opportunity:', error);
        alert('Failed to delete opportunity. Please try again.');
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(opportunity);
  };

  const getStageColor = (stageName: string) => {
    const colorMap: { [key: string]: string } = {
      'New Lead': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Discovery Call Scheduled': 'bg-orange-100 text-orange-800 border-orange-200',
      'Discovery Call Completed': 'bg-blue-100 text-blue-800 border-blue-200',
      'Proposal Sent': 'bg-purple-100 text-purple-800 border-purple-200',
      'Follow-Up': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Negotiation': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Signed Client': 'bg-green-100 text-green-800 border-green-200',
      'Active Program': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Completed': 'bg-violet-100 text-violet-800 border-violet-200',
      'Archived / Lost': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[stageName] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getProgressBarColor = (stageName: string, progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-orange-500';
    return 'bg-gray-400';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    // Parse the date string to avoid timezone conversion issues
    // The date is stored as YYYY-MM-DDT00:00:00.000Z format
    // We want to display it as the local date without timezone conversion
    const date = new Date(dateString);
    
    // Extract the date components in UTC to avoid timezone shifts
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    
    // Create a new date object with the local date components
    const localDate = new Date(year, month, day);
    
    return localDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isUpcoming = (dateString: string) => {
    // Parse the date string to avoid timezone conversion issues
    const date = new Date(dateString);
    
    // Extract the date components in UTC to avoid timezone shifts
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    
    // Create a new date object with the local date components
    const callDate = new Date(year, month, day);
    
    // Get today's date at midnight for comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = callDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ 
        y: -4,
        scale: 1.01,
        boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -5px rgba(0, 0, 0, 0.1)"
      }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={className}
    >
      <Card 
        className={`relative overflow-hidden border-0 transition-all duration-200 bg-gradient-to-br from-white via-slate-50/50 to-white shadow-md hover:shadow-lg ${
          disableClick 
            ? 'cursor-default' 
            : 'cursor-pointer hover:shadow-xl'
        }`}
        onClick={handleClick}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-200" />
        
        {/* Modern border accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
        
        <CardHeader className="pb-3 pt-4 relative z-10">
          <div className="flex-1">
            {/* Header with compact layout */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-md">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg blur-sm opacity-20" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-gray-900 truncate mb-1">
                    {opportunity.clientName}
                  </h3>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="p-0.5 bg-blue-100 rounded">
                        <User className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {opportunity.programName}
                      </span>
                    </div>
                    {opportunity.priority && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium px-1.5 py-0.5 ${getPriorityColor(opportunity.priority)} border`}
                      >
                        {opportunity.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action buttons with compact styling */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Edit opportunity"
                    onClick={handleEdit}
                    className="group relative p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md shadow-sm hover:shadow-md transition-all duration-150 hover:scale-105"
                    tabIndex={0}
                  >
                    <Edit className="h-3 w-3 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-md blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-150" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete opportunity"
                    onClick={handleDelete}
                    className="group relative p-1.5 bg-gradient-to-br from-red-500 to-red-600 rounded-md shadow-sm hover:shadow-md transition-all duration-150 hover:scale-105"
                    tabIndex={0}
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-500 rounded-md blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-150" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Stage Badge with compact styling */}
            <div className="mb-3">
              <Badge 
                variant="outline" 
                className={`${getStageColor(stage.name)} text-xs font-medium px-2 py-1 border rounded-full`}
              >
                {stage.name}
              </Badge>
            </div>
            
            {/* Deal Value with compact styling */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-3 border border-emerald-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-emerald-100 rounded">
                    <DollarSign className="h-3 w-3 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Deal Value</span>
                </div>
                <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  {opportunity.proposedValue ? formatCurrency(opportunity.proposedValue) : 'Not set'}
                </span>
              </div>
            </div>

            {/* Revenue Calculation Display */}
            {(opportunity.calculatedGrossRevenue !== undefined || opportunity.calculatedNetRevenue !== undefined) && (
              <div className="mt-3 space-y-2">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100/50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Gross Revenue</span>
                      <span className="text-xs font-semibold text-blue-600">
                        ${opportunity.calculatedGrossRevenue?.toLocaleString() || '0'}
                      </span>
                    </div>
                    {opportunity.calculatedSplitAmount && opportunity.calculatedSplitAmount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">Revenue Split</span>
                        <span className="text-xs font-semibold text-orange-600">
                          -${opportunity.calculatedSplitAmount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-blue-100/50">
                      <span className="text-xs font-medium text-gray-700">Net Revenue</span>
                      <span className="text-xs font-semibold text-purple-600">
                        ${opportunity.calculatedNetRevenue?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Last Activity Display */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <LastActivityDisplay 
                lastActivity={lastActivity}
                loading={activityLoading}
                className="text-xs"
              />
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
};