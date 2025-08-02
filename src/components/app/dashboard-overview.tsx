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
  Crown,
  Brain,
  CalendarCheck,
  Edit,
  User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, isToday, isValid } from 'date-fns'
import OpportunityModal from './opportunity-modal'
import { EventCreationModal } from './event-creation-modal'
import ContactFormModal from './contact-form-modal'
import { DateUtils } from '@/lib/date-utils'
import { fetchClients } from '@/lib/client-service'
import { useRevenueType } from '@/contexts/RevenueTypeContext'
import { useEventRefresh } from '@/contexts/EventRefreshContext'
import { useUser } from '@clerk/nextjs'
import { usePaymentStatus } from '@/hooks/use-payment-status'

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
          

          
          {/* Filter Dropdowns */}
          {(showRevenueTypeFilter && onRevenueTypeChange) || (showPeriodFilter && onPeriodChange) ? (
            <div className="mt-auto pt-2 flex gap-2">
              {/* Revenue Type Filter Dropdown */}
              {showRevenueTypeFilter && onRevenueTypeChange && (
                <Select value={revenueType} onValueChange={onRevenueTypeChange}>
                  <SelectTrigger className="h-8 text-xs bg-white/80 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gross">Gross Revenue</SelectItem>
                    <SelectItem value="net">Net Revenue</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              {/* Period Filter Dropdown */}
              {showPeriodFilter && onPeriodChange && (
                <Select value={period} onValueChange={onPeriodChange}>
                  <SelectTrigger className="h-8 text-xs bg-white/80 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">Month</SelectItem>
                    <SelectItem value="this-quarter">Quarter</SelectItem>
                    <SelectItem value="this-year">YTD</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : null}
          

        </div>
      </Card>
    </motion.div>
  )
}

const TodayMeetingItem: React.FC<{ meeting: any, onEdit: (meeting: any) => void, onComplete: (meetingId: string) => void }> = ({ 
  meeting, 
  onEdit,
  onComplete
}) => {
  // Validate meeting object
  if (!meeting || typeof meeting !== 'object') {
    console.error('Invalid meeting object:', meeting);
    return null;
  }

  if (!meeting.title || !meeting.start) {
    console.error('Meeting missing required properties:', meeting);
    return null;
  }
  const getMeetingIcon = () => {
    if (meeting.type === 'opportunity') {
      return <DollarSign className="h-4 w-4 text-green-600" />;
    }
    return <CalendarIcon className="h-4 w-4 text-blue-600" />;
  };

  const getMeetingColor = () => {
    if (meeting.type === 'opportunity') {
      return 'bg-green-100 border-green-200';
    }
    return 'bg-blue-100 border-blue-200';
  };

  const formatMeetingTime = (date: Date) => {
    try {
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting meeting time:', error);
      return 'Invalid time';
    }
  };

  const getMeetingSubtitle = () => {
    try {
      if (meeting.type === 'opportunity') {
        return `$${meeting.value || 0} - ${meeting.status || 'unknown'}`;
      }
      return `${meeting.eventType || 'meeting'} - ${formatMeetingTime(meeting.start)}`;
    } catch (error) {
      console.error('Error getting meeting subtitle:', error);
      return 'meeting - Invalid time';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-3 rounded-lg border ${getMeetingColor()} hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {getMeetingIcon()}
              <span className="font-medium text-foreground">{meeting.title}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {getMeetingSubtitle()}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {meeting.start ? formatMeetingTime(meeting.start) : 'Invalid time'}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(meeting)}
                  className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  Edit Meeting
                  <Edit className="h-3 w-3 ml-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComplete(meeting.id)}
                  className="text-xs text-green-600 hover:text-green-700 p-0 h-auto"
                >
                  Complete
                  <CheckSquare className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TodayTaskItem: React.FC<{ task: TaskItem, onEdit: (task: TaskItem) => void, onComplete: (taskId: string) => void }> = ({ 
  task, 
  onEdit,
  onComplete
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
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  Edit Task
                  <Edit className="h-3 w-3 ml-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComplete(task.id)}
                  className="text-xs text-green-600 hover:text-green-700 p-0 h-auto"
                >
                  Task Complete
                  <CheckSquare className="h-3 w-3 ml-1" />
                </Button>
              </div>
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
  const { user } = useUser();
  const { niches: subscribedNiches, refreshPaymentStatus, clearCache } = usePaymentStatus();
  const { onEventRefresh, triggerRefresh } = useEventRefresh();
  console.log('DashboardOverview rendered with activeNiche:', activeNiche);
  
  // Modal states for quick actions
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [isCreateContentModalOpen, setIsCreateContentModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isCreateProgramModalOpen, setIsCreateProgramModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [activePeriodType, setActivePeriodType] = useState<'revenue' | 'growth'>('revenue');
  
  // Client conversion modal state
  const [showClientConversionModal, setShowClientConversionModal] = useState(false);
  const [convertedOpportunity, setConvertedOpportunity] = useState<any>(null);
  
  // Contact form state
  const [showContactFormModal, setShowContactFormModal] = useState(false);
  const [contactFormInitialData, setContactFormInitialData] = useState<any>(null);
  
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [todaysTasks, setTodaysTasks] = useState<TaskItem[]>([]);
  const [todaysMeetings, setTodaysMeetings] = useState<any[]>([]);
  const [opportunitiesCount, setOpportunitiesCount] = useState(0);

  // Debug: Track todaysMeetings state changes
  useEffect(() => {
    console.log('🏠 todaysMeetings state changed:', todaysMeetings.length, 'meetings');
    if (todaysMeetings.length > 0) {
      console.log('🏠 todaysMeetings details:', todaysMeetings.map(m => ({ title: m.title, start: m.start })));
    }
  }, [todaysMeetings]);
  const [clientsCount, setClientsCount] = useState(0);

  // Calendar event state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  // Debug: Track selectedDate changes
  useEffect(() => {
    console.log('🏠 Parent selectedDate changed:', selectedDate);
  }, [selectedDate]);

  // Debug: Track calendarEvents state changes
  useEffect(() => {
    console.log('🏠 calendarEvents state changed:', calendarEvents.length, 'events');
    if (calendarEvents.length > 0) {
      console.log('🏠 calendarEvents details:', calendarEvents.map(e => ({ title: e.title, start: e.start })));
    }
  }, [calendarEvents]);

  // Register refresh callback for event updates from other components
  useEffect(() => {
    console.log('🏠 Dashboard: Registering event refresh callback');
    onEventRefresh(() => {
      console.log('🏠 Dashboard: Received event refresh trigger, reloading metrics data');
      loadMetricsData();
    });
  }, [onEventRefresh]);

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

  // Content form state
  const [contentFormData, setContentFormData] = useState({
    contentTitle: '',
    platform: '',
    postType: '',
    status: 'idea',
    hook: '',
    concept: '',
    hashtags: '',
    description: '',
    creationDate: '',
    publishDate: '',
    deadline: '',
    views: '',
    likes: '',
    comments: '',
    shares: '',
    saves: '',
    revenue: '',
    notes: '',
    collaborationTag: '',
    repurposeTag: ''
  });
  const [isCreatingContent, setIsCreatingContent] = useState(false);
  
  // Period filter states
  const [revenuePeriod, setRevenuePeriod] = useState('this-quarter');
  const [growthPeriod, setGrowthPeriod] = useState('this-quarter');
  const [growthType, setGrowthType] = useState('revenue');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Function to load calendar events
  const loadCalendarEvents = async () => {
    try {
      // Load calendar events from calendar_events table
      const calendarResponse = await fetch('/api/calendar-events');
      let events: any[] = [];
      
      if (calendarResponse.ok) {
        const calendarData = await calendarResponse.json();
        
        console.log('=== CALENDAR EVENTS DEBUG ===');
        calendarData.forEach((event: any) => {
          console.log(`Event "${event.title}":`, {
            start_time: event.start_time,
            end_time: event.end_time,
            start_time_parsed: new Date(event.start_time),
            end_time_parsed: new Date(event.end_time)
          });
        });
        
        events = calendarData.map((event: any) => {
          // Convert the stored dates to user timezone for display
          const storedStartDate = new Date(event.start_time);
          const storedEndDate = new Date(event.end_time);
          const userTimezone = event.user_timezone || DateUtils.getUserTimezone();
          
          // Validate dates before processing
          const displayStartDate = (storedStartDate && isValid(storedStartDate)) 
            ? (DateUtils.toUserTimezone(storedStartDate, userTimezone) || storedStartDate)
            : new Date();
          const displayEndDate = (storedEndDate && isValid(storedEndDate))
            ? (DateUtils.toUserTimezone(storedEndDate, userTimezone) || storedEndDate)
            : new Date();
          
          console.log('=== CALENDAR EVENT DEBUG ===');
          console.log('Event:', event.title);
          console.log('start_time:', event.start_time);
          console.log('end_time:', event.end_time);
          console.log('storedStartDate:', storedStartDate);
          console.log('displayStartDate:', displayStartDate);
          
          return {
            id: `event-${event.id}`,
            title: event.title,
            start: displayStartDate,
            end: displayEndDate,
            color: 'bg-blue-500',
            type: 'calendar',
            description: event.description,
            eventType: event.event_type || 'meeting'
          };
        });
      }
      
      setCalendarEvents(events);
      return events;
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setCalendarEvents([]);
      return [];
    }
  };

  // Function to load metrics data
  const loadMetricsData = async () => {
      console.log('Dashboard loadMetricsData called for niche:', activeNiche);
      try {
        // Load opportunities count
        const opportunitiesResponse = await fetch(`/api/opportunities?niche=${activeNiche}`);
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


        // Calculate growth rate (month-over-month revenue growth)
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const lastMonth = new Date(thisMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const thisMonthRevenue = wonOpportunities
          .filter((opp: any) => {
            const oppDate = new Date(opp.created_at);
            return oppDate >= thisMonth;
          })
          .reduce((sum: number, opp: any) => sum + (opp.value || 0), 0);
        
        const lastMonthRevenue = wonOpportunities
          .filter((opp: any) => {
            const oppDate = new Date(opp.created_at);
            return oppDate >= lastMonth && oppDate < thisMonth;
          })
          .reduce((sum: number, opp: any) => sum + (opp.value || 0), 0);

        let growthRate = 0;
        if (lastMonthRevenue > 0) {
          growthRate = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        } else if (thisMonthRevenue > 0) {
          // If there was no revenue last month but there is this month, it's new business
          growthRate = 100;
        }
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
          const contentResponse = await fetch(`/api/content-items?niche=${activeNiche}`);
          if (contentResponse.ok) {
            const contentItems = await contentResponse.json();
            // Store episodes count and unique guests for use in metrics
            const episodesCount = contentItems.length;
            const uniqueGuests = new Set(contentItems.filter((item: any) => item.guest).map((item: any) => item.guest)).size;
            // Store these values in state for use in metrics
            setEpisodesCount(episodesCount);
            setGuestsCount(uniqueGuests);
          }
        }

        // Load calendar events
        console.log('🔄 Loading calendar events...');
        const calendarEvents = await loadCalendarEvents();
        console.log('✅ Calendar events loaded:', calendarEvents.length, 'events');

        // Load content items (including tasks)
        const contentResponse = await fetch(`/api/content-items?niche=${activeNiche}`);
        let contentItems: any[] = [];
        
        if (contentResponse.ok) {
          contentItems = await contentResponse.json();
          console.log('Loaded content items:', contentItems);
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

        // Convert task-type content items to tasks
        const taskContentItems = contentItems.filter((item: any) => item.content_type === 'task');
        console.log('Task content items found:', taskContentItems);
        
        const contentTasks: TaskItem[] = taskContentItems
          .map((item: any) => ({
            id: `task-content-${item.id}`,
            brandName: item.title,
            taskType: 'task',
            description: item.description || 'Task created from dashboard',
            dueTime: new Date().toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            priority: 'medium' as const,
            completed: false,
            linkedTo: 'crm' as const
          }));
        
        console.log('Converted content tasks:', contentTasks);

        // Convert calendar event content items to tasks
        const calendarContentItems = contentItems.filter((item: any) => item.content_type === 'calendar_event');
        console.log('Calendar content items found:', calendarContentItems);
        
        const calendarContentTasks: TaskItem[] = calendarContentItems
          .filter((item: any) => {
            // Use post_date (event date) instead of creation_date for filtering
            const eventDate = new Date(item.post_date || item.creation_date);
            return eventDate >= todayStart && eventDate < todayEnd;
          })
          .map((item: any) => ({
            id: `task-cal-content-${item.id}`,
            brandName: item.title,
            taskType: 'meeting',
            description: item.description || 'Calendar event',
            dueTime: new Date(item.post_date || item.creation_date).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            priority: 'high' as const,
            completed: false,
            linkedTo: 'calendar' as const
          }));
        
        console.log('Converted calendar content tasks:', calendarContentTasks);

        // Create meetings from calendar events (today's events only)
        console.log('=== TODAY\'S MEETINGS FILTER DEBUG ===');
        console.log('todayStart:', todayStart);
        console.log('todayEnd:', todayEnd);
        console.log('calendarEvents:', calendarEvents);
        
        const todaysMeetings = calendarEvents.filter((event: any) => {
          const eventDate = new Date(event.start);
          const isToday = eventDate >= todayStart && eventDate < todayEnd;
          console.log(`Event "${event.title}":`, {
            eventDate: eventDate,
            isToday: isToday,
            start: event.start,
            startString: event.start.toString(),
            startDate: event.start.getDate(),
            startMonth: event.start.getMonth(),
            startYear: event.start.getFullYear()
          });
          return isToday;
        });
        
        console.log('Today\'s meetings from calendar events:', todaysMeetings);

        const otherTasks = [...opportunityTasks, ...calendarTasks.filter(task => task.taskType !== 'meeting'), ...contentTasks];

        // Sort tasks by time
        const sortedTasks = otherTasks.sort((a, b) => {
          const timeA = new Date(`2000-01-01 ${a.dueTime}`).getTime();
          const timeB = new Date(`2000-01-01 ${b.dueTime}`).getTime();
          return timeA - timeB;
        });

        // Sort meetings by time
        const sortedMeetings = todaysMeetings.sort((a, b) => {
          return a.start.getTime() - b.start.getTime();
        });

        console.log('Final sorted meetings:', sortedMeetings);

        setTodaysTasks(sortedTasks);
        setTodaysMeetings(sortedMeetings);
        
        console.log('📊 State updates completed:');
        console.log('  - setTodaysTasks called with:', sortedTasks.length, 'tasks');
        console.log('  - setTodaysMeetings called with:', sortedMeetings.length, 'meetings');
        console.log('📊 Current calendarEvents array has:', calendarEvents.length, 'events');
        console.log('📊 Current today filter found:', todaysMeetings.length, 'meetings for today');

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

  // Disabled visibility-based refresh to prevent frequent API calls
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (!document.hidden) {
  //       loadMetricsData();
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //   return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  // }, [activeNiche]);

  // Disabled auto-refresh to prevent frequent API calls
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     loadMetricsData();
  //   }, 30000); // Refresh every 30 seconds

  //   return () => clearInterval(interval);
  // }, [activeNiche]);

  // Disabled focus-based refresh to prevent frequent API calls
  // useEffect(() => {
  //   const handleFocus = () => {
  //     loadMetricsData();
  //   };

  //   window.addEventListener('focus', handleFocus);
  //   return () => window.removeEventListener('focus', handleFocus);
  // }, [activeNiche]);

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
    
    // Check if this is an opportunity task
    if (taskId.startsWith('task-opp-')) {
      const opportunityId = taskId.replace('task-opp-', '');
      
      try {
        // Update the opportunity status
        const response = await fetch(`/api/opportunities`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: opportunityId,
            status: 'completed'
          }),
        });

        if (!response.ok) {
          console.error('Failed to update opportunity status');
        }
      } catch (error) {
        console.error('Error updating opportunity:', error);
      }
    }
    
    // Check if this is a content item task
    if (taskId.startsWith('task-content-') || taskId.startsWith('task-cal-content-')) {
      const contentId = taskId.replace('task-content-', '').replace('task-cal-content-', '');
      
      try {
        // Update the content item status
        const response = await fetch(`/api/content-items/${contentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'completed'
          }),
        });

        if (!response.ok) {
          console.error('Failed to update content item status');
        }
      } catch (error) {
        console.error('Error updating content item:', error);
      }
    }

    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleEditTask = (task: TaskItem | any) => {
    // Handle both task items and meeting items
    console.log('handleEditTask called with task:', task);
    
    const isMeeting = task.start && task.type; // Meeting items have start date and type
    
    if (isMeeting) {
      console.log('Processing as meeting item');
      console.log('task.start:', task.start);
      console.log('task.start type:', typeof task.start);
      
      // Handle meeting item - ensure start is a valid Date
      let startDate: Date;
      
      if (task.start instanceof Date) {
        startDate = task.start;
      } else if (typeof task.start === 'string') {
        startDate = new Date(task.start);
      } else if (typeof task.start === 'object' && task.start !== null) {
        // If it's an object but not a Date, try to extract date info
        console.error('task.start is an object but not a Date:', task.start);
        startDate = new Date();
      } else {
        console.error('task.start is invalid:', task.start);
        startDate = new Date();
      }
      
      // Check if the date is valid
      if (isNaN(startDate.getTime())) {
        console.error('Invalid date for meeting:', task.start);
        console.error('startDate after conversion:', startDate);
        // Fall back to current date
        const fallbackDate = new Date();
        setEditingTask({
          id: task.id,
          brandName: task.title,
          description: task.description || '',
          taskType: task.eventType || 'meeting',
          dueTime: fallbackDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          priority: 'high',
          completed: false,
          linkedTo: 'calendar'
        });
        setTaskFormData({
          title: task.title,
          description: task.description || '',
          priority: 'high',
          taskType: task.eventType || 'meeting',
          dueDate: fallbackDate.toISOString().split('T')[0],
          dueTime: fallbackDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          notes: '',
          reminder: false
        });
      } else {
        // Valid date
        setEditingTask({
          id: task.id,
          brandName: task.title,
          description: task.description || '',
          taskType: task.eventType || 'meeting',
          dueTime: startDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          priority: 'high',
          completed: false,
          linkedTo: 'calendar'
        });
        setTaskFormData({
          title: task.title,
          description: task.description || '',
          priority: 'high',
          taskType: task.eventType || 'meeting',
          dueDate: startDate.toISOString().split('T')[0],
          dueTime: startDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          notes: '',
          reminder: false
        });
      }
    } else {
      // Handle regular task item
      setEditingTask(task);
      setTaskFormData({
        title: task.brandName,
        description: task.description,
        priority: task.priority,
        taskType: task.taskType,
        dueDate: '', // We'll need to parse the dueTime
        dueTime: task.dueTime,
        notes: '',
        reminder: false
      });
    }
    
    setIsEditTaskModalOpen(true);
  }

  const handleCreateEvent = async (eventData: any) => {
    try {
      const isEditing = selectedEvent && selectedEvent.type === 'calendar';
      
      console.log('=== EVENT CREATION DEBUG ===');
      console.log('isEditing:', isEditing);
      console.log('selectedEvent:', selectedEvent);
      console.log('selectedDate:', selectedDate);
      console.log('eventData:', eventData);
      
      // Use the calendar-events API for proper calendar event handling
      const requestBody: any = {
        title: eventData.title,
        description: eventData.description || '',
        start_time: eventData.start_date,
        end_time: eventData.end_date,
        type: eventData.type || 'meeting',
        status: 'scheduled',
        location: eventData.location || '',
        client_id: eventData.client_id || null,
        opportunity_id: eventData.opportunity_id || null
      };

      // Add event ID for updates
      if (isEditing) {
        requestBody.id = selectedEvent.id.replace('event-', '');
      }

      console.log('Request body being sent:', requestBody);
      console.log('eventData.start_date:', eventData.start_date);
      console.log('eventData.end_date:', eventData.end_date);

      const response = await fetch('/api/calendar-events', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Event creation failed:', response.status, errorData);
        throw new Error(isEditing ? 'Failed to update event' : 'Failed to create event');
      }

      const savedEvent = await response.json();
      console.log('Saved event from API:', savedEvent);
      
      console.log('🔄 About to reload metrics data...');
      // Reload data to ensure we have the latest events
      await loadMetricsData();
      console.log('✅ Metrics data reloaded successfully');

      // Trigger refresh for other components (like calendar)
      console.log('🏠 Dashboard: Event created, triggering refresh for other components');
      triggerRefresh();

      setIsEventModalOpen(false);
      setSelectedDate(null);
      setSelectedEvent(null);
      console.log('✅ Modal closed and state reset');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/content-items?id=${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      // Reload data to ensure we have the latest events
      await loadMetricsData();
      
      setIsEventModalOpen(false);
      setSelectedDate(null);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleEditMeeting = (meeting: any) => {
    if (meeting.type === 'calendar') {
      setSelectedEvent(meeting);
      setIsEventModalOpen(true);
    }
  };

  const handleCompleteTaskFromModal = async () => {
    if (!editingTask) {
      return;
    }

    try {
      setIsCreatingTask(true);
      
      // Use the same logic as handleTaskComplete but for the editingTask
      await handleTaskComplete(editingTask.id);
      
      // Close the modal
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      
    } catch (error) {
      console.error('Error completing task from modal:', error);
    } finally {
      setIsCreatingTask(false);
    }
  }

  const handleDeleteTaskFromModal = async () => {
    if (!editingTask) {
      return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${editingTask.brandName}"?`)) {
      return;
    }

    try {
      setIsCreatingTask(true);
      
      // Extract the actual database ID from the prefixed task ID
      let actualId = editingTask.id;
      if (editingTask.id.startsWith('task-opp-')) {
        actualId = editingTask.id.replace('task-opp-', '');
      } else if (editingTask.id.startsWith('task-cal-')) {
        actualId = editingTask.id.replace('task-cal-', '');
      } else if (editingTask.id.startsWith('task-content-')) {
        actualId = editingTask.id.replace('task-content-', '');
      } else if (editingTask.id.startsWith('task-cal-content-')) {
        actualId = editingTask.id.replace('task-cal-content-', '');
      }
      
      console.log('=== DELETE TASK DEBUG ===');
      console.log('Original task ID:', editingTask.id);
      console.log('Extracted actual ID:', actualId);
      
      // Determine the correct API endpoint based on task type
      let apiEndpoint = '';
      let requestBody = {};
      
      if (editingTask.id.startsWith('task-cal-') || editingTask.id.startsWith('task-cal-content-')) {
        // This is a calendar event, use calendar-events API
        apiEndpoint = `/api/calendar-events`;
        requestBody = { id: actualId };
      } else if (editingTask.id.startsWith('task-opp-')) {
        // This is an opportunity, use opportunities API
        apiEndpoint = `/api/opportunities?id=${actualId}`;
        requestBody = {}; // No body needed for opportunities DELETE
      } else {
        // This is a content item, use content-items API
        apiEndpoint = `/api/content-items/${actualId}`;
        requestBody = {}; // No body needed for content-items DELETE
      }

      console.log('Using API endpoint:', apiEndpoint);
      console.log('Request body:', requestBody);

      // Delete the task using the appropriate API
      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Task deletion failed:', response.status, errorData);
        throw new Error(`Failed to delete task: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      // Close the modal
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      
      // Refresh the dashboard data to show the updated task list
      await loadMetricsData();
      
    } catch (error) {
      console.error('Error deleting task from modal:', error);
    } finally {
      setIsCreatingTask(false);
    }
  }

  const handleUpdateTask = async () => {
    if (!taskFormData.title.trim() || !editingTask) {
      return; // Don't save if title is empty or no task to edit
    }

    try {
      setIsCreatingTask(true);
      
      // Extract the actual database ID from the prefixed task ID
      let actualId = editingTask.id;
      if (editingTask.id.startsWith('task-opp-')) {
        actualId = editingTask.id.replace('task-opp-', '');
      } else if (editingTask.id.startsWith('task-cal-')) {
        actualId = editingTask.id.replace('task-cal-', '');
      } else if (editingTask.id.startsWith('task-content-')) {
        actualId = editingTask.id.replace('task-content-', '');
      } else if (editingTask.id.startsWith('task-cal-content-')) {
        actualId = editingTask.id.replace('task-cal-content-', '');
      }
      
      console.log('Original task ID:', editingTask.id);
      console.log('Extracted actual ID:', actualId);
      
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

      // Determine the correct API endpoint based on task type
      let apiEndpoint = '';
      if (editingTask.id.startsWith('task-cal-') || editingTask.id.startsWith('task-cal-content-')) {
        // This is a calendar event, use calendar-events API
        apiEndpoint = `/api/calendar-events`;
      } else if (editingTask.id.startsWith('task-opp-')) {
        // This is an opportunity, use opportunities API
        apiEndpoint = `/api/opportunities`;
      } else {
        // This is a content item, use content-items API
        apiEndpoint = `/api/content-items/${actualId}`;
      }

      console.log('Using API endpoint:', apiEndpoint);

      // Prepare the request body based on the task type
      let requestBody = {};
      if (editingTask.id.startsWith('task-cal-') || editingTask.id.startsWith('task-cal-content-')) {
        // Calendar event update
        requestBody = {
          id: actualId,
          title: taskData.title,
          description: taskData.description || '',
          start_time: dueDateTime || new Date().toISOString(),
          type: taskData.taskType,
          notes: taskData.notes || ''
        };
      } else if (editingTask.id.startsWith('task-opp-')) {
        // Opportunity update
        requestBody = {
          id: actualId,
          title: taskData.title,
          description: taskData.description || '',
          status: 'active',
          notes: taskData.notes || '',
          niche: activeNiche
        };
      } else {
        // Content item update
        requestBody = {
          title: taskData.title,
          description: taskData.description || '',
          start_time: dueDateTime || new Date().toISOString(),
          status: 'pending',
          notes: taskData.notes || '',
          niche: activeNiche,
          content_type: 'task'
        };
      }

      console.log('Request body:', requestBody);
      console.log('Request body JSON:', JSON.stringify(requestBody, null, 2));

      // Update the task using the appropriate API
      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Task update failed:', response.status, errorData);
        throw new Error(`Failed to update task: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      // Close modal and show success message
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      
      // Refresh the dashboard data to show the updated task
      await loadMetricsData();
      
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsCreatingTask(false);
    }
  }

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
      // Create a task using the content_items table
      const requestBody = {
        title: taskData.title,
        description: taskData.description || '',
        start_time: dueDateTime || new Date().toISOString(),
        status: 'pending',
        notes: taskData.notes || '',
        tags: [taskData.taskType, taskData.priority]
      };

      console.log('Creating task with minimal data:', requestBody);

      // Use the content-items API instead since it works
      const response = await fetch('/api/content-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          content_type: 'task',
          status: 'pending',
          stage: 'planning',
          niche: activeNiche
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Task creation failed:', response.status, errorData);
        throw new Error(`Failed to create task: ${response.status} - ${errorData.error || 'Unknown error'}`);
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

  const handleCreateContent = async () => {
    if (!contentFormData.contentTitle.trim()) {
      return; // Don't save if title is empty
    }

    try {
      setIsCreatingContent(true);
      
      const contentData = {
        title: contentFormData.contentTitle,
        platform: contentFormData.platform,
        type: contentFormData.postType,
        stage: contentFormData.status, // Map status to stage
        brand: '', // Could be added later
        creationDate: contentFormData.creationDate,
        postDate: contentFormData.publishDate,
        hashtags: contentFormData.hashtags ? contentFormData.hashtags.split(' ').filter(tag => tag.startsWith('#')) : [],
        hook: contentFormData.hook,
        notes: contentFormData.notes,
        analytics: {
          views: parseInt(contentFormData.views) || 0,
          likes: parseInt(contentFormData.likes) || 0,
          comments: parseInt(contentFormData.comments) || 0
        },
        niche: activeNiche,
        description: contentFormData.description,
        deadline: contentFormData.deadline,
        revenue: parseFloat(contentFormData.revenue) || 0,
        collaborationTag: contentFormData.collaborationTag,
        repurposeTag: contentFormData.repurposeTag
      };

      const response = await fetch('/api/content-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentData),
      });

      if (!response.ok) {
        throw new Error('Failed to create content');
      }

      // Reset form and close modal
      setContentFormData({
        contentTitle: '',
        platform: '',
        postType: '',
        status: 'idea',
        hook: '',
        concept: '',
        hashtags: '',
        description: '',
        creationDate: '',
        publishDate: '',
        deadline: '',
        views: '',
        likes: '',
        comments: '',
        shares: '',
        saves: '',
        revenue: '',
        notes: '',
        collaborationTag: '',
        repurposeTag: ''
      });
      setIsCreateContentModalOpen(false);
      
      // Refresh the dashboard data to show the new content
      await loadMetricsData();
      
      // Stay on dashboard - content was created successfully
      // You could add a success message here if needed
      
    } catch (error) {
      console.error('Error creating content:', error);
      // You could add error handling here
    } finally {
      setIsCreatingContent(false);
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

  const handleSaveContact = async (formData: any) => {
    try {
      console.log('🔍 Saving contact with data:', formData);
      
      // Remove address and value fields as they're not in the database schema
      const { address, value, ...clientData } = formData;
      
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...clientData, niche: activeNiche }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 API Error Response:', errorText);
        throw new Error(`Failed to create client: ${response.status} ${errorText}`);
      }

      const newClient = await response.json();
      console.log('🔍 Successfully created client:', newClient);
      
      // Show success message
      alert(`Successfully created client: ${formData.name}`);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error; // Re-throw so the modal can handle it
    }
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
        onRevenueTypeChange: setRevenueDisplayType,
        showPeriodFilter: true,
        period: revenuePeriod,
        onPeriodChange: handleRevenuePeriodChange
      },

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
            onRevenueTypeChange: setRevenueDisplayType,
            showPeriodFilter: true,
            period: revenuePeriod,
            onPeriodChange: handleRevenuePeriodChange
          }
        ]

      case 'podcaster':
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
            title: 'Episodes', 
            value: episodesCount.toString(), 
            change: undefined, 
            icon: Radio, 
            trend: 'up' as const, 
            color: 'blue' as const,
            onClick: () => onNavigate('analytics')
          },
          { 
            title: 'Guests', 
            value: guestsCount.toString(), 
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
            onRevenueTypeChange: setRevenueDisplayType,
            showPeriodFilter: true,
            period: revenuePeriod,
            onPeriodChange: handleRevenuePeriodChange
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
            onRevenueTypeChange: setRevenueDisplayType,
            showPeriodFilter: true,
            period: revenuePeriod,
            onPeriodChange: handleRevenuePeriodChange
          },

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

        ]
    }
  }



  const getQuickActions = (niche: string) => {
    switch (niche) {
      case 'creator':
        return [
          { icon: Target, label: 'Add Opportunity', action: () => setIsOpportunityModalOpen(true) },
          { icon: Camera, label: 'Create Content', action: () => setIsCreateContentModalOpen(true) },
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
        {/* Debug Section for hello@gotangocrm.com */}
        {user?.emailAddresses?.[0]?.emailAddress === 'hello@gotangocrm.com' && (
          <motion.div 
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info for hello@gotangocrm.com</h3>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p><strong>Current Niches:</strong> [{subscribedNiches.join(', ')}]</p>
                  <p><strong>Active Niche:</strong> {activeNiche}</p>
                  <p><strong>User ID:</strong> {user?.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    clearCache();
                    refreshPaymentStatus();
                  }}
                  className="text-xs"
                >
                  Refresh Niches
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="text-xs"
                >
                  Reload Page
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/debug/user-niches');
                      const data = await response.json();
                      console.log('🔍 Debug endpoint response:', data);
                      alert('Check browser console for debug data');
                    } catch (error) {
                      console.error('Debug endpoint error:', error);
                      alert('Debug endpoint error - check console');
                    }
                  }}
                  className="text-xs"
                >
                  Debug API
                </Button>
              </div>
            </div>
          </motion.div>
        )}

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
          className={`grid gap-6 ${
            activeNiche === 'creator' || activeNiche === 'freelancer'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' // 3 columns for creator and freelancer
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' // 4 columns for other niches
          }`}
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
                        onEdit={handleEditTask}
                        onComplete={handleTaskComplete}
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
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        console.log('Add Event button clicked');
                        // Don't set selectedDate to null - let the modal use its default logic
                        setSelectedEvent(null);
                        setIsEventModalOpen(true);
                      }}
                      className="h-8 px-3"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Event
                    </Button>
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
                </div>
                
                                <div className="space-y-3">
                  {(() => {
                    console.log('🎨 Rendering Today\'s Meetings section with:', todaysMeetings.length, 'meetings');
                    if (todaysMeetings.length > 0) {
                      return todaysMeetings.map((meeting) => (
                        <TodayMeetingItem 
                          key={meeting.id} 
                          meeting={meeting} 
                          onEdit={handleEditMeeting}
                          onComplete={handleTaskComplete}
                        />
                      ));
                    } else {
                      return (
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
                      );
                    }
                  })()}
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
              status: (() => {
                // Use the same mapping logic as the opportunity service
                if (activeNiche === 'podcaster') {
                  return comprehensiveData.status === 'outreach' ? 'prospecting' : 
                         comprehensiveData.status === 'awaiting' ? 'prospecting' : 
                         comprehensiveData.status === 'conversation' ? 'qualification' : 
                         comprehensiveData.status === 'negotiation' ? 'negotiation' : 
                         comprehensiveData.status === 'agreement' ? 'proposal' : 
                         comprehensiveData.status === 'scheduled' ? 'proposal' : 
                         comprehensiveData.status === 'recorded' ? 'won' : 
                         comprehensiveData.status === 'archived' ? 'lost' : 'prospecting';
                } else {
                  return comprehensiveData.status === 'outreach' ? 'prospecting' : 
                         comprehensiveData.status === 'awaiting' ? 'qualification' : 
                         comprehensiveData.status === 'contract' ? 'proposal' : 
                         comprehensiveData.status === 'negotiation' ? 'negotiation' : 
                         comprehensiveData.status === 'paid' ? 'won' : 
                         comprehensiveData.status === 'archived' ? 'lost' : 'prospecting';
                }
              })(),
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
            
            // Check if this is a client conversion stage
            const clientConversionStages = activeNiche === 'podcaster' ? ['paid', 'active', 'recorded'] : ['paid', 'active'];
            if (clientConversionStages.includes(comprehensiveData.status)) {
              console.log('Dashboard - Triggering client conversion modal for new opportunity:', savedOpportunity.title);
              setConvertedOpportunity({
                id: savedOpportunity.id,
                clientName: comprehensiveData.guestOrSponsorName || comprehensiveData.brandName || comprehensiveData.clientName || comprehensiveData.companyName || savedOpportunity.title,
                stageId: comprehensiveData.status,
                customFields: comprehensiveData.customFields
              });
              setShowClientConversionModal(true);
            }
            
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Card – For Creators & Influencers
            </DialogTitle>
            <DialogDescription>
              Create a comprehensive content plan with all the details you need
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
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
                    value={contentFormData.contentTitle}
                    onChange={(e) => setContentFormData({...contentFormData, contentTitle: e.target.value})}
                    placeholder="Enter your content title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={contentFormData.platform} onValueChange={(value) => setContentFormData({...contentFormData, platform: value})}>
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
                  <Select value={contentFormData.postType} onValueChange={(value) => setContentFormData({...contentFormData, postType: value})}>
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
                  <Select value={contentFormData.status} onValueChange={(value) => setContentFormData({...contentFormData, status: value})}>
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
                    value={contentFormData.hook}
                    onChange={(e) => setContentFormData({...contentFormData, hook: e.target.value})}
                    placeholder="The hook that will grab attention"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="concept">Concept or Theme</Label>
                  <Textarea
                    id="concept"
                    value={contentFormData.concept}
                    onChange={(e) => setContentFormData({...contentFormData, concept: e.target.value})}
                    placeholder="Describe the overall concept or theme"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hashtags">Hashtags Used</Label>
                  <Input
                    id="hashtags"
                    value={contentFormData.hashtags}
                    onChange={(e) => setContentFormData({...contentFormData, hashtags: e.target.value})}
                    placeholder="#hashtag1 #hashtag2 #hashtag3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description / Caption Draft</Label>
                  <Textarea
                    id="description"
                    value={contentFormData.description}
                    onChange={(e) => setContentFormData({...contentFormData, description: e.target.value})}
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
                    value={contentFormData.creationDate}
                    onChange={(e) => setContentFormData({...contentFormData, creationDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publishDate">Publish Date</Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={contentFormData.publishDate}
                    onChange={(e) => setContentFormData({...contentFormData, publishDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={contentFormData.deadline}
                    onChange={(e) => setContentFormData({...contentFormData, deadline: e.target.value})}
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
                    value={contentFormData.views}
                    onChange={(e) => setContentFormData({...contentFormData, views: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="likes">Likes</Label>
                  <Input
                    id="likes"
                    type="number"
                    value={contentFormData.likes}
                    onChange={(e) => setContentFormData({...contentFormData, likes: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Input
                    id="comments"
                    type="number"
                    value={contentFormData.comments}
                    onChange={(e) => setContentFormData({...contentFormData, comments: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shares">Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    value={contentFormData.shares}
                    onChange={(e) => setContentFormData({...contentFormData, shares: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saves">Saves</Label>
                  <Input
                    id="saves"
                    type="number"
                    value={contentFormData.saves}
                    onChange={(e) => setContentFormData({...contentFormData, saves: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenue">Revenue</Label>
                  <Input
                    id="revenue"
                    type="number"
                    step="0.01"
                    value={contentFormData.revenue}
                    onChange={(e) => setContentFormData({...contentFormData, revenue: e.target.value})}
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
                    value={contentFormData.notes}
                    onChange={(e) => setContentFormData({...contentFormData, notes: e.target.value})}
                    placeholder="Any additional notes or ideas"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="collaborationTag">Collaboration Tag (if working with another creator)</Label>
                    <Input
                      id="collaborationTag"
                      value={contentFormData.collaborationTag}
                      onChange={(e) => setContentFormData({...contentFormData, collaborationTag: e.target.value})}
                      placeholder="Collaborator name or tag"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repurposeTag">Repurpose Tag (e.g. "turn into YouTube short")</Label>
                    <Input
                      id="repurposeTag"
                      value={contentFormData.repurposeTag}
                      onChange={(e) => setContentFormData({...contentFormData, repurposeTag: e.target.value})}
                      placeholder="Repurpose instructions"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => setIsCreateContentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateContent}
              disabled={isCreatingContent}
            >
              {isCreatingContent ? 'Creating...' : 'Create Content'}
            </Button>
          </DialogFooter>
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

      {/* Event Creation Modal */}
      <EventCreationModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedDate(null);
          setSelectedEvent(null);
        }}
        onSave={handleCreateEvent}
        onDelete={handleDeleteEvent}
        activeNiche={activeNiche}
        selectedEvent={selectedEvent}
        selectedDate={selectedDate || undefined}
        onDateChange={setSelectedDate}
      />

      {/* Edit Task Modal */}
      <Dialog open={isEditTaskModalOpen} onOpenChange={setIsEditTaskModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                Task Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="editTaskTitle">Task Title</Label>
                <Input
                  id="editTaskTitle"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})}
                  placeholder="e.g. 'Review brand guidelines' or 'Edit video content'"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editTaskDescription">Description</Label>
                <Textarea
                  id="editTaskDescription"
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                  placeholder="Describe what needs to be done"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editTaskPriority">Priority</Label>
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
                  <Label htmlFor="editTaskType">Task Type</Label>
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
                  <Label htmlFor="editTaskDueDate">Due Date</Label>
                  <Input
                    id="editTaskDueDate"
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({...taskFormData, dueDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTaskDueTime">Due Time</Label>
                  <Input
                    id="editTaskDueTime"
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
                <Label htmlFor="editTaskNotes">Notes</Label>
                <Textarea
                  id="editTaskNotes"
                  value={taskFormData.notes}
                  onChange={(e) => setTaskFormData({...taskFormData, notes: e.target.value})}
                  placeholder="Any additional notes or context"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="editReminder" 
                  checked={taskFormData.reminder}
                  onCheckedChange={(checked) => setTaskFormData({...taskFormData, reminder: checked as boolean})}
                />
                <Label htmlFor="editReminder">Set reminder</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditTaskModalOpen(false);
              setEditingTask(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteTaskFromModal}
              disabled={isCreatingTask}
              variant="destructive"
            >
              {isCreatingTask ? "Deleting..." : "Delete"}
            </Button>
            <Button 
              onClick={handleUpdateTask} 
              disabled={isCreatingTask || !taskFormData.title.trim()}
            >
              {isCreatingTask ? "Updating..." : "Update Task"}
            </Button>
            <Button 
              onClick={handleCompleteTaskFromModal}
              disabled={isCreatingTask}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreatingTask ? "Completing..." : "Task Complete"}
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
                Great news! You've moved <strong>{convertedOpportunity?.clientName}</strong> to the <strong>{convertedOpportunity?.stageId === 'recorded' ? 'Recorded/Won' : convertedOpportunity?.stageId}</strong> stage.
              </p>
              <p className="text-sm text-muted-foreground">
                Would you like to add them as a client in your contacts?
              </p>
              {convertedOpportunity?.stageId === 'recorded' && activeNiche === 'podcaster' && (
                <p className="text-xs text-blue-600 mt-2">
                  💡 This opportunity will remain in the Recorded/Won stage for revenue tracking
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
                  // Close the conversion modal
                  setShowClientConversionModal(false);
                  setConvertedOpportunity(null);
                  
                  // Pre-populate contact form with opportunity data
                  const contactData = {
                    name: (convertedOpportunity?.customFields?.contactName || convertedOpportunity?.clientName || '').trim(),
                    email: (convertedOpportunity?.customFields?.contactEmail || '').trim(),
                    phone: (convertedOpportunity?.customFields?.contactPhone || '').trim(),
                    company: (convertedOpportunity?.customFields?.companyName || '').trim(),
                    status: 'client' as 'client',
                    notes: `Created from ${activeNiche === 'podcaster' ? 'recorded/won' : 'won'} opportunity: ${(convertedOpportunity?.customFields?.contactName || convertedOpportunity?.clientName || '').trim()}`
                  };
                  
                  setContactFormInitialData(contactData);
                  
                  // Show the contact form modal
                  setShowContactFormModal(true);
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

      {/* Contact Form Modal */}
      <ContactFormModal
        open={showContactFormModal}
        onOpenChange={setShowContactFormModal}
        initialData={contactFormInitialData}
        onSave={handleSaveContact}
        title="Add New Contact"
        activeNiche={activeNiche}
      />
    </motion.div>
  )
}
