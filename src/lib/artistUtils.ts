import { supabase } from '@/lib/supabase'
import { Artist } from '@/types/artist'

export const uploadArtistImage = async (
  artistId: string,
  file: File,
  userId: string
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${artistId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('artist-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('artist-images')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

export const deleteArtistImage = async (imageUrl: string): Promise<boolean> => {
  try {
    const path = imageUrl.split('/artist-images/')[1]
    if (!path) return false

    const { error } = await supabase.storage
      .from('artist-images')
      .remove([path])

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting image:', error)
    return false
  }
}

export const getArtistWithImages = async (artistId: string): Promise<Artist | null> => {
  try {
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('id', artistId)
      .single()

    if (artistError) throw artistError

    const { data: images, error: imagesError } = await supabase
      .from('artist_images')
      .select('*')
      .eq('artist_id', artistId)
      .order('sort_order', { ascending: true })

    if (imagesError) throw imagesError

   return artist ? { ...(artist as any), images: images || [] } : null
  } catch (error) {
    console.error('Error fetching artist:', error)
    return null
  }
}

export const exportArtistsToCSV = (artists: Artist[]): string => {
  const headers = [
    'Nome',
    'Cognome',
    'Nome Artistico',
    'Email',
    'Telefono',
    'Nazionalità',
    'Città',
    'Medium',
    'Fascia Prezzo',
    'Status',
  ]

  const rows = artists.map(artist => [
    artist.first_name,
    artist.last_name,
    artist.artist_name || '',
    artist.email || '',
    artist.phone || '',
    artist.nationality || '',
    artist.city || '',
    artist.medium?.join('; ') || '',
    artist.price_range || '',
    artist.availability_status || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  return csvContent
}

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}