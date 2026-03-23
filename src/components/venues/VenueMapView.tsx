import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { Venue } from '@/types/venue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { MapPin, Maximize, Eye, Navigation } from 'lucide-react'

interface VenueMapViewProps {
  venues: Venue[]
}

const mapContainerStyle = {
  width: '100%',
  height: '600px'
}

// Centro iniziale: Italia
const center = {
  lat: 41.9028,
  lng: 12.4964
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export default function VenueMapView({ venues }: VenueMapViewProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const venuesWithCoordinates = venues.filter(
    (v) => v.latitude !== null && v.longitude !== null
  )

  const onLoad = useCallback((map: google.maps.Map) => {
    // Imposta i bounds per includere tutti i markers
    if (venuesWithCoordinates.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      venuesWithCoordinates.forEach(venue => {
        if (venue.latitude && venue.longitude) {
          bounds.extend({ lat: venue.latitude, lng: venue.longitude })
        }
      })
      map.fitBounds(bounds)
    }
    setMap(map)
  }, [venuesWithCoordinates])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const handleMarkerClick = (venue: Venue) => {
    setSelectedVenue(venue)
    // Centra la mappa sul marker selezionato
    if (map && venue.latitude && venue.longitude) {
      map.panTo({ lat: venue.latitude, lng: venue.longitude })
      map.setZoom(15)
    }
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <MapPin className="h-16 w-16 text-red-400 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-red-700">
                Google Maps API Key mancante
              </p>
              <p className="text-sm text-neutral-600">
                Aggiungi VITE_GOOGLE_MAPS_API_KEY al file .env
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className="overflow-hidden">
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={6}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          >
            {/* Markers per ogni venue */}
            {venuesWithCoordinates.map((venue) => (
              <Marker
                key={venue.id}
                position={{
                  lat: venue.latitude!,
                  lng: venue.longitude!
                }}
                onClick={() => handleMarkerClick(venue)}
                title={venue.venue_name}
              />
            ))}

            {/* InfoWindow per il venue selezionato */}
            {selectedVenue && selectedVenue.latitude && selectedVenue.longitude && (
              <InfoWindow
                position={{
                  lat: selectedVenue.latitude,
                  lng: selectedVenue.longitude
                }}
                onCloseClick={() => setSelectedVenue(null)}
              >
                <div className="p-2 max-w-xs">
                  <h3 className="font-semibold text-sm mb-1">
                    {selectedVenue.venue_name}
                  </h3>
                  <p className="text-xs text-neutral-600 mb-2">
                    {selectedVenue.city}
                  </p>
                  {selectedVenue.rental_fee && (
                    <p className="text-sm font-semibold text-primary mb-2">
                      {formatCurrency(selectedVenue.rental_fee)}
                    </p>
                  )}
                  <Button size="sm" asChild className="w-full">
                    <Link to={`/venues/${selectedVenue.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      Dettagli
                    </Link>
                  </Button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </Card>

      {/* Stats */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">
                {venuesWithCoordinates.length} spazi sulla mappa
              </p>
              <p className="text-xs text-neutral-600">
                {venues.length - venuesWithCoordinates.length} senza coordinate
              </p>
            </div>
          </div>
          {selectedVenue && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedVenue(null)}
            >
              Chiudi dettagli
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Selected Venue Card (opzionale - può rimanere sotto la mappa) */}
      {selectedVenue && (
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Image */}
              <div className="w-32 h-32 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden">
                {selectedVenue.images?.[0] ? (
                  <img
                    src={selectedVenue.images[0].image_url}
                    alt={selectedVenue.venue_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-neutral-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-heading font-semibold text-lg">
                    {selectedVenue.venue_name}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {selectedVenue.city}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedVenue.venue_type && (
                    <Badge variant="secondary">{selectedVenue.venue_type}</Badge>
                  )}
                  {selectedVenue.size_sqm && (
                    <Badge variant="outline">
                      <Maximize className="h-3 w-3 mr-1" />
                      {selectedVenue.size_sqm} m²
                    </Badge>
                  )}
                </div>

                {selectedVenue.rental_fee && (
                  <p className="font-semibold text-primary">
                    {formatCurrency(selectedVenue.rental_fee)}
                  </p>
                )}

                <Button size="sm" asChild>
                  <Link to={`/venues/${selectedVenue.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizza Dettagli
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}