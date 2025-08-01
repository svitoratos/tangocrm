import React, { createContext, useContext, useState, useCallback } from 'react';

interface EventRefreshContextType {
  refreshEvents: () => void;
  onEventRefresh: (callback: () => void) => void;
  triggerRefresh: () => void;
}

const EventRefreshContext = createContext<EventRefreshContextType | undefined>(undefined);

export const EventRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshCallbacks, setRefreshCallbacks] = useState<(() => void)[]>([]);

  const onEventRefresh = useCallback((callback: () => void) => {
    setRefreshCallbacks(prev => [...prev, callback]);
  }, []);

  const triggerRefresh = useCallback(() => {
    console.log('🔄 EventRefreshContext: Triggering refresh for', refreshCallbacks.length, 'components');
    refreshCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in event refresh callback:', error);
      }
    });
  }, [refreshCallbacks]);

  const refreshEvents = useCallback(() => {
    triggerRefresh();
  }, [triggerRefresh]);

  return (
    <EventRefreshContext.Provider value={{ refreshEvents, onEventRefresh, triggerRefresh }}>
      {children}
    </EventRefreshContext.Provider>
  );
};

export const useEventRefresh = () => {
  const context = useContext(EventRefreshContext);
  if (context === undefined) {
    throw new Error('useEventRefresh must be used within an EventRefreshProvider');
  }
  return context;
}; 