"use client";

import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, addHours, parseISO, isToday } from "date-fns";
import { Opportunity } from "@/lib/opportunity-service";
import { EventCreationModal } from "./event-creation-modal";
import { DateUtils } from "@/lib/date-utils";
import { formatInUserZone } from "@/lib/timezone-utils";
import { useUser } from "@clerk/nextjs";

// Simple Calendar Component
export const CalendarComponent = ({ activeNiche = "creator" }) => {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [userTimezone, setUserTimezone] = useState<string>('UTC');
  const [draggedEvent, setDraggedEvent] = useState<any>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  // Load user timezone
  useEffect(() => {
    const fetchUserTimezone = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/user/timezone');
        if (response.ok) {
          const data = await response.json();
          setUserTimezone(data.timezone || 'UTC');
        }
      } catch (error) {
        console.error('Error fetching user timezone:', error);
      }
    };

    fetchUserTimezone();
  }, [user]);

  // Load events from opportunities and calendar events
  useEffect(() => {
    const loadEvents = async () => {
      console.log('loadEvents called for niche:', activeNiche);
      try {
        setLoading(true);
        
        // Load opportunities
        const opportunitiesResponse = await fetch(`/api/opportunities?niche=${activeNiche}`);
        if (!opportunitiesResponse.ok) {
          throw new Error('Failed to fetch opportunities');
        }
        const opportunities = await opportunitiesResponse.json();
        const opportunityEvents = opportunities
          .filter((opp: any) => opp.expected_close_date)
          .map((opp: any) => {
            // Convert the stored date to user timezone for display
            const storedDate = new Date(opp.expected_close_date!);
            const userTimezone = DateUtils.getUserTimezone();
            const displayDate = DateUtils.toUserTimezone(storedDate, userTimezone) || storedDate;
            
            return {
              id: `opp-${opp.id}`,
              title: opp.title,
              start: displayDate,
              end: displayDate,
              color: getStatusColor(opp.status),
              type: 'opportunity',
              value: opp.value,
              status: opp.status
            };
          });

        // Load calendar events
        const calendarResponse = await fetch(`/api/calendar-events?niche=${activeNiche}`);
        let calendarEvents: any[] = [];
        
        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json();
          console.log('Calendar data from API:', calendarData);
          calendarEvents = calendarData.map((event: any) => {
            // Convert the stored dates to user timezone for display
            const storedStartDate = new Date(event.start_time);
            const storedEndDate = new Date(event.end_time);
            const userTimezone = DateUtils.getUserTimezone();
            const displayStartDate = DateUtils.toUserTimezone(storedStartDate, userTimezone) || storedStartDate;
            const displayEndDate = DateUtils.toUserTimezone(storedEndDate, userTimezone) || storedEndDate;
            
            return {
              id: `event-${event.id}`,
              title: event.title,
              start: displayStartDate,
              end: displayEndDate,
              color: getEventColor(event.color),
              type: 'calendar',
              description: event.description,
              eventType: event.type
            };
          });
        }
        
        // Combine all events
        const allEvents = [...opportunityEvents, ...calendarEvents];
        console.log('All events for calendar:', allEvents);
        setEvents(allEvents);
      } catch (error) {
        console.error('Error loading calendar events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [activeNiche]);

  const getStatusColor = (status: string) => {
    const colors = {
      prospecting: 'bg-blue-500',
      qualification: 'bg-yellow-500',
      proposal: 'bg-orange-500',
      negotiation: 'bg-purple-500',
      won: 'bg-green-500',
      lost: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getEventColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    };
    return colors[color as keyof typeof colors] || 'bg-blue-500';
  };

  const formatEventTime = (date: Date) => {
    return formatInUserZone(date, userTimezone, 'h:mm a');
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, event: any) => {
    console.log('Drag started for event:', event.title, 'ID:', event.id, 'Type:', event.type);
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
    // Prevent the click event from firing
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
    console.log('Dragging over date:', date.toDateString());
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDate(null);
  };

  const handleDrop = async (e: React.DragEvent, dropDate: Date) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDate(null);
    
    if (!draggedEvent) {
      console.log('No dragged event found');
      return;
    }

    console.log('Dropping event:', draggedEvent.title, 'on date:', dropDate);

    try {
      // Calculate the time difference to maintain the same time
      const originalDate = new Date(draggedEvent.start);
      const timeDiff = originalDate.getTime() - new Date(draggedEvent.start).setHours(0, 0, 0, 0);
      
      // Set the new date while preserving the time
      const newDate = new Date(dropDate);
      newDate.setTime(newDate.getTime() + timeDiff);

      console.log('New date calculated:', newDate);

      if (draggedEvent.type === 'calendar') {
        // Update calendar event
        const eventId = draggedEvent.id.replace('event-', '');
        console.log('Updating calendar event with ID:', eventId);
        
        const response = await fetch(`/api/calendar-events`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: eventId,
            start_time: DateUtils.toISOString(newDate),
            end_time: DateUtils.toISOString(new Date(newDate.getTime() + (draggedEvent.end.getTime() - draggedEvent.start.getTime()))),
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error('Failed to update event');
        }

        const updatedEvent = await response.json();
        console.log('Event updated successfully:', updatedEvent);
        
        // Update local state
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === draggedEvent.id 
              ? {
                  ...event,
                  start: newDate,
                  end: new Date(newDate.getTime() + (draggedEvent.end.getTime() - draggedEvent.start.getTime()))
                }
              : event
          )
        );
      } else if (draggedEvent.type === 'opportunity') {
        // Update opportunity
        const opportunityId = draggedEvent.id.replace('opp-', '');
        console.log('Updating opportunity with ID:', opportunityId);
        
        const response = await fetch(`/api/opportunities/${opportunityId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            expected_close_date: DateUtils.toISOString(newDate),
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error('Failed to update opportunity');
        }

        console.log('Opportunity updated successfully');

        // Update local state
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === draggedEvent.id 
              ? { ...event, start: newDate, end: newDate }
              : event
          )
        );
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to move event. Please try again.');
    } finally {
      setDraggedEvent(null);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const isEditing = selectedEvent && selectedEvent.type === 'calendar';
      const method = isEditing ? 'PUT' : 'POST';
      const url = '/api/calendar-events';
      
      const requestBody: any = {
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.start_date || DateUtils.toISOString(eventData.startDate),
        end_time: eventData.end_date || DateUtils.toISOString(eventData.endDate),
        type: eventData.type,
        color: eventData.color,
        status: eventData.status || 'scheduled',
        niche: activeNiche,
        location: eventData.location,
        notes: eventData.notes,
        tags: eventData.tags || [],
      };

      // Add event ID for updates
      if (isEditing) {
        requestBody.id = selectedEvent.id.replace('event-', '');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(isEditing ? 'Failed to update event' : 'Failed to create event');
      }

      const savedEvent = await response.json();
      console.log('Saved event from API:', savedEvent);
      
      // Update the events list
      const userTimezone = DateUtils.getUserTimezone();
      const updatedEvent = {
        id: `event-${savedEvent.id}`,
        title: savedEvent.title,
        start: DateUtils.toUserTimezone(new Date(savedEvent.start_time), userTimezone) || new Date(savedEvent.start_time),
        end: DateUtils.toUserTimezone(new Date(savedEvent.end_time), userTimezone) || new Date(savedEvent.end_time),
        color: getEventColor(savedEvent.color),
        type: 'calendar',
        description: savedEvent.description,
        eventType: savedEvent.type
      };
      
      console.log('Updated event for display:', updatedEvent);

      if (isEditing) {
        // Update existing event
        setEvents(prevEvents => {
          const updated = prevEvents.map(event => 
            event.id === selectedEvent.id ? updatedEvent : event
          );
          console.log('Updated events after editing:', updated);
          return updated;
        });
      } else {
        // Add new event
        setEvents(prevEvents => {
          const updated = [...prevEvents, updatedEvent];
          console.log('Updated events after adding:', updated);
          return updated;
        });
      }

      setIsEventModalOpen(false);
      setSelectedDate(null);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    
    // Navigate to the month of the selected date if it's different from current month
    if (!isSameMonth(date, currentDate)) {
      setCurrentDate(date);
    }
    
    // Check if there's already a calendar event on this date
    const existingEvent = events.find(event => 
      event.type === 'calendar' && isSameDay(event.start, date)
    );
    
    if (existingEvent) {
      setSelectedEvent(existingEvent);
    } else {
      setSelectedEvent(null);
    }
    
    setIsEventModalOpen(true);
  };

  const navigateCalendar = (direction: string) => {
    if (view === "month") {
      setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(direction === "prev" ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    }
  };

  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-foreground">
          {format(currentDate, view === "month" ? "MMMM yyyy" : "MMMM d, yyyy")}
        </h1>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={() => navigateCalendar("prev")}
          >
            ←
          </button>
          <button
            className="px-4 py-2 rounded-md hover:bg-gray-100"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </button>
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={() => navigateCalendar("next")}
          >
            →
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="text-sm text-gray-600">
          💡 Drag events to reschedule
        </div>
        <button
          onClick={() => setIsEventModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Event
        </button>
        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="month">Month</option>
          <option value="week">Week</option>
        </select>
      </div>
    </div>
  );

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayEvents = events.filter(event => isSameDay(event.start, day));
        
        days.push(
          <div
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
            onDragOver={(e) => handleDragOver(e, cloneDay)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, cloneDay)}
            className={`
              min-h-[100px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors
              ${!isSameMonth(day, monthStart) ? "bg-gray-50 text-gray-400" : "bg-white"}
              ${isToday(day) ? "bg-blue-50" : ""}
              ${dragOverDate && isSameDay(day, dragOverDate) ? "bg-blue-100 border-blue-300 ring-2 ring-blue-200" : ""}
            `}
          >
            <div className="font-medium text-sm mb-1">
              {format(day, "d")}
            </div>
            
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, event)}
                  onMouseDown={(e) => {
                    // Prevent click when starting drag
                    e.currentTarget.setAttribute('data-dragging', 'true');
                  }}
                  onMouseUp={(e) => {
                    // Allow click after a short delay if not dragging
                    const target = e.currentTarget;
                    setTimeout(() => {
                      if (target && target.getAttribute('data-dragging') === 'true') {
                        target.removeAttribute('data-dragging');
                      }
                    }, 100);
                  }}
                  className={`text-xs p-1 rounded text-white truncate ${event.color} cursor-move hover:opacity-80 select-none ${
                    draggedEvent && draggedEvent.id === event.id ? 'opacity-50 scale-95 ring-2 ring-white' : ''
                  }`}
                  onClick={(e) => {
                    // Only handle click if not dragging
                    if (e.currentTarget && e.currentTarget.getAttribute('data-dragging') !== 'true') {
                      e.stopPropagation();
                      if (event.type === 'calendar') {
                        setSelectedEvent(event);
                        setIsEventModalOpen(true);
                      }
                    }
                  }}
                >
                  {event.title} {event.type === 'opportunity' ? `($${event.value})` : `(${event.eventType})`}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="bg-white rounded-lg border">
        <div className="grid grid-cols-7 border-b">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-3 text-center font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="bg-white rounded-lg border">
        <div className="grid grid-cols-8 border-b">
          <div className="p-3 border-r"></div>
          {weekDays.map((day) => (
            <div key={day.toString()} className="p-3 text-center border-r last:border-r-0">
              <div className="font-medium">{format(day, "EEE")}</div>
              <div className={`text-sm ${isToday(day) ? "text-blue-600 font-bold" : "text-gray-600"}`}>
                {format(day, "MMM d")}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8">
          <div className="border-r p-2">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="h-12 border-b text-sm text-gray-600">
                {i === 0 ? "12 AM" : i === 12 ? "12 PM" : i > 12 ? `${i - 12} PM` : `${i} AM`}
              </div>
            ))}
          </div>
          
          {weekDays.map((day) => {
            const dayEvents = events.filter(event => isSameDay(event.start, day));
            return (
              <div 
                key={day.toString()} 
                className="border-r last:border-r-0 relative"
                onDragOver={(e) => handleDragOver(e, day)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day)}
              >
                {dayEvents.map((event) => {
                  const startHour = event.start.getHours();
                  const duration = 1; // Default 1 hour for opportunities
                  
                  return (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event)}
                      onMouseDown={(e) => {
                        e.currentTarget.setAttribute('data-dragging', 'true');
                      }}
                      onMouseUp={(e) => {
                        const target = e.currentTarget;
                        setTimeout(() => {
                          if (target && target.getAttribute('data-dragging') === 'true') {
                            target.removeAttribute('data-dragging');
                          }
                        }, 100);
                      }}
                      className={`absolute left-1 right-1 p-2 rounded text-white text-xs ${event.color} cursor-move select-none ${
                        draggedEvent && draggedEvent.id === event.id ? 'opacity-50 scale-95' : ''
                      }`}
                      style={{
                        top: `${startHour * 48 + 4}px`,
                        height: `${Math.max(duration * 48 - 8, 24)}px`
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="opacity-90">
                        {event.type === 'opportunity' ? `$${event.value}` : event.eventType}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {renderCalendarHeader()}
      
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Today's Events</h3>
            <div className="space-y-2">
              {events.filter(event => isToday(event.start)).map(event => (
                <div 
                  key={event.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, event)}
                  className={`p-2 rounded cursor-move hover:opacity-80 transition-colors ${
                    event.type === 'calendar' 
                      ? `${event.color} text-white` 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    if (event.type === 'calendar') {
                      setSelectedEvent(event);
                      setIsEventModalOpen(true);
                    } else if (event.type === 'opportunity') {
                      // Navigate to the date of the opportunity
                      setCurrentDate(event.start);
                      setView('month');
                    }
                  }}
                >
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className={`text-xs ${
                    event.type === 'calendar' ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    {event.type === 'opportunity' 
                      ? `$${event.value} - ${event.status}`
                      : `${event.eventType} - ${format(event.start, 'h:mm a')}`
                    }
                  </div>
                </div>
              ))}
              {events.filter(event => isToday(event.start)).length === 0 && (
                <p className="text-sm text-gray-500">No events today</p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Upcoming This Week</h3>
            <div className="space-y-2">
              {events
                .filter(event => {
                  const eventDate = new Date(event.start);
                  const today = new Date();
                  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return eventDate > today && eventDate <= weekFromNow;
                })
                .slice(0, 5)
                .map(event => (
                  <div 
                    key={event.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, event)}
                    className={`p-2 rounded cursor-move hover:opacity-80 transition-colors ${
                      event.type === 'calendar' 
                        ? `${event.color} text-white` 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      if (event.type === 'calendar') {
                        setSelectedEvent(event);
                        setIsEventModalOpen(true);
                      } else if (event.type === 'opportunity') {
                        // Navigate to the date of the opportunity
                        setCurrentDate(event.start);
                        setView('month');
                      }
                    }}
                  >
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className={`text-xs ${
                      event.type === 'calendar' ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      {format(event.start, "MMM d")} - {event.type === 'opportunity' 
                        ? `$${event.value}`
                        : `${event.eventType}`
                      }
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Main Calendar */}
        <div>
          {view === "month" && renderMonthView()}
          {view === "week" && renderWeekView()}
        </div>
      </div>
      
      {/* Event Creation Modal */}
      <EventCreationModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedDate(null);
          setSelectedEvent(null);
        }}
        onSave={handleCreateEvent}
        activeNiche={activeNiche}
        selectedEvent={selectedEvent}
        selectedDate={selectedDate || undefined}
      />
    </div>
  );
};
