import { useState } from 'react'
import { VenueFilters as Filters, VENUE_TYPES, PRICING_MODELS, AMENITIES, ROOM_OPTIONS } from '@/types/venue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Save, RotateCcw } from 'lucide-react'
//import { cn } from '@/lib/utils'

interface VenueFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  cities: string[]
  onSaveSearch?: (name: string) => void
}

export default function VenueFilters({
  filters,
  onFiltersChange,
  cities,
  onSaveSearch,
}: VenueFiltersProps) {
  const [saveSearchName, setSaveSearchName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)

  const handleReset = () => {
    onFiltersChange({
      search: '',
      city: [],
      neighborhood: '',
      venueType: [],
      sizeMin: 0,
      sizeMax: 1000,
      ceilingHeightMin: 0,
      ceilingHeightMax: 10,
      numberOfRooms: [],
      naturalLight: null,
      pricingModel: [],
      rentalFeeMin: 0,
      rentalFeeMax: 10000,
      amenities: [],
      availableNow: false,
      latitude: null,
      longitude: null,
      radiusKm: 10,
    })
  }

  const toggleArrayFilter = (key: keyof Filters, value: string) => {
    const currentValues = filters[key] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]

    onFiltersChange({ ...filters, [key]: newValues })
  }

  const activeFiltersCount =
    filters.city.length +
    filters.venueType.length +
    filters.numberOfRooms.length +
    filters.pricingModel.length +
    filters.amenities.length +
    (filters.neighborhood ? 1 : 0) +
    (filters.naturalLight !== null ? 1 : 0) +
    (filters.availableNow ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-semibold">Filtri</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <Separator />

      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Località</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* City Multi-select */}
          <div className="space-y-2">
            <Label className="text-xs">Città</Label>
            <div className="grid grid-cols-1 gap-2">
              {cities.map((city) => (
                <label key={city} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.city.includes(city)}
                    onChange={() => toggleArrayFilter('city', city)}
                    className="rounded border-neutral-300"
                  />
                  <span className="text-sm">{city}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Neighborhood */}
          <div className="space-y-2">
            <Label htmlFor="neighborhood" className="text-xs">
              Quartiere
            </Label>
            <Input
              id="neighborhood"
              value={filters.neighborhood}
              onChange={(e) =>
                onFiltersChange({ ...filters, neighborhood: e.target.value })
              }
              placeholder="Es: Centro, Porta Romana..."
            />
          </div>

          {/* Radius Search */}
          <div className="space-y-2">
            <Label className="text-xs">Raggio di ricerca: {filters.radiusKm} km</Label>
            <Slider
              value={[filters.radiusKm]}
              onValueChange={([value]) =>
                onFiltersChange({ ...filters, radiusKm: value })
              }
              min={1}
              max={50}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Technical Characteristics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Caratteristiche Tecniche</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Size Range */}
          <div className="space-y-2">
            <Label className="text-xs">
              Dimensione: {filters.sizeMin}-{filters.sizeMax} m²
            </Label>
            <Slider
              value={[filters.sizeMin, filters.sizeMax]}
              onValueChange={([min, max]) =>
                onFiltersChange({ ...filters, sizeMin: min, sizeMax: max })
              }
              min={0}
              max={1000}
              step={10}
            />
          </div>

          {/* Ceiling Height */}
          <div className="space-y-2">
            <Label className="text-xs">
              Altezza soffitti: {filters.ceilingHeightMin}-{filters.ceilingHeightMax} m
            </Label>
            <Slider
              value={[filters.ceilingHeightMin, filters.ceilingHeightMax]}
              onValueChange={([min, max]) =>
                onFiltersChange({
                  ...filters,
                  ceilingHeightMin: min,
                  ceilingHeightMax: max,
                })
              }
              min={0}
              max={10}
              step={0.5}
            />
          </div>

          {/* Number of Rooms */}
          <div className="space-y-2">
            <Label className="text-xs">Numero di sale</Label>
            <div className="space-y-2">
              {ROOM_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.numberOfRooms.includes(option.value)}
                    onChange={() => toggleArrayFilter('numberOfRooms', option.value)}
                    className="rounded border-neutral-300"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Natural Light */}
          <div className="space-y-2">
            <Label className="text-xs">Luce naturale</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={filters.naturalLight === true ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    naturalLight: filters.naturalLight === true ? null : true,
                  })
                }
              >
                Sì
              </Button>
              <Button
                type="button"
                variant={filters.naturalLight === false ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    naturalLight: filters.naturalLight === false ? null : false,
                  })
                }
              >
                No
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Venue Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tipologia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {VENUE_TYPES.map((type) => (
              <label
                key={type.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.venueType.includes(type.value)}
                  onChange={() => toggleArrayFilter('venueType', type.value)}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pricing Model */}
          <div className="space-y-2">
            <Label className="text-xs">Modello</Label>
            <div className="space-y-2">
              {PRICING_MODELS.map((model) => (
                <label
                  key={model.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.pricingModel.includes(model.value)}
                    onChange={() => toggleArrayFilter('pricingModel', model.value)}
                    className="rounded border-neutral-300"
                  />
                  <span className="text-sm">{model.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rental Fee Range */}
          <div className="space-y-2">
            <Label className="text-xs">
              Tariffa: €{filters.rentalFeeMin}-€{filters.rentalFeeMax}
            </Label>
            <Slider
              value={[filters.rentalFeeMin, filters.rentalFeeMax]}
              onValueChange={([min, max]) =>
                onFiltersChange({ ...filters, rentalFeeMin: min, rentalFeeMax: max })
              }
              min={0}
              max={10000}
              step={100}
            />
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Servizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {AMENITIES.map((amenity) => (
              <label
                key={amenity.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity.value)}
                  onChange={() => toggleArrayFilter('amenities', amenity.value)}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm">{amenity.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Search */}
      {onSaveSearch && (
        <Card>
          <CardContent className="pt-6">
            {!showSaveInput ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowSaveInput(true)}
              >
                <Save className="h-4 w-4 mr-2" />
                Salva Ricerca
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  placeholder="Nome ricerca..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (saveSearchName.trim()) {
                        onSaveSearch(saveSearchName)
                        setSaveSearchName('')
                        setShowSaveInput(false)
                      }
                    }}
                  >
                    Salva
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowSaveInput(false)
                      setSaveSearchName('')
                    }}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}