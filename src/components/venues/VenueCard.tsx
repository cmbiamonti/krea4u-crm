import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Venue } from '@/types/venue'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Eye, Edit, Trash2, MoreVertical, Star,
  MapPin, Maximize, Users, Wifi, Car, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VenueCardProps {
  venue: Venue
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  isFavorite?: boolean
  onSelect?: (id: string) => void
  isSelected?: boolean
}

const amenityIcons: Record<string, any> = {
  wifi:     Wifi,
  parking:  Car,
  security: Shield,
}

export default function VenueCard({
  venue,
  onDelete,
  onToggleFavorite,
  isFavorite = false,
  onSelect,
  isSelected = false,
}: VenueCardProps) {
  const [imageError, setImageError] = useState(false)

  const coverImage =
    venue.images?.find((img) => img.is_cover)?.image_url ||
    venue.images?.[0]?.image_url

  const venueTypeLabels: Record<string, string> = {
    gallery:      'Galleria',
    museum:       'Museo',
    multipurpose: 'Polifunzionale',
    warehouse:    'Warehouse',
    studio:       'Studio',
    other:        'Altro',
  }

  const pricingModelLabels: Record<string, string> = {
    fixed:        'Tariffa Fissa',
    daily:        'Giornaliero',
    weekly:       'Settimanale',
    monthly:      'Mensile',
    profit_share: 'Profit Share',
    partnership:  'Partnership',
    free:         'Gratuito',
  }

  return (
    <Card
      className={cn(
        'group hover:shadow-lg transition-all duration-200 overflow-hidden',
        isSelected && 'ring-2 ring-primary'
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-neutral-100">
        {coverImage && !imageError ? (
          <img
            src={coverImage}
            alt={venue.venue_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <MapPin className="h-16 w-16 text-neutral-400" />
          </div>
        )}

        {/* Favorite & Select Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          {onSelect && (
            <button
              onClick={() => onSelect(venue.id)}
              className={cn(
                'p-2 rounded-full backdrop-blur-sm transition-all',
                isSelected
                  ? 'bg-primary text-white'
                  : 'bg-white/80 text-neutral-700 hover:bg-white'
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
                className="h-4 w-4 pointer-events-none"
              />
            </button>
          )}
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(venue.id)}
              className={cn(
                'p-2 rounded-full backdrop-blur-sm transition-all',
                isFavorite
                  ? 'bg-yellow-400 text-white'
                  : 'bg-white/80 text-neutral-700 hover:bg-white'
              )}
            >
              <Star className={cn('h-4 w-4', isFavorite && 'fill-current')} />
            </button>
          )}
        </div>

        {/* Venue Type Badge */}
        {venue.venue_type && (
          <Badge className="absolute top-3 left-3 bg-white/90 text-neutral-900">
            {venueTypeLabels[venue.venue_type] || venue.venue_type}
          </Badge>
        )}

        {/* Rating */}
        {venue.rating !== null && venue.rating !== undefined && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-xs font-semibold">{venue.rating.toFixed(1)}</span>
            {venue.reviews_count !== null && venue.reviews_count !== undefined && (
              <span className="text-xs text-neutral-600">({venue.reviews_count})</span>
            )}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title & Location */}
          <div>
            <h3 className="font-heading font-semibold text-lg text-neutral-900 line-clamp-1">
              {venue.venue_name}
            </h3>
            {venue.city && (
              <p className="text-sm text-neutral-600 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {venue.neighborhood ? `${venue.neighborhood}, ` : ''}
                {venue.city}
              </p>
            )}
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 text-sm text-neutral-700">
            {venue.size_sqm && (
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4 text-neutral-500" />
                <span>{venue.size_sqm} m²</span>
              </div>
            )}
            {venue.number_of_rooms && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-neutral-500" />
                <span>
                  {venue.number_of_rooms}{' '}
                  {venue.number_of_rooms === 1 ? 'sala' : 'sale'}
                </span>
              </div>
            )}
          </div>

          {/* Amenities Icons */}
          {venue.amenities && venue.amenities.length > 0 && (
            <div className="flex gap-2">
              {venue.amenities.slice(0, 4).map((amenity, idx) => {
                const Icon = amenityIcons[amenity]
                return Icon ? (
                  <div
                    key={idx}
                    className="p-1.5 bg-neutral-100 rounded text-neutral-600"
                    title={amenity}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                ) : null
              })}
              {venue.amenities.length > 4 && (
                <div className="p-1.5 bg-neutral-100 rounded text-neutral-600 text-xs">
                  +{venue.amenities.length - 4}
                </div>
              )}
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              {venue.pricing_model && (
                <p className="text-xs text-neutral-600">
                  {pricingModelLabels[venue.pricing_model] || venue.pricing_model}
                </p>
              )}
              {venue.rental_fee ? (
                <p className="font-semibold text-primary">
                  {formatCurrency(venue.rental_fee)}
                </p>
              ) : (
                <p className="text-sm text-neutral-600">Su richiesta</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {/* ✅ CORRETTO: prefisso /app/ */}
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/app/venues/${venue.id}`}>
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
              <Link to={`/app/venues/${venue.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(venue.id)}
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