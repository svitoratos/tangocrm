"use client";

import React, { useState, createContext, useContext, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SidebarNavigation } from "@/components/app/sidebar-navigation";
import { NicheUpgradeModal } from "@/components/app/niche-upgrade-modal";
import DashboardOverview from "@/components/app/dashboard-overview";
import CRMPipelineView from "@/components/app/crm-pipeline-view";
import { CalendarComponent } from "@/components/app/calendar-view";
import AnalyticsDashboard from "@/components/app/analytics-dashboard";
import { ProgramsContentHub } from "@/components/app/programs-content-hub";
import { BulletproofCreatorJournal } from "@/components/app/BulletproofCreatorJournal";
import ClientsPage from "./clients/page";
import SettingsPage from "./settings/page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertCircle, Menu, Share2, Trophy, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, RedirectToSignIn, useClerk, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { NicheProvider } from "@/contexts/NicheContext";
import { TimezoneProvider } from "@/contexts/TimezoneContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { PaymentVerification } from "@/components/app/payment-verification";
import { usePaymentStatus } from "@/hooks/use-payment-status";

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
          { id: "journal", label: "Journal/Goals", component: BulletproofCreatorJournal, requiresNiche: false },
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
          <Component activeNiche={selectedNiche} onNavigate={(section: string) => setActiveSection(section)} />
        ) : (
          <Component 
            {...(currentNavItem.requiresNiche ? { activeNiche: selectedNiche } : {})}
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
const MobileSidebarOverlay: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppContext();

  if (sidebarCollapsed) return null;

  return (
    <div 
      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
      onClick={() => setSidebarCollapsed(true)}
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
  const [selectedNiche, setSelectedNiche] = useState("creator");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Default to expanded on desktop
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  // Get actual subscribed niches from payment status
  const { niches: subscribedNiches, primaryNiche, isLoading: paymentStatusLoading } = usePaymentStatus();
  const { user: currentUser } = useUser();
  
  // Ensure admin users always have access to all niches
  const adminEmails = ['stevenvitoratos@gmail.com'];
  const isAdmin = currentUser?.emailAddresses?.[0]?.emailAddress && adminEmails.includes(currentUser.emailAddresses[0].emailAddress);
  const availableNiches = isAdmin ? ['creator', 'coach', 'podcaster', 'freelancer'] : subscribedNiches;

  // Handle URL parameters for section and niche
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    const nicheParam = searchParams.get('niche');
    
    if (sectionParam && NAVIGATION_ITEMS.find(item => item.id === sectionParam)) {
      setActiveSection(sectionParam);
    }
    
    // Only allow switching to subscribed niches
    if (nicheParam && AVAILABLE_NICHES.find(niche => niche.id === nicheParam) && availableNiches.includes(nicheParam)) {
      setSelectedNiche(nicheParam);
    }
  }, [searchParams, subscribedNiches]);

  // Check if user has completed onboarding and set initial niche
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Set initial niche based on user's subscriptions
  useEffect(() => {
    if (!paymentStatusLoading && availableNiches.length > 0) {
      // If current selected niche is not in available niches, switch to primary niche
      if (!availableNiches.includes(selectedNiche)) {
        setSelectedNiche(primaryNiche || availableNiches[0]);
      }
    }
  }, [availableNiches, selectedNiche, primaryNiche, paymentStatusLoading]);

  // Handle upgrade success redirect
  useEffect(() => {
    const upgradeStatus = searchParams.get('upgrade');
    const upgradedNiche = searchParams.get('niche');
    
    if (upgradeStatus === 'success' && upgradedNiche) {
      // Switch to the newly upgraded niche
      setSelectedNiche(upgradedNiche);
      
      // Clear the URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('upgrade');
      url.searchParams.delete('niche');
      window.history.replaceState({}, '', url.toString());
      
      // Show success message
      console.log(`Successfully upgraded to ${upgradedNiche} niche!`);
    }
  }, [searchParams]);

  const checkOnboardingStatus = async () => {
    // Skip onboarding check for development - allow direct access
    setIsCheckingOnboarding(false);
  };

  // Handle client-side mounting to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
    
    // Set initial sidebar state based on screen size after mounting
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
      // On desktop, keep the sidebar expanded by default
    };

    // Set initial state
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSubscribed = (niche: string) => availableNiches.includes(niche);
  
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
    // Only allow switching to available niches
    if (!availableNiches.includes(niche)) {
      console.warn(`User not subscribed to niche: ${niche}`);
      return;
    }
    
    setSelectedNiche(niche);
    
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

  const handleAddNiche = () => {
    // For local storage version, allow access to all niches
    setIsUpgradeModalOpen(true);
  };

  const handleNicheUpgrade = async (nicheId: string, billingCycle: 'monthly' | 'yearly') => {
    try {
      setIsLoading(true);
      
      // Redirect to the add niche payment link
      const addNichePaymentLink = 'https://buy.stripe.com/14A28s5l0dqzgZG0XO2Nq02';
      window.open(addNichePaymentLink, '_blank');
      
      setIsUpgradeModalOpen(false);
      console.log(`Redirecting to add ${nicheId} niche payment`);
    } catch (error) {
      console.error('Error upgrading niche:', error);
      setError('Failed to process upgrade request');
    } finally {
      setIsLoading(false);
      setIsUpgradeModalOpen(false);
    }
  };

  // Show loading state while checking onboarding status or during mounting
  if (isCheckingOnboarding || !mounted) {
    return <LoadingScreen />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`h-screen flex overflow-hidden ${
        selectedNiche === 'creator' || selectedNiche === 'coach' || selectedNiche === 'podcaster' || selectedNiche === 'freelancer'
          ? 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100' 
          : 'bg-background'
      }`}>
        <div className="flex h-full w-full">
          {/* Mobile Sidebar Overlay */}
          <MobileSidebarOverlay />
          
          {/* Sidebar */}
          <div className={cn(
            "fixed lg:relative z-50 h-full transition-all duration-300 ease-in-out sidebar-container",
            "lg:translate-x-0 flex-shrink-0",
            sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
          )}>
            <SidebarNavigation
              activeItem={activeSection}
              activeNiche={selectedNiche}
              onNavigationChange={handleNavigationChange}
              onNicheChange={handleNicheChange}
              onAddNiche={handleAddNiche}
              onSettings={handleSettings}
              onLogout={handleLogout}
              subscribedNiches={availableNiches}
              isSubscribed={isSubscribed}
              hasCorePlan={hasCorePlan}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Mobile Menu Toggle */}
            <div className={`lg:hidden flex items-center justify-between p-4 border-b flex-shrink-0 ${
              selectedNiche === 'creator' || selectedNiche === 'coach' || selectedNiche === 'podcaster' || selectedNiche === 'freelancer'
                ? 'border-slate-200 bg-white/80 backdrop-blur-sm' 
                : 'border-border bg-card'
            }`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <span className={`font-semibold ${
                selectedNiche === 'creator' || selectedNiche === 'coach' || selectedNiche === 'podcaster' || selectedNiche === 'freelancer' ? 'text-slate-900' : 'text-foreground'
              }`}>
                {selectedNiche === 'creator' ? 'Creator CRM' : 
                 selectedNiche === 'coach' ? 'Coach CRM' : 
                 selectedNiche === 'podcaster' ? 'Podcaster CRM' :
                 selectedNiche === 'freelancer' ? 'Freelancer CRM' : 'NicheCRM'}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleSettings} className="flex items-center gap-2">
                    <Settings size={16} />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive">
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

            {/* Floating Action Button - Creator Niche Only */}
            {selectedNiche === 'creator' && (
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
            )}


          </div>
        </div>
      </div>

      {/* Niche Upgrade Modal */}
      <NicheUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentNiche={selectedNiche}
        hasCorePlan={hasCorePlan()}
      />
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
        <PaymentVerification requireActiveSubscription={true} requireOnboarding={true}>
          <NicheProvider>
            <TimezoneProvider>
              <AnalyticsProvider>
                <MainDashboard />
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
              <Link href="/sign-up" className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600 transition-colors">
                Sign Up
              </Link>
              <Link href="/signin" className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
