export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string | null
          id: string
          is_resolved: boolean | null
          message: string
          patient_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message: string
          patient_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message?: string
          patient_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      callback_requests: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          preferred_time: string
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          preferred_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          preferred_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      care_notes: {
        Row: {
          caregiver_id: string | null
          created_at: string | null
          id: string
          note: string
          patient_id: string | null
        }
        Insert: {
          caregiver_id?: string | null
          created_at?: string | null
          id?: string
          note: string
          patient_id?: string | null
        }
        Update: {
          caregiver_id?: string | null
          created_at?: string | null
          id?: string
          note?: string
          patient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_notes_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_staff: boolean
          message: string
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_staff?: boolean
          message: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_staff?: boolean
          message?: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes: number | null
          module_id: string
          parent_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes?: number | null
          module_id: string
          parent_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes?: number | null
          module_id?: string
          parent_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      content_calendar: {
        Row: {
          content: string
          created_at: string
          engagement_data: Json | null
          hashtags: string[] | null
          id: string
          image_urls: string[] | null
          platform: string
          published_at: string | null
          scheduled_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          engagement_data?: Json | null
          hashtags?: string[] | null
          id?: string
          image_urls?: string[] | null
          platform: string
          published_at?: string | null
          scheduled_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          engagement_data?: Json | null
          hashtags?: string[] | null
          id?: string
          image_urls?: string[] | null
          platform?: string
          published_at?: string | null
          scheduled_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_free: boolean | null
          price: number | null
          title: string
          tutor_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_free?: boolean | null
          price?: number | null
          title: string
          tutor_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_free?: boolean | null
          price?: number | null
          title?: string
          tutor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          clicked_count: number | null
          content: string
          created_at: string
          id: string
          name: string
          opened_count: number | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          clicked_count?: number | null
          content: string
          created_at?: string
          id?: string
          name: string
          opened_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          clicked_count?: number | null
          content?: string
          created_at?: string
          id?: string
          name?: string
          opened_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string | null
          enrolled_at: string | null
          id: string
          is_paid: boolean | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          is_paid?: boolean | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          is_paid?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          company: string | null
          created_at: string
          email: string
          event_id: string | null
          id: string
          name: string
          payment_reference: string | null
          payment_status: string | null
          phone: string | null
          special_requests: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          event_id?: string | null
          id?: string
          name: string
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          event_id?: string | null
          id?: string
          name?: string
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          image_url: string | null
          max_attendees: number | null
          price_cents: number | null
          requires_approval: boolean | null
          status: string
          title: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          image_url?: string | null
          max_attendees?: number | null
          price_cents?: number | null
          requires_approval?: boolean | null
          status?: string
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          image_url?: string | null
          max_attendees?: number | null
          price_cents?: number | null
          requires_approval?: boolean | null
          status?: string
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string | null
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          name: string
          patient_id: string | null
          start_date: string
        }
        Insert: {
          created_at?: string | null
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          name: string
          patient_id?: string | null
          start_date: string
        }
        Update: {
          created_at?: string | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name?: string
          patient_id?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          preferences: Json | null
          status: string
          subscription_source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          preferences?: Json | null
          status?: string
          subscription_source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          preferences?: Json | null
          status?: string
          subscription_source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          page_path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          page_path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          emergency_contact: string | null
          id: string
          medical_conditions: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          id?: string
          medical_conditions?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          id?: string
          medical_conditions?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          course_id: string
          created_at: string | null
          id: string
          module_id: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          module_id: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          module_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string | null
          id: string
          module_id: string
          title: string
          type: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id: string
          title: string
          type?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string
          title?: string
          type?: string | null
          url?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string
          id: string
          page_path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      vitals: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          heart_rate: number | null
          hydration_level: number | null
          id: string
          patient_id: string | null
          recorded_at: string | null
          temperature: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          heart_rate?: number | null
          hydration_level?: number | null
          id?: string
          patient_id?: string | null
          recorded_at?: string | null
          temperature?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          heart_rate?: number | null
          hydration_level?: number | null
          id?: string
          patient_id?: string | null
          recorded_at?: string | null
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "patient" | "caregiver" | "family" | "admin"
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
      user_role: ["patient", "caregiver", "family", "admin"],
    },
  },
} as const
