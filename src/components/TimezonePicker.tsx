"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';

// Get supported timezones from Intl API
const getSupportedTimezones = (): string[] => {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    // Fallback to common timezones if Intl.supportedValuesOf is not available
    return [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Australia/Sydney',
      'Pacific/Auckland'
    ];
  }
};

// Format timezone for display
const formatTimezone = (timezone: string): string => {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || timezone;
    const time = parts.find(part => part.type === 'hour')?.value + ':' + 
                 parts.find(part => part.type === 'minute')?.value + ' ' +
                 parts.find(part => part.type === 'dayPeriod')?.value;
    
    return `${timezone} (${timeZoneName})`;
  } catch {
    return timezone;
  }
};

interface TimezonePickerProps {
  className?: string;
  onTimezoneChange?: (timezone: string) => void;
  showLabel?: boolean;
  label?: string;
}

export const TimezonePicker: React.FC<TimezonePickerProps> = ({
  className = "",
  onTimezoneChange,
  showLabel = true,
  label = "Timezone"
}) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedTimezone, setSelectedTimezone] = useState<string>('UTC');
  const [isLoading, setIsLoading] = useState(false);
  const [timezones] = useState<string[]>(getSupportedTimezones());

  // Fetch user's current timezone on mount
  useEffect(() => {
    const fetchUserTimezone = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/user/timezone');
        if (response.ok) {
          const data = await response.json();
          setSelectedTimezone(data.timezone || 'UTC');
        }
      } catch (error) {
        console.error('Error fetching user timezone:', error);
      }
    };

    fetchUserTimezone();
  }, [user]);

  // Auto-detect and set timezone if user hasn't set one
  useEffect(() => {
    const autoDetectTimezone = async () => {
      if (!user || selectedTimezone !== 'UTC') return;

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
  }, [user, selectedTimezone]);

  const updateTimezone = async (newTimezone: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/timezone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timezone: newTimezone }),
      });

      if (response.ok) {
        setSelectedTimezone(newTimezone);
        onTimezoneChange?.(newTimezone);
        toast({
          title: "Timezone updated",
          description: `Your timezone has been set to ${formatTimezone(newTimezone)}`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update timezone",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating timezone:', error);
      toast({
        title: "Error",
        description: "Failed to update timezone",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimezoneChange = (value: string) => {
    updateTimezone(value);
  };

  return (
    <div className={className}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <Select
        value={selectedTimezone}
        onValueChange={handleTimezoneChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {timezones.map((timezone) => (
            <SelectItem key={timezone} value={timezone}>
              {formatTimezone(timezone)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}; 