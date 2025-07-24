import { supabase } from './supabase';

export interface AnalyticsData {
  opportunities: {
    total: number;
    byStage: Record<string, number>;
    totalValue: number;
    averageValue: number;
    conversionRate: number;
    recentActivity: any[];
  };
  clients: {
    total: number;
    active: number;
    newThisMonth: number;
    retentionRate: number;
    byStatus: Record<string, number>;
  };
  revenue: {
    total: number;
    monthly: number;
    averageDealSize: number;
    growthRate: number;
    byMonth: Array<{ month: string; value: number }>;
  };
  content: {
    total: number;
    published: number;
    engagement: number;
    averageViews: number;
    byType: Record<string, number>;
  };
  goals: {
    total: number;
    completed: number;
    progress: number;
    averageProgress: number;
  };
  calendar: {
    totalEvents: number;
    upcoming: number;
    completed: number;
    byType: Record<string, number>;
  };
  growth: {
    followers: number;
    followerGrowth: number;
    engagementRate: number;
    engagementGrowth: number;
    reachGrowth: number;
  };
}

export interface NicheSpecificMetrics {
  creator?: {
    brandDeals: number;
    sponsoredContent: number;
    averageDealValue: number;
    topBrands: any[];
  };
  coach?: {
    programs: {
      total: number;
      active: number;
    };
    studentsEnrolled: number;
    averageProgramValue: number;
    completionRate: number;
  };
  podcaster?: {
    episodes: {
      total: number;
      publishedThisMonth: number;
    };
    guests: {
      total: number;
      newThisMonth: number;
    };
    totalViews: number;
    averageViews: number;
    topEpisodes: any[];
  };
  freelancer?: {
    opportunities: number;
    billableHours: number;
    utilizationRate: number;
    averageOpportunityValue: number;
  };
}

class AnalyticsService {
  private userId: string | null = null;

  constructor() {
    // User ID will be set via setUserId method
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Get comprehensive analytics data for a specific niche
  async getAnalyticsData(niche: string, userId?: string): Promise<AnalyticsData & NicheSpecificMetrics> {
    const currentUserId = userId || this.userId;
    if (!currentUserId) {
      throw new Error('User ID is required for analytics');
    }

    const [
      opportunitiesData,
      clientsData,
      revenueData,
      contentData,
      goalsData,
      calendarData,
      nicheData
    ] = await Promise.all([
      this.getOpportunitiesAnalytics(niche, currentUserId),
      this.getClientsAnalytics(currentUserId),
      this.getRevenueAnalytics(niche, currentUserId),
      this.getContentAnalytics(niche, currentUserId),
      this.getGoalsAnalytics(currentUserId),
      this.getCalendarAnalytics(currentUserId),
      this.getNicheSpecificAnalytics(niche, currentUserId)
    ]);

    return {
      ...opportunitiesData,
      ...clientsData,
      ...revenueData,
      ...contentData,
      ...goalsData,
      ...calendarData,
      ...nicheData,
      growth: {
        followers: 1500,
        followerGrowth: 12.5,
        engagementRate: 4.2,
        engagementGrowth: 8.3,
        reachGrowth: 15.7
      }
    };
  }

  // Opportunities Analytics
  private async getOpportunitiesAnalytics(niche: string, userId: string) {
    try {
      const response = await fetch(`/api/opportunities?niche=${niche}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error fetching opportunities:', response.statusText);
        return { opportunities: { total: 0, byStage: {}, totalValue: 0, averageValue: 0, conversionRate: 0, recentActivity: [] } };
      }

      const opportunities = await response.json();

      const total = opportunities.length;
      const byStage = opportunities.reduce((acc: Record<string, number>, opp: any) => {
        acc[opp.stage] = (acc[opp.stage] || 0) + 1;
        return acc;
      }, {});

      const totalValue = opportunities.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0);
      const averageValue = total > 0 ? totalValue / total : 0;

      // For coach niche, include both 'won' and 'paid' statuses for conversion rate
      const wonOpportunities = opportunities.filter((opp: any) => {
        if (niche === 'coach') {
          return opp.status === 'won' || opp.status === 'paid';
        }
        return opp.status === 'won';
      }).length;
      const conversionRate = total > 0 ? (wonOpportunities / total) * 100 : 0;

      const recentActivity = opportunities
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

      return {
        opportunities: {
          total,
          byStage,
          totalValue,
          averageValue,
          conversionRate,
          recentActivity
        }
      };
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      return { opportunities: { total: 0, byStage: {}, totalValue: 0, averageValue: 0, conversionRate: 0, recentActivity: [] } };
    }
  }

  // Clients Analytics
  private async getClientsAnalytics(userId: string) {
    try {
      const response = await fetch('/api/clients', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error fetching clients:', response.statusText);
        return { clients: { total: 0, active: 0, newThisMonth: 0, retentionRate: 0, byStatus: {} } };
      }

      const clients = await response.json();

      const total = clients.length;
      const active = clients.filter((client: any) => client.status === 'client').length;
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newThisMonth = clients.filter((client: any) => 
        new Date(client.created_at) >= thisMonth
      ).length;

      const byStatus = clients.reduce((acc: Record<string, number>, client: any) => {
        acc[client.status] = (acc[client.status] || 0) + 1;
        return acc;
      }, {});

      const retentionRate = total > 0 ? (active / total) * 100 : 0;

      return {
        clients: {
          total,
          active,
          newThisMonth,
          retentionRate,
          byStatus
        }
      };
    } catch (error) {
      console.error('Error fetching clients:', error);
      return { clients: { total: 0, active: 0, newThisMonth: 0, retentionRate: 0, byStatus: {} } };
    }
  }

  // Revenue Analytics
  private async getRevenueAnalytics(niche: string, userId: string) {
    // For coach niche, include both 'won' and 'paid' statuses
    const statusFilter = niche === 'coach' ? ['won', 'paid'] : ['won'];
    
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('value, status, created_at')
      .eq('user_id', userId)
      .eq('niche', niche)
      .in('status', statusFilter);

    if (error) {
      console.error('Error fetching revenue data:', error);
      return { revenue: { total: 0, monthly: 0, averageDealSize: 0, growthRate: 0, byMonth: [] } };
    }

    const total = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
    const averageDealSize = opportunities.length > 0 ? total / opportunities.length : 0;

    // Calculate monthly revenue
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthlyRevenue = opportunities
      .filter(opp => new Date(opp.created_at) >= thisMonth)
      .reduce((sum, opp) => sum + (opp.value || 0), 0);

    // Calculate growth rate (simplified - compare to last month)
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthRevenue = opportunities
      .filter(opp => {
        const oppDate = new Date(opp.created_at);
        return oppDate >= lastMonth && oppDate < thisMonth;
      })
      .reduce((sum, opp) => sum + (opp.value || 0), 0);

    const growthRate = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Generate monthly data for charts
    const byMonth = this.generateMonthlyRevenueData(opportunities);

    return {
      revenue: {
        total,
        monthly: monthlyRevenue,
        averageDealSize,
        growthRate,
        byMonth
      }
    };
  }

  // Content Analytics
  private async getContentAnalytics(niche: string, userId: string) {
    try {
      const response = await fetch(`/api/content-items?niche=${niche}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error fetching content:', response.statusText);
        return { content: { total: 0, published: 0, engagement: 0, averageViews: 0, byType: {} } };
      }

      const content = await response.json();

      const total = content.length;
      const published = content.filter((item: any) => item.status === 'published').length;
      
      const totalViews = content.reduce((sum: number, item: any) => sum + (item.views || 0), 0);
      const averageViews = total > 0 ? totalViews / total : 0;

      const byType = content.reduce((acc: Record<string, number>, item: any) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {});

      return {
        content: {
          total,
          published,
          engagement: totalViews,
          averageViews,
          byType
        }
      };
    } catch (error) {
      console.error('Error fetching content:', error);
      return { content: { total: 0, published: 0, engagement: 0, averageViews: 0, byType: {} } };
    }
  }

  // Goals Analytics
  private async getGoalsAnalytics(userId: string) {
    try {
      const response = await fetch('/api/goals', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error fetching goals:', response.statusText);
        return { goals: { total: 0, completed: 0, progress: 0, averageProgress: 0 } };
      }

      const goals = await response.json();

      const total = goals.length;
      const completed = goals.filter((goal: any) => goal.status === 'completed').length;
      const averageProgress = goals.length > 0 
        ? goals.reduce((sum: number, goal: any) => sum + (goal.progress_percentage || 0), 0) / goals.length 
        : 0;

      return {
        goals: {
          total,
          completed,
          progress: averageProgress,
          averageProgress
        }
      };
    } catch (error) {
      console.error('Error fetching goals:', error);
      return { goals: { total: 0, completed: 0, progress: 0, averageProgress: 0 } };
    }
  }

  // Calendar Analytics
  private async getCalendarAnalytics(userId: string) {
    try {
      const response = await fetch('/api/calendar-events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error fetching calendar events:', response.statusText);
        return { calendar: { totalEvents: 0, upcoming: 0, completed: 0, byType: {} } };
      }

      const events = await response.json();

      const totalEvents = events.length;
      const now = new Date();
      const upcoming = events.filter((event: any) => new Date(event.start_time) > now).length;
      const completed = events.filter((event: any) => new Date(event.end_time) < now).length;

      const byType = events.reduce((acc: Record<string, number>, event: any) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {});

      return {
        calendar: {
          totalEvents,
          upcoming,
          completed,
          byType
        }
      };
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return { calendar: { totalEvents: 0, upcoming: 0, completed: 0, byType: {} } };
    }
  }

  // Niche-specific Analytics
  private async getNicheSpecificAnalytics(niche: string, userId: string): Promise<NicheSpecificMetrics> {
    switch (niche) {
      case 'creator':
        return this.getCreatorAnalytics(userId);
      case 'coach':
        return this.getCoachAnalytics(userId);
      case 'podcaster':
        return this.getPodcasterAnalytics(userId);
      case 'freelancer':
        return this.getFreelancerAnalytics(userId);
      default:
        return {};
    }
  }

  private async getCreatorAnalytics(userId: string) {
    try {
      const response = await fetch('/api/opportunities?niche=creator', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error fetching creator analytics:', response.statusText);
        return { creator: { brandDeals: 0, sponsoredContent: 0, averageDealValue: 0, topBrands: [] } };
      }

      const opportunities = await response.json();
      const wonOpportunities = opportunities.filter((opp: any) => opp.status === 'won');

      const brandDeals = wonOpportunities.length;
      const sponsoredContent = wonOpportunities.filter((opp: any) => opp.type === 'sponsorship').length;
      const averageDealValue = brandDeals > 0 
        ? wonOpportunities.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0) / brandDeals 
        : 0;

      const topBrands = wonOpportunities
        .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
        .slice(0, 5)
        .map((opp: any) => ({
          name: opp.clients?.name || 'Unknown',
          value: opp.value,
          type: opp.type
        }));

      return {
        creator: {
          brandDeals,
          sponsoredContent,
          averageDealValue,
          topBrands
        }
      };
    } catch (error) {
      console.error('Error fetching creator analytics:', error);
      return { creator: { brandDeals: 0, sponsoredContent: 0, averageDealValue: 0, topBrands: [] } };
    }
  }

  private async getCoachAnalytics(userId: string) {
    try {
      const response = await fetch('/api/content-items?niche=coach', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error fetching coach analytics:', response.statusText);
        return { coach: { programs: { total: 0, active: 0 }, studentsEnrolled: 0, averageProgramValue: 0, completionRate: 0 } };
      }

      const content = await response.json();
      const programs = content.filter((item: any) => item.type === 'program');

      const totalPrograms = programs.length;
      const activePrograms = programs.filter((item: any) => item.status === 'active').length;
      const studentsEnrolled = programs.reduce((sum: number, item: any) => sum + (item.enrolled || 0), 0);
      const averageProgramValue = totalPrograms > 0 
        ? programs.reduce((sum: number, item: any) => sum + (item.price || 0), 0) / totalPrograms 
        : 0;

      const completedPrograms = programs.filter((item: any) => item.status === 'completed').length;
      const completionRate = totalPrograms > 0 ? (completedPrograms / totalPrograms) * 100 : 0;

      return {
        coach: {
          programs: {
            total: totalPrograms,
            active: activePrograms
          },
          studentsEnrolled,
          averageProgramValue,
          completionRate
        }
      };
    } catch (error) {
      console.error('Error fetching coach analytics:', error);
      return { coach: { programs: { total: 0, active: 0 }, studentsEnrolled: 0, averageProgramValue: 0, completionRate: 0 } };
    }
  }

  private async getPodcasterAnalytics(userId: string) {
    try {
      const response = await fetch('/api/content-items?niche=podcaster', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error fetching podcaster analytics:', response.statusText);
        return { 
          podcaster: { 
            episodes: { total: 0, publishedThisMonth: 0 },
            guests: { total: 0, newThisMonth: 0 },
            totalViews: 0, 
            averageViews: 0, 
            topEpisodes: [] 
          } 
        };
      }

      const content = await response.json();
      const episodes = content.filter((item: any) => item.type === 'episode');

      const totalEpisodes = episodes.length;
      const currentMonth = new Date().getMonth();
      const publishedThisMonth = episodes.filter((item: any) => {
        const itemDate = new Date(item.created_at);
        return itemDate.getMonth() === currentMonth;
      }).length;

      const uniqueGuests = [...new Set(episodes.map((item: any) => item.guest).filter(Boolean))];
      const totalGuests = uniqueGuests.length;
      const newGuestsThisMonth = episodes.filter((item: any) => {
        const itemDate = new Date(item.created_at);
        return itemDate.getMonth() === currentMonth && item.guest;
      }).length;

      const totalViews = episodes.reduce((sum: number, item: any) => sum + (item.views || 0), 0);
      const averageViews = totalEpisodes > 0 ? totalViews / totalEpisodes : 0;

      const topEpisodes = episodes
        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map((item: any) => ({
          title: item.title,
          views: item.views || 0,
          guest: item.guest,
          duration: item.duration
        }));

      return {
        podcaster: {
          episodes: {
            total: totalEpisodes,
            publishedThisMonth
          },
          guests: {
            total: totalGuests,
            newThisMonth: newGuestsThisMonth
          },
          totalViews,
          averageViews,
          topEpisodes
        }
      };
    } catch (error) {
      console.error('Error fetching podcaster analytics:', error);
      return { 
        podcaster: { 
          episodes: { total: 0, publishedThisMonth: 0 },
          guests: { total: 0, newThisMonth: 0 },
          totalViews: 0, 
          averageViews: 0, 
          topEpisodes: [] 
        } 
      };
    }
  }

  private async getFreelancerAnalytics(userId: string) {
    try {
      const response = await fetch('/api/opportunities?niche=freelancer', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error fetching freelancer analytics:', response.statusText);
        return { freelancer: { opportunities: 0, billableHours: 0, utilizationRate: 0, averageOpportunityValue: 0 } };
      }

      const opportunities = await response.json();

      const totalOpportunities = opportunities.length;
      const completedOpportunities = opportunities.filter((opp: any) => opp.status === 'won' || opp.status === 'paid').length;
      const averageOpportunityValue = totalOpportunities > 0 
        ? opportunities.reduce((sum: number, opp: any) => sum + (opp.value || 0), 0) / totalOpportunities 
        : 0;

      // Simplified calculations - in real implementation, you'd track actual billable hours
      const billableHours = completedOpportunities * 40; // Assume 40 hours per opportunity
      const utilizationRate = 85; // This would be calculated from actual time tracking

      return {
        freelancer: {
          opportunities: totalOpportunities,
          billableHours,
          utilizationRate,
          averageOpportunityValue
        }
      };
    } catch (error) {
      console.error('Error fetching freelancer analytics:', error);
      return { freelancer: { opportunities: 0, billableHours: 0, utilizationRate: 0, averageOpportunityValue: 0 } };
    }
  }

  // Helper method to generate monthly revenue data for charts
  private generateMonthlyRevenueData(opportunities: any[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = new Array(12).fill(0);

    opportunities.forEach(opp => {
      const date = new Date(opp.created_at);
      const monthIndex = date.getMonth();
      monthlyData[monthIndex] += opp.value || 0;
    });

    return months.map((month, index) => ({
      month,
      value: monthlyData[index]
    }));
  }

  // Real-time data subscription for live updates
  subscribeToRealTimeUpdates(callback: (data: AnalyticsData) => void) {
    if (!this.userId) return;

    const subscription = supabase
      .channel('analytics-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'opportunities',
          filter: `user_id=eq.${this.userId}`
        }, 
        async () => {
          // Refresh analytics data when opportunities change
          const data = await this.getAnalyticsData('creator'); // Default niche
          callback(data);
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'clients',
          filter: `user_id=eq.${this.userId}`
        }, 
        async () => {
          const data = await this.getAnalyticsData('creator');
          callback(data);
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'content_items',
          filter: `user_id=eq.${this.userId}`
        }, 
        async () => {
          const data = await this.getAnalyticsData('creator');
          callback(data);
        }
      )
      .subscribe();

    return subscription;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService(); 