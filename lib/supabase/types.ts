export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Convenience type exports
export type Document = Database['public']['Tables']['documents']['Row'] & {
  url?: string; // Added for public URL
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type IPOApplication = Database['public']['Tables']['ipo_applications']['Row']
export type ApplicationSection = Database['public']['Tables']['application_sections']['Row']

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string | null
          role: 'ISSUER' | 'IB_ADVISOR' | 'CMA_REGULATOR' | 'CMA_ADMIN'
          company_id: string | null
          company_role: string | null
          avatar_url: string | null
          phone: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name?: string | null
          role: 'ISSUER' | 'IB_ADVISOR' | 'CMA_REGULATOR' | 'CMA_ADMIN'
          company_id?: string | null
          company_role?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string | null
          role?: 'ISSUER' | 'IB_ADVISOR' | 'CMA_REGULATOR' | 'CMA_ADMIN'
          company_id?: string | null
          company_role?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          legal_name: string
          trading_name: string | null
          registration_number: string | null
          incorporation_date: string | null
          business_description: string | null
          industry_sector: string | null
          registered_address: Json | null
          contact_info: Json | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          legal_name: string
          trading_name?: string | null
          registration_number?: string | null
          incorporation_date?: string | null
          business_description?: string | null
          industry_sector?: string | null
          registered_address?: Json
          contact_info?: Json
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          legal_name?: string
          trading_name?: string | null
          registration_number?: string | null
          incorporation_date?: string | null
          business_description?: string | null
          industry_sector?: string | null
          registered_address?: Json
          contact_info?: Json
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ipo_applications: {
        Row: {
          id: string
          company_id: string
          application_number: string | null
          status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'IB_REVIEW' | 'QUERY_TO_ISSUER' | 'UNDER_REVIEW' | 'CMA_REVIEW' | 'QUERY_ISSUED' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
          current_phase: 'DATA_COLLECTION' | 'IB_REVIEW' | 'CMA_SUBMISSION' | 'CMA_REVIEW' | 'COMPLETED'
          completion_percentage: number
          target_amount: number | null
          securities_count: number | null
          price_per_security: number | null
          assigned_ib_advisor: string | null
          assigned_cma_officer: string | null
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          expected_listing_date: string | null
          submitted_at: string | null
          approved_at: string | null
          rejected_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          application_number?: string | null
          status?: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'IB_REVIEW' | 'QUERY_TO_ISSUER' | 'UNDER_REVIEW' | 'CMA_REVIEW' | 'QUERY_ISSUED' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
          current_phase?: 'DATA_COLLECTION' | 'IB_REVIEW' | 'CMA_SUBMISSION' | 'CMA_REVIEW' | 'COMPLETED'
          completion_percentage?: number
          target_amount?: number | null
          securities_count?: number | null
          price_per_security?: number | null
          assigned_ib_advisor?: string | null
          assigned_cma_officer?: string | null
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          expected_listing_date?: string | null
          submitted_at?: string | null
          approved_at?: string | null
          rejected_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          application_number?: string | null
          status?: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'IB_REVIEW' | 'QUERY_TO_ISSUER' | 'UNDER_REVIEW' | 'CMA_REVIEW' | 'QUERY_ISSUED' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
          current_phase?: 'DATA_COLLECTION' | 'IB_REVIEW' | 'CMA_SUBMISSION' | 'CMA_REVIEW' | 'COMPLETED'
          completion_percentage?: number
          target_amount?: number | null
          securities_count?: number | null
          price_per_security?: number | null
          assigned_ib_advisor?: string | null
          assigned_cma_officer?: string | null
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          expected_listing_date?: string | null
          submitted_at?: string | null
          approved_at?: string | null
          rejected_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      application_sections: {
        Row: {
          id: string
          application_id: string
          section_number: number
          section_title: string
          status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
          data: Json
          validation_errors: Json
          completion_percentage: number
          completed_by: string | null
          completed_at: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          section_number: number
          section_title: string
          status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
          data?: Json
          validation_errors?: Json
          completion_percentage?: number
          completed_by?: string | null
          completed_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          section_number?: number
          section_title?: string
          status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
          data?: Json
          validation_errors?: Json
          completion_percentage?: number
          completed_by?: string | null
          completed_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          application_id: string
          section_id: string | null
          filename: string
          original_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          category: string
          description: string | null
          version: number
          checksum: string | null
          uploaded_by: string
          uploaded_at: string
          is_active: boolean
          is_confidential: boolean
        }
        Insert: {
          id?: string
          application_id: string
          section_id?: string | null
          filename: string
          original_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          category: string
          description?: string | null
          version?: number
          checksum?: string | null
          uploaded_by: string
          uploaded_at?: string
          is_active?: boolean
          is_confidential?: boolean
        }
        Update: {
          id?: string
          application_id?: string
          section_id?: string | null
          filename?: string
          original_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          category?: string
          description?: string | null
          version?: number
          checksum?: string | null
          uploaded_by?: string
          uploaded_at?: string
          is_active?: boolean
          is_confidential?: boolean
        }
      }
      comments: {
        Row: {
          id: string
          application_id: string
          section_id: string | null
          document_id: string | null
          author_id: string
          content: string
          comment_type: 'GENERAL' | 'QUERY' | 'FEEDBACK' | 'APPROVAL' | 'REJECTION'
          is_internal: boolean
          is_resolved: boolean
          priority: 'LOW' | 'MEDIUM' | 'HIGH'
          parent_comment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          section_id?: string | null
          document_id?: string | null
          author_id: string
          content: string
          comment_type?: 'GENERAL' | 'QUERY' | 'FEEDBACK' | 'APPROVAL' | 'REJECTION'
          is_internal?: boolean
          is_resolved?: boolean
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          section_id?: string | null
          document_id?: string | null
          author_id?: string
          content?: string
          comment_type?: 'GENERAL' | 'QUERY' | 'FEEDBACK' | 'APPROVAL' | 'REJECTION'
          is_internal?: boolean
          is_resolved?: boolean
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cma_reviews: {
        Row: {
          id: string
          application_id: string
          reviewer_id: string
          review_type: 'INITIAL_REVIEW' | 'DETAILED_REVIEW' | 'QUERY_RESPONSE' | 'FINAL_REVIEW'
          status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
          compliance_score: number | null
          risk_rating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null
          decision: 'APPROVE' | 'REJECT' | 'QUERY' | 'DEFER' | null
          decision_reason: string | null
          conditions: Json
          recommendations: Json
          review_checklist: Json
          started_at: string
          completed_at: string | null
          due_date: string | null
        }
        Insert: {
          id?: string
          application_id: string
          reviewer_id: string
          review_type: 'INITIAL_REVIEW' | 'DETAILED_REVIEW' | 'QUERY_RESPONSE' | 'FINAL_REVIEW'
          status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
          compliance_score?: number | null
          risk_rating?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null
          decision?: 'APPROVE' | 'REJECT' | 'QUERY' | 'DEFER' | null
          decision_reason?: string | null
          conditions?: Json
          recommendations?: Json
          review_checklist?: Json
          started_at?: string
          completed_at?: string | null
          due_date?: string | null
        }
        Update: {
          id?: string
          application_id?: string
          reviewer_id?: string
          review_type?: 'INITIAL_REVIEW' | 'DETAILED_REVIEW' | 'QUERY_RESPONSE' | 'FINAL_REVIEW'
          status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
          compliance_score?: number | null
          risk_rating?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null
          decision?: 'APPROVE' | 'REJECT' | 'QUERY' | 'DEFER' | null
          decision_reason?: string | null
          conditions?: Json
          recommendations?: Json
          review_checklist?: Json
          started_at?: string
          completed_at?: string | null
          due_date?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          sender_id: string | null
          title: string
          message: string
          type: 'APPLICATION_SUBMITTED' | 'APPLICATION_ASSIGNED' | 'COMMENT_ADDED' | 'STATUS_CHANGED' | 'QUERY_ISSUED' | 'DECISION_MADE' | 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
          application_id: string | null
          section_id: string | null
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          is_read: boolean
          action_url: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          sender_id?: string | null
          title: string
          message: string
          type: 'APPLICATION_SUBMITTED' | 'APPLICATION_ASSIGNED' | 'COMMENT_ADDED' | 'STATUS_CHANGED' | 'QUERY_ISSUED' | 'DECISION_MADE' | 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
          application_id?: string | null
          section_id?: string | null
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          is_read?: boolean
          action_url?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          sender_id?: string | null
          title?: string
          message?: string
          type?: 'APPLICATION_SUBMITTED' | 'APPLICATION_ASSIGNED' | 'COMMENT_ADDED' | 'STATUS_CHANGED' | 'QUERY_ISSUED' | 'DECISION_MADE' | 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
          application_id?: string | null
          section_id?: string | null
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
          is_read?: boolean
          action_url?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SUBMIT' | 'APPROVE' | 'REJECT'
          old_values: Json | null
          new_values: Json | null
          changed_by: string | null
          changed_at: string
          ip_address: string | null
          user_agent: string | null
          application_id: string | null
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SUBMIT' | 'APPROVE' | 'REJECT'
          old_values?: Json | null
          new_values?: Json | null
          changed_by?: string | null
          changed_at?: string
          ip_address?: string | null
          user_agent?: string | null
          application_id?: string | null
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SUBMIT' | 'APPROVE' | 'REJECT'
          old_values?: Json | null
          new_values?: Json | null
          changed_by?: string | null
          changed_at?: string
          ip_address?: string | null
          user_agent?: string | null
          application_id?: string | null
        }
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
  }
}