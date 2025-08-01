"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  value: string;
  status: 'lead' | 'client' | 'guest' | 'inactive';
  notes: string;
  // Niche-specific fields
  podcastName?: string; // For podcaster niche
  episodeNumber?: string; // For podcaster niche
  coachingProgram?: string; // For coach niche
  sessionCount?: string; // For coach niche
  projectType?: string; // For freelancer niche
  hourlyRate?: string; // For freelancer niche
  brandName?: string; // For creator niche
  collaborationType?: string; // For creator niche
}

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<ContactFormData>;
  onSave: (data: ContactFormData) => Promise<void>;
  title?: string;
  activeNiche?: string;
}

export default function ContactFormModal({
  open,
  onOpenChange,
  initialData = {},
  onSave,
  title = "Add New Contact",
  activeNiche = 'creator'
}: ContactFormModalProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    value: '',
    status: 'client',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        value: '',
        status: 'client',
        notes: ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Failed to save contact. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      value: '',
      status: 'client',
      notes: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div>
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter contact name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone"
              />
            </div>
          </div>

          <div>
            <Label>Company</Label>
            <Input
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Enter company name"
            />
          </div>

          <div>
            <Label>Address</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Value</Label>
              <Input
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="e.g., $5000"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                                  <SelectContent>
                    {activeNiche === 'podcaster' && (
                      <>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="inactive">Archived</SelectItem>
                      </>
                    )}
                    {activeNiche === 'coach' && (
                      <>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="inactive">Archived</SelectItem>
                      </>
                    )}
                    {activeNiche === 'freelancer' && (
                      <>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="inactive">Archived</SelectItem>
                      </>
                    )}
                    {activeNiche === 'creator' && (
                      <>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="brand">Brand</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="inactive">Archived</SelectItem>
                      </>
                    )}
                  </SelectContent>
              </Select>
            </div>
          </div>

                      <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about this contact"
                rows={2}
              />
            </div>

            {/* Niche-specific fields */}
            {activeNiche === 'podcaster' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Podcast Name</Label>
                    <Input
                      value={formData.podcastName || ''}
                      onChange={(e) => setFormData({ ...formData, podcastName: e.target.value })}
                      placeholder="Guest's podcast name"
                    />
                  </div>
                  <div>
                    <Label>Episode Number</Label>
                    <Input
                      value={formData.episodeNumber || ''}
                      onChange={(e) => setFormData({ ...formData, episodeNumber: e.target.value })}
                      placeholder="e.g., #123"
                    />
                  </div>
                </div>
              </>
            )}

            {activeNiche === 'coach' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Coaching Program</Label>
                    <Input
                      value={formData.coachingProgram || ''}
                      onChange={(e) => setFormData({ ...formData, coachingProgram: e.target.value })}
                      placeholder="Program name"
                    />
                  </div>
                  <div>
                    <Label>Session Count</Label>
                    <Input
                      value={formData.sessionCount || ''}
                      onChange={(e) => setFormData({ ...formData, sessionCount: e.target.value })}
                      placeholder="e.g., 12 sessions"
                    />
                  </div>
                </div>
              </>
            )}

            {activeNiche === 'freelancer' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Project Type</Label>
                    <Input
                      value={formData.projectType || ''}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      placeholder="e.g., Web Development"
                    />
                  </div>
                  <div>
                    <Label>Hourly Rate</Label>
                    <Input
                      value={formData.hourlyRate || ''}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      placeholder="e.g., $75/hour"
                    />
                  </div>
                </div>
              </>
            )}

            {activeNiche === 'creator' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Brand Name</Label>
                    <Input
                      value={formData.brandName || ''}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      placeholder="Brand/company name"
                    />
                  </div>
                  <div>
                    <Label>Collaboration Type</Label>
                    <Input
                      value={formData.collaborationType || ''}
                      onChange={(e) => setFormData({ ...formData, collaborationType: e.target.value })}
                      placeholder="e.g., Sponsored Post"
                    />
                  </div>
                </div>
              </>
            )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Create Contact'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 