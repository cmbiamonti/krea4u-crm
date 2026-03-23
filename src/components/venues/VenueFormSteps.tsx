import { useState } from 'react'
import { VenueFormData, VENUE_TYPES, PRICING_MODELS, AMENITIES } from '@/types/venue'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ImageUpload from '@/components/artists/ImageUpload'
import AddressGeocoder from '@/components/maps/AddressGeocoder'
import ReverseGeocoder from '@/components/maps/ReverseGeocoder'
import MapWrapper from '@/components/maps/MapWrapper'
import { ChevronRight, ChevronLeft, X, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface VenueFormStepsProps {
  formData: VenueFormData
  errors: Record<string, string>
  onChange: (field: keyof VenueFormData, value: any) => void
  onSubmit: () => void
  isSubmitting: boolean
  images: any[]
  onImagesChange: (images: any[]) => void
}

export default function VenueFormSteps({
  formData,
  errors,
  onChange,
  onSubmit,
  isSubmitting,
  images,
  onImagesChange,
}: VenueFormStepsProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const [socialMediaKey, setSocialMediaKey] = useState('')
  const [socialMediaValue, setSocialMediaValue] = useState('')
  const [locationTab, setLocationTab] = useState<'geocode' | 'manual'>('geocode')

  const addSocialMedia = () => {
    if (socialMediaKey.trim() && socialMediaValue.trim()) {
      onChange('social_media', {
        ...formData.social_media,
        [socialMediaKey.trim()]: socialMediaValue.trim(),
      })
      setSocialMediaKey('')
      setSocialMediaValue('')
    }
  }

  const removeSocialMedia = (key: string) => {
    const newSocialMedia = { ...formData.social_media }
    delete newSocialMedia[key]
    onChange('social_media', newSocialMedia)
  }

  const toggleAmenity = (amenity: string) => {
    const newAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter((a) => a !== amenity)
      : [...formData.amenities, amenity]
    onChange('amenities', newAmenities)
  }

  const handleCoordinatesFound = (
    lat: number,
    lng: number,
    formattedAddress: string
  ) => {
    onChange('latitude', lat)
    onChange('longitude', lng)
    
    // Opzionalmente aggiorna address se vuoto
    if (!formData.address) {
      const parts = formattedAddress.split(',')
      onChange('address', parts[0].trim())
    }
    
    toast.success('Coordinate aggiornate!')
  }

  const handleAddressFound = (address: string, components: any) => {
    onChange('address', address)
    
    // Auto-compila city se disponibile e campo vuoto
    if (components.city && !formData.city) {
      onChange('city', components.city)
    }
    
    toast.success('Indirizzo aggiornato!')
  }

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
        formData.venue_name.trim() &&
        formData.venue_type &&
        formData.contact_name.trim() &&
        formData.email.trim() &&
        !errors.email
      )
    }
    if (currentStep === 2) {
      return formData.address.trim() && formData.city.trim()
    }
    if (currentStep === 4) {
      return images.length >= 5
    }
    return true
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step <= currentStep
                  ? 'bg-primary text-white'
                  : 'bg-neutral-200 text-neutral-600'
              }`}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div
                className={`flex-1 h-1 mx-2 transition-colors ${
                  step < currentStep ? 'bg-primary' : 'bg-neutral-200'
                }`}
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
              Inserisci i dati essenziali dello spazio espositivo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="venue_name">
                Nome Spazio <span className="text-error">*</span>
              </Label>
              <Input
                id="venue_name"
                value={formData.venue_name}
                onChange={(e) => onChange('venue_name', e.target.value)}
                error={errors.venue_name}
                placeholder="Es: Galleria d'Arte Moderna"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_type">
                Tipologia <span className="text-error">*</span>
              </Label>
              <select
                id="venue_type"
                value={formData.venue_type}
                onChange={(e) => onChange('venue_type', e.target.value)}
                className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
              >
                <option value="">Seleziona...</option>
                {VENUE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.venue_type && (
                <p className="text-sm text-error">{errors.venue_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">
                Nome Referente <span className="text-error">*</span>
              </Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => onChange('contact_name', e.target.value)}
                error={errors.contact_name}
                placeholder="Mario Rossi"
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
                error={errors.email}
                placeholder="info@spazio.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                placeholder="+39 02 1234567"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">Sito Web</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => onChange('website', e.target.value)}
                placeholder="https://www.spazio.com"
              />
            </div>

            {/* Social Media */}
            <div className="space-y-2 md:col-span-2">
              <Label>Social Media</Label>
              <div className="flex gap-2">
                <Input
                  value={socialMediaKey}
                  onChange={(e) => setSocialMediaKey(e.target.value)}
                  placeholder="Es: instagram"
                  className="flex-1"
                />
                <Input
                  value={socialMediaValue}
                  onChange={(e) => setSocialMediaValue(e.target.value)}
                  placeholder="URL o username"
                  className="flex-1"
                />
                <Button type="button" onClick={addSocialMedia}>
                  Aggiungi
                </Button>
              </div>
              {Object.entries(formData.social_media).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(formData.social_media).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="gap-1">
                      {key}: {value}
                      <button type="button" onClick={() => removeSocialMedia(key)}>
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

      {/* Step 2: Location - UPDATED VERSION */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Posizione
            </h3>
            <p className="text-neutral-600 mb-6">
              Specifica dove si trova lo spazio con strumenti di geocoding avanzati
            </p>
          </div>

          <div className="space-y-6">
            {/* Address and City Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">
                  Indirizzo Completo <span className="text-error">*</span>
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => onChange('address', e.target.value)}
                  error={errors.address}
                  placeholder="Via Roma 123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  Città <span className="text-error">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => onChange('city', e.target.value)}
                  error={errors.city}
                  placeholder="Milano"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Quartiere</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => onChange('neighborhood', e.target.value)}
                  placeholder="Centro Storico"
                />
              </div>
            </div>

            {/* Geocoding Tabs */}
            <div className="border rounded-lg p-4 bg-neutral-50">
              <Tabs value={locationTab} onValueChange={(v: any) => setLocationTab(v)}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="geocode">Trova Coordinate</TabsTrigger>
                  <TabsTrigger value="manual">Inserimento Manuale</TabsTrigger>
                </TabsList>

                {/* Tab: Find from Address */}
                <TabsContent value="geocode" className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-600">
                      Usa l'indirizzo inserito sopra per trovare automaticamente le coordinate GPS
                    </p>
                    <AddressGeocoder
                      onCoordinatesFound={handleCoordinatesFound}
                      initialAddress={
                        formData.address && formData.city
                          ? `${formData.address}, ${formData.city}`
                          : formData.address || ''
                      }
                      cityHint={formData.city}
                    />
                  </div>
                </TabsContent>

                {/* Tab: Manual Entry */}
                <TabsContent value="manual" className="space-y-4">
                  <p className="text-sm text-neutral-600 mb-3">
                    Inserisci manualmente latitudine e longitudine
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitudine</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        value={formData.latitude || ''}
                        onChange={(e) =>
                          onChange('latitude', e.target.value ? parseFloat(e.target.value) : null)
                        }
                        placeholder="45.464211"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitudine</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        value={formData.longitude || ''}
                        onChange={(e) =>
                          onChange('longitude', e.target.value ? parseFloat(e.target.value) : null)
                        }
                        placeholder="9.191383"
                      />
                    </div>
                  </div>

                  {/* Reverse Geocode Button */}
                  {formData.latitude && formData.longitude && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-neutral-600 mb-2">
                        Hai già le coordinate? Trova l'indirizzo corrispondente:
                      </p>
                      <ReverseGeocoder
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        onAddressFound={handleAddressFound}
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Map Preview */}
            {formData.latitude && formData.longitude && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">Anteprima Mappa</Label>
                <MapWrapper
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  venueName={formData.venue_name || 'Posizione Spazio'}
                  address={
                    formData.address && formData.city
                      ? `${formData.address}, ${formData.city}`
                      : formData.address
                  }
                  height="400px"
                  zoom={16}
                  showControls={true}
                />
                <p className="text-xs text-neutral-500 mt-2">
                  📍 Coordinate: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Features */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">
              Caratteristiche
            </h3>
            <p className="text-neutral-600 mb-6">
              Descrivi le caratteristiche tecniche dello spazio
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => onChange('description', e.target.value)}
                rows={4}
                placeholder="Descrizione generale dello spazio..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="size_sqm">Dimensione (m²)</Label>
                <Input
                  id="size_sqm"
                  type="number"
                  value={formData.size_sqm || ''}
                  onChange={(e) =>
                    onChange('size_sqm', e.target.value ? parseFloat(e.target.value) : null)
                  }
                  placeholder="250"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ceiling_height">Altezza Soffitti (m)</Label>
                <Input
                  id="ceiling_height"
                  type="number"
                  step="0.1"
                  value={formData.ceiling_height || ''}
                  onChange={(e) =>
                    onChange(
                      'ceiling_height',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  placeholder="4.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number_of_rooms">Numero Sale</Label>
                <Input
                  id="number_of_rooms"
                  type="number"
                  value={formData.number_of_rooms || ''}
                  onChange={(e) =>
                    onChange(
                      'number_of_rooms',
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder="3"
                />
              </div>
            </div>

            {/* Natural Light */}
            <div className="space-y-2">
              <Label>Luce Naturale</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.natural_light === true ? 'default' : 'outline'}
                  onClick={() => onChange('natural_light', true)}
                >
                  Sì
                </Button>
                <Button
                  type="button"
                  variant={formData.natural_light === false ? 'default' : 'outline'}
                  onClick={() => onChange('natural_light', false)}
                >
                  No
                </Button>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <Label>Servizi Disponibili</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITIES.map((amenity) => (
                  <label
                    key={amenity.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity.value)}
                      onChange={() => toggleAmenity(amenity.value)}
                      className="rounded border-neutral-300"
                    />
                    <span className="text-sm">{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Pricing & Media */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-heading font-semibold mb-4">
              Pricing & Media
            </h3>
            <p className="text-neutral-600 mb-6">
              Configura il pricing e carica le immagini dello spazio
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pricing_model">Modello di Pricing</Label>
                <select
                  id="pricing_model"
                  value={formData.pricing_model}
                  onChange={(e) => onChange('pricing_model', e.target.value)}
                  className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
                >
                  <option value="">Seleziona...</option>
                  {PRICING_MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rental_fee">Tariffa (€)</Label>
                <Input
                  id="rental_fee"
                  type="number"
                  value={formData.rental_fee || ''}
                  onChange={(e) =>
                    onChange('rental_fee', e.target.value ? parseFloat(e.target.value) : null)
                  }
                  placeholder="5000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_costs">Costi Aggiuntivi</Label>
              <Textarea
                id="additional_costs"
                value={formData.additional_costs}
                onChange={(e) => onChange('additional_costs', e.target.value)}
                rows={3}
                placeholder="Es: Pulizia finale €200, Setup tecnico €500..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancellation_policy">Politica di Cancellazione</Label>
              <Textarea
                id="cancellation_policy"
                value={formData.cancellation_policy}
                onChange={(e) => onChange('cancellation_policy', e.target.value)}
                rows={3}
                placeholder="Es: Rimborso completo fino a 30 giorni prima..."
              />
            </div>

            {/* Images Upload */}
            <div className="space-y-2">
              <Label>
                Immagini <span className="text-error">* (minimo 5)</span>
              </Label>
              <ImageUpload images={images} onImagesChange={onImagesChange} maxImages={30} />
              {errors.images && (
                <p className="text-sm text-error">{errors.images}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>

        {currentStep < totalSteps ? (
          <Button type="button" onClick={nextStep} disabled={!canProceed()}>
            Avanti
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !canProceed()}
          >
            {isSubmitting ? 'Salvataggio...' : 'Salva Spazio'}
          </Button>
        )}
      </div>
    </div>
  )
}