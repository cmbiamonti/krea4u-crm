import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Artist } from '@/types/artist'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Edit, Trash2, MoreVertical, Star, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ArtistCardProps {
  artist: Artist
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  isFavorite?: boolean
}

export default function ArtistCard({
  artist,
  onDelete,
  onToggleFavorite,
  isFavorite = false,
}: ArtistCardProps) {
  const [imageError, setImageError] = useState(false)

  const initials = `${artist.first_name.charAt(0)}${artist.last_name.charAt(0)}`
  const displayName = artist.artist_name || `${artist.first_name} ${artist.last_name}`
  const primaryImage = artist.images?.[0]?.image_url

  const statusColors = {
    available:   'bg-success/10 text-success',
    busy:        'bg-accent/10 text-accent',
    unavailable: 'bg-neutral-200 text-neutral-700',
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {primaryImage && !imageError ? (
          <img
            src={primaryImage}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite?.(artist.id)}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all',
            isFavorite
              ? 'bg-yellow-400 text-white'
              : 'bg-white/80 text-neutral-700 hover:bg-white'
          )}
        >
          <Star className={cn('h-4 w-4', isFavorite && 'fill-current')} />
        </button>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-heading font-semibold text-lg text-neutral-900 line-clamp-1">
              {displayName}
            </h3>
            {artist.nationality && artist.city && (
              <p className="text-sm text-neutral-600 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {artist.city}, {artist.nationality}
              </p>
            )}
          </div>

          {/* Medium Tags */}
          {artist.medium && artist.medium.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {artist.medium.slice(0, 3).map((m, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {m}
                </Badge>
              ))}
              {artist.medium.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{artist.medium.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Price Range & Status */}
          <div className="flex items-center justify-between">
            {artist.price_range && (
              <Badge variant="outline" className="text-xs">
                €{artist.price_range}
              </Badge>
            )}
            {artist.availability_status && (
              <Badge
                className={cn(
                  'text-xs',
                  statusColors[artist.availability_status as keyof typeof statusColors]
                )}
              >
                {artist.availability_status === 'available'   && 'Disponibile'}
                {artist.availability_status === 'busy'        && 'Impegnato'}
                {artist.availability_status === 'unavailable' && 'Non disponibile'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {/* ✅ CORRETTO: prefisso /app/ */}
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/app/artists/${artist.id}`}>
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
            {/* ✅ CORRETTO: prefisso /app/ */}
            <DropdownMenuItem asChild>
              <Link to={`/app/artists/${artist.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(artist.id)}
              className="text-error"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Elimina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}