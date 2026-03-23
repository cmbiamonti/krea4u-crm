import { ArtistImage } from '@/types/artist'
import { formatCurrency } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Ruler,
  Palette,
  Euro,
  FileText,
  Tag,
} from 'lucide-react'

interface ArtworkDetailModalProps {
  open: boolean
  onClose: () => void
  artwork: ArtistImage | null
}

export default function ArtworkDetailModal({
  open,
  onClose,
  artwork,
}: ArtworkDetailModalProps) {
  if (!artwork) return null

  const hasDimensions =
    artwork.artwork_width_cm || artwork.artwork_height_cm || artwork.artwork_depth_cm

  const formatDimensions = () => {
    const parts = []
    if (artwork.artwork_width_cm) parts.push(`${artwork.artwork_width_cm}`)
    if (artwork.artwork_height_cm) parts.push(`${artwork.artwork_height_cm}`)
    if (artwork.artwork_depth_cm) parts.push(`${artwork.artwork_depth_cm}`)
    return parts.join(' × ') + ' cm'
  }

  const calculateInches = () => {
    if (!artwork.artwork_width_cm || !artwork.artwork_height_cm) return null
    const widthInches = artwork.artwork_width_cm / 2.54
    const heightInches = artwork.artwork_height_cm / 2.54
    return `${widthInches.toFixed(1)} × ${heightInches.toFixed(1)} in`
  }

  const calculateArea = () => {
    if (!artwork.artwork_width_cm || !artwork.artwork_height_cm) return null
    const areaCm = artwork.artwork_width_cm * artwork.artwork_height_cm
    const areaM = (areaCm / 10000).toFixed(2)
    return `${areaCm.toLocaleString()} cm² (${areaM} m²)`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {artwork.artwork_title || 'Opera senza titolo'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
              <img
                src={artwork.image_url}
                alt={artwork.artwork_title || 'Opera'}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Caption */}
            {artwork.caption && (
              <div className="text-sm text-neutral-600 italic">
                "{artwork.caption}"
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              {/* Year */}
              {artwork.artwork_year && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-600">Anno</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {artwork.artwork_year}
                    </p>
                  </div>
                </div>
              )}

              {/* Technique */}
              {artwork.artwork_technique && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-600">Tecnica</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {artwork.artwork_technique}
                    </p>
                  </div>
                </div>
              )}

              {/* Dimensions */}
              {hasDimensions && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Ruler className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-600">Dimensioni</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {formatDimensions()}
                    </p>
                    {calculateInches() && (
                      <p className="text-sm text-neutral-500 mt-1">
                        {calculateInches()}
                      </p>
                    )}
                    {calculateArea() && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Area: {calculateArea()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Price */}
              {artwork.artwork_price && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Euro className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-600">
                      Prezzo Stimato
                    </p>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(artwork.artwork_price)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            {artwork.artwork_description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-neutral-700">
                  <FileText className="h-4 w-4" />
                  <p className="font-semibold">Descrizione</p>
                </div>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                  {artwork.artwork_description}
                </p>
              </div>
            )}

            {/* Technical Sheet Summary */}
            <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-neutral-700 mb-3">
                <Tag className="h-4 w-4" />
                <p className="font-semibold text-sm">Scheda Tecnica</p>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-sm">
                {artwork.artwork_year && (
                  <>
                    <span className="text-neutral-600">Anno:</span>
                    <span className="font-medium">{artwork.artwork_year}</span>
                  </>
                )}

                {artwork.artwork_technique && (
                  <>
                    <span className="text-neutral-600">Tecnica:</span>
                    <span className="font-medium">{artwork.artwork_technique}</span>
                  </>
                )}

                {hasDimensions && (
                  <>
                    <span className="text-neutral-600">Dimensioni:</span>
                    <span className="font-medium">{formatDimensions()}</span>
                  </>
                )}

                {artwork.artwork_price && (
                  <>
                    <span className="text-neutral-600">Prezzo:</span>
                    <span className="font-medium text-success">
                      {formatCurrency(artwork.artwork_price)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap gap-2">
              {artwork.artwork_year && (
                <Badge variant="secondary">{artwork.artwork_year}</Badge>
              )}
              {artwork.artwork_technique && (
                <Badge variant="outline">{artwork.artwork_technique}</Badge>
              )}
              {hasDimensions && (
                <Badge variant="outline">{formatDimensions()}</Badge>
              )}
              {artwork.artwork_price && (
                <Badge className="bg-success text-white">
                  {formatCurrency(artwork.artwork_price)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}