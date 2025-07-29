"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Bell, CreditCard, Save, Loader2, AlertTriangle } from 'lucide-react';
import { TimezonePicker } from '@/components/TimezonePicker';
import { useTimezone } from '@/hooks/use-timezone';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useNotifications } from '@/hooks/use-notifications';
import { BillingManagement } from '@/components/app/billing-management';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUser } from '@clerk/nextjs';

function SettingsPage() {
  const { user } = useUser();
  const { userTimezone, updateTimezone } = useTimezone();
  const { 
    profile, 
    isLoading: profileLoading, 
    error: profileError, 
    updateProfile, 
    email, 
    fullName, 
    timezone: profileTimezone 
  } = useUserProfile();
  
  const {
    preferences: notificationPreferences,
    isLoading: notificationsLoading,
    error: notificationsError,
    updatePreferences: updateNotificationPreferences,
    emailEnabled,
    migrationPending
  } = useNotifications();

  // Local state for form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    timezone: 'America/New_York',
    language: 'en'
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      const nameParts = (profile.full_name || '').split(' ');
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: profile.email || '',
        company: '', // Not stored in current schema
        timezone: profile.timezone || 'America/New_York',
        language: 'en' // Not stored in current schema
      });
    }
  }, [profile]);

  // Update timezone when profile timezone changes
  useEffect(() => {
    if (profileTimezone && profileTimezone !== userTimezone) {
      updateTimezone(profileTimezone);
    }
  }, [profileTimezone, userTimezone, updateTimezone]);

  const handleNotificationChange = async (key: string, value: boolean) => {
    try {
      setIsSavingNotifications(true);
      setSaveError(null);
      
      const result = await updateNotificationPreferences({ [key]: value });
      
      if (result) {
        setSaveSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      }
      // If result is null, there was an error but it's already handled in the hook
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to update notification preferences');
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleFormChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Update timezone in the hook if timezone changes
    if (key === 'timezone') {
      updateTimezone(value);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) {
      setSaveError('No profile found. Please complete onboarding first.');
      return;
    }

    setIsSavingProfile(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const updates = {
        full_name: fullName || null,
        email: formData.email,
        timezone: formData.timezone
      };

      await updateProfile(updates);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const isLoading = profileLoading || notificationsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (profileError || notificationsError) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error loading settings:</strong> {profileError || notificationsError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <Alert className="mb-6">
          <AlertDescription>
            <strong>Success!</strong> Your settings have been updated.
          </AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {saveError}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Subscription
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
                <p className="text-sm text-gray-500">
                  This is your primary email for account notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleFormChange('company', e.target.value)}
                  placeholder="Enter your company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <TimezonePicker 
                    className="w-full"
                    onTimezoneChange={(timezone) => handleFormChange('timezone', timezone)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={formData.language} onValueChange={(value) => handleFormChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="ko">Korean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" disabled={isSavingProfile}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {migrationPending && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Database Migration Pending:</strong> Your notification preferences are being saved locally. 
                To enable full persistence, please run the database migration in your Supabase dashboard.
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Communication Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailEnabled}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                      disabled={isSavingNotifications}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" disabled={isSavingNotifications}>
                  Cancel
                </Button>
                <Button disabled={isSavingNotifications}>
                  {isSavingNotifications ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Changes are saved automatically when you toggle the switch
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab - Now uses the enhanced BillingManagement component */}
        <TabsContent value="subscription" className="space-y-6">
          <BillingManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProtectedSettings() {
  return <SettingsPage />;
} 