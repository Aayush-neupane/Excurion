/**
 * Generated types for the Supabase schema (design-time snapshot).
 *
 * Regenerate after any migration with:
 *   supabase gen types typescript --project-id <ref> --schema public > src/types/supabase/database.types.ts
 * The casts below are safe because the generated types mirror these shapes;
 * this hand-authored file avoids requiring a linked project to develop.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'student' | 'teacher' | 'admin'
          title: string | null
          bio: string | null
          timezone: string
          company: string | null
          avatar_url: string | null
          notification_preferences: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: 'student' | 'teacher' | 'admin'
          title?: string | null
          bio?: string | null
          timezone?: string
          company?: string | null
          avatar_url?: string | null
          notification_preferences?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
        Relationships: []
      }
      rooms: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'class' | '1on1' | 'webinar' | 'office-hours'
          subject: string | null
          room_code: string
          host_id: string
          status: 'live' | 'scheduled' | 'ended' | 'recording'
          privacy: 'public' | 'private' | 'unlisted'
          scheduled_at: string | null
          duration_minutes: number | null
          participant_limit: number
          recording_url: string | null
          started_at: string | null
          ended_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['rooms']['Row']>
        Update: Partial<Database['public']['Tables']['rooms']['Row']>
        Relationships: [
          {
            foreignKeyName: 'rooms_host_id_fkey'
            columns: ['host_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      meetings: {
        Row: {
          id: string
          room_id: string
          title: string
          status: 'live' | 'scheduled' | 'ended' | 'recording'
          scheduled_at: string | null
          started_at: string | null
          ended_at: string | null
          recording_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['meetings']['Row']>
        Update: Partial<Database['public']['Tables']['meetings']['Row']>
        Relationships: [
          {
            foreignKeyName: 'meetings_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          }
        ]
      }
      meeting_settings: {
        Row: {
          room_id: string
          allow_screen_share: boolean
          allow_chat: boolean
          allow_messages_edit: boolean
          allow_raised_hands: boolean
          mute_on_entry: boolean
          waiting_room: boolean
          record_meeting: boolean
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['meeting_settings']['Row']>
        Update: Partial<Database['public']['Tables']['meeting_settings']['Row']>
        Relationships: [
          {
            foreignKeyName: 'meeting_settings_room_id_fkey'
            columns: ['room_id']
            isOneToOne: true
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          }
        ]
      }
      participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          is_host: boolean
          mic: 'on' | 'off' | 'unavailable'
          camera: 'on' | 'off' | 'unavailable'
          screen_share: boolean
          speaking: boolean
          raised_hand: boolean
          connection: 'excellent' | 'good' | 'fair' | 'poor'
          last_read_at: string | null
          joined_at: string
          left_at: string | null
          status: 'active' | 'left' | 'removed'
        }
        Insert: Partial<Database['public']['Tables']['participants']['Row']>
        Update: Partial<Database['public']['Tables']['participants']['Row']>
        Relationships: [
          {
            foreignKeyName: 'participants_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'participants_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      messages: {
        Row: {
          id: string
          room_id: string
          author_id: string
          content: string
          metadata: Record<string, unknown>
          status: 'active' | 'edited' | 'deleted'
          created_at: string
          edited_at: string | null
          deleted_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['messages']['Row']>
        Update: Partial<Database['public']['Tables']['messages']['Row']>
        Relationships: [
          {
            foreignKeyName: 'messages_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      whiteboard_snapshots: {
        Row: {
          room_id: string
          version: number
          document: unknown
          updated_by: string | null
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['whiteboard_snapshots']['Row']>
        Update: Partial<Database['public']['Tables']['whiteboard_snapshots']['Row']>
        Relationships: [
          {
            foreignKeyName: 'whiteboard_snapshots_room_id_fkey'
            columns: ['room_id']
            isOneToOne: true
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'whiteboard_snapshots_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          kind: 'meeting' | 'reminder' | 'chat' | 'recording' | 'system' | 'warning'
          title: string
          body: string
          read: boolean
          link: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['notifications']['Row']>
        Update: Partial<Database['public']['Tables']['notifications']['Row']>
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      create_room: {
        Args: {
          p_title: string
          p_description?: string | null
          p_type?: 'class' | '1on1' | 'webinar' | 'office-hours'
          p_subject?: string | null
          p_privacy?: 'public' | 'private' | 'unlisted'
          p_scheduled_at?: string | null
          p_duration_minutes?: number | null
          p_participant_limit?: number
        }
        Returns: Database['public']['Tables']['rooms']['Row']
      }
      create_own_notification: {
        Args: {
          p_kind: 'meeting' | 'reminder' | 'chat' | 'recording' | 'system' | 'warning'
          p_title: string
          p_body?: string
          p_link?: string | null
        }
        Returns: Database['public']['Tables']['notifications']['Row']
      }
      end_room: { Args: { p_room_id: string }; Returns: undefined }
      generate_room_code: { Args: Record<string, never>; Returns: string }
      join_room: { Args: { p_code: string }; Returns: Database['public']['Tables']['rooms']['Row'][] }
      leave_room: { Args: { p_room_id: string }; Returns: undefined }
      promote_host: { Args: { p_room_id: string; p_user_id: string }; Returns: undefined }
      save_whiteboard_snapshot: {
        Args: { p_room_id: string; p_document: Record<string, unknown>; p_version?: number }
        Returns: Database['public']['Tables']['whiteboard_snapshots']['Row']
      }
    }
    Enums: Record<string, never>
  }
}