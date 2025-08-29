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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          cancellation_reason: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_notes: string | null
          client_phone: string | null
          confirmation_sent_at: string | null
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          organization_id: string
          professional_id: string
          reminder_sent_at: string | null
          scheduled_at: string
          service_id: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_notes?: string | null
          client_phone?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          organization_id: string
          professional_id: string
          reminder_sent_at?: string | null
          scheduled_at: string
          service_id: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_notes?: string | null
          client_phone?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          organization_id?: string
          professional_id?: string
          reminder_sent_at?: string | null
          scheduled_at?: string
          service_id?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          organization_id: string
          professional_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          organization_id: string
          professional_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string
          professional_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_slots_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          cancellation_enabled: boolean
          confirmation_enabled: boolean
          created_at: string
          custom_email_template: string | null
          custom_sms_template: string | null
          email_notifications: boolean
          id: string
          no_show_tracking: boolean
          notification_sender_email: string | null
          notification_sender_name: string | null
          organization_id: string
          reminder_hours_before: number
          sms_notifications: boolean
          updated_at: string
          whatsapp_api_key: string | null
          whatsapp_notifications: boolean
        }
        Insert: {
          cancellation_enabled?: boolean
          confirmation_enabled?: boolean
          created_at?: string
          custom_email_template?: string | null
          custom_sms_template?: string | null
          email_notifications?: boolean
          id?: string
          no_show_tracking?: boolean
          notification_sender_email?: string | null
          notification_sender_name?: string | null
          organization_id: string
          reminder_hours_before?: number
          sms_notifications?: boolean
          updated_at?: string
          whatsapp_api_key?: string | null
          whatsapp_notifications?: boolean
        }
        Update: {
          cancellation_enabled?: boolean
          confirmation_enabled?: boolean
          created_at?: string
          custom_email_template?: string | null
          custom_sms_template?: string | null
          email_notifications?: boolean
          id?: string
          no_show_tracking?: boolean
          notification_sender_email?: string | null
          notification_sender_name?: string | null
          organization_id?: string
          reminder_hours_before?: number
          sms_notifications?: boolean
          updated_at?: string
          whatsapp_api_key?: string | null
          whatsapp_notifications?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: Json | null
          created_at: string
          currency: string | null
          custom_domain: string | null
          email: string | null
          font_family: string | null
          id: string
          language: string | null
          logo_url: string | null
          name: string
          phone: string | null
          plan_type: string | null
          primary_color: string | null
          public_booking_enabled: boolean | null
          secondary_color: string | null
          slug: string
          status: Database["public"]["Enums"]["organization_status"] | null
          subscription_ends_at: string | null
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          currency?: string | null
          custom_domain?: string | null
          email?: string | null
          font_family?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          plan_type?: string | null
          primary_color?: string | null
          public_booking_enabled?: boolean | null
          secondary_color?: string | null
          slug: string
          status?: Database["public"]["Enums"]["organization_status"] | null
          subscription_ends_at?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          currency?: string | null
          custom_domain?: string | null
          email?: string | null
          font_family?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan_type?: string | null
          primary_color?: string | null
          public_booking_enabled?: boolean | null
          secondary_color?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["organization_status"] | null
          subscription_ends_at?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          price_cents: number | null
          professional_id: string | null
          requires_approval: boolean | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          price_cents?: number | null
          professional_id?: string | null
          requires_approval?: boolean | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          price_cents?: number | null
          professional_id?: string | null
          requires_approval?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_trial: boolean | null
          plan_name: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_trial?: boolean | null
          plan_name?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_trial?: boolean | null
          plan_name?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_usage: {
        Row: {
          appointments_count: number
          created_at: string
          id: string
          month_year: string
          organization_id: string
          professionals_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          appointments_count?: number
          created_at?: string
          id?: string
          month_year: string
          organization_id: string
          professionals_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          appointments_count?: number
          created_at?: string
          id?: string
          month_year?: string
          organization_id?: string
          professionals_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_recurring: boolean | null
          organization_id: string
          professional_id: string
          start_date: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_recurring?: boolean | null
          organization_id: string
          professional_id: string
          start_date: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_recurring?: boolean | null
          organization_id?: string
          professional_id?: string
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_off_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          accept_online_booking: boolean | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          language: string | null
          last_login_at: string | null
          notes: string | null
          notification_preferences: Json | null
          organization_id: string | null
          phone: string | null
          public_profile_enabled: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          slug: string | null
          specialties: string[] | null
          timezone: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          accept_online_booking?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          language?: string | null
          last_login_at?: string | null
          notes?: string | null
          notification_preferences?: Json | null
          organization_id?: string | null
          phone?: string | null
          public_profile_enabled?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          slug?: string | null
          specialties?: string[] | null
          timezone?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          accept_online_booking?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          language?: string | null
          last_login_at?: string | null
          notes?: string | null
          notification_preferences?: Json | null
          organization_id?: string | null
          phone?: string | null
          public_profile_enabled?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          slug?: string | null
          specialties?: string[] | null
          timezone?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_month_usage: {
        Args: { org_id: string }
        Returns: {
          appointments_count: number
          created_at: string
          id: string
          month_year: string
          organization_id: string
          professionals_count: number
          updated_at: string
          user_id: string
        }
      }
      get_current_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      increment_appointment_count: {
        Args: { org_id: string }
        Returns: undefined
      }
      user_can_access_organization: {
        Args: { org_id: string }
        Returns: boolean
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      organization_status: "active" | "inactive" | "suspended" | "trial"
      user_role:
        | "super_admin"
        | "organization_admin"
        | "professional"
        | "client"
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
  public: {
    Enums: {
      appointment_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      organization_status: ["active", "inactive", "suspended", "trial"],
      user_role: [
        "super_admin",
        "organization_admin",
        "professional",
        "client",
      ],
    },
  },
} as const
