// src/services/geocoding.service.ts

import { supabase } from '@/lib/supabase'

export interface GeocodeResult {
  lat: number
  lng: number
  formatted_address: string
  place_id?: string
}

export interface ReverseGeocodeResult {
  formatted_address: string
  address_components: {
    city?: string
    country?: string
    country_code?: string
    postal_code?: string
    street?: string
    street_number?: string
    region?: string
    province?: string
  }
  place_id?: string
}

/**
 * Converti indirizzo in coordinate GPS (Geocoding)
 * @param address - Indirizzo da geocodificare
 * @param city - Città (opzionale, migliora precisione)
 * @returns Coordinate o null se non trovato
 */
export async function geocodeAddress(
  address: string,
  city?: string
): Promise<GeocodeResult | null> {
  try {
    // Costruisci indirizzo completo
    const fullAddress = city ? `${address}, ${city}, Italy` : address

    console.log('Geocoding address:', fullAddress)

    // Chiama Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('geocode', {
      body: { address: fullAddress },
    })

    if (error) {
      console.error('Supabase function error:', error)
      return null
    }

    if (!data || !data.success) {
      console.error('Geocoding failed:', data?.error || 'Unknown error')
      return null
    }

    console.log('Geocoding success:', data)

    return {
      lat: data.latitude,
      lng: data.longitude,
      formatted_address: data.formatted_address,
      place_id: data.place_id,
    }
  } catch (error) {
    console.error('Geocoding exception:', error)
    return null
  }
}

/**
 * Converti coordinate GPS in indirizzo (Reverse Geocoding)
 * @param lat - Latitudine
 * @param lng - Longitudine
 * @returns Indirizzo o null se non trovato
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> {
  try {
    // Valida coordinate
    if (!isValidCoordinate(lat, lng)) {
      console.error('Invalid coordinates:', lat, lng)
      return null
    }

    console.log('Reverse geocoding:', lat, lng)

    // Chiama Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('reverse-geocode', {
      body: { latitude: lat, longitude: lng },
    })

    if (error) {
      console.error('Supabase function error:', error)
      return null
    }

    if (!data || !data.success) {
      console.error('Reverse geocoding failed:', data?.error || 'Unknown error')
      return null
    }

    console.log('Reverse geocoding success:', data)

    return {
      formatted_address: data.formatted_address,
      address_components: data.address_components || {},
      place_id: data.place_id,
    }
  } catch (error) {
    console.error('Reverse geocoding exception:', error)
    return null
  }
}

/**
 * Valida che le coordinate siano nel range corretto
 * @param lat - Latitudine (deve essere tra -90 e 90)
 * @param lng - Longitudine (deve essere tra -180 e 180)
 * @returns true se valide, false altrimenti
 */
export function isValidCoordinate(
  lat?: number | null,
  lng?: number | null
): boolean {
  if (
    lat === null ||
    lat === undefined ||
    lng === null ||
    lng === undefined
  ) {
    return false
  }

  return (
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  )
}

/**
 * Calcola la distanza tra due punti geografici (formula di Haversine)
 * @param lat1 - Latitudine punto 1
 * @param lng1 - Longitudine punto 1
 * @param lat2 - Latitudine punto 2
 * @param lng2 - Longitudine punto 2
 * @returns Distanza in chilometri
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Raggio della Terra in km
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Converti gradi in radianti
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Formatta distanza in modo leggibile
 * @param km - Distanza in km
 * @returns Stringa formattata (es: "1.5 km" o "850 m")
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}