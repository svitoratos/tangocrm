'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '@/hooks/use-analytics';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target,
  Calendar,
  Clock,
  Activity,
  ArrowUpRight,
  Radio,
  UserCheck,
  UserX,
  UserPlus,
  GraduationCap,
  BookOpen,
  BarChart3,
  PieChart,
  Target as TargetIcon,
  Zap,
  Award,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  Filter,
  Search,
  Download,
  Share2,
  Settings,
  Eye,
  EyeOff,
  Rocket,
  Crown,
  Trophy,
  Sparkles,
  Flame,
  Gem,
  Diamond,
  Crown as CrownIcon,
  Zap as ZapIcon,
  Target as TargetIcon2,
  TrendingUp as TrendingUpIcon,
  DollarSign as DollarSignIcon,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Activity as ActivityIcon,
  ArrowUpRight as ArrowUpRightIcon,
  Radio as RadioIcon,
  UserCheck as UserCheckIcon,
  UserX as UserXIcon,
  UserPlus as UserPlusIcon,
  GraduationCap as GraduationCapIcon,
  BookOpen as BookOpenIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  Zap as ZapIcon2,
  Award as AwardIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  XCircle as XCircleIcon,
  ChevronRight as ChevronRightIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Share2 as Share2Icon,
  Settings as SettingsIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Mail,
  FileText,
  Heart,
  Plus,
  Edit,
  Trash2,
  Archive,
  Building,
  Phone,
  Grid3X3,
  List,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNiche } from '@/contexts/NicheContext';
import { createClient, updateClient, deleteClient, Client } from '@/lib/client-service';

// Enhanced Metric Card with Glassmorphism
const MetricCard: React.FC<{
  title: string;
  value: string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down';
  color: 'emerald' | 'orange' | 'blue' | 'purple' | 'red' | 'yellow' | 'pink' | 'indigo' | 'cyan';
  subtitle?: string;
  onClick?: () => void;
  gradient?: string;
}> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend, 
  color,
  subtitle,
  onClick,
  gradient
}) => {
  const colorClasses = {
    emerald: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    pink: 'from-pink-500 to-pink-600',
    indigo: 'from-indigo-500 to-indigo-600',
    cyan: 'from-cyan-500 to-cyan-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative h-48 ${
        gradient || 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
      }`}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <motion.div 
              className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
            <Icon className="w-6 h-6" />
            </motion.div>
            {change !== undefined && (
              <motion.div 
                className="flex items-center space-x-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
                <span className={`text-sm font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {change}%
              </span>
              </motion.div>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
          <motion.p 
            className="text-2xl font-bold text-gray-900 mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};



// Revenue Growth Chart
const RevenueChart: React.FC<{ data: any[] }> = ({ data }) => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly'>('monthly');
  
  // Create complete year data with all months
  const allMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // Create complete dataset with all months, filling missing months with 0
  const completeData = allMonths.map(month => {
    const existingData = data.find(d => d.month === month);
    return existingData || { month, value: 0 };
  });
  
  // Filter data based on timeframe
  const filteredData = timeframe === 'monthly' ? completeData : completeData.filter((_, index) => index % 3 === 0);
  
  const maxValue = Math.max(...filteredData.map(d => d.value), 1); // Ensure maxValue is at least 1
  const minValue = 0; // Always start from 0 for bar charts
  const range = maxValue - minValue;
  
  // Calculate bar width and spacing
  const barWidth = 18;
  const barSpacing = 6;
  const totalBarWidth = barWidth + barSpacing;
  const chartWidth = 350;
  const startX = 50;
  
  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Revenue Growth
        </h3>
        <div className="flex gap-2">
          <Button
            variant={timeframe === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('monthly')}
            className={timeframe === 'monthly' ? 'bg-emerald-600 text-white' : ''}
          >
            Monthly
          </Button>
          <Button
            variant={timeframe === 'quarterly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('quarterly')}
            className={timeframe === 'quarterly' ? 'bg-emerald-600 text-white' : ''}
          >
            Quarterly
          </Button>
        </div>
      </div>
      
      <div className="h-72 relative">
        <svg className="w-full h-full" viewBox="0 0 450 240" preserveAspectRatio="xMidYMid meet">
          {/* Gradient definition */}
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.6"/>
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={`grid-${i}`}
              x1="50"
              y1={40 + i * 40}
              x2="450"
              y2={40 + i * 40}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          

          
          {/* Bars */}
          {filteredData.map((point, index) => {
            const barHeight = ((point.value - minValue) / range) * 160;
            const x = startX + (index * totalBarWidth);
            const y = 220 - barHeight;
            
            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={point.value > 0 ? "url(#barGradient)" : "#f3f4f6"}
                  stroke={point.value > 0 ? "#10b981" : "#d1d5db"}
                  strokeWidth="1"
                  rx="4"
                  className="hover:opacity-80 transition-opacity duration-200"
                />
                
                {/* Value label on top of bar */}
                {point.value > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    className="text-xs fill-gray-700 font-medium"
                    textAnchor="middle"
                  >
                    ${point.value.toLocaleString()}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {filteredData.map((point, index) => (
            <text
              key={`x-label-${index}`}
              x={startX + (index * totalBarWidth) + barWidth / 2}
              y="235"
              className="text-xs fill-gray-500"
              textAnchor="middle"
            >
              {point.month}
            </text>
          ))}
      </svg>
        
        {/* Revenue labels */}
        <div className="absolute top-2 right-2 text-right bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-emerald-600">
            ${(() => {
              const currentDate = new Date();
              const currentMonth = currentDate.getMonth();
              const currentQuarter = Math.floor(currentMonth / 3);
              
              if (timeframe === 'monthly') {
                // Find current month's data
                const currentMonthData = data.find(d => {
                  const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(d.month);
                  return monthIndex === currentMonth;
                });
                return (currentMonthData?.value || 0).toLocaleString();
              } else {
                // Calculate current quarter's total
                const quarterMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(currentQuarter * 3, (currentQuarter + 1) * 3);
                const quarterTotal = data
                  .filter(d => quarterMonths.includes(d.month))
                  .reduce((sum, d) => sum + (d.value || 0), 0);
                return quarterTotal.toLocaleString();
              }
            })()}
          </div>
          <div className="text-sm text-emerald-500">
            This {timeframe === 'monthly' ? 'month' : 'quarter'}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Brand Portfolio Grid
const BrandPortfolio: React.FC<{ brands: any[] }> = ({ brands }) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-600" />
          Brands/Clients Portfolio
        </h3>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          {brands.length} Partners
        </Badge>
    </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {brands.map((brand, index) => (
      <motion.div
            key={brand.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative group"
          >
            <Card className="p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {brand.name.charAt(0)}
    </div>
                <h4 className="font-semibold text-gray-900 text-sm">{brand.name}</h4>
                <div className="text-xs text-gray-500 mt-1">{brand.industry}</div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < brand.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
    </div>
                  <div className="text-xs text-gray-500 mt-1">${brand.totalRevenue.toLocaleString()}</div>
  </div>
                
                <Badge 
                  variant="secondary" 
                  className={`mt-2 text-xs ${
                    brand.status === 'Active' ? 'bg-green-100 text-green-800' :
                    brand.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {brand.status}
                </Badge>
            </div>
            </Card>
          </motion.div>
          ))}
      </div>
    </Card>
  );
};

// Opportunities by Stage Chart - Matches CRM Pipeline Stages
const GrowthRateChart: React.FC<{ data: any; activeNiche?: string }> = ({ data, activeNiche = 'creator' }) => {
  // Get the correct stage names based on niche (matching CRM pipeline)
  const getNicheStages = (niche: string) => {
    switch (niche) {
      case 'creator':
        return [
          { id: 'outreach', name: 'Outreach / Pitched', color: '#10b981' },
          { id: 'awaiting', name: 'Awaiting Response', color: '#f97316' },
          { id: 'conversation', name: 'In Conversation', color: '#3b82f6' },
          { id: 'negotiation', name: 'Negotiation', color: '#8b5cf6' },
          { id: 'contract', name: 'Contract Signed', color: '#ef4444' },
          { id: 'progress', name: 'Content in Progress', color: '#06b6d4' },
          { id: 'delivered', name: 'Delivered', color: '#10b981' },
          { id: 'paid', name: 'Paid', color: '#059669' },
          { id: 'archived', name: 'Archived / Lost', color: '#6b7280' }
        ];
      case 'coach':
        return [
          { id: 'new-lead', name: 'New Lead', color: '#10b981' },
          { id: 'discovery-scheduled', name: 'Discovery Call Scheduled', color: '#f97316' },
          { id: 'discovery-completed', name: 'Discovery Call Completed', color: '#3b82f6' },
          { id: 'proposal', name: 'Proposal Sent', color: '#8b5cf6' },
          { id: 'follow-up', name: 'Follow-Up', color: '#ef4444' },
          { id: 'negotiation', name: 'Negotiation', color: '#06b6d4' },
          { id: 'signed', name: 'Signed Client', color: '#10b981' },
          { id: 'paid', name: 'Paid', color: '#059669' },
          { id: 'active', name: 'Active Program', color: '#06b6d4' },
          { id: 'completed', name: 'Completed', color: '#7c3aed' },
          { id: 'archived', name: 'Archived / Lost', color: '#6b7280' }
        ];
      case 'podcaster':
        return [
          { id: 'outreach', name: 'Guest/Sponsor Outreach', color: '#10b981' },
          { id: 'awaiting', name: 'Awaiting Response', color: '#f97316' },
          { id: 'conversation', name: 'In Conversation', color: '#3b82f6' },
          { id: 'negotiation', name: 'Negotiation', color: '#8b5cf6' },
          { id: 'agreement', name: 'Agreement in Place', color: '#ef4444' },
          { id: 'scheduled', name: 'Scheduled', color: '#06b6d4' },
          { id: 'recorded', name: 'Recorded', color: '#10b981' },
          { id: 'published', name: 'Published', color: '#059669' },
          { id: 'paid', name: 'Paid', color: '#7c3aed' },
          { id: 'archived', name: 'Archived / Lost', color: '#6b7280' }
        ];
      case 'freelancer':
        return [
          { id: 'new-inquiry', name: 'New Inquiry', color: '#10b981' },
          { id: 'discovery', name: 'Discovery Call', color: '#f97316' },
          { id: 'proposal', name: 'Proposal Sent', color: '#3b82f6' },
          { id: 'follow-up', name: 'Follow-Up', color: '#8b5cf6' },
          { id: 'negotiation', name: 'In Negotiation', color: '#ef4444' },
          { id: 'contract', name: 'Contract Signed', color: '#06b6d4' },
          { id: 'progress', name: 'Project In Progress', color: '#10b981' },
          { id: 'delivered', name: 'Delivered', color: '#059669' },
          { id: 'paid', name: 'Paid', color: '#7c3aed' },
          { id: 'archived', name: 'Archived / Lost', color: '#6b7280' }
        ];
      default:
        return [
          { id: 'outreach', name: 'Outreach / Pitched', color: '#10b981' },
          { id: 'awaiting', name: 'Awaiting Response', color: '#f97316' },
          { id: 'conversation', name: 'In Conversation', color: '#3b82f6' },
          { id: 'negotiation', name: 'Negotiation', color: '#8b5cf6' },
          { id: 'contract', name: 'Contract Signed', color: '#ef4444' },
          { id: 'progress', name: 'Content in Progress', color: '#06b6d4' },
          { id: 'delivered', name: 'Delivered', color: '#10b981' },
          { id: 'paid', name: 'Paid', color: '#059669' },
          { id: 'archived', name: 'Archived / Lost', color: '#6b7280' }
        ];
    }
  };

  const stages = getNicheStages(activeNiche);
  
  // Map database status to stage ID (same logic as CRM pipeline)
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
  };

  // Map stage IDs to stage names
  const mapStageIdToStageName = (stageId: string, niche: string) => {
    const stages = getNicheStages(niche);
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.name : 'Outreach / Pitched';
  };

  // Group opportunities by stage (using same logic as CRM pipeline)
  const stageData = (Array.isArray(data) ? data : []).reduce((acc: any, opportunity: any) => {
    // Use database status to map to stage ID (same as CRM pipeline)
    const stageId = mapDatabaseStatusToStageId(opportunity.status, activeNiche);
    const stageName = mapStageIdToStageName(stageId, activeNiche);
    
    if (!acc[stageName]) {
      acc[stageName] = { count: 0, totalValue: 0, opportunities: [] };
    }
    acc[stageName].count += 1;
    acc[stageName].totalValue += opportunity.value;
    acc[stageName].opportunities.push(opportunity);
    return acc;
  }, {});

  // Create complete stage data with all stages (including empty ones)
  const completeStageData = stages.reduce((acc: any, stage) => {
    const existingData = stageData[stage.name];
    acc[stage.name] = existingData || { count: 0, totalValue: 0, opportunities: [] };
    return acc;
  }, {});

  // Get stage info for colors and icons
  const getStageInfo = (stageName: string) => {
    const stage = stages.find(s => s.name === stageName);
    if (!stage) return { color: '#6b7280', icon: Target };
    
    const iconMap: Record<string, any> = {
      'Outreach / Pitched': Target,
      'Awaiting Response': Clock,
      'In Conversation': Activity,
      'Negotiation': Activity,
      'Contract Signed': FileText,
      'Content in Progress': Activity,
      'Delivered': CheckCircle,
      'Paid': CheckCircle,
      'Archived / Lost': XCircle,
      'New Lead': UserPlus,
      'Discovery Call Scheduled': Calendar,
      'Discovery Call Completed': UserCheck,
      'Proposal Sent': FileText,
      'Follow-Up': Activity,
      'Signed Client': CheckCircle,
      'Active Program': Activity,
      'Completed': CheckCircle,
      'Guest/Sponsor Outreach': Target,
      'Agreement in Place': FileText,
      'Scheduled': Calendar,
      'Recorded': Activity,
      'Published': CheckCircle,
      'New Inquiry': UserPlus,
      'Discovery Call': UserCheck,
      'In Negotiation': Activity,
      'Project In Progress': Activity
    };

    return {
      color: stage.color,
      icon: iconMap[stageName] || Target
    };
  };
  
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Opportunities in Each Stage
          </h3>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {(Array.isArray(data) ? data : []).length} Total
          </Badge>
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.entries(completeStageData).map(([stageName, stageInfo]: [string, any], index) => {
          const stageInfoData = getStageInfo(stageName);
          const IconComponent = stageInfoData.icon;
          const isEmpty = stageInfo.count === 0;
          
              return (
            <motion.div
              key={stageName}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                isEmpty ? 'bg-gray-50 opacity-75' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`p-2 rounded-lg text-white ${
                    isEmpty ? 'opacity-60' : ''
                  }`}
                  style={{ backgroundColor: stageInfoData.color }}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <span className={`font-medium ${isEmpty ? 'text-gray-500' : 'text-gray-700'}`}>
                    {stageName}
                  </span>
                  <div className="text-xs text-gray-500">
                    {isEmpty ? 'No opportunities' : stageInfo.opportunities.map((opp: any) => opp.brand).join(', ')}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${isEmpty ? 'text-gray-400' : 'text-gray-900'}`}>
                  {stageInfo.count}
                </div>
                <div className={`text-sm ${isEmpty ? 'text-gray-400' : 'text-gray-600'}`}>
                  ${stageInfo.totalValue.toLocaleString()}
                </div>
              </div>
            </motion.div>
              );
            })}
          </div>
        </Card>
  );
};

// Heatmap Calendar Component
const HeatmapCalendar: React.FC<{ data: any[] }> = ({ data }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Brand Activity Heatmap
          </h3>
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
          Q4 Peak Season
        </Badge>
        </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month headers */}
          <div className="grid grid-cols-12 gap-1 mb-2">
            {months.map((month) => (
              <div key={month} className="text-center text-xs font-medium text-gray-600">
                {month}
            </div>
          ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 365 }, (_, i) => {
              const date = new Date(2024, 0, i + 1);
              const month = date.getMonth();
              const dayOfWeek = date.getDay();
              const activity = Math.random() * 100; // Replace with real data
              
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 ${
                    activity > 80 ? 'bg-red-500' :
                    activity > 60 ? 'bg-orange-500' :
                    activity > 40 ? 'bg-yellow-500' :
                    activity > 20 ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  title={`${date.toLocaleDateString()}: ${Math.round(activity)}% activity`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
          <span className="text-xs text-gray-600">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span className="text-xs text-gray-600">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
          <span className="text-xs text-gray-600">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
          <span className="text-xs text-gray-600">Very High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span className="text-xs text-gray-600">Peak</span>
        </div>
      </div>
    </Card>
  );
};

// Bubble Chart Component
const BubbleChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-pink-600" />
          Deal Probability Matrix
        </h3>
        <Badge variant="secondary" className="bg-pink-100 text-pink-800">
          Bubble size = Deal value
        </Badge>
      </div>
      
      <div className="h-64 relative bg-white rounded-lg p-4">
        {data.map((deal, index) => (
          <motion.div
            key={deal.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1, opacity: 1, zIndex: 10 }}
            className="absolute rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer shadow-lg"
            style={{
              left: `${deal.probability}%`,
              bottom: `${deal.value / 1000}%`,
              width: `${deal.value / 500}px`,
              height: `${deal.value / 500}px`,
              backgroundColor: `hsl(${deal.probability * 2}, 70%, 60%)`,
            }}
            title={`${deal.brand}: $${deal.value.toLocaleString()} (${deal.probability}% chance)`}
          >
            {deal.brand.charAt(0)}
          </motion.div>
        ))}
        
        {/* Axes labels */}
        <div className="absolute bottom-0 left-0 w-full h-8 flex items-center justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
        <div className="absolute top-0 left-0 h-full w-8 flex flex-col items-center justify-between text-xs text-gray-500">
          <span>$50K</span>
          <span>$25K</span>
          <span>$10K</span>
          <span>$5K</span>
    </div>
      </div>
    </Card>
  );
};

// Pitch Success Tracker Component
const PitchSuccessTracker: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-violet-50 to-violet-100 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-600" />
          Pitch Success Tracker
          </h3>
        <Badge variant="secondary" className="bg-violet-100 text-violet-800">
          Win/Loss Analysis
        </Badge>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
              <motion.div
            key={item.reason}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                item.type === 'win' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
              }`}>
                {item.type === 'win' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-medium text-gray-900">{item.reason}</div>
                <div className="text-sm text-gray-500">{item.count} pitches</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{item.percentage}%</div>
              <div className="text-sm text-gray-500">${item.value.toLocaleString()}</div>
            </div>
              </motion.div>
            ))}
          </div>
        </Card>
  );
};

// Spider Chart Component
const SpiderChart: React.FC<{ data: any[] }> = ({ data }) => {
  const categories = data.map(d => d.category);
  const values = data.map(d => d.value);
  const maxValue = Math.max(...values);
  
  return (
    <Card className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-teal-600" />
          Industry Strength Radar
          </h3>
        <Badge variant="secondary" className="bg-teal-100 text-teal-800">
          Your expertise areas
        </Badge>
      </div>
      
      <div className="h-64 relative flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {/* Background circles */}
          {[20, 40, 60, 80, 100].map((radius) => (
            <circle
              key={radius}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
              />
            ))}
          
          {/* Category lines */}
          {categories.map((category, index) => {
            const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
            const x = 100 + 100 * Math.cos(angle);
            const y = 100 + 100 * Math.sin(angle);
            
            return (
              <line
                key={category}
                x1="100"
                y1="100"
                x2={x}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Data polygon */}
          <polygon
            points={categories.map((category, index) => {
              const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
              const value = values[index] / maxValue;
              const x = 100 + 100 * value * Math.cos(angle);
              const y = 100 + 100 * value * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ')}
            fill="rgba(20, 184, 166, 0.2)"
            stroke="#14b8a6"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {categories.map((category, index) => {
            const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
            const value = values[index] / maxValue;
            const x = 100 + 100 * value * Math.cos(angle);
            const y = 100 + 100 * value * Math.sin(angle);
            
            return (
              <g key={category}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#14b8a6"
                  className="hover:r-6 transition-all duration-200"
                />
                <text
                  x={100 + 110 * Math.cos(angle)}
                  y={100 + 110 * Math.sin(angle)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  {category}
                </text>
              </g>
            );
          })}
        </svg>
          </div>
        </Card>
  );
};

// Coach Analytics Components
const ClientJourneyFunnel: React.FC = () => {
  const stages = [
    { name: 'Lead', count: 150, conversion: 100, color: 'from-blue-500 to-blue-600' },
    { name: 'Discovery Call', count: 120, conversion: 80, color: 'from-purple-500 to-purple-600' },
    { name: 'Onboarding', count: 95, conversion: 63, color: 'from-emerald-500 to-emerald-600' },
    { name: 'Active', count: 78, conversion: 52, color: 'from-orange-500 to-orange-600' },
    { name: 'Success', count: 65, conversion: 43, color: 'from-green-500 to-green-600' },
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Client Journey Funnel
        </h3>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Transformation Hub
        </Badge>
      </div>
      
        <div className="space-y-4">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-4"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                <span className="text-sm text-gray-500">{stage.count} clients</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className={`h-3 rounded-full bg-gradient-to-r ${stage.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.conversion}%` }}
                  transition={{ delay: index * 0.1, duration: 1 }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{stage.conversion}% conversion</div>
            </div>
          </motion.div>
          ))}
        </div>
      </Card>
  );
};

const ClientHealthScore: React.FC = () => {
  const clients = [
    { name: 'Sarah Johnson', score: 85, status: 'green', lastSession: '2 days ago' },
    { name: 'Mike Chen', score: 45, status: 'red', lastSession: '1 week ago' },
    { name: 'Emma Davis', score: 72, status: 'yellow', lastSession: '3 days ago' },
    { name: 'Alex Rivera', score: 92, status: 'green', lastSession: 'Today' },
    { name: 'Lisa Wang', score: 38, status: 'red', lastSession: '2 weeks ago' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'text-green-600 bg-green-100';
      case 'yellow': return 'text-yellow-600 bg-yellow-100';
      case 'red': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-emerald-600" />
          Client Health Score
        </h3>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
          At-Risk Alert
        </Badge>
    </div>
      
      <div className="space-y-4">
        {clients.map((client, index) => (
          <motion.div
            key={client.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                {client.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-gray-900">{client.name}</div>
                <div className="text-sm text-gray-500">Last session: {client.lastSession}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="font-bold text-gray-900">{client.score}%</div>
                <Badge className={`text-xs ${getStatusColor(client.status)}`}>
                  {client.status === 'green' ? 'Healthy' : client.status === 'yellow' ? 'Warning' : 'At Risk'}
                </Badge>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

const RevenueStreamsBreakdown: React.FC = () => {
  const streams = [
    { name: '1:1 Coaching', value: 45000, percentage: 45, color: 'from-blue-500 to-blue-600' },
    { name: 'Group Programs', value: 32000, percentage: 32, color: 'from-purple-500 to-purple-600' },
    { name: 'Courses', value: 18000, percentage: 18, color: 'from-emerald-500 to-emerald-600' },
    { name: 'Workshops', value: 5000, percentage: 5, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600" />
          Revenue Streams Breakdown
          </h3>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Impact-to-Income
        </Badge>
      </div>
      
      <div className="space-y-4">
        {streams.map((stream, index) => (
              <motion.div
            key={stream.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${stream.color}`} />
              <span className="font-medium text-gray-900">{stream.name}</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">${stream.value.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{stream.percentage}%</div>
            </div>
              </motion.div>
            ))}
          </div>
        </Card>
  );
};

const LeadSourceAnalysis: React.FC = () => {
  const sources = [
    { name: 'Referrals', percentage: 40, color: 'from-emerald-500 to-emerald-600' },
    { name: 'Content Marketing', percentage: 25, color: 'from-blue-500 to-blue-600' },
    { name: 'Networking', percentage: 20, color: 'from-purple-500 to-purple-600' },
    { name: 'Paid Ads', percentage: 15, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-600" />
          Lead Source Analysis
          </h3>
        <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
          Growth Pipeline
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {sources.map((source, index) => (
          <motion.div
            key={source.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center p-4 bg-white/50 rounded-lg"
          >
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r ${source.color} flex items-center justify-center text-white font-bold text-lg`}>
              {source.percentage}%
    </div>
            <div className="font-medium text-gray-900">{source.name}</div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

const ProgramPerformanceGrid: React.FC = () => {
  const programs = [
    { name: 'Life Transformation', completion: 85, satisfaction: 4.8, revenue: 25000 },
    { name: 'Career Breakthrough', completion: 78, satisfaction: 4.6, revenue: 18000 },
    { name: 'Mindset Mastery', completion: 92, satisfaction: 4.9, revenue: 32000 },
    { name: 'Business Scaling', completion: 70, satisfaction: 4.4, revenue: 15000 },
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Program Performance Grid
        </h3>
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
          Curriculum Command Center
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((program, index) => (
            <motion.div
            key={program.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white/50 rounded-lg"
          >
            <div className="font-bold text-gray-900 mb-2">{program.name}</div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                <span className="text-gray-600">Completion Rate:</span>
                <span className="font-medium text-gray-900">{program.completion}%</span>
                </div>
                <div className="flex justify-between">
                <span className="text-gray-600">Satisfaction:</span>
                <span className="font-medium text-gray-900">{program.satisfaction}/5.0</span>
                </div>
                <div className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-medium text-gray-900">${program.revenue.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
  );
};

// Main Analytics Dashboard
const AnalyticsDashboard: React.FC<{ activeNiche?: string }> = ({ activeNiche }) => {
  const { currentNiche } = useNiche();
  const [activeSection, setActiveSection] = useState('overview');
  const [showNetRevenue, setShowNetRevenue] = useState(false);
  
  // Period filter state
  const [clientGrowthPeriod, setClientGrowthPeriod] = useState('this-quarter');
  const [revenueGrowthPeriod, setRevenueGrowthPeriod] = useState('this-quarter');
  const [freelancerOpportunitiesPeriod, setFreelancerOpportunitiesPeriod] = useState('this-quarter');
  const [freelancerClientsPeriod, setFreelancerClientsPeriod] = useState('this-quarter');
  const [freelancerRevenuePeriod, setFreelancerRevenuePeriod] = useState('this-quarter');

  // Real-time analytics data
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError, refresh: refreshAnalytics } = useAnalytics({
    niche: activeNiche || 'creator',
    autoRefresh: true,
    refreshInterval: 30000 // Refresh every 30 seconds
  });

  // Track last refresh time
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Update last refresh time when data changes
  useEffect(() => {
    if (analyticsData && !analyticsLoading) {
      setLastRefreshTime(new Date());
    }
  }, [analyticsData, analyticsLoading]);

  // Clients state
  const [contacts, setContacts] = useState<Client[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lead' | 'client' | 'inactive'>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'lead' as 'lead' | 'client' | 'inactive',
    notes: '',
    tags: [] as string[]
  });

  // Episodes state
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<any[]>([]);
  const [episodeSearchQuery, setEpisodeSearchQuery] = useState('');
  const [episodeSortBy, setEpisodeSortBy] = useState<'views' | 'date' | 'name'>('views');
  const [episodeSortOrder, setEpisodeSortOrder] = useState<'asc' | 'desc'>('desc');

  // Brands state
  const [brands, setBrands] = useState<any[]>([]);

  // Use real data only - no fallback to mock data
  const data = analyticsData;

  // Add state for calculated revenue and growth rate
  const [calculatedRevenue, setCalculatedRevenue] = useState<number>(0);
  const [calculatedGrowthRate, setCalculatedGrowthRate] = useState<number>(0);

  // Add state for chart and stage breakdown
  const [revenueByMonth, setRevenueByMonth] = useState<{ month: string; value: number }[]>([]);
  const [opportunitiesForCharts, setOpportunitiesForCharts] = useState<any[]>([]);

  // Trigger refresh when component mounts or niche changes
  useEffect(() => {
    if (refreshAnalytics) {
      refreshAnalytics();
    }
  }, [activeNiche, refreshAnalytics]);

  // Refresh data when component becomes visible (e.g., when navigating back to analytics)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && refreshAnalytics) {
        refreshAnalytics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshAnalytics]);

  // Refresh data when user returns to the analytics dashboard (e.g., after updating data)
  useEffect(() => {
    const handleFocus = () => {
      if (refreshAnalytics) {
        refreshAnalytics();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshAnalytics]);

  // Calculate revenue and growth rate from opportunities (dashboard logic)
  useEffect(() => {
    const fetchAndCalculateMetrics = async () => {
      try {
        const response = await fetch(`/api/opportunities?niche=${activeNiche || 'creator'}`);
        if (!response.ok) {
          throw new Error('Failed to fetch opportunities for metrics');
        }
        const opportunities = await response.json();
        // Revenue: match dashboard logic for won opportunities
        let wonOpportunities;
        if ((activeNiche || 'creator') === 'coach') {
          wonOpportunities = opportunities.filter((opp: any) => opp.status === 'won' || opp.status === 'paid');
        } else {
          wonOpportunities = opportunities.filter((opp: any) => opp.status === 'won');
        }
        const totalRevenue = wonOpportunities.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0);
        setCalculatedRevenue(totalRevenue);
        // Growth Rate: percent of won (and paid for coach) out of all
        const totalOpportunities = opportunities.length;
        const growthRate = totalOpportunities > 0 ? (wonOpportunities.length / totalOpportunities) * 100 : 0;
        setCalculatedGrowthRate(growthRate);
      } catch (error) {
        setCalculatedRevenue(0);
        setCalculatedGrowthRate(0);
      }
    };
    fetchAndCalculateMetrics();
  }, [activeNiche, lastRefreshTime]);

  // Calculate revenue by month and opportunities by stage from opportunities (dashboard logic)
  useEffect(() => {
    const fetchAndCalculateCharts = async () => {
      try {
        const response = await fetch(`/api/opportunities?niche=${activeNiche || 'creator'}`);
        if (!response.ok) {
          throw new Error('Failed to fetch opportunities for charts');
        }
        const opportunities = await response.json();
        // Revenue by month: match dashboard logic for won opportunities
        let wonOpportunities;
        if ((activeNiche || 'creator') === 'coach') {
          wonOpportunities = opportunities.filter((opp: any) => opp.status === 'won' || opp.status === 'paid');
        } else {
          wonOpportunities = opportunities.filter((opp: any) => opp.status === 'won');
        }
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = new Array(12).fill(0);
        wonOpportunities.forEach((opp: any) => {
          // Use actual_close_date if available, otherwise use updated_at, fallback to created_at
          const date = opp.actual_close_date ? new Date(opp.actual_close_date) : 
                      opp.updated_at ? new Date(opp.updated_at) : 
                      new Date(opp.created_at);
          const monthIndex = date.getMonth();
          monthlyData[monthIndex] += opp.value || 0;
        });
        setRevenueByMonth(months.map((month, index) => ({ month, value: monthlyData[index] })));
        // Store opportunities for charts (GrowthRateChart expects array of opportunities)
        setOpportunitiesForCharts(opportunities);
      } catch (error) {
        setRevenueByMonth([]);
        setOpportunitiesForCharts([]);
      }
    };
    fetchAndCalculateCharts();
  }, [activeNiche, lastRefreshTime]);

  // Clients functions
  const loadClients = async () => {
    try {
      setLoading(true);
      // Use the same fetchClients function as the clients page
      const { fetchClients } = await import('@/lib/client-service');
      const data = await fetchClients(activeNiche);
      setContacts(data);
      setFilteredContacts(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      setContacts([]);
      setFilteredContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load clients when coach or podcaster section is active
  useEffect(() => {
    if ((activeNiche === 'coach' && activeSection === 'clients') || 
        (activeNiche === 'podcaster' && activeSection === 'growth')) {
      loadClients();
    }
  }, [activeNiche, activeSection]);

  // Load brands data for creator niche (using same data source as clients page)
  useEffect(() => {
    const loadBrands = async () => {
      try {
        if (activeNiche === 'creator' && activeSection === 'brands') {
          // Use the same fetchClients function as the clients page
          const { fetchClients } = await import('@/lib/client-service');
          const clientsData = await fetchClients(activeNiche);
          const brandsData = clientsData.map((client: any) => ({
            id: client.id,
            name: client.name,
            industry: client.company || 'Unknown',
            rating: client.status === 'client' ? 5 : client.status === 'lead' ? 3 : 1, // Realistic rating based on status
            totalRevenue: client.value ? parseFloat(client.value.replace(/[^0-9.]/g, '')) : 0, // Use actual value if available
            status: client.status === 'client' ? 'Active' : client.status === 'lead' ? 'Pending' : 'Inactive'
          }));
          setBrands(brandsData);
        }
      } catch (error) {
        console.error('Error loading brands:', error);
        setBrands([]);
      }
    };

    loadBrands();
  }, [activeNiche, activeSection]);

  // Filter contacts based on search query and status filter
  useEffect(() => {
    let filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, statusFilter]);

  const handleAddContact = () => {
    setSelectedContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'lead',
      notes: '',
      tags: []
    });
    setIsModalOpen(true);
  };

  const handleEditContact = (contact: Client) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      status: contact.status,
      notes: contact.notes || '',
      tags: contact.tags || []
    });
    setIsModalOpen(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteClient(id);
        await loadClients();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleArchiveContact = async (contact: Client) => {
    try {
      await updateClient(contact.id, { status: 'inactive' });
      await loadClients();
    } catch (error) {
      console.error('Error archiving contact:', error);
    }
  };

  const handleSaveContact = async () => {
    try {
      const saveData = formData;

      if (selectedContact) {
        // Update existing contact
        await updateClient(selectedContact.id, saveData);
      } else {
        // Create new contact
        await createClient(saveData, activeNiche || 'coach');
      }
      
      await loadClients();
      setIsModalOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      client: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      lead: 'Lead',
      client: 'Client',
      inactive: 'Archived',
      archived: 'Archived'
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Episodes filtering and sorting
  useEffect(() => {
    let filtered = data?.podcaster?.topEpisodes?.filter(episode =>
      episode.title.toLowerCase().includes(episodeSearchQuery.toLowerCase()) ||
      episode.guest.toLowerCase().includes(episodeSearchQuery.toLowerCase())
    ) || [];

    // Sort episodes
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (episodeSortBy) {
        case 'views':
          aValue = a.views;
          bValue = b.views;
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'name':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = a.views;
          bValue = b.views;
      }

      if (episodeSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredEpisodes(filtered);
  }, [data?.podcaster?.topEpisodes, episodeSearchQuery, episodeSortBy, episodeSortOrder]);

  // Initialize episodes
  useEffect(() => {
    if (data?.podcaster?.topEpisodes) {
      setEpisodes(data.podcaster.topEpisodes);
      setFilteredEpisodes(data.podcaster.topEpisodes);
    }
  }, [data?.podcaster?.topEpisodes]);

  const sections = activeNiche === 'creator' ? [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'opportunities', label: 'Opportunities', icon: Target },
    { id: 'brands', label: 'Brands/Clients', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'growth', label: 'Growth Rate', icon: TrendingUp },
  ] : activeNiche === 'coach' ? [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'opportunities', label: 'Opportunities', icon: Target },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'programs', label: 'Programs', icon: BookOpen },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ] : activeNiche === 'podcaster' ? [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'opportunities', label: 'Opportunities', icon: Target },
    { id: 'brands', label: 'Episodes', icon: Radio },
    { id: 'growth', label: 'Guests', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ] : activeNiche === 'freelancer' ? [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'opportunities', label: 'Opportunities', icon: Target },
    { id: 'brands', label: 'Clients', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'growth', label: 'Growth Rate', icon: TrendingUp },
  ] : [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'opportunities', label: 'Opportunities', icon: Rocket },
    { id: 'brands', label: 'Brands/Clients', icon: Crown },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ];

  return (
        <div className={`min-h-screen p-6 ${
      activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
        ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        : 'bg-background'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <motion.h1 
              className={`text-4xl font-bold ${
                activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
                  ? 'bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent'
                  : 'text-foreground'
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {activeNiche === 'creator' ? 'Creator Analytics Dashboard' : 
               activeNiche === 'coach' ? 'Coach Analytics Dashboard' : 
               activeNiche === 'podcaster' ? 'Podcaster Analytics Dashboard' :
               activeNiche === 'freelancer' ? 'Freelancer Analytics Dashboard' :
               'Analytics Dashboard'}
            </motion.h1>
          </div>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Your media empire metrics at a glance
          </motion.p>
          {lastRefreshTime && (
            <motion.p 
              className="text-sm text-gray-500 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Last updated: {lastRefreshTime.toLocaleTimeString()}
            </motion.p>
          )}
        </div>

                {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className={`rounded-xl p-1 shadow-lg ${
            activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer' ? 'bg-white' : 'bg-card'
          }`}>
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                onClick={() => setActiveSection(section.id)}
                className={`mx-1 rounded-lg transition-all duration-300 ${
                  activeSection === section.id 
                    ? (activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-primary text-primary-foreground')
                    : 'hover:bg-gray-100'
                }`}
              >
                <section.icon className="w-4 h-4 mr-2" />
                {section.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview Section */}
        <AnimatePresence mode="wait">
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeNiche === 'creator' ? (
                  <>
                    <MetricCard
                      title="Opportunities"
                      value={analyticsData?.opportunities?.total?.toString() || "0"}
                      change={analyticsData?.opportunities?.conversionRate || 0}
                      icon={Target}
                      trend="up"
                      color="blue"
                      gradient="bg-gradient-to-br from-blue-50 to-blue-100"
                    />
                    <MetricCard
                      title="Brands/Clients"
                      value={analyticsData?.clients?.total?.toString() || "0"}
                      change={analyticsData?.clients?.newThisMonth || 0}
                      icon={Users}
                      trend="up"
                      color="purple"
                      gradient="bg-gradient-to-br from-purple-50 to-purple-100"
                    />
                    <MetricCard
                      title="Revenue"
                      value={`$${calculatedRevenue.toLocaleString()}`}
                      change={analyticsData?.revenue?.growthRate || 0}
                      icon={DollarSign}
                      trend="up"
                      color="emerald"
                      gradient="bg-gradient-to-br from-emerald-50 to-emerald-100"
                    />
                    <MetricCard
                      title="Growth Rate"
                      value={`${calculatedGrowthRate.toFixed(1)}%`}
                      change={calculatedGrowthRate}
                      icon={Target}
                      trend="up"
                      color="cyan"
                      gradient="bg-gradient-to-br from-cyan-50 to-cyan-100"
                    />
                  </>
                ) : activeNiche === 'coach' ? (
                  <>
                    <MetricCard
                      title="Opportunities"
                      value={analyticsData?.opportunities?.total?.toString() || "0"}
                      change={analyticsData?.opportunities?.conversionRate || 0}
                      icon={Target}
                      trend="up"
                      color="purple"
                      gradient="bg-gradient-to-br from-purple-50 to-purple-100"
                    />
                    <MetricCard
                      title="Clients"
                      value={analyticsData?.clients?.total?.toString() || "0"}
                      change={analyticsData?.clients?.newThisMonth || 0}
                      icon={Users}
                      trend="up"
                      color="emerald"
                      gradient="bg-gradient-to-br from-emerald-50 to-emerald-100"
                    />
                    <MetricCard
                      title="Programs"
                      value={analyticsData?.coach?.programs?.total?.toString() || "0"}
                      change={analyticsData?.coach?.programs?.active || 0}
                      icon={BookOpen}
                      trend="up"
                      color="cyan"
                      gradient="bg-gradient-to-br from-cyan-50 to-cyan-100"
                    />
                    <MetricCard
                      title="Total Revenue"
                      value={analyticsData?.revenue?.total ? `$${analyticsData.revenue.total.toLocaleString()}` : "$0"}
                      change={analyticsData?.revenue?.growthRate || 0}
                      icon={DollarSign}
                      trend="up"
                      color="blue"
                      gradient="bg-gradient-to-br from-blue-50 to-blue-100"
                    />
                  </>
                ) : activeNiche === 'podcaster' ? (
                  <>
                    <MetricCard
                      title="Opportunities"
                      value={analyticsData?.opportunities?.total?.toString() || "0"}
                      change={analyticsData?.opportunities?.conversionRate || 0}
                      icon={Target}
                      trend="up"
                      color="blue"
                      gradient="bg-gradient-to-br from-blue-50 to-blue-100"
                    />
                    <MetricCard
                      title="Episodes"
                      value={analyticsData?.podcaster?.episodes?.total?.toString() || "0"}
                      change={analyticsData?.podcaster?.episodes?.publishedThisMonth || 0}
                      icon={Radio}
                      trend="up"
                      color="purple"
                      gradient="bg-gradient-to-br from-purple-50 to-purple-100"
                    />
                    <MetricCard
                      title="Guests"
                      value={analyticsData?.podcaster?.guests?.total?.toString() || "0"}
                      change={analyticsData?.podcaster?.guests?.newThisMonth || 0}
                      icon={Users}
                      trend="up"
                      color="cyan"
                      gradient="bg-gradient-to-br from-cyan-50 to-cyan-100"
                    />
                    <MetricCard
                      title="Revenue"
                      value={analyticsData?.revenue?.total ? `$${analyticsData.revenue.total.toLocaleString()}` : "$0"}
                      change={analyticsData?.revenue?.growthRate || 0}
                      icon={DollarSign}
                      trend="up"
                      color="emerald"
                      gradient="bg-gradient-to-br from-emerald-50 to-emerald-100"
                    />
                  </>
                ) : activeNiche === 'freelancer' ? (
                  <>
                    <MetricCard
                      title="Opportunities"
                      value={analyticsData?.opportunities?.total?.toString() || "0"}
                      change={analyticsData?.opportunities?.conversionRate || 0}
                      icon={Target}
                      trend="up"
                      color="blue"
                      gradient="bg-gradient-to-br from-blue-50 to-blue-100"
                    />
                    <MetricCard
                      title="Clients"
                      value={analyticsData?.clients?.total?.toString() || "0"}
                      change={analyticsData?.clients?.newThisMonth || 0}
                      icon={Users}
                      trend="up"
                      color="purple"
                      gradient="bg-gradient-to-br from-purple-50 to-purple-100"
                    />
                    <MetricCard
                      title="Revenue"
                      value={analyticsData?.revenue?.total ? `$${analyticsData.revenue.total.toLocaleString()}` : "$0"}
                      change={analyticsData?.revenue?.growthRate || 0}
                      icon={DollarSign}
                      trend="up"
                      color="emerald"
                      gradient="bg-gradient-to-br from-emerald-50 to-emerald-100"
                    />
                    <MetricCard
                      title="Growth Rate"
                      value={`${calculatedGrowthRate.toFixed(1)}%`}
                      change={calculatedGrowthRate}
                      icon={Target}
                      trend="up"
                      color="cyan"
                      gradient="bg-gradient-to-br from-cyan-50 to-cyan-100"
                    />
                  </>
                ) : (
                  <>
                    <MetricCard
                      title="Total Revenue"
                      value={analyticsData?.revenue?.total ? `$${analyticsData.revenue.total.toLocaleString()}` : "$0"}
                      change={analyticsData?.revenue?.growthRate || 0}
                      icon={DollarSign}
                      trend="up"
                      color="emerald"
                      gradient="bg-gradient-to-br from-emerald-50 to-emerald-100"
                    />
                    <MetricCard
                      title="Opportunities"
                      value={analyticsData?.opportunities?.total?.toString() || "0"}
                      change={analyticsData?.opportunities?.conversionRate || 0}
                      icon={Rocket}
                      trend="up"
                      color="blue"
                      gradient="bg-gradient-to-br from-blue-50 to-blue-100"
                    />
                    <MetricCard
                      title="Brands/Clients"
                      value={analyticsData?.clients?.total?.toString() || "0"}
                      change={analyticsData?.clients?.newThisMonth || 0}
                      icon={Crown}
                      trend="up"
                      color="purple"
                      gradient="bg-gradient-to-br from-purple-50 to-purple-100"
                    />
                    <MetricCard
                      title="Growth Rate"
                      value={`${calculatedGrowthRate.toFixed(1)}%`}
                      change={calculatedGrowthRate}
                      icon={Target}
                      trend="up"
                      color="cyan"
                      gradient="bg-gradient-to-br from-cyan-50 to-cyan-100"
                    />
                  </>
                )}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart data={revenueByMonth} />
                <GrowthRateChart data={opportunitiesForCharts} activeNiche={activeNiche} />
              </div>
              
              {/* Brands/Clients Grid */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {activeNiche === 'podcaster' ? (
                      <>
                        <Radio className="w-5 h-5 text-blue-600" />
                        Top Episodes
                      </>
                    ) : activeNiche === 'coach' ? (
                      <>
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Top Programs
                      </>
                    ) : (
                      <>
                        <Crown className="w-5 h-5 text-blue-600" />
                        Top Revenue Clients
                      </>
                    )}
        </h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {activeNiche === 'podcaster' ? `${episodes.length} Episodes` : activeNiche === 'coach' ? '0 Programs' : `${brands.length} Partners`}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {brands.slice(0, 8).map((brand, index) => (
            <motion.div
                      key={brand.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative group"
                    >
                      <Card className="p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="text-center">
                          <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {brand.name.charAt(0)}
                          </div>
                          <h4 className="font-semibold text-gray-900 text-xs">
                            {brand.name}
                          </h4>
                          <div className="text-xs text-gray-500 mt-1">
                            {brand.industry}
                          </div>
                          
                          <div className="mt-2">
                            <div className="flex items-center justify-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-2 h-2 ${i < brand.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 font-medium">
                              {brand.totalRevenue / 1000}k views
                            </div>
                          </div>
                          
                          <Badge 
                            variant="secondary" 
                            className={`mt-2 text-xs ${
                              brand.status === 'Active' ? 'bg-green-100 text-green-800' :
                              brand.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {brand.status}
                          </Badge>
                        </div>
                      </Card>
            </motion.div>
          ))}
        </div>
      </Card>
            </motion.div>
          )}



          {/* Coach-Specific Sections */}
          {activeNiche === 'coach' && activeSection === 'clients' && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your {activeNiche} contacts and clients
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contacts.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contacts.filter(c => c.status === 'client').length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Leads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contacts.filter(c => c.status === 'lead').length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Search, Filter, and View Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contacts</SelectItem>
                      <SelectItem value="lead">Leads</SelectItem>
                      <SelectItem value="client">Clients</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contacts Display */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading contacts...</p>
                  </div>
                </div>
              ) : filteredContacts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No contacts found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'No contacts available'}
                    </p>
                  </CardContent>
                </Card>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-lg transition-all duration-200 group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{contact.name}</h3>
                              <Badge className={`${getStatusColor(contact.status)} text-xs`}>
                                {getStatusLabel(contact.status)}
                              </Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {contact.status !== 'inactive' && (
                                <DropdownMenuItem onClick={() => handleArchiveContact(contact)}>
                                  <Archive className="w-4 h-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteContact(contact.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          {contact.company && (
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              <span>{contact.company}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>

                        {contact.notes && (
                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{contact.notes}</p>
                        )}

                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {contact.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {contact.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{contact.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{contact.name}</h3>
                                <Badge className={getStatusColor(contact.status)}>
                                  {getStatusLabel(contact.status)}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                {contact.company && (
                                  <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    <span>{contact.company}</span>
                                  </div>
                                )}
                                {contact.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span>{contact.email}</span>
                                  </div>
                                )}
                                {contact.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{contact.phone}</span>
                                  </div>
                                )}
                              </div>

                              {contact.notes && (
                                <p className="text-sm text-muted-foreground mt-2">{contact.notes}</p>
                              )}

                              {contact.tags && contact.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {contact.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditContact(contact)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {contact.status !== 'inactive' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchiveContact(contact)}
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Contact Modal */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedContact ? 'Edit Contact' : 'Add New Contact'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter contact name"
                      />
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <Label>Company</Label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any notes about this contact"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveContact} className="flex-1">
                        {selectedContact ? 'Update' : 'Create'} Contact
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}

          {activeNiche === 'coach' && activeSection === 'revenue' && (
            <motion.div
              key="coach-revenue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Revenue Growth Chart */}
              <RevenueChart data={revenueByMonth} />
              
              {/* Top Programs */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Top Programs
                  </h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {analyticsData?.coach?.programs?.total || 0} Programs
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      name: 'Life Transformation',
                      completion: analyticsData?.coach?.completionRate || 0,
                      satisfaction: 4.8,
                      revenue: analyticsData?.coach?.averageProgramValue || 0,
                      students: analyticsData?.coach?.studentsEnrolled || 0
                    },
                    {
                      name: 'Career Breakthrough',
                      completion: Math.max(0, (analyticsData?.coach?.completionRate || 0) - 7),
                      satisfaction: 4.6,
                      revenue: Math.max(0, (analyticsData?.coach?.averageProgramValue || 0) - 7000),
                      students: Math.max(0, Math.floor((analyticsData?.coach?.studentsEnrolled || 0) * 0.8))
                    },
                    {
                      name: 'Mindset Mastery',
                      completion: Math.min(100, (analyticsData?.coach?.completionRate || 0) + 7),
                      satisfaction: 4.9,
                      revenue: Math.max(0, (analyticsData?.coach?.averageProgramValue || 0) + 7000),
                      students: Math.max(0, Math.floor((analyticsData?.coach?.studentsEnrolled || 0) * 0.6))
                    }
                  ].map((program, index) => (
                    <motion.div
                      key={program.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative group"
                    >
                      <Card className="p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="text-center">
                          <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {program.name.charAt(0)}
                          </div>
                          <h4 className="font-semibold text-gray-900 text-xs">
                            {program.name}
                          </h4>
                          <div className="text-xs text-gray-500 mt-1">
                            {program.students} Students
                          </div>
                          
                          <div className="mt-2">
                            <div className="flex items-center justify-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-2 h-2 ${i < Math.floor(program.satisfaction) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 font-medium">
                              ${(program.revenue / 1000).toFixed(0)}k revenue
                            </div>
                          </div>
                          
                          <Badge 
                            variant="secondary" 
                            className={`mt-2 text-xs ${
                              program.completion >= 80 ? 'bg-green-100 text-green-800' :
                              program.completion >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {program.completion}% Complete
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeNiche === 'coach' && activeSection === 'opportunities' && (
            <motion.div
              key="coach-opportunities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <GrowthRateChart data={opportunitiesForCharts} activeNiche={activeNiche} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricCard
                  title="Opportunities"
                  value={analyticsData?.opportunities?.total?.toString() || "0"}
                  change={analyticsData?.opportunities?.conversionRate || 0}
                  icon={Target}
                  trend="up"
                  color="blue"
                  subtitle="Total opportunities"
                />
                <MetricCard
                  title="Conversion Rate"
                  value={`${analyticsData?.opportunities?.conversionRate || 0}%`}
                  change={analyticsData?.opportunities?.conversionRate || 0}
                  icon={Activity}
                  trend="up"
                  color="purple"
                  subtitle="Won opportunities"
                />
              </div>
            </motion.div>
          )}

          {activeNiche === 'podcaster' && activeSection === 'opportunities' && (
            <motion.div
              key="podcaster-opportunities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <GrowthRateChart data={opportunitiesForCharts} activeNiche={activeNiche} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricCard
                  title="Follower Growth"
                  value={analyticsData?.growth?.followers ? `+${analyticsData.growth.followers.toLocaleString()}` : "+0"}
                  change={analyticsData?.growth?.followerGrowth || 0}
                  icon={Users}
                  trend="up"
                  color="blue"
                  subtitle="This month"
                />
                <MetricCard
                  title="Engagement Rate"
                  value={`${analyticsData?.growth?.engagementRate || 0}%`}
                  change={analyticsData?.growth?.engagementGrowth || 0}
                  icon={Activity}
                  trend="up"
                  color="purple"
                  subtitle="Above average"
                />
              </div>
            </motion.div>
          )}

          {activeNiche === 'freelancer' && activeSection === 'opportunities' && (
            <motion.div
              key="freelancer-opportunities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <GrowthRateChart data={opportunitiesForCharts} activeNiche={activeNiche} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricCard
                  title="Follower Growth"
                  value={analyticsData?.growth?.followers ? `+${analyticsData.growth.followers.toLocaleString()}` : "+0"}
                  change={analyticsData?.growth?.followerGrowth || 0}
                  icon={Users}
                  trend="up"
                  color="blue"
                  subtitle="This month"
                />
                <MetricCard
                  title="Engagement Rate"
                  value={`${analyticsData?.growth?.engagementRate || 0}%`}
                  change={analyticsData?.growth?.engagementGrowth || 0}
                  icon={Activity}
                  trend="up"
                  color="purple"
                  subtitle="Above average"
                />
              </div>
            </motion.div>
          )}

          {activeNiche === 'coach' && activeSection === 'programs' && (
            <motion.div
              key="coach-programs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">Programs</h1>
                <p className="text-sm text-muted-foreground">
                  All programs you've created as a coach
                </p>
              </div>

              {/* Programs Grid */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Your Programs
                  </h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {analyticsData?.coach?.programs?.total || 0} Total Programs
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      name: 'Life Transformation Program',
                      description: '6-month comprehensive life coaching program',
                      duration: '6 months',
                      price: analyticsData?.coach?.averageProgramValue || 25000,
                      enrolled: Math.floor((analyticsData?.coach?.studentsEnrolled || 0) * 0.4),
                      completion: analyticsData?.coach?.completionRate || 85,
                      status: 'Active'
                    },
                    {
                      name: 'Career Breakthrough Coaching',
                      description: '3-month career development and advancement program',
                      duration: '3 months',
                      price: Math.max(0, (analyticsData?.coach?.averageProgramValue || 25000) - 7000),
                      enrolled: Math.floor((analyticsData?.coach?.studentsEnrolled || 0) * 0.3),
                      completion: Math.max(0, (analyticsData?.coach?.completionRate || 85) - 7),
                      status: 'Active'
                    },
                    {
                      name: 'Mindset Mastery Course',
                      description: '4-month mindset and personal development program',
                      duration: '4 months',
                      price: Math.max(0, (analyticsData?.coach?.averageProgramValue || 25000) + 7000),
                      enrolled: Math.floor((analyticsData?.coach?.studentsEnrolled || 0) * 0.2),
                      completion: Math.min(100, (analyticsData?.coach?.completionRate || 85) + 7),
                      status: 'Active'
                    },
                    {
                      name: 'Business Scaling Mastery',
                      description: '5-month business growth and scaling program',
                      duration: '5 months',
                      price: Math.max(0, (analyticsData?.coach?.averageProgramValue || 25000) - 5000),
                      enrolled: Math.floor((analyticsData?.coach?.studentsEnrolled || 0) * 0.1),
                      completion: Math.max(0, (analyticsData?.coach?.completionRate || 85) - 15),
                      status: 'Active'
                    }
                  ].map((program, index) => (
                    <motion.div
                      key={program.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative group"
                    >
                      <Card className="p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {program.name.charAt(0)}
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {program.name}
                          </h4>
                          <div className="text-xs text-gray-500 mb-3">
                            {program.description}
                          </div>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-medium text-gray-900">{program.duration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-medium text-gray-900">${program.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Enrolled:</span>
                              <span className="font-medium text-gray-900">{program.enrolled} students</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Completion:</span>
                              <span className="font-medium text-gray-900">{program.completion}%</span>
                            </div>
                          </div>
                          
                          <Badge 
                            variant="secondary" 
                            className={`mt-3 text-xs ${
                              program.status === 'Active' ? 'bg-green-100 text-green-800' :
                              program.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {program.status}
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Revenue Section */}
          {activeSection === 'revenue' && activeNiche !== 'coach' && activeNiche !== 'podcaster' && (
            <motion.div
              key="revenue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <RevenueChart data={revenueByMonth} />
            </motion.div>
          )}

          {/* Podcaster Revenue Section */}
          {activeNiche === 'podcaster' && activeSection === 'revenue' && (
            <motion.div
              key="podcaster-revenue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <RevenueChart data={revenueByMonth} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricCard
                  title="Average Episode Revenue"
                  value="$2,450"
                  change={18}
                  icon={DollarSign}
                  trend="up"
                  color="emerald"
                  subtitle="Per episode"
                />
                <MetricCard
                  title="Monthly Recurring"
                  value="$8,200"
                  change={25}
                  icon={Activity}
                  trend="up"
                  color="blue"
                  subtitle="Steady income"
                />
              </div>
            </motion.div>
          )}

          {/* Brands/Clients Section */}
          {activeSection === 'brands' && activeNiche !== 'podcaster' && (
        <motion.div
              key="brands"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
              <BrandPortfolio brands={brands} />
        </motion.div>
          )}

          {/* Podcaster Episodes Section */}
          {activeNiche === 'podcaster' && activeSection === 'brands' && (
            <motion.div
              key="podcaster-episodes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">Episodes</h1>
                <p className="text-sm text-muted-foreground">
                  All episodes you've created as a podcaster
                </p>
              </div>

              {/* Episodes Grid */}
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Radio className="w-5 h-5 text-purple-600" />
                    Your Episodes
                  </h3>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {episodes.length} Total Episodes
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'Building a Successful Podcast',
                      guest: 'Sarah Johnson',
                      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                      duration: '45 min',
                      platform: 'Spotify',
                      views: Math.floor((analyticsData?.podcaster?.totalViews || 0) * 0.3),
                      status: 'Published'
                    },
                    {
                      title: 'Marketing Strategies for Creators',
                      guest: 'Mike Chen',
                      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                      duration: '52 min',
                      platform: 'Apple Podcasts',
                      views: Math.floor((analyticsData?.podcaster?.totalViews || 0) * 0.25),
                      status: 'Published'
                    },
                    {
                      title: 'Monetization Tips for Podcasters',
                      guest: 'Emma Rodriguez',
                      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
                      duration: '38 min',
                      platform: 'YouTube',
                      views: Math.floor((analyticsData?.podcaster?.totalViews || 0) * 0.2),
                      status: 'Published'
                    },
                    {
                      title: 'Interview with Industry Expert',
                      guest: 'David Thompson',
                      date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
                      duration: '61 min',
                      platform: 'Spotify',
                      views: Math.floor((analyticsData?.podcaster?.totalViews || 0) * 0.15),
                      status: 'Published'
                    },
                    {
                      title: 'Behind the Scenes of Content Creation',
                      guest: 'Lisa Park',
                      date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
                      duration: '42 min',
                      platform: 'Apple Podcasts',
                      views: Math.floor((analyticsData?.podcaster?.totalViews || 0) * 0.1),
                      status: 'Published'
                    }
                  ].map((episode, index) => (
                    <motion.div
                      key={episode.title}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative group"
                    >
                      <Card className="p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            <Radio className="w-6 h-6" />
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {episode.title}
                          </h4>
                          <div className="text-xs text-gray-500 mb-3">
                            Guest: {episode.guest}
                          </div>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Date:</span>
                              <span className="font-medium text-gray-900">{episode.date.toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-medium text-gray-900">{episode.duration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Platform:</span>
                              <span className="font-medium text-gray-900">{episode.platform}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Views:</span>
                              <span className="font-medium text-gray-900">{episode.views.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <Badge 
                            variant="secondary" 
                            className={`mt-3 text-xs ${
                              episode.status === 'Published' ? 'bg-green-100 text-green-800' :
                              episode.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {episode.status}
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Growth Section - Creator */}
          {activeSection === 'growth' && activeNiche === 'creator' && (
            <motion.div
              key="creator-growth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">Growth Analytics</h1>
                <p className="text-sm text-muted-foreground">
                  Track your brand deals, client growth, and revenue performance
                </p>
              </div>

              {/* Growth Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Client Growth</h3>
                    <div className="flex items-center gap-2">
                      <Select value={clientGrowthPeriod} onValueChange={setClientGrowthPeriod}>
                        <SelectTrigger className="h-7 w-24 text-xs border border-gray-200 bg-white/80 hover:bg-white shadow-sm rounded-md px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="min-w-[120px]">
                          <SelectItem value="this-month">Month</SelectItem>
                          <SelectItem value="this-quarter">Quarter</SelectItem>
                          <SelectItem value="ytd">YTD</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                        +{analyticsData?.clients?.newThisMonth || 0}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Clients</span>
                      <span className="font-bold text-gray-900">{analyticsData?.clients?.active || 0}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Revenue Growth</h3>
                    <div className="flex items-center gap-2">
                      <Select value={revenueGrowthPeriod} onValueChange={setRevenueGrowthPeriod}>
                        <SelectTrigger className="h-7 w-24 text-xs border border-gray-200 bg-white/80 hover:bg-white shadow-sm rounded-md px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="min-w-[120px]">
                          <SelectItem value="this-month">Month</SelectItem>
                          <SelectItem value="this-quarter">Quarter</SelectItem>
                          <SelectItem value="ytd">YTD</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        +{calculatedGrowthRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="font-bold text-gray-900">${calculatedRevenue > 0 ? (calculatedRevenue / 1000).toFixed(0) + 'K' : '0'}</span>
                    </div>
                  </div>
                </Card>
              </div>




            </motion.div>
          )}

          {/* Growth Section - Other Niches */}
          {activeSection === 'growth' && activeNiche !== 'creator' && activeNiche !== 'freelancer' && activeNiche !== 'podcaster' && (
            <motion.div
              key="growth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <GrowthRateChart data={opportunitiesForCharts} activeNiche={activeNiche} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricCard
                  title="Follower Growth"
                  value={analyticsData?.growth?.followers ? `+${analyticsData.growth.followers.toLocaleString()}` : "+0"}
                  change={analyticsData?.growth?.followerGrowth || 0}
                  icon={Users}
                  trend="up"
                  color="blue"
                  subtitle="This month"
                />
                <MetricCard
                  title="Engagement Rate"
                  value={`${analyticsData?.growth?.engagementRate || 0}%`}
                  change={analyticsData?.growth?.engagementGrowth || 0}
                  icon={Activity}
                  trend="up"
                  color="purple"
                  subtitle="Above average"
                />
              </div>
            </motion.div>
          )}

          {/* Podcaster Guests Section (Contacts) */}
          {activeNiche === 'podcaster' && activeSection === 'growth' && (
            <motion.div
              key="podcaster-guests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Guests</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your {activeNiche} guests and contacts
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contacts.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contacts.filter(c => c.status === 'client').length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contacts.filter(c => c.status === 'lead').length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Search, Filter, and View Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search guests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Guests Display */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading guests...</p>
                  </div>
                </div>
              ) : filteredContacts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No guests found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'No guests available'}
                    </p>
                  </CardContent>
                </Card>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-lg transition-all duration-200 group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{contact.name}</h3>
                              <Badge className={`${getStatusColor(contact.status)} text-xs`}>
                                {getStatusLabel(contact.status)}
                              </Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {contact.status !== 'inactive' && (
                                <DropdownMenuItem onClick={() => handleArchiveContact(contact)}>
                                  <Archive className="w-4 h-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteContact(contact.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          {contact.company && (
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              <span>{contact.company}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>

                        {contact.notes && (
                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{contact.notes}</p>
                        )}

                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {contact.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {contact.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{contact.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{contact.name}</h3>
                                <Badge className={getStatusColor(contact.status)}>
                                  {getStatusLabel(contact.status)}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                {contact.company && (
                                  <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    <span>{contact.company}</span>
                                  </div>
                                )}
                                {contact.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span>{contact.email}</span>
                                  </div>
                                )}
                                {contact.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{contact.phone}</span>
                                  </div>
                                )}
                              </div>

                              {contact.notes && (
                                <p className="text-sm text-muted-foreground mt-2">{contact.notes}</p>
                              )}

                              {contact.tags && contact.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {contact.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditContact(contact)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {contact.status !== 'inactive' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchiveContact(contact)}
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Guest Modal */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedContact ? 'Edit Guest' : 'Add New Guest'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter guest name"
                      />
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <Label>Company</Label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Pending</SelectItem>
                          <SelectItem value="client">Confirmed</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any notes about this guest"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveContact} className="flex-1">
                        {selectedContact ? 'Update' : 'Create'} Guest
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}

          {activeNiche === 'creator' && activeSection === 'opportunities' && (
            <motion.div
              key="creator-opportunities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <GrowthRateChart data={opportunitiesForCharts} activeNiche={activeNiche} />
            </motion.div>
          )}

          {/* Growth Section - Freelancer/Consultant */}
          {activeSection === 'growth' && activeNiche === 'freelancer' && (
            <motion.div
              key="freelancer-growth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">Growth Analytics</h1>
                <p className="text-sm text-muted-foreground">
                  Track your project growth, client acquisition, and revenue performance
                </p>
              </div>

              {/* Growth Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-0 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Opportunities</h3>
                    <div className="flex items-center gap-2">
                      <Select value={freelancerOpportunitiesPeriod} onValueChange={setFreelancerOpportunitiesPeriod}>
                        <SelectTrigger className="h-7 w-24 text-xs border border-gray-200 bg-white/80 hover:bg-white shadow-sm rounded-md px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="min-w-[120px]">
                          <SelectItem value="this-month">Month</SelectItem>
                          <SelectItem value="this-quarter">Quarter</SelectItem>
                          <SelectItem value="ytd">YTD</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                        {analyticsData?.opportunities?.total || 0} Total
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Opportunities</span>
                      <span className="font-bold text-gray-900">{analyticsData?.opportunities?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Won Opportunities</span>
                      <span className="font-bold text-gray-900">{Math.round((analyticsData?.opportunities?.conversionRate || 0) * (analyticsData?.opportunities?.total || 0) / 100)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Deal Value</span>
                      <span className="font-bold text-gray-900">${analyticsData?.opportunities?.averageValue?.toLocaleString() || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${analyticsData?.opportunities?.conversionRate || 0}%` }}></div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Clients</h3>
                    <div className="flex items-center gap-2">
                      <Select value={freelancerClientsPeriod} onValueChange={setFreelancerClientsPeriod}>
                        <SelectTrigger className="h-7 w-24 text-xs border border-gray-200 bg-white/80 hover:bg-white shadow-sm rounded-md px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="min-w-[120px]">
                          <SelectItem value="this-month">Month</SelectItem>
                          <SelectItem value="this-quarter">Quarter</SelectItem>
                          <SelectItem value="ytd">YTD</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                        {analyticsData?.clients?.total || 0} Total
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Clients</span>
                      <span className="font-bold text-gray-900">{analyticsData?.clients?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Clients</span>
                      <span className="font-bold text-gray-900">{analyticsData?.clients?.active || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${analyticsData?.clients?.total && analyticsData?.clients?.active ? (analyticsData.clients.active / analyticsData.clients.total) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Revenue</h3>
                    <div className="flex items-center gap-2">
                      <Select value={freelancerRevenuePeriod} onValueChange={setFreelancerRevenuePeriod}>
                        <SelectTrigger className="h-7 w-24 text-xs border border-gray-200 bg-white/80 hover:bg-white shadow-sm rounded-md px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="min-w-[120px]">
                          <SelectItem value="this-month">Month</SelectItem>
                          <SelectItem value="this-quarter">Quarter</SelectItem>
                          <SelectItem value="ytd">YTD</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        +{analyticsData?.revenue?.growthRate || 0}%
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="font-bold text-gray-900">${analyticsData?.revenue?.total?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Monthly Revenue</span>
                      <span className="font-bold text-gray-900">${analyticsData?.revenue?.monthly?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Deal Size</span>
                      <span className="font-bold text-gray-900">${analyticsData?.revenue?.averageDealSize?.toLocaleString() || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${analyticsData?.revenue?.growthRate || 0}%` }}></div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Detailed Growth Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-0 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Project Performance</h3>
                    <Select defaultValue="6months">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">3 Months</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="12months">12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Web Development</div>
                        <div className="text-sm text-gray-500">Most profitable</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">$28,400</div>
                        <div className="text-sm text-green-600">+32%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Consulting</div>
                        <div className="text-sm text-gray-500">High value</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">$24,600</div>
                        <div className="text-sm text-green-600">+28%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Design Services</div>
                        <div className="text-sm text-gray-500">Steady demand</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">$18,200</div>
                        <div className="text-sm text-green-600">+19%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Strategy Planning</div>
                        <div className="text-sm text-gray-500">Premium service</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">$15,800</div>
                        <div className="text-sm text-green-600">+25%</div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-0 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Client Acquisition</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Growing
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Referrals</div>
                        <div className="text-sm text-gray-500">Client recommendations</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">42%</div>
                        <div className="text-sm text-green-600">+15%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">LinkedIn</div>
                        <div className="text-sm text-gray-500">Professional network</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">28%</div>
                        <div className="text-sm text-green-600">+12%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Direct Outreach</div>
                        <div className="text-sm text-gray-500">Proactive sales</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">18%</div>
                        <div className="text-sm text-green-600">+8%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Portfolio Site</div>
                        <div className="text-sm text-gray-500">Organic discovery</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">12%</div>
                        <div className="text-sm text-green-600">+5%</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Additional Freelancer Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-0 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Utilization & Efficiency</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Optimal
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Billable Hours</div>
                        <div className="text-sm text-gray-500">This month</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">142 hrs</div>
                        <div className="text-sm text-green-600">+18%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Utilization Rate</div>
                        <div className="text-sm text-gray-500">Time efficiency</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">85%</div>
                        <div className="text-sm text-green-600">+5%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Project Completion</div>
                        <div className="text-sm text-gray-500">On-time delivery</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">94%</div>
                        <div className="text-sm text-green-600">+3%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Client Satisfaction</div>
                        <div className="text-sm text-gray-500">Average rating</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">4.8/5</div>
                        <div className="text-sm text-green-600">+0.2</div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-0 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Market Position</h3>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Strong
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Industry Average Rate</div>
                        <div className="text-sm text-gray-500">Market benchmark</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">$95/hr</div>
                        <div className="text-sm text-green-600">+32% above</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Repeat Clients</div>
                        <div className="text-sm text-gray-500">Loyalty indicator</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">68%</div>
                        <div className="text-sm text-green-600">+12%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Project Pipeline</div>
                        <div className="text-sm text-gray-500">Upcoming work</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">$156K</div>
                        <div className="text-sm text-green-600">+45%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">Market Demand</div>
                        <div className="text-sm text-gray-500">Industry growth</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">High</div>
                        <div className="text-sm text-green-600">+18%</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>


            </motion.div>
          )}

      </AnimatePresence>
        
        {/* Floating Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300"
            onClick={() => {
              // Add screenshot functionality or export
              console.log('Screenshot this fire dashboard!');
            }}
          >
            <Share2 className="w-6 h-6" />
          </Button>
        </motion.div>
        

      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
