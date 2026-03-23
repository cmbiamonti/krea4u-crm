// src/components/artists/ImageUpload.tsx

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ArtworkMetadata } from '@/types/artist'
import ArtworkMetadataForm from './ArtworkMetadataForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Upload, Image as ImageIcon, MoveUp, MoveDown, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  images: ArtworkMetadata[]
  onImagesChange: (images: ArtworkMetadata[]) => void
  maxImages?: number
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 20,
}: ImageUploadProps) {

  // ── Dropzone ──────────────────────────────────────────────────────────────
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages: ArtworkMetadata[] = acceptedFiles.map((file, index) => ({
        file,
        // ✅ url generato dal file locale per l'anteprima immediata
        url:                 URL.createObjectURL(file),
        caption:             '',
        sort_order:          images.length + index,
        artwork_title:       '',
        artwork_year:        null,
        artwork_width_cm:    null,
        artwork_height_cm:   null,
        artwork_depth_cm:    null,
        artwork_technique:   '',
        artwork_price:       null,
        artwork_description: '',
      }))

      onImagesChange([...images, ...newImages])
    },
    [images, onImagesChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles:  maxImages - images.length,
    disabled:  images.length >= maxImages,
  })

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Restituisce la URL di anteprima corretta:
   * - immagini nuove  → blob URL da image.url (createObjectURL)
   * - immagini esistenti da Supabase → image.url popolato in fetchArtist()
   */
  const getPreviewUrl = (image: ArtworkMetadata): string => {
    return image.url ?? ''
  }

  /**
   * Indica se l'immagine è già salvata nel DB (ha un id)
   * oppure è appena stata aggiunta (ha solo il file locale)
   */
  const isExistingImage = (image: ArtworkMetadata): boolean => {
    return !!image.id
  }

  // ── Azioni ────────────────────────────────────────────────────────────────

  /**
   * Rimuove l'immagine dall'array locale.
   * - Per immagini nuove (no id): sparisce e basta.
   * - Per immagini esistenti (con id): sparendo dall'array,
   *   handleImages() in ArtistForm la troverà nella lista "toDelete"
   *   e la eliminerà da Supabase al salvataggio.
   */
  const removeImage = (index: number) => {
    const imageToRemove = images[index]

    // Revoca il blob URL solo per immagini nuove, per liberare memoria
    if (imageToRemove.file && imageToRemove.url?.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url)
    }

    const newImages = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, sort_order: i })) // re-index

    onImagesChange(newImages)
  }

  const updateImageMetadata = (
    index: number,
    field: keyof ArtworkMetadata,
    value: any
  ) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], [field]: value }
    onImagesChange(newImages)
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up'   && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) return

    const newImages  = [...images]
    const newIndex   = direction === 'up' ? index - 1 : index + 1
    ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]

    // Aggiorna sort_order dopo lo scambio
    newImages.forEach((img, i) => { img.sort_order = i })
    onImagesChange(newImages)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Upload Zone ── */}
      {images.length < maxImages && (
        <Card>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-neutral-300 hover:border-primary/50',
              images.length >= maxImages && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-primary/10 rounded-full">
                {isDragActive
                  ? <Upload    className="h-8 w-8 text-primary" />
                  : <ImageIcon className="h-8 w-8 text-primary" />
                }
              </div>
              <div>
                <p className="text-lg font-semibold text-neutral-900">
                  {isDragActive
                    ? 'Rilascia le immagini qui'
                    : 'Carica immagini delle opere'}
                </p>
                <p className="text-sm text-neutral-600 mt-1">
                  Trascina le immagini o clicca per selezionare
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  PNG, JPG, WEBP • Max {maxImages} immagini • 5 MB ciascuna
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Contatore ── */}
      {images.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600 font-medium">
            {images.length}{' '}
            {images.length === 1 ? 'opera caricata' : 'opere caricate'}
            {' '}
            <span className="text-neutral-400 font-normal">
              ({images.filter(isExistingImage).length} salvate
              {' · '}
              {images.filter(img => !isExistingImage(img)).length} nuove)
            </span>
          </span>
          <span className="text-neutral-500">
            {maxImages - images.length} rimanenti
          </span>
        </div>
      )}

      {/* ── Lista immagini con form metadati ── */}
      {images.length > 0 && (
        <div className="space-y-4">
          {images.map((image, index) => (
            <Card
              key={image.id ?? `new-${index}`}
              className={cn(
                'overflow-hidden transition-shadow',
                isExistingImage(image)
                  ? 'border-l-4 border-l-primary/40'   // ← bordo blu = salvata
                  : 'border-l-4 border-l-amber-400'    // ← bordo giallo = nuova
              )}
            >
              {/* ── Header card: anteprima + azioni ── */}
              <div className="flex items-start gap-4 p-4 bg-neutral-50 border-b">

                {/* Anteprima immagine */}
                <div className="flex-shrink-0 relative">
                  {getPreviewUrl(image) ? (
                    <img
                      src={getPreviewUrl(image)}
                      alt={image.artwork_title || `Opera ${index + 1}`}
                      className="w-24 h-24 object-cover rounded border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-neutral-200 rounded flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-neutral-400" />
                    </div>
                  )}

                  {/* Badge "salvata" / "nuova" sovrapposto */}
                  <span
                    className={cn(
                      'absolute -bottom-2 left-1/2 -translate-x-1/2',
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                      'whitespace-nowrap shadow-sm',
                      isExistingImage(image)
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    )}
                  >
                    {isExistingImage(image) ? '✓ salvata' : '● nuova'}
                  </span>
                </div>

                {/* Info + pulsanti azione */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-neutral-900">
                        {image.artwork_title || `Opera ${index + 1}`}
                      </h4>
                      {image.file && (
                        <p className="text-xs text-neutral-500 truncate max-w-xs">
                          {image.file.name}
                        </p>
                      )}
                    </div>

                    {/* Pulsanti: sposta su / sposta giù / elimina */}
                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveImage(index, 'up')}
                        disabled={index === 0}
                        title="Sposta su"
                        className="h-8 w-8 p-0"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveImage(index, 'down')}
                        disabled={index === images.length - 1}
                        title="Sposta giù"
                        className="h-8 w-8 p-0"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>

                      {/* ✅ Pulsante Elimina — funziona per nuove E esistenti */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                        title={
                          isExistingImage(image)
                            ? 'Elimina immagine salvata (verrà rimossa al salvataggio)'
                            : 'Rimuovi immagine'
                        }
                        className="h-8 px-2 gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs hidden sm:inline text-black">
                          {isExistingImage(image) ? 'Elimina' : 'Rimuovi'}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Pill info rapide */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {image.artwork_year && (
                      <span className="px-2 py-1 bg-white rounded border border-neutral-200">
                        📅 {image.artwork_year}
                      </span>
                    )}
                    {image.artwork_technique && (
                      <span className="px-2 py-1 bg-white rounded border border-neutral-200">
                        🎨 {image.artwork_technique}
                      </span>
                    )}
                    {(image.artwork_width_cm || image.artwork_height_cm) && (
                      <span className="px-2 py-1 bg-white rounded border border-neutral-200">
                        📏 {image.artwork_width_cm || '?'} × {image.artwork_height_cm || '?'} cm
                      </span>
                    )}
                    {image.artwork_price && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20 font-semibold">
                        💰 €{image.artwork_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Form metadati opera ── */}
              <div className="p-4">
                <ArtworkMetadataForm
                  artwork={image}
                  onChange={(field, value) =>
                    updateImageMetadata(index, field, value)
                  }
                  index={index}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {images.length === 0 && (
        <div className="text-center py-12 text-neutral-500 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
          <p className="text-lg font-medium text-neutral-700">
            Nessuna opera caricata
          </p>
          <p className="text-sm mt-1">
            Carica le immagini delle opere per iniziare a costruire il portfolio
          </p>
        </div>
      )}

    </div>
  )
}