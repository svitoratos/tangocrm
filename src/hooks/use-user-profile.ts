import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  primary_niche: string | null;
  niches: string[] | null;
  onboarding_completed: boolean | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  subscription_tier: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoaded || !user) {
        console.log('🔧 useUserProfile: User not loaded or not authenticated');
        setIsLoading(false);
        return;
      }

      console.log('🔧 useUserProfile: Fetching profile for user:', user.emailAddresses[0]?.emailAddress);

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/user/profile');
        
        console.log('🔧 useUserProfile: API response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            // No profile found - this is not an error, just means user hasn't completed onboarding
            console.log('🔧 useUserProfile: No profile found (404) - user needs to complete onboarding');
            setProfile(null);
            return;
          }
          const errorText = await response.text();
          console.log('🔧 useUserProfile: API error response:', errorText);
          throw new Error(`Failed to fetch user profile: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('🔧 useUserProfile: Profile loaded:', data);
        setProfile(data);
      } catch (err) {
        console.error('❌ useUserProfile: Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isLoaded, user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      console.log('🔄 Updating user profile...');
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User profile not found. Please complete onboarding first.');
        }
        throw new Error('Failed to update user profile');
      }

      const updatedProfile = await response.json();
      console.log('✅ Profile updated:', updatedProfile);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    try {
      console.log('🔄 Refreshing user profile...');
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        if (response.status === 404) {
          setProfile(null);
          return;
        }
        throw new Error('Failed to refresh user profile');
      }

      const data = await response.json();
      console.log('✅ Profile refreshed:', data);
      setProfile(data);
    } catch (err) {
      console.error('❌ Error refreshing profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh user profile');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile,
    // Convenience getters
    hasProfile: !!profile,
    email: profile?.email || '',
    fullName: profile?.full_name || '',
    avatarUrl: profile?.avatar_url || '',
    timezone: profile?.timezone || 'America/New_York',
    primaryNiche: profile?.primary_niche || 'creator',
    niches: profile?.niches || [],
    onboardingCompleted: profile?.onboarding_completed || false,
    subscriptionStatus: profile?.subscription_status || 'inactive',
    subscriptionTier: profile?.subscription_tier || 'free',
  };
}; 