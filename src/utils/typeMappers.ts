// src/utils/typeMappers.ts
import type { Database } from '../lib/database.types';
import type {
  Template,
  TemplateContent,
} from '../types/template.types';
import type { Venue }    from '../types/venue';
import type { Artist }   from '../types/artist';
import type {
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  ChecklistItem,
} from '../types/project';
import type { Notification } from '../services/notifications.service';

type SupabaseNotification = Database['public']['Tables']['notifications']['Row'];

// =============================================================================
// HELPER
// =============================================================================

/** Converte un valore Json/unknown nel tipo T atteso */
function parseJson<T>(json: unknown): T {
  if (json === null || json === undefined) return {} as T;
  if (typeof json === 'string') {
    try   { return JSON.parse(json) as T; }
    catch { return json as unknown as T;  }
  }
  return json as T;
}

// =============================================================================
// TEMPLATE
// -----------------------------------------------------------------------------
// Schema reale confermato da information_schema:
//   id, category_id, name, description, tags, version (text),
//   is_public (bool, default true), is_active (bool), is_favorite (bool),
//   usage_count (int), content (jsonb),
//   created_by (uuid, nullable),
//   created_at, updated_at
//
// COLONNE ASSENTI nel DB: user_id, is_system
//   → is_system viene DERIVATO: is_public=true AND created_by=null
//   → I template del seed hanno created_by=null e is_public=true
// =============================================================================

export function mapTemplate(raw: any): Template {
  return {
    // ── Identificazione ──────────────────────────────────────────────────────
    id:          raw.id,
    category_id: raw.category_id,

    // ── Dati principali ──────────────────────────────────────────────────────
    name:        raw.name,
    description: raw.description ?? '',
    tags:        Array.isArray(raw.tags) ? raw.tags : [],
    version:     raw.version     ?? '1.0',   // text nel DB

    // ── Flag ─────────────────────────────────────────────────────────────────
    is_public:   raw.is_public   ?? false,
    is_active:   raw.is_active   ?? true,
    is_favorite: raw.is_favorite ?? false,

    // ── is_system: derivato, NON presente nel DB ──────────────────────────────
    // Template "di sistema" = pubblici e senza autore (seed)
    is_system: raw.is_public === true && (raw.created_by === null || raw.created_by === undefined),

    // ── Statistiche ──────────────────────────────────────────────────────────
    usage_count: raw.usage_count ?? 0,

    // ── Contenuto JSONB → TemplateContent ────────────────────────────────────
    content: parseJson<TemplateContent>(raw.content),

    // ── Autore: campo reale = created_by (NON user_id) ───────────────────────
    created_by: raw.created_by ?? null,

    // ── Categoria joinata ─────────────────────────────────────────────────────
    // Disponibile quando si usa .select('*, category:template_categories(*)')
    category:       raw.category        ?? null,
    category_name:  raw.category?.name  ?? '',
    category_icon:  raw.category?.icon  ?? '',
    category_color: raw.category?.color ?? '',

    // ── Timestamp ────────────────────────────────────────────────────────────
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  } as Template;
}

export function mapTemplates(rows: any[]): Template[] {
  return rows.map(mapTemplate);
}

// =============================================================================
// NOTIFICATION
// =============================================================================

export function mapNotification(data: SupabaseNotification): Notification {
  return {
    id:          data.id,
    user_id:     data.user_id,
    type:        data.type,
    title:       data.title,
    message:     data.description,
    description: data.description,
    read:        data.read,
    link:        data.link || undefined,
    metadata:    parseJson(data.metadata) || {},
    created_at:  data.created_at,
  } as Notification;
}

export function mapNotifications(data: SupabaseNotification[]): Notification[] {
  return data.map(mapNotification);
}

// =============================================================================
// TASK
// =============================================================================

export function mapTask(data: any): Task {
  return {
    id:             data.id,
    project_id:     data.project_id,
    title:          data.title,
    description:    data.description,
    status:         data.status   as TaskStatus,
    priority:       data.priority as TaskPriority,
    assigned_to:    data.assigned_to,
    created_by:     data.created_by,
    due_date:       data.due_date,
    created_at:     data.created_at,
    order_index:    data.order_index,
    parent_task_id: data.parent_task_id,
    checklist: Array.isArray(data.checklist)
      ? parseJson<ChecklistItem[]>(data.checklist)
      : [],
    project: data.project,
  } as Task;
}

export function mapTasks(data: any[]): Task[] {
  return data.map(mapTask);
}

// =============================================================================
// VENUE
// =============================================================================

export function mapVenue(data: any): Venue {
  console.log('🔄 Mapping venue:', data.venue_name);

  // Normalizza e ordina le immagini per sort_order
  const sortedImages = (data.images || [])
    .map((img: any) => ({
      id:            img.id,
      venue_id:      img.venue_id,
      image_url:     img.image_url,
      caption:       img.caption,
      sort_order:    img.sort_order    ?? 999,
      display_order: img.sort_order    ?? img.display_order ?? 999,
      created_at:    img.created_at,
    }))
    .sort((a: any, b: any) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

  console.log('  Images after sort:', sortedImages.map((img: any) => ({
    sort_order: img.sort_order,
    filename:   img.image_url.split('/app').pop(),
  })));

  return {
    ...data,
    social_media: typeof data.social_media === 'object' && data.social_media !== null
      ? parseJson<Record<string, string>>(data.social_media)
      : {},
    images: sortedImages,
  } as Venue;
}

export function mapVenues(data: any[]): Venue[] {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 MAPPING VENUES — total:', data.length);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const mapped = data.map(mapVenue);
  console.log('✅ Mapping complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  return mapped;
}

// =============================================================================
// ARTIST
// =============================================================================

export function mapArtist(data: any): Artist {
  return {
    ...data,
    facebook_url:       data.facebook_url       || '',
    education:          data.education          || '',
    awards_grants:      data.awards_grants      || '',
    publications_press: data.publications_press || '',
  } as Artist;
}

export function mapArtists(data: any[]): Artist[] {
  return data.map(mapArtist);
}

// =============================================================================
// PROJECT
// =============================================================================

export function mapProject(data: any): Project {
  return {
    ...data,
    project_type:   data.project_type   || 'exhibition',
    end_date:       data.end_date       || '',
    budget_planned: data.budget_planned || 0,
    budget_actual:  data.budget_actual  || 0,
  } as Project;
}

export function mapProjects(data: any[]): Project[] {
  return data.map(mapProject);
}