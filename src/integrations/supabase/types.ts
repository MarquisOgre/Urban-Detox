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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          created_at: string | null
          customer_id: string
          delivery_date: string
          id: string
          juice_type: string
          notes: string | null
          quantity: number
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          delivery_date?: string
          id?: string
          juice_type: string
          notes?: string | null
          quantity?: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          delivery_date?: string
          id?: string
          juice_type?: string
          notes?: string | null
          quantity?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "delivery_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_customers: {
        Row: {
          created_at: string | null
          delivery_frequency: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          preferred_juice: string
          start_date: string | null
          subscription_plan: string
          updated_at: string | null
          villa_number: string
        }
        Insert: {
          created_at?: string | null
          delivery_frequency?: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          preferred_juice?: string
          start_date?: string | null
          subscription_plan?: string
          updated_at?: string | null
          villa_number: string
        }
        Update: {
          created_at?: string | null
          delivery_frequency?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_juice?: string
          start_date?: string | null
          subscription_plan?: string
          updated_at?: string | null
          villa_number?: string
        }
        Relationships: []
      }
      delivery_payments: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string
          id: string
          month: string
          paid_date: string | null
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          customer_id: string
          id?: string
          month: string
          paid_date?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string
          id?: string
          month?: string
          paid_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "delivery_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_schedules: {
        Row: {
          customer_id: string
          day_of_week: number
          id: string
          juice_type: string
        }
        Insert: {
          customer_id: string
          day_of_week: number
          id?: string
          juice_type: string
        }
        Update: {
          customer_id?: string
          day_of_week?: number
          id?: string
          juice_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "delivery_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          quantity: number
        }
        Insert: {
          id?: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          created_at: string
          id: string
          payment_method: string
          status: string
          total: number
          transaction_id: string | null
          updated_at: string
          user_email: string | null
          user_name: string
          user_phone: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          payment_method?: string
          status?: string
          total: number
          transaction_id?: string | null
          updated_at?: string
          user_email?: string | null
          user_name: string
          user_phone: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          payment_method?: string
          status?: string
          total?: number
          transaction_id?: string | null
          updated_at?: string
          user_email?: string | null
          user_name?: string
          user_phone?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          health_benefits: string | null
          id: string
          image_url: string | null
          images: Json
          ingredients: string | null
          is_active: boolean
          name: string
          plan_options: Json
          price: number
          slug: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          health_benefits?: string | null
          id?: string
          image_url?: string | null
          images?: Json
          ingredients?: string | null
          is_active?: boolean
          name: string
          plan_options?: Json
          price: number
          slug?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          health_benefits?: string | null
          id?: string
          image_url?: string | null
          images?: Json
          ingredients?: string | null
          is_active?: boolean
          name?: string
          plan_options?: Json
          price?: number
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
