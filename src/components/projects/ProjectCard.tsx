import { Link } from 'react-router-dom'
import { Project, PROJECT_STATUS_CONFIG } from '@/types/project'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Edit, Archive, MoreVertical, MapPin, Calendar, Users } from 'lucide-react'
//import { PROJECT_STATUS } from '@/types/project'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  onArchive?: (id: string) => void
}

export default function ProjectCard({ project, onArchive }: ProjectCardProps) {
  const statusConfig = PROJECT_STATUS_CONFIG.find((s: any) => s.value === project.status)
  const progress = project.progress || 0

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
        {project.venue?.venue_name && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <MapPin className="h-12 w-12 text-primary/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-neutral-700">
                {project.venue.venue_name}
              </p>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        {statusConfig && (
          <Badge
            className={cn('absolute top-3 left-3', statusConfig.color, 'text-white')}
          >
            {statusConfig.label}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title & Type */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <Link to={`/projects/${project.id}`}>
                <h3 className="font-heading font-semibold text-lg text-neutral-900 hover:text-primary line-clamp-2">
                  {project.project_name}
                </h3>
              </Link>
              {project.project_type && (
                <Badge variant="outline" className="flex-shrink-0 text-xs">
                  {project.project_type.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>

          {/* Venue & Date */}
          <div className="space-y-1 text-sm text-neutral-600">
            {project.venue && (
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {project.venue.venue_name}
                {project.venue.city && `, ${project.venue.city}`}
              </p>
            )}
            {project.start_date && project.end_date && (
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(project.start_date)} - {formatDate(project.end_date)}
              </p>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600">Progresso</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Budget */}
          {project.budget_planned && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Budget:</span>
              <div className="text-right">
                <p className="font-semibold text-primary">
                  {formatCurrency(project.budget_planned)}
                </p>
                {project.budget_actual !== null && (
                  <p className="text-xs text-neutral-500">
                    Utilizzato: {formatCurrency(project.budget_actual)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Team */}
          {project.artists && project.artists.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-neutral-500" />
              <div className="flex -space-x-2">
                {project.artists.slice(0, 5).map((artist, idx) => (
                  <Avatar key={idx} className="h-8 w-8 border-2 border-white">
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {artist.first_name.charAt(0)}
                      {artist.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {project.artists.length > 5 && (
                  <div className="h-8 w-8 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-xs font-semibold">
                    +{project.artists.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/projects/${project.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizza
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/projects/${project.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onArchive?.(project.id)}>
              <Archive className="h-4 w-4 mr-2" />
              Archivia
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}