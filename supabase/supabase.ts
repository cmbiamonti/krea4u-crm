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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      template_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          category_id: string
          user_id: string
          name: string
          description: string
          content: Json
          tags: string[] | null
          is_favorite: boolean
          is_system: boolean
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          user_id: string
          name: string
          description?: string
          content: Json
          tags?: string[] | null
          is_favorite?: boolean
          is_system?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          user_id?: string
          name?: string
          description?: string
          content?: Json
          tags?: string[] | null
          is_favorite?: boolean
          is_system?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      template_documents: {
        Row: {
          id: string
          template_id: string
          user_id: string
          name: string
          data: Json
          metadata: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          user_id: string
          name: string
          data: Json
          metadata: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          user_id?: string
          name?: string
          data?: Json
          metadata?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      document_versions: {
        Row: {
          id: string
          document_id: string
          version_number: number
          data: Json
          changed_by: string
          change_note: string
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          version_number: number
          data: Json
          changed_by: string
          change_note?: string
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          version_number?: number
          data?: Json
          changed_by?: string
          change_note?: string
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          company: string | null
          position: string | null
          category: string
          tags: string[] | null
          notes: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          position?: string | null
          category?: string
          tags?: string[] | null
          notes?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          position?: string | null
          category?: string
          tags?: string[] | null
          notes?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
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