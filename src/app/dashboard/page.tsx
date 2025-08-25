"use client";

import React, { useState, createContext, useContext, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SidebarNavigation } from "@/components/app/sidebar-navigation";
import DashboardOverview from "@/components/app/dashboard-overview";
import CRMPipelineView from "@/components/app/crm-pipeline-view";
import { CalendarComponent } from "@/components/app/calendar-view";
import AnalyticsDashboard from "@/components/app/analytics-dashboard";
import { ProgramsContentHub } from "@/components/app/programs-content-hub";

import ClientsPage from "./clients/page";
import SettingsPage from "./settings/page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertCircle, Menu, Share2, Trophy, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, RedirectToSignIn, useClerk, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { NicheProvider, useNiche } from "@/contexts/NicheContext";
import { TimezoneProvider } from "@/contexts/TimezoneContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { EventRefreshProvider } from "@/contexts/EventRefreshContext";
import { PaymentVerification } from "@/components/app/payment-verification";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import PaymentService from '@/lib/payment-service';
import { isAdminEmail } from '@/lib/admin-config';

// Types
interface AppContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
  selectedNiche: string;
  setSelectedNiche: (niche: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isLoading: boolean;
  error: string | null;
  subscribedNiches: string[];
  isSubscribed: (niche: string) => boolean;
}

interface NavigationItem {
  id: string;
  label: string;
  component: React.ComponentType<any>;
  requiresNiche?: boolean;
}

// App Context
const AppContext = createContext<AppContextType | undefined>(undefined);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

// Navigation configuration
const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", component: DashboardOverview, requiresNiche: true },
  { id: "crm", label: "CRM Pipeline", component: CRMPipelineView, requiresNiche: true },
  { id: "clients", label: "Clients & Contacts", component: ClientsPage, requiresNiche: false },
  { id: "calendar", label: "Calendar", component: CalendarComponent, requiresNiche: true },
  { id: "analytics", label: "Analytics", component: AnalyticsDashboard, requiresNiche: true },
  { id: "programs", label: "Programs", component: ProgramsContentHub, requiresNiche: true },

  { id: "settings", label: "Settings", component: SettingsPage, requiresNiche: false }
];

// Available niches
const AVAILABLE_NICHES = [
  { id: "creator", name: "Creator", label: "Content Creator" },
  { id: "coach", name: "Coach", label: "Online Coach" },
  { id: "podcaster", name: "Podcaster", label: "Podcast Host" },
  { id: "freelancer", name: "Freelancer", label: "Freelancer/Consultant" }
];

// Error Boundary Component
const ErrorBoundary: React.FC<{ children: React.ReactNode; error: string | null }> = ({ 
  children, 
  error 
}) => {
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            size="sm"
          >
            Reload Page
          </Button>
        </Card>
      </div>
    );
  }
  return <>{children}</>;
};

// Main Content Component
  const MainContent: React.FC = () => {
    const { activeSection, selectedNiche, isLoading, setActiveSection } = useAppContext();
    const { currentNiche } = useNiche();
    const { user } = useUser();

    const currentNavItem = NAVIGATION_ITEMS.find(item => item.id === activeSection);
    
    if (!currentNavItem) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="p-8 max-w-md w-full text-center">
            <h3 className="text-lg font-semibold mb-2">Page Not Found</h3>
            <p className="text-sm text-muted-foreground">
              The requested section could not be found.
            </p>
          </Card>
        </div>
      );
    }

    // Check if section requires niche selection
    if (currentNavItem.requiresNiche && !selectedNiche) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="p-8 max-w-md w-full text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
              <Menu className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Select a Niche</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please select a niche to access {currentNavItem.label}.
            </p>
          </Card>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      );
    }

    const Component = currentNavItem.component;

    return (
      <div className="w-full h-full main-content-container">
        {currentNavItem.id === 'clients' ? (
          <Component activeNiche={currentNiche} onNavigate={(section: string) => setActiveSection(section)} />
        ) : (
          <Component 
            {...(currentNavItem.requiresNiche ? { activeNiche: currentNiche } : {})}
            onNavigate={(section: string) => {
              setActiveSection(section);
            }}
            userName={activeSection === 'dashboard' ? getUserDisplayName(user) : undefined}
          />
        )}
      </div>
    );
  };

// Mobile Sidebar Overlay
const MobileSidebarOverlay: React.FC<{ sidebarCollapsed: boolean; setSidebarCollapsed: (collapsed: boolean) => void }> = ({ 
  sidebarCollapsed, 
  setSidebarCollapsed 
}) => {
  if (sidebarCollapsed) return null;

  return (
    <div 
      className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-sm lg:hidden"
      onClick={() => {
        console.log('🔧 Mobile overlay clicked, closing sidebar');
        setSidebarCollapsed(true);
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('sidebarCollapsed', JSON.stringify(true));
        }
      }}
      style={{ touchAction: 'none' }}
    />
  );
};

// Loading Component
const LoadingScreen: React.FC = () => (
  <div className="h-screen bg-background flex items-center justify-center">
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">Initializing dashboard...</span>
    </div>
  </div>
);

// Get user's display name helper function
const getUserDisplayName = (user: any) => {
  if (!user) return 'User';
  
  // Try to get the full name first
  if (user.fullName) return user.fullName;
  
  // Fall back to first name
  if (user.firstName) return user.firstName;
  
  // Fall back to email
  if (user.emailAddresses?.[0]?.emailAddress) {
    return user.emailAddresses[0].emailAddress.split('@')[0];
  }
  
  return 'User';
};

// Main Dashboard Component
function MainDashboardWithSearchParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Start with expanded, will be set properly after mount
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  
  // Get actual subscribed niches from payment status
  const { niches: subscribedNiches, primaryNiche, isLoading: paymentStatusLoading, refreshPaymentStatus, forceRefreshAfterPayment, clearCache } = usePaymentStatus();
  const { user: currentUser } = useUser();
  
  // Ensure admin users always have access to all niches
  const userEmail = currentUser?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail && isAdminEmail(userEmail);
  // Use plural forms for consistency with NicheContext
  const availableNiches = isAdmin ? ['creators', 'coaches', 'podcasters', 'freelancers'] : subscribedNiches;

  // Handle URL parameters for section and niche
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    const nicheParam = searchParams.get('niche');
    
    if (sectionParam && NAVIGATION_ITEMS.find(item => item.id === sectionParam)) {
      setActiveSection(sectionParam);
    }
    
    // Only allow switching to subscribed niches
    if (nicheParam && AVAILABLE_NICHES.find(niche => niche.id === nicheParam) && availableNiches.includes(nicheParam)) {
      // Map singular niche IDs to plural forms for consistency
      const nicheMap: { [key: string]: string } = {
        'creator': 'creators',
        'coach': 'coaches',
        'podcaster': 'podcasters',
        'freelancer': 'freelancers'
      };
      const mappedNiche = nicheMap[nicheParam] || nicheParam;
      setSelectedNiche(mappedNiche);
    }
  }, [searchParams, subscribedNiches]);

  // Set mounted state and handle localStorage
  useEffect(() => {
    setMounted(true);
    
    // Initialize sidebar state after mounting
    const initializeSidebarState = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('sidebarCollapsed');
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          console.log('🔧 Restoring sidebar state from localStorage:', parsed);
          setSidebarCollapsed(parsed);
        } else {
          // Default to collapsed on mobile, expanded on desktop
          const shouldCollapse = window.innerWidth < 1024;
          console.log('🔧 Setting default sidebar state:', shouldCollapse, 'window width:', window.innerWidth);
          setSidebarCollapsed(shouldCollapse);
          // Save the default state to localStorage
          localStorage.setItem('sidebarCollapsed', JSON.stringify(shouldCollapse));
        }
      }
    };
    
    // Small delay to ensure window is fully available
    setTimeout(initializeSidebarState, 100);
  }, []);

  // Check if user has completed onboarding and set initial niche
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Set initial niche based on user's subscriptions
  useEffect(() => {
    if (mounted && !paymentStatusLoading && availableNiches.length > 0) {
      const localStorageNiche = localStorage.getItem('selectedNiche');
      
      // Map singular niche IDs to plural forms for consistency
      const nicheMap: { [key: string]: string } = {
        'creator': 'creators',
        'coach': 'coaches',
        'podcaster': 'podcasters',
        'freelancer': 'freelancers'
      };
      
      // Only set niche if no niche is selected at all
      if (!selectedNiche) {
        // Always prioritize localStorage over primaryNiche
        let preferredNiche = localStorageNiche && availableNiches.includes(localStorageNiche) 
          ? localStorageNiche 
          : (primaryNiche || availableNiches[0]);
        
        // Map to plural form if it's a singular form
        preferredNiche = nicheMap[preferredNiche] || preferredNiche;
        
        setSelectedNiche(preferredNiche);
      } else {
        // If a niche is already selected, only change it if it's not available
        if (!availableNiches.includes(selectedNiche)) {
          let fallbackNiche = localStorageNiche && availableNiches.includes(localStorageNiche)
            ? localStorageNiche
            : (primaryNiche || availableNiches[0]);
          
          // Map to plural form if it's a singular form
          fallbackNiche = nicheMap[fallbackNiche] || fallbackNiche;
          
          setSelectedNiche(fallbackNiche);
        }
      }
    }
  }, [mounted, availableNiches, primaryNiche, paymentStatusLoading, selectedNiche]);

  // Ensure localStorage priority is maintained
  useEffect(() => {
    if (mounted && selectedNiche) {
      const localStorageNiche = localStorage.getItem('selectedNiche');
      if (localStorageNiche && localStorageNiche !== selectedNiche && availableNiches.includes(localStorageNiche)) {
        setSelectedNiche(localStorageNiche);
      }
    }
  }, [mounted, selectedNiche, availableNiches]);

  // Monitor for niche additions and ensure sidebar refreshes
  useEffect(() => {
    if (mounted && !paymentStatusLoading) {
      const localStorageNiche = localStorage.getItem('selectedNiche');
      
      // If localStorage has a niche that wasn't previously available but now is
      if (localStorageNiche && 
          availableNiches.includes(localStorageNiche) && 
          selectedNiche !== localStorageNiche) {
        console.log('🔧 New niche detected in localStorage, switching to:', localStorageNiche);
        setSelectedNiche(localStorageNiche);
      }
      
      // If we detect a niche addition (availableNiches length increased)
      if (availableNiches.length > 0) {
        console.log('🔧 Available niches updated:', availableNiches);
        
        // Force a re-render of the sidebar by triggering a state update
        if (localStorageNiche && availableNiches.includes(localStorageNiche)) {
          setSelectedNiche(localStorageNiche);
        }
      }
    }
  }, [mounted, availableNiches, paymentStatusLoading]);



  // Auto-fix subscription status for users with niches but inactive subscription
  useEffect(() => {
    const autoFixSubscriptionStatus = async () => {
      if (!paymentStatusLoading && subscribedNiches.length > 0) {
        // Get current payment status
        const response = await fetch('/api/user/payment-status');
        if (response.ok) {
          const paymentStatus = await response.json();
          
          // If user has niches but inactive subscription, they likely made a payment
          if (!paymentStatus.hasActiveSubscription && paymentStatus.subscriptionStatus === 'inactive' && subscribedNiches.length > 0) {
            try {
              const updateResponse = await fetch('/api/user/subscription-status', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  subscriptionStatus: 'active',
                  subscriptionTier: 'core'
                }),
              });
              
              if (updateResponse.ok) {
                // Refresh payment status to get updated data
                refreshPaymentStatus();
              }
            } catch (error) {
              // Silently handle errors
            }
          }
        }
      }
    };

    autoFixSubscriptionStatus();
  }, [paymentStatusLoading, subscribedNiches.length, refreshPaymentStatus]);

  // Poll for payment status updates after coming from payment success page
  useEffect(() => {
    const referrer = document.referrer;
    const isFromPaymentSuccess = referrer.includes('/payment-success') || referrer.includes('/onboarding/success');
    
    if (isFromPaymentSuccess && !paymentStatusLoading) {
      console.log('🔧 Setting up polling for payment status updates...');
      
      // Poll every 3 seconds for up to 30 seconds
      let pollCount = 0;
      const maxPolls = 10;
      
      const pollInterval = setInterval(async () => {
        pollCount++;
        console.log(`🔧 Polling payment status (${pollCount}/${maxPolls})...`);
        
        try {
          const response = await fetch('/api/user/payment-status?t=' + Date.now(), {
            cache: 'no-cache'
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // If we have niches and active subscription, stop polling
            if (data.niches && data.niches.length > 0 && data.hasActiveSubscription) {
              console.log('✅ Payment status updated successfully, stopping poll');
              clearInterval(pollInterval);
              
              // Force refresh to update the UI
              forceRefreshAfterPayment();
            } else if (pollCount >= maxPolls) {
              console.log('⏰ Max polls reached, stopping');
              clearInterval(pollInterval);
            }
          }
        } catch (error) {
          console.error('❌ Polling error:', error);
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
          }
        }
      }, 3000);
      
      return () => clearInterval(pollInterval);
    }
  }, [paymentStatusLoading, forceRefreshAfterPayment]);

  // Handle upgrade success redirect
  useEffect(() => {
    const upgradeStatus = searchParams.get('upgrade');
    const upgradedNiche = searchParams.get('niche');
    
    if (upgradeStatus === 'success') {
      // Force immediate refresh of payment status
      refreshPaymentStatus();
      
      // Also refresh after a short delay to ensure database updates are propagated
      setTimeout(() => {
        refreshPaymentStatus();
      }, 2000);
      
      // And refresh again after a longer delay
      setTimeout(() => {
        refreshPaymentStatus();
      }, 5000);
      
      // If we have a specific upgraded niche, switch to it
      if (upgradedNiche) {
        setSelectedNiche(upgradedNiche);
      }
      
      // Clear the URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('upgrade');
      url.searchParams.delete('niche');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, refreshPaymentStatus]);

  // Disabled auto-refresh to prevent frequent API calls
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Only refresh if we're not already loading and user is active
  //     if (!paymentStatusLoading && document.visibilityState === 'visible') {
  //       refreshPaymentStatus();
  //     }
  //   }, 30000); // Refresh every 30 seconds

  //   return () => clearInterval(interval);
  // }, [refreshPaymentStatus, paymentStatusLoading]);

  // Disabled visibility-based refresh to prevent frequent API calls
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === 'visible' && !paymentStatusLoading) {
  //       console.log('🔧 User returned to tab, refreshing payment status...');
  //       refreshPaymentStatus();
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //   return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  // }, [refreshPaymentStatus, paymentStatusLoading]);

  const checkOnboardingStatus = async () => {
    // Skip onboarding check for development - allow direct access
    setIsCheckingOnboarding(false);
  };

  // Handle resize and payment status refresh
  useEffect(() => {
    const handleResize = () => {
      const shouldCollapse = window.innerWidth < 1024;
      console.log('🔧 Resize detected, setting sidebar to:', shouldCollapse, 'window width:', window.innerWidth);
      setSidebarCollapsed(shouldCollapse);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(shouldCollapse));
      }
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Check if user just came from payment success page and refresh payment status
    const referrer = document.referrer;
    if (referrer.includes('/payment-success') || referrer.includes('/onboarding/success')) {
      console.log('🔧 User came from payment success page, forcing payment status refresh...');
      setTimeout(() => {
        forceRefreshAfterPayment();
      }, 1000); // Small delay to ensure everything is loaded
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [refreshPaymentStatus, forceRefreshAfterPayment]);

  const isSubscribed = (niche: string) => true; // Tango Core includes all niches
  
  // Check if user has the Tango Core plan (any paid subscription)
  const hasCorePlan = () => {
    // Check if user has any active subscription
    return availableNiches.length > 0;
  };

  // Context value
  const contextValue: AppContextType = {
    activeSection,
    setActiveSection,
    selectedNiche,
    setSelectedNiche,
    sidebarCollapsed,
    setSidebarCollapsed,
    isLoading,
    error,
    subscribedNiches: availableNiches,
    isSubscribed
  };

  // Debug log for sidebar state
  useEffect(() => {
    console.log('🔧 Sidebar state changed:', { sidebarCollapsed, mounted, windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'unknown' });
  }, [sidebarCollapsed, mounted]);

  const handleNavigationChange = (section: string) => {
    setActiveSection(section);
    
    // Update URL parameters when navigating to clients section
    if (section === 'clients') {
      const url = new URL(window.location.href);
      // Clear old parameters
      url.searchParams.delete('addClient');
      url.searchParams.delete('name');
      url.searchParams.delete('email');
      url.searchParams.delete('status');
      // Add current niche to URL so clients page knows which niche to use
      url.searchParams.set('niche', selectedNiche);
      window.history.replaceState({}, '', url.toString());
    }
    
    // Auto-close sidebar on mobile after navigation
    if (mounted && window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  };

  const handleNicheChange = (niche: string) => {
    // Map singular niche IDs to plural forms for consistency with NicheContext
    const nicheMap: { [key: string]: string } = {
      'creator': 'creators',
      'coach': 'coaches',
      'podcaster': 'podcasters',
      'freelancer': 'freelancers'
    };
    
    const mappedNiche = nicheMap[niche] || niche;
    
    // Allow switching to any niche for Tango Core users
    console.log(`Switching to niche: ${niche} (mapped to: ${mappedNiche})`);
    
    setSelectedNiche(mappedNiche);
    
    // Save the selected niche to localStorage
    if (mounted) {
      localStorage.setItem('selectedNiche', mappedNiche);
    }
    
    // Update URL to trigger NicheContext update
    const url = new URL(window.location.href);
    url.searchParams.set('niche', mappedNiche);
    window.history.replaceState({}, '', url.toString());
    

    
    // Auto-switch to analytics dashboard for coach niche
    if (niche === 'coach' && activeSection === 'dashboard') {
      setActiveSection('analytics');
    }
    
    // If currently on clients page, update the URL to reflect the new niche
    if (activeSection === 'clients') {
      const url = new URL(window.location.href);
      url.searchParams.set('niche', niche);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleSettings = () => {
    setActiveSection("settings");
  };

  const handleLogout = () => {
    // Use signOut with immediate redirect - don't wait for callback
    signOut({ redirectUrl: '/' });
  };

  // Remove handleAddNiche and handleNicheUpgrade since all niches are included in Tango Core

  // Add effect to refresh payment status when returning from payment success
  useEffect(() => {
    const handleFocus = () => {
      // Check if user just returned from a payment flow
      const referrer = document.referrer;
      const isFromPayment = referrer.includes('/payment-success') || 
                           referrer.includes('/onboarding/success') || 
                           referrer.includes('stripe.com');
      
      if (isFromPayment) {
        console.log('🔧 User returned from payment flow, refreshing payment status...');
        // Clear cache and refresh to see updated niches
        clearCache();
        refreshPaymentStatus();
        
        // Also refresh after a delay to ensure webhook has processed
        setTimeout(() => {
          console.log('🔧 Delayed refresh to ensure webhook processing...');
          clearCache();
          refreshPaymentStatus();
        }, 3000);
      }
    };

    // Listen for when the user returns to the tab
    window.addEventListener('focus', handleFocus);
    
    // Also check on mount if user came from payment
    handleFocus();
    
    return () => window.removeEventListener('focus', handleFocus);
  }, [clearCache, refreshPaymentStatus]);

  // Show loading state while checking onboarding status or during mounting
  if (isCheckingOnboarding || !mounted || !user) {
    console.log('🔧 Dashboard loading state:', { isCheckingOnboarding, mounted, user: !!user });
    return <LoadingScreen />;
  }

  // Debug log for sidebar state
  console.log('🔧 Dashboard ready:', { 
    user: !!user, 
    mounted, 
    sidebarCollapsed, 
    selectedNiche,
    availableNiches 
  });

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`h-screen flex overflow-hidden ${
        selectedNiche === 'creators' || selectedNiche === 'coaches' || selectedNiche === 'podcasters' || selectedNiche === 'freelancers'
          ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100' 
          : 'bg-background'
      }`} style={{ touchAction: 'manipulation' }}>
        <div className="flex h-full w-full">
          {/* Mobile Sidebar Overlay */}
          <MobileSidebarOverlay 
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
          
          {/* Sidebar - Always render when user is authenticated */}
          {user && (
            <div className={cn(
              "fixed lg:relative z-[60] h-full transition-all duration-300 ease-in-out sidebar-container",
              "lg:translate-x-0 flex-shrink-0",
              sidebarCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0",
              // Ensure sidebar is always visible on desktop, but can slide on mobile
              "lg:block",
              // Improve mobile touch targets
              "touch-manipulation",
              // Mobile-specific improvements
              "lg:min-w-[280px] min-w-[280px] max-w-[280px]",
              // Ensure proper mobile positioning
              "left-0 top-0",
              // Ensure proper width when collapsed - collapse to just icon width
              sidebarCollapsed ? "lg:w-16 lg:min-w-16 lg:max-w-16" : "lg:w-[280px] lg:min-w-[280px] lg:max-w-[280px]"
            )}>
              <SidebarNavigation
                activeItem={activeSection}
                activeNiche={selectedNiche}
                onNavigationChange={handleNavigationChange}
                onNicheChange={handleNicheChange}
                onAddNiche={() => {}} // Removed handleAddNiche
                onSettings={handleSettings}
                onLogout={handleLogout}
                subscribedNiches={availableNiches}
                isSubscribed={isSubscribed}
                hasCorePlan={hasCorePlan}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => {
                  const newState = !sidebarCollapsed;
                  setSidebarCollapsed(newState);
                  // Save to localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
                  }
                }}
              />
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out">
            {/* Mobile Menu Toggle */}
            <div             className={`lg:hidden flex items-center justify-between p-4 border-b flex-shrink-0 ${
              selectedNiche === 'creators' || selectedNiche === 'coaches' || selectedNiche === 'podcasters' || selectedNiche === 'freelancers'
                ? 'border-slate-200 bg-white/80 backdrop-blur-sm' 
                : 'border-border bg-card'
            }`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newState = !sidebarCollapsed;
                  console.log('🔧 Mobile menu toggle clicked, current state:', sidebarCollapsed, 'new state:', newState);
                  console.log('🔧 Window width:', window.innerWidth, 'is mobile:', window.innerWidth < 1024);
                  setSidebarCollapsed(newState);
                  // Save to localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
                  }
                }}
                className="touch-manipulation min-h-[44px] min-w-[44px] hover:bg-gray-100 active:bg-gray-200"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="touch-manipulation min-h-[44px] min-w-[44px] hover:bg-gray-100 active:bg-gray-200"
                    aria-label="User menu"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-[80]">
                  <DropdownMenuItem 
                    onClick={() => {
                      console.log('🔧 Settings clicked');
                      handleSettings();
                    }} 
                    className="flex items-center gap-2 cursor-pointer p-3 min-h-[44px]"
                  >
                    <Settings size={16} />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      console.log('🔧 Logout clicked');
                      handleLogout();
                    }} 
                    className="flex items-center gap-2 text-destructive cursor-pointer p-3 min-h-[44px]"
                  >
                    <LogOut size={16} />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Main Content */}
            <div className="flex-1 main-content-container dashboard-content">
              <ErrorBoundary error={error}>
                <MainContent />
              </ErrorBoundary>
            </div>

          </div>
        </div>
      </div>

      {/* Remove NicheUpgradeModal since all niches are included in Tango Core */}
    </AppContext.Provider>
  );
}

function MainDashboard() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <MainDashboardWithSearchParams />
    </Suspense>
  );
}



// Protected Dashboard Component
export default function ProtectedDashboard() {
  return (
    <>
      <SignedIn>
        <PaymentVerification requireActiveSubscription={false} requireOnboarding={true}>
          <NicheProvider>
            <TimezoneProvider>
              <AnalyticsProvider>
                <EventRefreshProvider>
                  <MainDashboard />
                </EventRefreshProvider>
              </AnalyticsProvider>
            </TimezoneProvider>
          </NicheProvider>
        </PaymentVerification>
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign up or sign in to access your dashboard.</p>
            <div className="flex gap-4 justify-center">
              <Link href="https://accounts.gotangocrm.com/sign-up" className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600 transition-colors">
                Sign Up
              </Link>
              <Link href="https://accounts.gotangocrm.com/sign-in" className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
