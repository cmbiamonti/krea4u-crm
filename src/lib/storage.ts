// src/lib/storage.ts
import { supabase } from './supabase'  // <-- AGGIUNGI QUESTO IMPORT

export const STORAGE_BUCKETS = {
  VENUE_IMAGES: 'venue-images',
  ARTIST_IMAGES: 'artist-images',
  PROJECT_FILES: 'project-files',
} as const

export const getStorageBucket = (type: 'venue' | 'artist' | 'project') => {
  switch (type) {
    case 'venue':
      return STORAGE_BUCKETS.VENUE_IMAGES
    case 'artist':
      return STORAGE_BUCKETS.ARTIST_IMAGES
    case 'project':
      return STORAGE_BUCKETS.PROJECT_FILES
    default:
      throw new Error(`Unknown storage type: ${type}`)
  }
}

// Helper function per upload
export const uploadToStorage = async (
  bucket: string,
  filePath: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error
  return data
}

// Helper function per get public URL
export const getPublicUrl = (bucket: string, filePath: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
}