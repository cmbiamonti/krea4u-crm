// src/pages/VenueDetail.tsx

import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Venue } from '@/types/venue'
import { getVenueWithImages } from '@/lib/venueUtils'
import { formatCurrency } from '@/lib/utils'
import { useLoadData } from '@/hooks/useLoadData'
import PageHeader from '@/components/PageHeader'
import MapWrapper from '@/components/maps/MapWrapper'
import ImageManager from '@/components/artists/ImageManager' // ✅ Import stesso componente
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Mail,
  Phone,
  Globe,
  MapPin,
  Maximize,
  Users,
  Ruler,
  Euro,
  Star,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Edit2, // ✅ Aggiunto
  Image as ImageIcon, // ✅ Aggiunto
} from 'lucide-react'
import { AMENITIES, VENUE_TYPES, PRICING_MODELS } from '@/types/venue'
import { exportVenueToPDF } from '@/lib/exportVenuePDF'

export default function VenueDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [venue, setVenue] = useState<Venue | null>(null)
  const [exporting, setExporting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [editMode, setEditMode] = useState(false) // ✅ Aggiunto
  const [images, setImages] = useState<any[]>([]) // ✅ Aggiunto

  // ✅ FUNZIONE DI CARICAMENTO
  const fetchVenue = async () => {
    if (!id) {
      navigate('/app/venues')
      return
    }

    try {
      const data = await getVenueWithImages(id)

      if (!data) {
        toast.error('Spazio non trovato')
        navigate('/app/venues')
        return
      }

      setVenue(data)
      
      // ✅ Carica immagini nello stato locale
      if (data.images) {
        setImages(
          data.images.map((img: any) => ({
            id: img.id,
            url: img.image_url,
            caption: img.caption || '',
            sort_order: img.sort_order || 0,
          }))
        )
      }
    } catch (error) {
      console.error('Error fetching venue:', error)
      throw error
    }
  }

  const { loading, error } = useLoadData(fetchVenue, {
    deps: [id],
    onError: (err) => {
      toast.error('Impossibile caricare i dettagli dello spazio')
      console.error('Fetch venue error:', err)
    }
  })

  // ✅ CONFERMA DELETE
  const handleDelete = async () => {
    if (!id) return

    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Spazio eliminato con successo')
      navigate('/app/venues')
    } catch (error) {
      console.error('Error deleting venue:', error)
      toast.error('Impossibile eliminare lo spazio')
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const handleExportPDF = async () => {
    if (!venue) return

    setExporting(true)
    try {
      await exportVenueToPDF(venue)
      toast.success('Scheda tecnica PDF generata con successo')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Impossibile generare il PDF')
    } finally {
      setExporting(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copiato negli appunti')
  }

  // ✅ Handler per cambio immagini (da ImageManager)
  const handleImagesChange = (newImages: any[]) => {
  console.log('📸 Images changed:', newImages.length)
  console.log('New order:', newImages.map((img, i) => ({ id: img.id, order: i + 1 })))
  setImages(newImages)
  }

  // ✅ Toggle edit mode
  const handleToggleEditMode = () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔄 TOGGLE EDIT MODE')
    console.log('Current editMode:', editMode)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    if (editMode) {
      // ✅ Quando esci da edit mode, ricarica
      console.log('🔄 Exiting edit mode, reloading venue...')
      fetchVenue() // ✅ QUESTO DEVE ESSERCI
    }
    
    setEditMode(!editMode)
  }

  const nextImage = () => {
    if (!images || images.length === 0) return
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    if (!images || images.length === 0) return
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div>
        <PageHeader
          title="Errore"
          description="Impossibile caricare lo spazio"
          breadcrumbs={[
            { label: 'Dashboard', href: '/app' },
            { label: 'Spazi', href: '/app/venues' },
            { label: 'Errore' },
          ]}
        />
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center">
            <p className="text-red-600 mb-4">
              Errore nel caricamento dei dati dello spazio
            </p>
            <Button variant="outline" asChild>
              <Link to="/app/venues">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla lista spazi
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const venueTypeLabel =
    VENUE_TYPES.find((t) => t.value === venue.venue_type)?.label ||
    venue.venue_type
  const pricingModelLabel =
    PRICING_MODELS.find((p) => p.value === venue.pricing_model)?.label ||
    venue.pricing_model

  const amenityLabels = AMENITIES.reduce((acc, a) => {
    acc[a.value] = a.label
    return acc
  }, {} as Record<string, string>)

  return (
    <div>
      <PageHeader
        title={venue.venue_name}
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Spazi', href: '/app/venues' },
          { label: venue.venue_name },
        ]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Condividi
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generazione...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Esporta PDF
                </>
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/app/venues/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Link>
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Elimina
            </Button>
          </div>
        }
      />

      {/* ✅ Image Section con Gestione Avanzata */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Immagini Spazio
            </CardTitle>
            {/* ✅ Bottone Edit Mode */}
            {images.length > 0 && (
              <Button
                variant={editMode ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleEditMode}
              >
                {editMode ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Chiudi
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Modifica Ordine
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600 mb-4">Nessuna immagine caricata</p>
              <Button variant="outline" asChild>
                <Link to={`/app/venues/${id}/edit`}>
                  Aggiungi immagini
                </Link>
              </Button>
            </div>
          ) : editMode ? (
            /* ✅ Modalità Edit: Drag & Drop */
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Trascina</strong> le immagini per cambiare l'ordine. 
                  La prima sarà quella principale. 
                  Le modifiche vengono <strong>salvate automaticamente</strong>.
                </p>
              </div>
              <ImageManager
                images={images}
                onImagesChange={handleImagesChange}
                itemId={id}
                tableName="venue_images"
                storageBucket="venue-images"
                autoSave={true}
              />
            </div>
          ) : (
            /* ✅ Modalità View: Carousel + Grid */
            <>
              {/* Carousel Principale */}
              <div className="relative aspect-[21/9] bg-neutral-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={images[currentImageIndex].url}
                  alt={images[currentImageIndex].caption || venue.venue_name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowLightbox(true)}
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Badge Principale */}
                {currentImageIndex === 0 && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                    ⭐ Principale
                  </div>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>

                {/* Caption */}
                {images[currentImageIndex].caption && (
                  <div className="absolute bottom-4 left-4 right-20 bg-black/70 text-white p-3 rounded-lg">
                    <p className="text-sm">{images[currentImageIndex].caption}</p>
                  </div>
                )}
              </div>

              {/* Thumbnails Grid */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent hover:border-neutral-300'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.caption || `Immagine ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Badge #1 su thumbnail */}
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 bg-yellow-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                          #1
                        </div>
                      )}
                      {/* Numero su hover */}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-colors">
                        <span className="text-white text-xs font-medium opacity-0 hover:opacity-100">
                          #{idx + 1}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Header Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-heading font-bold text-neutral-900">
                    {venue.venue_name}
                  </h2>
                  {venueTypeLabel && (
                    <Badge variant="secondary">{venueTypeLabel}</Badge>
                  )}
                </div>
                {venue.city && (
                  <p className="text-lg text-neutral-600 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {venue.neighborhood ? `${venue.neighborhood}, ` : ''}
                    {venue.city}
                  </p>
                )}
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {venue.size_sqm && (
                  <div className="flex items-center gap-2">
                    <Maximize className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="text-sm text-neutral-600">Dimensione</p>
                      <p className="font-semibold">{venue.size_sqm} m²</p>
                    </div>
                  </div>
                )}
                {venue.number_of_rooms && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="text-sm text-neutral-600">Sale</p>
                      <p className="font-semibold">{venue.number_of_rooms}</p>
                    </div>
                  </div>
                )}
                {venue.ceiling_height && (
                  <div className="flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="text-sm text-neutral-600">Altezza</p>
                      <p className="font-semibold">{venue.ceiling_height} m</p>
                    </div>
                  </div>
                )}
                {venue.rental_fee && (
                  <div className="flex items-center gap-2">
                    <Euro className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="text-sm text-neutral-600">Tariffa</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(venue.rental_fee)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t">
                {venue.contact_name && (
                  <p className="text-sm">
                    <span className="text-neutral-600">Referente:</span>{' '}
                    <span className="font-medium">{venue.contact_name}</span>
                  </p>
                )}
                {venue.email && (
                  <a
                    href={`mailto:${venue.email}`}
                    className="text-sm flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {venue.email}
                  </a>
                )}
                {venue.phone && (
                  <a
                    href={`tel:${venue.phone}`}
                    className="text-sm flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {venue.phone}
                  </a>
                )}
                {venue.website && (
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    {venue.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="features">Caratteristiche</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="reviews">Recensioni</TabsTrigger>
          <TabsTrigger value="events">Eventi Passati</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          {venue.description && (
            <Card>
              <CardHeader>
                <CardTitle>Descrizione</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 whitespace-pre-wrap">
                  {venue.description}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {venue.address && (
                  <p className="text-neutral-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    {venue.address}
                    {venue.city && `, ${venue.city}`}
                  </p>
                )}

                {venue.latitude && venue.longitude ? (
                  <MapWrapper
                    latitude={venue.latitude}
                    longitude={venue.longitude}
                    venueName={venue.venue_name}
                    address={
                      venue.address && venue.city
                        ? `${venue.address}, ${venue.city}`
                        : venue.address || venue.city || ''
                    }
                    height="450px"
                    zoom={16}
                    showControls={true}
                  />
                ) : (
                  <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600 font-medium">
                        Coordinate non disponibili
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Modifica lo spazio per aggiungere la posizione GPS
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        asChild
                      >
                        <Link to={`/app/venues/${id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Aggiungi coordinate
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Features */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Specifiche Tecniche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {venue.size_sqm && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Dimensione</span>
                    <span className="font-semibold">{venue.size_sqm} m²</span>
                  </div>
                )}
                {venue.ceiling_height && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Altezza soffitti</span>
                    <span className="font-semibold">{venue.ceiling_height} m</span>
                  </div>
                )}
                {venue.number_of_rooms && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Numero sale</span>
                    <span className="font-semibold">{venue.number_of_rooms}</span>
                  </div>
                )}
                {venue.natural_light !== null && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Luce naturale</span>
                    <span className="font-semibold">
                      {venue.natural_light ? 'Sì' : 'No'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servizi</CardTitle>
              </CardHeader>
              <CardContent>
                {venue.amenities && venue.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {venue.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        <span className="text-sm">
                          {amenityLabels[amenity] || amenity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500">Nessun servizio specificato</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Pricing */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Modello di Pricing</h4>
                  <p className="text-neutral-700">
                    {pricingModelLabel || 'Non specificato'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tariffa</h4>
                  <p className="text-2xl font-bold text-primary">
                    {venue.rental_fee
                      ? formatCurrency(venue.rental_fee)
                      : 'Su richiesta'}
                  </p>
                </div>
              </div>

              {venue.additional_costs && (
                <div>
                  <h4 className="font-semibold mb-2">Costi Aggiuntivi</h4>
                  <p className="text-neutral-700 whitespace-pre-wrap">
                    {venue.additional_costs}
                  </p>
                </div>
              )}

              {venue.cancellation_policy && (
                <div>
                  <h4 className="font-semibold mb-2">Politica di Cancellazione</h4>
                  <p className="text-neutral-700 whitespace-pre-wrap">
                    {venue.cancellation_policy}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button className="w-full md:w-auto">
                  <Calendar className="h-4 w-4 mr-2" />
                  Richiedi Disponibilità
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Reviews */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Recensioni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">Nessuna recensione disponibile</p>
                <p className="text-sm text-neutral-500 mt-2">
                  Le recensioni verranno mostrate dopo l'utilizzo dello spazio in progetti
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Past Events */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Eventi e Progetti Passati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">Nessun evento registrato</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions Footer */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between items-center p-6 bg-white rounded-lg border border-neutral-200">
        <Button variant="outline" asChild>
          <Link to="/app/venues">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla lista
          </Link>
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generazione...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Esporta scheda
              </>
            )}
          </Button>
          <Button asChild>
            <Link to={`/app/venues/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Modifica spazio
            </Link>
          </Button>
        </div>
      </div>

      {/* ✅ Lightbox Migliorato */}
      {showLightbox && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 text-2xl"
            onClick={() => setShowLightbox(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          
          <img
            src={images[currentImageIndex].url}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <ChevronLeft className="h-8 w-8 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </button>
            </>
          )}

          {/* Counter nel lightbox */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare <strong>{venue.venue_name}</strong>?
              <br />
              <br />
              Questa azione non può essere annullata. Verranno eliminate anche tutte le immagini e i dati associati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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