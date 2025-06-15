export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          capacity: number | null
          category_id: string | null
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          location: Json | null
          organizer_id: string
          start_date: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          location?: Json | null
          organizer_id: string
          start_date: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          location?: Json | null
          organizer_id?: string
          start_date?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pipeline_metrics: {
        Row: {
          branch: string
          build_number: number | null
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          metrics: Json | null
          pipeline_id: string
          project_name: string
          security_gate_passed: boolean | null
          started_at: string
          status: string
          triggered_by: string | null
          updated_at: string
        }
        Insert: {
          branch?: string
          build_number?: number | null
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metrics?: Json | null
          pipeline_id: string
          project_name: string
          security_gate_passed?: boolean | null
          started_at?: string
          status: string
          triggered_by?: string | null
          updated_at?: string
        }
        Update: {
          branch?: string
          build_number?: number | null
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metrics?: Json | null
          pipeline_id?: string
          project_name?: string
          security_gate_passed?: boolean | null
          started_at?: string
          status?: string
          triggered_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      remediation_activities: {
        Row: {
          action_type: string
          completed_at: string | null
          created_at: string
          fix_description: string | null
          id: string
          pr_url: string | null
          started_at: string
          status: string
          updated_at: string
          vulnerability_id: string | null
        }
        Insert: {
          action_type: string
          completed_at?: string | null
          created_at?: string
          fix_description?: string | null
          id?: string
          pr_url?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          vulnerability_id?: string | null
        }
        Update: {
          action_type?: string
          completed_at?: string | null
          created_at?: string
          fix_description?: string | null
          id?: string
          pr_url?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          vulnerability_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remediation_activities_vulnerability_id_fkey"
            columns: ["vulnerability_id"]
            isOneToOne: false
            referencedRelation: "vulnerabilities"
            referencedColumns: ["id"]
          },
        ]
      }
      security_scans: {
        Row: {
          branch: string
          commit_hash: string | null
          completed_at: string | null
          created_at: string
          critical_count: number | null
          high_count: number | null
          id: string
          low_count: number | null
          medium_count: number | null
          project_name: string
          scan_results: Json | null
          scan_type: string
          started_at: string
          status: string
          total_vulnerabilities: number | null
          updated_at: string
        }
        Insert: {
          branch?: string
          commit_hash?: string | null
          completed_at?: string | null
          created_at?: string
          critical_count?: number | null
          high_count?: number | null
          id?: string
          low_count?: number | null
          medium_count?: number | null
          project_name: string
          scan_results?: Json | null
          scan_type: string
          started_at?: string
          status?: string
          total_vulnerabilities?: number | null
          updated_at?: string
        }
        Update: {
          branch?: string
          commit_hash?: string | null
          completed_at?: string | null
          created_at?: string
          critical_count?: number | null
          high_count?: number | null
          id?: string
          low_count?: number | null
          medium_count?: number | null
          project_name?: string
          scan_results?: Json | null
          scan_type?: string
          started_at?: string
          status?: string
          total_vulnerabilities?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          event_id: string
          event_title: string | null
          id: string
          pdf_url: string | null
          price: number
          purchased_at: string
          qr_code: string | null
          quantity: number
          ticket_code: string
          user_id: string
        }
        Insert: {
          event_id: string
          event_title?: string | null
          id?: string
          pdf_url?: string | null
          price: number
          purchased_at?: string
          qr_code?: string | null
          quantity?: number
          ticket_code: string
          user_id: string
        }
        Update: {
          event_id?: string
          event_title?: string | null
          id?: string
          pdf_url?: string | null
          price?: number
          purchased_at?: string
          qr_code?: string | null
          quantity?: number
          ticket_code?: string
          user_id?: string
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
      vulnerabilities: {
        Row: {
          auto_fixable: boolean | null
          component: string | null
          confidence_score: number | null
          created_at: string
          cve_id: string | null
          description: string | null
          file_path: string | null
          first_detected: string
          fixed_at: string | null
          id: string
          last_seen: string
          line_number: number | null
          remediation_advice: string | null
          scan_id: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          auto_fixable?: boolean | null
          component?: string | null
          confidence_score?: number | null
          created_at?: string
          cve_id?: string | null
          description?: string | null
          file_path?: string | null
          first_detected?: string
          fixed_at?: string | null
          id?: string
          last_seen?: string
          line_number?: number | null
          remediation_advice?: string | null
          scan_id?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          auto_fixable?: boolean | null
          component?: string | null
          confidence_score?: number | null
          created_at?: string
          cve_id?: string | null
          description?: string | null
          file_path?: string | null
          first_detected?: string
          fixed_at?: string | null
          id?: string
          last_seen?: string
          line_number?: number | null
          remediation_advice?: string | null
          scan_id?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
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
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
