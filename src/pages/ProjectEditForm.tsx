// src/pages/ProjectEditForm.tsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  ArrowLeft, Save, Loader2, Search,
  MapPin, X, Plus, Building2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

// ── Tipi ─────────────────────────────────────────────────────────────────────

interface Project {
  id: string
  curator_id: string
  project_name: string
  project_type: string | null
  description: string | null
  start_date: string | null
  end_date: string | null
  budget_planned: number | null
  budget_actual: number | null
  status: 'draft' | 'planning' | 'active' | 'completed' | 'archived'
  venue_id: string | null
  created_at: string
}

interface ProjectFormData {
  project_name: string
  project_type: string
  description: string
  start_date: string
  end_date: string
  budget_planned: number | null
  budget_actual: number | null
  status: 'draft' | 'planning' | 'active' | 'completed' | 'archived'
  venue_id: string | null
}

// ✅ FIX: rimossa main_image_url — colonna non presente nella tabella venues
interface Venue {
  id: string
  venue_name: string
  city: string
  country: string
  venue_type: string
}

const PROJECT_STATUSES = [
  { value: 'draft',     label: 'Bozza' },
  { value: 'planning',  label: 'In Pianificazione' },
  { value: 'active',    label: 'Attivo' },
  { value: 'completed', label: 'Completato' },
  { value: 'archived',  label: 'Archiviato' },
] as const

// ── Componente Dialog Archivio Venues ─────────────────────────────────────────

interface VenueArchiveDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (venue: Venue) => void
  userId: string
}

const VenueArchiveDialog: React.FC<VenueArchiveDialogProps> = ({
  open,
  onClose,
  onSelect,
  userId,
}) => {
  const [allVenues, setAllVenues]   = useState<Venue[]>([])
  const [filtered, setFiltered]     = useState<Venue[]>([])
  const [loadingVenues, setLoading] = useState(false)
  const [query, setQuery]           = useState('')

  // Carica tutte le venues dell'utente al primo open
  useEffect(() => {
    if (!open) return
    fetchVenues()
  }, [open])

  // Filtra localmente in real-time
  useEffect(() => {
    if (!query.trim()) {
      setFiltered(allVenues)
      return
    }
    const q = query.toLowerCase()
    setFiltered(
      allVenues.filter(
        (v) =>
          v.venue_name.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q)        ||
          v.country.toLowerCase().includes(q)     ||
          v.venue_type.toLowerCase().includes(q)
      )
    )
  }, [query, allVenues])

  const fetchVenues = async () => {
    try {
      setLoading(true)

      // ✅ FIX: select solo colonne che esistono nella tabella venues
      const { data, error } = await supabase
        .from('venues')
        .select('id, venue_name, city, country, venue_type')
        .eq('created_by', userId)
        .order('venue_name', { ascending: true })

      if (error) throw error

      // ✅ FIX: cast corretto senza main_image_url
      const venues = (data || []) as unknown as Venue[]
      setAllVenues(venues)
      setFiltered(venues)

    } catch (err: any) {
      logger.error('❌ VenueArchiveDialog: fetch error:', err)
      toast.error('Errore nel caricamento delle venues')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setQuery('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Seleziona Venue dall'Archivio
          </DialogTitle>
        </DialogHeader>

        {/* Barra ricerca */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtra per nome, città, paese, tipo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Contatore */}
        {!loadingVenues && (
          <p className="text-xs text-muted-foreground px-1">
            {filtered.length === 0
              ? 'Nessuna venue trovata'
              : `${filtered.length} venue${filtered.length !== 1 ? 's' : ''} ${
                  query ? `per "${query}"` : 'nel tuo archivio'
                }`}
          </p>
        )}

        {/* Lista */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mt-1">

          {loadingVenues && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loadingVenues && filtered.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {allVenues.length === 0
                  ? 'Non hai ancora aggiunto nessuna venue al tuo archivio.'
                  : `Nessuna venue corrisponde a "${query}"`}
              </p>
            </div>
          )}

          {!loadingVenues &&
            filtered.map((venue) => (
              <button
                key={venue.id}
                type="button"
                onClick={() => {
                  onSelect(venue)
                  handleClose()
                }}
                className="
                  w-full p-3 text-left rounded-lg border border-input
                  hover:bg-muted/60 hover:border-primary/40
                  transition-colors group
                "
              >
                <div className="flex items-center gap-3">

                  {/* Icona fallback (niente immagine) */}
                  <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Dettagli */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {venue.venue_name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {venue.city}, {venue.country}
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-1.5 text-xs font-normal"
                    >
                      {venue.venue_type}
                    </Badge>
                  </div>

                  {/* Freccia */}
                  <span className="text-muted-foreground group-hover:text-primary transition-colors text-lg">
                    →
                  </span>
                </div>
              </button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Componente principale ─────────────────────────────────────────────────────

export default function ProjectEditForm() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [archiveOpen, setArchiveOpen]     = useState(false)

  const [formData, setFormData] = useState<ProjectFormData>({
    project_name:   '',
    project_type:   '',
    description:    '',
    start_date:     '',
    end_date:       '',
    budget_planned: null,
    budget_actual:  null,
    status:         'planning',
    venue_id:       null,
  })

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (id) loadProject(id)
    else    navigate('/app/projects')
  }, [id, navigate])

  // Listener venue creata da nuova tab
  useEffect(() => {
    const handleVenueCreated = (event: CustomEvent) => {
      const newVenue = event.detail as Venue
      logger.log('✅ Venue created, updating project:', newVenue)
      setSelectedVenue(newVenue)
      setFormData((prev) => ({ ...prev, venue_id: newVenue.id }))
      toast.success(`Venue "${newVenue.venue_name}" creata e associata al progetto`)
    }
    window.addEventListener('venueCreated' as any, handleVenueCreated)
    return () => window.removeEventListener('venueCreated' as any, handleVenueCreated)
  }, [])

  // Controlla venue selezionata da localStorage
  useEffect(() => {
    const checkSelectedVenue = () => {
      const stored = localStorage.getItem('selectedVenue')
      if (!stored) return
      try {
        const venue = JSON.parse(stored) as Venue
        logger.log('✅ Found selected venue from localStorage:', venue)
        setSelectedVenue(venue)
        setFormData((prev) => ({ ...prev, venue_id: venue.id }))
        localStorage.removeItem('selectedVenue')
        localStorage.removeItem('pendingProjectData')
        toast.success(`Venue "${venue.venue_name}" associata al progetto`)
      } catch (error) {
        logger.error('Error parsing selected venue:', error)
      }
    }

    checkSelectedVenue()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkSelectedVenue()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // ── Caricamento dati ──────────────────────────────────────────────────────

  const loadProject = async (projectId: string) => {
    try {
      logger.log('📥 ProjectEditForm: Loading project:', projectId)

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error
      if (!data)  throw new Error('Progetto non trovato')

      const project = data as Project

      if (project.curator_id !== user?.id) {
        toast.error('Non hai i permessi per modificare questo progetto')
        navigate('/app/projects')
        return
      }

      setFormData({
        project_name:   project.project_name   || '',
        project_type:   project.project_type   || '',
        description:    project.description    || '',
        start_date:     project.start_date     || '',
        end_date:       project.end_date       || '',
        budget_planned: project.budget_planned ?? null,
        budget_actual:  project.budget_actual  ?? null,
        status:         project.status          || 'planning',
        venue_id:       project.venue_id        || null,
      })

      if (project.venue_id) loadVenue(project.venue_id)

      logger.log('✅ ProjectEditForm: Project loaded')
    } catch (error: any) {
      logger.error('❌ ProjectEditForm: Error loading project:', error)
      toast.error('Errore nel caricamento del progetto')
      navigate('/app/projects')
    } finally {
      setLoading(false)
    }
  }

  const loadVenue = async (venueId: string) => {
    try {
      // ✅ FIX: stesse colonne della query nell'archivio
      const { data, error } = await supabase
        .from('venues')
        .select('id, venue_name, city, country, venue_type')
        .eq('id', venueId)
        .single()

      if (error) { logger.error('❌ Error loading venue:', error); return }
      if (data)   setSelectedVenue(data as unknown as Venue)
    } catch (error: any) {
      logger.error('❌ Error loading venue:', error)
    }
  }

  // ── Handlers venue ────────────────────────────────────────────────────────

  const handleSelectVenue = (venue: Venue) => {
    setSelectedVenue(venue)
    setFormData((prev) => ({ ...prev, venue_id: venue.id }))
    toast.success(`Venue "${venue.venue_name}" selezionata`)
  }

  const handleRemoveVenue = () => {
    setSelectedVenue(null)
    setFormData((prev) => ({ ...prev, venue_id: null }))
    toast.success('Venue rimossa')
  }

  const handleCreateNewVenue = () => {
    localStorage.setItem(
      'pendingProjectData',
      JSON.stringify({
        projectId: id,
        formData,
        returnUrl: `/app/projects/${id}/edit`,
      })
    )
    window.open('/app/venues/new', '_blank')
    toast.info(
      'Crea la venue nella nuova scheda. Torneremo automaticamente qui dopo il salvataggio.'
    )
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id || !id) { toast.error('Dati mancanti'); return }
    if (!formData.project_name.trim()) {
      toast.error('Il nome del progetto è obbligatorio')
      return
    }

    setSaving(true)

    try {
      logger.log('💾 ProjectEditForm: Updating project:', id)

      const { error } = await supabase
        .from('projects')
        .update({
          project_name:   formData.project_name,
          project_type:   formData.project_type   || null,
          description:    formData.description    || null,
          start_date:     formData.start_date     || null,
          end_date:       formData.end_date       || null,
          budget_planned: formData.budget_planned,
          budget_actual:  formData.budget_actual,
          status:         formData.status,
          venue_id:       formData.venue_id,
        })
        .eq('id', id)

      if (error) throw error

      logger.log('✅ ProjectEditForm: Project updated successfully')

      localStorage.removeItem('pendingProjectData')
      localStorage.removeItem('selectedVenue')

      toast.success('Progetto aggiornato con successo!')
      navigate(`/app/projects/${id}`)
    } catch (error: any) {
      logger.error('❌ ProjectEditForm: Error updating project:', error)
      toast.error(`Errore: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (
    field: keyof ProjectFormData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento progetto...</p>
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/app/projects/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifica Progetto</h1>
          <p className="text-muted-foreground">Aggiorna i dettagli del progetto</p>
        </div>
      </div>

      {/* Dialog Archivio Venues */}
      {user && (
        <VenueArchiveDialog
          open={archiveOpen}
          onClose={() => setArchiveOpen(false)}
          onSelect={handleSelectVenue}
          userId={user.id}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dettagli Progetto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Nome Progetto */}
            <div>
              <Label htmlFor="project_name">Nome Progetto *</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => handleChange('project_name', e.target.value)}
                placeholder="Es: Mostra Autunno 2024"
                required
              />
            </div>

            {/* Tipo Progetto */}
            <div>
              <Label htmlFor="project_type">Tipo Progetto</Label>
              <Input
                id="project_type"
                value={formData.project_type}
                onChange={(e) => handleChange('project_type', e.target.value)}
                placeholder="Es: Mostra Collettiva, Solo Show"
              />
            </div>

            {/* Stato */}
            <div>
              <Label htmlFor="status">Stato *</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  handleChange('status', e.target.value as ProjectFormData['status'])
                }
                className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ── SEZIONE VENUE ────────────────────────────────────────────── */}
            <div>
              <Label>Venue / Spazio Espositivo</Label>

              {selectedVenue ? (
                /* Venue selezionata — scheda anteprima */
                <div className="mt-2 p-4 border border-input rounded-lg bg-muted/50">
                  <div className="flex items-start gap-3">

                    {/* Icona venue */}
                    <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>

                    {/* Dettagli */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {selectedVenue.venue_name}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {selectedVenue.city}, {selectedVenue.country}
                      </p>
                      <Badge variant="secondary" className="mt-1.5 text-xs font-normal">
                        {selectedVenue.venue_type}
                      </Badge>
                    </div>

                    {/* Azioni */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setArchiveOpen(true)}
                        className="text-xs"
                      >
                        Cambia
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveVenue}
                        className="text-xs text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Rimuovi
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Nessuna venue — bottoni azione */
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">

                  {/* Apre il dialog archivio */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setArchiveOpen(true)}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Seleziona dall'Archivio
                  </Button>

                  {/* Crea nuova venue in nuova tab */}
                  <Button
                    type="button"
                    variant="default"
                    className="w-full"
                    onClick={handleCreateNewVenue}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crea Nuova Venue
                  </Button>
                </div>
              )}
            </div>

            {/* Descrizione */}
            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descrivi il progetto..."
                rows={5}
              />
            </div>

            {/* Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Data Inizio</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end_date">Data Fine</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget_planned">Budget Preventivato (€)</Label>
                <Input
                  id="budget_planned"
                  type="number"
                  value={formData.budget_planned ?? ''}
                  onChange={(e) =>
                    handleChange(
                      'budget_planned',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="budget_actual">Budget Effettivo (€)</Label>
                <Input
                  id="budget_actual"
                  type="number"
                  value={formData.budget_actual ?? ''}
                  onChange={(e) =>
                    handleChange(
                      'budget_actual',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Footer form */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/app/projects/${id}`)}
                disabled={saving}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salva Modifiche
                  </>
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}