import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

export type User = Database['public']['Tables']['users']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Opportunity = Database['public']['Tables']['opportunities']['Row']
export type Content = Database['public']['Tables']['content']['Row']
export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']

// Legacy alias for backwards compatibility
export type Deal = Opportunity

// User operations
export const userOperations = {
  async getProfile(userId: string): Promise<User | null> {
    try {
      // First try to get user by ID
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        return null;
      }
      
      if (data) {
        return data;
      }
      
      // If not found by ID, try to get by email (for cases where user exists with different ID)
      // We need to get the email from the current user context
      // For now, we'll return null and let the calling function handle this
      return null;
      
    } catch (err) {
      return null;
    }
  },

  async upsertProfile(userId: string, profile: Partial<User>): Promise<User | null> {
    console.log('🔧 upsertProfile called with:', { userId, profile });
    
    try {
      // First, try to get the existing user by ID
      const existingUser = await this.getProfile(userId);
      
      if (existingUser) {
        // User exists, update the profile
        console.log('🔧 User exists, updating profile...');
        const { data, error } = await supabase
          .from('users')
          .update({
            ...profile,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single()
        
        if (error) {
          console.error('❌ Error updating user profile:', error);
          return null
        }
        
        console.log('✅ updateProfile successful:', data);
        return data
      } else {
        // User doesn't exist by ID, check if user exists by email
        if (profile.email) {
          console.log('🔧 Checking if user exists by email...');
          const { data: existingByEmail, error: emailError } = await supabase
            .from('users')
            .select('*')
            .eq('email', profile.email)
            .single()
          
          if (existingByEmail && !emailError) {
            // User exists by email but with different ID, update the existing record instead of changing ID
            console.log('🔧 User exists by email, updating existing record...');
            const { data, error } = await supabase
              .from('users')
              .update({
                ...profile,
                updated_at: new Date().toISOString()
              })
              .eq('email', profile.email)
              .select()
              .single()
            
            if (error) {
              console.error('❌ Error updating existing user by email:', error);
              return null
            }
            
            console.log('✅ Updated existing user by email:', data);
            return data
          }
        }
        
        // User doesn't exist at all, create new profile
        console.log('🔧 User doesn\'t exist, creating new profile...');
        const { data, error } = await supabase
          .from('users')
          .insert({
            id: userId,
            ...profile,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (error) {
          console.error('❌ Error creating user profile:', error);
          console.error('❌ Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          return null
        }
        
        console.log('✅ createProfile successful:', data);
        return data
      }
    } catch (err) {
      console.error('❌ Exception in upsertProfile:', err);
      return null;
    }
  },



  async updateNotificationPreferences(userId: string, preferences: any) {
    try {
      console.log('🔧 Database: Updating notification preferences for user:', userId);
      console.log('🔧 Database: Preferences:', preferences);

      const { data, error } = await supabase
        .from('users')
        .update({
          email_notifications_enabled: preferences.email,
          notification_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Database: Error updating notification preferences:', error);
        
        // Check if the error is due to missing columns
        if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
          console.log('⚠️ Database: Notification columns do not exist yet - returning null');
          return null;
        }
        
        throw error;
      }

      console.log('✅ Database: Notification preferences updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Database: Failed to update notification preferences:', error);
      
      // Check if the error is due to missing columns
      if (error instanceof Error && error.message && error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('⚠️ Database: Notification columns do not exist yet - returning null');
        return null;
      }
      
      throw error;
    }
  },

  async getNotificationPreferences(userId: string) {
    try {
      console.log('🔧 Database: Getting notification preferences for user:', userId);

      const { data, error } = await supabase
        .from('users')
        .select('email_notifications_enabled, notification_preferences')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Database: Error getting notification preferences:', error);
        
        // Check if the error is due to missing columns
        if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
          console.log('⚠️ Database: Notification columns do not exist yet - returning null');
          return null;
        }
        
        throw error;
      }

      console.log('✅ Database: Notification preferences retrieved:', data);
      return data;
    } catch (error) {
      console.error('❌ Database: Failed to get notification preferences:', error);
      
      // Check if the error is due to missing columns
      if (error instanceof Error && error.message && error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('⚠️ Database: Notification columns do not exist yet - returning null');
        return null;
      }
      
      throw error;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }
    
    return data
  }
}

// Client operations
export const clientOperations = {
  async getAll(userId: string, niche?: string): Promise<Client[]> {
    let query = supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
    
    if (niche) {
      query = query.eq('niche', niche)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting clients:', error)
      return []
    }
    
    return data || []
  },

  async getById(id: string, userId: string, niche?: string): Promise<Client | null> {
    let query = supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
    
    if (niche) {
      query = query.eq('niche', niche)
    }
    
    const { data, error } = await query.single()
    
    if (error) {
      console.error('Error getting client:', error)
      return null
    }
    
    return data
  },

  async create(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating client:', error)
      return null
    }
    
    return data
  },

  async update(id: string, userId: string, updates: Partial<Client>, niche?: string): Promise<Client | null> {
    let query = supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
    
    if (niche) {
      query = query.eq('niche', niche)
    }
    
    const { data, error } = await query.select().single()
    
    if (error) {
      console.error('Error updating client:', error)
      return null
    }
    
    return data
  },

  async delete(id: string, userId: string, niche?: string): Promise<boolean> {
    let query = supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (niche) {
      query = query.eq('niche', niche)
    }
    
    const { error } = await query
    
    if (error) {
      console.error('Error deleting client:', error)
      return false
    }
    
    return true
  }
}

// Opportunity operations
export const opportunityOperations = {
  async getAll(userId: string): Promise<Opportunity[]> {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          company
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting opportunities:', error)
      return []
    }
    
    return data || []
  },

  async getById(id: string, userId: string): Promise<Opportunity | null> {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          company
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error getting opportunity:', error)
      return null
    }
    
    return data
  },

  async create(opportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>): Promise<Opportunity | null> {
    const { data, error } = await supabase
      .from('opportunities')
      .insert(opportunity)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating opportunity:', error)
      return null
    }
    
    return data
  },

  async update(id: string, userId: string, updates: Partial<Opportunity>): Promise<Opportunity | null> {
    const { data, error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating opportunity:', error)
      return null
    }
    
    return data
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error deleting opportunity:', error)
      return false
    }
    
    return true
  }
}

// Content operations
export const contentOperations = {
  async getAll(userId: string): Promise<Content[]> {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting content:', error)
      return []
    }
    
    return data || []
  },

  async getById(id: string, userId: string): Promise<Content | null> {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error getting content:', error)
      return null
    }
    
    return data
  },

  async create(content: Omit<Content, 'id' | 'created_at' | 'updated_at'>): Promise<Content | null> {
    const { data, error } = await supabase
      .from('content')
      .insert(content)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating content:', error)
      return null
    }
    
    return data
  },

  async update(id: string, userId: string, updates: Partial<Content>): Promise<Content | null> {
    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating content:', error)
      return null
    }
    
    return data
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error deleting content:', error)
      return false
    }
    
    return true
  }
}

// Calendar event operations
export const calendarOperations = {
  async getAll(userId: string): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        clients (
          id,
          name,
          email
        ),
        opportunities (
          id,
          title,
          value
        )
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: true })
    
    if (error) {
      console.error('Error getting calendar events:', error)
      return []
    }
    
    return data || []
  },

  async getById(id: string, userId: string): Promise<CalendarEvent | null> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        clients (
          id,
          name,
          email
        ),
        opportunities (
          id,
          title,
          value
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error getting calendar event:', error)
      return null
    }
    
    return data
  },

  async create(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent | null> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(event)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating calendar event:', error)
      return null
    }
    
    return data
  },

  async update(id: string, userId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating calendar event:', error)
      return null
    }
    
    return data
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error deleting calendar event:', error)
      return false
    }
    
    return true
  }
}

// Journal operations
export const journalOperations = {
  async getAll(userId: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting journal entries:', error)
      return []
    }
    
    return data || []
  },

  async getById(id: string, userId: string): Promise<JournalEntry | null> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error getting journal entry:', error)
      return null
    }
    
    return data
  },

  async create(entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>): Promise<JournalEntry | null> {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert(entry)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating journal entry:', error)
      return null
    }
    
    return data
  },

  async update(id: string, userId: string, updates: Partial<JournalEntry>): Promise<JournalEntry | null> {
    const { data, error } = await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating journal entry:', error)
      return null
    }
    
    return data
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error deleting journal entry:', error)
      return false
    }
    
    return true
  }
}

// Goal operations
export const goalOperations = {
  async getAll(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting goals:', error)
      return []
    }
    
    return data || []
  },

  async getById(id: string, userId: string): Promise<Goal | null> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error getting goal:', error)
      return null
    }
    
    return data
  },

  async create(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal | null> {
    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating goal:', error)
      return null
    }
    
    return data
  },

  async update(id: string, userId: string, updates: Partial<Goal>): Promise<Goal | null> {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating goal:', error)
      return null
    }
    
    return data
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error deleting goal:', error)
      return false
    }
    
    return true
  }
}

// Analytics operations
export const analyticsOperations = {
  async getRevenueStats(userId: string) {
    const { data, error } = await supabase
      .from('opportunities')
      .select('value, status, stage, created_at')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error getting revenue stats:', error)
      return null
    }
    
    return data
  },

  async getContentStats(userId: string) {
    const { data, error } = await supabase
      .from('content')
      .select('status, stage, type, created_at')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error getting content stats:', error)
      return null
    }
    
    return data
  },

  async getClientStats(userId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('status, created_at')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error getting client stats:', error)
      return null
    }
    
    return data
  }
}
