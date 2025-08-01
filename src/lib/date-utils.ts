import { format, parseISO, isValid, isAfter, isBefore, addDays, addHours, startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

// Date validation and formatting utilities
export class DateUtils {
  /**
   * Convert a date string to a Date object with proper validation
   */
  static parseDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return isValid(date) ? date : null;
    } catch {
      return null;
    }
  }

  /**
   * Convert a date to ISO string with timezone handling
   */
  static toISOString(date: Date | null | undefined): string | null {
    console.log('🔧 toISOString called with:', date);
    
    if (!date || !isValid(date)) {
      console.log('🔧 Returning null - invalid or null date');
      return null;
    }
    
    const result = date.toISOString();
    console.log('🔧 toISOString result:', result);
    return result;
  }

  /**
   * Convert a date to user's timezone for display
   */
  static toUserTimezone(date: Date | string | null | undefined, userTimezone: string = 'America/New_York'): Date | null {
    console.log('🔧 toUserTimezone called with:', { date, userTimezone });
    
    if (!date) {
      console.log('🔧 Returning null - no date provided');
      return null;
    }
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      console.log('🔧 Parsed dateObj:', dateObj);
      
      if (!isValid(dateObj)) {
        console.log('🔧 Returning null - invalid dateObj');
        return null;
      }
      
      // Convert UTC to user's timezone
      const userDate = toZonedTime(dateObj, userTimezone);
      console.log('🔧 User date result:', userDate);
      
      return userDate;
    } catch (error) {
      console.log('🔧 Error in toUserTimezone:', error);
      return null;
    }
  }

  /**
   * Convert a date from user's timezone to UTC for storage
   */
  static fromUserTimezoneToUTC(date: Date | string | null | undefined, userTimezone: string = 'America/New_York'): Date | null {
    console.log('🔧 fromUserTimezoneToUTC called with:', { date, userTimezone });
    
    if (!date) {
      console.log('🔧 Returning null - no date provided');
      return null;
    }
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      console.log('🔧 Parsed dateObj:', dateObj);
      
      if (!isValid(dateObj)) {
        console.log('🔧 Returning null - invalid dateObj');
        return null;
      }
      
      // Convert from user's timezone to UTC
      const utcDate = fromZonedTime(dateObj, userTimezone);
      console.log('🔧 UTC date result:', utcDate);
      
      return utcDate;
    } catch (error) {
      console.log('🔧 Error in fromUserTimezoneToUTC:', error);
      return null;
    }
  }

  /**
   * Format a date for display in user's timezone
   */
  static formatDateInTimezone(date: Date | string | null | undefined, formatString: string = 'PPP', userTimezone: string = 'America/New_York'): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      
      return formatInTimeZone(dateObj, userTimezone, formatString);
    } catch {
      return '';
    }
  }

  /**
   * Format a date for display
   */
  static formatDate(date: Date | string | null | undefined, formatString: string = 'PPP'): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return isValid(dateObj) ? format(dateObj, formatString) : '';
    } catch {
      return '';
    }
  }

  /**
   * Format a date for input fields (YYYY-MM-DD) in user's timezone
   */
  static formatForInput(date: Date | string | null | undefined, userTimezone: string = 'America/New_York'): string {
    console.log('🔧 formatForInput called with:', { date, userTimezone });
    
    if (!date) {
      console.log('🔧 Returning empty string - no date provided');
      return '';
    }
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      console.log('🔧 Parsed dateObj:', dateObj);
      
      if (!isValid(dateObj)) {
        console.log('🔧 Returning empty string - invalid dateObj');
        return '';
      }
      
      // Convert to user's timezone for input
      const userDate = this.toUserTimezone(dateObj, userTimezone);
      console.log('🔧 User date:', userDate);
      
      const result = userDate ? format(userDate, 'yyyy-MM-dd') : '';
      console.log('🔧 Formatted result:', result);
      
      return result;
    } catch (error) {
      console.log('🔧 Error in formatForInput:', error);
      return '';
    }
  }

  /**
   * Format a datetime for input fields (YYYY-MM-DDTHH:mm) in user's timezone
   */
  static formatForDateTimeInput(date: Date | string | null | undefined, userTimezone: string = 'America/New_York'): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      
      // Convert to user's timezone for input
      const userDate = this.toUserTimezone(dateObj, userTimezone);
      return userDate ? format(userDate, "yyyy-MM-dd'T'HH:mm") : '';
    } catch {
      return '';
    }
  }

  /**
   * Format time for input fields (HH:mm) in user's timezone
   */
  static formatTimeForInput(date: Date | string | null | undefined, userTimezone: string = 'America/New_York'): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      
      // Convert to user's timezone for input
      const userDate = this.toUserTimezone(dateObj, userTimezone);
      return userDate ? format(userDate, 'HH:mm') : '';
    } catch {
      return '';
    }
  }

  /**
   * Validate that end date is after start date
   */
  static validateDateRange(startDate: Date | string | null, endDate: Date | string | null): boolean {
    if (!startDate || !endDate) return true; // Allow empty dates
    
    try {
      const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
      const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
      
      if (!isValid(start) || !isValid(end)) return false;
      
      return isAfter(end, start) || start.getTime() === end.getTime();
    } catch {
      return false;
    }
  }

  /**
   * Validate that a date is not in the past (for future events)
   */
  static validateFutureDate(date: Date | string | null): boolean {
    if (!date) return true; // Allow empty dates
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return false;
      
      return isAfter(dateObj, new Date()) || dateObj.getTime() === startOfDay(new Date()).getTime();
    } catch {
      return false;
    }
  }

  /**
   * Combine date and time strings into a Date object in user's timezone
   */
  static combineDateAndTime(dateString: string, timeString: string, userTimezone: string = 'America/New_York'): Date | null {
    console.log('🔧 DateUtils.combineDateAndTime called with:', { dateString, timeString, userTimezone });
    
    if (!dateString || !timeString) {
      console.log('🔧 Returning null - missing date or time string');
      return null;
    }
    
    try {
      // Create a date string in the user's timezone
      const combined = `${dateString}T${timeString}`;
      console.log('🔧 Combined string:', combined);
      
      // Create a date object for the specific date to get the correct timezone offset
      const targetDate = new Date(combined);
      console.log('🔧 Target date created:', targetDate);
      
      if (!isValid(targetDate)) {
        console.log('🔧 Returning null - invalid target date');
        return null;
      }
      
      // Get the timezone offset for the specific date in the user's timezone
      const userOffset = formatInTimeZone(targetDate, userTimezone, 'xxx');
      console.log('🔧 User timezone offset for target date:', userOffset);
      
      // Create the date in the user's timezone by appending the timezone offset
      const userDateString = `${combined}${userOffset}`;
      console.log('🔧 User date string with offset:', userDateString);
      
      const utcDate = new Date(userDateString);
      console.log('🔧 UTC date result:', utcDate);
      
      return utcDate;
    } catch (error) {
      console.log('🔧 Error in combineDateAndTime:', error);
      return null;
    }
  }

  /**
   * Get default start time (current time + 1 hour) in user's timezone
   */
  static getDefaultStartTime(userTimezone: string = 'America/New_York'): Date {
    const now = new Date();
    const userNow = this.toUserTimezone(now, userTimezone);
    const defaultStart = userNow ? addHours(userNow, 1) : addHours(now, 1);
    return this.fromUserTimezoneToUTC(defaultStart, userTimezone) || defaultStart;
  }

  /**
   * Get default end time (start time + 1 hour) in user's timezone
   */
  static getDefaultEndTime(startTime?: Date, userTimezone: string = 'America/New_York'): Date {
    const start = startTime || this.getDefaultStartTime(userTimezone);
    const userStart = this.toUserTimezone(start, userTimezone);
    const defaultEnd = userStart ? addHours(userStart, 1) : addHours(start, 1);
    return this.fromUserTimezoneToUTC(defaultEnd, userTimezone) || defaultEnd;
  }

  /**
   * Format date for calendar display in user's timezone
   */
  static formatForCalendar(date: Date | string | null | undefined, userTimezone: string = 'America/New_York'): string {
    return this.formatDateInTimezone(date, 'MMM d, yyyy', userTimezone);
  }

  /**
   * Format time for display in user's timezone
   */
  static formatTime(date: Date | string | null | undefined, userTimezone: string = 'America/New_York'): string {
    return this.formatDateInTimezone(date, 'h:mm a', userTimezone);
  }

  /**
   * Format datetime for display in user's timezone
   */
  static formatDateTime(date: Date | string | null | undefined, userTimezone: string = 'America/New_York'): string {
    return this.formatDateInTimezone(date, 'MMM d, yyyy h:mm a', userTimezone);
  }

  /**
   * Get relative time (e.g., "2 hours ago", "in 3 days")
   */
  static getRelativeTime(date: Date | string | null | undefined): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      
      const now = new Date();
      const diffInMs = dateObj.getTime() - now.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInMs < 0) {
        // Past
        if (diffInDays < -1) return `${Math.abs(diffInDays)} days ago`;
        if (diffInHours < -1) return `${Math.abs(diffInHours)} hours ago`;
        return 'Just now';
      } else {
        // Future
        if (diffInDays > 1) return `in ${diffInDays} days`;
        if (diffInHours > 1) return `in ${diffInHours} hours`;
        return 'Soon';
      }
    } catch {
      return '';
    }
  }

  /**
   * Check if a date is today
   */
  static isToday(date: Date | string | null | undefined): boolean {
    if (!date) return false;
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return false;
      
      const today = new Date();
      return dateObj.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  }

  /**
   * Check if a date is in the past
   */
  static isPast(date: Date | string | null | undefined): boolean {
    if (!date) return false;
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return false;
      
      return isBefore(dateObj, new Date());
    } catch {
      return false;
    }
  }

  /**
   * Check if a date is in the future
   */
  static isFuture(date: Date | string | null | undefined): boolean {
    if (!date) return false;
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return false;
      
      return isAfter(dateObj, new Date());
    } catch {
      return false;
    }
  }

  /**
   * Get user's timezone from browser or default
   */
  static getUserTimezone(): string {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
      console.log('🔧 getUserTimezone returning:', timezone);
      return timezone;
    } catch (error) {
      console.log('🔧 Error getting timezone, defaulting to America/New_York:', error);
      return 'America/New_York';
    }
  }
}

// Validation functions
export const validateEventDates = (startDate: string, endDate: string, startTime: string, endTime: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check if dates are provided
  if (!startDate) errors.push('Start date is required');
  if (!endDate) errors.push('End date is required');
  if (!startTime) errors.push('Start time is required');
  if (!endTime) errors.push('End time is required');
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // Combine date and time
  const startDateTime = DateUtils.combineDateAndTime(startDate, startTime);
  const endDateTime = DateUtils.combineDateAndTime(endDate, endTime);
  
  if (!startDateTime) errors.push('Invalid start date/time');
  if (!endDateTime) errors.push('Invalid end date/time');
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // Validate date range
  if (!DateUtils.validateDateRange(startDateTime, endDateTime)) {
    errors.push('End date/time must be after start date/time');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateDeadline = (deadline: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!deadline) {
    errors.push('Deadline is required');
    return { isValid: false, errors };
  }
  
  const deadlineDate = DateUtils.parseDate(deadline);
  if (!deadlineDate) {
    errors.push('Invalid deadline date');
    return { isValid: false, errors };
  }
  
  // Check if deadline is in the past
  if (DateUtils.isPast(deadlineDate)) {
    errors.push('Deadline cannot be in the past');
  }
  
  return { isValid: errors.length === 0, errors };
}; 

/**
 * Create a bulletproof date handler for content cards
 * This handles all date parsing, formatting, and conversion with proper error handling
 */
export const createBulletproofDateHandler = (userTimezone: string = 'America/New_York') => {
  return {
    // Convert any date input to a proper Date object for the form
    parseDateForForm: (dateInput: any): Date | undefined => {
      if (!dateInput) return undefined;
      
      try {
        // If it's already a Date object, return it
        if (dateInput instanceof Date) {
          return dateInput;
        }
        
        // If it's a string, parse it
        if (typeof dateInput === 'string') {
          // Handle ISO strings (from database)
          if (dateInput.includes('T') || dateInput.includes('Z')) {
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return undefined;
            
            // Convert to user's timezone for form display
            const userDate = DateUtils.toUserTimezone(date, userTimezone);
            return userDate || undefined;
          }
          
          // Handle YYYY-MM-DD format (from HTML date inputs)
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            const date = new Date(dateInput + 'T00:00:00');
            if (isNaN(date.getTime())) return undefined;
            return date;
          }
        }
        
        return undefined;
      } catch (error) {
        console.error('Error parsing date for form:', dateInput, error);
        return undefined;
      }
    },
    
    // Convert form Date object to ISO string for database storage
    formatDateForStorage: (date: Date | undefined): string | undefined => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return undefined;
      }
      
      try {
        // Convert to UTC for storage
        const utcDate = DateUtils.fromUserTimezoneToUTC(date, userTimezone);
        return utcDate ? utcDate.toISOString() : undefined;
      } catch (error) {
        console.error('Error formatting date for storage:', date, error);
        return undefined;
      }
    },
    
    // Convert form Date object to YYYY-MM-DD for HTML date inputs
    formatDateForInput: (date: Date | undefined): string => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '';
      }
      
      try {
        return DateUtils.formatForInput(date, userTimezone);
      } catch (error) {
        console.error('Error formatting date for input:', date, error);
        return '';
      }
    },
    
    
  };
}; 