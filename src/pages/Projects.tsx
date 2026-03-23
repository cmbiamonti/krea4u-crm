// src/pages/Projects.tsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Grid3x3,
  List,
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Archive,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

// ── Tipi ──────────────────────────────────────────────────────────────────────
interface ProjectParticipant {
  id:               string
  display_name:     string
  participant_type: 'artist' | 'curator' | 'venue' | 'collaborator'
  role_in_project:  string | null
}

interface ProjectWithRelations {
  id:           string
  project_name: string
  project_type: string | null
  status:       string
  description:  string | null
  start_date:   string | null
  end_date:     string | null
  curator_id:   string
  venue_id:     string | null
  created_at:   string
  venue?: {
    venue_name: string
    city?:       string | null
    venue_type?: string | null
  } | null
  participants?: ProjectParticipant[]
  tasks?: Array<{ status: string }>
}

type ViewMode    = 'grid' | 'list' | 'timeline'
type FilterStatus = 'all' | 'planning' | 'active' | 'completed' | 'archived'

// ── Componente ────────────────────────────────────────────────────────────────
export default function Projects() {
  const navigate    = useNavigate()
  const { user }    = useAuth()

  const [projects,         setProjects]         = useState<ProjectWithRelations[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithRelations[]>([])
  const [searchQuery,      setSearchQuery]      = useState('')
  const [viewMode,         setViewMode]         = useState<ViewMode>('grid')
  const [filterStatus,     setFilterStatus]     = useState<FilterStatus>('all')

  // ✅ Stato loading/error gestito localmente — nessun hook esterno
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // ✅ Ref per evitare chiamate doppie in StrictMode
  const isFetching = useRef(false)

  // ── Funzione di caricamento ─────────────────────────────────────────────────
  const fetchProjects = useCallback(async (isRefresh = false) => {
    if (!user?.id) return
    // ✅ Blocca chiamate concorrenti
    if (isFetching.current) return
    isFetching.current = true

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      logger.log('📥 Projects: Loading for user:', user.id)

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          venue:venues(
            venue_name,
            city,
            venue_type
          )
        `)
        .eq('curator_id', user.id)
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      // Carica participants e tasks in parallelo
      const projectsWithDetails = await Promise.all(
        (projectsData || []).map(async (project: any) => {
          const [{ data: participants }, { data: tasks }] = await Promise.all([
            supabase
              .from('project_participants')
              .select('id, display_name, participant_type, role_in_project')
              .eq('project_id', project.id),
            supabase
              .from('tasks')
              .select('status')
              .eq('project_id', project.id),
          ])

          return {
            ...project,
            participants: participants || [],
            tasks:        tasks        || [],
          } as ProjectWithRelations
        })
      )

      logger.log('✅ Projects: Loaded', projectsWithDetails.length, 'projects')
      setProjects(projectsWithDetails)

      if (isRefresh) {
        toast.success('Progetti aggiornati')
      }

    } catch (err: any) {
      logger.error('❌ Projects: Error loading:', err)
      setError(err.message || 'Errore nel caricamento dei progetti')
      if (!isRefresh) {
        toast.error('Errore nel caricamento dei progetti')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
      // ✅ Rilascia il lock DOPO aver aggiornato lo stato
      isFetching.current = false
    }
  }, [user?.id])

  // ── Caricamento iniziale — solo al mount o cambio utente ───────────────────
  useEffect(() => {
    fetchProjects(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // ── Handler pulsante "Aggiorna" — NON chiama fetchProjects(false) ──────────
  const handleRefresh = () => {
    if (refreshing || loading) return
    fetchProjects(true)   // ✅ isRefresh=true → usa setRefreshing, non setLoading
  }

  // ── Filtra e cerca ──────────────────────────────────────────────────────────
  useEffect(() => {
    let filtered = [...projects]

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.project_name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.venue?.venue_name?.toLowerCase().includes(query) ||
        p.participants?.some(pt => pt.display_name.toLowerCase().includes(query))
      )
    }

    setFilteredProjects(filtered)
  }, [projects, searchQuery, filterStatus])

  // ── Archivia ────────────────────────────────────────────────────────────────
  const handleArchiveProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'archived' } as any)
        .eq('id', projectId)

      if (error) throw error

      // ✅ Aggiorna lo stato locale senza ricaricare tutto
      setProjects(prev =>
        prev.map(p => p.id === projectId ? { ...p, status: 'archived' } : p)
      )
      toast.success('Progetto archiviato')

    } catch (err: any) {
      logger.error('❌ Projects: Error archiving:', err)
      toast.error("Errore nell'archiviazione del progetto")
    }
  }

  // ── Elimina ─────────────────────────────────────────────────────────────────
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo progetto? Questa azione è irreversibile.')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      // ✅ Aggiorna lo stato locale senza ricaricare tutto
      setProjects(prev => prev.filter(p => p.id !== projectId))
      toast.success('Progetto eliminato')

    } catch (err: any) {
      logger.error('❌ Projects: Error deleting:', err)
      toast.error("Errore nell'eliminazione del progetto")
    }
  }

  // ── Helpers UI ──────────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const cfg: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      planning:  { label: 'In Planning', variant: 'secondary' },
      active:    { label: 'Attivo',      variant: 'default'   },
      completed: { label: 'Completato',  variant: 'outline'   },
      archived:  { label: 'Archiviato',  variant: 'secondary' },
    }
    const c = cfg[status] || { label: status, variant: 'outline' as const }
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  const calculateProgress = (project: ProjectWithRelations) => {
    if (!project.tasks || project.tasks.length === 0) return 0
    const done = project.tasks.filter(t => t.status === 'done').length
    return Math.round((done / project.tasks.length) * 100)
  }

  const getArtistsCount = (project: ProjectWithRelations) =>
    project.participants?.filter(p => p.participant_type === 'artist').length || 0

  // ── Loading iniziale ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Progetti</h1>
            <p className="text-gray-500">Gestisci i tuoi progetti artistici</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Caricamento progetti...</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Errore ──────────────────────────────────────────────────────────────────
  if (error && projects.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Progetti</h1>
            <p className="text-gray-500">Gestisci i tuoi progetti artistici</p>
          </div>
        </div>
        <Card className="p-12 text-center border-red-200 bg-red-50">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchProjects(false)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Riprova
          </Button>
        </Card>
      </div>
    )
  }

  // ── No user ─────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">Accesso richiesto</p>
          <Button onClick={() => navigate('/login')}>Accedi</Button>
        </Card>
      </div>
    )
  }

  // ── Render principale ───────────────────────────────────────────────────────
  return (
    <div className="container mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Progetti</h1>
          <p className="text-gray-500">Gestisci i tuoi progetti artistici</p>
        </div>
        <div className="flex gap-2">
          {/* ✅ Pulsante Aggiorna — usa handleRefresh, non reload */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Aggiornamento...' : 'Aggiorna'}
          </Button>
          <Button onClick={() => navigate('/app/projects/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Progetto
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca progetti per nome, descrizione, venue o artista..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={filterStatus} onValueChange={v => setFilterStatus(v as FilterStatus)}>
            <TabsList>
              <TabsTrigger value="all">Tutti</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
              <TabsTrigger value="active">Attivi</TabsTrigger>
              <TabsTrigger value="completed">Completati</TabsTrigger>
              <TabsTrigger value="archived">Archiviati</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon"
              onClick={() => setViewMode('grid')}>
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon"
              onClick={() => setViewMode('list')}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'timeline' ? 'default' : 'outline'} size="icon"
              onClick={() => setViewMode('timeline')}>
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Contatore */}
      {filteredProjects.length > 0 && (
        <div className="text-sm text-gray-500">
          Trovati {filteredProjects.length}{' '}
          {filteredProjects.length === 1 ? 'progetto' : 'progetti'}
          {refreshing && (
            <span className="ml-2 text-blue-500">
              <RefreshCw className="inline h-3 w-3 animate-spin mr-1" />
              Aggiornamento...
            </span>
          )}
        </div>
      )}

      {/* Contenuto */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">
            {searchQuery || filterStatus !== 'all'
              ? 'Nessun progetto trovato con i filtri selezionati'
              : 'Nessun progetto ancora creato'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <Button onClick={() => navigate('/app/projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Crea il tuo primo progetto
            </Button>
          )}
        </Card>

      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-20 bg-gradient-to-br from-red-900 to-yellow-100 relative">
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/app/projects/${project.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />Visualizza
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchiveProject(project.id)}>
                        <Archive className="h-4 w-4 mr-2" />Archivia
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{project.project_name}</h3>
                    <p className="text-sm text-gray-500">{project.project_type}</p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {project.start_date ? formatDate(project.start_date) : 'N/D'}
                      {' → '}
                      {project.end_date ? formatDate(project.end_date) : 'N/D'}
                    </span>
                  </div>
                  {project.venue && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{project.venue.venue_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{getArtistsCount(project)} Partecipanti</span>
                  </div>
                </div>

                {project.tasks && project.tasks.length > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progresso</span>
                      <span>{calculateProgress(project)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${calculateProgress(project)}%` }}
                      />
                    </div>
                  </div>
                )}

                <Link to={`/app/projects/${project.id}`}>
                  <Button className="w-full" variant="outline">
                    Visualizza Progetto
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

      ) : (
        <Card>
          <div className="divide-y">
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/app/projects/${project.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{project.project_name}</h3>
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{project.project_type}</span>
                      <span>•</span>
                      <span>{project.venue?.venue_name || 'TBD'}</span>
                      <span>•</span>
                      <span>{getArtistsCount(project)} artisti</span>
                      <span>•</span>
                      <span>{project.start_date ? formatDate(project.start_date) : 'N/D'}</span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={e => {
                        e.stopPropagation()
                        navigate(`/app/projects/${project.id}`)
                      }}>
                        <Eye className="h-4 w-4 mr-2" />Visualizza
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={e => {
                        e.stopPropagation()
                        handleArchiveProject(project.id)
                      }}>
                        <Archive className="h-4 w-4 mr-2" />Archivia
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation()
                          handleDeleteProject(project.id)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}