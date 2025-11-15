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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      car_brands: {
        Row: {
          brand_name: string
          created_at: string
          id: string
        }
        Insert: {
          brand_name: string
          created_at?: string
          id?: string
        }
        Update: {
          brand_name?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          car_model: string | null
          car_number: string | null
          created_at: string | null
          full_name: string
          id: string
          notes: string | null
          partner_id: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          car_model?: string | null
          car_number?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          notes?: string | null
          partner_id: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          car_model?: string | null
          car_number?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          partner_id?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      help_requests: {
        Row: {
          created_at: string
          id: string
          latitude: number
          longitude: number
          message: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          message: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          message?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      help_responses: {
        Row: {
          created_at: string
          help_request_id: string
          id: string
          responder_id: string
        }
        Insert: {
          created_at?: string
          help_request_id: string
          id?: string
          responder_id: string
        }
        Update: {
          created_at?: string
          help_request_id?: string
          id?: string
          responder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_responses_help_request_id_fkey"
            columns: ["help_request_id"]
            isOneToOne: false
            referencedRelation: "help_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      masters: {
        Row: {
          avatar_url: string | null
          created_at: string
          experience_years: number | null
          full_name: string
          id: string
          is_active: boolean | null
          partner_id: string
          phone_number: string | null
          specialization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          experience_years?: number | null
          full_name: string
          id?: string
          is_active?: boolean | null
          partner_id: string
          phone_number?: string | null
          specialization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          partner_id?: string
          phone_number?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "masters_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "service_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_services: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          quantity: number
          service_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          quantity?: number
          service_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          quantity?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_services_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_id: string
          closed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          opened_at: string | null
          partner_id: string
          status: string
          total_price: number
          updated_at: string | null
        }
        Insert: {
          client_id: string
          closed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          partner_id: string
          status?: string
          total_price?: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          closed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          partner_id?: string
          status?: string
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          phone_number: string
          verified: boolean
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          phone_number: string
          verified?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone_number?: string
          verified?: boolean
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          business_description: string | null
          business_name: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          notes: string | null
          partner_password: string | null
          phone_number: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          business_description?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          full_name: string
          id?: string
          notes?: string | null
          partner_password?: string | null
          phone_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          business_description?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          notes?: string | null
          partner_password?: string | null
          phone_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          car_brand: string | null
          car_color: string | null
          car_model: string | null
          car_year: number | null
          city: string | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          license_plate: string | null
          onboarding_completed: boolean | null
          patronymic: string | null
          phone_number: string
          preferred_language: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          car_brand?: string | null
          car_color?: string | null
          car_model?: string | null
          car_year?: number | null
          city?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          license_plate?: string | null
          onboarding_completed?: boolean | null
          patronymic?: string | null
          phone_number: string
          preferred_language?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          car_brand?: string | null
          car_color?: string | null
          car_model?: string | null
          car_year?: number | null
          city?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          license_plate?: string | null
          onboarding_completed?: boolean | null
          patronymic?: string | null
          phone_number?: string
          preferred_language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          attempt_count: number
          blocked_until: string | null
          created_at: string
          first_attempt_at: string
          id: string
          identifier: string
          last_attempt_at: string
          request_type: string
        }
        Insert: {
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string
          first_attempt_at?: string
          id?: string
          identifier: string
          last_attempt_at?: string
          request_type: string
        }
        Update: {
          attempt_count?: number
          blocked_until?: string | null
          created_at?: string
          first_attempt_at?: string
          id?: string
          identifier?: string
          last_attempt_at?: string
          request_type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          order_id: string | null
          partner_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          partner_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          partner_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "service_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      service_history: {
        Row: {
          cost: number | null
          created_at: string
          description: string | null
          id: string
          mileage_at_service: number | null
          next_service_date: string | null
          notes: string | null
          service_date: string
          service_provider: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          mileage_at_service?: number | null
          next_service_date?: string | null
          notes?: string | null
          service_date: string
          service_provider?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          mileage_at_service?: number | null
          next_service_date?: string | null
          notes?: string | null
          service_date?: string
          service_provider?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "user_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_partners: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          name: string
          owner_id: string
          partner_pin: string | null
          phone_number: string | null
          rating: number | null
          updated_at: string
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          owner_id: string
          partner_pin?: string | null
          phone_number?: string | null
          rating?: number | null
          updated_at?: string
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          partner_pin?: string | null
          phone_number?: string | null
          rating?: number | null
          updated_at?: string
          working_hours?: Json | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string
          estimated_cost: number | null
          final_cost: number | null
          id: string
          notes: string | null
          partner_id: string
          preferred_date: string | null
          preferred_time: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["service_request_status"]
          updated_at: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description: string
          estimated_cost?: number | null
          final_cost?: number | null
          id?: string
          notes?: string | null
          partner_id: string
          preferred_date?: string | null
          preferred_time?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["service_request_status"]
          updated_at?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string
          estimated_cost?: number | null
          final_cost?: number | null
          id?: string
          notes?: string | null
          partner_id?: string
          preferred_date?: string | null
          preferred_time?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["service_request_status"]
          updated_at?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "service_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "user_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_works: {
        Row: {
          completed_at: string | null
          cost: number
          created_at: string
          description: string | null
          id: string
          master_id: string | null
          parts_used: Json | null
          request_id: string
          started_at: string | null
          updated_at: string
          work_name: string
        }
        Insert: {
          completed_at?: string | null
          cost: number
          created_at?: string
          description?: string | null
          id?: string
          master_id?: string | null
          parts_used?: Json | null
          request_id: string
          started_at?: string | null
          updated_at?: string
          work_name: string
        }
        Update: {
          completed_at?: string | null
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          master_id?: string | null
          parts_used?: Json | null
          request_id?: string
          started_at?: string | null
          updated_at?: string
          work_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_works_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_works_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          partner_id: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          partner_id: string
          price: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          partner_id?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      shifts: {
        Row: {
          card_amount: number | null
          cash_amount: number | null
          closed_at: string | null
          closing_balance: number | null
          created_at: string | null
          id: string
          notes: string | null
          opened_at: string
          opening_balance: number | null
          partner_id: string
          updated_at: string | null
        }
        Insert: {
          card_amount?: number | null
          cash_amount?: number | null
          closed_at?: string | null
          closing_balance?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          opened_at: string
          opening_balance?: number | null
          partner_id: string
          updated_at?: string | null
        }
        Update: {
          card_amount?: number | null
          cash_amount?: number | null
          closed_at?: string | null
          closing_balance?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_balance?: number | null
          partner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_vehicles: {
        Row: {
          average_consumption: number | null
          brand_id: string
          color: string | null
          created_at: string
          id: string
          insurance_expiry_date: string | null
          is_primary: boolean | null
          license_plate: string | null
          mileage: number
          model: string
          next_service_date: string | null
          oil_change_date: string | null
          technical_condition: number | null
          updated_at: string
          user_id: string
          vin: string | null
          year: number
        }
        Insert: {
          average_consumption?: number | null
          brand_id: string
          color?: string | null
          created_at?: string
          id?: string
          insurance_expiry_date?: string | null
          is_primary?: boolean | null
          license_plate?: string | null
          mileage?: number
          model: string
          next_service_date?: string | null
          oil_change_date?: string | null
          technical_condition?: number | null
          updated_at?: string
          user_id: string
          vin?: string | null
          year: number
        }
        Update: {
          average_consumption?: number | null
          brand_id?: string
          color?: string | null
          created_at?: string
          id?: string
          insurance_expiry_date?: string | null
          is_primary?: boolean | null
          license_plate?: string | null
          mileage?: number
          model?: string
          next_service_date?: string | null
          oil_change_date?: string | null
          technical_condition?: number | null
          updated_at?: string
          user_id?: string
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_vehicles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_vehicles_user_id_fkey"
            columns: ["user_id"]
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
      cleanup_rate_limits: { Args: never; Returns: undefined }
      create_partner_account: {
        Args: {
          admin_id: string
          application_id: string
          temp_password: string
        }
        Returns: Json
      }
      delete_expired_otp_codes: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "partner" | "master" | "admin"
      service_request_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "rejected"
      service_type:
        | "maintenance"
        | "repair"
        | "inspection"
        | "tire_change"
        | "oil_change"
        | "other"
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
      app_role: ["user", "partner", "master", "admin"],
      service_request_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "rejected",
      ],
      service_type: [
        "maintenance",
        "repair",
        "inspection",
        "tire_change",
        "oil_change",
        "other",
      ],
    },
  },
} as const
