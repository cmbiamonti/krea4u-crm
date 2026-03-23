// src/pages/ArtistDetail.tsx

import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Artist, ArtistImage } from '@/types/artist'
import { getArtistWithImages } from '@/lib/artistUtils'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useLoadData } from '@/hooks/useLoadData'
import PageHeader from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Mail,
  Phone,
  Globe,
  Instagram,
  MapPin,
  Calendar,
  Palette,
  Euro,
  Package,
  Shield,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Maximize2,
  Ruler,
} from 'lucide-react'
import { exportArtistToPDF } from '@/lib/exportArtistPDF'

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [artist, setArtist] = useState<Artist | null>(null)
  const [exporting, setExporting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Lightbox state
  const [showLightbox, setShowLightbox] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Artwork detail modal
  const [selectedArtwork, setSelectedArtwork] = useState<ArtistImage | null>(null)
  const [artworkModalOpen, setArtworkModalOpen] = useState(false)

  // Funzione di caricamento
  const fetchArtist = async () => {
    if (!id) {
      navigate('/app/artists')
      return
    }

    try {
      const data = await getArtistWithImages(id)
      
      if (!data) {
        toast.error('Artista non trovato')
        navigate('/app/artists')
        return
      }

      setArtist(data)
    } catch (error) {
      console.error('Error fetching artist:', error)
      throw error
    }
  }

  const { loading, error } = useLoadData(fetchArtist, {
    deps: [id],
    onError: (err) => {
      toast.error('Impossibile caricare i dettagli dell\'artista')
      console.error('Fetch artist error:', err)
    }
  })

  const handleDelete = async () => {
    if (!id) return

    try {
      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Artista eliminato con successo')
      navigate('/app/artists')
    } catch (error) {
      console.error('Error deleting artist:', error)
      toast.error('Impossibile eliminare l\'artista')
    }
  }

  const handleExportPDF = async () => {
    if (!artist) return

    setExporting(true)
    try {
      await exportArtistToPDF(artist)
      toast.success('Portfolio PDF generato con successo')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Impossibile generare il PDF')
    } finally {
      setExporting(false)
    }
  }

  const nextImage = () => {
    if (!artist?.images) return
    setCurrentImageIndex((prev) =>
      prev === artist.images!.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    if (!artist?.images) return
    setCurrentImageIndex((prev) =>
      prev === 0 ? artist.images!.length - 1 : prev - 1
    )
  }

  // Helper per formattare dimensioni
  const formatDimensions = (image: ArtistImage) => {
    const parts = []
    if (image.artwork_width_cm) parts.push(`${image.artwork_width_cm} cm`)
    if (image.artwork_height_cm) parts.push(`${image.artwork_height_cm} cm`)
    if (image.artwork_depth_cm) parts.push(`${image.artwork_depth_cm} cm`)
    return parts.join(' × ')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !artist) {
    return (
      <div>
        <PageHeader
          title="Errore"
          description="Impossibile caricare l'artista"
          breadcrumbs={[
            { label: 'Dashboard', href: '/app' },
            { label: 'Artisti', href: '/app/artists' },
            { label: 'Errore' },
          ]}
        />
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center">
            <p className="text-red-600 mb-4">
              Errore nel caricamento dei dati dell'artista
            </p>
            <Button variant="outline" asChild>
              <Link to="/app/artists">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla lista artisti
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = artist.artist_name || `${artist.first_name} ${artist.last_name}`
  const initials = `${artist.first_name.charAt(0)}${artist.last_name.charAt(0)}`
  const primaryImage = artist.images?.[0]?.image_url

  return (
    <div>
      <PageHeader
        title={displayName}
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Artisti', href: '/app/artists' },
          { label: displayName }
        ]}
        action={
          <div className="flex gap-2">
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
              <Link to={`/app/artists/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Link>
            </Button>
            <Button
              variant="outline"
              className="text-error hover:bg-error/10"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Elimina
            </Button>
          </div>
        }
      />

      {/* Hero Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {primaryImage ? (
                <div className="w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    src={primaryImage}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <Avatar className="w-32 h-32">
                  <AvatarFallback className="bg-primary text-white text-3xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-heading font-bold text-neutral-900">
                  {displayName}
                </h2>
                <p className="text-lg text-neutral-600">
                  {artist.first_name} {artist.last_name}
                </p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {artist.nationality && artist.city && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    <span>{artist.city}, {artist.nationality}</span>
                  </div>
                )}
                {artist.birth_date && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Calendar className="h-4 w-4 text-neutral-500" />
                    <span>Nato il {formatDate(artist.birth_date)}</span>
                  </div>
                )}
                {artist.email && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Mail className="h-4 w-4 text-neutral-500" />
                    <a href={`mailto:${artist.email}`} className="hover:text-primary">
                      {artist.email}
                    </a>
                  </div>
                )}
                {artist.phone && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Phone className="h-4 w-4 text-neutral-500" />
                    <a href={`tel:${artist.phone}`} className="hover:text-primary">
                      {artist.phone}
                    </a>
                  </div>
                )}
                {artist.website && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Globe className="h-4 w-4 text-neutral-500" />
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary truncate"
                    >
                      {artist.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {artist.instagram_handle && (
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Instagram className="h-4 w-4 text-neutral-500" />
                    <a
                      href={`https://instagram.com/${artist.instagram_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      {artist.instagram_handle}
                    </a>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {artist.medium?.map((m, idx) => (
                  <Badge key={idx} variant="secondary">
                    {m}
                  </Badge>
                ))}
                {artist.style_tags?.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Status & Price */}
              <div className="flex gap-3">
                {artist.availability_status && (
                  <Badge
                    className={
                      artist.availability_status === 'available'
                        ? 'bg-success/10 text-success'
                        : artist.availability_status === 'busy'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-neutral-200 text-neutral-700'
                    }
                  >
                    {artist.availability_status === 'available' && 'Disponibile'}
                    {artist.availability_status === 'busy' && 'Impegnato'}
                    {artist.availability_status === 'unavailable' && 'Non disponibile'}
                  </Badge>
                )}
                {artist.price_range && (
                  <Badge variant="outline">
                    €{artist.price_range}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="portfolio">
            Portfolio ({artist.images?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="exhibitions">Esposizioni</TabsTrigger>
          <TabsTrigger value="logistics">Logistica</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          {artist.bio && (
            <Card>
              <CardHeader>
                <CardTitle>Biografia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 whitespace-pre-wrap">{artist.bio}</p>
              </CardContent>
            </Card>
          )}

          {artist.artist_statement && (
            <Card>
              <CardHeader>
                <CardTitle>Artist Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 whitespace-pre-wrap italic">
                  {artist.artist_statement}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Medium */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Medium
                </CardTitle>
              </CardHeader>
              <CardContent>
                {artist.medium && artist.medium.length > 0 ? (
                  <ul className="space-y-2">
                    {artist.medium.map((m, idx) => (
                      <li key={idx} className="text-neutral-700">• {m}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500">Non specificato</p>
                )}
              </CardContent>
            </Card>

            {/* Style Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Stile</CardTitle>
              </CardHeader>
              <CardContent>
                {artist.style_tags && artist.style_tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {artist.style_tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500">Non specificato</p>
                )}
              </CardContent>
            </Card>

            {/* Price & Insurance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Valutazione
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Fascia di prezzo</p>
                  <p className="font-semibold">
                    {artist.price_range ? `€${artist.price_range}` : 'Non specificato'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Valore assicurato</p>
                  <p className="font-semibold">
                    {artist.insurance_value
                      ? `€${artist.insurance_value.toLocaleString('it-IT')}`
                      : 'Non specificato'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Portfolio */}
        <TabsContent value="portfolio">
          {artist.images && artist.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artist.images.map((image, idx) => (
                <Card
                  key={image.id}
                  className="group overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  <div 
                    className="relative aspect-square bg-neutral-100 cursor-pointer"
                    onClick={() => {
                      setCurrentImageIndex(idx)
                      setShowLightbox(true)
                    }}
                  >
                    <img
                      src={image.image_url}
                      alt={image.artwork_title || `Opera ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Overlay with Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                        {/* Title */}
                        {image.artwork_title && (
                          <h4 className="text-white font-semibold text-sm line-clamp-2">
                            {image.artwork_title}
                          </h4>
                        )}

                        {/* Quick Info */}
                        <div className="flex items-center gap-2 text-xs text-white/90">
                          {image.artwork_year && <span>{image.artwork_year}</span>}
                          {image.artwork_technique && image.artwork_year && (
                            <span>•</span>
                          )}
                          {image.artwork_technique && (
                            <span className="line-clamp-1">{image.artwork_technique}</span>
                          )}
                        </div>

                        {/* Details Button */}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedArtwork(image)
                            setArtworkModalOpen(true)
                          }}
                        >
                          <FileText className="h-3 w-3 mr-2" />
                          Dettagli Opera
                        </Button>
                      </div>
                    </div>

                    {/* Price Badge */}
                    {image.artwork_price && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-success text-white shadow-lg">
                          {formatCurrency(image.artwork_price)}
                        </Badge>
                      </div>
                    )}

                    {/* Dimensions Badge */}
                    {(image.artwork_width_cm || image.artwork_height_cm) && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs">
                          {image.artwork_width_cm || '?'} × {image.artwork_height_cm || '?'} cm
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {image.artwork_title || 'Senza titolo'}
                      </h4>
                      
                      <div className="flex items-center justify-between text-xs text-neutral-600">
                        <span>{image.artwork_year || 'Anno sconosciuto'}</span>
                        {image.artwork_technique && (
                          <span className="line-clamp-1 max-w-[120px]">
                            {image.artwork_technique}
                          </span>
                        )}
                      </div>

                      {image.caption && (
                        <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                          {image.caption}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
              <p className="text-neutral-600 mb-2">Nessuna immagine nel portfolio</p>
              <Button variant="outline" asChild>
                <Link to={`/app/artists/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Aggiungi opere
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Exhibitions */}
        <TabsContent value="exhibitions">
          <Card>
            <CardHeader>
              <CardTitle>Storia Espositiva</CardTitle>
            </CardHeader>
            <CardContent>
              {artist.exhibition_history ? (
                <div className="prose max-w-none">
                  <p className="text-neutral-700 whitespace-pre-wrap">
                    {artist.exhibition_history}
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
                  <p className="text-neutral-600">
                    Nessuna storia espositiva registrata
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Logistics */}
        <TabsContent value="logistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Spedizione
                </CardTitle>
              </CardHeader>
              <CardContent>
                {artist.shipping_preferences ? (
                  <p className="text-neutral-700 whitespace-pre-wrap">
                    {artist.shipping_preferences}
                  </p>
                ) : (
                  <p className="text-neutral-500">Non specificato</p>
                )}
              </CardContent>
            </Card>

            {/* Insurance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Assicurazione
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Valore assicurato</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {artist.insurance_value
                      ? formatCurrency(artist.insurance_value)
                      : 'Non specificato'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Stato disponibilità</p>
                  <Badge
                    className={
                      artist.availability_status === 'available'
                        ? 'bg-success/10 text-success'
                        : artist.availability_status === 'busy'
                        ? 'bg-accent/10 text-accent-400'
                        : 'bg-neutral-200 text-neutral-700'
                    }
                  >
                    {artist.availability_status === 'available' && 'Disponibile'}
                    {artist.availability_status === 'busy' && 'Impegnato'}
                    {artist.availability_status === 'unavailable' && 'Non disponibile'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions Footer */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between items-center p-6 bg-white rounded-lg border border-neutral-200">
        <Button variant="outline" asChild>
          <Link to="/app/artists">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla lista
          </Link>
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportPDF} disabled={exporting}>
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
            <Link to={`/app/artists/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Modifica artista
            </Link>
          </Button>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && artist.images && artist.images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 h-12 w-12"
            onClick={() => setShowLightbox(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation Arrows */}
          {artist.images.length > 1 && (
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

          {/* Image */}
          <div className="max-w-7xl max-h-[90vh] p-4">
            <img
              src={artist.images[currentImageIndex].image_url}
              alt={artist.images[currentImageIndex].artwork_title || 'Artwork'}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Image Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="max-w-4xl mx-auto text-white">
              <h3 className="text-2xl font-bold mb-2">
                {artist.images[currentImageIndex].artwork_title || 'Senza titolo'}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm">
                {artist.images[currentImageIndex].artwork_year && (
                  <span>{artist.images[currentImageIndex].artwork_year}</span>
                )}
                {artist.images[currentImageIndex].artwork_technique && (
                  <span>• {artist.images[currentImageIndex].artwork_technique}</span>
                )}
                {formatDimensions(artist.images[currentImageIndex]) && (
                  <span>• {formatDimensions(artist.images[currentImageIndex])}</span>
                )}
                {artist.images[currentImageIndex].artwork_price && (
                  <span className="font-semibold">
                    • {formatCurrency(artist.images[currentImageIndex].artwork_price!)}
                  </span>
                )}
              </div>
              {artist.images[currentImageIndex].artwork_description && (
                <p className="mt-2 text-sm opacity-90">
                  {artist.images[currentImageIndex].artwork_description}
                </p>
              )}
            </div>
          </div>

          {/* Counter */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold">
            {currentImageIndex + 1} / {artist.images.length}
          </div>
        </div>
      )}

      {/* Artwork Detail Modal */}
      <Dialog open={artworkModalOpen} onOpenChange={setArtworkModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedArtwork?.artwork_title || 'Dettagli Opera'}
            </DialogTitle>
            <DialogDescription>
              Informazioni complete sull'opera d'arte
            </DialogDescription>
          </DialogHeader>

          {selectedArtwork && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="space-y-4">
                <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedArtwork.image_url}
                    alt={selectedArtwork.artwork_title || 'Artwork'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedArtwork.caption && (
                  <p className="text-sm text-neutral-600 italic">
                    {selectedArtwork.caption}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="space-y-6">
                {/* Title & Year */}
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                    {selectedArtwork.artwork_title || 'Senza titolo'}
                  </h3>
                  {selectedArtwork.artwork_year && (
                    <p className="text-lg text-neutral-600">
                      {selectedArtwork.artwork_year}
                    </p>
                  )}
                </div>

                {/* Technique */}
                {selectedArtwork.artwork_technique && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Tecnica</p>
                    <p className="font-semibold">{selectedArtwork.artwork_technique}</p>
                  </div>
                )}

                {/* Dimensions */}
                {formatDimensions(selectedArtwork) && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-1 flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Dimensioni
                    </p>
                    <p className="font-semibold">
                      {formatDimensions(selectedArtwork)}
                    </p>
                    {selectedArtwork.artwork_width_cm && selectedArtwork.artwork_height_cm && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Superficie: {(
                          (selectedArtwork.artwork_width_cm / 100) *
                          (selectedArtwork.artwork_height_cm / 100)
                        ).toFixed(2)} m²
                      </p>
                    )}
                  </div>
                )}

                {/* Price */}
                {selectedArtwork.artwork_price && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-1 flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      Prezzo Stimato
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedArtwork.artwork_price)}
                    </p>
                  </div>
                )}

                {/* Description */}
                {selectedArtwork.artwork_description && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-2">Descrizione</p>
                    <p className="text-neutral-700 whitespace-pre-wrap">
                      {selectedArtwork.artwork_description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const index = artist.images?.findIndex(
                        (img) => img.id === selectedArtwork.id
                      )
                      if (index !== undefined && index !== -1) {
                        setCurrentImageIndex(index)
                        setShowLightbox(true)
                        setArtworkModalOpen(false)
                      }
                    }}
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Vista Fullscreen
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setArtworkModalOpen(false)}
                  >
                    Chiudi
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare <strong>{displayName}</strong>?
              <br />
              Questa azione non può essere annullata. Verranno eliminate anche tutte
              le immagini e le associazioni con i progetti.
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