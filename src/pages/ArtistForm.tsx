import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { ArtistFormData, ArtworkMetadata } from '@/types/artist'
import { uploadArtistImage, getArtistWithImages } from '@/lib/artistUtils'
import { validateEmail, validateRequired } from '@/lib/validation'
import PageHeader from '@/components/PageHeader'
import ArtistFormSteps from '@/components/artists/ArtistFormSteps'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const initialFormData: ArtistFormData = {
  first_name: '',
  last_name: '',
  artist_name: '',
  email: '',
  phone: '',
  nationality: '',
  city: '',
  birth_date: '',
  instagram_handle: '',
  website: '',
  bio: '',
  artist_statement: '',
  medium: [],
  style_tags: [],
  price_range: '',
  availability_status: 'available',
  shipping_preferences: '',
  insurance_value: null,
  exhibition_history: '',
}

export default function ArtistForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const isEditMode = !!id

  const [formData, setFormData] = useState<ArtistFormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ UN SOLO array unificato per tutte le immagini
  // (esistenti + nuove) — elimina la separazione che causava il bug
  const [allImages, setAllImages] = useState<ArtworkMetadata[]>([])

  useEffect(() => {
    if (isEditMode && id) {
      fetchArtist()
    }
  }, [id, isEditMode])

  const fetchArtist = async () => {
    if (!id) return

    try {
      setLoading(true)
      const data = await getArtistWithImages(id)

      if (!data) {
        toast({
          title: 'Errore',
          description: 'Artista non trovato',
          variant: 'destructive',
        })
        navigate('/app/artists')
        return
      }

      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        artist_name: data.artist_name || '',
        email: data.email || '',
        phone: data.phone || '',
        nationality: data.nationality || '',
        city: data.city || '',
        birth_date: data.birth_date || '',
        instagram_handle: data.instagram_handle || '',
        website: data.website || '',
        bio: data.bio || '',
        artist_statement: data.artist_statement || '',
        medium: data.medium || [],
        style_tags: data.style_tags || [],
        price_range: data.price_range || '',
        availability_status: data.availability_status || 'available',
        shipping_preferences: data.shipping_preferences || '',
        insurance_value: data.insurance_value,
        exhibition_history: data.exhibition_history || '',
      })

      // ✅ Carica le immagini esistenti nel singolo array unificato
      if (data.images && data.images.length > 0) {
        const mapped: ArtworkMetadata[] = data.images.map((img: any) => ({
          id:                  img.id,
          url:                 img.image_url,
          caption:             img.caption             || '',
          sort_order:          img.sort_order          ?? 0,
          artwork_title:       img.artwork_title       || '',
          artwork_year:        img.artwork_year        ?? null,
          artwork_width_cm:    img.artwork_width_cm    ?? null,
          artwork_height_cm:   img.artwork_height_cm   ?? null,
          artwork_depth_cm:    img.artwork_depth_cm    ?? null,
          artwork_technique:   img.artwork_technique   || '',
          artwork_price:       img.artwork_price       ?? null,
          artwork_description: img.artwork_description || '',
        }))
        setAllImages(mapped)
      }
    } catch (error) {
      console.error('Error fetching artist:', error)
      toast({
        title: 'Errore',
        description: "Impossibile caricare i dati dell'artista",
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof ArtistFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // ✅ Handler unificato: ArtistFormSteps chiama questo
  // sia per aggiungere nuove immagini che per modificare esistenti
  const handleImagesChange = (updated: ArtworkMetadata[]) => {
    setAllImages(updated)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const firstNameError = validateRequired(formData.first_name, 'Il nome')
    if (firstNameError) newErrors.first_name = firstNameError

    const lastNameError = validateRequired(formData.last_name, 'Il cognome')
    if (lastNameError) newErrors.last_name = lastNameError

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'URL non valido'
    }

    // Valida titoli delle opere per le nuove immagini (con file)
    allImages.forEach((img, index) => {
      if (img.file && !img.artwork_title?.trim()) {
        newErrors[`artwork_title_${index}`] = "Il titolo dell'opera è obbligatorio"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit called')

    if (!validateForm()) {
      console.log('❌ Validation failed:', errors)
      toast({
        title: 'Errore di Validazione',
        description: 'Controlla i campi obbligatori e i titoli delle opere',
        variant: 'destructive',
      })
      return
    }

    if (!user) {
      toast({
        title: 'Errore',
        description: 'Utente non autenticato',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      let artistId = id

      if (isEditMode && id) {
        console.log('🔄 UPDATING artist:', id)

        const updateData: any = {
          first_name: formData.first_name,
          last_name:  formData.last_name,
        }

        if (formData.artist_name)       updateData.artist_name       = formData.artist_name
        if (formData.email)             updateData.email             = formData.email
        if (formData.phone)             updateData.phone             = formData.phone
        if (formData.nationality)       updateData.nationality       = formData.nationality
        if (formData.city)              updateData.city              = formData.city
        if (formData.birth_date)        updateData.birth_date        = formData.birth_date
        if (formData.instagram_handle)  updateData.instagram_handle  = formData.instagram_handle
        if (formData.website)           updateData.website           = formData.website
        if (formData.bio)               updateData.bio               = formData.bio
        if (formData.artist_statement)  updateData.artist_statement  = formData.artist_statement
        if (formData.medium?.length)    updateData.medium            = formData.medium
        if (formData.style_tags?.length) updateData.style_tags       = formData.style_tags
        if (formData.price_range)       updateData.price_range       = formData.price_range
        if (formData.availability_status) updateData.availability_status = formData.availability_status
        if (formData.shipping_preferences) updateData.shipping_preferences = formData.shipping_preferences
        if (formData.insurance_value !== null) updateData.insurance_value = formData.insurance_value
        if (formData.exhibition_history) updateData.exhibition_history = formData.exhibition_history

        const { error: updateError } = await supabase
          .from('artists')
          .update(updateData)
          .eq('id', id)

        if (updateError) throw updateError

        console.log('✅ Artist updated successfully')

      } else {
        console.log('➕ CREATING new artist')

        const insertData: any = {
          created_by: user.id,
          first_name: formData.first_name,
          last_name:  formData.last_name,
        }

        if (formData.artist_name)       insertData.artist_name       = formData.artist_name
        if (formData.email)             insertData.email             = formData.email
        if (formData.phone)             insertData.phone             = formData.phone
        if (formData.nationality)       insertData.nationality       = formData.nationality
        if (formData.city)              insertData.city              = formData.city
        if (formData.birth_date)        insertData.birth_date        = formData.birth_date
        if (formData.instagram_handle)  insertData.instagram_handle  = formData.instagram_handle
        if (formData.website)           insertData.website           = formData.website
        if (formData.bio)               insertData.bio               = formData.bio
        if (formData.artist_statement)  insertData.artist_statement  = formData.artist_statement
        if (formData.medium?.length)    insertData.medium            = formData.medium
        if (formData.style_tags?.length) insertData.style_tags       = formData.style_tags
        if (formData.price_range)       insertData.price_range       = formData.price_range
        if (formData.availability_status) insertData.availability_status = formData.availability_status
        if (formData.shipping_preferences) insertData.shipping_preferences = formData.shipping_preferences
        if (formData.insurance_value !== null) insertData.insurance_value = formData.insurance_value
        if (formData.exhibition_history) insertData.exhibition_history = formData.exhibition_history

        const { data: newArtist, error: createError } = await supabase
          .from('artists')
          .insert(insertData)
          .select()
          .single()

        if (createError) throw createError

        artistId = newArtist.id
        console.log('✅ Artist created successfully:', artistId)
      }

      if (artistId) {
        console.log('🖼️ Handling images for artist:', artistId)
        await handleImages(artistId)
      }

      toast({
        title: 'Successo',
        description: isEditMode
          ? 'Artista aggiornato con successo'
          : 'Artista creato con successo',
      })

      navigate(`/app/artists/${artistId}`)

    } catch (error: any) {
      console.error('❌ SUBMIT FAILED:', error)
      toast({
        title: 'Errore',
        description: error?.message || "Impossibile salvare l'artista",
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImages = async (artistId: string) => {
    if (!user) return

    try {
      console.log('🖼️ Processing images...')

      // ── Immagini esistenti (hanno id, non hanno file) ──────────────────────
      const existingInState = allImages.filter((img) => img.id && !img.file)

      // ── Fetch degli id attualmente nel DB per questo artista ───────────────
      const { data: dbImages } = await supabase
        .from('artist_images')
        .select('id')
        .eq('artist_id', artistId)

      const dbIds    = (dbImages ?? []).map((r: any) => r.id as string)
      const stateIds = existingInState.map((img) => img.id as string)

      // ── Elimina immagini rimosse dall'utente ───────────────────────────────
      const toDelete = dbIds.filter((dbId) => !stateIds.includes(dbId))
      for (const deletedId of toDelete) {
        console.log('🗑️ Deleting removed image:', deletedId)
        await supabase.from('artist_images').delete().eq('id', deletedId)
      }

      // ✅ Aggiorna metadati delle immagini esistenti
      for (const img of existingInState) {
        console.log('✏️ Updating existing image metadata:', img.id)
        const { error: updateErr } = await supabase
          .from('artist_images')
          .update({
            caption:             img.caption             ?? null,
            sort_order:          img.sort_order,
            artwork_title:       img.artwork_title       ?? null,
            artwork_year:        img.artwork_year        ?? null,
            artwork_width_cm:    img.artwork_width_cm    ?? null,
            artwork_height_cm:   img.artwork_height_cm   ?? null,
            artwork_depth_cm:    img.artwork_depth_cm    ?? null,
            artwork_technique:   img.artwork_technique   ?? null,
            artwork_price:       img.artwork_price       ?? null,
            artwork_description: img.artwork_description ?? null,
          })
          .eq('id', img.id)

        if (updateErr) {
          console.error('❌ Error updating image metadata:', updateErr)
          throw updateErr
        }
      }

      // ✅ Upload nuove immagini (hanno file, non hanno id)
      const newImages = allImages.filter((img) => img.file && !img.id)
      for (const img of newImages) {
        console.log('📤 Uploading new image...')
        const imageUrl = await uploadArtistImage(artistId, img.file!, user.id)

        if (imageUrl) {
          const { error: insertErr } = await supabase
            .from('artist_images')
            .insert({
              artist_id:           artistId,
              image_url:           imageUrl,
              caption:             img.caption             ?? null,
              sort_order:          img.sort_order,
              artwork_title:       img.artwork_title       ?? null,
              artwork_year:        img.artwork_year        ?? null,
              artwork_width_cm:    img.artwork_width_cm    ?? null,
              artwork_height_cm:   img.artwork_height_cm   ?? null,
              artwork_depth_cm:    img.artwork_depth_cm    ?? null,
              artwork_technique:   img.artwork_technique   ?? null,
              artwork_price:       img.artwork_price       ?? null,
              artwork_description: img.artwork_description ?? null,
            })

          if (insertErr) {
            console.error('❌ Error inserting new image:', insertErr)
            throw insertErr
          }
        }
      }

      console.log('✅ Images processed successfully')
    } catch (error) {
      console.error('❌ Error handling images:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={isEditMode ? 'Modifica Artista' : 'Nuovo Artista'}
        description={
          isEditMode
            ? "Aggiorna le informazioni dell'artista"
            : 'Aggiungi un nuovo artista al database'
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Artisti', href: '/app/artists' },
          { label: isEditMode ? 'Modifica' : 'Nuovo' },
        ]}
      />

      <Card>
        <CardContent className="p-6">
          <ArtistFormSteps
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            images={allImages}
            onImagesChange={handleImagesChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}