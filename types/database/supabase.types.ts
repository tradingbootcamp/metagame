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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      coupon_emails: {
        Row: {
          coupon_id: string
          email: string
          max_uses: number
          uses: number
        }
        Insert: {
          coupon_id: string
          email: string
          max_uses?: number
          uses?: number
        }
        Update: {
          coupon_id?: string
          email?: string
          max_uses?: number
          uses?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupon_emails_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          coupon_code: string
          created_at: string
          description: string | null
          discount_amount_cents: number
          email_for: boolean
          enabled: boolean
          id: string
          max_uses: number | null
          used_count: number
        }
        Insert: {
          coupon_code: string
          created_at?: string
          description?: string | null
          discount_amount_cents?: number
          email_for?: boolean
          enabled?: boolean
          id?: string
          max_uses?: number | null
          used_count?: number
        }
        Update: {
          coupon_code?: string
          created_at?: string
          description?: string | null
          discount_amount_cents?: number
          email_for?: boolean
          enabled?: boolean
          id?: string
          max_uses?: number | null
          used_count?: number
        }
        Relationships: []
      }
      locations: {
        Row: {
          campus_location: string | null
          capacity: number | null
          display_in_schedule: boolean
          id: string
          image_url: string | null
          lh_name: string | null
          name: string
          schedule_display_order: number
          thumbnail_url: string | null
        }
        Insert: {
          campus_location?: string | null
          capacity?: number | null
          display_in_schedule?: boolean
          id?: string
          image_url?: string | null
          lh_name?: string | null
          name?: string
          schedule_display_order?: number
          thumbnail_url?: string | null
        }
        Update: {
          campus_location?: string | null
          capacity?: number | null
          display_in_schedule?: boolean
          id?: string
          image_url?: string | null
          lh_name?: string | null
          name?: string
          schedule_display_order?: number
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      opennode_orders: {
        Row: {
          created_at: string
          id: string
          is_test: boolean
          opennode_order_id: string
          purchaser_email: string | null
          purchaser_name: string | null
          satoshis: number
          status: string
          ticket_type: Database["public"]["Enums"]["ticket_type"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_test: boolean
          opennode_order_id: string
          purchaser_email?: string | null
          purchaser_name?: string | null
          satoshis: number
          status: string
          ticket_type?: Database["public"]["Enums"]["ticket_type"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_test?: boolean
          opennode_order_id?: string
          purchaser_email?: string | null
          purchaser_name?: string | null
          satoshis?: number
          status?: string
          ticket_type?: Database["public"]["Enums"]["ticket_type"] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bringing_kids: boolean | null
          discord_handle: string | null
          dismissed_info_request: boolean
          email: string | null
          first_name: string | null
          homepage_order: number | null
          id: string
          is_admin: boolean
          last_name: string | null
          minor: boolean | null
          opted_in_to_homepage_display: boolean | null
          profile_pictures_url: string | null
          site_name: string | null
          site_name_2: string | null
          site_url: string | null
          site_url_2: string | null
          team: Database["public"]["Enums"]["TEAM_COLORS"]
        }
        Insert: {
          bringing_kids?: boolean | null
          discord_handle?: string | null
          dismissed_info_request?: boolean
          email?: string | null
          first_name?: string | null
          homepage_order?: number | null
          id: string
          is_admin?: boolean
          last_name?: string | null
          minor?: boolean | null
          opted_in_to_homepage_display?: boolean | null
          profile_pictures_url?: string | null
          site_name?: string | null
          site_name_2?: string | null
          site_url?: string | null
          site_url_2?: string | null
          team?: Database["public"]["Enums"]["TEAM_COLORS"]
        }
        Update: {
          bringing_kids?: boolean | null
          discord_handle?: string | null
          dismissed_info_request?: boolean
          email?: string | null
          first_name?: string | null
          homepage_order?: number | null
          id?: string
          is_admin?: boolean
          last_name?: string | null
          minor?: boolean | null
          opted_in_to_homepage_display?: boolean | null
          profile_pictures_url?: string | null
          site_name?: string | null
          site_name_2?: string | null
          site_url?: string | null
          site_url_2?: string | null
          team?: Database["public"]["Enums"]["TEAM_COLORS"]
        }
        Relationships: []
      }
      session_bookmarks: {
        Row: {
          created_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_bookmarks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_bookmarks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_rsvps: {
        Row: {
          created_at: string
          on_waitlist: boolean
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          on_waitlist?: boolean
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          on_waitlist?: boolean
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_rsvps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_rsvps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          ages: Database["public"]["Enums"]["AGES"] | null
          description: string | null
          end_time: string | null
          host_1_id: string | null
          host_2_id: string | null
          host_3_id: string | null
          id: string
          location_id: string | null
          max_capacity: number | null
          megagame: boolean
          min_capacity: number | null
          reserved_spots: number
          session_type: Database["public"]["Enums"]["SESSION_CATEGORY"] | null
          start_time: string | null
          title: string | null
        }
        Insert: {
          ages?: Database["public"]["Enums"]["AGES"] | null
          description?: string | null
          end_time?: string | null
          host_1_id?: string | null
          host_2_id?: string | null
          host_3_id?: string | null
          id?: string
          location_id?: string | null
          max_capacity?: number | null
          megagame?: boolean
          min_capacity?: number | null
          reserved_spots?: number
          session_type?: Database["public"]["Enums"]["SESSION_CATEGORY"] | null
          start_time?: string | null
          title?: string | null
        }
        Update: {
          ages?: Database["public"]["Enums"]["AGES"] | null
          description?: string | null
          end_time?: string | null
          host_1_id?: string | null
          host_2_id?: string | null
          host_3_id?: string | null
          id?: string
          location_id?: string | null
          max_capacity?: number | null
          megagame?: boolean
          min_capacity?: number | null
          reserved_spots?: number
          session_type?: Database["public"]["Enums"]["SESSION_CATEGORY"] | null
          start_time?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_host_1_id_fkey"
            columns: ["host_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_host_2_id_fkey"
            columns: ["host_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_host_3_id_fkey"
            columns: ["host_3_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          admin_issued: boolean
          coupons_used: string[]
          created_at: string
          id: string
          is_test: boolean
          opennode_order: string | null
          owner_id: string | null
          price_paid: number | null
          purchaser_email: string | null
          purchaser_name: string | null
          satoshis_paid: number | null
          stripe_payment_id: string | null
          ticket_code: string
          ticket_type: Database["public"]["Enums"]["ticket_type"]
        }
        Insert: {
          admin_issued?: boolean
          coupons_used?: string[]
          created_at?: string
          id?: string
          is_test: boolean
          opennode_order?: string | null
          owner_id?: string | null
          price_paid?: number | null
          purchaser_email?: string | null
          purchaser_name?: string | null
          satoshis_paid?: number | null
          stripe_payment_id?: string | null
          ticket_code: string
          ticket_type: Database["public"]["Enums"]["ticket_type"]
        }
        Update: {
          admin_issued?: boolean
          coupons_used?: string[]
          created_at?: string
          id?: string
          is_test?: boolean
          opennode_order?: string | null
          owner_id?: string | null
          price_paid?: number | null
          purchaser_email?: string | null
          purchaser_name?: string | null
          satoshis_paid?: number | null
          stripe_payment_id?: string | null
          ticket_code?: string
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
        }
        Relationships: [
          {
            foreignKeyName: "tickets_opennode_order_fkey"
            columns: ["opennode_order"]
            isOneToOne: false
            referencedRelation: "opennode_orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      coupon_emails_view: {
        Row: {
          coupon_code: string | null
          coupon_id: string | null
          email: string | null
          max_uses: number | null
          uses: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_emails_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      session_rsvps_view: {
        Row: {
          created_at: string | null
          email: string | null
          session_id: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_rsvps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_rsvps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions_view: {
        Row: {
          ages: Database["public"]["Enums"]["AGES"] | null
          description: string | null
          end_time: string | null
          host_1_email: string | null
          host_1_first_name: string | null
          host_1_id: string | null
          host_1_last_name: string | null
          host_2_email: string | null
          host_2_first_name: string | null
          host_2_id: string | null
          host_2_last_name: string | null
          host_3_email: string | null
          host_3_first_name: string | null
          host_3_id: string | null
          host_3_last_name: string | null
          id: string | null
          location_id: string | null
          location_name: string | null
          max_capacity: number | null
          megagame: boolean | null
          min_capacity: number | null
          rsvp_count: number | null
          start_time: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_host_1_id_fkey"
            columns: ["host_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_host_2_id_fkey"
            columns: ["host_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_host_3_id_fkey"
            columns: ["host_3_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      AGES: "ADULTS" | "KIDS" | "ALL"
      OPENNODE_CHARGE_STATUS:
        | "underpaid"
        | "refunded"
        | "processing"
        | "paid"
        | "expired"
      SESSION_CATEGORY: "talk" | "workshop" | "game" | "other"
      TEAM_COLORS: "orange" | "purple" | "green" | "unassigned"
      ticket_type:
        | "volunteer"
        | "player"
        | "supporter"
        | "friday"
        | "saturday"
        | "sunday"
        | "student"
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
      AGES: ["ADULTS", "KIDS", "ALL"],
      OPENNODE_CHARGE_STATUS: [
        "underpaid",
        "refunded",
        "processing",
        "paid",
        "expired",
      ],
      SESSION_CATEGORY: ["talk", "workshop", "game", "other"],
      TEAM_COLORS: ["orange", "purple", "green", "unassigned"],
      ticket_type: [
        "volunteer",
        "player",
        "supporter",
        "friday",
        "saturday",
        "sunday",
        "student",
      ],
    },
  },
} as const
