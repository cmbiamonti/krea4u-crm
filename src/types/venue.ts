// src/types/venue.ts
export interface Venue {
  id: string
  venue_name: string
  venue_type: string | null
  address: string | null
  city: string | null
  neighborhood: string | null
  postal_code: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  size_sqm: number | null
  exhibition_space_sqm: number | null
  ceiling_height: number | null
  number_of_rooms: number | null
  natural_light: boolean | null
  capacity: number | null
  amenities: string[] | null
  description: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  email: string | null
  phone: string | null
  website: string | null
  pricing_model: string | null
  rental_fee: number | null
  additional_costs: string | null
  cancellation_policy: string | null
  technical_requirements: string | null
  accessibility_features: string | null
  house_rules: string | null
  available_from: string | null
  available_to: string | null
  rating: number | null  // <-- AGGIUNGI
  reviews_count: number | null  // <-- AGGIUNGI
  social_media: Record<string, string> | null  // <-- AGGIUNGI
  created_by: string
  created_at: string
  images?: VenueImage[]
}

export interface VenueImage {
  id: string
  venue_id: string
  image_url: string
  caption: string | null
  is_cover: boolean  // <-- AGGIUNGI
  display_order: number
  created_at: string
}

export interface VenueFormData {
  venue_name: string
  venue_type: string
  contact_name: string
  email: string
  phone: string
  website: string
  social_media: Record<string, string>
  address: string
  city: string
  neighborhood: string
  latitude: number | null
  longitude: number | null
  size_sqm: number | null
  ceiling_height: number | null
  number_of_rooms: number | null
  amenities: string[]
  natural_light: boolean
  pricing_model: string
  rental_fee: number | null
  additional_costs: string
  description: string
  cancellation_policy: string
}

export interface VenueFilters {
  search: string
  city: string[]
  neighborhood: string
  venueType: string[]
  sizeMin: number
  sizeMax: number
  ceilingHeightMin: number
  ceilingHeightMax: number
  numberOfRooms: string[]
  naturalLight: boolean | null
  pricingModel: string[]
  rentalFeeMin: number
  rentalFeeMax: number
  amenities: string[]
  availableNow: boolean
  latitude: number | null
  longitude: number | null
  radiusKm: number
}

export interface SavedSearch {
  id: string
  user_id: string
  name: string
  filters: VenueFilters
  created_at: string
}

export const VENUE_TYPES = [
  { value: 'gallery', label: 'Galleria d\'Arte' },
  { value: 'museum', label: 'Museo' },
  { value: 'multipurpose', label: 'Spazio Polifunzionale' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'other', label: 'Altro' },
]

export const PRICING_MODELS = [
  { value: 'fixed', label: 'Tariffa Fissa' },
  { value: 'daily', label: 'Giornaliero' },
  { value: 'weekly', label: 'Settimanale' },
  { value: 'monthly', label: 'Mensile' },
  { value: 'profit_share', label: 'Profit Share' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'free', label: 'Gratuito' },
]

export const AMENITIES = [
  { value: 'wifi', label: 'WiFi', icon: 'Wifi' },
  { value: 'parking', label: 'Parcheggio', icon: 'Car' },
  { value: 'accessible', label: 'Accessibile', icon: 'Accessibility' },
  { value: 'climate_control', label: 'Climatizzazione', icon: 'Thermometer' },
  { value: 'professional_lighting', label: 'Illuminazione Pro', icon: 'Lightbulb' },
  { value: 'security', label: 'Sistema Sicurezza', icon: 'Shield' },
  { value: 'av_equipment', label: 'Proiettore/AV', icon: 'Monitor' },
  { value: 'kitchen', label: 'Cucina', icon: 'UtensilsCrossed' },
  { value: 'storage', label: 'Deposito', icon: 'Package' },
  { value: 'loading_dock', label: 'Area Carico', icon: 'Truck' },
  { value: 'elevator', label: 'Ascensore', icon: 'MoveVertical' },
  { value: 'restrooms', label: 'Servizi Igienici', icon: 'Droplet' },
]

export const ROOM_OPTIONS = [
  { value: '1', label: '1 sala' },
  { value: '2-3', label: '2-3 sale' },
  { value: '4+', label: '4+ sale' },
]