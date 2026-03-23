import { useState } from 'react'
import { ArtistFormData, MEDIUM_OPTIONS, STYLE_OPTIONS } from '@/types/artist'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ImageUpload from '@/components/artists/ImageUpload'
import { ChevronRight, ChevronLeft, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ArtistFormStepsProps {
  formData: ArtistFormData
  errors: Record<string, string>
  onChange: (field: keyof ArtistFormData, value: any) => void
  onSubmit: () => void
  isSubmitting: boolean
  images: any[]
  onImagesChange: (images: any[]) => void
}

export default function ArtistFormSteps({
  formData,
  errors,
  onChange,
  onSubmit,
  isSubmitting,
  images,
  onImagesChange,
}: ArtistFormStepsProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const canProceed = () => {
    if (currentStep === 1) {
      return (
        formData.first_name.trim() &&
        formData.last_name.trim() &&
        formData.email.trim() &&
        !errors.first_name &&
        !errors.last_name &&
        !errors.email
      )
    }
    return true
  }

  const toggleMedium = (medium: string) => {
    const newMedium = formData.medium.includes(medium)
      ? formData.medium.filter((m) => m !== medium)
      : [...formData.medium, medium]
    onChange('medium', newMedium)
  }

  const toggleStyle = (style: string) => {
    const newStyles = formData.style_tags.includes(style)
      ? formData.style_tags.filter((s) => s !== style)
      : [...formData.style_tags, style]
    onChange('style_tags', newStyles)
  }

  const handleSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Submit button clicked in ArtistFormSteps')
    onSubmit()
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                step <= currentStep
                  ? 'bg-primary text-white'
                  : 'bg-neutral-200 text-neutral-600'
              )}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2 transition-colors',
                  step < currentStep ? 'bg-primary' : 'bg-neutral-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">
              Informazioni Base
            </h3>
            <p className="text-neutral-600 mb-6">
              Inserisci i dati anagrafici e i contatti dell'artista
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                Nome <span className="text-error">*</span>
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => onChange('first_name', e.target.value)}
                placeholder="Mario"
                className={errors.first_name ? 'border-error' : ''}
              />
              {errors.first_name && (
                <p className="text-sm text-error">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">
                Cognome <span className="text-error">*</span>
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => onChange('last_name', e.target.value)}
                placeholder="Rossi"
                className={errors.last_name ? 'border-error' : ''}
              />
              {errors.last_name && (
                <p className="text-sm text-error">{errors.last_name}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="artist_name">Nome d'Arte</Label>
              <Input
                id="artist_name"
                value={formData.artist_name}
                onChange={(e) => onChange('artist_name', e.target.value)}
                placeholder="Es: M. Rossi Art"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-error">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="mario.rossi@email.com"
                className={errors.email ? 'border-error' : ''}
              />
              {errors.email && (
                <p className="text-sm text-error">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                placeholder="+39 340 1234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nazionalità</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => onChange('nationality', e.target.value)}
                placeholder="Italiana"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Città</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => onChange('city', e.target.value)}
                placeholder="Milano"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Data di Nascita</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => onChange('birth_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram_handle">Instagram</Label>
              <Input
                id="instagram_handle"
                value={formData.instagram_handle}
                onChange={(e) => onChange('instagram_handle', e.target.value)}
                placeholder="@artistname"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">Sito Web</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => onChange('website', e.target.value)}
                placeholder="https://www.artist-website.com"
                className={errors.website ? 'border-error' : ''}
              />
              {errors.website && (
                <p className="text-sm text-error">{errors.website}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Artistic Info */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">
              Informazioni Artistiche
            </h3>
            <p className="text-neutral-600 mb-6">
              Descrivi lo stile e le tecniche dell'artista
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => onChange('bio', e.target.value)}
                rows={4}
                placeholder="Breve biografia dell'artista..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist_statement">Artist Statement</Label>
              <Textarea
                id="artist_statement"
                value={formData.artist_statement}
                onChange={(e) => onChange('artist_statement', e.target.value)}
                rows={4}
                placeholder="Dichiarazione artistica..."
              />
            </div>

            <div className="space-y-2">
              <Label>Medium / Tecniche</Label>
              <div className="flex flex-wrap gap-2">
                {MEDIUM_OPTIONS.map((medium) => (
                  <button
                    key={medium}
                    type="button"
                    onClick={() => toggleMedium(medium)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm transition-colors',
                      formData.medium.includes(medium)
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    )}
                  >
                    {medium}
                  </button>
                ))}
              </div>
              {formData.medium.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.medium.map((medium) => (
                    <Badge key={medium} variant="secondary" className="gap-1">
                      {medium}
                      <button type="button" onClick={() => toggleMedium(medium)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Stili Artistici</Label>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleStyle(style)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm transition-colors',
                      formData.style_tags.includes(style)
                        ? 'bg-secondary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
              {formData.style_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.style_tags.map((style) => (
                    <Badge key={style} variant="outline" className="gap-1">
                      {style}
                      <button type="button" onClick={() => toggleStyle(style)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Portfolio & Additional Info */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">
              Portfolio & Informazioni Aggiuntive
            </h3>
            <p className="text-neutral-600 mb-6">
              Carica le immagini delle opere e completa il profilo
            </p>
          </div>

          <div className="space-y-2">
            <Label>Immagini Portfolio</Label>
            <ImageUpload
              images={images}
              onImagesChange={onImagesChange}
              maxImages={20}
            />
            <p className="text-xs text-neutral-500">
              Puoi caricare fino a 20 immagini. Formati supportati: JPG, PNG, WebP (max 5MB ciascuna)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price_range">Fascia di Prezzo</Label>
              <Input
                id="price_range"
                value={formData.price_range}
                onChange={(e) => onChange('price_range', e.target.value)}
                placeholder="Es: €5,000 - €15,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability_status">Status Disponibilità</Label>
              <select
                id="availability_status"
                value={formData.availability_status}
                onChange={(e) => onChange('availability_status', e.target.value)}
                className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="available">Disponibile</option>
                <option value="busy">Occupato</option>
                <option value="on_hold">In Pausa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="shipping_preferences">Preferenze Spedizione</Label>
              <Textarea
                id="shipping_preferences"
                value={formData.shipping_preferences}
                onChange={(e) => onChange('shipping_preferences', e.target.value)}
                rows={3}
                placeholder="Note sulle preferenze di spedizione..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_value">Valore Assicurazione (€)</Label>
              <Input
                id="insurance_value"
                type="number"
                value={formData.insurance_value || ''}
                onChange={(e) =>
                  onChange('insurance_value', e.target.value ? parseFloat(e.target.value) : null)
                }
                placeholder="50000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exhibition_history">Storia Espositiva</Label>
            <Textarea
              id="exhibition_history"
              value={formData.exhibition_history}
              onChange={(e) => onChange('exhibition_history', e.target.value)}
              rows={4}
              placeholder="Mostre precedenti, riconoscimenti, pubblicazioni..."
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>

        {currentStep < totalSteps ? (
          <Button 
            type="button" 
            onClick={nextStep}
            disabled={!canProceed()}
          >
            Avanti
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Salvataggio...
              </>
            ) : (
              'Salva Artista'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}