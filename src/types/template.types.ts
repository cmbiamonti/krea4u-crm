// src/types/template.types.ts

export type TemplateStatus = 'draft' | 'completed' | 'signed' | 'archived';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'email'
  | 'phone'
  | 'select'
  | 'checkbox'
  | 'currency'
  | 'section'
  | 'file'
  | 'signature'
  | 'radio';

// =============================================================================
// CATEGORIA
// Schema reale DB: id, name, description, icon, color, sort_order, is_active
// =============================================================================
export interface TemplateCategory {
  id:             string;
  name:           string;
  description:    string | null;
  icon:           string | null;
  color:          string | null;        // ✅ presente nel DB reale
  sort_order:     number;               // ✅ presente nel DB reale (era order_index)
  is_active:      boolean;              // ✅ presente nel DB reale
  created_at?:    string;
  updated_at?:    string;
  template_count?: number;             // calcolato, non nel DB
}

// =============================================================================
// VALIDAZIONE CAMPO
// =============================================================================
export interface FieldValidation {
  min?:       number;
  max?:       number;
  pattern?:   string;
  message?:   string;
  minLength?: number;
  maxLength?: number;
}

// =============================================================================
// CAMPO TEMPLATE
// =============================================================================
export interface TemplateField {
  id:           string;
  label:        string;
  type:         FieldType;
  required?:    boolean;
  placeholder?: string;
  options?:     string[];
  defaultValue?: any;
  validation?:  FieldValidation;
  helpText?:    string;
  conditional?: {
    field:    string;
    value:    any;
    operator: 'equals' | 'notEquals' | 'contains';
  };
}

// =============================================================================
// SEZIONE TEMPLATE
// =============================================================================
export interface TemplateSection {
  id:               string;
  title:            string;
  description?:     string;
  fields:           TemplateField[];
  collapsible?:     boolean;
  defaultExpanded?: boolean;
}

// =============================================================================
// CONTENUTO TEMPLATE (JSONB nel DB)
// =============================================================================
export interface TemplateContent {
  sections:      TemplateSection[];
  contract_text?: string;           // testo contratto con placeholder {{field_id}}
  pdf_header?: {
    title:     string;
    subtitle?: string;
    logo?:     string;
  };
  pdf_footer?: {
    text:               string;
    show_page_numbers:  boolean;
  };
}

// =============================================================================
// TEMPLATE
// -----------------------------------------------------------------------------
// Schema reale confermato da information_schema:
//   id (text), category_id (text), name (text), description (text nullable),
//   tags (text[]), version (text, default '1.0'),
//   is_public (bool, default true), is_active (bool), is_favorite (bool),
//   usage_count (int), content (jsonb),
//   created_by (uuid, nullable),   ← campo reale
//   created_at, updated_at
//
// COLONNE ASSENTI nel DB reale: user_id, is_system
//   → is_system è DERIVATO nel mapper: is_public=true AND created_by=null
// =============================================================================
export interface Template {
  id:           string;
  category_id:  string;

  // ✅ SCHEMA REALE: created_by (NON user_id)
  created_by:   string | null;

  name:         string;
  description:  string | null;
  content:      TemplateContent;
  tags:         string[];

  // ✅ version è TEXT nel DB ("1.0", "2.0"), non number
  version:      string;

  // ── Flag ──────────────────────────────────────────────────────────────────
  is_public:    boolean;
  is_active:    boolean;
  is_favorite:  boolean;

  // ✅ is_system NON esiste nel DB — derivato nel mapper
  // true quando: is_public=true AND created_by=null (template del seed)
  is_system:    boolean;

  // ── Statistiche ───────────────────────────────────────────────────────────
  usage_count:  number;
  last_used_at?: string | null;

  // ── Categoria joinata ─────────────────────────────────────────────────────
  // Popolata quando si usa .select('*, category:template_categories(*)')
  category?:       TemplateCategory | null;
  category_name:   string;
  category_icon:   string;
  category_color:  string;

  // ── Timestamp ─────────────────────────────────────────────────────────────
  created_at:  string;
  updated_at:  string;
}

// =============================================================================
// DOCUMENTO
// =============================================================================
export interface DocumentMetadata {
  project_id?:        string;
  artist_id?:         string;
  venue_id?:          string;
  contract_value?:    number;
  start_date?:        string;
  end_date?:          string;
  related_documents?: string[];
  custom_fields?:     Record<string, any>;
}

export interface TemplateDocument {
  id:           string;
  template_id:  string | null;
  user_id:      string;
  name:         string;
  status:       TemplateStatus;
  data:         Record<string, any>;
  metadata:     DocumentMetadata | null;
  created_at:   string;
  updated_at:   string;
  completed_at: string | null;
  signed_at:    string | null;
  signed_by?:   string | null;
  pdf_url?:     string | null;

  // Campi relazionali (join)
  template_name?:    string;
  template_content?: TemplateContent;
  category_name?:    string;
  category_icon?:    string;
  project?: {
    id:           string;
    project_name: string;
  };
  artist?: {
    id:         string;
    first_name: string;
    last_name:  string;
  };
  venue?: {
    id:         string;
    venue_name: string;
  };
}

// =============================================================================
// VERSIONE DOCUMENTO
// =============================================================================
export interface DocumentVersion {
  id:             string;
  document_id:    string;
  version_number: number;
  data:           Record<string, any>;
  changed_by:     string | null;
  change_note:    string | null;
  created_at:     string;
  changed_by_name?: string;
}

// =============================================================================
// STATISTICHE
// =============================================================================
export interface DocumentStats {
  total:      number;
  drafts:     number;
  completed:  number;
  signed:     number;
  archived:   number;
  by_category?: Record<string, number>;
  by_template?: Record<string, number>;
}

// =============================================================================
// DTOs
// =============================================================================
export interface CreateTemplateDTO {
  category_id:  string;
  name:         string;
  description?: string;
  content:      TemplateContent;
  tags?:        string[];
  is_favorite?: boolean;
}

export interface UpdateTemplateDTO {
  name?:        string;
  description?: string;
  content?:     TemplateContent;
  tags?:        string[];
  is_favorite?: boolean;
}

// ✅ Allineato allo schema reale di template_documents:
//    - RIMOSSI:  metadata (colonna non esistente nel DB)
//    - AGGIUNTI: template_name, template_version, description,
//                related_artist_id, related_venue_id, related_project_id
export interface CreateDocumentDTO {
  template_id:         string;
  name:                string;
  data:                Record<string, any>;
  status?:             TemplateStatus;

  // Denormalizzazione — se non passati vengono recuperati dal service
  template_name?:      string;
  template_version?:   string;

  // Campi opzionali presenti nel DB
  description?:        string;
  related_artist_id?:  string | null;
  related_venue_id?:   string | null;
  related_project_id?: string | null;
}

// ✅ Allineato allo schema reale:
//    - RIMOSSO:  metadata (colonna non esistente nel DB)
//    - AGGIUNTO: description, gestione timestamp stati via status
export interface UpdateDocumentDTO {
  name?:         string;
  status?:       TemplateStatus;
  data?:         Record<string, any>;
  description?:  string;
  change_note?:  string;           // per la cronologia in document_versions
}

export interface SignDocumentDTO {
  signed_by:       string;
  signature_data?: string;         // Base64 firma
}

export interface ExportPDFOptions {
  include_metadata?: boolean;
  watermark?:        string;
  header?:           string;
  footer?:           string;
}

// =============================================================================
// FILTRI
// =============================================================================
export interface TemplateFilters {
  category_id?: string;
  search?:      string;
  favorite?:    boolean;
  is_system?:   boolean;
  tags?:        string[];
}

export interface DocumentFilters {
  status?:      TemplateStatus;
  template_id?: string;
  category_id?: string;
  project_id?:  string;
  artist_id?:   string;
  venue_id?:    string;
  search?:      string;
  date_from?:   string;
  date_to?:     string;
  limit?:       number;
  offset?:      number;
}

// =============================================================================
// RESPONSE E ESTENSIONI
// =============================================================================
export interface PaginatedResponse<T> {
  data:     T[];
  total:    number;
  page:     number;
  pageSize: number;
  hasMore:  boolean;
}

export interface TemplateWithStats extends Template {
  stats: {
    total_documents: number;
    drafts:          number;
    completed:       number;
    signed:          number;
    last_used_at:    string | null;
  };
}