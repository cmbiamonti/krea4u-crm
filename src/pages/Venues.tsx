// src/pages/Venues.tsx

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom' // ✅ Aggiungi useLocation
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Venue, VenueFilters as Filters } from '@/types/venue'
import { filterVenues, sortVenues, exportVenuesToCSV } from '@/lib/venueUtils'
import { downloadCSV } from '@/lib/artistUtils'
import { useLoadData } from '@/hooks/useLoadData'
import PageHeader from '@/components/PageHeader'
import VenueCard from '@/components/venues/VenueCard'
import VenueFilters from '@/components/venues/VenueFilters'
import VenueMapView from '@/components/venues/VenueMapView'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { mapVenues } from '../utils/typeMappers'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Download, Grid3x3, List, MapIcon, Filter, RefreshCw } from 'lucide-react' // ✅ Aggiungi RefreshCw
import { cn } from '@/lib/utils'

export default function Venues() {
  const { user } = useAuth()
  const location = useLocation() // ✅ Per rilevare ritorno da dettaglio
  
  const [venues, setVenues] = useState<Venue[]>([])
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [cities, setCities] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  const [showFilters, setShowFilters] = useState(true)
  const [selectedVenues, setSelectedVenues] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [venueToDelete, setVenueToDelete] = useState<{ id: string; name: string } | null>(null)
  const [refreshing, setRefreshing] = useState(false) // ✅ Stato refresh manuale

  const itemsPerPage = 12

  const [filters, setFilters] = useState<Filters>({
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

  // ✅ FUNZIONE DI CARICAMENTO CON LOG DETTAGLIATI
  const fetchVenues = async () => {
    if (!user?.id) return

    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📂 LOADING VENUES LIST')
      console.log('User:', user.id)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      const { data, error } = await supabase
        .from('venues')
        .select(`
          *,
          images:venue_images(
            id,
            image_url,
            caption,
            sort_order
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Fetch error:', error)
        throw error
      }

      console.log('✅ Raw data loaded:', data?.length, 'venues')
      
      // ✅ Log dettagliato per ogni venue
      data?.forEach(v => {
        const imageCount = v.images?.length || 0
        console.log(`━━━ ${v.venue_name} ━━━`)
        console.log(`  Total images: ${imageCount}`)
        
        if (v.images && v.images.length > 0) {
          // ✅ Ordina per sort_order per vedere l'ordine reale
          const sortedImages = [...v.images].sort((a, b) => 
            (a.sort_order || 0) - (b.sort_order || 0)
          )
          
          sortedImages.forEach((img: any, idx) => {
            console.log(`  ${idx + 1}. sort_order: ${img.sort_order || 'NULL'} | ${img.image_url.split('/app').pop()}`)
          })
          
          // ✅ Evidenzia quale sarà usata come principale
          console.log(`  ⭐ Primary will be: ${sortedImages[0].image_url.split('/app').pop()}`)
        } else {
          console.log(`  ⚠️ No images`)
        }
      })
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔄 Mapping venues...')
      
      const venueData = mapVenues(data || [])
      
      // ✅ Verifica dopo mapping
      console.log('✅ After mapping:')
      venueData.forEach(v => {
        const primaryImg = v.images?.[0]?.image_url
        console.log(`  ${v.venue_name}: ${v.images?.length || 0} images, primary: ${primaryImg ? primaryImg.split('/app').pop() : 'NONE'}`)
      })
      
      setVenues(venueData || [])

      const uniqueCities = Array.from(
        new Set(
          venueData
            ?.map((v: Venue) => v.city)
            .filter((city): city is string => Boolean(city))
        )
      ).sort()
      setCities(uniqueCities)
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    } catch (error) {
      console.error('❌ Error fetching venues:', error)
      throw error
    }
  }

  const { loading, error } = useLoadData(fetchVenues, {
    deps: [user?.id],
    onError: (err) => {
      toast.error('Impossibile caricare gli spazi')
      console.error('Fetch venues error:', err)
    }
  })

  // ✅ RICARICA AUTOMATICA quando torni dalla pagina dettaglio
  useEffect(() => {
    console.log('🔄 Location changed:', location.pathname)
    
    // Se sei sulla pagina /venues (non su /venues/:id)
    if (location.pathname === '/app/venues' && user?.id) {
      console.log('🔄 Back to venues list, reloading...')
      fetchVenues()
    }
  }, [location.pathname, user?.id])

  // ✅ RICARICA quando la finestra torna in focus
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Window focused, checking if reload needed...')
        // Ricarica solo se sei sulla pagina venues
        if (location.pathname === '/app/venues') {
          console.log('🔄 Reloading venues on focus...')
          fetchVenues()
        }
      }
    }

    document.addEventListener('visibilitychange', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [location.pathname])

  useEffect(() => {
    applyFiltersAndSort()
  }, [venues, filters, sortBy])

  const applyFiltersAndSort = () => {
    let filtered = filterVenues(venues, filters)
    filtered = sortVenues(filtered, sortBy, filters)
    setFilteredVenues(filtered)
    setCurrentPage(1)
  }

  // ✅ REFRESH MANUALE
  const handleManualRefresh = async () => {
    setRefreshing(true)
    console.log('🔄 Manual refresh triggered')
    await fetchVenues()
    toast.success('Elenco aggiornato')
    setRefreshing(false)
  }

  const handleDeleteClick = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId)
    if (!venue) return
    
    setVenueToDelete({ id: venueId, name: venue.venue_name })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!venueToDelete) return

    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venueToDelete.id)

      if (error) throw error

      setVenues(venues.filter(v => v.id !== venueToDelete.id))
      toast.success('Spazio eliminato con successo')
    } catch (error) {
      console.error('Error deleting venue:', error)
      toast.error('Impossibile eliminare lo spazio')
    } finally {
      setDeleteDialogOpen(false)
      setVenueToDelete(null)
    }
  }

  const handleExport = () => {
    const csv = exportVenuesToCSV(filteredVenues)
    downloadCSV(csv, `spazi-${new Date().toISOString().split('T')[0]}.csv`)
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

  const toggleVenueSelection = (id: string) => {
    setSelectedVenues(prevSelected => {
      const newSelected = new Set(prevSelected)
      if (newSelected.has(id)) {
        newSelected.delete(id)
      } else {
        if (newSelected.size >= 4) {
          toast.error('Puoi confrontare massimo 4 spazi')
          return prevSelected
        }
        newSelected.add(id)
      }
      return newSelected
    })
  }

  const handleSaveSearch = async (name: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name: name,
          filters: JSON.stringify(filters),
          search_type: 'venues',
        })

      if (error) throw error

      toast.success('Ricerca salvata con successo')
    } catch (error) {
      console.error('Error saving search:', error)
      toast.error('Impossibile salvare la ricerca')
    }
  }

  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVenues = filteredVenues.slice(startIndex, endIndex)

  return (
    <div>
      <PageHeader
        title="Database Spazi"
        description={`${filteredVenues.length} spazi trovati`}
        breadcrumbs={[{ label: 'Dashboard', href: '/app' }, { label: 'Spazi' }]}
        action={
          <div className="flex flex-wrap gap-2">
            {/* ✅ Bottone Refresh Manuale */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing || loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              Aggiorna
            </Button>
            
            {selectedVenues.size > 0 && (
              <Button variant="outline" asChild>
                <Link to={`/app/venues/compare?ids=${Array.from(selectedVenues).join(',')}`}>
                  Confronta ({selectedVenues.size})
                </Link>
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleExport}
              disabled={loading || filteredVenues.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Esporta
            </Button>
            <Button asChild>
              <Link to="/app/venues/new">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Spazio
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex gap-6">
        {/* LEFT PANEL - Filters */}
        <aside
          className={cn(
            'w-80 flex-shrink-0 transition-all duration-300',
            showFilters ? 'block' : 'hidden lg:block lg:w-0 lg:overflow-hidden'
          )}
        >
          <div className="sticky top-6">
            <VenueFilters
              filters={filters}
              onFiltersChange={setFilters}
              cities={cities}
              onSaveSearch={handleSaveSearch}
            />
          </div>
        </aside>

        {/* RIGHT PANEL - Results */}
        <div className="flex-1 min-w-0">
          {/* Controls Bar */}
          <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtri
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordina per..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Rilevanza</SelectItem>
                    <SelectItem value="price_asc">Prezzo (crescente)</SelectItem>
                    <SelectItem value="price_desc">Prezzo (decrescente)</SelectItem>
                    <SelectItem value="size_asc">Dimensione (crescente)</SelectItem>
                    <SelectItem value="size_desc">Dimensione (decrescente)</SelectItem>
                    <SelectItem value="rating">Valutazione</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  aria-label="Vista griglia"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  aria-label="Vista lista"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  aria-label="Vista mappa"
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div
              className={cn(
                'grid gap-6',
                viewMode === 'grid' && 'grid-cols-1 lg:grid-cols-2',
                viewMode === 'list' && 'grid-cols-1'
              )}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-600 mb-4">
                Errore nel caricamento degli spazi
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Riprova
              </Button>
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
              <p className="text-neutral-600 mb-4">
                {filters.search || filters.city.length > 0 || filters.venueType.length > 0
                  ? 'Nessuno spazio trovato con i filtri selezionati'
                  : 'Nessuno spazio nel database'
                }
              </p>
              <Button asChild>
                <Link to="/app/venues/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi il primo spazio
                </Link>
              </Button>
            </div>
          ) : viewMode === 'map' ? (
            <VenueMapView venues={currentVenues} />
          ) : (
            <>
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid' && 'grid-cols-1 lg:grid-cols-2',
                  viewMode === 'list' && 'grid-cols-1'
                )}
              >
                {currentVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    onDelete={handleDeleteClick}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={favorites.has(venue.id)}
                    onSelect={toggleVenueSelection}
                    isSelected={selectedVenues.has(venue.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-neutral-600">
                    Mostrando {startIndex + 1}-
                    {Math.min(endIndex, filteredVenues.length)} di{' '}
                    {filteredVenues.length} spazi
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
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

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare <strong>{venueToDelete?.name}</strong>?
              <br />
              <br />
              Questa azione non può essere annullata. Verranno eliminate anche tutte le immagini e i dati associati.
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