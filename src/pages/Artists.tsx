import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Artist, ArtistFilters as Filters } from '@/types/artist'
import { exportArtistsToCSV, downloadCSV } from '@/lib/artistUtils'
import { useLoadData } from '@/hooks/useLoadData'
import PageHeader from '@/components/PageHeader'
import ArtistCard from '@/components/artists/ArtistCard'
import ArtistFilters from '@/components/artists/ArtistFilters'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { mapArtists } from '../utils/typeMappers'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Download, Upload, LayoutGrid, Grid3x3, List, Users, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewMode = 'grid-large' | 'grid-small' | 'list'

export default function Artists() {
  const { user } = useAuth()
  
  const [artists, setArtists] = useState<Artist[]>([])
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [nationalities, setNationalities] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [artistToDelete, setArtistToDelete] = useState<{ id: string; name: string } | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('artists-view-mode')
    return (saved as ViewMode) || 'grid-large'
  })
  
  const itemsPerPage = 12

  const [filters, setFilters] = useState<Filters>({
    search: '',
    nationality: [],
    city: [],
    medium: [],
    priceRange: [],
    availabilityStatus: [],
  })

  useEffect(() => {
    localStorage.setItem('artists-view-mode', viewMode)
  }, [viewMode])

  const fetchArtists = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('artists')
        .select(`
          *,
          images:artist_images(*)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setArtists(mapArtists(data || []))
      
      const uniqueNationalities = Array.from(
        new Set(
          data
            ?.map((a: any) => a.nationality)
            .filter((nationality): nationality is string => Boolean(nationality))
        )
      ).sort()
      setNationalities(uniqueNationalities)

      const uniqueCities = Array.from(
        new Set(
          data
            ?.map((a: any) => a.city)
            .filter((city): city is string => Boolean(city))
        )
      ).sort()
      setCities(uniqueCities)

    } catch (error) {
      console.error('Error fetching artists:', error)
      throw error
    }
  }

  const { loading, error } = useLoadData(fetchArtists, {
    deps: [user?.id],
    onError: (err) => {
      toast.error('Impossibile caricare gli artisti')
      console.error('Fetch artists error:', err)
    }
  })

  useEffect(() => {
    applyFilters()
  }, [artists, filters])

  const applyFilters = () => {
    let filtered = [...artists]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(artist => 
        artist.first_name.toLowerCase().includes(searchLower) ||
        artist.last_name.toLowerCase().includes(searchLower) ||
        artist.artist_name?.toLowerCase().includes(searchLower) ||
        artist.bio?.toLowerCase().includes(searchLower) ||
        artist.medium?.some(m => m.toLowerCase().includes(searchLower)) ||
        artist.style_tags?.some(t => t.toLowerCase().includes(searchLower))
      )
    }

    if (filters.nationality.length > 0) {
      filtered = filtered.filter(artist =>
        artist.nationality && filters.nationality.includes(artist.nationality)
      )
    }

    if (filters.city.length > 0) {
      filtered = filtered.filter(artist =>
        artist.city && filters.city.includes(artist.city)
      )
    }

    if (filters.medium.length > 0) {
      filtered = filtered.filter(artist =>
        artist.medium?.some(m => filters.medium.includes(m))
      )
    }

    if (filters.priceRange.length > 0) {
      filtered = filtered.filter(artist =>
        artist.price_range && filters.priceRange.includes(artist.price_range)
      )
    }

    if (filters.availabilityStatus.length > 0) {
      filtered = filtered.filter(artist =>
        artist.availability_status && 
        filters.availabilityStatus.includes(artist.availability_status)
      )
    }

    setFilteredArtists(filtered)
    setCurrentPage(1)
  }

  const handleDeleteClick = (artistId: string) => {
    const artist = artists.find(a => a.id === artistId)
    if (!artist) return
    
    const artistName = artist.artist_name || `${artist.first_name} ${artist.last_name}`
    setArtistToDelete({ id: artistId, name: artistName })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!artistToDelete) return

    try {
      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', artistToDelete.id)

      if (error) throw error

      setArtists(artists.filter(a => a.id !== artistToDelete.id))
      toast.success('Artista eliminato con successo')
    } catch (error) {
      console.error('Error deleting artist:', error)
      toast.error('Impossibile eliminare l\'artista')
    } finally {
      setDeleteDialogOpen(false)
      setArtistToDelete(null)
    }
  }

  const handleExport = () => {
    const csv = exportArtistsToCSV(filteredArtists)
    downloadCSV(csv, `artisti-${new Date().toISOString().split('T')[0]}.csv`)
    toast.success('Export completato con successo')
  }

  const toggleFavorite = (id: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
      } else {
        newFavorites.add(id)
      }
      return newFavorites
    })
  }

  // Pagination
  const totalPages = Math.ceil(filteredArtists.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentArtists = filteredArtists.slice(startIndex, endIndex)

  // Count active filters
  const activeFiltersCount = 
    filters.nationality.length +
    filters.city.length +
    filters.medium.length +
    filters.priceRange.length +
    filters.availabilityStatus.length

  return (
    <div>
      <PageHeader
        title="Database Artisti"
        description={`${filteredArtists.length} artisti totali`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Artisti' }
        ]}
        action={
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={handleExport}
              disabled={loading || filteredArtists.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Esporta
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app/artists/import">
                <Upload className="h-4 w-4 mr-2" />
                Importa CSV
              </Link>
            </Button>
            <Button asChild>
              <Link to="/app/artists/new">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Artista
              </Link>
            </Button>
          </div>
        }
      />

      {/* Layout a 2 Colonne */}
      <div className="flex gap-6">
        {/* SIDEBAR SINISTRA - Filtri Desktop */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-6">
            <ArtistFilters
              filters={filters}
              onFiltersChange={setFilters}
              nationalities={nationalities}
              cities={cities}
            />
          </div>
        </aside>

        {/* COLONNA PRINCIPALE - Contenuto */}
        <div className="flex-1 min-w-0">
          {/* Header Mobile + View Toggle */}
          <div className="mb-6 space-y-4">
            {/* Mobile Filters Button */}
            <div className="lg:hidden flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(true)}
                className="flex-1 mr-3"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtri
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {/* View Mode Toggle Mobile */}
              <div className="inline-flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid-large')}
                  className={cn(
                    "p-2 rounded transition-colors",
                    viewMode === 'grid-large'
                      ? 'bg-primary text-white'
                      : 'text-neutral-400 hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid-small')}
                  className={cn(
                    "p-2 rounded transition-colors",
                    viewMode === 'grid-small'
                      ? 'bg-primary text-white'
                      : 'text-neutral-400 hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded transition-colors",
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'text-neutral-400 hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* View Mode Toggle Desktop */}
            <div className="hidden lg:flex justify-end">
              <div className="inline-flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid-large')}
                  className={cn(
                    "p-2 rounded transition-colors",
                    viewMode === 'grid-large'
                      ? 'bg-primary text-white'
                      : 'text-neutral-400 hover:text-primary hover:bg-primary/10'
                  )}
                  title="Griglia grande"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid-small')}
                  className={cn(
                    "p-2 rounded transition-colors",
                    viewMode === 'grid-small'
                      ? 'bg-primary text-white'
                      : 'text-neutral-400 hover:text-primary hover:bg-primary/10'
                  )}
                  title="Scacchiera"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded transition-colors",
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'text-neutral-400 hover:text-primary hover:bg-primary/10'
                  )}
                  title="Lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid-large' && 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
              viewMode === 'grid-small' && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5',
              viewMode === 'list' && 'grid-cols-1'
            )}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className={viewMode === 'list' ? 'h-20 w-full' : 'aspect-square w-full'} />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-600 mb-4">Errore nel caricamento degli artisti</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Riprova
              </Button>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
              <p className="text-neutral-600 mb-4">
                {filters.search || activeFiltersCount > 0
                  ? 'Nessun artista trovato con i filtri selezionati'
                  : 'Nessun artista nel database'
                }
              </p>
              {activeFiltersCount > 0 ? (
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({
                    search: '',
                    nationality: [],
                    city: [],
                    medium: [],
                    priceRange: [],
                    availabilityStatus: [],
                  })}
                >
                  Rimuovi Filtri
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/app/artists/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi il primo artista
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Grid Large View */}
              {viewMode === 'grid-large' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentArtists.map((artist) => (
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      onDelete={handleDeleteClick}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.has(artist.id)}
                    />
                  ))}
                </div>
              )}

              {/* Grid Small View */}
              {viewMode === 'grid-small' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                  {currentArtists.map((artist) => (
                    <ArtistCardSmall
                      key={artist.id}
                      artist={artist}
                      onDelete={handleDeleteClick}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.has(artist.id)}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-3">
                  {currentArtists.map((artist) => (
                    <ArtistListItem
                      key={artist.id}
                      artist={artist}
                      onDelete={handleDeleteClick}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.has(artist.id)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-neutral-600">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredArtists.length)} di{' '}
                    {filteredArtists.length} artisti
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Precedente
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            onClick={() => setCurrentPage(page)}
                            size="sm"
                          >
                            {page}
                          </Button>
                        )
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-neutral-400">...</span>
                          <Button
                            variant={currentPage === totalPages ? 'default' : 'outline'}
                            onClick={() => setCurrentPage(totalPages)}
                            size="sm"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Successiva
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
          <div 
            className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Filtri</h3>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <ArtistFilters
                filters={filters}
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters)
                  setShowMobileFilters(false)
                }}
                nationalities={nationalities}
                cities={cities}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare <strong>{artistToDelete?.name}</strong>?
              <br /><br />
              Questa azione non può essere annullata. Verranno eliminate anche tutte le immagini associate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Elimina definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Card Components (Small & List)
interface ArtistCardSmallProps {
  artist: Artist
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  isFavorite: boolean
}

function ArtistCardSmall({ artist }: ArtistCardSmallProps) {
  const artistName = artist.artist_name || `${artist.first_name} ${artist.last_name}`
  const primaryImage = artist.images?.[0]?.image_url

  return (
    <Link to={`/artists/${artist.id}`} className="group block">
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={artistName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-12 h-12 text-neutral-300" />
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="font-medium text-sm text-neutral-900 group-hover:text-primary transition-colors line-clamp-1">
            {artistName}
          </p>
          {artist.nationality && (
            <p className="mt-1 text-xs text-neutral-500 line-clamp-1">
              {artist.nationality}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

interface ArtistListItemProps {
  artist: Artist
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  isFavorite: boolean
}

function ArtistListItem({ artist }: ArtistListItemProps) {
  const artistName = artist.artist_name || `${artist.first_name} ${artist.last_name}`
  const primaryImage = artist.images?.[0]?.image_url
  const birthYear = artist.birth_date ? new Date(artist.birth_date).getFullYear() : undefined

  return (
    <Link 
      to={`/app/artists/${artist.id}`}
      className="group flex items-center gap-4 bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden flex-shrink-0">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={artistName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-8 h-8 text-neutral-300" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-neutral-900 group-hover:text-primary transition-colors">
          {artistName}
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-1">
          {artist.nationality && (
            <span className="text-sm text-neutral-500">{artist.nationality}</span>
          )}
          {birthYear && (
            <span className="text-sm text-neutral-400">Nato nel {birthYear}</span>
          )}
          {artist.medium && artist.medium.length > 0 && (
            <span className="text-sm text-neutral-400">
              {artist.medium.slice(0, 2).join(', ')}
              {artist.medium.length > 2 && ` +${artist.medium.length - 2}`}
            </span>
          )}
        </div>
        {artist.bio && (
          <p className="mt-2 text-sm text-neutral-600 line-clamp-1">{artist.bio}</p>
        )}
      </div>

      <div className="text-neutral-400 group-hover:text-primary transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}