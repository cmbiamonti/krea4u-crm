// types/project.ts

export const PROJECT_STATUS = {
  planning: 'In Pianificazione',
  active: 'Attivo',
  in_progress: 'In Corso',
  completed: 'Completato',
  on_hold: 'In Pausa',
  cancelled: 'Annullato',
  archived: 'Archiviato',
} as const

export const PROJECT_STATUS_CONFIG = [
  {
    value: 'planning',
    label: 'In Pianificazione',
    color: 'bg-blue-100 text-blue-800',
    icon: '📋',
  },
  {
    value: 'active',
    label: 'Attivo',
    color: 'bg-green-100 text-green-800',
    icon: '🚀',
  },
  {
    value: 'in_progress',
    label: 'In Corso',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⚙️',
  },
  {
    value: 'completed',
    label: 'Completato',
    color: 'bg-green-100 text-green-800',
    icon: '✅',
  },
  {
    value: 'on_hold',
    label: 'In Pausa',
    color: 'bg-gray-100 text-gray-800',
    icon: '⏸️',
  },
  {
    value: 'cancelled',
    label: 'Annullato',
    color: 'bg-red-100 text-red-800',
    icon: '❌',
  },
  {
    value: 'archived',
    label: 'Archiviato',
    color: 'bg-gray-100 text-gray-600',
    icon: '📦',
  },
]

export const PROJECT_TYPES = {
  solo_show: 'Mostra Personale',
  group_show: 'Mostra Collettiva',
  exhibition: 'Mostra',
  residency: 'Residenza',
  commission: 'Commissione',
  workshop: 'Workshop',
  performance: 'Performance',
  charity_event: 'Evento Benefico',
  collaboration: 'Collaborazione',
  consultation: 'Consulenza',
  custom: 'Personalizzato',
  other: 'Altro',
} as const

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
] as const

export const TASK_STATUS = {
  todo: 'Da fare',
  in_progress: 'In corso',
  done: 'Completato',
} as const

// ✅ PARTICIPANT TYPES
export const PARTICIPANT_TYPES = {
  curator: 'Curatore',
  artist: 'Artista',
  venue: 'Venue',
  collaborator: 'Collaboratore',
} as const

export type ParticipantType = keyof typeof PARTICIPANT_TYPES
export type ProjectStatus = keyof typeof PROJECT_STATUS
export type ProjectType = keyof typeof PROJECT_TYPES
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = keyof typeof TASK_STATUS

// ✅ INTERFACES BASE

export interface Artist {
  id: string
  first_name: string
  last_name: string
  artist_name: string | null
  email: string | null
  phone: string | null
  nationality: string | null
  city: string | null
  instagram_handle?: string | null
  website?: string | null
  bio?: string | null
}

export interface Venue {
  id: string
  venue_name: string
  city: string | null
  address?: string | null
  venue_type?: string | null
  contact_name?: string | null
  email?: string | null
  phone?: string | null
}

export interface Collaborator {
  id: string
  full_name: string
  role: string | null
  email: string | null
  phone: string | null
  bio?: string | null
}

export interface Profile {
  id: string
  company_name: string | null
  bio?: string | null
  location?: string | null
  phone?: string | null
  website?: string | null
}

// ✅ PROJECT PARTICIPANT (sostituisce project_artists)
export interface ProjectParticipant {
  id: string
  project_id: string
  participant_type: ParticipantType
  participant_id: string
  
  // Dati denormalizzati per performance
  display_name: string
  email: string | null
  phone: string | null
  instagram_handle: string | null
  whatsapp_number: string | null
  facebook_profile: string | null
  profile_photo_url: string | null
  preferred_contact_method: string | null
  
  // Ruolo nel progetto
  role_in_project: string | null
  notes: string | null
  
  added_by: string | null
  added_at: string
  
  // Relazioni opzionali (populate on demand)
  artist?: Artist
  venue?: Venue
  collaborator?: Collaborator
  curator?: Profile
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  assigned_to: string | null
  due_date: string | null
  priority: TaskPriority
  status: TaskStatus
  created_by: string
  created_at: string
  completed_at?: string | null
  order_index?: number
  checklist?: ChecklistItem[]
  assigned_user?: {
    id: string
    first_name: string
    last_name: string
  }
  project?: {
    project_name: string
  }
}

export interface ProjectFile {
  id: string
  project_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size?: number
  uploaded_by: string
  created_at: string
}

export interface ProjectMessage {
  id: string
  project_id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

export interface BudgetItem {
  id: string
  project_id: string
  category: string
  description?: string
  planned: number
  actual: number
  created_at: string
}

// ✅ PROJECT INTERFACE AGGIORNATA
export interface Project {
  id: string
  curator_id: string
  project_name: string
  project_type: ProjectType | string | null
  status: ProjectStatus | string
  start_date: string | null
  end_date: string | null
  budget_planned: number | null
  budget_actual: number | null
  venue_id: string | null
  description: string | null
  progress?: number
  created_at: string
  updated_at?: string
  archived?: boolean
  
  // Relazioni
  venue?: Venue
  curator?: Profile
  
  // ✅ NUOVO: participants invece di project_artists
  participants?: ProjectParticipant[]
  
  // ✅ DEPRECATO (mantieni per backward compatibility ma non usare)
  /** @deprecated Use participants instead */
  artists?: Artist[]
  /** @deprecated Use participants instead */
  project_artists?: Array<{
    artist: Artist
  }>
  
  // Altre relazioni
  tasks?: Task[]
  files?: ProjectFile[]
  budget_items?: BudgetItem[]
}

export interface ProjectDocument {
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

// ✅ MESSAGING TYPES (nuovi)
export interface Conversation {
  id: string
  project_id: string
  title: string | null
  conversation_type: 'general' | 'private' | 'announcement'
  created_by: string | null
  created_at: string
  updated_at: string
  project?: Project
}

export interface MessageAttachment {
  url: string
  type: string
  name: string
  size: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_participant_id: string
  content: string
  channel: 'email' | 'whatsapp' | 'instagram' | 'facebook' | 'internal'
  external_message_id: string | null
  external_status: 'sent' | 'delivered' | 'read' | 'failed' | null
  metadata: Record<string, any>
  attachments: MessageAttachment[]
  created_at: string
  updated_at: string
  
  sender?: ProjectParticipant
  recipients?: MessageRecipient[]
}

export interface MessageRecipient {
  id: string
  message_id: string
  recipient_participant_id: string
  read_at: string | null
  delivered_at: string | null
  created_at: string
  recipient?: ProjectParticipant
}

// ✅ UTILITY FUNCTIONS

export const getProjectStatusLabel = (status: string): string => {
  return PROJECT_STATUS[status as ProjectStatus] || status
}

export const getProjectTypeLabel = (type: string): string => {
  return PROJECT_TYPES[type as ProjectType] || type
}

export const getTaskPriorityLabel = (priority: string): string => {
  const found = TASK_PRIORITIES.find(p => p.value === priority)
  return found?.label || priority
}

export const getTaskStatusLabel = (status: string): string => {
  return TASK_STATUS[status as TaskStatus] || status
}

export const getParticipantTypeLabel = (type: string): string => {
  return PARTICIPANT_TYPES[type as ParticipantType] || type
}

export const getStatusColor = (status: string): string => {
  const config = PROJECT_STATUS_CONFIG.find(s => s.value === status)
  return config?.color || 'bg-gray-100 text-gray-800'
}

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: 'text-blue-600 bg-blue-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50',
  }
  return colors[priority] || 'text-gray-600 bg-gray-50'
}

export const calculateProjectProgress = (tasks: Task[]): number => {
  if (!tasks || tasks.length === 0) return 0
  const completedTasks = tasks.filter(t => t.status === 'done').length
  return Math.round((completedTasks / tasks.length) * 100)
}

// ✅ HELPER FUNCTIONS PER PARTICIPANTS

/**
 * Filtra i partecipanti per tipo
 */
export const getParticipantsByType = (
  participants: ProjectParticipant[] | undefined,
  type: ParticipantType
): ProjectParticipant[] => {
  return participants?.filter(p => p.participant_type === type) || []
}

/**
 * Ottieni tutti gli artisti di un progetto
 */
export const getProjectArtists = (project: Project): ProjectParticipant[] => {
  return getParticipantsByType(project.participants, 'artist')
}

/**
 * Ottieni il curatore di un progetto
 */
export const getProjectCurator = (project: Project): ProjectParticipant | undefined => {
  return project.participants?.find(p => p.participant_type === 'curator')
}

/**
 * Ottieni il venue di un progetto dai partecipanti
 */
export const getProjectVenueParticipant = (project: Project): ProjectParticipant | undefined => {
  return project.participants?.find(p => p.participant_type === 'venue')
}

/**
 * Conta partecipanti per tipo
 */
export const countParticipantsByType = (
  participants: ProjectParticipant[] | undefined,
  type: ParticipantType
): number => {
  return getParticipantsByType(participants, type).length
}

/**
 * Verifica se un partecipante è già nel progetto
 */
export const isParticipantInProject = (
  participants: ProjectParticipant[] | undefined,
  participantId: string,
  participantType: ParticipantType
): boolean => {
  return participants?.some(
    p => p.participant_id === participantId && p.participant_type === participantType
  ) || false
}

/**
 * Formatta il nome completo di un partecipante
 */
export const getParticipantFullName = (participant: ProjectParticipant): string => {
  return participant.display_name
}

/**
 * Ottieni l'icona per un tipo di partecipante
 */
export const getParticipantTypeIcon = (type: ParticipantType): string => {
  const icons: Record<ParticipantType, string> = {
    curator: '👤',
    artist: '🎨',
    venue: '🏛️',
    collaborator: '🤝',
  }
  return icons[type] || '👤'
}

/**
 * Ottieni il colore badge per un tipo di partecipante
 */
export const getParticipantTypeColor = (type: ParticipantType): string => {
  const colors: Record<ParticipantType, string> = {
    curator: 'bg-purple-100 text-purple-800',
    artist: 'bg-blue-100 text-blue-800',
    venue: 'bg-green-100 text-green-800',
    collaborator: 'bg-yellow-100 text-yellow-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

// ✅ VALIDATION HELPERS

export const isValidProjectStatus = (status: string): status is ProjectStatus => {
  return status in PROJECT_STATUS
}

export const isValidProjectType = (type: string): type is ProjectType => {
  return type in PROJECT_TYPES
}

export const isValidParticipantType = (type: string): type is ParticipantType => {
  return type in PARTICIPANT_TYPES
}

export const isValidTaskPriority = (priority: string): priority is TaskPriority => {
  return ['low', 'medium', 'high'].includes(priority)
}

export const isValidTaskStatus = (status: string): status is TaskStatus => {
  return status in TASK_STATUS
}