// src/hooks/useGoogleMaps.ts

import { useLoadScript } from '@react-google-maps/api'

const libraries: ('places' | 'geometry' | 'drawing')[] = ['places']

export const useGoogleMaps = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  return { isLoaded, loadError }
}