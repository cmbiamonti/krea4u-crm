// src/types/email.types.ts

export type EmailStatus =
  | 'draft'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'bounced'
  | 'pending'
  | 'queued'

export type EmailDirection = 'inbound' | 'outbound'

// ─────────────────────────────────────────────────────────────────────────────
// ALLEGATI
// Supporta sia allegati già salvati su storage (id + url)
// sia allegati nuovi serializzati in base64 dal composer
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailAttachment {
  // ── Allegato salvato (già presente nel DB / storage) ──────────────────────
  id?:           string
  filename:      string
  content_type:  string
  size:          number
  url?:          string          // URL pubblico se già caricato
  created_at?:   string

  // ── Allegato nuovo (dal composer, non ancora salvato) ─────────────────────
  // Serializzato in base64 per l'invio via API
  content?:      string          // base64 del file
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGGIO EMAIL
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailMessage {
  id: string

  // ── Autore (utente CRM che ha creato/inviato) ─────────────────────────────
  created_by_user_id:  string
  created_by_name?:    string
  created_by_email?:   string

  // ── Mittente visibile nell'email ──────────────────────────────────────────
  // Può differire dall'autore (es: noreply@dominio.com con Reply-To utente)
  sender_email:        string
  sender_name?:        string
  /** @deprecated Usa created_by_user_id */
  sender_user_id?:     string

  // ── Destinatari ───────────────────────────────────────────────────────────
  to_emails:    string[]
  cc_emails?:   string[]
  bcc_emails?:  string[]

  // ── Contenuto ─────────────────────────────────────────────────────────────
  subject:    string
  body_text:  string
  body_html?: string

  // ── Allegati ──────────────────────────────────────────────────────────────
  attachments?: EmailAttachment[]

  // ── Metadata ──────────────────────────────────────────────────────────────
  reply_to?:             string
  sendgrid_message_id?:  string
  thread_id?:            string
  status:                EmailStatus
  direction:             EmailDirection

  // ── Timestamps ────────────────────────────────────────────────────────────
  sent_at?:       string
  delivered_at?:  string
  opened_at?:     string
  read_at?:       string
  created_at:     string
  updated_at?:    string
  deleted_at?:    string
  archived_at?:   string
}

// ─────────────────────────────────────────────────────────────────────────────
// RICHIESTA INVIO EMAIL
// Usata da EmailComposer → EmailService.sendEmail()
// ─────────────────────────────────────────────────────────────────────────────

export interface SendEmailRequest {
  // ── Destinatari ───────────────────────────────────────────────────────────
  to:    string[]
  cc?:   string[]
  bcc?:  string[]

  // ── Contenuto ─────────────────────────────────────────────────────────────
  subject:    string
  body_text:  string
  html?:      string

  // ── Mittente ──────────────────────────────────────────────────────────────
  from?:          string    // email mittente (usa default app se omesso)
  sender_name?:   string    // nome visibile mittente
  reply_to?:      string    // email reply-to (di solito l'utente CRM)
  reply_to_name?: string    // nome reply-to

  // ── Thread ────────────────────────────────────────────────────────────────
  thread_id?: string

  // ── Allegati ──────────────────────────────────────────────────────────────
  // Supporta entrambi i formati:
  //   - EmailAttachment[] con content base64  (allegati nuovi dal composer)
  //   - EmailAttachment[] con url             (allegati già caricati)
  attachments?: EmailAttachment[]

  // ── Metadata autore ───────────────────────────────────────────────────────
  // Compilati automaticamente da EmailService prima dell'invio
  created_by_user_id?:  string
  created_by_name?:     string
  created_by_email?:    string
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTRI
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailFilters {
  direction?:  EmailDirection
  status?:     EmailStatus
  date_from?:  string
  date_to?:    string
  search?:     string
  limit?:      number
  offset?:     number
  folder?:     'inbox' | 'sent' | 'archived' | 'trash' | 'all'
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTATTI EMAIL
// Rubrica automatica basata sulla cronologia invii/ricezioni
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailContact {
  id:               string
  user_id:          string
  email:            string
  name?:            string
  contact_count:    number
  last_contact_at:  string
  created_at:       string
  updated_at?:      string
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE EMAIL
// Template riutilizzabili per invii frequenti
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailTemplate {
  id:         string
  user_id:    string
  name:       string
  subject:    string
  body_text:  string
  body_html?: string
  variables?: EmailVariable[]
  is_default?: boolean
  created_at:  string
  updated_at?: string
}

export interface EmailVariable {
  name:         string    // nome variabile (es: "nome_artista")
  placeholder:  string    // placeholder nel template (es: "{{nome_artista}}")
  description?: string    // descrizione per l'utente
  default?:     string    // valore di default
}

// ─────────────────────────────────────────────────────────────────────────────
// THREAD
// Raggruppamento messaggi per conversazione
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailThread {
  thread_id:        string
  subject:          string
  participants:     string[]
  message_count:    number
  last_message_at:  string
  messages:         EmailMessage[]
  unread_count?:    number
  is_archived?:     boolean
  archived_at?:     string
  is_deleted?:      boolean
  deleted_at?:      string
}

// ─────────────────────────────────────────────────────────────────────────────
// STATISTICHE
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailStats {
  total:      number
  sent:       number
  received:   number
  unread:     number
  archived:   number
  trash:      number
  bounced?:   number
  failed?:    number
  opened?:    number
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailRecipient {
  email:  string
  name?:  string
}

export interface EmailSendResult {
  success:     boolean
  message_id?: string
  thread_id?:  string
  error?:      string
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK SENDGRID
// Gestione eventi in entrata da SendGrid
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailWebhookEvent {
  event:
    | 'processed'
    | 'dropped'
    | 'delivered'
    | 'bounce'
    | 'open'
    | 'click'
    | 'spam'
    | 'unsubscribe'
    | 'deferred'
  email:          string
  timestamp:      number
  sg_event_id:    string
  sg_message_id:  string
  useragent?:     string
  ip?:            string
  url?:           string
  reason?:        string
  status?:        string    // codice errore SMTP per bounce
  attempt?:       string    // numero tentativo per deferred
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAFT (bozze salvate localmente)
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailDraft {
  id:          string          // uuid locale
  to:          string[]
  cc?:         string[]
  bcc?:        string[]
  subject:     string
  body:        string
  attachments: EmailAttachment[]
  saved_at:    string
  thread_id?:  string
}

// ─────────────────────────────────────────────────────────────────────────────
// OPZIONI COMPOSER
// Props aggiuntive per configurare il composer da codice
// ─────────────────────────────────────────────────────────────────────────────

export interface ComposerOptions {
  // Modalità composer
  mode?:             'new' | 'reply' | 'forward' | 'draft'

  // Dati iniziali
  initialTo?:        string[]
  initialCc?:        string[]
  initialSubject?:   string
  initialBody?:      string
  initialTemplate?:  EmailTemplate

  // Comportamento
  autoSaveDraft?:    boolean   // salva bozza ogni N secondi
  autoSaveInterval?: number    // ms, default 30000
  showCcByDefault?:  boolean
  showBccByDefault?: boolean
}