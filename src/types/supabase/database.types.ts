export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      meeting_settings: {
        Row: {
          allow_chat: boolean
          allow_messages_edit: boolean
          allow_raised_hands: boolean
          allow_screen_share: boolean
          mute_on_entry: boolean
          record_meeting: boolean
          room_id: string
          updated_at: string
          waiting_room: boolean
        }
        Insert: {
          allow_chat?: boolean
          allow_messages_edit?: boolean
          allow_raised_hands?: boolean
          allow_screen_share?: boolean
          mute_on_entry?: boolean
          record_meeting?: boolean
          room_id: string
          updated_at?: string
          waiting_room?: boolean
        }
        Update: {
          allow_chat?: boolean
          allow_messages_edit?: boolean
          allow_raised_hands?: boolean
          allow_screen_share?: boolean
          mute_on_entry?: boolean
          record_meeting?: boolean
          room_id?: string
          updated_at?: string
          waiting_room?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "meeting_settings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          recording_url: string | null
          room_id: string
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          recording_url?: string | null
          room_id: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["room_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          recording_url?: string | null
          room_id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["room_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          author_id: string
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          metadata: Json
          room_id: string
          status: Database["public"]["Enums"]["message_status"]
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          metadata?: Json
          room_id: string
          status?: Database["public"]["Enums"]["message_status"]
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          metadata?: Json
          room_id?: string
          status?: Database["public"]["Enums"]["message_status"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["notification_kind"]
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          attempts: number
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          purpose: string
          used_at: string | null
        }
        Insert: {
          attempts?: number
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          purpose: string
          used_at?: string | null
        }
        Update: {
          attempts?: number
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          purpose?: string
          used_at?: string | null
        }
        Relationships: []
      }
      participants: {
        Row: {
          camera: Database["public"]["Enums"]["device_state"]
          connection: Database["public"]["Enums"]["connection_quality"]
          id: string
          is_host: boolean
          joined_at: string
          last_read_at: string | null
          last_seen_at: string
          left_at: string | null
          mic: Database["public"]["Enums"]["device_state"]
          raised_hand: boolean
          room_id: string
          screen_share: boolean
          speaking: boolean
          status: Database["public"]["Enums"]["participant_status"]
          user_id: string
        }
        Insert: {
          camera?: Database["public"]["Enums"]["device_state"]
          connection?: Database["public"]["Enums"]["connection_quality"]
          id?: string
          is_host?: boolean
          joined_at?: string
          last_read_at?: string | null
          last_seen_at?: string
          left_at?: string | null
          mic?: Database["public"]["Enums"]["device_state"]
          raised_hand?: boolean
          room_id: string
          screen_share?: boolean
          speaking?: boolean
          status?: Database["public"]["Enums"]["participant_status"]
          user_id: string
        }
        Update: {
          camera?: Database["public"]["Enums"]["device_state"]
          connection?: Database["public"]["Enums"]["connection_quality"]
          id?: string
          is_host?: boolean
          joined_at?: string
          last_read_at?: string | null
          last_seen_at?: string
          left_at?: string | null
          mic?: Database["public"]["Enums"]["device_state"]
          raised_hand?: boolean
          room_id?: string
          screen_share?: boolean
          speaking?: boolean
          status?: Database["public"]["Enums"]["participant_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          notification_preferences: Json
          role: Database["public"]["Enums"]["user_role"]
          timezone: string
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          notification_preferences?: Json
          role?: Database["public"]["Enums"]["user_role"]
          timezone?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notification_preferences?: Json
          role?: Database["public"]["Enums"]["user_role"]
          timezone?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          duration_minutes: number | null
          ended_at: string | null
          host_id: string
          id: string
          participant_limit: number
          privacy: Database["public"]["Enums"]["room_privacy"]
          recording_url: string | null
          room_code: string
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          subject: string | null
          title: string
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          host_id: string
          id?: string
          participant_limit?: number
          privacy?: Database["public"]["Enums"]["room_privacy"]
          recording_url?: string | null
          room_code: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["room_status"]
          subject?: string | null
          title: string
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          host_id?: string
          id?: string
          participant_limit?: number
          privacy?: Database["public"]["Enums"]["room_privacy"]
          recording_url?: string | null
          room_code?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["room_status"]
          subject?: string | null
          title?: string
          type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_passwords: {
        Row: {
          created_at: string
          password: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          password: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          password?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_passwords_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whiteboard_snapshots: {
        Row: {
          document: Json
          room_id: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          document?: Json
          room_id: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          document?: Json
          room_id?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "whiteboard_snapshots_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whiteboard_snapshots_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      active_participant_count: { Args: { p_room_id: string }; Returns: number }
      create_otp_code: {
        Args: { p_email: string; p_purpose: string }
        Returns: string
      }
      create_own_notification: {
        Args: {
          p_body?: string
          p_kind: Database["public"]["Enums"]["notification_kind"]
          p_link?: string
          p_title: string
        }
        Returns: {
          body: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["notification_kind"]
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_room: {
        Args: {
          p_description?: string
          p_duration_minutes?: number
          p_participant_limit?: number
          p_privacy?: Database["public"]["Enums"]["room_privacy"]
          p_scheduled_at?: string
          p_subject?: string
          p_title: string
          p_type?: Database["public"]["Enums"]["room_type"]
        }
        Returns: {
          created_at: string
          deleted_at: string | null
          description: string | null
          duration_minutes: number | null
          ended_at: string | null
          host_id: string
          id: string
          participant_limit: number
          privacy: Database["public"]["Enums"]["room_privacy"]
          recording_url: string | null
          room_code: string
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          subject: string | null
          title: string
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      end_room: { Args: { p_room_id: string }; Returns: undefined }
      generate_room_code: { Args: never; Returns: string }
      get_room_by_code: {
        Args: { p_code: string }
        Returns: {
          created_at: string
          deleted_at: string | null
          description: string | null
          duration_minutes: number | null
          ended_at: string | null
          host_id: string
          id: string
          participant_limit: number
          privacy: Database["public"]["Enums"]["room_privacy"]
          recording_url: string | null
          room_code: string
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          subject: string | null
          title: string
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_joinable_room: { Args: { p_room_id: string }; Returns: boolean }
      is_room_active_member: { Args: { p_room_id: string }; Returns: boolean }
      is_room_host: { Args: { p_room_id: string }; Returns: boolean }
      is_room_member: { Args: { p_room_id: string }; Returns: boolean }
      is_room_participant: { Args: { room_id: string }; Returns: boolean }
      join_room: {
        Args: { p_code: string }
        Returns: {
          created_at: string
          deleted_at: string | null
          description: string | null
          duration_minutes: number | null
          ended_at: string | null
          host_id: string
          id: string
          participant_limit: number
          privacy: Database["public"]["Enums"]["room_privacy"]
          recording_url: string | null
          room_code: string
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          subject: string | null
          title: string
          type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      leave_room: { Args: { p_room_id: string }; Returns: undefined }
      otp_register: {
        Args: {
          p_code: string
          p_email: string
          p_name: string
          p_password: string
          p_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      otp_reset: {
        Args: { p_code: string; p_email: string; p_new_password: string }
        Returns: undefined
      }
      promote_host: {
        Args: { p_room_id: string; p_user_id: string }
        Returns: undefined
      }
      room_participant_count: { Args: { room_id: string }; Returns: number }
      rooms_created_at: { Args: { room_id: string }; Returns: string }
      save_whiteboard_snapshot: {
        Args: { p_document: Json; p_room_id: string; p_version: number }
        Returns: {
          document: Json
          room_id: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "whiteboard_snapshots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      verify_otp: {
        Args: { p_code: string; p_email: string; p_purpose: string }
        Returns: undefined
      }
    }
    Enums: {
      connection_quality: "excellent" | "good" | "fair" | "poor"
      device_state: "on" | "off" | "unavailable"
      message_status: "active" | "edited" | "deleted"
      notification_kind:
        | "meeting"
        | "reminder"
        | "chat"
        | "recording"
        | "system"
        | "warning"
      participant_status: "active" | "left" | "removed"
      room_privacy: "public" | "private" | "unlisted"
      room_status: "live" | "scheduled" | "ended" | "recording"
      room_type: "class" | "1on1" | "webinar" | "office-hours"
      user_role: "student" | "teacher" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      connection_quality: ["excellent", "good", "fair", "poor"],
      device_state: ["on", "off", "unavailable"],
      message_status: ["active", "edited", "deleted"],
      notification_kind: [
        "meeting",
        "reminder",
        "chat",
        "recording",
        "system",
        "warning",
      ],
      participant_status: ["active", "left", "removed"],
      room_privacy: ["public", "private", "unlisted"],
      room_status: ["live", "scheduled", "ended", "recording"],
      room_type: ["class", "1on1", "webinar", "office-hours"],
      user_role: ["student", "teacher", "admin"],
    },
  },
} as const
