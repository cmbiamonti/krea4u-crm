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
      artist_images: {
        Row: {
          artist_id: string
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          sort_order: number | null
        }
        Insert: {
          artist_id: string
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          sort_order?: number | null
        }
        Update: {
          artist_id?: string
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_images_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          artist_name: string | null
          artist_statement: string | null
          availability_status: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          created_by: string
          email: string | null
          exhibition_history: string | null
          facebook_profile: string | null
          first_name: string
          id: string
          instagram_handle: string | null
          insurance_value: number | null
          last_name: string
          medium: string[] | null
          nationality: string | null
          phone: string | null
          price_range: string | null
          shipping_preferences: string | null
          style_tags: string[] | null
          website: string | null
          whatsapp_number: string | null
        }
        Insert: {
          artist_name?: string | null
          artist_statement?: string | null
          availability_status?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          exhibition_history?: string | null
          facebook_profile?: string | null
          first_name: string
          id?: string
          instagram_handle?: string | null
          insurance_value?: number | null
          last_name: string
          medium?: string[] | null
          nationality?: string | null
          phone?: string | null
          price_range?: string | null
          shipping_preferences?: string | null
          style_tags?: string[] | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          artist_name?: string | null
          artist_statement?: string | null
          availability_status?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          exhibition_history?: string | null
          facebook_profile?: string | null
          first_name?: string
          id?: string
          instagram_handle?: string | null
          insurance_value?: number | null
          last_name?: string
          medium?: string[] | null
          nationality?: string | null
          phone?: string | null
          price_range?: string | null
          shipping_preferences?: string | null
          style_tags?: string[] | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          actual_amount: number | null
          category: string
          created_at: string
          description: string | null
          id: string
          planned_amount: number
          project_id: string
        }
        Insert: {
          actual_amount?: number | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          planned_amount: number
          project_id: string
        }
        Update: {
          actual_amount?: number | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          planned_amount?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "messaging_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "budget_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_participants_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "budget_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          categories: Json
          contingency_amount: number
          contingency_percentage: number
          created_at: string
          created_by: string
          currency: string
          description: string | null
          grand_total: number
          id: string
          project_id: string
          project_type: string
          title: string
          total_cost: number
          updated_at: string
        }
        Insert: {
          categories?: Json
          contingency_amount?: number
          contingency_percentage?: number
          created_at?: string
          created_by: string
          currency?: string
          description?: string | null
          grand_total?: number
          id?: string
          project_id: string
          project_type: string
          title: string
          total_cost?: number
          updated_at?: string
        }
        Update: {
          categories?: Json
          contingency_amount?: number
          contingency_percentage?: number
          created_at?: string
          created_by?: string
          currency?: string
          description?: string | null
          grand_total?: number
          id?: string
          project_id?: string
          project_type?: string
          title?: string
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "messaging_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_participants_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborator_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      collaborator_documents: {
        Row: {
          category_id: string | null
          collaborator_id: string
          created_at: string | null
          description: string | null
          document_type: string
          expires_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string
          id: string
          is_confidential: boolean | null
          mime_type: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          category_id?: string | null
          collaborator_id: string
          created_at?: string | null
          description?: string | null
          document_type: string
          expires_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          is_confidential?: boolean | null
          mime_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          category_id?: string | null
          collaborator_id?: string
          created_at?: string | null
          description?: string | null
          document_type?: string
          expires_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_confidential?: boolean | null
          mime_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborator_documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "collaborator_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborator_documents_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborator_documents_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "v_active_collaborators"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborators: {
        Row: {
          address: string | null
          archived_at: string | null
          bio: string | null
          category_id: string | null
          certifications: string[] | null
          city: string | null
          company: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          contract_type: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          daily_rate: number | null
          email: string | null
          facebook_profile: string | null
          full_name: string
          hourly_rate: number | null
          id: string
          instagram_handle: string | null
          languages: string[] | null
          linkedin_url: string | null
          mobile: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          preferred_contact_method: string | null
          profile_photo_url: string | null
          role: string | null
          skills: string[] | null
          specialization: string | null
          status: string | null
          tax_code: string | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          bio?: string | null
          category_id?: string | null
          certifications?: string[] | null
          city?: string | null
          company?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_type?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          daily_rate?: number | null
          email?: string | null
          facebook_profile?: string | null
          full_name: string
          hourly_rate?: number | null
          id?: string
          instagram_handle?: string | null
          languages?: string[] | null
          linkedin_url?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_contact_method?: string | null
          profile_photo_url?: string | null
          role?: string | null
          skills?: string[] | null
          specialization?: string | null
          status?: string | null
          tax_code?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          bio?: string | null
          category_id?: string | null
          certifications?: string[] | null
          city?: string | null
          company?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_type?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          daily_rate?: number | null
          email?: string | null
          facebook_profile?: string | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          instagram_handle?: string | null
          languages?: string[] | null
          linkedin_url?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_contact_method?: string | null
          profile_photo_url?: string | null
          role?: string | null
          skills?: string[] | null
          specialization?: string | null
          status?: string | null
          tax_code?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "collaborator_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived: boolean | null
          archived_at: string | null
          conversation_type: string | null
          created_at: string | null
          created_by: string | null
          id: string
          project_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          archived?: boolean | null
          archived_at?: string | null
          conversation_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          project_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          archived?: boolean | null
          archived_at?: string | null
          conversation_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          project_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "messaging_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_participants_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          change_note: string | null
          changed_by: string | null
          created_at: string | null
          data: Json
          document_id: string | null
          id: string
          version_number: number
        }
        Insert: {
          change_note?: string | null
          changed_by?: string | null
          created_at?: string | null
          data: Json
          document_id?: string | null
          id?: string
          version_number: number
        }
        Update: {
          change_note?: string | null
          changed_by?: string | null
          created_at?: string | null
          data?: Json
          document_id?: string | null
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "template_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      external_messages: {
        Row: {
          body: string
          channel: string
          created_at: string | null
          delivered_at: string | null
          direction: string
          error_code: string | null
          error_message: string | null
          external_id: string | null
          from: string
          id: string
          media_urls: string[] | null
          metadata: Json | null
          participant_id: string
          project_id: string
          read_at: string | null
          status: string
          to: string
          updated_at: string | null
        }
        Insert: {
          body: string
          channel: string
          created_at?: string | null
          delivered_at?: string | null
          direction: string
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          from: string
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          participant_id: string
          project_id: string
          read_at?: string | null
          status?: string
          to: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string | null
          delivered_at?: string | null
          direction?: string
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          from?: string
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          participant_id?: string
          project_id?: string
          read_at?: string | null
          status?: string
          to?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_messages_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "project_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "messaging_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "external_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_participants_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "external_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_status: {
        Row: {
          id: string
          message_id: string | null
          profile_id: string | null
          read_at: string | null
        }
        Insert: {
          id?: string
          message_id?: string | null
          profile_id?: string | null
          read_at?: string | null
        }
        Update: {
          id?: string
          message_id?: string | null
          profile_id?: string | null
          read_at?: string | null
        }
        Relationships: []
      }
      message_recipients: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          id: string
          message_id: string
          read_at: string | null
          recipient_participant_id: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          message_id: string
          read_at?: string | null
          recipient_participant_id: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          message_id?: string
          read_at?: string | null
          recipient_participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_recipients_recipient_participant_id_fkey"
            columns: ["recipient_participant_id"]
            isOneToOne: false
            referencedRelation: "project_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          content: string
          created_at: string
          favorite: string | null
          id: string
          name: string
          user_id: string
          variables: string[] | null
        }
        Insert: {
          content: string
          created_at?: string
          favorite?: string | null
          id?: string
          name: string
          user_id: string
          variables?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string
          favorite?: string | null
          id?: string
          name?: string
          user_id?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      message_threads: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participants: string[]
          subject: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participants: string[]
          subject: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participants?: string[]
          subject?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json | null
          channel: string | null
          content: string
          conversation_id: string
          created_at: string | null
          external_message_id: string | null
          external_status: string | null
          id: string
          metadata: Json | null
          sender_participant_id: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          channel?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          external_message_id?: string | null
          external_status?: string | null
          id?: string
          metadata?: Json | null
          sender_participant_id: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          channel?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          external_message_id?: string | null
          external_status?: string | null
          id?: string
          metadata?: Json | null
          sender_participant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_participant_id_fkey"
            columns: ["sender_participant_id"]
            isOneToOne: false
            referencedRelation: "project_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          categories: Json | null
          created_at: string
          email_notifications: boolean | null
          in_app_notifications: boolean | null
          notification_sound: boolean | null
          push_notifications: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          categories?: Json | null
          created_at?: string
          email_notifications?: boolean | null
          in_app_notifications?: boolean | null
          notification_sound?: boolean | null
          push_notifications?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          categories?: Json | null
          created_at?: string
          email_notifications?: boolean | null
          in_app_notifications?: boolean | null
          notification_sound?: boolean | null
          push_notifications?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          link: string | null
          message: string | null
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          link?: string | null
          message?: string | null
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          link?: string | null
          message?: string | null
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          archived_at: string | null
          bio: string | null
          category_id: string | null
          certifications: string[] | null
          city: string | null
          company: string | null
          company_name: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          contract_type: string | null
          country: string | null
          created_at: string | null
          curator_name: string | null
          daily_rate: number | null
          email: string | null
          facebook_profile: string | null
          hourly_rate: number | null
          id: string
          instagram_handle: string | null
          languages: string[] | null
          linkedin_url: string | null
          location: string | null
          mobile: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          profile_complete: boolean | null
          profile_photo_url: string | null
          skills: string[] | null
          specialization: string | null
          status: string | null
          tax_code: string | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          bio?: string | null
          category_id?: string | null
          certifications?: string[] | null
          city?: string | null
          company?: string | null
          company_name?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_type?: string | null
          country?: string | null
          created_at?: string | null
          curator_name?: string | null
          daily_rate?: number | null
          email?: string | null
          facebook_profile?: string | null
          hourly_rate?: number | null
          id: string
          instagram_handle?: string | null
          languages?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          profile_complete?: boolean | null
          profile_photo_url?: string | null
          skills?: string[] | null
          specialization?: string | null
          status?: string | null
          tax_code?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          bio?: string | null
          category_id?: string | null
          certifications?: string[] | null
          city?: string | null
          company?: string | null
          company_name?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_type?: string | null
          country?: string | null
          created_at?: string | null
          curator_name?: string | null
          daily_rate?: number | null
          email?: string | null
          facebook_profile?: string | null
          hourly_rate?: number | null
          id?: string
          instagram_handle?: string | null
          languages?: string[] | null
          linkedin_url?: string | null
          location?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          profile_complete?: boolean | null
          profile_photo_url?: string | null
          skills?: string[] | null
          specialization?: string | null
          status?: string | null
          tax_code?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          project_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          project_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          project_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "messaging_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_participants_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          folder: string | null
          id: string
          project_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          folder?: string | null
          id?: string
          project_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          folder?: string | null
          id?: string
          project_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "messaging_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_participants_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_participants: {
        Row: {
          added_at: string | null
          added_by: string | null
          display_name: string
          email: string | null
          facebook_profile: string | null
          id: string
          instagram_handle: string | null
          notes: string | null
          participant_id: string
          participant_type: string
          phone: string | null
          preferred_contact_method: string | null
          profile_photo_url: string | null
          project_id: string
          role_in_project: string | null
          whatsapp_number: string | null
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          display_name: string
          email?: string | null
          facebook_profile?: string | null
          id?: string
          instagram_handle?: string | null
          notes?: string | null
          participant_id: string
          participant_type: string
          phone?: string | null
          preferred_contact_method?: string | null
          profile_photo_url?: string | null
          project_id: string
          role_in_project?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          display_name?: string
          email?: string | null
          facebook_profile?: string | null
          id?: string
          instagram_handle?: string | null
          notes?: string | null
          participant_id?: string
          participant_type?: string
          phone?: string | null
          preferred_contact_method?: string | null
          profile_photo_url?: string | null
          project_id?: string
          role_in_project?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_participants_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "messaging_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_participants_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget_actual: number | null
          budget_planned: number | null
          created_at: string
          curator_id: string
          description: string | null
          end_date: string | null
          id: string
          project_name: string
          project_type: string | null
          start_date: string | null
          status: string | null
          venue_id: string | null
        }
        Insert: {
          budget_actual?: number | null
          budget_planned?: number | null
          created_at?: string
          curator_id: string
          description?: string | null
          end_date?: string | null
          id?: string
          project_name: string
          project_type?: string | null
          start_date?: string | null
          status?: string | null
          venue_id?: string | null
        }
        Update: {
          budget_actual?: number | null
          budget_planned?: number | null
          created_at?: string
          curator_id?: string
          description?: string | null
          end_date?: string | null
          id?: string
          project_name?: string
          project_type?: string | null
          start_date?: string | null
          status?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          search_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters: Json
          id?: string
          name: string
          search_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          search_type?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          checklist: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          order_index: number | null
          parent_task_id: string | null
          priority: string | null
          project_id: string
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          checklist?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          order_index?: number | null
          parent_task_id?: string | null
          priority?: string | null
          project_id: string
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          checklist?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          order_index?: number | null
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "messaging_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_participants_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      template_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      template_documents: {
        Row: {
          completed_at: string | null
          created_at: string | null
          data: Json
          id: string
          metadata: Json | null
          name: string
          signed_at: string | null
          status: string | null
          template_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          data: Json
          id?: string
          metadata?: Json | null
          name: string
          signed_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json
          id?: string
          metadata?: Json | null
          name?: string
          signed_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category_id: string | null
          content: Json
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          is_system: boolean | null
          last_used_at: string | null
          name: string
          search_vector: unknown
          tags: string[] | null
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          category_id?: string | null
          content: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_system?: boolean | null
          last_used_at?: string | null
          name: string
          search_vector?: unknown
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          category_id?: string | null
          content?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_system?: boolean | null
          last_used_at?: string | null
          name?: string
          search_vector?: unknown
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "template_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          conversation_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      venue_images: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          is_cover: boolean | null
          sort_order: number | null
          venue_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_cover?: boolean | null
          sort_order?: number | null
          venue_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_cover?: boolean | null
          sort_order?: number | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_images_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          accessibility_features: string | null
          additional_costs: string | null
          address: string | null
          amenities: string[] | null
          available_from: string | null
          available_to: string | null
          cancellation_policy: string | null
          capacity: number | null
          ceiling_height: number | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          created_by: string
          description: string | null
          email: string | null
          exhibition_space_sqm: number | null
          formatted_address: string | null
          house_rules: string | null
          id: string
          latitude: number | null
          longitude: number | null
          natural_light: boolean | null
          neighborhood: string | null
          number_of_rooms: number | null
          phone: string | null
          place_id: string | null
          postal_code: string | null
          pricing_model: string | null
          rating: number | null
          rental_fee: number | null
          reviews_count: number | null
          size_sqm: number | null
          social_media: Json | null
          technical_requirements: string | null
          updated_at: string | null
          venue_name: string
          venue_type: string | null
          website: string | null
        }
        Insert: {
          accessibility_features?: string | null
          additional_costs?: string | null
          address?: string | null
          amenities?: string[] | null
          available_from?: string | null
          available_to?: string | null
          cancellation_policy?: string | null
          capacity?: number | null
          ceiling_height?: number | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          email?: string | null
          exhibition_space_sqm?: number | null
          formatted_address?: string | null
          house_rules?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          natural_light?: boolean | null
          neighborhood?: string | null
          number_of_rooms?: number | null
          phone?: string | null
          place_id?: string | null
          postal_code?: string | null
          pricing_model?: string | null
          rating?: number | null
          rental_fee?: number | null
          reviews_count?: number | null
          size_sqm?: number | null
          social_media?: Json | null
          technical_requirements?: string | null
          updated_at?: string | null
          venue_name: string
          venue_type?: string | null
          website?: string | null
        }
        Update: {
          accessibility_features?: string | null
          additional_costs?: string | null
          address?: string | null
          amenities?: string[] | null
          available_from?: string | null
          available_to?: string | null
          cancellation_policy?: string | null
          capacity?: number | null
          ceiling_height?: number | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          email?: string | null
          exhibition_space_sqm?: number | null
          formatted_address?: string | null
          house_rules?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          natural_light?: boolean | null
          neighborhood?: string | null
          number_of_rooms?: number | null
          phone?: string | null
          place_id?: string | null
          postal_code?: string | null
          pricing_model?: string | null
          rating?: number | null
          rental_fee?: number | null
          reviews_count?: number | null
          size_sqm?: number | null
          social_media?: Json | null
          technical_requirements?: string | null
          updated_at?: string | null
          venue_name?: string
          venue_type?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      messaging_stats: {
        Row: {
          conversations_count: number | null
          last_message_at: string | null
          messages_count: number | null
          messages_last_month: number | null
          messages_last_week: number | null
          participants_count: number | null
          project_id: string | null
          project_name: string | null
        }
        Relationships: []
      }
      project_participants_stats: {
        Row: {
          artists_count: number | null
          collaborators_count: number | null
          curators_count: number | null
          project_id: string | null
          project_name: string | null
          total_participants: number | null
          venues_count: number | null
        }
        Relationships: []
      }
      templates_with_stats: {
        Row: {
          category_icon: string | null
          category_id: string | null
          category_name: string | null
          completed: number | null
          content: Json | null
          created_at: string | null
          description: string | null
          drafts: number | null
          id: string | null
          is_favorite: boolean | null
          is_system: boolean | null
          name: string | null
          search_vector: unknown
          signed: number | null
          tags: string[] | null
          total_documents: number | null
          updated_at: string | null
          user_id: string | null
          version: number | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "template_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      v_active_collaborators: {
        Row: {
          address: string | null
          archived_at: string | null
          bio: string | null
          category_color: string | null
          category_icon: string | null
          category_id: string | null
          category_name: string | null
          certifications: string[] | null
          city: string | null
          company: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          contract_type: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          daily_rate: number | null
          document_count: number | null
          email: string | null
          facebook_profile: string | null
          full_name: string | null
          hourly_rate: number | null
          id: string | null
          instagram_handle: string | null
          languages: string[] | null
          linkedin_url: string | null
          mobile: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          preferred_contact_method: string | null
          profile_photo_url: string | null
          role: string | null
          skills: string[] | null
          specialization: string | null
          status: string | null
          tax_code: string | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
          whatsapp_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "collaborator_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      v_collaborator_stats: {
        Row: {
          active_count: number | null
          archived_count: number | null
          avg_daily_rate: number | null
          avg_hourly_rate: number | null
          categories_used: number | null
          inactive_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      archive_collaborator: {
        Args: { collaborator_uuid: string }
        Returns: undefined
      }
      clean_old_typing_indicators: { Args: never; Returns: undefined }
      count_collaborators_by_category: {
        Args: never
        Returns: {
          category_name: string
          count: number
        }[]
      }
      get_document_stats: {
        Args: { p_user_id: string }
        Returns: {
          archived: number
          completed: number
          drafts: number
          signed: number
          total: number
        }[]
      }
      get_most_used_templates: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          category_name: string
          last_used_at: string
          template_id: string
          template_name: string
          usage_count: number
        }[]
      }
      get_participant_data: {
        Args: { p_id: string; p_type: string }
        Returns: {
          display_name: string
          email: string
          facebook_profile: string
          instagram_handle: string
          phone: string
          preferred_contact_method: string
          profile_photo_url: string
          whatsapp_number: string
        }[]
      }
      get_unread_messages_count: { Args: { user_id: string }; Returns: number }
      migrate_existing_participants: { Args: never; Returns: undefined }
      unarchive_collaborator: {
        Args: { collaborator_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      contact_method: "email" | "whatsapp" | "instagram" | "facebook" | "phone"
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
      contact_method: ["email", "whatsapp", "instagram", "facebook", "phone"],
    },
  },
} as const
