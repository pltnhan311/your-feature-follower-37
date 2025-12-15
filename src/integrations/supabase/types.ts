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
      employee_history: {
        Row: {
          created_at: string
          description: string
          id: string
          new_value: string | null
          performed_by: string | null
          performed_by_name: string | null
          previous_value: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          new_value?: string | null
          performed_by?: string | null
          performed_by_name?: string | null
          previous_value?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          new_value?: string | null
          performed_by?: string | null
          performed_by_name?: string | null
          previous_value?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          annual_total: number
          annual_used: number
          created_at: string
          id: string
          sick_total: number
          sick_used: number
          unpaid_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_total?: number
          annual_used?: number
          created_at?: string
          id?: string
          sick_total?: number
          sick_used?: number
          unpaid_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_total?: number
          annual_used?: number
          created_at?: string
          id?: string
          sick_total?: number
          sick_used?: number
          unpaid_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          created_at: string
          days_count: number
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          reject_reason: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          days_count: number
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          reject_reason?: string | null
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          days_count?: number
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          reject_reason?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
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
      overtime_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          created_at: string
          date: string
          end_time: string
          hours_count: number
          id: string
          reason: string | null
          reject_reason: string | null
          start_time: string
          status: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          date: string
          end_time: string
          hours_count: number
          id?: string
          reason?: string | null
          reject_reason?: string | null
          start_time: string
          status?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          date?: string
          end_time?: string
          hours_count?: number
          id?: string
          reason?: string | null
          reject_reason?: string | null
          start_time?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "overtime_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_config: {
        Row: {
          dependent_deduction: number
          health_insurance_rate: number
          id: string
          ot_multiplier: number
          personal_deduction: number
          social_insurance_rate: number
          unemployment_insurance_rate: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          dependent_deduction?: number
          health_insurance_rate?: number
          id?: string
          ot_multiplier?: number
          personal_deduction?: number
          social_insurance_rate?: number
          unemployment_insurance_rate?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          dependent_deduction?: number
          health_insurance_rate?: number
          id?: string
          ot_multiplier?: number
          personal_deduction?: number
          social_insurance_rate?: number
          unemployment_insurance_rate?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          completed_at: string | null
          id: string
          period: string
          period_label: string
          run_at: string | null
          run_by: string | null
          status: string
          total_employees: number
          total_gross_salary: number
          total_net_salary: number
        }
        Insert: {
          completed_at?: string | null
          id?: string
          period: string
          period_label: string
          run_at?: string | null
          run_by?: string | null
          status?: string
          total_employees?: number
          total_gross_salary?: number
          total_net_salary?: number
        }
        Update: {
          completed_at?: string | null
          id?: string
          period?: string
          period_label?: string
          run_at?: string | null
          run_by?: string | null
          status?: string
          total_employees?: number
          total_gross_salary?: number
          total_net_salary?: number
        }
        Relationships: []
      }
      payslips: {
        Row: {
          allowances: number
          base_salary: number
          bonus: number
          created_at: string
          deductions: number
          health_insurance: number
          id: string
          net_salary: number
          overtime: number
          paid_date: string | null
          period: string
          period_label: string
          social_insurance: number
          status: string
          tax: number
          user_id: string
        }
        Insert: {
          allowances?: number
          base_salary: number
          bonus?: number
          created_at?: string
          deductions?: number
          health_insurance?: number
          id?: string
          net_salary: number
          overtime?: number
          paid_date?: string | null
          period: string
          period_label: string
          social_insurance?: number
          status?: string
          tax?: number
          user_id: string
        }
        Update: {
          allowances?: number
          base_salary?: number
          bonus?: number
          created_at?: string
          deductions?: number
          health_insurance?: number
          id?: string
          net_salary?: number
          overtime?: number
          paid_date?: string | null
          period?: string
          period_label?: string
          social_insurance?: number
          status?: string
          tax?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payslips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          base_salary: number
          contract_type: string | null
          created_at: string
          department: string
          email: string
          employee_id: string
          full_name: string
          id: string
          id_number: string | null
          location: string | null
          manager_id: string | null
          phone: string | null
          position: string
          role: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          base_salary?: number
          contract_type?: string | null
          created_at?: string
          department: string
          email: string
          employee_id: string
          full_name: string
          id: string
          id_number?: string | null
          location?: string | null
          manager_id?: string | null
          phone?: string | null
          position: string
          role?: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          base_salary?: number
          contract_type?: string | null
          created_at?: string
          department?: string
          email?: string
          employee_id?: string
          full_name?: string
          id?: string
          id_number?: string | null
          location?: string | null
          manager_id?: string | null
          phone?: string | null
          position?: string
          role?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
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
      get_user_role: { Args: { user_id: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_manager_or_admin: { Args: never; Returns: boolean }
      is_team_member: { Args: { target_user_id: string }; Returns: boolean }
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
  public: {
    Enums: {},
  },
} as const
