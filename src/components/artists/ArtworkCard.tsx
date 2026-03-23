import { useState } from 'react'
import { ArtistImage } from '@/types/artist'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { FileText, Info } from 'lucide-react'

interface ArtworkCardProps {
  image: ArtistImage
  index: number
  onImageClick: () => void
  onDetailsClick: () => void
}

export default function ArtworkCard({
  image,
  index,
  onImageClick,
  onDetailsClick,
}: ArtworkCardProps) {
  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        <Card className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200">
          <div className="relative aspect-square bg-neutral-100">
            <img
              src={image.image_url}
              alt={image.artwork_title || `Opera ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onClick={onImageClick}
            />

            {/* Quick badges */}
            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
              {(image.artwork_width_cm || image.artwork_height_cm) && (
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs">
                  {image.artwork_width_cm || '?'} × {image.artwork_height_cm || '?'} cm
                </Badge>
              )}
              {image.artwork_price && (
                <Badge className="bg-success text-white shadow-lg text-xs">
                  {formatCurrency(image.artwork_price)}
                </Badge>
              )}
            </div>

            {/* Info icon */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onDetailsClick()
                }}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <CardContent className="p-3">
            <h4 className="font-semibold text-sm line-clamp-1">
              {image.artwork_title || 'Senza titolo'}
            </h4>
            
            <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
              {image.artwork_year && <span>{image.artwork_year}</span>}
              {image.artwork_technique && (
                <>
                  <span>•</span>
                  <span className="line-clamp-1">{image.artwork_technique}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>

      <HoverCardContent side="right" className="w-80">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-base">
              {image.artwork_title || 'Senza titolo'}
            </h4>
            {image.artwork_year && (
              <p className="text-sm text-neutral-600">{image.artwork_year}</p>
            )}
          </div>

          {image.artwork_description && (
            <p className="text-sm text-neutral-700 line-clamp-3">
              {image.artwork_description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {image.artwork_technique && (
              <Badge variant="outline" className="text-xs">
                {image.artwork_technique}
              </Badge>
            )}
            {image.artwork_price && (
              <Badge className="bg-success text-white text-xs">
                {formatCurrency(image.artwork_price)}
              </Badge>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={onDetailsClick}
          >
            <FileText className="h-3 w-3 mr-2" />
            Vedi Scheda Completa
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}