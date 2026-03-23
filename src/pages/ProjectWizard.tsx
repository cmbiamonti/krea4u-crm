// src/pages/ProjectWizard.tsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { TaskPriority, TaskStatus } from '@/types/project'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Building2,
  Users,
  MapPin,
  Tag,
  Loader2,
} from 'lucide-react'

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

type ProjectType =
  | 'solo_show'
  | 'group_show'
  | 'charity_event'
  | 'performance'
  | 'custom'

interface ProjectFormData {
  project_name:   string
  project_type:   ProjectType | null
  description:    string
  start_date:     string
  end_date:       string
  budget_planned: number | null
  venue_id:       string | null
  artist_ids:     string[]
}

// ✅ Colonne reali della tabella artists (verificate)
interface Artist {
  id:                string
  first_name:        string
  last_name:         string
  artist_name:       string | null
  nationality:       string | null
  city:              string | null
  email:             string | null
  phone:             string | null
  instagram_handle:  string | null
  whatsapp_number:   string | null   // ✅ esiste in artists
  facebook_profile:  string | null   // ✅ esiste in artists
  profile_photo_url: string | null
}

// ✅ Colonne reali della tabella venues
interface Venue {
  id:         string
  venue_name: string
  city:       string | null
  venue_type: string | null
  email:      string | null
  phone:      string | null
}

// ✅ Colonne reali della tabella profiles (NON ha first_name/last_name)
interface CuratorProfile {
  id:                string
  curator_name:      string | null   // ✅ colonna reale
  email:             string | null   // ✅ colonna reale
  phone:             string | null   // ✅ colonna reale
  profile_photo_url: string | null   // ✅ colonna reale
  instagram_handle:  string | null
  whatsapp_number:   string | null
  facebook_profile:  string | null
}

interface TaskTemplate {
  title:        string
  status:       TaskStatus
  priority:     TaskPriority
  description?: string
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

const PROJECT_TYPES: Array<{
  value: ProjectType
  label: string
  description: string
}> = [
  {
    value: 'solo_show',
    label: 'Mostra Personale',
    description: 'Esposizione dedicata a un singolo artista',
  },
  {
    value: 'group_show',
    label: 'Mostra Collettiva',
    description: 'Esposizione con più artisti',
  },
  {
    value: 'charity_event',
    label: 'Evento Benefico',
    description: 'Evento artistico per raccolta fondi',
  },
  {
    value: 'performance',
    label: 'Performance/Concerto',
    description: 'Evento performativo o musicale',
  },
  {
    value: 'custom',
    label: 'Personalizzato',
    description: 'Crea un progetto personalizzato',
  },
]

const TASK_TEMPLATES: Record<ProjectType, TaskTemplate[]> = {
  solo_show: [
    { title: 'Concept development',   status: 'todo', priority: 'high'   },
    { title: 'Artist contracting',    status: 'todo', priority: 'high'   },
    { title: 'Venue booking',         status: 'todo', priority: 'high'   },
    { title: 'Budget finalization',   status: 'todo', priority: 'medium' },
    { title: 'Artwork selection',     status: 'todo', priority: 'medium' },
    { title: 'Shipping arrangement',  status: 'todo', priority: 'medium' },
    { title: 'Insurance coverage',    status: 'todo', priority: 'medium' },
    { title: 'Press release',         status: 'todo', priority: 'medium' },
    { title: 'Invitations design',    status: 'todo', priority: 'low'    },
    { title: 'Social media campaign', status: 'todo', priority: 'low'    },
    { title: 'Installation',          status: 'todo', priority: 'high'   },
    { title: 'Opening reception',     status: 'todo', priority: 'high'   },
    { title: 'De-installation',       status: 'todo', priority: 'medium' },
    { title: 'Return shipping',       status: 'todo', priority: 'medium' },
    { title: 'Documentation',         status: 'todo', priority: 'low'    },
    { title: 'Thank you notes',       status: 'todo', priority: 'low'    },
  ],
  group_show: [
    { title: 'Concept development',    status: 'todo', priority: 'high'   },
    { title: 'Artists selection',      status: 'todo', priority: 'high'   },
    { title: 'Venue booking',          status: 'todo', priority: 'high'   },
    { title: 'Budget finalization',    status: 'todo', priority: 'medium' },
    { title: 'Artworks selection',     status: 'todo', priority: 'medium' },
    { title: 'Logistics coordination', status: 'todo', priority: 'medium' },
    { title: 'Marketing campaign',     status: 'todo', priority: 'medium' },
    { title: 'Installation',           status: 'todo', priority: 'high'   },
    { title: 'Opening event',          status: 'todo', priority: 'high'   },
    { title: 'De-installation',        status: 'todo', priority: 'medium' },
  ],
  charity_event: [
    { title: 'Define charity partner',   status: 'todo', priority: 'high'   },
    { title: 'Fundraising goal setting', status: 'todo', priority: 'high'   },
    { title: 'Artist recruitment',       status: 'todo', priority: 'high'   },
    { title: 'Venue booking',            status: 'todo', priority: 'high'   },
    { title: 'Sponsorship acquisition',  status: 'todo', priority: 'medium' },
    { title: 'Marketing & PR',           status: 'todo', priority: 'medium' },
    { title: 'Ticket sales setup',       status: 'todo', priority: 'medium' },
    { title: 'Event execution',          status: 'todo', priority: 'high'   },
    { title: 'Funds distribution',       status: 'todo', priority: 'high'   },
    { title: 'Thank you campaign',       status: 'todo', priority: 'low'    },
  ],
  performance: [
    { title: 'Artist booking',         status: 'todo', priority: 'high'   },
    { title: 'Venue booking',          status: 'todo', priority: 'high'   },
    { title: 'Technical requirements', status: 'todo', priority: 'high'   },
    { title: 'Sound check',            status: 'todo', priority: 'medium' },
    { title: 'Marketing campaign',     status: 'todo', priority: 'medium' },
    { title: 'Ticket sales',           status: 'todo', priority: 'medium' },
    { title: 'Event execution',        status: 'todo', priority: 'high'   },
    { title: 'Post-event cleanup',     status: 'todo', priority: 'low'    },
  ],
  custom: [
    { title: 'Planning',   status: 'todo', priority: 'medium' },
    { title: 'Execution',  status: 'todo', priority: 'medium' },
    { title: 'Completion', status: 'todo', priority: 'medium' },
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const map: Record<TaskPriority, string> = {
    high:   'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low:    'bg-green-100 text-green-700 border-green-200',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[priority]}`}>
      {priority}
    </span>
  )
}

// ── Venue Picker Dialog ──────────────────────────────────────────────────────
interface VenuePickerDialogProps {
  open:       boolean
  onClose:    () => void
  venues:     Venue[]
  loading:    boolean
  selectedId: string | null
  onSelect:   (id: string | null) => void
  onAddNew:   () => void
}

const VenuePickerDialog = ({
  open, onClose, venues, loading, selectedId, onSelect, onAddNew,
}: VenuePickerDialogProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-lg max-h-[80vh] flex flex-col gap-0">
      <DialogHeader className="pb-3">
        <DialogTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" />
          Seleziona Venue
        </DialogTitle>
      </DialogHeader>

      <div className="overflow-y-auto flex-1 space-y-2 pr-1 py-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
            <p className="text-sm text-gray-400">Caricamento venues...</p>
          </div>
        ) : (
          <>
            {/* TBD */}
            <button
              type="button"
              onClick={() => { onSelect(null); onClose() }}
              className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                selectedId === null
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Da Decidere (TBD)</p>
                  <p className="text-sm text-gray-500">Selezionerò il venue in seguito</p>
                </div>
                {selectedId === null && (
                  <Check className="h-5 w-5 text-blue-600 shrink-0" />
                )}
              </div>
            </button>

            {venues.length === 0 ? (
              <div className="text-center py-10">
                <Building2 className="h-10 w-10 mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-gray-400 font-medium">Nessun venue trovato</p>
                <p className="text-xs text-gray-400 mt-1">
                  Aggiungine uno con il pulsante qui sotto
                </p>
              </div>
            ) : (
              venues.map((venue) => (
                <button
                  key={venue.id}
                  type="button"
                  onClick={() => { onSelect(venue.id); onClose() }}
                  className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                    selectedId === venue.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{venue.venue_name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {venue.city && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />{venue.city}
                          </span>
                        )}
                        {venue.venue_type && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Tag className="h-3 w-3" />{venue.venue_type}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedId === venue.id && (
                      <Check className="h-5 w-5 text-blue-600 shrink-0" />
                    )}
                  </div>
                </button>
              ))
            )}
          </>
        )}
      </div>

      <div className="pt-3 border-t mt-1">
        <Button variant="outline" className="w-full" onClick={onAddNew}>
          + Aggiungi Nuovo Venue
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)

// ── Artist Picker Dialog ─────────────────────────────────────────────────────
interface ArtistPickerDialogProps {
  open:        boolean
  onClose:     () => void
  artists:     Artist[]
  loading:     boolean
  selectedIds: string[]
  onToggle:    (id: string) => void
  onAddNew:    () => void
}

const ArtistPickerDialog = ({
  open, onClose, artists, loading, selectedIds, onToggle, onAddNew,
}: ArtistPickerDialogProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-lg max-h-[80vh] flex flex-col gap-0">
      <DialogHeader className="pb-3">
        <DialogTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Seleziona Artisti
        </DialogTitle>
      </DialogHeader>

      {selectedIds.length > 0 && (
        <p className="text-sm text-blue-600 font-medium pb-2">
          {selectedIds.length} artista{selectedIds.length > 1 ? 'i' : ''}{' '}
          selezionato{selectedIds.length > 1 ? 'i' : ''}
        </p>
      )}

      <div className="overflow-y-auto flex-1 space-y-2 pr-1 py-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
            <p className="text-sm text-gray-400">Caricamento artisti...</p>
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-10">
            <Users className="h-10 w-10 mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400 font-medium">Nessun artista trovato</p>
            <p className="text-xs text-gray-400 mt-1">
              Aggiungine uno con il pulsante qui sotto
            </p>
          </div>
        ) : (
          artists.map((artist) => {
            const isSelected = selectedIds.includes(artist.id)
            return (
              <button
                key={artist.id}
                type="button"
                onClick={() => onToggle(artist.id)}
                className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {artist.first_name} {artist.last_name}
                    </p>
                    {artist.artist_name && (
                      <p className="text-sm text-gray-600 italic">
                        "{artist.artist_name}"
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {artist.city && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />{artist.city}
                        </span>
                      )}
                      {artist.nationality && (
                        <span className="text-xs text-gray-500">
                          {artist.nationality}
                        </span>
                      )}
                    </div>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => {}}
                    className="pointer-events-none shrink-0"
                  />
                </div>
              </button>
            )
          })
        )}
      </div>

      <div className="pt-3 border-t mt-1 space-y-2">
        <Button className="w-full" onClick={onClose}>
          Conferma selezione
          {selectedIds.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-white text-blue-600">
              {selectedIds.length}
            </Badge>
          )}
        </Button>
        <Button variant="outline" className="w-full" onClick={onAddNew}>
          + Aggiungi Nuovo Artista
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPALE
// ════════════════════════════════════════════════════════════════════════════
export default function ProjectWizard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading]         = useState(false)

  const [formData, setFormData] = useState<ProjectFormData>({
    project_name:   '',
    project_type:   null,
    description:    '',
    start_date:     '',
    end_date:       '',
    budget_planned: null,
    venue_id:       null,
    artist_ids:     [],
  })

  const [artists, setArtists]               = useState<Artist[]>([])
  const [venues, setVenues]                 = useState<Venue[]>([])
  const [loadingVenues, setLoadingVenues]   = useState(false)
  const [loadingArtists, setLoadingArtists] = useState(false)
  const [selectedTasks, setSelectedTasks]   = useState<TaskTemplate[]>([])

  const [venueDialogOpen, setVenueDialogOpen]   = useState(false)
  const [artistDialogOpen, setArtistDialogOpen] = useState(false)

  const totalSteps = 5

  // ── Carica dati al cambio step ────────────────────────────────────────────
  useEffect(() => {
    if (currentStep === 3) fetchVenues()
  }, [currentStep])

  useEffect(() => {
    if (currentStep === 4) fetchArtists()
  }, [currentStep])

  useEffect(() => {
    if (currentStep === 5 && formData.project_type) {
      setSelectedTasks(TASK_TEMPLATES[formData.project_type] || [])
    }
  }, [currentStep])

  // ── Fetch venues ──────────────────────────────────────────────────────────
  const fetchVenues = async () => {
    if (!user?.id) return
    setLoadingVenues(true)
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id, venue_name, city, venue_type, email, phone')
        .eq('created_by', user.id)
        .order('venue_name', { ascending: true })

      if (error) throw error
      setVenues((data as unknown as Venue[]) ?? [])
      logger.log('✅ Venues loaded:', data?.length ?? 0)
    } catch (err) {
      logger.error('❌ fetchVenues error:', err)
      toast.error('Errore nel caricamento dei venues')
    } finally {
      setLoadingVenues(false)
    }
  }

  // ── Fetch artisti ─────────────────────────────────────────────────────────
  // ✅ Usa SOLO colonne verificate dalla tabella artists
  const fetchArtists = async () => {
    if (!user?.id) return
    setLoadingArtists(true)
    try {
      const { data, error } = await supabase
        .from('artists')
        .select(`
          id,
          first_name,
          last_name,
          artist_name,
          nationality,
          city,
          email,
          phone,
          instagram_handle,
          whatsapp_number,
          facebook_profile,
          profile_photo_url
        `)
        .eq('created_by', user.id)
        .order('last_name', { ascending: true })

      if (error) throw error
      setArtists((data as unknown as Artist[]) ?? [])
      logger.log('✅ Artists loaded:', data?.length ?? 0)
    } catch (err) {
      logger.error('❌ fetchArtists error:', err)
      toast.error('Errore nel caricamento degli artisti')
    } finally {
      setLoadingArtists(false)
    }
  }

  // ── Fetch profilo curatore ────────────────────────────────────────────────
  // ✅ Usa SOLO colonne verificate dalla tabella profiles
  // profiles NON ha first_name/last_name → usa curator_name
  const getCuratorProfile = async (
    userId: string
  ): Promise<CuratorProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          curator_name,
          email,
          phone,
          profile_photo_url,
          instagram_handle,
          whatsapp_number,
          facebook_profile
        `)
        .eq('id', userId)
        .single()

      if (error) {
        logger.warn('⚠️ getCuratorProfile error (non-critical):', error.message)
        return null
      }
      return data as CuratorProfile
    } catch {
      return null
    }
  }

  // ── Navigazione ───────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentStep === 1 && !formData.project_type) {
      toast.error('Seleziona un tipo di progetto')
      return
    }
    if (currentStep === 2 && !formData.project_name.trim()) {
      toast.error('Il nome del progetto è obbligatorio')
      return
    }
    if (currentStep < totalSteps) setCurrentStep((s) => s + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  const toggleArtist = (artistId: string) => {
    setFormData((prev) => ({
      ...prev,
      artist_ids: prev.artist_ids.includes(artistId)
        ? prev.artist_ids.filter((id) => id !== artistId)
        : [...prev.artist_ids, artistId],
    }))
  }

  const selectedVenue = venues.find((v) => v.id === formData.venue_id) ?? null

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Devi essere autenticato')
      return
    }
    setLoading(true)
    logger.log('🚀 ProjectWizard: Creating project...')

    try {
      // ── 1. Crea il progetto ──────────────────────────────────────────────
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          curator_id:     user.id,
          project_name:   formData.project_name,
          project_type:   formData.project_type || 'custom',
          description:    formData.description  || null,
          start_date:     formData.start_date   || null,
          end_date:       formData.end_date      || null,
          budget_planned: formData.budget_planned,
          venue_id:       formData.venue_id,
          status:         'planning',
        } as any)
        .select()
        .single()

      if (projectError) throw projectError

      const projectId = (project as any)?.id
      if (!projectId) throw new Error('Project ID not found after insert')

      logger.log('✅ Project created with ID:', projectId)

      // ── 2. Curatore come partecipante ────────────────────────────────────
      // ✅ profiles.curator_name è la colonna corretta (non first_name)
      const curatorProfile = await getCuratorProfile(user.id)

      const curatorDisplayName =
        curatorProfile?.curator_name?.trim() ||
        user.email ||
        'Curatore'

      const { error: curatorError } = await supabase
        .from('project_participants')
        .insert({
          project_id:        projectId,
          participant_type:  'curator',
          participant_id:    user.id,
          display_name:      curatorDisplayName,               // ✅ NOT NULL
          email:             curatorProfile?.email             ?? user.email ?? null,
          phone:             curatorProfile?.phone             ?? null,
          profile_photo_url: curatorProfile?.profile_photo_url ?? null,
          instagram_handle:  curatorProfile?.instagram_handle  ?? null,
          whatsapp_number:   curatorProfile?.whatsapp_number   ?? null,
          facebook_profile:  curatorProfile?.facebook_profile  ?? null,
          role_in_project:   'Curatore Principale',
          added_by:          user.id,
        } as any)

      if (curatorError) {
        logger.error('❌ Error adding curator participant:', curatorError)
      } else {
        logger.log('✅ Curator added as participant:', curatorDisplayName)
      }

      // ── 3. Artisti come partecipanti ─────────────────────────────────────
      if (formData.artist_ids.length > 0) {
        logger.log('👥 Adding artists:', formData.artist_ids.length)

        // Usa state; fallback fetch diretto se vuoto
        let artistsToInsert = artists.filter((a) =>
          formData.artist_ids.includes(a.id)
        )

        if (artistsToInsert.length === 0) {
          logger.warn('⚠️ Artists state empty — fetching directly')
          const { data: freshData, error: fetchErr } = await supabase
            .from('artists')
            .select(`
              id,
              first_name,
              last_name,
              artist_name,
              nationality,
              city,
              email,
              phone,
              instagram_handle,
              whatsapp_number,
              facebook_profile,
              profile_photo_url
            `)
            .in('id', formData.artist_ids)

          if (fetchErr) {
            logger.error('❌ Fallback fetch artists error:', fetchErr)
          } else {
            // ✅ cast via unknown → Artist[]
            artistsToInsert = (freshData as unknown as Artist[]) ?? []
          }
        }

        if (artistsToInsert.length > 0) {
          const artistParticipants = artistsToInsert.map((artist) => {
            // ✅ display_name NOT NULL: artist_name ?? "nome cognome"
            const displayName =
              artist.artist_name?.trim() ||
              `${artist.first_name} ${artist.last_name}`.trim() ||
              'Artista'

            return {
              project_id:        projectId,
              participant_type:  'artist',
              participant_id:    artist.id,
              display_name:      displayName,               // ✅ NOT NULL
              email:             artist.email             ?? null,
              phone:             artist.phone             ?? null,
              instagram_handle:  artist.instagram_handle  ?? null,
              whatsapp_number:   artist.whatsapp_number   ?? null, // ✅ esiste
              facebook_profile:  artist.facebook_profile  ?? null, // ✅ esiste
              profile_photo_url: artist.profile_photo_url ?? null,
              role_in_project:   'Artista',
              added_by:          user.id,
            }
          })

          const { error: artistsError } = await supabase
            .from('project_participants')
            .insert(artistParticipants as any)

          if (artistsError) {
            logger.error('❌ Error adding artist participants:', artistsError)
            toast.error(
              'Attenzione: alcuni artisti potrebbero non essere stati aggiunti'
            )
          } else {
            logger.log(
              `✅ ${artistParticipants.length} artisti aggiunti:`,
              artistParticipants.map((a) => a.display_name)
            )
          }
        }
      }

      // ── 4. Venue come partecipante ───────────────────────────────────────
      if (formData.venue_id) {
        let venueToInsert = venues.find((v) => v.id === formData.venue_id)

        if (!venueToInsert) {
          logger.warn('⚠️ Venue state empty — fetching directly')
          const { data: freshVenue, error: fetchErr } = await supabase
            .from('venues')
            .select('id, venue_name, city, venue_type, email, phone')
            .eq('id', formData.venue_id)
            .single()

          if (fetchErr) {
            logger.error('❌ Fallback fetch venue error:', fetchErr)
          } else {
            venueToInsert = freshVenue as unknown as Venue
          }
        }

        if (venueToInsert) {
          const { error: venueError } = await supabase
            .from('project_participants')
            .insert({
              project_id:       projectId,
              participant_type: 'venue',
              participant_id:   venueToInsert.id,
              display_name:     venueToInsert.venue_name,   // ✅ NOT NULL
              email:            venueToInsert.email ?? null,
              phone:            venueToInsert.phone ?? null,
              instagram_handle: null,
              whatsapp_number:  null,
              facebook_profile: null,
              role_in_project:  'Venue',
              added_by:         user.id,
            } as any)

          if (venueError) {
            logger.error('❌ Error adding venue participant:', venueError)
          } else {
            logger.log('✅ Venue added as participant:', venueToInsert.venue_name)
          }
        }
      }

      // ── 5. Tasks ─────────────────────────────────────────────────────────
      if (selectedTasks.length > 0) {
        const { error: tasksError } = await supabase
          .from('tasks')
          .insert(
            selectedTasks.map((task) => ({
              project_id:  projectId,
              title:       task.title       || '',
              description: task.description || null,
              priority:    task.priority    || 'medium',
              status:      task.status      || 'todo',
              assigned_to: null,
              created_by:  user.id,
            })) as any
          )

        if (tasksError) {
          logger.error('❌ Error creating tasks:', tasksError)
          toast.warning(
            'Progetto creato, ma alcuni tasks potrebbero non essere stati aggiunti'
          )
        } else {
          logger.log('✅ Tasks created:', selectedTasks.length)
        }
      }

      toast.success('Progetto creato con successo!')
      navigate(`/app/projects/${projectId}`)
    } catch (error: any) {
      logger.error('❌ Critical error creating project:', error)
      toast.error(error.message || 'Errore nella creazione del progetto')
    } finally {
      setLoading(false)
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="p-8">

        {/* ── Progress Bar ──────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step < currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : step === currentStep
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {step < currentStep ? <Check className="h-5 w-5" /> : step}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Step Content ──────────────────────────────────────────────────── */}
        <div className="min-h-[400px]">

          {/* Step 1 — Tipo Progetto */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Tipo di Progetto</h2>
                <p className="text-gray-500">
                  Seleziona il tipo di progetto che vuoi creare
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {PROJECT_TYPES.map((type) => (
                  <Card
                    key={type.value}
                    className={`p-4 cursor-pointer transition-all ${
                      formData.project_type === type.value
                        ? 'border-blue-500 border-2 bg-blue-50'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, project_type: type.value })
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{type.label}</h3>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                      {formData.project_type === type.value && (
                        <Check className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Info Base */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Informazioni Base</h2>
                <p className="text-gray-500">
                  Inserisci i dettagli principali del progetto
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project_name">Nome Progetto *</Label>
                  <Input
                    id="project_name"
                    value={formData.project_name}
                    onChange={(e) =>
                      setFormData({ ...formData, project_name: e.target.value })
                    }
                    placeholder="Es: Mostra d'Arte Contemporanea 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrivi il progetto, obiettivi, tema..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Data Inizio</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Data Fine</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="budget">Budget Pianificato (€)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget_planned || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget_planned: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Venue */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Seleziona Venue</h2>
                <p className="text-gray-500">
                  Scegli dove si svolgerà il progetto (opzionale)
                </p>
              </div>

              {/* Anteprima venue selezionata */}
              <div
                className={`rounded-xl border-2 p-5 flex items-center justify-between transition-all ${
                  formData.venue_id === null
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-blue-400 bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2
                    className={`h-8 w-8 shrink-0 ${
                      formData.venue_id === null ? 'text-gray-300' : 'text-blue-500'
                    }`}
                  />
                  <div>
                    {formData.venue_id === null ? (
                      <>
                        <p className="font-semibold text-gray-500">Da Decidere (TBD)</p>
                        <p className="text-xs text-gray-400">Nessun venue selezionato</p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-gray-800">
                          {selectedVenue?.venue_name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {selectedVenue?.city && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />{selectedVenue.city}
                            </span>
                          )}
                          {selectedVenue?.venue_type && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Tag className="h-3 w-3" />{selectedVenue.venue_type}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {formData.venue_id !== null && (
                  <button
                    type="button"
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => setFormData({ ...formData, venue_id: null })}
                    title="Rimuovi selezione"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1" onClick={() => setVenueDialogOpen(true)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  {formData.venue_id === null ? 'Scegli Venue' : 'Cambia Venue'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    localStorage.setItem('projectWizardDraft', JSON.stringify(formData))
                    navigate('/app/venues/new')
                  }}
                >
                  + Aggiungi Nuovo Venue
                </Button>
              </div>

              <VenuePickerDialog
                open={venueDialogOpen}
                onClose={() => setVenueDialogOpen(false)}
                venues={venues}
                loading={loadingVenues}
                selectedId={formData.venue_id}
                onSelect={(id) => setFormData({ ...formData, venue_id: id })}
                onAddNew={() => {
                  setVenueDialogOpen(false)
                  localStorage.setItem('projectWizardDraft', JSON.stringify(formData))
                  navigate('/app/venues/new')
                }}
              />
            </div>
          )}

          {/* Step 4 — Artisti */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Seleziona Artisti</h2>
                <p className="text-gray-500">
                  Scegli gli artisti che parteciperanno (opzionale)
                </p>
              </div>

              {formData.artist_ids.length > 0 ? (
                <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-4">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">
                    Artisti selezionati ({formData.artist_ids.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.artist_ids.map((artistId) => {
                      const artist = artists.find((a) => a.id === artistId)
                      if (!artist) return null
                      return (
                        <Badge
                          key={artistId}
                          variant="secondary"
                          className="pl-3 pr-1 py-1.5 bg-white border border-blue-200 text-gray-700"
                        >
                          <span className="mr-1">
                            {artist.first_name} {artist.last_name}
                          </span>
                          <button
                            type="button"
                            className="ml-1 rounded-full hover:bg-red-100 p-0.5 transition-colors"
                            onClick={() => toggleArtist(artistId)}
                          >
                            <X className="h-3 w-3 text-gray-500 hover:text-red-500" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                  <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Nessun artista selezionato</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1" onClick={() => setArtistDialogOpen(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  {formData.artist_ids.length === 0
                    ? 'Scegli Artisti'
                    : 'Modifica Selezione'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    localStorage.setItem('projectWizardDraft', JSON.stringify(formData))
                    navigate('/app/artists/new')
                  }}
                >
                  + Aggiungi Nuovo Artista
                </Button>
              </div>

              <ArtistPickerDialog
                open={artistDialogOpen}
                onClose={() => setArtistDialogOpen(false)}
                artists={artists}
                loading={loadingArtists}
                selectedIds={formData.artist_ids}
                onToggle={toggleArtist}
                onAddNew={() => {
                  setArtistDialogOpen(false)
                  localStorage.setItem('projectWizardDraft', JSON.stringify(formData))
                  navigate('/app/artists/new')
                }}
              />
            </div>
          )}

          {/* Step 5 — Tasks */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Tasks Template</h2>
                <p className="text-gray-500">
                  Tasks predefiniti per questo tipo di progetto.
                  Puoi modificarli dopo la creazione.
                </p>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {selectedTasks.map((task, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={true}
                        onCheckedChange={(checked: boolean) => {
                          if (!checked) {
                            setSelectedTasks((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                        }}
                      />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <div className="flex gap-2 mt-1">
                          <PriorityBadge priority={task.priority} />
                          <Badge variant="secondary" className="text-xs">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <p className="text-sm text-gray-500 text-center">
                ℹ️ Potrai aggiungere, modificare ed eliminare i tasks
                dopo la creazione del progetto
              </p>
            </div>
          )}
        </div>

        {/* ── Navigation ────────────────────────────────────────────────────── */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext} disabled={loading}>
              Avanti
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creazione...
                </>
              ) : (
                <>
                  Crea Progetto
                  <Check className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}