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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }
    
    return data
  },

  async upsertProfile(userId: string, profile: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error upserting user profile:', error)
      return null
    }
    
    return data
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
  async getAll(userId: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting clients:', error)
      return []
    }
    
    return data || []
  },

  async getById(id: string, userId: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
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

  async update(id: string, userId: string, updates: Partial<Client>): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating client:', error)
      return null
    }
    
    return data
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
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
