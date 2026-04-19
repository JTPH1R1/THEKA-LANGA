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
    PostgrestVersion: "14.5"
  }
  audit: {
    Tables: {
      credit_score_history: {
        Row: {
          calculated_at: string
          delta: number | null
          event_type: string
          id: string
          profile_id: string
          reference_id: string | null
          score_after: number
          score_before: number
        }
        Insert: {
          calculated_at?: string
          delta?: number | null
          event_type: string
          id?: string
          profile_id: string
          reference_id?: string | null
          score_after: number
          score_before: number
        }
        Update: {
          calculated_at?: string
          delta?: number | null
          event_type?: string
          id?: string
          profile_id?: string
          reference_id?: string | null
          score_after?: number
          score_before?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          diff: Json | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string
          request_id: string | null
          schema_name: string
          session_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          diff?: Json | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          request_id?: string | null
          schema_name: string
          session_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          diff?: Json | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          request_id?: string | null
          schema_name?: string
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      events_2025: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          diff: Json | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string
          request_id: string | null
          schema_name: string
          session_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          diff?: Json | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          request_id?: string | null
          schema_name: string
          session_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          diff?: Json | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          request_id?: string | null
          schema_name?: string
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      events_2026: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          diff: Json | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string
          request_id: string | null
          schema_name: string
          session_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          diff?: Json | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          request_id?: string | null
          schema_name: string
          session_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          diff?: Json | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          request_id?: string | null
          schema_name?: string
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      events_2027: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          diff: Json | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string
          request_id: string | null
          schema_name: string
          session_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          diff?: Json | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          request_id?: string | null
          schema_name: string
          session_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          diff?: Json | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          request_id?: string | null
          schema_name?: string
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      events_2028: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          diff: Json | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string
          request_id: string | null
          schema_name: string
          session_id: string | null
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          diff?: Json | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          request_id?: string | null
          schema_name: string
          session_id?: string | null
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          diff?: Json | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          request_id?: string | null
          schema_name?: string
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
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
  core: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          blacklisted_at: string | null
          blacklisted_reason: string | null
          created_at: string
          credit_score: number
          credit_score_band: string | null
          email: string
          full_legal_name: string
          id: string
          is_active: boolean
          is_blacklisted: boolean
          kyc_level: number
          last_seen_at: string | null
          locale: string
          phone: string | null
          phone_verified: boolean
          preferred_name: string | null
          system_role: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          blacklisted_at?: string | null
          blacklisted_reason?: string | null
          created_at?: string
          credit_score?: number
          credit_score_band?: string | null
          email: string
          full_legal_name: string
          id: string
          is_active?: boolean
          is_blacklisted?: boolean
          kyc_level?: number
          last_seen_at?: string | null
          locale?: string
          phone?: string | null
          phone_verified?: boolean
          preferred_name?: string | null
          system_role?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          blacklisted_at?: string | null
          blacklisted_reason?: string | null
          created_at?: string
          credit_score?: number
          credit_score_band?: string | null
          email?: string
          full_legal_name?: string
          id?: string
          is_active?: boolean
          is_blacklisted?: boolean
          kyc_level?: number
          last_seen_at?: string | null
          locale?: string
          phone?: string | null
          phone_verified?: boolean
          preferred_name?: string | null
          system_role?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_config_updated_by_fkey"
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
      has_system_role: { Args: { role: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  finance: {
    Tables: {
      contribution_fines: {
        Row: {
          amount: number
          applied_at: string
          applied_by: string | null
          contribution_id: string
          created_at: string
          days_late: number | null
          fine_type: string
          group_id: string
          id: string
          member_id: string
          waived: boolean
          waived_at: string | null
          waived_by: string | null
          waiver_reason: string | null
        }
        Insert: {
          amount: number
          applied_at?: string
          applied_by?: string | null
          contribution_id: string
          created_at?: string
          days_late?: number | null
          fine_type: string
          group_id: string
          id?: string
          member_id: string
          waived?: boolean
          waived_at?: string | null
          waived_by?: string | null
          waiver_reason?: string | null
        }
        Update: {
          amount?: number
          applied_at?: string
          applied_by?: string | null
          contribution_id?: string
          created_at?: string
          days_late?: number | null
          fine_type?: string
          group_id?: string
          id?: string
          member_id?: string
          waived?: boolean
          waived_at?: string | null
          waived_by?: string | null
          waiver_reason?: string | null
        }
        Relationships: []
      }
      contributions: {
        Row: {
          created_at: string
          cycle_period: string
          due_date: string
          expected_amount: number
          fine_amount: number
          group_id: string
          id: string
          member_id: string
          notes: string | null
          paid_amount: number
          paid_at: string | null
          payment_channel: string | null
          payment_ref: string | null
          recorded_by: string | null
          reversal_of: string | null
          reversal_reason: string | null
          status: string
          total_paid: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_period: string
          due_date: string
          expected_amount: number
          fine_amount?: number
          group_id: string
          id?: string
          member_id: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_channel?: string | null
          payment_ref?: string | null
          recorded_by?: string | null
          reversal_of?: string | null
          reversal_reason?: string | null
          status?: string
          total_paid?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_period?: string
          due_date?: string
          expected_amount?: number
          fine_amount?: number
          group_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_channel?: string | null
          payment_ref?: string | null
          recorded_by?: string | null
          reversal_of?: string | null
          reversal_reason?: string | null
          status?: string
          total_paid?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      contributions_2025: {
        Row: {
          created_at: string
          cycle_period: string
          due_date: string
          expected_amount: number
          fine_amount: number
          group_id: string
          id: string
          member_id: string
          notes: string | null
          paid_amount: number
          paid_at: string | null
          payment_channel: string | null
          payment_ref: string | null
          recorded_by: string | null
          reversal_of: string | null
          reversal_reason: string | null
          status: string
          total_paid: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_period: string
          due_date: string
          expected_amount: number
          fine_amount?: number
          group_id: string
          id?: string
          member_id: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_channel?: string | null
          payment_ref?: string | null
          recorded_by?: string | null
          reversal_of?: string | null
          reversal_reason?: string | null
          status?: string
          total_paid?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_period?: string
          due_date?: string
          expected_amount?: number
          fine_amount?: number
          group_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_channel?: string | null
          payment_ref?: string | null
          recorded_by?: string | null
          reversal_of?: string | null
          reversal_reason?: string | null
          status?: string
          total_paid?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      contributions_2026: {
        Row: {
          created_at: string
          cycle_period: string
          due_date: string
          expected_amount: number
          fine_amount: number
          group_id: string
          id: string
          member_id: string
          notes: string | null
          paid_amount: number
          paid_at: string | null
          payment_channel: string | null
          payment_ref: string | null
          recorded_by: string | null
          reversal_of: string | null
          reversal_reason: string | null
          status: string
          total_paid: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_period: string
          due_date: string
          expected_amount: number
          fine_amount?: number
          group_id: string
          id?: string
          member_id: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_channel?: string | null
          payment_ref?: string | null
          recorded_by?: string | null
          reversal_of?: string | null
          reversal_reason?: string | null
          status?: string
          total_paid?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_period?: string
          due_date?: string
          expected_amount?: number
          fine_amount?: number
          group_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_channel?: string | null
          payment_ref?: string | null
          recorded_by?: string | null
          reversal_of?: string | null
          reversal_reason?: string | null
          status?: string
          total_paid?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      contributions_2027: {
        Row: {
          created_at: string
          cycle_period: string
          due_date: string
          expected_amount: number
          fine_amount: number
          group_id: string
          id: string
          member_id: string
          notes: string | null
          paid_amount: number
          paid_at: string | null
          payment_channel: string | null
          payment_ref: string | null
          recorded_by: string | null
          reversal_of: string | null
          reversal_reason: string | null
          status: string
          total_paid: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_period: string
          due_date: string
          expected_amount: number
          fine_amount?: number
          group_id: string
          id?: string
          member_id: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_channel?: string | null
          payment_ref?: string | null
          recorded_by?: string | null
          reversal_of?: string | null
          reversal_reason?: string | null
          status?: string
          total_paid?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_period?: string
          due_date?: string
          expected_amount?: number
          fine_amount?: number
          group_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_channel?: string | null
          payment_ref?: string | null
          recorded_by?: string | null
          reversal_of?: string | null
          reversal_reason?: string | null
          status?: string
          total_paid?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      contributions_2028: {
        Row: {
          created_at: string
          cycle_period: string
          due_date: string
          expected_amount: number
          fine_amount: number
          group_id: string
          id: string
          member_id: string
          notes: string | null
          paid_amount: number
          paid_at: string | null
          payment_channel: string | null
          payment_ref: string | null
          recorded_by: string | null
          reversal_of: string | null
          reversal_reason: string | null
          status: string
          total_paid: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_period: string
          due_date: string
          expected_amount: number
          fine_amount?: number
          group_id: string
          id?: string
          member_id: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_channel?: string | null
          payment_ref?: string | null
          recorded_by?: string | null
          reversal_of?: string | null
          reversal_reason?: string | null
          status?: string
          total_paid?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_period?: string
          due_date?: string
          expected_amount?: number
          fine_amount?: number
          group_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_channel?: string | null
          payment_ref?: string | null
          recorded_by?: string | null
          reversal_of?: string | null
          reversal_reason?: string | null
          status?: string
          total_paid?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      loan_guarantors: {
        Row: {
          created_at: string
          credit_score_at_guarantee: number | null
          guarantor_id: string
          id: string
          loan_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          credit_score_at_guarantee?: number | null
          guarantor_id: string
          id?: string
          loan_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          credit_score_at_guarantee?: number | null
          guarantor_id?: string
          id?: string
          loan_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: []
      }
      loan_repayments: {
        Row: {
          amount_paid: number
          borrower_id: string
          created_at: string
          group_id: string
          id: string
          interest_component: number
          is_reversal: boolean
          loan_id: string
          notes: string | null
          paid_at: string
          payment_channel: string | null
          payment_ref: string | null
          penalty_component: number
          principal_component: number
          recorded_by: string
          reversal_of: string | null
          reversal_reason: string | null
          schedule_period: number | null
        }
        Insert: {
          amount_paid: number
          borrower_id: string
          created_at?: string
          group_id: string
          id?: string
          interest_component?: number
          is_reversal?: boolean
          loan_id: string
          notes?: string | null
          paid_at?: string
          payment_channel?: string | null
          payment_ref?: string | null
          penalty_component?: number
          principal_component?: number
          recorded_by: string
          reversal_of?: string | null
          reversal_reason?: string | null
          schedule_period?: number | null
        }
        Update: {
          amount_paid?: number
          borrower_id?: string
          created_at?: string
          group_id?: string
          id?: string
          interest_component?: number
          is_reversal?: boolean
          loan_id?: string
          notes?: string | null
          paid_at?: string
          payment_channel?: string | null
          payment_ref?: string | null
          penalty_component?: number
          principal_component?: number
          recorded_by?: string
          reversal_of?: string | null
          reversal_reason?: string | null
          schedule_period?: number | null
        }
        Relationships: []
      }
      loan_repayments_2025: {
        Row: {
          amount_paid: number
          borrower_id: string
          created_at: string
          group_id: string
          id: string
          interest_component: number
          is_reversal: boolean
          loan_id: string
          notes: string | null
          paid_at: string
          payment_channel: string | null
          payment_ref: string | null
          penalty_component: number
          principal_component: number
          recorded_by: string
          reversal_of: string | null
          reversal_reason: string | null
          schedule_period: number | null
        }
        Insert: {
          amount_paid: number
          borrower_id: string
          created_at?: string
          group_id: string
          id?: string
          interest_component?: number
          is_reversal?: boolean
          loan_id: string
          notes?: string | null
          paid_at?: string
          payment_channel?: string | null
          payment_ref?: string | null
          penalty_component?: number
          principal_component?: number
          recorded_by: string
          reversal_of?: string | null
          reversal_reason?: string | null
          schedule_period?: number | null
        }
        Update: {
          amount_paid?: number
          borrower_id?: string
          created_at?: string
          group_id?: string
          id?: string
          interest_component?: number
          is_reversal?: boolean
          loan_id?: string
          notes?: string | null
          paid_at?: string
          payment_channel?: string | null
          payment_ref?: string | null
          penalty_component?: number
          principal_component?: number
          recorded_by?: string
          reversal_of?: string | null
          reversal_reason?: string | null
          schedule_period?: number | null
        }
        Relationships: []
      }
      loan_repayments_2026: {
        Row: {
          amount_paid: number
          borrower_id: string
          created_at: string
          group_id: string
          id: string
          interest_component: number
          is_reversal: boolean
          loan_id: string
          notes: string | null
          paid_at: string
          payment_channel: string | null
          payment_ref: string | null
          penalty_component: number
          principal_component: number
          recorded_by: string
          reversal_of: string | null
          reversal_reason: string | null
          schedule_period: number | null
        }
        Insert: {
          amount_paid: number
          borrower_id: string
          created_at?: string
          group_id: string
          id?: string
          interest_component?: number
          is_reversal?: boolean
          loan_id: string
          notes?: string | null
          paid_at?: string
          payment_channel?: string | null
          payment_ref?: string | null
          penalty_component?: number
          principal_component?: number
          recorded_by: string
          reversal_of?: string | null
          reversal_reason?: string | null
          schedule_period?: number | null
        }
        Update: {
          amount_paid?: number
          borrower_id?: string
          created_at?: string
          group_id?: string
          id?: string
          interest_component?: number
          is_reversal?: boolean
          loan_id?: string
          notes?: string | null
          paid_at?: string
          payment_channel?: string | null
          payment_ref?: string | null
          penalty_component?: number
          principal_component?: number
          recorded_by?: string
          reversal_of?: string | null
          reversal_reason?: string | null
          schedule_period?: number | null
        }
        Relationships: []
      }
      loan_repayments_2027: {
        Row: {
          amount_paid: number
          borrower_id: string
          created_at: string
          group_id: string
          id: string
          interest_component: number
          is_reversal: boolean
          loan_id: string
          notes: string | null
          paid_at: string
          payment_channel: string | null
          payment_ref: string | null
          penalty_component: number
          principal_component: number
          recorded_by: string
          reversal_of: string | null
          reversal_reason: string | null
          schedule_period: number | null
        }
        Insert: {
          amount_paid: number
          borrower_id: string
          created_at?: string
          group_id: string
          id?: string
          interest_component?: number
          is_reversal?: boolean
          loan_id: string
          notes?: string | null
          paid_at?: string
          payment_channel?: string | null
          payment_ref?: string | null
          penalty_component?: number
          principal_component?: number
          recorded_by: string
          reversal_of?: string | null
          reversal_reason?: string | null
          schedule_period?: number | null
        }
        Update: {
          amount_paid?: number
          borrower_id?: string
          created_at?: string
          group_id?: string
          id?: string
          interest_component?: number
          is_reversal?: boolean
          loan_id?: string
          notes?: string | null
          paid_at?: string
          payment_channel?: string | null
          payment_ref?: string | null
          penalty_component?: number
          principal_component?: number
          recorded_by?: string
          reversal_of?: string | null
          reversal_reason?: string | null
          schedule_period?: number | null
        }
        Relationships: []
      }
      loan_repayments_2028: {
        Row: {
          amount_paid: number
          borrower_id: string
          created_at: string
          group_id: string
          id: string
          interest_component: number
          is_reversal: boolean
          loan_id: string
          notes: string | null
          paid_at: string
          payment_channel: string | null
          payment_ref: string | null
          penalty_component: number
          principal_component: number
          recorded_by: string
          reversal_of: string | null
          reversal_reason: string | null
          schedule_period: number | null
        }
        Insert: {
          amount_paid: number
          borrower_id: string
          created_at?: string
          group_id: string
          id?: string
          interest_component?: number
          is_reversal?: boolean
          loan_id: string
          notes?: string | null
          paid_at?: string
          payment_channel?: string | null
          payment_ref?: string | null
          penalty_component?: number
          principal_component?: number
          recorded_by: string
          reversal_of?: string | null
          reversal_reason?: string | null
          schedule_period?: number | null
        }
        Update: {
          amount_paid?: number
          borrower_id?: string
          created_at?: string
          group_id?: string
          id?: string
          interest_component?: number
          is_reversal?: boolean
          loan_id?: string
          notes?: string | null
          paid_at?: string
          payment_channel?: string | null
          payment_ref?: string | null
          penalty_component?: number
          principal_component?: number
          recorded_by?: string
          reversal_of?: string | null
          reversal_reason?: string | null
          schedule_period?: number | null
        }
        Relationships: []
      }
      loans: {
        Row: {
          amount_repaid: number
          applied_at: string
          approved_at: string | null
          approved_by: string | null
          borrower_id: string
          completed_at: string | null
          created_at: string
          credit_score_at_apply: number
          default_notice_sent: boolean
          default_notice_sent_at: string | null
          disbursed_at: string | null
          due_date: string | null
          first_missed_payment_at: string | null
          group_id: string
          id: string
          interest_rate: number
          interest_type: string
          notes: string | null
          outstanding: number | null
          principal: number
          processing_fee: number
          rejection_reason: string | null
          repayment_periods: number
          repayment_schedule: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          total_interest: number
          total_repayable: number
          updated_at: string
          written_off_at: string | null
          written_off_by: string | null
        }
        Insert: {
          amount_repaid?: number
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          borrower_id: string
          completed_at?: string | null
          created_at?: string
          credit_score_at_apply: number
          default_notice_sent?: boolean
          default_notice_sent_at?: string | null
          disbursed_at?: string | null
          due_date?: string | null
          first_missed_payment_at?: string | null
          group_id: string
          id?: string
          interest_rate: number
          interest_type: string
          notes?: string | null
          outstanding?: number | null
          principal: number
          processing_fee?: number
          rejection_reason?: string | null
          repayment_periods: number
          repayment_schedule: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_interest: number
          total_repayable: number
          updated_at?: string
          written_off_at?: string | null
          written_off_by?: string | null
        }
        Update: {
          amount_repaid?: number
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          borrower_id?: string
          completed_at?: string | null
          created_at?: string
          credit_score_at_apply?: number
          default_notice_sent?: boolean
          default_notice_sent_at?: string | null
          disbursed_at?: string | null
          due_date?: string | null
          first_missed_payment_at?: string | null
          group_id?: string
          id?: string
          interest_rate?: number
          interest_type?: string
          notes?: string | null
          outstanding?: number | null
          principal?: number
          processing_fee?: number
          rejection_reason?: string | null
          repayment_periods?: number
          repayment_schedule?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_interest?: number
          total_repayable?: number
          updated_at?: string
          written_off_at?: string | null
          written_off_by?: string | null
        }
        Relationships: []
      }
      loans_2025: {
        Row: {
          amount_repaid: number
          applied_at: string
          approved_at: string | null
          approved_by: string | null
          borrower_id: string
          completed_at: string | null
          created_at: string
          credit_score_at_apply: number
          default_notice_sent: boolean
          default_notice_sent_at: string | null
          disbursed_at: string | null
          due_date: string | null
          first_missed_payment_at: string | null
          group_id: string
          id: string
          interest_rate: number
          interest_type: string
          notes: string | null
          outstanding: number | null
          principal: number
          processing_fee: number
          rejection_reason: string | null
          repayment_periods: number
          repayment_schedule: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          total_interest: number
          total_repayable: number
          updated_at: string
          written_off_at: string | null
          written_off_by: string | null
        }
        Insert: {
          amount_repaid?: number
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          borrower_id: string
          completed_at?: string | null
          created_at?: string
          credit_score_at_apply: number
          default_notice_sent?: boolean
          default_notice_sent_at?: string | null
          disbursed_at?: string | null
          due_date?: string | null
          first_missed_payment_at?: string | null
          group_id: string
          id?: string
          interest_rate: number
          interest_type: string
          notes?: string | null
          outstanding?: number | null
          principal: number
          processing_fee?: number
          rejection_reason?: string | null
          repayment_periods: number
          repayment_schedule: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_interest: number
          total_repayable: number
          updated_at?: string
          written_off_at?: string | null
          written_off_by?: string | null
        }
        Update: {
          amount_repaid?: number
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          borrower_id?: string
          completed_at?: string | null
          created_at?: string
          credit_score_at_apply?: number
          default_notice_sent?: boolean
          default_notice_sent_at?: string | null
          disbursed_at?: string | null
          due_date?: string | null
          first_missed_payment_at?: string | null
          group_id?: string
          id?: string
          interest_rate?: number
          interest_type?: string
          notes?: string | null
          outstanding?: number | null
          principal?: number
          processing_fee?: number
          rejection_reason?: string | null
          repayment_periods?: number
          repayment_schedule?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_interest?: number
          total_repayable?: number
          updated_at?: string
          written_off_at?: string | null
          written_off_by?: string | null
        }
        Relationships: []
      }
      loans_2026: {
        Row: {
          amount_repaid: number
          applied_at: string
          approved_at: string | null
          approved_by: string | null
          borrower_id: string
          completed_at: string | null
          created_at: string
          credit_score_at_apply: number
          default_notice_sent: boolean
          default_notice_sent_at: string | null
          disbursed_at: string | null
          due_date: string | null
          first_missed_payment_at: string | null
          group_id: string
          id: string
          interest_rate: number
          interest_type: string
          notes: string | null
          outstanding: number | null
          principal: number
          processing_fee: number
          rejection_reason: string | null
          repayment_periods: number
          repayment_schedule: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          total_interest: number
          total_repayable: number
          updated_at: string
          written_off_at: string | null
          written_off_by: string | null
        }
        Insert: {
          amount_repaid?: number
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          borrower_id: string
          completed_at?: string | null
          created_at?: string
          credit_score_at_apply: number
          default_notice_sent?: boolean
          default_notice_sent_at?: string | null
          disbursed_at?: string | null
          due_date?: string | null
          first_missed_payment_at?: string | null
          group_id: string
          id?: string
          interest_rate: number
          interest_type: string
          notes?: string | null
          outstanding?: number | null
          principal: number
          processing_fee?: number
          rejection_reason?: string | null
          repayment_periods: number
          repayment_schedule: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_interest: number
          total_repayable: number
          updated_at?: string
          written_off_at?: string | null
          written_off_by?: string | null
        }
        Update: {
          amount_repaid?: number
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          borrower_id?: string
          completed_at?: string | null
          created_at?: string
          credit_score_at_apply?: number
          default_notice_sent?: boolean
          default_notice_sent_at?: string | null
          disbursed_at?: string | null
          due_date?: string | null
          first_missed_payment_at?: string | null
          group_id?: string
          id?: string
          interest_rate?: number
          interest_type?: string
          notes?: string | null
          outstanding?: number | null
          principal?: number
          processing_fee?: number
          rejection_reason?: string | null
          repayment_periods?: number
          repayment_schedule?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_interest?: number
          total_repayable?: number
          updated_at?: string
          written_off_at?: string | null
          written_off_by?: string | null
        }
        Relationships: []
      }
      loans_2027: {
        Row: {
          amount_repaid: number
          applied_at: string
          approved_at: string | null
          approved_by: string | null
          borrower_id: string
          completed_at: string | null
          created_at: string
          credit_score_at_apply: number
          default_notice_sent: boolean
          default_notice_sent_at: string | null
          disbursed_at: string | null
          due_date: string | null
          first_missed_payment_at: string | null
          group_id: string
          id: string
          interest_rate: number
          interest_type: string
          notes: string | null
          outstanding: number | null
          principal: number
          processing_fee: number
          rejection_reason: string | null
          repayment_periods: number
          repayment_schedule: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          total_interest: number
          total_repayable: number
          updated_at: string
          written_off_at: string | null
          written_off_by: string | null
        }
        Insert: {
          amount_repaid?: number
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          borrower_id: string
          completed_at?: string | null
          created_at?: string
          credit_score_at_apply: number
          default_notice_sent?: boolean
          default_notice_sent_at?: string | null
          disbursed_at?: string | null
          due_date?: string | null
          first_missed_payment_at?: string | null
          group_id: string
          id?: string
          interest_rate: number
          interest_type: string
          notes?: string | null
          outstanding?: number | null
          principal: number
          processing_fee?: number
          rejection_reason?: string | null
          repayment_periods: number
          repayment_schedule: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_interest: number
          total_repayable: number
          updated_at?: string
          written_off_at?: string | null
          written_off_by?: string | null
        }
        Update: {
          amount_repaid?: number
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          borrower_id?: string
          completed_at?: string | null
          created_at?: string
          credit_score_at_apply?: number
          default_notice_sent?: boolean
          default_notice_sent_at?: string | null
          disbursed_at?: string | null
          due_date?: string | null
          first_missed_payment_at?: string | null
          group_id?: string
          id?: string
          interest_rate?: number
          interest_type?: string
          notes?: string | null
          outstanding?: number | null
          principal?: number
          processing_fee?: number
          rejection_reason?: string | null
          repayment_periods?: number
          repayment_schedule?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_interest?: number
          total_repayable?: number
          updated_at?: string
          written_off_at?: string | null
          written_off_by?: string | null
        }
        Relationships: []
      }
      loans_2028: {
        Row: {
          amount_repaid: number
          applied_at: string
          approved_at: string | null
          approved_by: string | null
          borrower_id: string
          completed_at: string | null
          created_at: string
          credit_score_at_apply: number
          default_notice_sent: boolean
          default_notice_sent_at: string | null
          disbursed_at: string | null
          due_date: string | null
          first_missed_payment_at: string | null
          group_id: string
          id: string
          interest_rate: number
          interest_type: string
          notes: string | null
          outstanding: number | null
          principal: number
          processing_fee: number
          rejection_reason: string | null
          repayment_periods: number
          repayment_schedule: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          total_interest: number
          total_repayable: number
          updated_at: string
          written_off_at: string | null
          written_off_by: string | null
        }
        Insert: {
          amount_repaid?: number
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          borrower_id: string
          completed_at?: string | null
          created_at?: string
          credit_score_at_apply: number
          default_notice_sent?: boolean
          default_notice_sent_at?: string | null
          disbursed_at?: string | null
          due_date?: string | null
          first_missed_payment_at?: string | null
          group_id: string
          id?: string
          interest_rate: number
          interest_type: string
          notes?: string | null
          outstanding?: number | null
          principal: number
          processing_fee?: number
          rejection_reason?: string | null
          repayment_periods: number
          repayment_schedule: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_interest: number
          total_repayable: number
          updated_at?: string
          written_off_at?: string | null
          written_off_by?: string | null
        }
        Update: {
          amount_repaid?: number
          applied_at?: string
          approved_at?: string | null
          approved_by?: string | null
          borrower_id?: string
          completed_at?: string | null
          created_at?: string
          credit_score_at_apply?: number
          default_notice_sent?: boolean
          default_notice_sent_at?: string | null
          disbursed_at?: string | null
          due_date?: string | null
          first_missed_payment_at?: string | null
          group_id?: string
          id?: string
          interest_rate?: number
          interest_type?: string
          notes?: string | null
          outstanding?: number | null
          principal?: number
          processing_fee?: number
          rejection_reason?: string | null
          repayment_periods?: number
          repayment_schedule?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_interest?: number
          total_repayable?: number
          updated_at?: string
          written_off_at?: string | null
          written_off_by?: string | null
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
  kyc: {
    Tables: {
      addresses: {
        Row: {
          address_type: string
          city: string
          country: string
          county_province: string | null
          created_at: string
          id: string
          is_primary: boolean
          line1: string
          line2: string | null
          postal_code: string | null
          profile_id: string
          proof_doc_type: string | null
          proof_image_path: string | null
          proof_period: string | null
          rejection_reason: string | null
          status: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address_type: string
          city: string
          country?: string
          county_province?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          line1: string
          line2?: string | null
          postal_code?: string | null
          profile_id: string
          proof_doc_type?: string | null
          proof_image_path?: string | null
          proof_period?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address_type?: string
          city?: string
          country?: string
          county_province?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          line1?: string
          line2?: string | null
          postal_code?: string | null
          profile_id?: string
          proof_doc_type?: string | null
          proof_image_path?: string | null
          proof_period?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      financial_declarations: {
        Row: {
          annual_contribution_estimate: number | null
          created_at: string
          declaration_accepted: boolean
          declaration_accepted_at: string | null
          declaration_ip: unknown
          employer_name: string | null
          employment_status: string
          id: string
          industry: string | null
          is_pep: boolean
          job_title: string | null
          monthly_income_band: string
          pep_details: string | null
          profile_id: string
          source_of_funds: string[]
          source_of_funds_detail: string | null
          tax_country: string
          tax_id_number: string | null
          updated_at: string
          us_person: boolean
        }
        Insert: {
          annual_contribution_estimate?: number | null
          created_at?: string
          declaration_accepted?: boolean
          declaration_accepted_at?: string | null
          declaration_ip?: unknown
          employer_name?: string | null
          employment_status: string
          id?: string
          industry?: string | null
          is_pep?: boolean
          job_title?: string | null
          monthly_income_band: string
          pep_details?: string | null
          profile_id: string
          source_of_funds: string[]
          source_of_funds_detail?: string | null
          tax_country?: string
          tax_id_number?: string | null
          updated_at?: string
          us_person?: boolean
        }
        Update: {
          annual_contribution_estimate?: number | null
          created_at?: string
          declaration_accepted?: boolean
          declaration_accepted_at?: string | null
          declaration_ip?: unknown
          employer_name?: string | null
          employment_status?: string
          id?: string
          industry?: string | null
          is_pep?: boolean
          job_title?: string | null
          monthly_income_band?: string
          pep_details?: string | null
          profile_id?: string
          source_of_funds?: string[]
          source_of_funds_detail?: string | null
          tax_country?: string
          tax_id_number?: string | null
          updated_at?: string
          us_person?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "financial_declarations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      identity_documents: {
        Row: {
          back_image_path: string | null
          created_at: string
          doc_date_of_birth: string | null
          doc_full_name: string
          doc_number: string
          doc_number_hash: string
          doc_type: string
          expiry_date: string | null
          front_image_path: string
          id: string
          is_primary: boolean
          issue_date: string | null
          issuing_authority: string | null
          issuing_country: string
          profile_id: string
          rejection_reason: string | null
          selfie_match_passed: boolean | null
          selfie_match_score: number | null
          status: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          back_image_path?: string | null
          created_at?: string
          doc_date_of_birth?: string | null
          doc_full_name: string
          doc_number: string
          doc_number_hash: string
          doc_type: string
          expiry_date?: string | null
          front_image_path: string
          id?: string
          is_primary?: boolean
          issue_date?: string | null
          issuing_authority?: string | null
          issuing_country: string
          profile_id: string
          rejection_reason?: string | null
          selfie_match_passed?: boolean | null
          selfie_match_score?: number | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          back_image_path?: string | null
          created_at?: string
          doc_date_of_birth?: string | null
          doc_full_name?: string
          doc_number?: string
          doc_number_hash?: string
          doc_type?: string
          expiry_date?: string | null
          front_image_path?: string
          id?: string
          is_primary?: boolean
          issue_date?: string | null
          issuing_authority?: string | null
          issuing_country?: string
          profile_id?: string
          rejection_reason?: string | null
          selfie_match_passed?: boolean | null
          selfie_match_score?: number | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      next_of_kin: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          id_number: string | null
          is_primary: boolean
          phone: string
          physical_address: string | null
          profile_id: string
          relationship: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          is_primary?: boolean
          phone: string
          physical_address?: string | null
          profile_id: string
          relationship: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          is_primary?: boolean
          phone?: string
          physical_address?: string | null
          profile_id?: string
          relationship?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "next_of_kin_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      payment_accounts: {
        Row: {
          account_name: string | null
          account_number: string | null
          account_type: string
          bank_branch: string | null
          bank_code: string | null
          bank_name: string | null
          created_at: string
          iban: string | null
          id: string
          is_active: boolean
          is_primary: boolean
          is_verified: boolean
          mobile_number: string | null
          mobile_provider: string | null
          profile_id: string
          swift_code: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          verified_method: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          account_type: string
          bank_branch?: string | null
          bank_code?: string | null
          bank_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          is_verified?: boolean
          mobile_number?: string | null
          mobile_provider?: string | null
          profile_id: string
          swift_code?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          verified_method?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          account_type?: string
          bank_branch?: string | null
          bank_code?: string | null
          bank_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          is_verified?: boolean
          mobile_number?: string | null
          mobile_provider?: string | null
          profile_id?: string
          swift_code?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          verified_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      phone_verifications: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          max_attempts: number
          otp_hash: string
          phone: string
          profile_id: string
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at: string
          id?: string
          max_attempts?: number
          otp_hash: string
          phone: string
          profile_id: string
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          max_attempts?: number
          otp_hash?: string
          phone?: string
          profile_id?: string
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profiles: {
        Row: {
          country_of_birth: string | null
          created_at: string
          date_of_birth: string
          first_name: string
          full_legal_name: string
          gender: string
          internal_notes: string | null
          kyc_level: number
          last_name: string
          level1_completed_at: string | null
          level2_completed_at: string | null
          level2_verified_by: string | null
          level3_completed_at: string | null
          level3_verified_by: string | null
          middle_name: string | null
          nationality: string
          pep_status: boolean
          primary_phone: string
          profile_id: string
          reviewed_at: string | null
          risk_rating: string
          sanctions_checked: boolean
          sanctions_checked_at: string | null
          sanctions_cleared: boolean | null
          secondary_phone: string | null
          submitted_at: string | null
          updated_at: string
          verification_status: string
        }
        Insert: {
          country_of_birth?: string | null
          created_at?: string
          date_of_birth: string
          first_name: string
          full_legal_name: string
          gender: string
          internal_notes?: string | null
          kyc_level?: number
          last_name: string
          level1_completed_at?: string | null
          level2_completed_at?: string | null
          level2_verified_by?: string | null
          level3_completed_at?: string | null
          level3_verified_by?: string | null
          middle_name?: string | null
          nationality: string
          pep_status?: boolean
          primary_phone: string
          profile_id: string
          reviewed_at?: string | null
          risk_rating?: string
          sanctions_checked?: boolean
          sanctions_checked_at?: string | null
          sanctions_cleared?: boolean | null
          secondary_phone?: string | null
          submitted_at?: string | null
          updated_at?: string
          verification_status?: string
        }
        Update: {
          country_of_birth?: string | null
          created_at?: string
          date_of_birth?: string
          first_name?: string
          full_legal_name?: string
          gender?: string
          internal_notes?: string | null
          kyc_level?: number
          last_name?: string
          level1_completed_at?: string | null
          level2_completed_at?: string | null
          level2_verified_by?: string | null
          level3_completed_at?: string | null
          level3_verified_by?: string | null
          middle_name?: string | null
          nationality?: string
          pep_status?: boolean
          primary_phone?: string
          profile_id?: string
          reviewed_at?: string | null
          risk_rating?: string
          sanctions_checked?: boolean
          sanctions_checked_at?: string | null
          sanctions_cleared?: boolean | null
          secondary_phone?: string | null
          submitted_at?: string | null
          updated_at?: string
          verification_status?: string
        }
        Relationships: []
      }
      selfies: {
        Row: {
          created_at: string
          id: string
          image_path: string
          liveness_passed: boolean | null
          liveness_score: number | null
          profile_id: string
          rejection_reason: string | null
          status: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_path: string
          liveness_passed?: boolean | null
          liveness_score?: number | null
          profile_id: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string
          liveness_passed?: boolean | null
          liveness_score?: number | null
          profile_id?: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "selfies_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      verification_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: unknown
          new_value: Json | null
          notes: string | null
          old_value: Json | null
          profile_id: string
          reference_id: string | null
          reference_table: string | null
          triggered_by: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          profile_id: string
          reference_id?: string | null
          reference_table?: string | null
          triggered_by?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          profile_id?: string
          reference_id?: string | null
          reference_table?: string | null
          triggered_by?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_reviewer: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  personal: {
    Tables: {
      budgets: {
        Row: {
          budgeted_amount: number
          category: string
          created_at: string
          id: string
          month: string
          notes: string | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          budgeted_amount: number
          category: string
          created_at?: string
          id?: string
          month: string
          notes?: string | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          budgeted_amount?: number
          category?: string
          created_at?: string
          id?: string
          month?: string
          notes?: string | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shopping_items: {
        Row: {
          actual_price: number | null
          category: string | null
          checked_at: string | null
          created_at: string
          estimated_price: number | null
          id: string
          is_checked: boolean
          list_id: string
          name: string
          quantity: number
          sort_order: number
          unit: string | null
        }
        Insert: {
          actual_price?: number | null
          category?: string | null
          checked_at?: string | null
          created_at?: string
          estimated_price?: number | null
          id?: string
          is_checked?: boolean
          list_id: string
          name: string
          quantity?: number
          sort_order?: number
          unit?: string | null
        }
        Update: {
          actual_price?: number | null
          category?: string | null
          checked_at?: string | null
          created_at?: string
          estimated_price?: number | null
          id?: string
          is_checked?: boolean
          list_id?: string
          name?: string
          quantity?: number
          sort_order?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_complete: boolean
          name: string
          planned_date: string | null
          profile_id: string
          total_actual: number | null
          total_estimated: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_complete?: boolean
          name: string
          planned_date?: string | null
          profile_id: string
          total_actual?: number | null
          total_estimated?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_complete?: boolean
          name?: string
          planned_date?: string | null
          profile_id?: string
          total_actual?: number | null
          total_estimated?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          is_recurring: boolean
          payment_method: string | null
          profile_id: string
          receipt_path: string | null
          recurrence_rule: string | null
          subcategory: string | null
          tags: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          payment_method?: string | null
          profile_id: string
          receipt_path?: string | null
          recurrence_rule?: string | null
          subcategory?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          payment_method?: string | null
          profile_id?: string
          receipt_path?: string | null
          recurrence_rule?: string | null
          subcategory?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions_2025: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          is_recurring: boolean
          payment_method: string | null
          profile_id: string
          receipt_path: string | null
          recurrence_rule: string | null
          subcategory: string | null
          tags: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          payment_method?: string | null
          profile_id: string
          receipt_path?: string | null
          recurrence_rule?: string | null
          subcategory?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          payment_method?: string | null
          profile_id?: string
          receipt_path?: string | null
          recurrence_rule?: string | null
          subcategory?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions_2026: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          is_recurring: boolean
          payment_method: string | null
          profile_id: string
          receipt_path: string | null
          recurrence_rule: string | null
          subcategory: string | null
          tags: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          payment_method?: string | null
          profile_id: string
          receipt_path?: string | null
          recurrence_rule?: string | null
          subcategory?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          payment_method?: string | null
          profile_id?: string
          receipt_path?: string | null
          recurrence_rule?: string | null
          subcategory?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions_2027: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          is_recurring: boolean
          payment_method: string | null
          profile_id: string
          receipt_path: string | null
          recurrence_rule: string | null
          subcategory: string | null
          tags: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          payment_method?: string | null
          profile_id: string
          receipt_path?: string | null
          recurrence_rule?: string | null
          subcategory?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          payment_method?: string | null
          profile_id?: string
          receipt_path?: string | null
          recurrence_rule?: string | null
          subcategory?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions_2028: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          is_recurring: boolean
          payment_method: string | null
          profile_id: string
          receipt_path: string | null
          recurrence_rule: string | null
          subcategory: string | null
          tags: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          payment_method?: string | null
          profile_id: string
          receipt_path?: string | null
          recurrence_rule?: string | null
          subcategory?: string | null
          tags?: string[] | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          payment_method?: string | null
          profile_id?: string
          receipt_path?: string | null
          recurrence_rule?: string | null
          subcategory?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string
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
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      refresh_materialized_views: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  sacco: {
    Tables: {
      election_candidates: {
        Row: {
          accepted: boolean | null
          accepted_at: string | null
          candidate_id: string
          created_at: string
          election_id: string
          id: string
          manifesto: string | null
          nominated_by: string
          withdrew: boolean
          withdrew_at: string | null
        }
        Insert: {
          accepted?: boolean | null
          accepted_at?: string | null
          candidate_id: string
          created_at?: string
          election_id: string
          id?: string
          manifesto?: string | null
          nominated_by: string
          withdrew?: boolean
          withdrew_at?: string | null
        }
        Update: {
          accepted?: boolean | null
          accepted_at?: string | null
          candidate_id?: string
          created_at?: string
          election_id?: string
          id?: string
          manifesto?: string | null
          nominated_by?: string
          withdrew?: boolean
          withdrew_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "election_candidates_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      election_votes: {
        Row: {
          candidate_id: string
          election_id: string
          id: string
          ip_address: unknown
          voted_at: string
          voter_id: string
        }
        Insert: {
          candidate_id: string
          election_id: string
          id?: string
          ip_address?: unknown
          voted_at?: string
          voter_id: string
        }
        Update: {
          candidate_id?: string
          election_id?: string
          id?: string
          ip_address?: unknown
          voted_at?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "election_votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "election_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_votes_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      elections: {
        Row: {
          closed_by: string | null
          created_at: string
          group_id: string
          id: string
          nominations_close_at: string
          nominations_open_at: string
          notes: string | null
          opened_by: string
          position: string
          status: string
          tie_broken_by: string | null
          updated_at: string
          voting_close_at: string | null
          voting_open_at: string | null
          winner_id: string | null
        }
        Insert: {
          closed_by?: string | null
          created_at?: string
          group_id: string
          id?: string
          nominations_close_at: string
          nominations_open_at?: string
          notes?: string | null
          opened_by: string
          position: string
          status?: string
          tie_broken_by?: string | null
          updated_at?: string
          voting_close_at?: string | null
          voting_open_at?: string | null
          winner_id?: string | null
        }
        Update: {
          closed_by?: string | null
          created_at?: string
          group_id?: string
          id?: string
          nominations_close_at?: string
          nominations_open_at?: string
          notes?: string | null
          opened_by?: string
          position?: string
          status?: string
          tie_broken_by?: string | null
          updated_at?: string
          voting_close_at?: string | null
          voting_open_at?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elections_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_summaries"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "elections_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_join_requests: {
        Row: {
          created_at: string
          denial_reason: string | null
          group_id: string
          id: string
          message: string | null
          requester_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          denial_reason?: string | null
          group_id: string
          id?: string
          message?: string | null
          requester_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          denial_reason?: string | null
          group_id?: string
          id?: string
          message?: string | null
          requester_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_summaries"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string
          credit_score_at_join: number | null
          exit_reason: string | null
          exited_at: string | null
          group_id: string
          id: string
          invited_by: string | null
          joined_at: string | null
          mid_join: boolean
          mid_join_catchup_amount: number | null
          mid_join_catchup_paid: boolean
          mid_join_week: number | null
          profile_id: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_score_at_join?: number | null
          exit_reason?: string | null
          exited_at?: string | null
          group_id: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          mid_join?: boolean
          mid_join_catchup_amount?: number | null
          mid_join_catchup_paid?: boolean
          mid_join_week?: number | null
          profile_id: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_score_at_join?: number | null
          exit_reason?: string | null
          exited_at?: string | null
          group_id?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          mid_join?: boolean
          mid_join_catchup_amount?: number | null
          mid_join_catchup_paid?: boolean
          mid_join_week?: number | null
          profile_id?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_summaries"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_rules: {
        Row: {
          blacklist_recommendation_after: number
          contribution_amount: number
          contribution_day: number | null
          contribution_frequency: string
          created_at: string
          default_penalty_rate: number
          default_threshold_days: number
          dividend_distribution: string
          grace_period_days: number
          group_id: string
          guarantor_required: boolean
          guarantors_required_count: number
          initiation_fee: number
          last_changed_by: string | null
          late_fine_flat: number
          late_fine_interest_rate_daily: number
          late_joining_fee: number
          loan_enabled: boolean
          loan_interest_rate: number
          loan_interest_type: string
          loan_processing_fee_rate: number
          loan_repayment_periods: number
          max_active_loans_per_member: number
          max_loan_multiplier: number
          max_members: number | null
          mid_join_allowed: boolean
          mid_join_deadline_weeks: number
          min_guarantor_credit_score: number | null
          min_kyc_level: number
          rules_version: number
          updated_at: string
        }
        Insert: {
          blacklist_recommendation_after?: number
          contribution_amount: number
          contribution_day?: number | null
          contribution_frequency: string
          created_at?: string
          default_penalty_rate?: number
          default_threshold_days?: number
          dividend_distribution?: string
          grace_period_days?: number
          group_id: string
          guarantor_required?: boolean
          guarantors_required_count?: number
          initiation_fee?: number
          last_changed_by?: string | null
          late_fine_flat?: number
          late_fine_interest_rate_daily?: number
          late_joining_fee?: number
          loan_enabled?: boolean
          loan_interest_rate?: number
          loan_interest_type?: string
          loan_processing_fee_rate?: number
          loan_repayment_periods?: number
          max_active_loans_per_member?: number
          max_loan_multiplier?: number
          max_members?: number | null
          mid_join_allowed?: boolean
          mid_join_deadline_weeks?: number
          min_guarantor_credit_score?: number | null
          min_kyc_level?: number
          rules_version?: number
          updated_at?: string
        }
        Update: {
          blacklist_recommendation_after?: number
          contribution_amount?: number
          contribution_day?: number | null
          contribution_frequency?: string
          created_at?: string
          default_penalty_rate?: number
          default_threshold_days?: number
          dividend_distribution?: string
          grace_period_days?: number
          group_id?: string
          guarantor_required?: boolean
          guarantors_required_count?: number
          initiation_fee?: number
          last_changed_by?: string | null
          late_fine_flat?: number
          late_fine_interest_rate_daily?: number
          late_joining_fee?: number
          loan_enabled?: boolean
          loan_interest_rate?: number
          loan_interest_type?: string
          loan_processing_fee_rate?: number
          loan_repayment_periods?: number
          max_active_loans_per_member?: number
          max_loan_multiplier?: number
          max_members?: number | null
          mid_join_allowed?: boolean
          mid_join_deadline_weeks?: number
          min_guarantor_credit_score?: number | null
          min_kyc_level?: number
          rules_version?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_rules_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: true
            referencedRelation: "group_summaries"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "group_rules_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: true
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          currency: string
          cycle_end: string | null
          cycle_start: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          status: string
          timezone: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          currency?: string
          cycle_end?: string | null
          cycle_start?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          status?: string
          timezone?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          currency?: string
          cycle_end?: string | null
          cycle_start?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          status?: string
          timezone?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      group_summaries: {
        Row: {
          active_loan_book: number | null
          active_members: number | null
          currency: string | null
          cycle_end: string | null
          cycle_start: string | null
          group_id: string | null
          name: string | null
          outstanding_loans: number | null
          refreshed_at: string | null
          status: string | null
          total_contributions: number | null
          total_defaults: number | null
        }
        Relationships: []
      }
      member_portfolios: {
        Row: {
          active_loans: number | null
          defaulted_payments: number | null
          group_id: string | null
          joined_at: string | null
          late_payments: number | null
          loan_outstanding: number | null
          loans_defaulted: number | null
          loans_repaid: number | null
          on_time_payments: number | null
          profile_id: string | null
          refreshed_at: string | null
          role: string | null
          status: string | null
          total_contributed: number | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_summaries"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      is_chair: { Args: { p_group_id: string }; Returns: boolean }
      is_member: { Args: { p_group_id: string }; Returns: boolean }
      is_officer: { Args: { p_group_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  system: {
    Tables: {
      errors: {
        Row: {
          context: Json | null
          created_at: string
          error_code: string | null
          id: string
          message: string
          profile_id: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          source: string
          stack: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          error_code?: string | null
          id?: string
          message: string
          profile_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          source: string
          stack?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          error_code?: string | null
          id?: string
          message?: string
          profile_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          source?: string
          stack?: string | null
        }
        Relationships: []
      }
      job_log: {
        Row: {
          completed_at: string | null
          duration_ms: number | null
          error_detail: Json | null
          error_message: string | null
          id: string
          job_name: string
          metadata: Json | null
          records_processed: number | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          duration_ms?: number | null
          error_detail?: Json | null
          error_message?: string | null
          id?: string
          job_name: string
          metadata?: Json | null
          records_processed?: number | null
          started_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          duration_ms?: number | null
          error_detail?: Json | null
          error_message?: string | null
          id?: string
          job_name?: string
          metadata?: Json | null
          records_processed?: number | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          data: Json | null
          expires_at: string | null
          group_id: string | null
          id: string
          priority: string
          read: boolean
          read_at: string | null
          recipient_id: string
          sent_at: string | null
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          priority?: string
          read?: boolean
          read_at?: string | null
          recipient_id: string
          sent_at?: string | null
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          priority?: string
          read?: boolean
          read_at?: string | null
          recipient_id?: string
          sent_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      notifications_2025: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          data: Json | null
          expires_at: string | null
          group_id: string | null
          id: string
          priority: string
          read: boolean
          read_at: string | null
          recipient_id: string
          sent_at: string | null
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          priority?: string
          read?: boolean
          read_at?: string | null
          recipient_id: string
          sent_at?: string | null
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          priority?: string
          read?: boolean
          read_at?: string | null
          recipient_id?: string
          sent_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      notifications_2026: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          data: Json | null
          expires_at: string | null
          group_id: string | null
          id: string
          priority: string
          read: boolean
          read_at: string | null
          recipient_id: string
          sent_at: string | null
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          priority?: string
          read?: boolean
          read_at?: string | null
          recipient_id: string
          sent_at?: string | null
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          priority?: string
          read?: boolean
          read_at?: string | null
          recipient_id?: string
          sent_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      notifications_2027: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          data: Json | null
          expires_at: string | null
          group_id: string | null
          id: string
          priority: string
          read: boolean
          read_at: string | null
          recipient_id: string
          sent_at: string | null
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          priority?: string
          read?: boolean
          read_at?: string | null
          recipient_id: string
          sent_at?: string | null
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          priority?: string
          read?: boolean
          read_at?: string | null
          recipient_id?: string
          sent_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      notifications_2028: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          data: Json | null
          expires_at: string | null
          group_id: string | null
          id: string
          priority: string
          read: boolean
          read_at: string | null
          recipient_id: string
          sent_at: string | null
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          priority?: string
          read?: boolean
          read_at?: string | null
          recipient_id: string
          sent_at?: string | null
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          priority?: string
          read?: boolean
          read_at?: string | null
          recipient_id?: string
          sent_at?: string | null
          title?: string
          type?: string
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
  audit: {
    Enums: {},
  },
  core: {
    Enums: {},
  },
  finance: {
    Enums: {},
  },
  kyc: {
    Enums: {},
  },
  personal: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  sacco: {
    Enums: {},
  },
  system: {
    Enums: {},
  },
} as const
