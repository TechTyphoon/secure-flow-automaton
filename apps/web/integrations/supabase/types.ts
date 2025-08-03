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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      pipeline_metrics: {
        Row: {
          branch: string | null
          build_number: number | null
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          metrics: Json | null
          pipeline_id: string
          project_name: string
          security_gate_passed: boolean | null
          started_at: string | null
          status: string
          triggered_by: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          branch?: string | null
          build_number?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          metrics?: Json | null
          pipeline_id: string
          project_name: string
          security_gate_passed?: boolean | null
          started_at?: string | null
          status: string
          triggered_by?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          branch?: string | null
          build_number?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          metrics?: Json | null
          pipeline_id?: string
          project_name?: string
          security_gate_passed?: boolean | null
          started_at?: string | null
          status?: string
          triggered_by?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pipeline_runs: {
        Row: {
          branch_name: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          run_id: number
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          branch_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          run_id: number
          started_at?: string | null
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          branch_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          run_id?: number
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_scans: {
        Row: {
          branch: string | null
          completed_at: string | null
          created_at: string | null
          critical_count: number | null
          high_count: number | null
          id: string
          low_count: number | null
          medium_count: number | null
          project_name: string
          scan_results: Json | null
          scan_type: string
          started_at: string | null
          status: string | null
          total_vulnerabilities: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          branch?: string | null
          completed_at?: string | null
          created_at?: string | null
          critical_count?: number | null
          high_count?: number | null
          id?: string
          low_count?: number | null
          medium_count?: number | null
          project_name: string
          scan_results?: Json | null
          scan_type: string
          started_at?: string | null
          status?: string | null
          total_vulnerabilities?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          branch?: string | null
          completed_at?: string | null
          created_at?: string | null
          critical_count?: number | null
          high_count?: number | null
          id?: string
          low_count?: number | null
          medium_count?: number | null
          project_name?: string
          scan_results?: Json | null
          scan_type?: string
          started_at?: string | null
          status?: string | null
          total_vulnerabilities?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vulnerabilities: {
        Row: {
          affected_versions: string | null
          auto_fixable: boolean | null
          column_number: number | null
          component: string | null
          confidence_score: number | null
          created_at: string | null
          cve_id: string | null
          cwe_id: string | null
          description: string | null
          file_path: string | null
          first_detected: string | null
          fixed_at: string | null
          id: string
          line_number: number | null
          package_name: string | null
          rule_id: string | null
          scan_id: string | null
          scanned_at: string | null
          severity: string
          status: string | null
          title: string
          tool: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          affected_versions?: string | null
          auto_fixable?: boolean | null
          column_number?: number | null
          component?: string | null
          confidence_score?: number | null
          created_at?: string | null
          cve_id?: string | null
          cwe_id?: string | null
          description?: string | null
          file_path?: string | null
          first_detected?: string | null
          fixed_at?: string | null
          id?: string
          line_number?: number | null
          package_name?: string | null
          rule_id?: string | null
          scan_id?: string | null
          scanned_at?: string | null
          severity: string
          status?: string | null
          title: string
          tool?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          affected_versions?: string | null
          auto_fixable?: boolean | null
          column_number?: number | null
          component?: string | null
          confidence_score?: number | null
          created_at?: string | null
          cve_id?: string | null
          cwe_id?: string | null
          description?: string | null
          file_path?: string | null
          first_detected?: string | null
          fixed_at?: string | null
          id?: string
          line_number?: number | null
          package_name?: string | null
          rule_id?: string | null
          scan_id?: string | null
          scanned_at?: string | null
          severity?: string
          status?: string | null
          title?: string
          tool?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vulnerabilities_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "security_scans"
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

