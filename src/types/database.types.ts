export interface EmailMessageRow {
  id: string
  user_id: string
  direction: 'inbound' | 'outbound'
  sender_email: string
  sender_name: string | null
  to_emails: string[]
  cc_emails: string[] | null
  bcc_emails: string[] | null
  subject: string
  body_html: string | null
  body_text: string | null
  thread_id: string | null
  in_reply_to: string | null
  references: string[] | null
  sendgrid_message_id: string | null
  sendgrid_status: string | null
  sendgrid_events: any | null
  attachments: any[] | null
  metadata: any | null
  read_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface EmailContactRow {
  id: string
  user_id: string
  email: string
  name: string | null
  avatar_url: string | null
  contact_count: number
  last_contacted_at: string | null
  metadata: any | null
  created_at: string
  updated_at: string
}

export interface EmailTemplateRow {
  id: string
  user_id: string
  name: string
  subject: string
  body_html: string | null
  body_text: string | null
  variables: string[] | null
  category: string | null
  is_active: boolean
  metadata: any | null
  created_at: string
  updated_at: string
}

export interface ProjectParticipant {
  id: string
  project_id: string
  participant_id: string
  participant_type: 'artist' | 'venue' | 'collaborator' | 'curator'
  role_in_project: string | null
  notes: string | null
  added_by: string | null
  
  // Dati denormalizzati
  display_name: string
  email: string | null
  phone: string | null
  profile_photo_url: string | null
  
  // Social/Comunicazione
  instagram_handle: string | null
  whatsapp_number: string | null
  facebook_profile: string | null
  
  // Preferenze
  preferred_contact_method: 'email' | 'phone' | 'whatsapp' | 'instagram' | 'facebook'
  
  // Metadata
  added_at: string
  updated_at: string
}

export interface AddParticipantInput {
  project_id: string
  participant_type: ParticipantType
  participant_id: string
  role_in_project?: string | null
  notes?: string | null
}

export type ParticipantType = 'artist' | 'venue' | 'collaborator' | 'curator'