import { ArtworkMetadata, ART_TECHNIQUES } from '@/types/artist'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ArtworkMetadataFormProps {
  artwork: ArtworkMetadata
  onChange: (field: keyof ArtworkMetadata, value: any) => void
  index: number
}

export default function ArtworkMetadataForm({
  artwork,
  onChange,
  index,
}: ArtworkMetadataFormProps) {
  const currentYear = new Date().getFullYear()

  // Calculate dimensions in inches for reference
  const dimensionsInInches =
    artwork.artwork_width_cm && artwork.artwork_height_cm
      ? `${(artwork.artwork_width_cm / 2.54).toFixed(1)} × ${(artwork.artwork_height_cm / 2.54).toFixed(1)} in`
      : null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Titolo Opera */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`artwork-title-${index}`}>
            Titolo Opera <span className="text-error">*</span>
          </Label>
          <Input
            id={`artwork-title-${index}`}
            value={artwork.artwork_title || ''}
            onChange={(e) => onChange('artwork_title', e.target.value)}
            placeholder="Es: Tramonto sul mare"
            className="font-medium"
          />
        </div>

        {/* Anno */}
        <div className="space-y-2">
          <Label htmlFor={`artwork-year-${index}`}>Anno</Label>
          <Input
            id={`artwork-year-${index}`}
            type="number"
            min="1800"
            max={currentYear + 1}
            value={artwork.artwork_year || ''}
            onChange={(e) =>
              onChange('artwork_year', e.target.value ? parseInt(e.target.value) : null)
            }
            placeholder={currentYear.toString()}
          />
        </div>

        {/* Tecnica */}
        <div className="space-y-2">
          <Label htmlFor={`artwork-technique-${index}`}>Tecnica</Label>
          <Select
            value={artwork.artwork_technique || ''}
            onValueChange={(value) => onChange('artwork_technique', value)}
          >
            <SelectTrigger id={`artwork-technique-${index}`}>
              <SelectValue placeholder="Seleziona tecnica..." />
            </SelectTrigger>
            <SelectContent>
              {ART_TECHNIQUES.map((technique) => (
                <SelectItem key={technique} value={technique}>
                  {technique}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dimensioni */}
        <div className="space-y-2">
          <Label>Larghezza (cm)</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={artwork.artwork_width_cm || ''}
            onChange={(e) =>
              onChange('artwork_width_cm', e.target.value ? parseFloat(e.target.value) : null)
            }
            placeholder="100"
          />
        </div>

        <div className="space-y-2">
          <Label>Altezza (cm)</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={artwork.artwork_height_cm || ''}
            onChange={(e) =>
              onChange('artwork_height_cm', e.target.value ? parseFloat(e.target.value) : null)
            }
            placeholder="80"
          />
        </div>

        <div className="space-y-2">
          <Label>Profondità (cm)</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={artwork.artwork_depth_cm || ''}
            onChange={(e) =>
              onChange('artwork_depth_cm', e.target.value ? parseFloat(e.target.value) : null)
            }
            placeholder="5"
          />
          <p className="text-xs text-neutral-500">Opzionale (per opere 3D)</p>
        </div>

        {/* Prezzo */}
        <div className="space-y-2">
          <Label htmlFor={`artwork-price-${index}`}>Prezzo Stimato (€)</Label>
          <Input
            id={`artwork-price-${index}`}
            type="number"
            step="0.01"
            min="0"
            value={artwork.artwork_price || ''}
            onChange={(e) =>
              onChange('artwork_price', e.target.value ? parseFloat(e.target.value) : null)
            }
            placeholder="5000"
          />
        </div>

        {/* Descrizione */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`artwork-description-${index}`}>Descrizione Opera</Label>
          <Textarea
            id={`artwork-description-${index}`}
            value={artwork.artwork_description || ''}
            onChange={(e) => onChange('artwork_description', e.target.value)}
            rows={3}
            placeholder="Descrizione dell'opera, contesto, ispirazione, materiali utilizzati..."
          />
        </div>

        {/* Caption (display label) */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`artwork-caption-${index}`}>
            Caption Display
          </Label>
          <Input
            id={`artwork-caption-${index}`}
            value={artwork.caption || ''}
            onChange={(e) => onChange('caption', e.target.value)}
            placeholder="Testo breve per visualizzazione nelle gallerie"
          />
          <p className="text-xs text-neutral-500">
            Questo testo apparirà sotto l'immagine nelle gallerie pubbliche
          </p>
        </div>
      </div>

      {/* Dimensioni Summary */}
      {(artwork.artwork_width_cm || artwork.artwork_height_cm) && (
        <div className="pt-4 border-t text-sm">
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-neutral-700">Dimensioni:</strong>{' '}
              <span className="text-neutral-900">
                {artwork.artwork_width_cm || '?'} × {artwork.artwork_height_cm || '?'}
                {artwork.artwork_depth_cm && ` × ${artwork.artwork_depth_cm}`} cm
              </span>
            </div>
            {dimensionsInInches && (
              <span className="text-neutral-500 text-xs">
                ({dimensionsInInches})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}