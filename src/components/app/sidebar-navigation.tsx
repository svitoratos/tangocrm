"use client"

import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Briefcase,
  ChevronDown,
  Plus,
  User,
  Settings,
  LogOut,
  Video,
  GraduationCap,
  Mic,
  PenTool,
  FileText,
  Camera,
  BookOpen,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/hooks/use-admin'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NavigationItemProps {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  isCollapsed?: boolean
  onClick?: () => void
}

interface Niche {
  id: string
  name: string
  label: string
  icon: React.ReactNode
  color: string
}

interface SidebarNavigationProps {
  activeItem?: string
  activeNiche?: string
  onNavigationChange?: (item: string) => void
  onNicheChange?: (niche: string) => void
  onAddNiche?: () => void
  onSettings?: () => void
  onLogout?: () => void
  subscribedNiches?: string[]
  isSubscribed?: (niche: string) => boolean
  hasCorePlan?: () => boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  icon,
  label,
  isActive = false,
  isCollapsed = false,
  onClick
}) => {
  return (
    <button
      onClick={() => {
        console.log('🔧 Navigation item clicked:', label);
        onClick?.();
      }}
      className={cn(
        "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group touch-manipulation",
        "min-h-[44px]", // Ensure minimum touch target size for mobile
        "active:scale-[0.98] transform", // Add touch feedback
        isActive 
          ? 'bg-primary text-primary-foreground shadow-sm' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent/70'
      )}
      style={{ touchAction: 'manipulation' }}
    >
      <div className={cn(
        "flex-shrink-0 transition-colors duration-200",
        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
      )}>
        {icon}
      </div>
      
      {!isCollapsed && (
        <span className="font-medium text-sm truncate">
          {label}
        </span>
      )}

      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full" />
      )}
    </button>
  )
}

const AdminNavigationItem: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed = false }) => {
  const { user } = useUser();
  const router = useRouter();
  
  // Only show admin link for specific email
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail === 'stevenvitoratos@gmail.com';
  
  console.log('AdminNavigationItem render:', { 
    isAdmin, 
    userEmail,
    userId: user?.id
  });
  
  // Only show admin link if user has the specific email
  if (!isAdmin) return null;
  
  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('🔧 Admin link clicked! Navigating to /admin');
    console.log('🔧 Current URL:', window.location.href);
    console.log('🔧 Current pathname:', window.location.pathname);
    
    // Try using Next.js router with replace to avoid history issues
    console.log('🔧 Using router.replace to /admin');
    router.replace('/admin');
  };
  
  return (
    <button
      onClick={handleAdminClick}
      className={cn(
        "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group touch-manipulation",
        "min-h-[44px] active:scale-[0.98] transform", // Ensure minimum touch target size and add touch feedback
        'text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent/70'
      )}
      style={{ touchAction: 'manipulation' }}
    >
      <div className="flex-shrink-0 transition-colors duration-200 text-muted-foreground group-hover:text-foreground">
        <Shield size={20} />
      </div>
      
      {!isCollapsed && (
        <span className="font-medium text-sm truncate">
          Admin
        </span>
      )}
    </button>
  );
};

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeItem = "dashboard",
  activeNiche = "creator",
  onNavigationChange = () => {},
  onNicheChange = () => {},
  onAddNiche = () => {},
  onSettings = () => {},
  onLogout = () => {},
  subscribedNiches = ["creator"],
  isSubscribed = (niche: string) => subscribedNiches.includes(niche),
  hasCorePlan = () => false,
  isCollapsed = false,
  onToggleCollapse = () => {}
  }) => {
    const { user } = useUser();
    
    // Get user's display name from Clerk
    const getUserDisplayName = () => {
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
    
    // Get user's initials for avatar
    const getUserInitials = () => {
      if (!user) return 'U';
      
      if (user.firstName && user.lastName) {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
      }
      
      if (user.firstName) {
        return user.firstName[0].toUpperCase();
      }
      
      if (user.emailAddresses?.[0]?.emailAddress) {
        return user.emailAddresses[0].emailAddress[0].toUpperCase();
      }
      
      return 'U';
    };
    const niches: Niche[] = [
      { 
        id: 'creator', 
        name: 'Creator', 
        label: 'Content Creator',
        icon: <Video size={16} />,
        color: '#8b5cf6'
      },
      { 
        id: 'coach', 
        name: 'Coach', 
        label: 'Online Coach',
        icon: <GraduationCap size={16} />,
        color: '#10b981'
      },
      { 
        id: 'podcaster', 
        name: 'Podcaster', 
        label: 'Podcast Host',
        icon: <Mic size={16} />,
        color: '#f97316'
      },
      { 
        id: 'freelancer', 
        name: 'Freelancer', 
        label: 'Freelancer/Consultant',
        icon: <Briefcase size={16} />,
        color: '#3b82f6'
      }
    ]

    // CRITICAL FIX: Only show niches that the user is actually subscribed to
    const availableNiches = niches.filter(niche => isSubscribed(niche.id));

    // Ensure we have a valid current niche from available ones only
    const currentNiche = availableNiches.find(n => n.id === activeNiche) || availableNiches[0] || null;

    // If no niches are available, show a fallback
    if (availableNiches.length === 0) {
      console.warn('⚠️ No subscribed niches available for user');
    }

    // Force re-render when subscribedNiches changes
    React.useEffect(() => {
      console.log('🔧 Sidebar: subscribedNiches changed:', subscribedNiches);
      console.log('🔧 Sidebar: availableNiches filtered:', availableNiches);
      console.log('🔧 Sidebar: currentNiche selected:', currentNiche);
    }, [subscribedNiches, availableNiches, currentNiche]);

  const getNavigationItems = (niche: string) => {
    const baseItems = [
      { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
      { id: 'crm', icon: <Users size={20} />, label: 'CRM' },
      { id: 'clients', icon: <User size={20} />, label: 'Contact Management' },
      { id: 'calendar', icon: <Calendar size={20} />, label: 'Calendar' },
      { id: 'analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
      { id: 'journal', icon: <BookOpen size={20} />, label: 'Journal/Goals' }
    ]

    const programLabels: Record<string, { label: string; icon: React.ReactNode }> = {
      creator: { 
        label: 'Content Hub', 
        icon: <Camera size={20} />
      },
      coach: { 
        label: 'Programs', 
        icon: <GraduationCap size={20} />
      },
      podcaster: { 
        label: 'Episodes', 
        icon: <Mic size={20} />
      }
    }

    const programConfig = programLabels[niche] || { label: 'Programs', icon: <Briefcase size={20} /> }

    if (niche === 'freelancer') {
      return baseItems
    }

    return [
      ...baseItems,
      {
        id: 'programs',
        icon: programConfig.icon,
        label: programConfig.label
      }
    ]
  }

  const navigationItems = getNavigationItems(activeNiche)

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-white border-r border-neutral-200 relative min-h-0 shrink-0",
      )}
      style={{
        width: isCollapsed ? "60px" : "300px",
        transition: "width 0.3s ease-in-out"
      }}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleCollapse}
        className={cn(
          "absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-neutral-200 bg-white shadow-sm",
          "hover:bg-neutral-50 transition-colors duration-200"
        )}
      >
        {isCollapsed ? (
          <ChevronRight size={14} />
        ) : (
          <ChevronLeft size={14} />
        )}
      </Button>

      {/* Logo - Always visible at top */}
      <div className="px-4 pt-4 pb-2">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
          </div>
        ) : (
          <img
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1752032941301-0xul9i1n0y4r.png"
            alt="Tango Logo"
            width={175}
            height={140}
            className="object-contain"
            style={{ height: 'auto' }}
          />
        )}
      </div>

      {/* Sidebar Content */}
      <div className="flex flex-1 flex-col px-4 py-2 overflow-hidden min-h-0">
        <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
          
          {/* Niche Selector - Positioned above navigation items */}
          <div className="mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full justify-between h-auto p-3 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/30 hover:bg-blue-50/50 transition-all duration-200 touch-manipulation",
                    "min-h-[44px] active:scale-[0.98] transform", // Ensure minimum touch target size and add touch feedback
                    isCollapsed && "w-10 h-10 p-0 justify-center border-2"
                  )}
                  style={{ touchAction: 'manipulation' }}
                >
                  {!isCollapsed && (
                    <div className="flex items-center gap-3">
                      <div 
                        className="flex-shrink-0" 
                        style={{ 
                          color: isSubscribed(currentNiche?.id || 'creator') ? (currentNiche?.color || '#9ca3af') : '#9ca3af'
                        }}
                      >
                        {currentNiche?.icon || <Video size={16} />}
                      </div>
                      <span className={cn(
                        "text-sm font-semibold truncate",
                        !isSubscribed(currentNiche?.id || 'creator') && "text-muted-foreground font-normal"
                      )}>
                        {currentNiche?.label || 'Content Creator'}
                        {!isSubscribed(currentNiche?.id || 'creator') && (
                          <span className="ml-1 text-xs text-muted-foreground/60">
                            (Upgrade)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {isCollapsed && (
                    <div 
                      style={{ 
                        color: isSubscribed(currentNiche?.id || 'creator') ? (currentNiche?.color || '#9ca3af') : '#9ca3af'
                      }}
                    >
                      {currentNiche?.icon || <Video size={16} />}
                    </div>
                  )}
                  {!isCollapsed && (
                    <ChevronDown size={16} className="text-blue-500 flex-shrink-0" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[260px] z-[70] max-h-[80vh] overflow-y-auto">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Switch Business Type
                  </p>
                </div>
                {availableNiches
                  .map((niche) => {
                    return (
                      <DropdownMenuItem
                        key={niche.id}
                        onClick={() => onNicheChange(niche.id)}
                        className="flex items-center gap-3 p-3 cursor-pointer"
                      >
                        <div 
                          className="flex-shrink-0" 
                          style={{ 
                            color: niche.color
                          }}
                        >
                          {niche.icon}
                        </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {niche.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {niche.label}
                        </div>
                      </div>
                      {activeNiche === niche.id && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  );
                })}

                {/* Show message when no niches are available */}
                {availableNiches.length === 0 && (
                  <div className="px-3 py-2 text-center">
                    <div className="text-sm text-muted-foreground">
                      No business types available
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Please contact support or upgrade your plan
                    </div>
                  </div>
                )}

                {/* Remove the separator and add niche button since all niches are included in Tango Core */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        
          <div className="mt-2 flex flex-col gap-2 mb-4">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeItem === item.id}
                isCollapsed={isCollapsed}
                onClick={() => onNavigationChange(item.id)}
              />
            ))}
            
            {/* Admin Link - Only show for admin users */}
            <AdminNavigationItem isCollapsed={isCollapsed} />
            
            {!isCollapsed && (
              <div className="pt-2">
                <div className="px-3 py-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {currentNiche?.icon || <Video size={16} />}
                    <span>Optimized for {currentNiche?.label || 'Content Creator'}s</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Section - Always visible at bottom */}
      <div className="p-3 border-t border-border flex-shrink-0 bg-gray-50/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto p-3 hover:bg-accent touch-manipulation min-h-[44px] active:scale-[0.98] transform",
                isCollapsed ? 'justify-center px-2' : ''
              )}
              style={{ touchAction: 'manipulation' }}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.imageUrl || "/placeholder-avatar.jpg"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <div className="ml-3 flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {currentNiche?.label || 'Content Creator'}
                  </div>
                </div>
              )}
              
              {!isCollapsed && (
                <ChevronDown size={14} className="text-muted-foreground" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 z-[70]">
            <DropdownMenuItem 
              onClick={() => {
                console.log('🔧 Sidebar settings clicked');
                onSettings();
              }} 
              className="flex items-center gap-2 cursor-pointer p-3 min-h-[44px]"
            >
              <Settings size={16} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                console.log('🔧 Sidebar logout clicked');
                onLogout();
              }} 
              className="flex items-center gap-2 text-destructive cursor-pointer p-3 min-h-[44px]"
            >
              <LogOut size={16} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};