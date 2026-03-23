// src/pages/Dashboard.tsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { useNavigate, Link } from 'react-router-dom'
import { logger } from '@/lib/logger'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/dashboard/StatCard'
import ProjectsTable from '@/components/dashboard/ProjectsTable'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import CalendarView from '@/components/dashboard/CalendarView'
import { Button } from '@/components/ui/button'
import { mapTasks, mapProjects } from '../utils/typeMappers'
import {
  Users,
  Building2,
  FolderOpen,
  Euro,
  Download,
  RefreshCw,
} from 'lucide-react'
import { exportDashboardToPDF } from '@/lib/exportDashboardPDF'
import { Task } from '@/types/project'

// ── Tipi ──────────────────────────────────────────────────────────────────────
interface DashboardStats {
  activeProjects:      number
  totalArtists:        number
  totalVenues:         number
  totalBudget:         number
  budgetPlanned:       number
  budgetActual:        number
  newArtistsThisMonth: number
  projectsTrend:       number
}

interface Project {
  id:             string
  project_name:   string
  project_type:   string | null
  status:         string | null
  start_date:     string | null
  end_date:       string | null
  budget_planned: number | null
  budget_actual:  number | null
  venue?: { venue_name: string }
}

interface Artist {
  id:           string
  first_name:   string
  last_name:    string
  artist_name?: string | null
  city?:        string | null
  nationality?: string | null
  created_at:   string
}

interface Activity {
  id:          string
  type:        'artist' | 'message' | 'project' | 'event'
  title:       string
  description: string
  timestamp:   string
  icon?:       'user' | 'message' | 'folder' | 'calendar'
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // ── State ──────────────────────────────────────────────────────────────────
  const [stats,          setStats]          = useState<DashboardStats | null>(null)
  const [projects,       setProjects]       = useState<Project[]>([])
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [recentArtists,  setRecentArtists]  = useState<Artist[]>([])
  const [activities,     setActivities]     = useState<Activity[]>([])
  const [tasks,          setTasks]          = useState<Task[]>([])
  const [exporting,      setExporting]      = useState(false)

  // ✅ Stato di caricamento e errore gestiti localmente
  // → nessun hook esterno che può causare loop
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError,   setDataError]   = useState<Error | null>(null)

  // ✅ Ref per evitare fetch multipli concorrenti
  const isFetchingRef = useRef(false)

  // ── Debug auth ─────────────────────────────────────────────────────────────
  useEffect(() => {
    logger.log('📊 Dashboard AUTH STATE:', {
      hasUser:   !!user,
      hasProfile: !!profile,
      authLoading,
      userId:    user?.id,
    })
  }, [user?.id, authLoading]) // ← solo su cambio id, non su ogni render

  // ── Fetch singoli (stabili, non dipendono da closure sul componente) ────────

  const fetchStats = useCallback(async (userId: string) => {
    const { count: activeProjectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('curator_id', userId)
      .in('status', ['active', 'planning', 'in_progress'])

    const { count: totalArtistsCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)

    const { count: totalVenuesCount } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)

    const { data: budgetData } = await supabase
      .from('projects')
      .select('budget_planned, budget_actual')
      .eq('curator_id', userId)
      .in('status', ['active', 'planning', 'in_progress'])

    type BudgetRow = { budget_planned: number | null; budget_actual: number | null }
    const rows = (budgetData || []) as BudgetRow[]
    const budgetPlanned = rows.reduce((s, p) => s + (p.budget_planned || 0), 0)
    const budgetActual  = rows.reduce((s, p) => s + (p.budget_actual  || 0), 0)

    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { count: newArtistsCount } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)
      .gte('created_at', firstDayOfMonth.toISOString())

    setStats({
      activeProjects:      activeProjectsCount      || 0,
      totalArtists:        totalArtistsCount        || 0,
      totalVenues:         totalVenuesCount         || 0,
      totalBudget:         budgetPlanned,
      budgetPlanned,
      budgetActual,
      newArtistsThisMonth: newArtistsCount          || 0,
      projectsTrend:       12,
    })
  }, []) // ← nessuna dipendenza: riceve userId come parametro

  const fetchProjects = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, venue:venues(venue_name)')
      .eq('curator_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    setProjects(data || [])
  }, [])

  const fetchTasks = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, project:projects(id, project_name, status)')
      .eq('created_by', userId)
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })

    if (error) throw error
    setTasks(mapTasks(data || []))
  }, [])

  const fetchRecentData = useCallback(async (userId: string) => {
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, project_name, status, start_date, venue:venues(venue_name)')
      .eq('curator_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    setRecentProjects(mapProjects(projectsData || []))

    const { data: artistsData } = await supabase
      .from('artists')
      .select('id, first_name, last_name, artist_name, city, nationality, created_at')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    setRecentArtists(artistsData || [])
  }, [])

  const fetchActivities = useCallback(async (userId: string) => {
    type ArtistRow  = { id: string; first_name: string; last_name: string; created_at: string }
    type ProjectRow = { id: string; project_name: string; created_at: string }

    const { data: artistsData }  = await supabase
      .from('artists')
      .select('id, first_name, last_name, created_at')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(3)

    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, project_name, created_at')
      .eq('curator_id', userId)
      .order('created_at', { ascending: false })
      .limit(2)

    const list: Activity[] = [
      ...(artistsData  || []).map((a: ArtistRow)  => ({
        id:          a.id,
        type:        'artist'  as const,
        title:       'Nuovo artista aggiunto',
        description: `${a.first_name} ${a.last_name}`,
        timestamp:   a.created_at,
        icon:        'user'    as const,
      })),
      ...(projectsData || []).map((p: ProjectRow) => ({
        id:          p.id,
        type:        'project' as const,
        title:       'Nuovo progetto creato',
        description: p.project_name,
        timestamp:   p.created_at,
        icon:        'folder'  as const,
      })),
    ]

    list.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    setActivities(list.slice(0, 5))
  }, [])

  // ── Fetch principale ────────────────────────────────────────────────────────
  // ✅ useCallback con userId come dipendenza esplicita
  const fetchDashboardData = useCallback(async (userId: string) => {
    // ✅ Protezione anti-loop: se un fetch è già in corso, esci
    if (isFetchingRef.current) {
      logger.warn('⚠️ Dashboard: fetch già in corso, skip')
      return
    }

    isFetchingRef.current = true
    setDataLoading(true)
    setDataError(null)

    logger.log('🚀 Dashboard: Starting data fetch for user:', userId)

    try {
      await Promise.all([
        fetchStats(userId),
        fetchProjects(userId),
        fetchRecentData(userId),
        fetchActivities(userId),
        fetchTasks(userId),
      ])
      logger.log('✅ Dashboard: All data loaded')
    } catch (err: any) {
      logger.error('❌ Dashboard: fetch error:', err)
      setDataError(err)
      toast.error('Impossibile caricare i dati della dashboard')
    } finally {
      setDataLoading(false)
      isFetchingRef.current = false
    }
  }, [fetchStats, fetchProjects, fetchRecentData, fetchActivities, fetchTasks])

  // ── Effect: carica dati quando user è pronto ────────────────────────────────
  // ✅ Dipendenze minimali: user?.id e authLoading
  // Non dipende da fetchDashboardData (useCallback stabile)
  useEffect(() => {
    if (authLoading)  return   // aspetta che auth sia pronto
    if (!user?.id)    return   // nessun utente

    fetchDashboardData(user.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]) // ← NON includere fetchDashboardData qui

  // ── Handler "Aggiorna" ──────────────────────────────────────────────────────
  // ✅ Non chiama reload del hook — chiama direttamente fetchDashboardData
  const handleReload = useCallback(() => {
    if (!user?.id) return
    // Resetta il ref per permettere il fetch manuale
    isFetchingRef.current = false
    fetchDashboardData(user.id)
  }, [user?.id, fetchDashboardData])

  // ── Export PDF ──────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (!stats) {
      toast.error('Dati non ancora caricati')
      return
    }

    setExporting(true)
    try {
      await exportDashboardToPDF({
        stats: {
          totalArtists:   stats.totalArtists,
          totalProjects:  projects.length,
          activeProjects: stats.activeProjects,
          totalVenues:    stats.totalVenues,
        },
        recentProjects: recentProjects.map(p => ({
          id:           p.id,
          project_name: p.project_name,
          status:       p.status || 'unknown',
          start_date:   p.start_date,
          venue:        p.venue ? { venue_name: p.venue.venue_name } : null,
        })),
        recentArtists,
        upcomingEvents: [],
      })
      toast.success('Report dashboard esportato con successo')
    } catch (err) {
      logger.error('❌ Dashboard: PDF export error:', err)
      toast.error('Impossibile generare il report PDF')
    } finally {
      setExporting(false)
    }
  }

  // ── Calendar events ─────────────────────────────────────────────────────────
  const calendarEvents = [
    ...projects
      .filter(p => p.start_date)
      .map(p => ({
        id:        p.id,
        title:     `📌 ${p.project_name}`,
        date:      new Date(p.start_date!),
        type:      'project' as const,
        status:    p.status || null,
        projectId: p.id,
      })),
    ...tasks
      .filter(t => t.due_date)
      .map(t => ({
        id:          t.id,
        title:       t.title,
        date:        new Date(t.due_date!),
        type:        'task' as const,
        priority:    t.priority,
        status:      t.status || null,
        projectName: (t as any).project?.project_name || 'Senza Progetto',
        projectId:   t.project_id,
      })),
  ]

  // ── Stato loading complessivo ───────────────────────────────────────────────
  const loading = authLoading || dataLoading

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Benvenuto in Krea4u - Il tuo strumento curatoriale"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {authLoading ? 'Autenticazione in corso...' : 'Caricamento dashboard...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── No user / profile ───────────────────────────────────────────────────────
  if (!user || !profile) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Benvenuto in Krea4u" />
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 mb-4">
            {!user ? 'Utente non autenticato' : 'Profilo non trovato'}
          </p>
          <Button onClick={() => navigate('/login')} variant="outline">
            Vai al Login
          </Button>
        </div>
      </div>
    )
  }

  // ── Error screen ────────────────────────────────────────────────────────────
  if (dataError) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Benvenuto in Krea4u - Il tuo strumento curatoriale"
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">Errore nel caricamento della dashboard</p>
          <Button onClick={handleReload} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Riprova
          </Button>
        </div>
      </div>
    )
  }

  // ── Dashboard principale ────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Benvenuto ${profile.company_name || user.email}`}
        action={
          <div className="flex gap-2">
            {/* ✅ Usa handleReload invece di reload del hook */}
            <Button
              variant="outline"
              onClick={handleReload}
              disabled={dataLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
            <Button onClick={handleExportPDF} disabled={exporting}>
              {exporting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generazione...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Esporta PDF
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Progetti Attivi"
          value={stats?.activeProjects || 0}
          icon={FolderOpen}
          color="text-primary"
          bgColor="bg-primary/30"
          loading={false}
          trend={{ value: stats?.projectsTrend || 0, isPositive: true }}
          subtitle="vs mese scorso"
        />
        <StatCard
          title="Artisti Database"
          value={stats?.totalArtists || 0}
          icon={Users}
          color="text-primary"
          bgColor="bg-primary/30"
          loading={false}
          subtitle={`+${stats?.newArtistsThisMonth || 0} questo mese`}
        />
        <StatCard
          title="Spazi Salvati"
          value={stats?.totalVenues || 0}
          icon={Building2}
          color="text-primary"
          bgColor="bg-primary/30"
          loading={false}
          action={
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link to="/app/venues">Esplora spazi →</Link>
            </Button>
          }
        />
        <StatCard
          title="Budget Totale"
          value={stats ? formatCurrency(stats.totalBudget) : '€0'}
          icon={Euro}
          color="text-success"
          bgColor="bg-success/10"
          loading={false}
          subtitle={`Utilizzato: ${stats ? formatCurrency(stats.budgetActual) : '€0'}`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold">Progetti Attivi</h2>
              <Button variant="outline" size="sm" asChild>
                <Link to="/app/projects">Vedi tutti</Link>
              </Button>
            </div>
            <ProjectsTable
              projects={projects}
              loading={false}
              onView={(id) => navigate(`/app/projects/${id}`)}
              onEdit={(id) => navigate(`/app/projects/${id}/edit`)}
              onDelete={(id) => logger.log('Delete project:', id)}
            />
          </div>
        </div>

        <div>
          <ActivityFeed activities={activities} loading={false} />
        </div>
      </div>

      {/* Calendar View */}
      <div className="mb-8">
        <CalendarView
          events={calendarEvents}
          onEventClick={(event) => {
            if (event.type === 'project') {
              navigate(`/app/projects/${event.id}`)
            } else if (event.type === 'task') {
              if (event.projectId) {
                navigate(`/app/projects/${event.projectId}?tab=tasks&taskId=${event.id}`)
              } else {
                toast.info(`Task: ${event.title}`, {
                  description: `Progetto: ${event.projectName || 'N/D'} | Scadenza: ${event.date.toLocaleDateString('it-IT')}`,
                })
              }
            }
          }}
        />
      </div>
    </div>
  )
}