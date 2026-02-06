export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          name: string
          industry: string | null
          region: string
          phone: string | null
          email: string | null
          website: string | null
          representative: string | null
          employee_count: number | null
          annual_revenue: number | null
          address: string | null
          status: string
          description: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          industry?: string | null
          region: string
          phone?: string | null
          email?: string | null
          website?: string | null
          representative?: string | null
          employee_count?: number | null
          annual_revenue?: number | null
          address?: string | null
          status?: string
          description?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          region?: string
          phone?: string | null
          email?: string | null
          website?: string | null
          representative?: string | null
          employee_count?: number | null
          annual_revenue?: number | null
          address?: string | null
          status?: string
          description?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      account_tags: {
        Row: {
          account_id: string
          tag_id: string
        }
        Insert: {
          account_id: string
          tag_id: string
        }
        Update: {
          account_id?: string
          tag_id?: string
        }
      }
      contacts: {
        Row: {
          id: string
          account_id: string
          first_name: string
          last_name: string
          title: string | null
          department: string | null
          email: string
          phone: string | null
          mobile_phone: string | null
          is_primary_contact: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          first_name: string
          last_name: string
          title?: string | null
          department?: string | null
          email: string
          phone?: string | null
          mobile_phone?: string | null
          is_primary_contact?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          first_name?: string
          last_name?: string
          title?: string | null
          department?: string | null
          email?: string
          phone?: string | null
          mobile_phone?: string | null
          is_primary_contact?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          title: string
          company: string
          contact_person: string
          contact_email: string | null
          contact_phone: string | null
          amount: number
          status: string
          priority: string
          probability: number
          expected_close_date: string
          description: string | null
          area: string | null
          product: string | null
          team: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          company: string
          contact_person: string
          contact_email?: string | null
          contact_phone?: string | null
          amount?: number
          status?: string
          priority?: string
          probability?: number
          expected_close_date: string
          description?: string | null
          area?: string | null
          product?: string | null
          team?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          company?: string
          contact_person?: string
          contact_email?: string | null
          contact_phone?: string | null
          amount?: number
          status?: string
          priority?: string
          probability?: number
          expected_close_date?: string
          description?: string | null
          area?: string | null
          product?: string | null
          team?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deal_tags: {
        Row: {
          deal_id: string
          tag_id: string
        }
        Insert: {
          deal_id: string
          tag_id: string
        }
        Update: {
          deal_id?: string
          tag_id?: string
        }
      }
      filter_conditions: {
        Row: {
          id: string
          name: string
          filters: Json
          sort_by: string | null
          sort_order: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          filters?: Json
          sort_by?: string | null
          sort_order?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          filters?: Json
          sort_by?: string | null
          sort_order?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      custom_reports: {
        Row: {
          id: string
          name: string
          description: string | null
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          config: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          config?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
