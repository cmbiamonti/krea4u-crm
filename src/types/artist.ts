export interface Artist {
  id: string
  created_by: string
  first_name: string
  last_name: string
  artist_name: string | null
  email: string | null
  phone: string | null
  nationality: string | null
  city: string | null
  birth_date: string | null
  instagram_handle: string | null
  website: string | null
  bio: string | null
  artist_statement: string | null
  medium: string[] | null
  style_tags: string[] | null
  price_range: string | null
  availability_status: string | null
  shipping_preferences: string | null
  insurance_value: number | null
  exhibition_history: string | null
  created_at: string
  images?: ArtistImage[]
}

export interface ArtistImage {
  id: string
  artist_id: string
  image_url: string
  caption: string | null
  sort_order: number | null

 // Artwork metadata
  artwork_title?: string | null
  artwork_year?: number | null
  artwork_width_cm?: number | null
  artwork_height_cm?: number | null
  artwork_depth_cm?: number | null
  artwork_technique?: string | null
  artwork_price?: number | null
  artwork_description?: string | null
  
  created_at: string
}

export interface ArtworkMetadata {
  id?: string
  url?: string
  file?: File
  caption?: string
  sort_order: number
  
  // Nuovi campi artwork
  artwork_title?: string
  artwork_year?: number | null
  artwork_width_cm?: number | null
  artwork_height_cm?: number | null
  artwork_depth_cm?: number | null
  artwork_technique?: string
  artwork_price?: number | null
  artwork_description?: string
}

export interface ArtistFormData {
  first_name: string
  last_name: string
  artist_name: string
  email: string
  phone: string
  nationality: string
  city: string
  birth_date: string
  instagram_handle: string
  website: string
  bio: string
  artist_statement: string
  medium: string[]
  style_tags: string[]
  price_range: string
  availability_status: string
  shipping_preferences: string
  insurance_value: number | null
  exhibition_history: string
}

export interface ArtistFilters {
  search: string
  nationality: string[]
  city: string[]
  medium: string[]
  priceRange: string[]
  availabilityStatus: string[]
}

// ✅ AGGIUNTE LE COSTANTI MANCANTI
export const MEDIUM_OPTIONS = [
  'Pittura',
  'Scultura',
  'Fotografia',
  'Digital Art',
  'Installazione',
  'Performance',
  'Video Art',
  'Mixed Media',
  'Disegno',
  'Stampa',
  'Ceramica',
  'Textile Art',
]

export const STYLE_OPTIONS = [
  'Astratto',
  'Figurativo',
  'Contemporaneo',
  'Minimalista',
  'Espressionista',
  'Pop Art',
  'Surrealista',
  'Concettuale',
  'Street Art',
  'Realismo',
  'Impressionista',
  'Arte Digitale',
]

// Common art techniques
export const ART_TECHNIQUES = [
  'Pittura ad olio',
  'Acrilico',
  'Acquerello',
  'Tempera',
  'Tecnica mista',
  'Collage',
  'Scultura',
  'Ceramica',
  'Bronzo',
  'Marmo',
  'Legno',
  'Fotografia',
  'Stampa digitale',
  'Serigrafia',
  'Litografia',
  'Incisione',
  'Disegno',
  'Pastello',
  'Carboncino',
  'Installazione',
  'Performance',
  'Video art',
  'Arte digitale',
  'NFT',
  'Altro',
]

export const AVAILABILITY_STATUS = [
  { value: 'available', label: 'Disponibile' },
  { value: 'busy', label: 'Occupato' },
  { value: 'on_hold', label: 'In Pausa' },
]