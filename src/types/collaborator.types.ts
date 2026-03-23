// src/types/collaborator.types.ts

export type CollaboratorStatus = 'active' | 'inactive' | 'archived';
export type ContractType = 'freelance' | 'employee' | 'consultant' | 'partner';
export type DocumentType = 'contract' | 'invoice' | 'certificate' | 'cv' | 'portfolio' | 'other';

export interface CollaboratorCategory {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Collaborator {
  id: string;
  category_id: string | null;
  
  // Campi base
  full_name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  bio: string | null;
  
  // Social
  instagram_handle: string | null;
  whatsapp_number: string | null;
  facebook_profile: string | null;
  linkedin_url: string | null;
  website: string | null;
  
  // Profilo
  profile_photo_url: string | null;
  preferred_contact_method: string | null;
  
  // Informazioni aziendali
  company: string | null;
  specialization: string | null;
  vat_number: string | null;
  tax_code: string | null;
  
  // Indirizzo
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  
  // Contratto
  contract_type: ContractType | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  hourly_rate: number | null;
  daily_rate: number | null;
  
  // Skills
  skills: string[] | null;
  languages: string[] | null;
  certifications: string[] | null;
  
  // Note
  notes: string | null;
  
  // Status
  status: CollaboratorStatus;
  archived_at: string | null;
  
  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Relazioni (opzionali, popolate con join)
  category?: CollaboratorCategory;
  documents?: CollaboratorDocument[];
}

export interface CollaboratorDocument {
  id: string;
  collaborator_id: string;
  category_id: string | null;
  document_type: DocumentType;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  uploaded_at: string;
  expires_at: string | null;
  tags: string[] | null;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCollaboratorDTO {
  category_id?: string | null;
  full_name: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  bio?: string | null;
  company?: string | null;
  specialization?: string | null;
  vat_number?: string | null;
  tax_code?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  instagram_handle?: string | null;
  facebook_profile?: string | null;
  whatsapp_number?: string | null;
  preferred_contact_method?: string | null;
  contract_type?: ContractType | null;
  contract_start_date?: string | null;
  contract_end_date?: string | null;
  hourly_rate?: number | null;
  daily_rate?: number | null;
  skills?: string[] | null;
  languages?: string[] | null;
  certifications?: string[] | null;
  notes?: string | null;
  profile_photo_url?: string | null;
  status?: CollaboratorStatus;
}

export interface UpdateCollaboratorDTO extends Partial<CreateCollaboratorDTO> {
  status?: CollaboratorStatus;
  archived_at?: string | null;
}

export interface CollaboratorFilters {
  category_id?: string;
  status?: CollaboratorStatus;
  role?: string;
  search?: string;
  contract_type?: ContractType;
}