import { useState, useEffect } from 'react';
import { DateUtils } from '@/lib/date-utils';

export const useTimezone = () => {
  const [userTimezone, setUserTimezone] = useState<string>('America/New_York');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get timezone from browser
    const browserTimezone = DateUtils.getUserTimezone();
    setUserTimezone(browserTimezone);
    setIsLoading(false);
  }, []);

  const updateTimezone = (newTimezone: string) => {
    setUserTimezone(newTimezone);
    // Here you could also save to user preferences in the database
  };

  return {
    userTimezone,
    updateTimezone,
    isLoading
  };
}; 