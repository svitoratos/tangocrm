import { formatInTimeZone } from 'date-fns-tz';
import { DateUtils } from './date-utils';

/**
 * Format a date in the user's timezone
 * @param date - Date to format (string or Date object)
 * @param userTimezone - User's timezone (e.g., 'America/New_York')
 * @param formatString - Date-fns format string
 * @returns Formatted date string
 */
export const formatInUserZone = (
  date: string | Date,
  userTimezone: string,
  formatString: string = 'PPP p'
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }

    return formatInTimeZone(dateObj, userTimezone, formatString);
  } catch (error) {
    console.error('Error formatting date in user timezone:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date for display in user's timezone with relative time
 * @param date - Date to format
 * @param userTimezone - User's timezone
 * @returns Formatted date string with relative time
 */
export const formatDateWithRelativeTime = (
  date: string | Date,
  userTimezone: string
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = dateObj.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const formattedDate = formatInUserZone(dateObj, userTimezone, 'MMM d, yyyy h:mm a');

    if (diffInMs < 0) {
      // Past
      if (diffInDays < -1) return `${formattedDate} (${Math.abs(diffInDays)} days ago)`;
      if (diffInHours < -1) return `${formattedDate} (${Math.abs(diffInHours)} hours ago)`;
      return `${formattedDate} (Just now)`;
    } else {
      // Future
      if (diffInDays > 1) return `${formattedDate} (in ${diffInDays} days)`;
      if (diffInHours > 1) return `${formattedDate} (in ${diffInHours} hours)`;
      return `${formattedDate} (Soon)`;
    }
  } catch (error) {
    console.error('Error formatting date with relative time:', error);
    return 'Invalid date';
  }
};

/**
 * Format time only in user's timezone
 * @param date - Date to format
 * @param userTimezone - User's timezone
 * @returns Formatted time string
 */
export const formatTimeInUserZone = (
  date: string | Date,
  userTimezone: string
): string => {
  return formatInUserZone(date, userTimezone, 'h:mm a');
};

/**
 * Format date only in user's timezone
 * @param date - Date to format
 * @param userTimezone - User's timezone
 * @returns Formatted date string
 */
export const formatDateInUserZone = (
  date: string | Date,
  userTimezone: string
): string => {
  return formatInUserZone(date, userTimezone, 'MMM d, yyyy');
};

/**
 * Get current time in user's timezone
 * @param userTimezone - User's timezone
 * @returns Current time string
 */
export const getCurrentTimeInUserZone = (userTimezone: string): string => {
  return formatInUserZone(new Date(), userTimezone, 'h:mm a');
};

/**
 * Check if a date is today in user's timezone
 * @param date - Date to check
 * @param userTimezone - User's timezone
 * @returns True if date is today
 */
export const isTodayInUserZone = (
  date: string | Date,
  userTimezone: string
): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    const dateInUserZone = formatInUserZone(dateObj, userTimezone, 'yyyy-MM-dd');
    const todayInUserZone = formatInUserZone(today, userTimezone, 'yyyy-MM-dd');
    
    return dateInUserZone === todayInUserZone;
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};

/**
 * Get timezone offset for display
 * @param userTimezone - User's timezone
 * @returns Timezone offset string (e.g., "UTC-5")
 */
export const getTimezoneOffset = (userTimezone: string): string => {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: userTimezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || userTimezone;
    
    return timeZoneName;
  } catch (error) {
    console.error('Error getting timezone offset:', error);
    return userTimezone;
  }
}; 

/**
 * Utility functions for handling timezone-aware opportunity dates
 */

export class OpportunityDateUtils {
  /**
   * Convert a date from the database (UTC) to the user's local timezone for display
   */
  static convertDatabaseDateToUserTimezone(
    databaseDate: string | null | undefined,
    userTimezone: string = 'UTC'
  ): Date | null {
    if (!databaseDate) return null;
    
    try {
      // Parse the database date (which is in UTC)
      const utcDate = new Date(databaseDate);
      
      // Convert to user's timezone for display
      return DateUtils.toUserTimezone(utcDate, userTimezone);
    } catch (error) {
      console.error('Error converting database date to user timezone:', error);
      return null;
    }
  }

  /**
   * Convert a user's local date to UTC for database storage
   */
  static convertUserDateToUTC(
    userDate: Date | string | null | undefined,
    userTimezone: string = 'UTC'
  ): string | null {
    if (!userDate) return null;
    
    try {
      const dateObj = typeof userDate === 'string' ? new Date(userDate) : userDate;
      
      // Convert from user's timezone to UTC for storage
      const utcDate = DateUtils.fromUserTimezoneToUTC(dateObj, userTimezone);
      
      return utcDate ? utcDate.toISOString() : null;
    } catch (error) {
      console.error('Error converting user date to UTC:', error);
      return null;
    }
  }

  /**
   * Format a due date for display in the user's timezone
   */
  static formatDueDateForDisplay(
    databaseDate: string | null | undefined,
    userTimezone: string = 'UTC',
    format: string = 'MMM d, yyyy'
  ): string {
    const userDate = this.convertDatabaseDateToUserTimezone(databaseDate, userTimezone);
    return userDate ? DateUtils.formatDate(userDate, format) : '';
  }

  /**
   * Format a due date for input fields (YYYY-MM-DD) in user's timezone
   */
  static formatDueDateForInput(
    databaseDate: string | null | undefined,
    userTimezone: string = 'UTC'
  ): string {
    const userDate = this.convertDatabaseDateToUserTimezone(databaseDate, userTimezone);
    return userDate ? DateUtils.formatForInput(userDate, userTimezone) : '';
  }

  /**
   * Create a date string for database storage from user input
   * Handles both date-only strings and full datetime strings
   */
  static createDatabaseDateString(
    userInput: string | Date | null | undefined,
    userTimezone: string = 'UTC'
  ): string | null {
    if (!userInput) return null;
    
    try {
      let dateString: string;
      
      if (typeof userInput === 'string') {
        // If it's already an ISO string, return as-is
        if (userInput.includes('T') && userInput.includes('Z')) {
          return userInput;
        }
        
        // If it's a date-only string (YYYY-MM-DD), convert to UTC
        if (userInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateString = `${userInput}T00:00:00.000Z`;
        } else {
          // Try to parse as a local date
          const localDate = new Date(userInput);
          if (isNaN(localDate.getTime())) {
            throw new Error('Invalid date format');
          }
          dateString = this.convertUserDateToUTC(localDate, userTimezone) || '';
        }
      } else {
        // It's a Date object
        dateString = this.convertUserDateToUTC(userInput, userTimezone) || '';
      }
      
      return dateString || null;
    } catch (error) {
      console.error('Error creating database date string:', error);
      return null;
    }
  }

  /**
   * Get the user's timezone from browser or stored preference
   */
  static getUserTimezone(): string {
    return DateUtils.getUserTimezone();
  }

  /**
   * Validate that a due date is not in the past
   */
  static validateDueDate(
    date: string | Date | null | undefined,
    userTimezone: string = 'UTC'
  ): boolean {
    if (!date) return true; // Allow empty dates
    
    try {
      const userDate = typeof date === 'string' 
        ? this.convertDatabaseDateToUserTimezone(date, userTimezone)
        : date;
      
      if (!userDate) return false;
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      return userDate >= todayStart;
    } catch (error) {
      console.error('Error validating due date:', error);
      return false;
    }
  }

  /**
   * Get relative time for a due date (e.g., "Due in 3 days", "Overdue by 1 day")
   */
  static getDueDateRelativeTime(
    databaseDate: string | null | undefined,
    userTimezone: string = 'UTC'
  ): string {
    if (!databaseDate) return '';
    
    try {
      const userDate = this.convertDatabaseDateToUserTimezone(databaseDate, userTimezone);
      if (!userDate) return '';
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dueDateStart = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate());
      
      const diffTime = dueDateStart.getTime() - todayStart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Due today';
      } else if (diffDays === 1) {
        return 'Due tomorrow';
      } else if (diffDays === -1) {
        return 'Overdue by 1 day';
      } else if (diffDays > 1) {
        return `Due in ${diffDays} days`;
      } else {
        return `Overdue by ${Math.abs(diffDays)} days`;
      }
    } catch (error) {
      console.error('Error getting relative time:', error);
      return '';
    }
  }

  /**
   * Check if a due date is overdue
   */
  static isOverdue(
    databaseDate: string | null | undefined,
    userTimezone: string = 'UTC'
  ): boolean {
    if (!databaseDate) return false;
    
    try {
      const userDate = this.convertDatabaseDateToUserTimezone(databaseDate, userTimezone);
      if (!userDate) return false;
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dueDateStart = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate());
      
      return dueDateStart < todayStart;
    } catch (error) {
      console.error('Error checking if overdue:', error);
      return false;
    }
  }
} 