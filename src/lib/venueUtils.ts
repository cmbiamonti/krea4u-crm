import { supabase } from '@/lib/supabase'
import { Venue, VenueFilters } from '@/types/venue'

export const uploadVenueImage = async (
  venueId: string,
  file: File,
  userId: string
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${venueId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('venue-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('venue-images')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

export const getVenueWithImages = async (venueId: string): Promise<Venue | null> => {
  try {
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .eq('id', venueId)
      .single()

    if (venueError) throw venueError

    const { data: images, error: imagesError } = await supabase
      .from('venue_images')
      .select('*')
      .eq('venue_id', venueId)
      .order('sort_order', { ascending: true })

    if (imagesError) throw imagesError

    return venue ? { ...(venue as any), images: images || [] } : null
  } catch (error) {
    console.error('Error fetching venue:', error)
    return null
  }
}

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371 // Radius of Earth in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const toRad = (value: number): number => {
  return (value * Math.PI) / 180
}

export const filterVenues = (venues: Venue[], filters: VenueFilters): Venue[] => {
  return venues.filter((venue) => {
    // Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        venue.venue_name.toLowerCase().includes(searchLower) ||
        venue.description?.toLowerCase().includes(searchLower) ||
        venue.city?.toLowerCase().includes(searchLower) ||
        venue.neighborhood?.toLowerCase().includes(searchLower)
      
      if (!matchesSearch) return false
    }

    // City
    if (filters.city.length > 0) {
      if (!venue.city || !filters.city.includes(venue.city)) return false
    }

    // Neighborhood
    if (filters.neighborhood) {
      if (
        !venue.neighborhood ||
        !venue.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase())
      )
        return false
    }

    // Venue Type
    if (filters.venueType.length > 0) {
      if (!venue.venue_type || !filters.venueType.includes(venue.venue_type)) return false
    }

    // Size Range
    if (venue.size_sqm !== null) {
      if (venue.size_sqm < filters.sizeMin || venue.size_sqm > filters.sizeMax) return false
    }

    // Ceiling Height
    if (venue.ceiling_height !== null) {
      if (
        venue.ceiling_height < filters.ceilingHeightMin ||
        venue.ceiling_height > filters.ceilingHeightMax
      )
        return false
    }

    // Number of Rooms
    if (filters.numberOfRooms.length > 0) {
      if (venue.number_of_rooms !== null) {
        const rooms = venue.number_of_rooms
        const matchesRooms = filters.numberOfRooms.some((range) => {
          if (range === '1') return rooms === 1
          if (range === '2-3') return rooms >= 2 && rooms <= 3
          if (range === '4+') return rooms >= 4
          return false
        })
        if (!matchesRooms) return false
      }
    }

    // Natural Light
    if (filters.naturalLight !== null) {
      if (venue.natural_light !== filters.naturalLight) return false
    }

    // Pricing Model
    if (filters.pricingModel.length > 0) {
      if (!venue.pricing_model || !filters.pricingModel.includes(venue.pricing_model))
        return false
    }

    // Rental Fee Range
    if (venue.rental_fee !== null) {
      if (venue.rental_fee < filters.rentalFeeMin || venue.rental_fee > filters.rentalFeeMax)
        return false
    }

    // Amenities
    if (filters.amenities.length > 0) {
      if (!venue.amenities) return false
      const hasAllAmenities = filters.amenities.every((amenity) =>
        venue.amenities!.includes(amenity)
      )
      if (!hasAllAmenities) return false
    }

    // Radius Search
    if (
      filters.latitude !== null &&
      filters.longitude !== null &&
      venue.latitude !== null &&
      venue.longitude !== null
    ) {
      const distance = calculateDistance(
        filters.latitude,
        filters.longitude,
        venue.latitude,
        venue.longitude
      )
      if (distance > filters.radiusKm) return false
    }

    return true
  })
}

export const calculateMatchScore = (venue: Venue, filters: VenueFilters): number => {
  let score = 0
  let maxScore = 0

  // Search match
  if (filters.search) {
    maxScore += 3
    const searchLower = filters.search.toLowerCase()
    if (venue.venue_name.toLowerCase().includes(searchLower)) score += 3
    else if (venue.description?.toLowerCase().includes(searchLower)) score += 2
    else if (venue.city?.toLowerCase().includes(searchLower)) score += 1
  }

  // Exact matches
  if (filters.venueType.length > 0 && venue.venue_type) {
    maxScore += 2
    if (filters.venueType.includes(venue.venue_type)) score += 2
  }

  if (filters.city.length > 0 && venue.city) {
    maxScore += 2
    if (filters.city.includes(venue.city)) score += 2
  }

  // Amenities match
  if (filters.amenities.length > 0 && venue.amenities) {
    maxScore += filters.amenities.length
    filters.amenities.forEach((amenity) => {
      if (venue.amenities!.includes(amenity)) score += 1
    })
  }

  return maxScore > 0 ? (score / maxScore) * 100 : 50
}

export const sortVenues = (
  venues: Venue[],
  sortBy: string,
  filters: VenueFilters
): Venue[] => {
  const sorted = [...venues]

  switch (sortBy) {
    case 'relevance':
      return sorted.sort((a, b) => {
        const scoreA = calculateMatchScore(a, filters)
        const scoreB = calculateMatchScore(b, filters)
        return scoreB - scoreA
      })

    case 'price_asc':
      return sorted.sort((a, b) => {
        if (a.rental_fee === null) return 1
        if (b.rental_fee === null) return -1
        return a.rental_fee - b.rental_fee
      })

    case 'price_desc':
      return sorted.sort((a, b) => {
        if (a.rental_fee === null) return 1
        if (b.rental_fee === null) return -1
        return b.rental_fee - a.rental_fee
      })

    case 'size_asc':
      return sorted.sort((a, b) => {
        if (a.size_sqm === null) return 1
        if (b.size_sqm === null) return -1
        return a.size_sqm - b.size_sqm
      })

    case 'size_desc':
      return sorted.sort((a, b) => {
        if (a.size_sqm === null) return 1
        if (b.size_sqm === null) return -1
        return b.size_sqm - a.size_sqm
      })

    case 'rating':
      return sorted.sort((a, b) => {
        const ratingA = a.rating !== null ? a.rating : 0  // <-- FIX
        const ratingB = b.rating !== null ? b.rating : 0  // <-- FIX
        return ratingB - ratingA
      })

    default:
      return sorted
  }
}

export const exportVenuesToCSV = (venues: Venue[]): string => {
  const headers = [
    'Nome Spazio',
    'Tipo',
    'Città',
    'Indirizzo',
    'Dimensione (mq)',
    'Sale',
    'Altezza Soffitti (m)',
    'Modello Pricing',
    'Tariffa (€)',
    'Servizi',
  ]

  const rows = venues.map((venue) => [
    venue.venue_name,
    venue.venue_type || '',
    venue.city || '',
    venue.address || '',
    venue.size_sqm || '',
    venue.number_of_rooms || '',
    venue.ceiling_height || '',
    venue.pricing_model || '',
    venue.rental_fee || '',
    venue.amenities?.join('; ') || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  return csvContent
}