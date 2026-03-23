// src/components/maps/MapComponent.tsx
'use client'

import { GoogleMap, OverlayView } from '@react-google-maps/api'
import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { ExternalLink, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapComponentProps {
  latitude: number | string
  longitude: number | string
  venueName: string
  address?: string
  height?: string
  zoom?: number
  showControls?: boolean
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const defaultMapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  // ✅ Necessario per AdvancedMarkerElement
  mapId: 'DEMO_MAP_ID',
}

export default function MapComponent({
  latitude,
  longitude,
  venueName,
  address,
  height = '400px',
  zoom = 15,
  showControls = true,
}: MapComponentProps) {
  const [map, setMap]                     = useState<google.maps.Map | null>(null)
  const [showInfoWindow, setShowInfoWindow] = useState(true)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

  // ✅ Normalizzazione coordinate
  const lat = useMemo(
    () => Number(String(latitude).replace(',', '.')),
    [latitude]
  )
  const lng = useMemo(
    () => Number(String(longitude).replace(',', '.')),
    [longitude]
  )

  const isValidCoordinates =
    !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0

  const center = useMemo(() => ({ lat, lng }), [lat, lng])

  // ✅ Crea/aggiorna AdvancedMarkerElement quando la mappa è pronta
  useEffect(() => {
    if (!map || !isValidCoordinates) return

    // Centra la mappa
    map.panTo(center)

    // Rimuovi marker precedente
    if (markerRef.current) {
      markerRef.current.map = null
    }

    // ✅ Usa AdvancedMarkerElement (non deprecato, funziona sempre)
    const createMarker = async () => {
      try {
        const { AdvancedMarkerElement } =
          await google.maps.importLibrary('marker') as google.maps.MarkerLibrary

        const marker = new AdvancedMarkerElement({
          map,
          position: center,
          title: venueName,
        })

        // Click sul marker → mostra InfoWindow
        marker.addListener('click', () => {
          setShowInfoWindow(true)
        })

        markerRef.current = marker
      } catch (err) {
        // Fallback: usa Marker classico se AdvancedMarkerElement non disponibile
        console.warn('AdvancedMarkerElement non disponibile, uso Marker classico', err)

        const marker = new google.maps.Marker({
          map,
          position: center,
          title: venueName,
          // ✅ Forza visibilità
          visible: true,
          optimized: false,
        })

        marker.addListener('click', () => setShowInfoWindow(true))

        // Cast necessario per compatibilità ref
        markerRef.current = marker as unknown as google.maps.marker.AdvancedMarkerElement
      }
    }

    createMarker()

    // Cleanup al dismount o cambio coordinate
    return () => {
      if (markerRef.current) {
        markerRef.current.map = null
        markerRef.current = null
      }
    }
  }, [map, center, isValidCoordinates, venueName])

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance)
  }, [])

  const onUnmount = useCallback(() => {
    // Rimuovi marker
    if (markerRef.current) {
      markerRef.current.map = null
      markerRef.current = null
    }
    setMap(null)
  }, [])

  const openInGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      '_blank'
    )
  }

  const getDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      '_blank'
    )
  }

  if (!isValidCoordinates) {
    return (
      <div className="text-sm text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">
        ⚠️ Coordinate non valide: lat={String(latitude)}, lng={String(longitude)}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div style={{ width: '100%', height }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={defaultMapOptions}
          // ✅ key rimosso: causa remount completo ad ogni cambio coordinate
          // Il panTo nell'useEffect è sufficiente
        >
          {/* ✅ InfoWindow custom tramite OverlayView
              Più stabile di InfoWindow di @react-google-maps/api
              e non interferisce con il Marker              */}
          {showInfoWindow && (
            <OverlayView
              position={center}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={(width, height) => ({
                x: -(width / 2),
                y: -(height + 48), // offset sopra il marker
              })}
            >
              <div
                className="relative bg-white rounded-lg shadow-lg border border-neutral-200 p-3 min-w-[160px] max-w-[240px]"
                style={{ pointerEvents: 'auto' }}
              >
                {/* Freccia in basso */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0"
                  style={{
                    borderLeft:  '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop:   '8px solid white',
                    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))',
                  }}
                />

                {/* Pulsante chiudi */}
                <button
                  onClick={() => setShowInfoWindow(false)}
                  className="absolute top-1 right-1 text-neutral-400 hover:text-neutral-700 text-lg leading-none"
                  aria-label="Chiudi"
                >
                  ×
                </button>

                <p className="font-semibold text-sm pr-4 text-neutral-900">
                  {venueName}
                </p>
                {address && (
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {address}
                  </p>
                )}
              </div>
            </OverlayView>
          )}
        </GoogleMap>
      </div>

      {showControls && (
        <div className="flex gap-2">
          <Button
            onClick={openInGoogleMaps}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Apri in Maps
          </Button>

          <Button
            onClick={getDirections}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Indicazioni
          </Button>
        </div>
      )}
    </div>
  )
}