'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnalyticsContext } from '@/contexts/AnalyticsContext';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'purple' | 'emerald' | 'cyan' | 'orange' | 'red';
  gradient?: string;
  subtitle?: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  trend = 'neutral',
  color = 'blue',
  gradient,
  subtitle,
  loading = false
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    emerald: 'text-emerald-600',
    cyan: 'text-cyan-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };

  const gradientClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100',
    emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    cyan: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100',
    red: 'bg-gradient-to-br from-red-50 to-red-100'
  };

  if (loading) {
    return (
      <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative h-48 w-full ${
        gradient || gradientClasses[color as keyof typeof gradientClasses] || gradientClasses.blue
      }`}>
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="animate-pulse bg-white/20 rounded h-6 w-32"></div>
            <div className="animate-pulse bg-white/20 rounded-full h-8 w-8"></div>
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="animate-pulse bg-white/20 rounded h-8 w-24 mb-2"></div>
            <div className="animate-pulse bg-white/20 rounded h-4 w-16"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative h-48 w-full ${
      gradient || gradientClasses[color as keyof typeof gradientClasses] || gradientClasses.blue
    }`}>
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <Icon className={`w-6 h-6 ${colorClasses[color as keyof typeof colorClasses]}`} />
        </div>
        
        <div className="flex-1 flex flex-col justify-end">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {typeof value === 'number' ? formatNumber(value) : value}
          </div>
          
          {change !== undefined && (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend === 'up' && <TrendingUp className="w-4 h-4" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4" />}
                {change > 0 ? '+' : ''}{change}%
              </div>
              {subtitle && (
                <span className="text-xs text-gray-500">{subtitle}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Revenue Chart Component
const RevenueChart: React.FC<{ data: any[]; loading?: boolean }> = ({ data, loading = false }) => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly'>('monthly');
  
  if (loading) {
    return (
      <Card className="p-6 border-0 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="animate-pulse bg-gray-200 rounded h-6 w-32"></div>
          <div className="animate-pulse bg-gray-200 rounded h-8 w-24"></div>
        </div>
        <div className="animate-pulse bg-gray-200 rounded h-48 w-full"></div>
      </Card>
    );
  }

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
  
  const maxValue = Math.max(...filteredData.map(d => d.value), 1);
  const minValue = 0;
  const range = maxValue - minValue;
  
  // Calculate bar width and spacing
  const barWidth = 18;
  const barSpacing = 6;
  const totalBarWidth = barWidth + barSpacing;
  const chartWidth = 350;
  const startX = 50;

  return (
    <Card className="p-6 border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Revenue Growth</h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as 'monthly' | 'quarterly')}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>
      
      <div className="relative">
        <svg width={chartWidth} height={200} className="mx-auto">
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const y = 180 - (percent / 100) * 160;
            const value = (percent / 100) * maxValue;
            return (
              <g key={percent}>
                <text x={40} y={y + 4} className="text-xs text-gray-500">
                  {formatCurrency(value)}
                </text>
                <line x1={45} y1={y} x2={chartWidth - 10} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              </g>
            );
          })}
          
          {/* Bars */}
          {filteredData.map((item, index) => {
            const barHeight = range > 0 ? (item.value / maxValue) * 160 : 0;
            const x = startX + index * totalBarWidth;
            const y = 180 - barHeight;
            
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#gradient)"
                  rx="2"
                />
                <text
                  x={x + barWidth / 2}
                  y={195}
                  textAnchor="middle"
                  className="text-xs text-gray-600"
                >
                  {item.month}
                </text>
              </g>
            );
          })}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </Card>
  );
};

// Growth Rate Chart Component
const GrowthRateChart: React.FC<{ data: any[]; activeNiche?: string; loading?: boolean }> = ({ 
  data, 
  activeNiche = 'creator',
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="p-6 border-0 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="animate-pulse bg-gray-200 rounded h-6 w-48"></div>
          <div className="animate-pulse bg-gray-200 rounded h-8 w-24"></div>
        </div>
        <div className="animate-pulse bg-gray-200 rounded h-48 w-full"></div>
      </Card>
    );
  }

  const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'won', 'lost'];
  const stageData = stages.map(stage => {
    const count = data.filter(item => item.stage === stage).length;
    const value = data.filter(item => item.stage === stage).reduce((sum, item) => sum + (item.value || 0), 0);
    return { stage, count, value };
  });

  const maxCount = Math.max(...stageData.map(d => d.count), 1);
  const maxValue = Math.max(...stageData.map(d => d.value), 1);

  return (
    <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Opportunities in Each Stage
        </h3>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {data.length} Total
        </Badge>
      </div>
      
      <div className="space-y-4">
        {stageData.map((item, index) => {
          const percentage = (item.count / maxCount) * 100;
          const valuePercentage = (item.value / maxValue) * 100;
          
          return (
            <div key={item.stage} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {item.stage}
                </span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {item.count} deals
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(item.value)}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${valuePercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Main Real-Time Analytics Dashboard
export const RealTimeAnalyticsDashboard: React.FC<{ activeNiche?: string }> = ({ activeNiche = 'creator' }) => {
  const { 
    data, 
    loading, 
    error, 
    refresh, 
    isRealTimeEnabled, 
    toggleRealTime, 
    lastUpdated 
  } = useAnalyticsContext();

  const [activeSection, setActiveSection] = useState('overview');

  // Auto-refresh when niche changes
  useEffect(() => {
    refresh();
  }, [activeNiche, refresh]);

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'opportunities', label: 'Opportunities', icon: Target },
    { id: 'brands', label: activeNiche === 'podcaster' ? 'Episodes' : activeNiche === 'coach' ? 'Clients' : 'Brands/Clients', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'growth', label: 'Growth Rate', icon: TrendingUp },
  ];

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-red-50 to-red-100">
        <div className="max-w-7xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Analytics Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={refresh} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
        {/* Header with Real-Time Status */}
        <div className="text-center mb-8">
          <motion.h1 
            className={`text-4xl font-bold mb-2 ${
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
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <motion.p 
              className="text-gray-600 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Your media empire metrics at a glance
            </motion.p>
            
            {/* Real-Time Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleRealTime}
              className={`flex items-center gap-2 ${
                isRealTimeEnabled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              {isRealTimeEnabled ? (
                <>
                  <Wifi className="w-4 h-4" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  Offline
                </>
              )}
            </Button>
            
            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'outline'}
                onClick={() => setActiveSection(section.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </Button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeSection === 'overview' && !loading && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Opportunities"
                  value={data?.opportunities?.total || 0}
                  change={data?.opportunities?.conversionRate || 0}
                  icon={Target}
                  trend="up"
                  color="blue"
                  loading={loading}
                />
                <MetricCard
                  title={activeNiche === 'podcaster' ? 'Episodes' : activeNiche === 'coach' ? 'Clients' : 'Brands/Clients'}
                  value={data?.clients?.total || 0}
                  change={data?.clients?.newThisMonth || 0}
                  icon={Users}
                  trend="up"
                  color="purple"
                  loading={loading}
                />
                <MetricCard
                  title="Revenue"
                  value={data?.revenue?.total ? formatCurrency(data.revenue.total) : '$0'}
                  change={data?.revenue?.growthRate || 0}
                  icon={DollarSign}
                  trend="up"
                  color="emerald"
                  loading={loading}
                />
                <MetricCard
                  title="Growth Rate"
                  value={`${data?.revenue?.growthRate || 0}%`}
                  change={data?.revenue?.growthRate || 0}
                  icon={TrendingUp}
                  trend="up"
                  color="cyan"
                  loading={loading}
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart 
                  data={data?.revenue?.byMonth || []} 
                  loading={loading}
                />
                <GrowthRateChart 
                  data={data?.opportunities?.recentActivity || []} 
                  activeNiche={activeNiche}
                  loading={loading}
                />
              </div>
            </motion.div>
          )}

          {activeSection === 'opportunities' && !loading && (
            <motion.div
              key="opportunities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <GrowthRateChart 
                data={data?.opportunities?.recentActivity || []} 
                activeNiche={activeNiche}
                loading={loading}
              />
            </motion.div>
          )}

          {activeSection === 'revenue' && !loading && (
            <motion.div
              key="revenue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <RevenueChart 
                data={data?.revenue?.byMonth || []} 
                loading={loading}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricCard
                  title="Average Deal Size"
                  value={data?.revenue?.averageDealSize ? formatCurrency(data.revenue.averageDealSize) : '$0'}
                  change={data?.revenue?.growthRate || 0}
                  icon={DollarSign}
                  trend="up"
                  color="emerald"
                  subtitle="Per deal"
                  loading={loading}
                />
                <MetricCard
                  title="Monthly Revenue"
                  value={data?.revenue?.monthly ? formatCurrency(data.revenue.monthly) : '$0'}
                  change={data?.revenue?.growthRate || 0}
                  icon={Activity}
                  trend="up"
                  color="blue"
                  subtitle="This month"
                  loading={loading}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 