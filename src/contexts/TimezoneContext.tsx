"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

interface TimezoneContextType {
  userTimezone: string;
  setUserTimezone: (timezone: string) => void;
  isLoading: boolean;
  updateTimezone: (timezone: string) => Promise<void>;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export const useTimezoneContext = () => {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezoneContext must be used within a TimezoneProvider');
  }
  return context;
};

interface TimezoneProviderProps {
  children: ReactNode;
}

export const TimezoneProvider: React.FC<TimezoneProviderProps> = ({ children }) => {
  const { user } = useUser();
  const [userTimezone, setUserTimezone] = useState<string>('UTC');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's timezone on mount
  useEffect(() => {
    const fetchUserTimezone = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/timezone');
        if (response.ok) {
          const data = await response.json();
          setUserTimezone(data.timezone || 'UTC');
        }
      } catch (error) {
        console.error('Error fetching user timezone:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTimezone();
  }, [user]);

  // Auto-detect timezone if user hasn't set one
  useEffect(() => {
    const autoDetectTimezone = async () => {
      if (!user || userTimezone !== 'UTC' || isLoading) return;

      try {
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (detectedTimezone && detectedTimezone !== 'UTC') {
          await updateTimezone(detectedTimezone);
        }
      } catch (error) {
        console.error('Error auto-detecting timezone:', error);
      }
    };

    autoDetectTimezone();
  }, [user, userTimezone, isLoading]);

  const updateTimezone = async (timezone: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/timezone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timezone }),
      });

      if (response.ok) {
        setUserTimezone(timezone);
      } else {
        console.error('Failed to update timezone');
      }
    } catch (error) {
      console.error('Error updating timezone:', error);
    }
  };

  const value: TimezoneContextType = {
    userTimezone,
    setUserTimezone,
    isLoading,
    updateTimezone,
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
}; 