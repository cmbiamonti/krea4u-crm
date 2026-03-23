// types/database.types.ts

// ============================================
// ENUMS & UTILITY TYPES
// ============================================
export type ParticipantType = 'curator' | 'artist' | 'venue' | 'collaborator';
export type CommunicationChannel = 'email' | 'whatsapp' | 'instagram' | 'facebook' | 'internal';
export type ContactMethod = 'email' | 'whatsapp' | 'instagram' | 'facebook' | 'phone';
export type ConversationType = 'general' | 'private' | 'announcement';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type ProjectStatus = 'draft' | 'planning' | 'active' | 'completed' | 'archived' | 'cancelled';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================
// DATABASE INTERFACE (Supabase Schema)
// ============================================
export interface Database {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string
          created_by: string
          first_name: string
          last_name: string
          artist_name: string | null
          email: string | null
          phone: string | null
          nationality: string | null
          city: string | null
          birth_date: string | null
          instagram_handle: string | null
          website: string | null
          bio: string | null
          artist_statement: string | null
          medium: string[] | null
          style_tags: string[] | null
          price_range: string | null
          availability_status: string | null
          shipping_preferences: string | null
          insurance_value: number | null
          exhibition_history: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['artists']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['artists']['Insert']>
      }
      venues: {
        Row: {
          id: string
          created_by: string
          venue_name: string
          venue_type: string | null
          address: string | null
          city: string | null
          contact_name: string | null
          email: string | null
          phone: string | null
          website: string | null
          size_sqm: number | null
          ceiling_height: number | null
          number_of_rooms: number | null
          amenities: string[] | null
          pricing_model: string | null
          rental_fee: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['venues']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['venues']['Insert']>
      }
      projects: {
        Row: {
          id: string
          curator_id: string
          project_name: string
          project_type: string | null
          status: string
          start_date: string | null
          end_date: string | null
          budget_planned: number | null
          budget_actual: number | null
          venue_id: string | null
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          assigned_to: string | null
          due_date: string | null
          priority: string
          status: string
          created_by: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      project_documents: {
        Row: {
          id: string
          project_id: string
          file_name: string
          file_url: string
          file_type: string | null
          file_size: number | null
          description: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['project_documents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['project_documents']['Insert']>
      }
      artist_images: {
        Row: {
          id: string
          artist_id: string
          image_url: string
          caption: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['artist_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['artist_images']['Insert']>
      }
      venue_images: {
        Row: {
          id: string
          venue_id: string
          image_url: string
          caption: string | null
          sort_order: number
          is_cover: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['venue_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['venue_images']['Insert']>
      }
      saved_searches: {
        Row: {
          id: string
          user_id: string
          name: string
          filters: any
          search_type: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['saved_searches']['Row'], 'id' | 'created_at'>
        Update: never
      }
      // ============================================
      // MESSAGING & COLLABORATION TABLES
      // ============================================
      profiles: {
        Row: {
          id: string
          profile_complete: boolean | null
          company_name: string | null
          bio: string | null
          location: string | null
          phone: string | null
          website: string | null
          instagram_handle: string | null
          whatsapp_number: string | null
          facebook_profile: string | null
          profile_photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      collaborators: {
        Row: {
          id: string
          full_name: string
          role: string | null
          email: string | null
          phone: string | null
          bio: string | null
          instagram_handle: string | null
          whatsapp_number: string | null
          facebook_profile: string | null
          profile_photo_url: string | null
          preferred_contact_method: ContactMethod | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['collaborators']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['collaborators']['Insert']>
      }
      project_participants: {
        Row: {
          id: string
          project_id: string
          participant_type: ParticipantType
          participant_id: string
          display_name: string
          email: string | null
          phone: string | null
          profile_photo_url: string | null
          preferred_contact_method: ContactMethod | null
          role_in_project: string | null
          notes: string | null
          added_by: string | null
          added_at: string
        }
        Insert: Omit<Database['public']['Tables']['project_participants']['Row'], 'id' | 'added_at'>
        Update: Partial<Database['public']['Tables']['project_participants']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          project_id: string
          title: string | null
          conversation_type: ConversationType
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_participant_id: string
          content: string
          channel: CommunicationChannel
          external_message_id: string | null
          external_status: MessageStatus | null
          metadata: Record<string, any>
          attachments: MessageAttachment[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      // ✅ AGGIUNGI: Tabella notifications
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'message' | 'task' | 'project' | 'mention'
          title: string
          message: string
          link: string | null
          read: boolean
          metadata: Record<string, any>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }

      // ✅ AGGIUNGI: Tabella message_templates
      message_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          content: string
          category: string | null
          favorite: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['message_templates']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['message_templates']['Insert']>
      }
      message_recipients: {
        Row: {
          id: string
          message_id: string
          recipient_participant_id: string
          read_at: string | null
          delivered_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['message_recipients']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['message_recipients']['Insert']>
      }
      template_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          id: string
          category_id: string
          user_id: string
          name: string
          description: string | null
          content: Json
          is_system: boolean
          is_favorite: boolean
          version: number
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          user_id: string
          name: string
          description?: string | null
          content: Json
          is_system?: boolean
          is_favorite?: boolean
          version?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          user_id?: string
          name?: string
          description?: string | null
          content?: Json
          is_system?: boolean
          is_favorite?: boolean
          version?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "template_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      template_documents: {
        Row: {
          id: string
          template_id: string | null
          user_id: string
          name: string
          status: string
          data: Json
          metadata: Json | null
          created_at: string
          updated_at: string
          completed_at: string | null
          signed_at: string | null
        }
        Insert: {
          id?: string
          template_id?: string | null
          user_id: string
          name: string
          status?: string
          data: Json
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          signed_at?: string | null
        }
        Update: {
          id?: string
          template_id?: string | null
          user_id?: string
          name?: string
          status?: string
          data?: Json
          metadata?: Json | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_documents_template_id_fkey"
            columns: ["template_id"]
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_documents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      document_versions: {
        Row: {
          id: string
          document_id: string
          version_number: number
          data: Json
          changed_by: string | null
          change_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          version_number: number
          data: Json
          changed_by?: string | null
          change_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          version_number?: number
          data?: Json
          changed_by?: string | null
          change_note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "template_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_changed_by_fkey"
            columns: ["changed_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_participant_data: {
        Args: {
          p_type: ParticipantType
          p_id: string
        }
        Returns: {
          display_name: string
          email: string | null
          phone: string | null
          instagram_handle: string | null
          whatsapp_number: string | null
          facebook_profile: string | null
          profile_photo_url: string | null
          preferred_contact_method: ContactMethod | null
        }[]
      }
    }
    Enums: {
      participant_type: ParticipantType
      communication_channel: CommunicationChannel
      contact_method: ContactMethod
      conversation_type: ConversationType
      message_status: MessageStatus
      project_status: ProjectStatus
      task_status: TaskStatus
      task_priority: TaskPriority
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ============================================
// TYPED INTERFACES (per applicazione)
// ============================================

export interface Profile {
  id: string;
  profile_complete: boolean | null;
  company_name: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  website: string | null;
  instagram_handle: string | null;
  whatsapp_number: string | null;
  facebook_profile: string | null;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Artist {
  id: string;
  created_by: string;
  first_name: string;
  last_name: string;
  artist_name: string | null;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  city: string | null;
  birth_date: string | null;
  instagram_handle: string | null;
  website: string | null;
  bio: string | null;
  artist_statement: string | null;
  medium: string[] | null;
  style_tags: string[] | null;
  price_range: string | null;
  availability_status: string | null;
  shipping_preferences: string | null;
  insurance_value: number | null;
  exhibition_history: string | null;
  created_at: string;
  // Computed/Virtual fields
  full_name?: string;
  preferred_contact_method?: ContactMethod;
  whatsapp_number?: string | null;
  facebook_profile?: string | null;
  profile_photo_url?: string | null;
}

export interface Venue {
  id: string;
  created_by: string;
  venue_name: string;
  venue_type: string | null;
  address: string | null;
  city: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  size_sqm: number | null;
  ceiling_height: number | null;
  number_of_rooms: number | null;
  amenities: string[] | null;
  pricing_model: string | null;
  rental_fee: number | null;
  created_at: string;
  // Computed/Virtual fields
  owner_name?: string | null;
  instagram_handle?: string | null;
  whatsapp_number?: string | null;
  facebook_profile?: string | null;
  preferred_contact_method?: ContactMethod;
  photo_url?: string | null;
}

export interface Collaborator {
  id: string;
  full_name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  instagram_handle: string | null;
  whatsapp_number: string | null;
  facebook_profile: string | null;
  profile_photo_url: string | null;
  preferred_contact_method: ContactMethod | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  curator_id: string;
  project_name: string;
  project_type: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  budget_planned: number | null;
  budget_actual: number | null;
  venue_id: string | null;
  description: string | null;
  created_at: string;
  // Relations (populated on demand)
  curator?: Profile;
  venue?: Venue;
  participants?: ProjectParticipant[];
  tasks?: Task[];
  documents?: ProjectDocument[];
  // Aliases
  title?: string; // alias for project_name
}

export interface ProjectParticipant {
  id: string;
  project_id: string;
  participant_type: ParticipantType;
  participant_id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  instagram_handle: string | null;
  whatsapp_number: string | null;
  facebook_profile: string | null;
  profile_photo_url: string | null;
  preferred_contact_method: ContactMethod | null;
  role_in_project: string | null;
  notes: string | null;
  added_by: string | null;
  added_at: string;
  // Relations (populated on demand)
  project?: Project;
  artist?: Artist;
  venue?: Venue;
  collaborator?: Collaborator;
  curator?: Profile;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_by: string;
  created_at: string;
  // Relations
  project?: Project;
  assigned_user?: ProjectParticipant;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  description: string | null;
  uploaded_by: string;
  created_at: string;
  // Relations
  project?: Project;
  uploader?: ProjectParticipant;
}

export interface Conversation {
  id: string;
  project_id: string;
  title: string | null;
  conversation_type: ConversationType;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  project?: Project;
  messages?: Message[];
}

export interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_participant_id: string;
  content: string;
  channel: CommunicationChannel;
  external_message_id: string | null;
  external_status: MessageStatus | null;
  metadata: Record<string, any>;
  attachments: MessageAttachment[];
  created_at: string;
  updated_at: string;
  // Relations
  conversation?: Conversation;
  sender?: ProjectParticipant;
  recipients?: MessageRecipient[];
}

export interface MessageRecipient {
  id: string;
  message_id: string;
  recipient_participant_id: string;
  read_at: string | null;
  delivered_at: string | null;
  created_at: string;
  // Relations
  message?: Message;
  recipient?: ProjectParticipant;
}

// ============================================
// INPUT TYPES (per operazioni)
// ============================================

export interface AddParticipantInput {
  project_id: string;
  participant_type: ParticipantType;
  participant_id: string;
  role_in_project?: string;
  notes?: string;
}

export interface SendMessageInput {
  conversation_id: string;
  content: string;
  channel?: CommunicationChannel;
  recipient_ids?: string[];
  attachments?: MessageAttachment[];
}

export interface CreateProjectInput {
  project_name: string;
  project_type?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget_planned?: number;
  venue_id?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectInput {
  project_name?: string;
  project_type?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget_planned?: number;
  budget_actual?: number;
  venue_id?: string;
  status?: ProjectStatus;
}

// ============================================
// UNIFIED TYPES (per UI)
// ============================================

export type UnifiedParticipant = 
  | { type: 'curator'; data: Profile }
  | { type: 'artist'; data: Artist }
  | { type: 'venue'; data: Venue }
  | { type: 'collaborator'; data: Collaborator };

// ============================================
// HELPER TYPES
// ============================================

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T];

export type InsertDto<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type UpdateDto<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

// ============================================
// TYPE GUARDS
// ============================================

export const isArtist = (participant: UnifiedParticipant): participant is { type: 'artist'; data: Artist } => {
  return participant.type === 'artist';
};

export const isVenue = (participant: UnifiedParticipant): participant is { type: 'venue'; data: Venue } => {
  return participant.type === 'venue';
};

export const isCurator = (participant: UnifiedParticipant): participant is { type: 'curator'; data: Profile } => {
  return participant.type === 'curator';
};

export const isCollaborator = (participant: UnifiedParticipant): participant is { type: 'collaborator'; data: Collaborator } => {
  return participant.type === 'collaborator';
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getParticipantDisplayName = (participant: ProjectParticipant): string => {
  return participant.display_name;
};

export const getParticipantContactInfo = (participant: ProjectParticipant): string | null => {
  const method = participant.preferred_contact_method;
  switch (method) {
    case 'email': return participant.email;
    case 'phone': return participant.phone;
    case 'whatsapp': return participant.whatsapp_number;
    case 'instagram': return participant.instagram_handle;
    case 'facebook': return participant.facebook_profile;
    default: return participant.email || participant.phone;
  }
};

export const getArtistFullName = (artist: Artist): string => {
  return artist.artist_name || `${artist.first_name} ${artist.last_name}`;
};

export const getProjectProgress = (project: Project): number => {
  if (!project.tasks || project.tasks.length === 0) return 0;
  const completedTasks = project.tasks.filter(t => t.status === 'done').length;
  return Math.round((completedTasks / project.tasks.length) * 100);
};

export const isProjectActive = (project: Project): boolean => {
  return project.status === 'active' || project.status === 'planning';
};

export const isMessageUnread = (recipient: MessageRecipient): boolean => {
  return recipient.read_at === null;
};