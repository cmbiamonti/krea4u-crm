import { useState } from 'react'
import { ArtistFilters as Filters } from '@/types/artist'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import { MEDIUM_OPTIONS, STYLE_OPTIONS, AVAILABILITY_STATUS } from '@/types/artist'
import { cn } from '@/lib/utils'

interface ArtistFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  nationalities: string[]
  cities: string[]
}

type FilterSection = 'nationality' | 'city' | 'medium' | 'style' | 'price' | 'availability'

export default function ArtistFilters({
  filters,
  onFiltersChange,
  nationalities,
  cities,
}: ArtistFiltersProps) {
  const [openSections, setOpenSections] = useState<Set<FilterSection>>(
    new Set(['medium', 'availability']) // Sezioni aperte di default
  )

  const toggleSection = (section: FilterSection) => {
    setOpenSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const handleReset = () => {
    onFiltersChange({
      search: '',
      nationality: [],
      city: [],
      medium: [],
      priceRange: [],
      availabilityStatus: [],
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
    filters.nationality.length +
    filters.city.length +
    filters.medium.length +
    filters.priceRange.length +
    filters.availabilityStatus.length

  const getSectionCount = (section: FilterSection): number => {
    switch (section) {
      case 'nationality':
        return filters.nationality.length
      case 'city':
        return filters.city.length
      case 'medium':
        return filters.medium.length
      case 'availability':
        return filters.availabilityStatus.length
      default:
        return 0
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Filtri</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search - Always Visible */}
        <div className="space-y-2">
          <Label htmlFor="search">Ricerca</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              id="search"
              placeholder="Cerca artisti..."
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              className="pl-10"
            />
          </div>
        </div>

        {/* Nationality - Collapsible */}
        {nationalities.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('nationality')}
              className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Nazionalità</span>
                {getSectionCount('nationality') > 0 && (
                  <Badge variant="secondary" className="h-5 text-xs">
                    {getSectionCount('nationality')}
                  </Badge>
                )}
              </div>
              {openSections.has('nationality') ? (
                <ChevronUp className="h-4 w-4 text-neutral-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              )}
            </button>
            
            <div
              className={cn(
                'transition-all duration-200 ease-in-out overflow-hidden',
                openSections.has('nationality')
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0'
              )}
            >
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {nationalities.map((nationality) => (
                  <label
                    key={nationality}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={filters.nationality.includes(nationality)}
                      onChange={() => toggleArrayFilter('nationality', nationality)}
                      className="rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{nationality}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cities - Collapsible */}
        {cities.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('city')}
              className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Città</span>
                {getSectionCount('city') > 0 && (
                  <Badge variant="secondary" className="h-5 text-xs">
                    {getSectionCount('city')}
                  </Badge>
                )}
              </div>
              {openSections.has('city') ? (
                <ChevronUp className="h-4 w-4 text-neutral-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              )}
            </button>
            
            <div
              className={cn(
                'transition-all duration-200 ease-in-out overflow-hidden',
                openSections.has('city')
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0'
              )}
            >
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {cities.map((city) => (
                  <label
                    key={city}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={filters.city.includes(city)}
                      onChange={() => toggleArrayFilter('city', city)}
                      className="rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{city}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Medium - Collapsible */}
        <div className="border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('medium')}
            className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Medium</span>
              {getSectionCount('medium') > 0 && (
                <Badge variant="secondary" className="h-5 text-xs">
                  {getSectionCount('medium')}
                </Badge>
              )}
            </div>
            {openSections.has('medium') ? (
              <ChevronUp className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            )}
          </button>
          
          <div
            className={cn(
              'transition-all duration-200 ease-in-out overflow-hidden',
              openSections.has('medium')
                ? 'max-h-96 opacity-100'
                : 'max-h-0 opacity-0'
            )}
          >
            <div className="p-3">
              <div className="flex flex-wrap gap-2">
                {MEDIUM_OPTIONS.map((medium) => (
                  <button
                    key={medium}
                    type="button"
                    onClick={() => toggleArrayFilter('medium', medium)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      filters.medium.includes(medium)
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    )}
                  >
                    {medium}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Style Tags - Collapsible */}
        {STYLE_OPTIONS.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('style')}
              className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Stile</span>
              </div>
              {openSections.has('style') ? (
                <ChevronUp className="h-4 w-4 text-neutral-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              )}
            </button>
            
            <div
              className={cn(
                'transition-all duration-200 ease-in-out overflow-hidden',
                openSections.has('style')
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0'
              )}
            >
              <div className="p-3">
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((style) => (
                    <button
                      key={style}
                      type="button"
                      className="px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-all"
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Availability - Collapsible */}
        <div className="border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('availability')}
            className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Disponibilità</span>
              {getSectionCount('availability') > 0 && (
                <Badge variant="secondary" className="h-5 text-xs">
                  {getSectionCount('availability')}
                </Badge>
              )}
            </div>
            {openSections.has('availability') ? (
              <ChevronUp className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            )}
          </button>
          
          <div
            className={cn(
              'transition-all duration-200 ease-in-out overflow-hidden',
              openSections.has('availability')
                ? 'max-h-96 opacity-100'
                : 'max-h-0 opacity-0'
            )}
          >
            <div className="p-3 space-y-2">
              {AVAILABILITY_STATUS.map((status) => (
                <label
                  key={status.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={filters.availabilityStatus.includes(status.value)}
                    onChange={() => toggleArrayFilter('availabilityStatus', status.value)}
                    className="rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{status.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Price Range - Collapsible */}
        <div className="border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Fascia di Prezzo</span>
            </div>
            {openSections.has('price') ? (
              <ChevronUp className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            )}
          </button>
          
          <div
            className={cn(
              'transition-all duration-200 ease-in-out overflow-hidden',
              openSections.has('price')
                ? 'max-h-96 opacity-100'
                : 'max-h-0 opacity-0'
            )}
          >
            <div className="p-3 space-y-2">
              {['< €5K', '€5K - €15K', '€15K - €50K', '> €50K'].map((range) => (
                <label
                  key={range}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={filters.priceRange.includes(range)}
                    onChange={() => toggleArrayFilter('priceRange', range)}
                    className="rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{range}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">
                Filtri Attivi
              </span>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Rimuovi Tutti
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.nationality.map((nat) => (
                <Badge
                  key={nat}
                  variant="secondary"
                  className="cursor-pointer hover:bg-neutral-300"
                  onClick={() => toggleArrayFilter('nationality', nat)}
                >
                  {nat}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              {filters.city.map((city) => (
                <Badge
                  key={city}
                  variant="secondary"
                  className="cursor-pointer hover:bg-neutral-300"
                  onClick={() => toggleArrayFilter('city', city)}
                >
                  {city}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              {filters.medium.map((med) => (
                <Badge
                  key={med}
                  variant="secondary"
                  className="cursor-pointer hover:bg-neutral-300"
                  onClick={() => toggleArrayFilter('medium', med)}
                >
                  {med}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              {filters.availabilityStatus.map((status) => (
                <Badge
                  key={status}
                  variant="secondary"
                  className="cursor-pointer hover:bg-neutral-300"
                  onClick={() => toggleArrayFilter('availabilityStatus', status)}
                >
                  {AVAILABILITY_STATUS.find((s) => s.value === status)?.label}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}