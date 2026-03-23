// src/components/dashboard/ProjectsTable.tsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Edit, Trash2, MoreVertical, Users, Calendar, Building2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// ✅ Interfaccia aggiornata
interface ProjectParticipant {
  id: string
  participant_type: 'curator' | 'artist' | 'venue' | 'collaborator'
  display_name: string
}

interface Project {
  id: string
  project_name: string
  project_type: string | null
  status: string | null
  start_date: string | null
  end_date: string | null
  budget_planned: number | null
  venue?: {
    venue_name: string
    city?: string | null
  } | null
  // ✅ Nuovo: participants invece di project_artists
  participants?: ProjectParticipant[]
  // ✅ Deprecato ma mantenuto per backward compatibility
  project_artists?: Array<{ artist: { first_name: string; last_name: string } }>
}

interface ProjectsTableProps {
  projects: Project[]
  loading?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

// ✅ Configurazione status aggiornata
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
  planning: { label: 'Pianificazione', variant: 'default' },
  active: { label: 'Attivo', variant: 'success' },
  in_progress: { label: 'In Corso', variant: 'default' },
  completed: { label: 'Completato', variant: 'secondary' },
  archived: { label: 'Archiviato', variant: 'outline' },
  cancelled: { label: 'Annullato', variant: 'destructive' },
  on_hold: { label: 'In Pausa', variant: 'outline' },
}

export default function ProjectsTable({
  projects,
  loading = false,
  onView,
  onEdit,
  onDelete,
}: ProjectsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(projects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProjects = projects.slice(startIndex, endIndex)

  // ✅ Helper per contare artisti
  const getArtistsCount = (project: Project): number => {
    // Usa participants se disponibile, altrimenti fallback su project_artists
    if (project.participants) {
      return project.participants.filter(p => p.participant_type === 'artist').length
    }
    return project.project_artists?.length || 0
  }

  // ✅ Helper per ottenere nomi artisti
  const getArtistsNames = (project: Project): string => {
    if (project.participants) {
      const artists = project.participants
        .filter(p => p.participant_type === 'artist')
        .map(p => p.display_name)
      
      if (artists.length === 0) return 'Nessun artista'
      if (artists.length <= 2) return artists.join(', ')
      return `${artists[0]} +${artists.length - 1}`
    }
    
    // Fallback per project_artists (deprecato)
    const oldArtists = project.project_artists?.map(pa => 
      `${pa.artist.first_name} ${pa.artist.last_name}`
    )
    
    if (!oldArtists || oldArtists.length === 0) return 'Nessun artista'
    if (oldArtists.length <= 2) return oldArtists.join(', ')
    return `${oldArtists[0]} +${oldArtists.length - 1}`
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
        <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-neutral-600 mb-2 font-medium">Nessun progetto trovato</p>
        <p className="text-sm text-neutral-500 mb-4">
          Inizia creando il tuo primo progetto artistico
        </p>
        <Button className="mt-2" asChild>
          <Link to="/app/projects/new">Crea Progetto</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold min-w-[200px]">Nome Progetto</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Tipo</TableHead>
                <TableHead className="font-semibold min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Venue
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Artisti
                  </div>
                </TableHead>
                <TableHead className="font-semibold min-w-[180px]">Date</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Budget</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProjects.map((project) => {
                const status = project.status || 'planning'
                const statusInfo = statusConfig[status] || statusConfig.planning
                const artistsCount = getArtistsCount(project)
                const artistsNames = getArtistsNames(project)

                return (
                  <TableRow 
                    key={project.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Nome Progetto */}
                    <TableCell className="font-medium py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold line-clamp-1">
                          {project.project_name}
                        </span>
                        {project.project_type && (
                          <span className="text-xs text-neutral-500 capitalize">
                            {project.project_type.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Tipo */}
                    <TableCell className="py-4">
                      <Badge variant="outline" className="capitalize whitespace-nowrap">
                        {project.project_type?.replace(/_/g, ' ') || 'Non specificato'}
                      </Badge>
                    </TableCell>

                    {/* Venue */}
                    <TableCell className="py-4">
                      {project.venue ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium line-clamp-1">
                            {project.venue.venue_name}
                          </span>
                          {project.venue.city && (
                            <span className="text-xs text-neutral-500">
                              {project.venue.city}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400">TBD</span>
                      )}
                    </TableCell>

                    {/* Artisti */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className="whitespace-nowrap"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {artistsCount}
                        </Badge>
                        <span 
                          className="text-xs text-neutral-600 line-clamp-1"
                          title={artistsNames}
                        >
                          {artistsNames}
                        </span>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1 text-sm">
                        {project.start_date ? (
                          <>
                            <div className="flex items-center gap-1 text-neutral-700">
                              <Calendar className="h-3 w-3" />
                              {formatDate(project.start_date)}
                            </div>
                            {project.end_date && (
                              <div className="text-xs text-neutral-500 pl-4">
                                → {formatDate(project.end_date)}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-neutral-400">Date non definite</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Budget */}
                    <TableCell className="py-4">
                      {project.budget_planned ? (
                        <span className="text-sm font-semibold text-green-700 whitespace-nowrap">
                          {formatCurrency(project.budget_planned)}
                        </span>
                      ) : (
                        <span className="text-sm text-neutral-400">N/D</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4">
                      <Badge 
                        variant={statusInfo.variant}
                        className="whitespace-nowrap"
                      >
                        {statusInfo.label}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => onView?.(project.id)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizza
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onEdit?.(project.id)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifica
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete?.(project.id)}
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-neutral-600">
            Mostrando <span className="font-semibold">{startIndex + 1}</span>-
            <span className="font-semibold">{Math.min(endIndex, projects.length)}</span> di{' '}
            <span className="font-semibold">{projects.length}</span> progetti
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600 mr-2">
              Pagina {currentPage} di {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Precedente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Successiva
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}