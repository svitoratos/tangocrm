import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface NotificationPreferences {
  email: boolean;
}

interface NotificationData {
  email_notifications_enabled: boolean | null;
  notification_preferences: NotificationPreferences | null;
  message?: string;
}

export const useNotifications = () => {
  const { user, isLoaded } = useUser();
  const [preferences, setPreferences] = useState<NotificationPreferences>({ email: true });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrationPending, setMigrationPending] = useState(false);

  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      if (!isLoaded || !user) {
        console.log('🔧 useNotifications: User not loaded or not authenticated');
        setIsLoading(false);
        return;
      }

      console.log('🔧 useNotifications: Fetching notification preferences for user:', user.emailAddresses[0]?.emailAddress);

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/user/notifications');

        console.log('🔧 useNotifications: API response status:', response.status);

        if (!response.ok) {
          if (response.status === 404) {
            console.log('🔧 useNotifications: No preferences found (404) - using defaults');
            setPreferences({ email: true });
            return;
          }
          const errorText = await response.text();
          console.log('🔧 useNotifications: API error response:', errorText);
          throw new Error(`Failed to fetch notification preferences: ${response.status} ${errorText}`);
        }

        const data: NotificationData = await response.json();
        console.log('🔧 useNotifications: Preferences loaded:', data);
        
        // Check if migration is pending
        if (data.message && data.message.includes('migration pending')) {
          console.log('⚠️ useNotifications: Database migration pending');
          setMigrationPending(true);
        }
        
        // Use database preferences or defaults
        const emailEnabled = data.email_notifications_enabled ?? true;
        const notificationPrefs = data.notification_preferences ?? { email: true };
        
        setPreferences({
          email: emailEnabled && notificationPrefs.email
        });
      } catch (err) {
        console.error('❌ useNotifications: Error fetching preferences:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch notification preferences');
        // Use defaults on error
        setPreferences({ email: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationPreferences();
  }, [isLoaded, user]);

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      console.log('🔄 Updating notification preferences...');
      setIsLoading(true);
      setError(null);

      const newPreferences = { ...preferences, ...updates };

      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('User profile not found. Please complete onboarding first.');
          return;
        }
        setError('Failed to update notification preferences');
        return;
      }

      const updatedData: NotificationData = await response.json();
      console.log('✅ Notification preferences updated:', updatedData);
      
      // Check if migration is pending
      if (updatedData.message && updatedData.message.includes('migration pending')) {
        console.log('⚠️ useNotifications: Database migration pending');
        setMigrationPending(true);
      }
      
      setPreferences(newPreferences);
      return updatedData;
    } catch (err) {
      console.error('❌ Error updating notification preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notification preferences');
      // Don't throw the error - just set it in state
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPreferences = async () => {
    if (!user) return;

    try {
      console.log('🔄 Refreshing notification preferences...');
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user/notifications');

      if (!response.ok) {
        if (response.status === 404) {
          setPreferences({ email: true });
          return;
        }
        throw new Error('Failed to refresh notification preferences');
      }

      const data: NotificationData = await response.json();
      console.log('✅ Notification preferences refreshed:', data);
      
      // Check if migration is pending
      if (data.message && data.message.includes('migration pending')) {
        console.log('⚠️ useNotifications: Database migration pending');
        setMigrationPending(true);
      }
      
      const emailEnabled = data.email_notifications_enabled ?? true;
      const notificationPrefs = data.notification_preferences ?? { email: true };
      
      setPreferences({
        email: emailEnabled && notificationPrefs.email
      });
    } catch (err) {
      console.error('❌ Error refreshing notification preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refreshPreferences,
    emailEnabled: preferences.email,
    migrationPending,
  };
}; 