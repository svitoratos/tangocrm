"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Calendar as CalendarIcon, 
  Plus, 
  Activity,
  Clock,
  ChevronDown,
  MoreVertical,
  ArrowUpRight,
  UserPlus,
  CheckSquare,
  PlayCircle,
  Upload,
  Camera,
  Mic,
  FileText,
  Video,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp as Growth,
  Zap,
  Coffee,
  BookOpen,
  Headphones,
  PenTool,
  Filter,
  Check,
  ExternalLink,
  CalendarClock,
  Mail,
  Phone,
  FileX,
  AlertCircle,
  BarChart,
  Settings,
  Radio,
  Rocket,
  Crown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import OpportunityModal from './opportunity-modal'
import { EventCreationModal } from './event-creation-modal'
import { DateUtils } from '@/lib/date-utils'
import { fetchClients } from '@/lib/client-service'
import { useRevenueType } from '@/contexts/RevenueTypeContext'

interface MetricCardProps {
  title: string
  value: string
  change?: number
  icon: React.ComponentType<{ className?: string }>
  trend: 'up' | 'down'
  color: 'emerald' | 'orange' | 'blue' | 'purple' | 'cyan'
  subtitle?: string
  onClick?: () => void
  activeNiche?: string
  showPeriodFilter?: boolean
  period?: string
  onPeriodChange?: (period: string) => void
  showRevenueTypeFilter?: boolean
  revenueType?: 'gross' | 'net'
  onRevenueTypeChange?: (type: 'gross' | 'net') => void
}

interface ActivityItem {
  id: string
  type: 'opportunity' | 'meeting' | 'task' | 'client' | 'content' | 'session' | 'episode'
  title: string
  description: string
  timestamp: string
  user: string
  niche?: string
}

interface TaskItem {
  id: string
  brandName: string
  taskType: string
  description: string
  dueTime: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  linkedTo: 'crm' | 'calendar'
  color?: string
}

interface DashboardOverviewProps {
  activeNiche?: string
  onNavigate?: (section: string) => void
  userName?: string
}

const colorClasses = {
  emerald: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  cyan: 'from-cyan-500 to-cyan-600'
} as const

const gradientClasses = {
  emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
  orange: 'bg-gradient-to-br from-orange-50 to-orange-100',
  blue: 'bg-gradient-to-br from-blue-50 to-blue-100',
  purple: 'bg-gradient-to-br from-purple-50 to-purple-100',
  cyan: 'bg-gradient-to-br from-cyan-50 to-cyan-100'
} as const

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend, 
  color,
  subtitle,
  onClick,
  activeNiche = 'creator',
  showPeriodFilter = false,
  period,
  onPeriodChange,
  showRevenueTypeFilter = false,
  revenueType,
  onRevenueTypeChange
}) => {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`${onClick ? 'cursor-pointer' : ''} group`}
      onClick={onClick}
    >
      <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative h-48 w-full ${
        activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
          ? gradientClasses[color as keyof typeof gradientClasses] || gradientClasses.emerald
          : 'bg-card border border-border hover:shadow-lg'
      }`}>
        {/* Animated background gradient for all niches */}
        {(activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer') && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <motion.div 
              className={`${title === 'Growth Rate' ? 'p-1 rounded' : 'p-2 rounded-lg'} bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses] || colorClasses.emerald} text-white ${title === 'Growth Rate' ? 'shadow-sm' : 'shadow-lg'}`}
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className={title === 'Growth Rate' ? 'w-4 h-4' : 'w-5 h-5'} />
            </motion.div>
            {change !== undefined && (
              <motion.div 
                className="flex items-center space-x-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {trend === 'up' ? (
                  <TrendingUp className={title === 'Growth Rate' ? 'w-2 h-2' : 'w-3 h-3'} />
                ) : (
                  <TrendingDown className={title === 'Growth Rate' ? 'w-2 h-2' : 'w-3 h-3'} />
                )}
                <span className={`text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {change > 0 ? '+' : ''}{change}%
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
          
          {/* Period Filter Dropdown */}
          {showPeriodFilter && onPeriodChange && (
            <div className="mt-auto pt-2">
              <Select value={period} onValueChange={onPeriodChange}>
                <SelectTrigger className="h-8 text-xs bg-white/80 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="ytd">YTD</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Custom Date Range Selector */}
              {period === 'custom' && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-gray-600">From:</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-[80px] justify-start text-left font-normal text-xs"
                        >
                          {fromDate ? format(fromDate, "MM/dd") : "Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          onSelect={setFromDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-gray-600">To:</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-[80px] justify-start text-left font-normal text-xs"
                        >
                          {toDate ? format(toDate, "MM/dd") : "Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          onSelect={setToDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Revenue Type Filter Dropdown */}
          {showRevenueTypeFilter && onRevenueTypeChange && (
            <div className="mt-auto pt-2">
              <Select value={revenueType} onValueChange={onRevenueTypeChange}>
                <SelectTrigger className="h-8 text-xs bg-white/80 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gross">Gross Revenue</SelectItem>
                  <SelectItem value="net">Net Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          

        </div>
      </Card>
    </motion.div>
  )
}

const TodayTaskItem: React.FC<{ task: TaskItem, onComplete: (id: string) => void, onNavigate: (section: string) => void }> = ({ 
  task, 
  onComplete, 
  onNavigate 
}) => {
  const getPriorityColor = () => {
    // Use calendar event color if available
    if (task.color) {
      const colorMap: { [key: string]: string } = {
        'blue': 'border-l-blue-500 bg-blue-50/50',
        'green': 'border-l-green-500 bg-green-50/50',
        'orange': 'border-l-orange-500 bg-orange-50/50',
        'purple': 'border-l-purple-500 bg-purple-50/50',
        'yellow': 'border-l-yellow-500 bg-yellow-50/50',
        'red': 'border-l-red-500 bg-red-50/50'
      };
      return colorMap[task.color] || 'border-l-gray-500 bg-gray-50/50';
    }
    
    // Special styling for meetings
    if (task.taskType === 'meeting') {
      return 'border-l-orange-500 bg-orange-50/50'
    }
    
    switch (task.priority) {
      case 'high': return 'border-l-red-500 bg-red-50/50'
      case 'medium': return 'border-l-orange-500 bg-orange-50/50'
      case 'low': return 'border-l-blue-500 bg-blue-50/50'
    }
  }

  const getTaskIcon = () => {
    switch (task.taskType) {
      case 'email': return <Mail className="h-4 w-4 text-emerald-600" />
      case 'call': return <Phone className="h-4 w-4 text-orange-600" />
      case 'follow-up': return <ArrowUpRight className="h-4 w-4 text-blue-600" />
      case 'content': return <Camera className="h-4 w-4 text-purple-600" />
      case 'proposal': return <FileText className="h-4 w-4 text-indigo-600" />
      case 'planning': return <CalendarIcon className="h-4 w-4 text-cyan-600" />
      case 'meeting': return <CalendarIcon className="h-4 w-4 text-orange-600" />
      default: return <CheckSquare className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: task.completed ? 0.6 : 1, x: 0 }}
      className={`border-l-4 ${getPriorityColor()} p-4 rounded-r-lg hover:shadow-sm transition-all ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onComplete(task.id)}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {getTaskIcon()}
              <span className="font-medium text-foreground">{task.brandName}</span>
              <Badge variant="outline" className="text-xs">
                {task.taskType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {task.dueTime}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(task.linkedTo)}
                className="text-xs text-emerald-600 hover:text-emerald-700 p-0 h-auto"
              >
                Open in {task.linkedTo.toUpperCase()}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const ActivityItem: React.FC<{ activity: ActivityItem, onNavigate?: (section: string) => void }> = ({ activity, onNavigate }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'opportunity': return <Target className="h-4 w-4 text-emerald-600" />
      case 'meeting': return <CalendarIcon className="h-4 w-4 text-orange-600" />
      case 'task': return <CheckSquare className="h-4 w-4 text-blue-600" />
      case 'client': return <UserPlus className="h-4 w-4 text-purple-600" />
      case 'content': return <Camera className="h-4 w-4 text-pink-600" />
      case 'session': return <Coffee className="h-4 w-4 text-green-600" />
      case 'episode': return <Mic className="h-4 w-4 text-amber-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = () => {
    switch (activity.type) {
      case 'opportunity': return 'bg-emerald-50'
      case 'meeting': return 'bg-orange-50'
      case 'task': return 'bg-blue-50'
      case 'client': return 'bg-purple-50'
      case 'content': return 'bg-pink-50'
      case 'session': return 'bg-green-50'
      case 'episode': return 'bg-amber-50'
      default: return 'bg-gray-50'
    }
  }

  const handleActivityClick = () => {
    switch (activity.type) {
      case 'opportunity':
      case 'client':
        onNavigate?.('crm')
        break
      case 'meeting':
      case 'task':
      case 'session':
        onNavigate?.('calendar')
        break
      case 'content':
      case 'episode':
        onNavigate?.('programs')
        break
      default:
        onNavigate?.('analytics')
    }
  }

  return (
    <div 
      className="flex items-start space-x-3 p-4 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer"
      onClick={handleActivityClick}
    >
      <div className={`p-2 rounded-lg ${getActivityColor()}`}>
        {getActivityIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{activity.title}</p>
        <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{activity.user}</span>
          {activity.niche && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <Badge variant="outline" className="text-xs h-4">
                {activity.niche}
              </Badge>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardOverview({ 
  activeNiche = 'creator',
  onNavigate = () => {},
  userName = 'User'
}: DashboardOverviewProps) {
  console.log('DashboardOverview rendered with activeNiche:', activeNiche);
  
  // Modal states for quick actions
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [isCreateContentModalOpen, setIsCreateContentModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isCreateProgramModalOpen, setIsCreateProgramModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [activePeriodType, setActivePeriodType] = useState<'revenue' | 'growth'>('revenue');
  
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [todaysTasks, setTodaysTasks] = useState<TaskItem[]>([]);
  const [todaysMeetings, setTodaysMeetings] = useState<TaskItem[]>([]);
  const [opportunitiesCount, setOpportunitiesCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);

  const [totalGrossRevenue, setTotalGrossRevenue] = useState(0);
  const [totalNetRevenue, setTotalNetRevenue] = useState(0);
  const { revenueType: revenueDisplayType, setRevenueType: setRevenueDisplayType } = useRevenueType();
  const [growthRate, setGrowthRate] = useState(0);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [episodesCount, setEpisodesCount] = useState(0);
  const [guestsCount, setGuestsCount] = useState(0);
  
  // Task form state
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    taskType: 'content' as string,
    dueDate: '',
    dueTime: '',
    notes: '',
    reminder: false
  });
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  
  // Period filter states
  const [revenuePeriod, setRevenuePeriod] = useState('this-quarter');
  const [growthPeriod, setGrowthPeriod] = useState('this-quarter');
  const [growthType, setGrowthType] = useState('revenue');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Function to load metrics data
  const loadMetricsData = async () => {
      console.log('Dashboard loadMetricsData called for niche:', activeNiche);
      try {
        // Load opportunities count
        console.log('Fetching opportunities for niche:', activeNiche);
        const opportunitiesResponse = await fetch(`/api/opportunities?niche=${activeNiche}`);
        console.log('Opportunities response status:', opportunitiesResponse.status);
        if (!opportunitiesResponse.ok) {
          console.error('Opportunities fetch failed:', opportunitiesResponse.status, opportunitiesResponse.statusText);
          // Don't throw error, just set empty data
          setOpportunitiesCount(0);
          setGrowthRate(0);
          return;
        }
        const opportunities = await opportunitiesResponse.json();
        const activeOpportunities = opportunities.filter((opp: any) => 
          !['won', 'lost'].includes(opp.status)
        );
        setOpportunitiesCount(activeOpportunities.length);

        // Calculate revenue from won opportunities (include 'paid' status for coach niche)
        const wonOpportunities = opportunities.filter((opp: any) => {
          if (activeNiche === 'coach') {
            return opp.status === 'won' || opp.status === 'paid';
          }
          return opp.status === 'won';
        });
        
        // Calculate gross and net revenue
        let grossRevenue = 0;
        let netRevenue = 0;
        
        wonOpportunities.forEach((opp: any) => {
          const dealValue = opp.value || 0;
          const customFields = opp.customFields || {};
          const revenueSplits = customFields.revenueSplits || [];
          
          // Calculate gross revenue (total deal value)
          grossRevenue += dealValue;
          
          // Calculate net revenue (after revenue splits)
          let totalDeductions = 0;
          revenueSplits.forEach((split: any) => {
            if (split.amount && split.amount > 0) {
              if (split.type === '%') {
                totalDeductions += (dealValue * split.amount / 100);
              } else if (split.type === '$') {
                totalDeductions += split.amount;
              }
            }
          });
          
          netRevenue += Math.max(0, dealValue - totalDeductions);
        });
        
        setTotalGrossRevenue(grossRevenue);
        setTotalNetRevenue(netRevenue);


        // Calculate growth rate (percentage of won opportunities)
        const totalOpportunities = opportunities.length;
        const growthRate = totalOpportunities > 0 ? (wonOpportunities.length / totalOpportunities) * 100 : 0;
        setGrowthRate(growthRate);

        // Load clients count
        try {
          const clients = await fetchClients(activeNiche);
          console.log('Dashboard - Clients loaded for', activeNiche, ':', clients.length, 'clients');
          setClientsCount(clients.length);
        } catch (error) {
          console.error('Failed to fetch clients:', error);
          setClientsCount(0);
        }

        // Load content items for podcaster niche (episodes and guests)
        if (activeNiche === 'podcaster') {
          try {
            const contentResponse = await fetch(`/api/content-items?niche=${activeNiche}`);
            if (contentResponse.ok) {
              const contentItems = await contentResponse.json();
              // Store episodes count and unique guests for use in metrics
              const episodesCount = contentItems.length;
              const uniqueGuests = new Set(contentItems.filter((item: any) => item.guest).map((item: any) => item.guest)).size;
              // Store these values in state for use in metrics
              setEpisodesCount(episodesCount);
              setGuestsCount(uniqueGuests);
            } else {
              console.error('Content items fetch failed:', contentResponse.status, contentResponse.statusText);
            }
          } catch (error) {
            console.error('Error fetching content items:', error);
          }
        }

        // Load calendar events
        let calendarEvents: any[] = [];
        try {
          const calendarResponse = await fetch(`/api/calendar-events?niche=${activeNiche}`);
          if (calendarResponse.ok) {
            calendarEvents = await calendarResponse.json();
          } else {
            console.error('Calendar events fetch failed:', calendarResponse.status, calendarResponse.statusText);
          }
        } catch (error) {
          console.error('Error fetching calendar events:', error);
        }

        // Create tasks from opportunities and calendar events
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        // Convert opportunities to tasks
        const opportunityTasks: TaskItem[] = opportunities.slice(0, 2).map((opp: any, index: number) => ({
          id: `task-opp-${opp.id || index}`,
          brandName: opp.title,
          taskType: 'follow-up',
          description: `Follow up on ${opp.title} opportunity`,
          dueTime: new Date(Date.now() + (index + 1) * 2 * 60 * 60 * 1000).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          priority: 'medium' as const,
          completed: false,
          linkedTo: 'crm' as const
        }));

        // Convert calendar events to tasks
        const userTimezone = DateUtils.getUserTimezone();
        const calendarTasks: TaskItem[] = calendarEvents
          .filter((event: any) => {
            const eventDate = DateUtils.toUserTimezone(new Date(event.start_time), userTimezone) || new Date(event.start_time);
            return eventDate >= todayStart && eventDate < todayEnd;
          })
          .map((event: any) => ({
            id: `task-cal-${event.id}`,
            brandName: event.title,
            taskType: event.type === 'meeting' ? 'meeting' : 'content',
            description: event.description || `${event.type} event`,
            dueTime: DateUtils.formatTime(new Date(event.start_time), userTimezone),
            priority: 'high' as const,
            completed: false,
            linkedTo: 'calendar' as const,
            color: event.color
          }));

        // Separate meetings from other tasks
        const meetings = calendarTasks.filter(task => task.taskType === 'meeting');
        const otherTasks = [...opportunityTasks, ...calendarTasks.filter(task => task.taskType !== 'meeting')];

        // Sort tasks by time
        const sortedTasks = otherTasks.sort((a, b) => {
          const timeA = new Date(`2000-01-01 ${a.dueTime}`).getTime();
          const timeB = new Date(`2000-01-01 ${b.dueTime}`).getTime();
          return timeA - timeB;
        });

        // Sort meetings by time
        const sortedMeetings = meetings.sort((a, b) => {
          const timeA = new Date(`2000-01-01 ${a.dueTime}`).getTime();
          const timeB = new Date(`2000-01-01 ${b.dueTime}`).getTime();
          return timeA - timeB;
        });

        setTodaysTasks(sortedTasks);
        setTodaysMeetings(sortedMeetings);

        // Generate real activities from opportunities and calendar events
        const activities: ActivityItem[] = [];
        
        // Helper function to format time ago
        const formatTimeAgo = (date: Date) => {
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHours / 24);
          
          if (diffHours < 1) return 'Just now';
          if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
          if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        };
        
        // Add recent opportunities as activities
        const recentOpportunities = opportunities.slice(0, 3);
        recentOpportunities.forEach((opp: any) => {
          const updatedAt = new Date(opp.updated_at || opp.created_at);
          
          activities.push({
            id: `opp-${opp.id}`,
            type: 'opportunity',
            title: `${opp.title} ${opp.status === 'won' ? 'Won!' : 'Updated'}`,
            description: opp.status === 'won' 
              ? `Successfully closed $${opp.value?.toLocaleString()} ${opp.title} deal`
              : `Updated ${opp.title} opportunity status to ${opp.status}`,
            timestamp: formatTimeAgo(updatedAt),
            user: 'You',
            niche: activeNiche
          });
        });

        // Add recent calendar events as activities
        const recentEvents = calendarEvents.slice(0, 2);
        recentEvents.forEach((event: any) => {
          const eventDate = new Date(event.start_time || event.created_at);
          
          activities.push({
            id: `event-${event.id}`,
            type: event.type === 'meeting' ? 'meeting' : 'task',
            title: `${event.title} ${event.type === 'meeting' ? 'Scheduled' : 'Created'}`,
            description: event.description || `${event.type} event`,
            timestamp: formatTimeAgo(eventDate),
            user: 'You',
            niche: activeNiche
          });
        });

        // Sort activities by actual timestamp (most recent first)
        activities.sort((a, b) => {
          const timeMap: { [key: string]: number } = {
            'Just now': 0,
            '1 hour ago': 1,
            '2 hours ago': 2,
            '3 hours ago': 3,
            '4 hours ago': 4,
            '5 hours ago': 5,
            '6 hours ago': 6,
            '7 hours ago': 7,
            '8 hours ago': 8,
            '9 hours ago': 9,
            '10 hours ago': 10,
            '11 hours ago': 11,
            '12 hours ago': 12,
            '1 day ago': 24,
            '2 days ago': 48,
            '3 days ago': 72,
            '4 days ago': 96,
            '5 days ago': 120,
            '6 days ago': 144,
            '1 week ago': 168,
            '2 weeks ago': 336,
            '3 weeks ago': 504,
            '4 weeks ago': 672
          };
          return (timeMap[a.timestamp] || 0) - (timeMap[b.timestamp] || 0);
        });

        setRecentActivities(activities.slice(0, 5)); // Show top 5 activities

      } catch (error) {
        console.error('Error loading metrics data:', error);
        // Set empty arrays on error
        setOpportunitiesCount(0);
        setClientsCount(0);
        setTodaysTasks([]);
        setTodaysMeetings([]);
        setRecentActivities([]);
      }
    };

  // Load real data for today's activities
  useEffect(() => {
    loadMetricsData();
  }, [activeNiche]);

  // Calculate displayed revenue using useMemo for immediate updates
  const totalRevenue = useMemo(() => {
    return revenueDisplayType === 'gross' ? totalGrossRevenue : totalNetRevenue;
  }, [revenueDisplayType, totalGrossRevenue, totalNetRevenue]);

  // Refresh data when component becomes visible (e.g., when navigating back to dashboard)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadMetricsData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeNiche]);

  // Add refresh mechanism - reload data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadMetricsData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [activeNiche]);

  // Refresh data when user returns to the dashboard (e.g., after updating an opportunity)
  useEffect(() => {
    const handleFocus = () => {
      loadMetricsData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeNiche]);

  const handleTaskComplete = async (taskId: string) => {
    // Check if this is a calendar event task
    if (taskId.startsWith('task-cal-')) {
      const eventId = taskId.replace('task-cal-', '');
      
      try {
        // Update the calendar event status
        const response = await fetch(`/api/calendar-events`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: eventId,
            status: 'completed'
          }),
        });

        if (!response.ok) {
          console.error('Failed to update calendar event status');
        }
      } catch (error) {
        console.error('Error updating calendar event:', error);
      }
    }

    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleCreateEvent = async (eventData: any) => {
    try {
      setIsCreatingEvent(true);
      
      const response = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      // Close modal and show success message
      setIsAddEventModalOpen(false);
      // You could add a toast notification here
      
    } catch (error) {
      console.error('Error creating event:', error);
      // You could add error handling here
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskFormData.title.trim()) {
      return; // Don't save if title is empty
    }

    try {
      setIsCreatingTask(true);
      
      // Combine date and time for due date
      let dueDateTime = null;
      if (taskFormData.dueDate && taskFormData.dueTime) {
        const combinedDate = new Date(`${taskFormData.dueDate}T${taskFormData.dueTime}`);
        dueDateTime = combinedDate.toISOString();
      } else if (taskFormData.dueDate) {
        const dateOnly = new Date(taskFormData.dueDate);
        dueDateTime = dateOnly.toISOString();
      }

      const taskData = {
        title: taskFormData.title,
        description: taskFormData.description,
        priority: taskFormData.priority,
        taskType: taskFormData.taskType,
        dueDate: dueDateTime,
        notes: taskFormData.notes,
        reminder: taskFormData.reminder,
        niche: activeNiche,
        status: 'pending'
      };

      // For now, we'll create a calendar event as a task
      // In the future, you might want to create a separate tasks API
      const response = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          start_time: dueDateTime || new Date().toISOString(),
          end_time: dueDateTime || new Date().toISOString(),
          type: 'task',
          color: taskData.priority === 'high' ? 'red' : taskData.priority === 'medium' ? 'orange' : 'blue',
          notes: taskData.notes,
          tags: [taskData.taskType, taskData.priority],
          niche: activeNiche,
          status: 'scheduled'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      // Reset form and close modal
      setTaskFormData({
        title: '',
        description: '',
        priority: 'medium',
        taskType: 'content',
        dueDate: '',
        dueTime: '',
        notes: '',
        reminder: false
      });
      setIsCreateTaskModalOpen(false);
      
      // Refresh data
      await loadMetricsData();
      
    } catch (error) {
      console.error('Error creating task:', error);
      // You could add error handling here
    } finally {
      setIsCreatingTask(false);
    }
  };

  const getNicheDisplayName = () => {
    const names = {
      creator: 'Content Creator',
      coach: 'Online Coach', 
      podcaster: 'Podcaster',
      freelancer: 'Freelancer'
    }
    return names[activeNiche as keyof typeof names] || 'Business'
  }

  const getPeriodSubtitle = (period: string) => {
    switch (period) {
      case 'this-month':
        return '';
      case 'this-quarter':
        return '';
      case 'ytd':
        return 'YTD';
      case 'custom':
        return customDateRange.startDate && customDateRange.endDate 
          ? `${customDateRange.startDate} - ${customDateRange.endDate}`
          : 'Custom';
      default:
        return '';
    }
  }

  const handleRevenuePeriodChange = (period: string) => {
    if (period === 'custom') {
      setActivePeriodType('revenue');
      setIsCustomDateModalOpen(true);
    } else {
      setRevenuePeriod(period);
    }
  };

  const handleGrowthPeriodChange = (period: string) => {
    if (period === 'custom') {
      setActivePeriodType('growth');
      setIsCustomDateModalOpen(true);
    } else {
      setGrowthPeriod(period);
    }
  };

  const handleGrowthTypeChange = (type: string) => {
    setGrowthType(type);
  };

  const getCreatorMetrics = () => {
    return [
      { 
        title: 'Opportunities', 
        value: opportunitiesCount.toString(), 
        change: undefined, 
        icon: Target, 
        trend: 'up' as const, 
        color: 'blue' as const,
        onClick: () => onNavigate('crm')
      },
      { 
        title: 'Brands/Clients', 
        value: clientsCount.toString(), 
        change: undefined, 
        icon: Users, 
        trend: 'up' as const, 
        color: 'purple' as const,
        onClick: () => onNavigate('clients')
      },
      { 
        title: 'Revenue', 
        value: `$${totalRevenue.toLocaleString()}`, 
        change: undefined, 
        icon: DollarSign, 
        trend: 'up' as const, 
        color: 'emerald' as const,
        subtitle: getPeriodSubtitle(revenuePeriod),
        onClick: () => onNavigate('analytics'),
        showRevenueTypeFilter: true,
        revenueType: revenueDisplayType,
        onRevenueTypeChange: setRevenueDisplayType
      },
      { 
        title: 'Rev Growth Rate', 
        value: growthType === 'revenue' ? `${growthRate.toFixed(1)}%` : `${clientsCount > 0 ? 100 : 0}%`, 
        change: undefined, 
        icon: Target, 
        trend: 'up' as const, 
        color: 'cyan' as const,
        onClick: () => onNavigate('analytics'),
        showPeriodFilter: true,
        period: growthPeriod,
        onPeriodChange: handleGrowthPeriodChange
      }
    ]
  }

  const getNicheMetrics = (niche: string) => {
    if (niche === 'creator') {
      return getCreatorMetrics()
    }
    
    switch (niche) {
      case 'coach':
        return [
          { 
            title: 'Opportunities', 
            value: opportunitiesCount.toString(), 
            change: undefined, 
            icon: Target, 
            trend: 'up' as const, 
            color: 'blue' as const,
            onClick: () => onNavigate('crm')
          },
          { 
            title: 'Clients', 
            value: clientsCount.toString(), 
            change: undefined, 
            icon: Users, 
            trend: 'up' as const, 
            color: 'emerald' as const,
            onClick: () => onNavigate('clients')
          },
          { 
            title: 'Programs', 
            value: '12', 
            change: undefined, 
            icon: Growth, 
            trend: 'up' as const, 
            color: 'purple' as const,
            onClick: () => onNavigate('analytics')
          },
          { 
            title: 'Revenue', 
            value: `$${totalRevenue.toLocaleString()}`, 
            change: undefined, 
            icon: DollarSign, 
            trend: 'up' as const, 
            color: 'orange' as const,
            subtitle: getPeriodSubtitle(revenuePeriod),
            onClick: () => onNavigate('analytics'),
            showRevenueTypeFilter: true,
            revenueType: revenueDisplayType,
            onRevenueTypeChange: setRevenueDisplayType
          }
        ]

      case 'podcaster':
        return [
          { 
            title: 'Opportunities', 
            value: opportunitiesCount.toString(), 
            change: 0, 
            icon: Target, 
            trend: 'up' as const, 
            color: 'emerald' as const,
            onClick: () => onNavigate('crm')
          },
          { 
            title: 'Episodes', 
            value: episodesCount.toString(), 
            change: 0, 
            icon: Radio, 
            trend: 'up' as const, 
            color: 'blue' as const,
            onClick: () => onNavigate('analytics')
          },
          { 
            title: 'Guests', 
            value: guestsCount.toString(), 
            change: 0, 
            icon: Growth, 
            trend: 'up' as const, 
            color: 'purple' as const,
            onClick: () => onNavigate('analytics')
          },
          { 
            title: 'Revenue', 
            value: `$${totalRevenue.toLocaleString()}`, 
            change: 0, 
            icon: DollarSign, 
            trend: 'up' as const, 
            color: 'orange' as const,
            subtitle: getPeriodSubtitle(revenuePeriod),
            onClick: () => onNavigate('analytics'),
            showRevenueTypeFilter: true,
            revenueType: revenueDisplayType,
            onRevenueTypeChange: setRevenueDisplayType
          }
        ]

      case 'freelancer':
        return [
          { 
            title: 'Opportunities', 
            value: opportunitiesCount.toString(), 
            change: undefined, 
            icon: Target, 
            trend: 'up' as const, 
            color: 'emerald' as const,
            onClick: () => onNavigate('crm')
          },
          { 
            title: 'Clients', 
            value: clientsCount.toString(), 
            change: undefined, 
            icon: Users, 
            trend: 'up' as const, 
            color: 'blue' as const,
            onClick: () => onNavigate('clients')
          },
          { 
            title: 'Revenue', 
            value: `$${totalRevenue.toLocaleString()}`, 
            change: undefined, 
            icon: DollarSign, 
            trend: 'up' as const, 
            color: 'orange' as const,
            subtitle: getPeriodSubtitle(revenuePeriod),
            onClick: () => onNavigate('analytics'),
            showRevenueTypeFilter: true,
            revenueType: revenueDisplayType,
            onRevenueTypeChange: setRevenueDisplayType
          },
          { 
            title: 'Rev Growth Rate', 
            value: growthType === 'revenue' ? `${growthRate.toFixed(1)}%` : `${clientsCount > 0 ? 100 : 0}%`, 
            change: undefined, 
            icon: Target, 
            trend: 'up' as const, 
            color: 'cyan' as const,
            onClick: () => onNavigate('analytics'),
            showPeriodFilter: true,
            period: growthPeriod,
            onPeriodChange: handleGrowthPeriodChange
          }
        ]

      default:
        return [
          { 
            title: 'Total Revenue', 
            value: `$${totalRevenue.toLocaleString()}`, 
            change: undefined, 
            icon: DollarSign, 
            trend: 'up' as const, 
            color: 'emerald' as const,
            showRevenueTypeFilter: true,
            revenueType: revenueDisplayType,
            onRevenueTypeChange: setRevenueDisplayType
          },
          { 
            title: 'Opportunities', 
            value: opportunitiesCount.toString(), 
            change: undefined, 
            icon: Target, 
            trend: 'up' as const, 
            color: 'blue' as const
          },
          { 
            title: 'Brands/Clients', 
            value: clientsCount.toString(), 
            change: undefined, 
            icon: Users, 
            trend: 'up' as const, 
            color: 'purple' as const
          },
          { 
            title: 'Rev Growth Rate', 
            value: `${growthRate.toFixed(1)}%`, 
            change: undefined, 
            icon: Target, 
            trend: 'up' as const, 
            color: 'cyan' as const,
            showPeriodFilter: true,
            period: growthPeriod,
            onPeriodChange: handleGrowthPeriodChange
          }
        ]
    }
  }



  const getQuickActions = (niche: string) => {
    switch (niche) {
      case 'creator':
        return [
          { icon: Target, label: 'Add Opportunity', action: () => setIsOpportunityModalOpen(true) },
          { icon: Camera, label: 'Content Card – For Creators & Influencers', action: () => onNavigate('content-stage/idea') },
          { icon: CheckSquare, label: 'Create Task', action: () => setIsCreateTaskModalOpen(true) }
        ]
      
      case 'coach':
        return [
          { icon: Target, label: 'Add Opportunity', action: () => setIsOpportunityModalOpen(true) },
          { icon: CheckSquare, label: 'Create Task', action: () => setIsCreateTaskModalOpen(true) },
          { icon: BookOpen, label: 'Create Program', action: () => setIsCreateProgramModalOpen(true) }
        ]
      
      case 'podcaster':
        return [
          { icon: Target, label: 'Add Opportunity', action: () => setIsOpportunityModalOpen(true) },
          { icon: CheckSquare, label: 'Create Task', action: () => setIsCreateTaskModalOpen(true) },
          { icon: CalendarIcon, label: 'Add Event', action: () => setIsAddEventModalOpen(true) }
        ]
      
      case 'freelancer':
        return [
          { icon: Target, label: 'Add Opportunity', action: () => setIsOpportunityModalOpen(true) },
          { icon: CalendarIcon, label: 'Add Event', action: () => setIsAddEventModalOpen(true) },
          { icon: CheckSquare, label: 'Create Task', action: () => setIsCreateTaskModalOpen(true) }
        ]
      
      default:
        return [
          { icon: Target, label: 'Add Opportunity', action: () => onNavigate('crm') },
          { icon: CalendarIcon, label: 'Schedule Meeting', action: () => onNavigate('calendar') },
          { icon: CheckSquare, label: 'Create Task', action: () => onNavigate('calendar') }
        ]
    }
  }

  const metrics = getNicheMetrics(activeNiche)
  const quickActions = getQuickActions(activeNiche)

  const activeTasks = todaysTasks.filter(task => 
    !completedTasks.includes(task.id)
  )

  return (
    <motion.div 
      className={`w-full overflow-hidden ${
        activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
          ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100' 
          : 'bg-background'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto p-6 space-y-8 overflow-hidden">
        {/* Header */}
        <motion.div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <motion.div 
              className="flex items-center space-x-3 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className={`text-2xl font-semibold ${
                activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer' ? 'text-slate-900' : 'text-foreground'
              }`}>
                Welcome back, {userName}!
              </h1>
            </motion.div>
            <motion.h2 
              className={`text-3xl font-bold ${
                activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
                  ? 'bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent' 
                  : 'text-foreground'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {activeNiche === 'creator' ? 'Creator Dashboard' : 'Dashboard Overview'}
            </motion.h2>
            <motion.p 
              className={`mt-1 ${
                activeNiche === 'creator' ? 'text-slate-600' : 'text-muted-foreground'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {activeNiche === 'creator' 
                ? 'Your media empire metrics and performance tracking' 
                : `${getNicheDisplayName()} metrics and performance tracking`
              }
            </motion.p>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.6 + (index * 0.1),
                type: "spring",
                stiffness: 100
              }}
            >
              <MetricCard 
                {...metric}
                activeNiche={activeNiche}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Today's Tasks and Meetings Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          {/* Today's Tasks Section */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative ${
              activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' 
                : 'bg-card border border-border'
            }`}>
              {/* Animated background gradient for all niches */}
              {(activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer') && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg mr-3">
                      <CheckSquare className="h-6 w-6" />
                    </div>
                    <h3 className={`text-xl font-semibold ${
                      activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer' ? 'text-gray-900' : 'text-foreground'
                    }`}>
                      Today's Tasks
                    </h3>
                  </div>
                                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('calendar')}
                    className="text-xs"
                  >
                    View Calendar
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {activeTasks.length > 0 ? (
                    activeTasks.map((task) => (
                      <TodayTaskItem 
                        key={task.id} 
                        task={task} 
                        onComplete={handleTaskComplete}
                        onNavigate={onNavigate}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No tasks scheduled for today</p>
                    </div>
                  )}
                </div>
                {completedTasks.length > 0 && (
                  <div className="text-sm text-center text-gray-500 mt-4 pt-4 border-t border-gray-200">
                    {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} completed today
                  </div>
                )}
              </div>
          </Card>
          </motion.div>

          {/* Today's Meetings Section */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative ${
              activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
                ? 'bg-gradient-to-br from-blue-50 to-blue-100' 
                : 'bg-card border border-border'
            }`}>
              {/* Animated background gradient for all niches */}
              {(activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer') && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg mr-3">
                      <CalendarIcon className="h-6 w-6" />
                    </div>
                    <h3 className={`text-xl font-semibold ${
                      activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer' ? 'text-gray-900' : 'text-foreground'
                    }`}>
                      Today's Meetings
                    </h3>
                  </div>
                                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('calendar')}
                    className="text-xs"
                  >
                    View Calendar
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {todaysMeetings.length > 0 ? (
                    todaysMeetings.map((meeting) => (
                      <TodayTaskItem 
                        key={meeting.id} 
                        task={meeting} 
                        onComplete={handleTaskComplete}
                        onNavigate={onNavigate}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No meetings scheduled for today</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('calendar')}
                        className="mt-3"
                      >
                        Schedule Meeting
                      </Button>
                    </div>
                  )}
                </div>
              </div>
          </Card>
          </motion.div>
        </motion.div>

        {/* Quick Actions & Recent Activity */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-fit"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {/* Quick Actions */}
          <motion.div 
            className="lg:col-span-1"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative ${
              activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
                ? 'bg-gradient-to-br from-purple-50 to-purple-100' 
                : 'bg-card border border-border'
            }`}>
              {/* Animated background gradient for all niches */}
              {(activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer') && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg mr-3">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className={`text-lg font-semibold ${
                    activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer' ? 'text-gray-900' : 'text-foreground'
                  }`}>
                    Quick Actions
                  </h3>
                </div>
                              <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.action}
                      variant={index === 0 ? "default" : "outline"}
                      className={`w-full justify-start ${
                        index === 0 
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            className="lg:col-span-2"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative ${
              activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer'
                ? 'bg-gradient-to-br from-cyan-50 to-cyan-100' 
                : 'bg-card border border-border'
            }`}>
              {/* Animated background gradient for all niches */}
              {(activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer') && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg mr-3">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h3 className={`text-lg font-semibold ${
                    activeNiche === 'creator' || activeNiche === 'coach' || activeNiche === 'podcaster' || activeNiche === 'freelancer' ? 'text-gray-900' : 'text-foreground'
                  }`}>
                    Recent Activity
                  </h3>
                </div>
                              <div className="divide-y divide-gray-200">
                  {recentActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} onNavigate={onNavigate} />
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Add bottom padding to ensure full scrollability */}
        <div className="pb-8" />
      </div>

      {/* Opportunity Modal */}
      <OpportunityModal
        isOpen={isOpportunityModalOpen}
        onClose={() => setIsOpportunityModalOpen(false)}
        opportunity={null} // Always pass null for new opportunities
        onSave={async (comprehensiveData) => {
          console.log('Dashboard - handleOpportunitySave called with comprehensiveData:', comprehensiveData);
          try {
            console.log('Dashboard - Received comprehensive data:', comprehensiveData);
            
            // The comprehensiveData is already in the correct format with title, description, etc.
            // Store the original stage ID in the notes field as JSON metadata
            const originalNotes = comprehensiveData.notes || '';
            const notesWithMetadata = {
              notes: originalNotes,
              stageId: comprehensiveData.status,
              niche: activeNiche
            };
            
            const opportunityData = {
              title: comprehensiveData.title,
              description: comprehensiveData.description,
              value: comprehensiveData.value,
              status: comprehensiveData.status === 'outreach' ? 'prospecting' : 
                     comprehensiveData.status === 'awaiting' ? 'qualification' : 
                     comprehensiveData.status === 'contract' ? 'proposal' : 
                     comprehensiveData.status === 'negotiation' ? 'negotiation' : 
                     comprehensiveData.status === 'paid' ? 'won' : 
                     comprehensiveData.status === 'archived' ? 'lost' : 'prospecting',
              type: comprehensiveData.type,
              probability: comprehensiveData.probability,
              expected_close_date: comprehensiveData.expected_close_date,
              notes: JSON.stringify(notesWithMetadata),
              tags: comprehensiveData.tags,
              niche: activeNiche,
              customFields: comprehensiveData.customFields
            };
            
            console.log('Dashboard - Using opportunity data:', opportunityData);
            console.log('Dashboard - customFields being sent:', opportunityData.customFields);
            
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
            
            const savedOpportunity = await response.json();
            console.log('Dashboard - Successfully saved opportunity:', savedOpportunity);
            
            // Close the modal
            setIsOpportunityModalOpen(false);
            
            // Refresh the metrics data to show the new opportunity
            await loadMetricsData();
            
          } catch (error) {
            console.error('Dashboard - Error saving opportunity:', error);
            // You might want to show an error message to the user here
          }
        }}
        userNiche={activeNiche}
      />

      {/* Create Content Modal */}
      <Dialog open={isCreateContentModalOpen} onOpenChange={setIsCreateContentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Content Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="contentTitle">Content Title</Label>
                <Input
                  id="contentTitle"
                  placeholder="e.g. 'Sponsored Reel for Nike' or 'Tutorial Video'"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select>
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postType">Post Type</Label>
                  <Select>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand (if sponsored)</Label>
                <Input
                  id="brand"
                  placeholder="e.g. 'Nike', 'Sephora', etc."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Creative & Strategy
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="hook">Hook/Opening</Label>
                <Textarea
                  id="hook"
                  placeholder="What will grab attention in the first 3 seconds?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="concept">Content Concept</Label>
                <Textarea
                  id="concept"
                  placeholder="Describe the main concept and key points"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtags">Hashtags</Label>
                <Input
                  id="hashtags"
                  placeholder="#fitness #motivation #lifestyle"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Schedule & Workflow
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creationDate">Creation Date</Label>
                  <Input
                    id="creationDate"
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Input
                    id="publishDate"
                    type="date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Analytics & Performance
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="views">Target Views</Label>
                  <Input
                    id="views"
                    type="number"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="likes">Target Likes</Label>
                  <Input
                    id="likes"
                    type="number"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comments">Target Comments</Label>
                  <Input
                    id="comments"
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Notes & Extras
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes or requirements"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Modal */}
      <Dialog open={isCreateTaskModalOpen} onOpenChange={setIsCreateTaskModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                Task Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="taskTitle">Task Title</Label>
                <Input
                  id="taskTitle"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})}
                  placeholder="e.g. 'Review brand guidelines' or 'Edit video content'"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskDescription">Description</Label>
                <Textarea
                  id="taskDescription"
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                  placeholder="Describe what needs to be done"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskPriority">Priority</Label>
                  <Select value={taskFormData.priority} onValueChange={(value) => setTaskFormData({...taskFormData, priority: value as 'low' | 'medium' | 'high'})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskType">Task Type</Label>
                  <Select value={taskFormData.taskType} onValueChange={(value) => setTaskFormData({...taskFormData, taskType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Content Creation</SelectItem>
                      <SelectItem value="editing">Editing</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="meeting">Meeting Prep</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taskDueDate">Due Date</Label>
                  <Input
                    id="taskDueDate"
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({...taskFormData, dueDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskDueTime">Due Time</Label>
                  <Input
                    id="taskDueTime"
                    type="time"
                    value={taskFormData.dueTime}
                    onChange={(e) => setTaskFormData({...taskFormData, dueTime: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Additional Settings
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="taskNotes">Notes</Label>
                <Textarea
                  id="taskNotes"
                  value={taskFormData.notes}
                  onChange={(e) => setTaskFormData({...taskFormData, notes: e.target.value})}
                  placeholder="Any additional notes or context"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="reminder" 
                  checked={taskFormData.reminder}
                  onCheckedChange={(checked) => setTaskFormData({...taskFormData, reminder: checked as boolean})}
                />
                <Label htmlFor="reminder">Set reminder</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTask} 
              disabled={isCreatingTask || !taskFormData.title.trim()}
            >
              {isCreatingTask ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Program Modal */}
      <Dialog open={isCreateProgramModalOpen} onOpenChange={setIsCreateProgramModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Program Details
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="programName">Program Name</Label>
                <Input
                  id="programName"
                  placeholder="e.g. 'Business Acceleration Program' or 'Life Balance Mastery'"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="programType">Program Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1on1">1-on-1 Coaching</SelectItem>
                      <SelectItem value="group">Group Coaching</SelectItem>
                      <SelectItem value="mastermind">Mastermind</SelectItem>
                      <SelectItem value="course">Online Course</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="programStatus">Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Structure & Curriculum
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="programOverview">Program Overview</Label>
                <Textarea
                  id="programOverview"
                  placeholder="Describe the program structure, goals, and outcomes"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionCount">Number of Sessions</Label>
                  <Input
                    id="sessionCount"
                    type="number"
                    placeholder="e.g. 12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryFormat">Delivery Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Calls</SelectItem>
                      <SelectItem value="inperson">In-Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="selfpaced">Self-Paced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing & Sales Info
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentOptions">Payment Options</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select options" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Payment</SelectItem>
                      <SelectItem value="installments">Installments</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Creation Modal */}
      <EventCreationModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        onSave={handleCreateEvent}
        activeNiche={activeNiche}
        isLoading={isCreatingEvent}
      />

      {/* Custom Date Range Modal */}
      <Dialog open={isCustomDateModalOpen} onOpenChange={setIsCustomDateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Custom Date Range</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange(prev => ({
                    ...prev,
                    endDate: e.target.value
                  }))}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCustomDateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (customDateRange.startDate && customDateRange.endDate) {
                    if (activePeriodType === 'revenue') {
                      setRevenuePeriod('custom');
                    } else {
                      setGrowthPeriod('custom');
                    }
                    setIsCustomDateModalOpen(false);
                  }
                }}
                disabled={!customDateRange.startDate || !customDateRange.endDate}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
