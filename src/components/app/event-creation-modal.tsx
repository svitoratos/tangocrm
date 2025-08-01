"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, MapPin, User, Tag } from 'lucide-react';
import { DateUtils, validateEventDates } from '@/lib/date-utils';

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
  onDelete?: (eventId: string) => void;
  activeNiche?: string;
  isLoading?: boolean;
  selectedEvent?: any;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  duration: string;
  type: string;
  color: string;
  location: string;
  clientName: string;
  notes: string;
  tags: string[];
}

export const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  activeNiche = 'creator',
  isLoading = false,
  selectedEvent = null,
  selectedDate = null,
  onDateChange
}) => {
  const formatTimeToQuarterHour = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    // Round to nearest 15 minutes
    const roundedMinutes = Math.round(minutes / 15) * 15;
    const adjustedHours = hours + Math.floor(roundedMinutes / 60);
    const finalMinutes = roundedMinutes % 60;
    
    return `${adjustedHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  };

  const formatTimeForDisplay = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endTime: '',
    allDay: false,
    duration: '60',
    type: 'meeting',
    color: 'blue',
    location: '',
    clientName: '',
    notes: '',
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const formInitializedRef = useRef(false);

  // Reset form when modal opens or when selectedEvent changes
  useEffect(() => {
    if (isOpen && !formInitializedRef.current) {
      console.log('=== MODAL FORM SETUP DEBUG ===');
      console.log('selectedEvent:', selectedEvent);
      console.log('selectedDate:', selectedDate);
      console.log('isEditing:', selectedEvent && selectedEvent.type === 'calendar');
      
      if (selectedEvent && selectedEvent.type === 'calendar') {
        // Populate form with existing event data for editing
        const startDate = new Date(selectedEvent.start);
        const endDate = new Date(selectedEvent.end);
        
        console.log('Editing - startDate from event:', startDate);
        console.log('Editing - endDate from event:', endDate);
        
        const formDataForEdit = {
          title: selectedEvent.title || '',
          description: selectedEvent.description || '',
          startDate: DateUtils.formatForInput(startDate, DateUtils.getUserTimezone()),
          startTime: formatTimeToQuarterHour(startDate),
          endTime: formatTimeToQuarterHour(endDate),
          allDay: false,
          duration: '60',
          type: selectedEvent.eventType || 'meeting',
          color: selectedEvent.color || 'blue',
          location: selectedEvent.location || '',
          clientName: selectedEvent.clientName || '',
          notes: selectedEvent.notes || '',
          tags: selectedEvent.tags || []
        };
        
        console.log('Editing - formData:', formDataForEdit);
        setFormData(formDataForEdit);
      } else {
        // Reset form for new event
        const defaultDate = selectedDate || new Date();
        console.log('Creating - defaultDate:', defaultDate);
        console.log('Creating - selectedDate:', selectedDate);
        console.log('Creating - selectedDate type:', typeof selectedDate);
        console.log('Creating - selectedDate value:', selectedDate);
        console.log('Creating - defaultDate.toISOString():', defaultDate.toISOString());
        console.log('Creating - DateUtils.formatForInput result:', DateUtils.formatForInput(defaultDate, DateUtils.getUserTimezone()));
        
        const formDataForCreate = {
          title: '',
          description: '',
          startDate: DateUtils.formatForInput(defaultDate, DateUtils.getUserTimezone()),
          startTime: formatTimeToQuarterHour(defaultDate),
          endTime: formatTimeToQuarterHour(new Date(defaultDate.getTime() + 60 * 60 * 1000)),
          allDay: false,
          duration: '60',
          type: 'meeting',
          color: 'blue',
          location: '',
          clientName: '',
          notes: '',
          tags: []
        };
        
        console.log('Creating - formData:', formDataForCreate);
        setFormData(formDataForCreate);
      }
      setErrors({});
      setNewTag('');
      formInitializedRef.current = true;
    }
  }, [isOpen, selectedEvent, selectedDate]);
  
  // Reset the initialization flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      formInitializedRef.current = false;
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    console.log('🔄 handleInputChange called:', { field, value });
    console.log('📊 Current formData before update:', formData);
    
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('📊 Updated formData:', updated);
      return updated;
    });
    
    // If date is changed, update parent state
    if (field === 'startDate' && onDateChange) {
      console.log('📅 Date changed, updating parent state:', value);
      try {
        const newDate = new Date(value);
        if (!isNaN(newDate.getTime())) {
          onDateChange(newDate);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    // Validate that start date and time are set
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.allDay && !formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.allDay && !formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    console.log('=== HANDLE SAVE DEBUG ===');
    console.log('formData:', formData);
    console.log('formData.startDate:', formData.startDate);
    console.log('formData.startTime:', formData.startTime);
    console.log('formData.endTime:', formData.endTime);
    console.log('Type of formData.startDate:', typeof formData.startDate);
    console.log('Type of formData.startTime:', typeof formData.startTime);

    // Combine date and time for start
    console.log('🔧 Combining date and time:');
    console.log('  - formData.startDate:', formData.startDate);
    console.log('  - formData.startTime:', formData.startTime);
    console.log('  - User timezone:', DateUtils.getUserTimezone());
    
    const startDateTime = DateUtils.combineDateAndTime(formData.startDate, formData.startTime, DateUtils.getUserTimezone());

    console.log('🔧 Result startDateTime:', startDateTime);

    if (!startDateTime) {
      setErrors({ general: 'Invalid date/time combination' });
      return;
    }

    // Handle end time
    let endDateTime: Date;
    if (formData.allDay) {
      // For all-day events, end time is end of the same day
      endDateTime = new Date(startDateTime);
      endDateTime.setHours(23, 59, 59, 999);
    } else {
      // For timed events, use the end time field
      const endTimeDateTime = DateUtils.combineDateAndTime(formData.startDate, formData.endTime, DateUtils.getUserTimezone());
      if (!endTimeDateTime) {
        setErrors({ general: 'Invalid end time' });
        return;
      }
      endDateTime = endTimeDateTime;
    }

    console.log('endDateTime:', endDateTime);

    const eventData = {
      title: formData.title,
      description: formData.description,
      start_date: DateUtils.toISOString(startDateTime),
      end_date: DateUtils.toISOString(endDateTime),
      type: formData.type,
      color: formData.color,
      location: formData.location,
      client_name: formData.clientName,
      notes: formData.notes,
      tags: formData.tags,
      niche: activeNiche,
      status: 'scheduled'
    };

    console.log('Event data being passed to onSave:', eventData);
    console.log('🔧 Final start_date being saved:', eventData.start_date);
    console.log('🔧 Final end_date being saved:', eventData.end_date);
    onSave(eventData);
  };

  const getEventTypes = () => {
    const baseTypes = [
      { value: 'meeting', label: 'Meeting' },
      { value: 'content_creation', label: 'Content Creation' },
      { value: 'deadline', label: 'Deadline' },
      { value: 'reminder', label: 'Reminder' },
      { value: 'other', label: 'Other' }
    ];

    // Add niche-specific types
    if (activeNiche === 'creator') {
      baseTypes.push(
        { value: 'shoot', label: 'Content Shoot' },
        { value: 'editing', label: 'Editing Session' },
        { value: 'brand_meeting', label: 'Brand Meeting' }
      );
    } else if (activeNiche === 'coach') {
      baseTypes.push(
        { value: 'session', label: 'Coaching Session' },
        { value: 'discovery', label: 'Discovery Call' },
        { value: 'follow_up', label: 'Follow-up Call' }
      );
    } else if (activeNiche === 'podcaster') {
      baseTypes.push(
        { value: 'recording', label: 'Recording Session' },
        { value: 'interview', label: 'Guest Interview' },
        { value: 'editing', label: 'Editing Session' }
      );
    } else if (activeNiche === 'freelancer') {
      baseTypes.push(
        { value: 'client_meeting', label: 'Client Meeting' },
        { value: 'project_review', label: 'Project Review' },
        { value: 'delivery', label: 'Project Delivery' }
      );
    }

    return baseTypes;
  };

  const getColorOptions = () => [
    { value: 'blue', label: '🔵 Blue', emoji: '🔵' },
    { value: 'green', label: '🟢 Green', emoji: '🟢' },
    { value: 'orange', label: '🟠 Orange', emoji: '🟠' },
    { value: 'purple', label: '🟣 Purple', emoji: '🟣' },
    { value: 'yellow', label: '🟡 Yellow', emoji: '🟡' },
    { value: 'red', label: '🔴 Red', emoji: '🔴' }
  ];

  const getDurationOptions = () => [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' },
    { value: '240', label: '4 hours' },
    { value: '480', label: '8 hours (Full day)' },
    { value: 'custom', label: 'Custom duration' }
  ];

  const calculateEndTime = (startDate: string, startTime: string, durationMinutes: number) => {
    const startDateTime = DateUtils.combineDateAndTime(startDate, startTime, DateUtils.getUserTimezone());
    if (!startDateTime) return null;
    
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);
    return {
      endDate: DateUtils.formatForInput(endDateTime, DateUtils.getUserTimezone()),
      endTime: DateUtils.formatTimeForInput(endDateTime, DateUtils.getUserTimezone())
    };
  };

  const handleDurationChange = (duration: string) => {
    handleInputChange('duration', duration);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedEvent && selectedEvent.type === 'calendar' ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogDescription>
            {selectedEvent && selectedEvent.type === 'calendar' 
              ? 'Update your event details.' 
              : 'Schedule a new event or meeting in your calendar.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="eventTitle">Event Title *</Label>
              <Input
                id="eventTitle"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDescription">Description</Label>
              <Textarea
                id="eventDescription"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getEventTypes().map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventColor">Color</Label>
                <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getColorOptions().map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <span>{color.emoji}</span>
                          <span>{color.label.split(' ')[1]}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Date & Time
            </h3>
            
            {/* Single line for date/time */}
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  console.log('📅 Date picker changed:', e.target.value);
                  console.log('📅 Current formData.startDate:', formData.startDate);
                  handleInputChange('startDate', e.target.value);
                }}
                className={`w-40 ${errors.startDate ? 'border-red-500' : ''}`}
              />
              {!formData.allDay && (
                <>
                  <Select value={formData.startTime} onValueChange={(value) => {
                    console.log('⏰ Start time picker changed:', value);
                    console.log('⏰ Current formData.startTime:', formData.startTime);
                    handleInputChange('startTime', value);
                  }}>
                    <SelectTrigger className={`w-32 ${errors.startTime ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder={formatTimeForDisplay(formData.startTime)} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 96 }, (_, i) => {
                        const hour = Math.floor(i / 4);
                        const minute = (i % 4) * 15;
                        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
                        return (
                          <SelectItem key={time} value={time}>
                            {displayTime}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <span className="text-gray-500">-</span>
                  <Select value={formData.endTime} onValueChange={(value) => {
                    console.log('⏰ End time picker changed:', value);
                    console.log('⏰ Current formData.endTime:', formData.endTime);
                    handleInputChange('endTime', value);
                  }}>
                    <SelectTrigger className={`w-32 ${errors.endTime ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder={formatTimeForDisplay(formData.endTime)} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 96 }, (_, i) => {
                        const hour = Math.floor(i / 4);
                        const minute = (i % 4) * 15;
                        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
                        return (
                          <SelectItem key={time} value={time}>
                            {displayTime}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            {errors.startTime && <p className="text-sm text-red-500">{errors.startTime}</p>}
            {errors.endTime && <p className="text-sm text-red-500">{errors.endTime}</p>}

            {/* All day checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.allDay}
                onChange={(e) => handleInputChange('allDay', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="allDay" className="text-sm">All day</Label>
            </div>

            {/* Repeat options */}
            <div className="flex items-center space-x-2">
              <Select defaultValue="does-not-repeat">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="does-not-repeat">Does not repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>


          </div>

          {/* Location & Client */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location & Client
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Zoom, Office, Client Location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
            </div>
          </div>

          {/* Notes & Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Notes & Tags
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes or reminders"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {selectedEvent && selectedEvent.type === 'calendar' && onDelete && (
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    if (confirm('Tango CRM says: Are you sure you want to delete this event? This action cannot be undone.')) {
                      onDelete(selectedEvent.id.replace('event-', ''));
                    }
                  }}
                  disabled={isLoading}
                >
                  Delete Event
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading 
                  ? (selectedEvent && selectedEvent.type === 'calendar' ? 'Updating...' : 'Creating...') 
                  : (selectedEvent && selectedEvent.type === 'calendar' ? 'Update Event' : 'Create Event')
                }
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 