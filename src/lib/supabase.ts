import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          primary_niche: string | null
          niches: string[] | null
          onboarding_completed: boolean | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          timezone: string
          email_notifications_enabled: boolean | null
          notification_preferences: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          primary_niche?: string | null
          niches?: string[] | null
          onboarding_completed?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          timezone?: string
          email_notifications_enabled?: boolean | null
          notification_preferences?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          primary_niche?: string | null
          niches?: string[] | null
          onboarding_completed?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          timezone?: string
          email_notifications_enabled?: boolean | null
          notification_preferences?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          niche: string
          name: string
          email: string | null
          company: string | null
          phone: string | null
          website: string | null
          social_media: Record<string, string> | null
          notes: string | null
          tags: string[] | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          niche: string
          name: string
          email?: string | null
          company?: string | null
          phone?: string | null
          website?: string | null
          social_media?: Record<string, string> | null
          notes?: string | null
          tags?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          niche?: string
          name?: string
          email?: string | null
          company?: string | null
          phone?: string | null
          website?: string | null
          social_media?: Record<string, string> | null
          notes?: string | null
          tags?: string[] | null
          status?: string
          updated_at?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          title: string
          description: string | null
          value: number
          status: string
          stage: string
          niche: string
          source: string | null
          expected_close_date: string | null
          actual_close_date: string | null
          probability: number
          notes: string | null
          tags: string[] | null
          custom_fields: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          title: string
          description?: string | null
          value?: number
          status?: string
          stage?: string
          niche?: string
          source?: string | null
          expected_close_date?: string | null
          actual_close_date?: string | null
          probability?: number
          notes?: string | null
          tags?: string[] | null
          custom_fields?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          title?: string
          description?: string | null
          value?: number
          status?: string
          stage?: string
          niche?: string
          source?: string | null
          expected_close_date?: string | null
          actual_close_date?: string | null
          probability?: number
          notes?: string | null
          tags?: string[] | null
          custom_fields?: Record<string, any> | null
          updated_at?: string
        }
      }
      content: {
        Row: {
          id: string
          user_id: string
          title: string
          type: string
          status: string
          stage: string
          niche: string
          description: string | null
          content_url: string | null
          scheduled_date: string | null
          published_date: string | null
          platform: string | null
          tags: string[] | null
          notes: string | null
          custom_fields: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: string
          status?: string
          stage?: string
          niche?: string
          description?: string | null
          content_url?: string | null
          scheduled_date?: string | null
          published_date?: string | null
          platform?: string | null
          tags?: string[] | null
          notes?: string | null
          custom_fields?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: string
          status?: string
          stage?: string
          niche?: string
          description?: string | null
          content_url?: string | null
          scheduled_date?: string | null
          published_date?: string | null
          platform?: string | null
          tags?: string[] | null
          notes?: string | null
          custom_fields?: Record<string, any> | null
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          type: string
          color: string
          niche: string
          client_id: string | null
          opportunity_id: string | null
          status: string
          location: string | null
          meeting_url: string | null
          notes: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          type?: string
          color?: string
          niche?: string
          client_id?: string | null
          deal_id?: string | null
          status?: string
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          type?: string
          color?: string
          niche?: string
          client_id?: string | null
          deal_id?: string | null
          status?: string
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          tags?: string[] | null
          updated_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          mood: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          mood?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          mood?: string | null
          tags?: string[] | null
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_value: number | null
          current_value: number
          unit: string | null
          deadline: string | null
          status: string
          category: string
          niche: string
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          target_value?: number | null
          current_value?: number
          unit?: string | null
          deadline?: string | null
          status?: string
          category?: string
          niche?: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          target_value?: number | null
          current_value?: number
          unit?: string | null
          deadline?: string | null
          status?: string
          category?: string
          niche?: string
          tags?: string[] | null
          updated_at?: string
        }
      }
    }
  }
}
