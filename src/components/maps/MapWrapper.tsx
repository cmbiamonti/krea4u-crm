// src/components/maps/MapWrapper.tsx
'use client'

import { useGoogleMaps } from '@/hooks/useGoogleMaps'
import MapComponent from './MapComponent'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface MapWrapperProps {
  latitude:     number | null
  longitude:    number | null
  venueName:    string
  address?:     string
  height?:      string
  zoom?:        number
  showControls?: boolean
}

export default function MapWrapper({
  latitude,
  longitude,
  venueName,
  address,
  height       = '400px',
  zoom         = 15,
  showControls = true,
}: MapWrapperProps) {
  const { isLoaded, loadError } = useGoogleMaps()

  // ── Coordinate mancanti ───────────────────────────────
  if (latitude == null || longitude == null) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Coordinate non disponibili per questo spazio.
          Usa il geocoder per trovare automaticamente le coordinate dall'indirizzo.
        </AlertDescription>
      </Alert>
    )
  }

  // ── Valida i numeri prima ancora di caricare la mappa ─
  const lat = Number(String(latitude).replace(',', '.'))
  const lng = Number(String(longitude).replace(',', '.'))

  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Coordinate non valide (lat: {String(latitude)}, lng: {String(longitude)}).
          Riprova con il geocoder.
        </AlertDescription>
      </Alert>
    )
  }

  // ── Errore caricamento API ────────────────────────────
  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Errore nel caricamento di Google Maps. Verifica la chiave API.
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2 text-xs">
              <summary>Dettagli errore</summary>
              <pre className="mt-1 whitespace-pre-wrap">{loadError.message}</pre>
            </details>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  // ── Loading ───────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="space-y-2">
        <Skeleton style={{ width: '100%', height }} />
        <p className="text-xs text-neutral-500 text-center">
          Caricamento mappa...
        </p>
      </div>
    )
  }

  // ── Mappa pronta ──────────────────────────────────────
  return (
    <MapComponent
      latitude={lat}
      longitude={lng}
      venueName={venueName}
      address={address}
      height={height}
      zoom={zoom}
      showControls={showControls}
    />
  )
}