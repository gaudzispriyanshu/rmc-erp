export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: number
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: number
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: number
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          base_salary: number | null
          created_at: string | null
          id: number
          license_number: string | null
          name: string
          per_trip_rate: number | null
          phone: string | null
          status: string | null
        }
        Insert: {
          base_salary?: number | null
          created_at?: string | null
          id?: number
          license_number?: string | null
          name: string
          per_trip_rate?: number | null
          phone?: string | null
          status?: string | null
        }
        Update: {
          base_salary?: number | null
          created_at?: string | null
          id?: number
          license_number?: string | null
          name?: string
          per_trip_rate?: number | null
          phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          current_stock: number | null
          id: number
          min_stock_level: number | null
          name: string
          unit: string | null
        }
        Insert: {
          current_stock?: number | null
          id?: number
          min_stock_level?: number | null
          name: string
          unit?: string | null
        }
        Update: {
          current_stock?: number | null
          id?: number
          min_stock_level?: number | null
          name?: string
          unit?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number | null
          created_at: string | null
          id: number
          order_id: number | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: number
          order_id?: number | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: number
          order_id?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      mix_designs: {
        Row: {
          description: string | null
          grade_name: string
          id: number
        }
        Insert: {
          description?: string | null
          grade_name: string
          id?: number
        }
        Update: {
          description?: string | null
          grade_name?: string
          id?: number
        }
        Relationships: []
      }
      mix_requirements: {
        Row: {
          id: number
          inventory_item_id: number | null
          mix_id: number | null
          quantity_per_m3: number
        }
        Insert: {
          id?: number
          inventory_item_id?: number | null
          mix_id?: number | null
          quantity_per_m3: number
        }
        Update: {
          id?: number
          inventory_item_id?: number | null
          mix_id?: number | null
          quantity_per_m3?: number
        }
        Relationships: [
          {
            foreignKeyName: "mix_requirements_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mix_requirements_mix_id_fkey"
            columns: ["mix_id"]
            isOneToOne: false
            referencedRelation: "mix_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          concrete_grade: string | null
          customer_id: number | null
          delivery_address: string | null
          id: number
          mix_design_id: number | null
          order_date: string | null
          quantity: number | null
          status: string | null
        }
        Insert: {
          concrete_grade?: string | null
          customer_id?: number | null
          delivery_address?: string | null
          id?: number
          mix_design_id?: number | null
          order_date?: string | null
          quantity?: number | null
          status?: string | null
        }
        Update: {
          concrete_grade?: string | null
          customer_id?: number | null
          delivery_address?: string | null
          id?: number
          mix_design_id?: number | null
          order_date?: string | null
          quantity?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_mix_design_id_fkey"
            columns: ["mix_design_id"]
            isOneToOne: false
            referencedRelation: "mix_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_updates: {
        Row: {
          created_at: string | null
          id: number
          location: Json | null
          note: string | null
          status: string | null
          trip_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          location?: Json | null
          note?: string | null
          status?: string | null
          trip_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          location?: Json | null
          note?: string | null
          status?: string | null
          trip_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_updates_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          assigned_by: number | null
          completed_at: string | null
          created_at: string | null
          driver_id: number | null
          eta: string | null
          fuel_cost_estimate: number | null
          id: number
          order_id: number | null
          started_at: string | null
          status: string | null
          vehicle_id: number | null
          volume_delivered: number | null
        }
        Insert: {
          assigned_by?: number | null
          completed_at?: string | null
          created_at?: string | null
          driver_id?: number | null
          eta?: string | null
          fuel_cost_estimate?: number | null
          id?: number
          order_id?: number | null
          started_at?: string | null
          status?: string | null
          vehicle_id?: number | null
          volume_delivered?: number | null
        }
        Update: {
          assigned_by?: number | null
          completed_at?: string | null
          created_at?: string | null
          driver_id?: number | null
          eta?: string | null
          fuel_cost_estimate?: number | null
          id?: number
          order_id?: number | null
          started_at?: string | null
          status?: string | null
          vehicle_id?: number | null
          volume_delivered?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: number
          name: string
          password: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          name: string
          password: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          name?: string
          password?: string
          role?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          capacity: number | null
          created_at: string | null
          id: number
          model: string | null
          plate_number: string
          status: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          id?: number
          model?: string | null
          plate_number: string
          status?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          id?: number
          model?: string | null
          plate_number?: string
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

