// src/pages/VenueForm.tsx

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Venue, VENUE_TYPES, AMENITIES, PRICING_MODELS } from '@/types/venue'
import { getVenueWithImages } from '@/lib/venueUtils'
import { useLoadData } from '@/hooks/useLoadData'
import PageHeader from '@/components/PageHeader'
import ImageManager from '@/components/artists/ImageManager'
import ImageUpload from '@/components/artists/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, MapPin } from 'lucide-react'
import MapWrapper from '@/components/maps/MapWrapper'

export default function VenueForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState<Partial<Venue>>({
    venue_name: '',
    venue_type: null,
    address: null,
    city: null,
    neighborhood: null,
    postal_code: null,
    country: 'Italia',
    latitude: null,
    longitude: null,
    size_sqm: null,
    exhibition_space_sqm: null,
    ceiling_height: null,
    number_of_rooms: null,
    natural_light: null,
    capacity: null,
    amenities: [],
    description: null,
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    email: null,
    phone: null,
    website: null,
    pricing_model: null,
    rental_fee: null,
    additional_costs: null,
    cancellation_policy: null,
    technical_requirements: null,
    accessibility_features: null,
    house_rules: null,
    available_from: null,
    available_to: null,
  })

  const [images, setImages] = useState<any[]>([])
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [initialExistingImages, setInitialExistingImages] = useState<any[]>([])

  const fetchVenue = async () => {
    if (!id) return

    try {
      console.log('📂 Loading venue:', id)
      const data = await getVenueWithImages(id)

      if (!data) {
        toast.error('Spazio non trovato')
        navigate('/app/venues')
        return
      }

      console.log('✅ Venue loaded:', data.venue_name)

      setFormData({
        venue_name: data.venue_name,
        venue_type: data.venue_type,
        address: data.address,
        city: data.city,
        neighborhood: data.neighborhood,
        postal_code: data.postal_code,
        country: data.country || 'Italia',
        latitude: data.latitude,
        longitude: data.longitude,
        size_sqm: data.size_sqm,
        exhibition_space_sqm: data.exhibition_space_sqm,
        ceiling_height: data.ceiling_height,
        number_of_rooms: data.number_of_rooms,
        natural_light: data.natural_light,
        capacity: data.capacity,
        amenities: data.amenities || [],
        description: data.description,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        email: data.email,
        phone: data.phone,
        website: data.website,
        pricing_model: data.pricing_model,
        rental_fee: data.rental_fee,
        additional_costs: data.additional_costs,
        cancellation_policy: data.cancellation_policy,
        technical_requirements: data.technical_requirements,
        accessibility_features: data.accessibility_features,
        house_rules: data.house_rules,
        available_from: data.available_from,
        available_to: data.available_to,
      })

      if (data.images) {
        console.log('📸 Found', data.images.length, 'existing images')
        const formattedImages = data.images.map((img: any) => ({
          id: img.id,
          url: img.image_url,
          caption: img.caption || '',
          sort_order: img.sort_order || 0,
        }))
        setExistingImages(formattedImages)
        setInitialExistingImages(formattedImages) // ✅ Salva stato iniziale
      }
    } catch (error) {
      console.error('Error fetching venue:', error)
      throw error
    }
  }

  const { loading, error } = useLoadData(fetchVenue, {
    deps: [id],
    onError: (err) => {
      toast.error('Impossibile caricare i dati dello spazio')
      console.error('Fetch venue error:', err)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔵 SUBMIT TRIGGERED')
    console.log('Edit mode:', !!id)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (!formData.venue_name?.trim()) {
      toast.error('Il nome dello spazio è obbligatorio')
      return
    }

    if (!user) {
      toast.error('Utente non autenticato')
      return
    }

    setSaving(true)

    try {
      // ✅ PREPARA DATI VENUE - SENZA full_name e created_by
      const venueData = {
        venue_name: formData.venue_name.trim(),
        venue_type: formData.venue_type || null,
        address: formData.address || null,
        city: formData.city || null,
        neighborhood: formData.neighborhood || null,
        postal_code: formData.postal_code || null,
        country: formData.country || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        size_sqm: formData.size_sqm || null,
        exhibition_space_sqm: formData.exhibition_space_sqm || null,
        ceiling_height: formData.ceiling_height || null,
        number_of_rooms: formData.number_of_rooms || null,
        natural_light: formData.natural_light || null,
        capacity: formData.capacity || null,
        amenities: formData.amenities || [],
        description: formData.description || null,
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        email: formData.email || null,
        phone: formData.phone || null,
        website: formData.website || null,
        pricing_model: formData.pricing_model || null,
        rental_fee: formData.rental_fee || null,
        additional_costs: formData.additional_costs || null,
        cancellation_policy: formData.cancellation_policy || null,
        technical_requirements: formData.technical_requirements || null,
        accessibility_features: formData.accessibility_features || null,
        house_rules: formData.house_rules || null,
        available_from: formData.available_from || null,
        available_to: formData.available_to || null,
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📋 VENUE DATA TO SAVE')
      console.log('Keys:', Object.keys(venueData))
      console.log('Has full_name?', 'full_name' in venueData)
      console.log('Has created_by?', 'created_by' in venueData)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      let venueId = id

      if (id) {
        // ✅ UPDATE MODE
        console.log('🔵 Updating venue:', id)

        const { error: updateError } = await supabase
          .from('venues')
          .update(venueData) // ✅ CORRETTO
          .eq('id', id)

        if (updateError) {
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.error('❌ UPDATE ERROR')
          console.error('Error:', updateError)
          console.error('Error code:', updateError.code)
          console.error('Error message:', updateError.message)
          console.error('Error details:', updateError.details)
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          throw updateError
        }

        console.log('✅ Venue updated successfully')
        await handleImages(id)
        toast.success('Spazio aggiornato con successo')
      } else {
        // ✅ CREATE MODE
        console.log('🔵 Creating new venue')

        const { data: newVenue, error: createError } = await supabase
          .from('venues')
          .insert([{
            ...venueData,
            created_by: user.id
          }])
          .select()
          .single()

        if (createError) {
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.error('❌ CREATE ERROR')
          console.error('Error:', createError)
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          throw createError
        }

        if (!newVenue) {
          throw new Error('No venue returned after creation')
        }

        venueId = (newVenue as any).id
        console.log('✅ Venue created successfully:', venueId)
        await handleImages(venueId)
        toast.success('Spazio creato con successo')
      }

      console.log('✅ Save complete! Redirecting to:', `/app/venues/${venueId}`)
      navigate(`/app/venues/${venueId}`)
    } catch (error: any) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ SAVE ERROR')
      console.error('Error:', error)
      console.error('Error message:', error.message)
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      toast.error(error.message || 'Impossibile salvare lo spazio')
    } finally {
      setSaving(false)
    }
  }
  
  // ✅ GESTIONE IMMAGINI (UNA SOLA VERSIONE)
  // src/pages/VenueForm.tsx

  const handleImages = async (venueId: string) => {
  if (!user) {
    console.warn('⚠️ No user for image management')
    return
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📸 HANDLING IMAGES')
  console.log('Venue ID:', venueId)
  console.log('Initial existing:', initialExistingImages.length)
  console.log('Current existing:', existingImages.length)
  console.log('New to upload:', images.length)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. ELIMINA IMMAGINI RIMOSSE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const removedImages = initialExistingImages.filter(
      initial => !existingImages.find(current => current.id === initial.id)
    )

    console.log('🗑️ Images to delete:', removedImages.length)

    for (const removed of removedImages) {
      console.log('Deleting image:', removed.id)
      
      const path = removed.url.split('/app').pop()
      if (path) {
        const { error: storageError } = await supabase.storage
          .from('venue-images')
          .remove([`${venueId}/${path}`])
        
        if (storageError) console.warn('Storage delete warning:', storageError)
      }

      const { error: dbError } = await supabase
        .from('venue_images')
        .delete()
        .eq('id', removed.id)

      if (dbError) {
        console.error('DB delete error:', dbError)
      } else {
        console.log('✅ Image deleted:', removed.id)
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. AGGIORNA SORT_ORDER ESISTENTI
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('📝 Updating sort_order for existing images...')
    
    for (const img of existingImages) {
      const { error: updateError } = await supabase
        .from('venue_images')
        .update({
          caption: img.caption || null,
          sort_order: img.sort_order,
        })
        .eq('id', img.id)

      if (updateError) {
        console.error('Update sort_order error:', updateError)
      } else {
        console.log('✅ Updated sort_order for:', img.id)
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3. CARICA NUOVE IMMAGINI
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const newImagesToUpload = images.filter((img) => img.file)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📸 NEW IMAGES TO UPLOAD:', newImagesToUpload.length)

    for (let i = 0; i < newImagesToUpload.length; i++) {
      const img = newImagesToUpload[i]
      
      console.log('━━━ IMAGE', i + 1, '/app', newImagesToUpload.length, '━━━')
      console.log('Image object keys:', Object.keys(img))
      console.log('Image object:', img)
      console.log('Has file?', !!img.file)
      console.log('File name:', img.file?.name)
      console.log('Caption:', img.caption)
      
      const imageUrl = await uploadVenueImage(venueId, img.file, user.id)
      
      if (imageUrl) {
        // ✅ RECORD ESPLICITO SENZA full_name
        const insertRecord = {
          venue_id: venueId,
          image_url: imageUrl,
          caption: img.caption || null,
          sort_order: existingImages.length + i,
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('💾 INSERTING RECORD')
        console.log('Record keys:', Object.keys(insertRecord))
        console.log('Record values:')
        console.log('  - venue_id:', insertRecord.venue_id)
        console.log('  - image_url:', insertRecord.image_url)
        console.log('  - caption:', insertRecord.caption)
        console.log('  - sort_order:', insertRecord.sort_order)
        console.log('Full record:', JSON.stringify(insertRecord, null, 2))
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        const { data: insertedData, error: insertError } = await supabase
          .from('venue_images')
          .insert(insertRecord)
          .select()

        if (insertError) {
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.error('❌ INSERT ERROR')
          console.error('Error object:', insertError)
          console.error('Error code:', insertError.code)
          console.error('Error message:', insertError.message)
          console.error('Error details:', insertError.details)
          console.error('Error hint:', insertError.hint)
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          
          // ✅ Mostra l'errore nel toast
          toast.error(`Errore insert: ${insertError.message}`)
          throw insertError
        }

        console.log('✅ Insert successful!')
        console.log('Inserted data:', insertedData)
      } else {
        console.error('❌ Upload failed, skipping insert for:', img.file?.name)
      }
    }

    if (newImagesToUpload.length > 0) {
      toast.success(`${newImagesToUpload.length} nuove immagini caricate`)
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ IMAGE HANDLING COMPLETE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error: any) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ IMAGE HANDLING ERROR')
    console.error('Error type:', typeof error)
    console.error('Error:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    toast.error(error?.message || 'Errore nella gestione delle immagini')
  }
}

  // ✅ UPLOAD SINGOLA IMMAGINE (Versione Corretta)
  const uploadVenueImage = async (
    venueId: string,
    file: File,
    userId: string
  ): Promise<string | null> => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📤 UPLOADING VENUE IMAGE')
      console.log('File:', file.name)
      console.log('Size:', file.size, 'bytes')
      console.log('Type:', file.type)
      console.log('Venue ID:', venueId)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      // Genera nome file unico
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(7)
      const fileName = `${timestamp}_${random}.${fileExt}`
      const filePath = `${venueId}/${fileName}`

      console.log('📁 Storage path:', filePath)

      // ✅ Upload to Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('venue-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError)
        throw uploadError
      }

      console.log('✅ Storage upload successful:', uploadData.path)

      // ✅ Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('venue-images')
        .getPublicUrl(filePath)

      console.log('🔗 Public URL:', publicUrl)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      return publicUrl
    } catch (error: any) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ UPLOAD ERROR')
      console.error('Error:', error)
      console.error('Error message:', error.message)
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      return null
    }
  }

  // ✅ HANDLERS
  const handleChange = (field: keyof Venue, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAmenityToggle = (amenityValue: string) => {
    setFormData(prev => {
      const currentAmenities = prev.amenities || []
      const newAmenities = currentAmenities.includes(amenityValue)
        ? currentAmenities.filter(a => a !== amenityValue)
        : [...currentAmenities, amenityValue]
      return { ...prev, amenities: newAmenities }
    })
  }

  const handleGeocode = async () => {
    if (!formData.address || !formData.city) {
      toast.error('Inserisci almeno indirizzo e città')
      return
    }

    try {
      const address = `${formData.address}, ${formData.city}, ${formData.country || 'Italia'}`
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        }))
        toast.success('Coordinate trovate!')
      } else {
        toast.error('Indirizzo non trovato')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      toast.error('Errore nella ricerca delle coordinate')
    }
  }

  const handleImagesChange = (newImages: any[]) => {
    console.log('📸 New images changed:', newImages.length)
    setImages(newImages)
  }

  const handleExistingImagesChange = (newExistingImages: any[]) => {
    console.log('📸 Existing images changed:', newExistingImages.length)
    setExistingImages(newExistingImages)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && id) {
    return (
      <div>
        <PageHeader
          title="Errore"
          breadcrumbs={[
            { label: 'Dashboard', href: '/app' },
            { label: 'Spazi', href: '/app/venues' },
            { label: 'Errore' },
          ]}
        />
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center">
            <p className="text-red-600 mb-4">Errore nel caricamento dello spazio</p>
            <Button onClick={() => navigate('/app/venues')} variant="outline">
              Torna alla lista
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={id ? 'Modifica Spazio' : 'Nuovo Spazio'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Spazi', href: '/app/venues' },
          { label: id ? 'Modifica' : 'Nuovo' },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Informazioni Base</TabsTrigger>
            <TabsTrigger value="location">Localizzazione</TabsTrigger>
            <TabsTrigger value="specs">Specifiche</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="images">
              Immagini
              {images.length > 0 && (
                <Badge className="ml-2">{images.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Basic Info */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="venue_name">Nome Spazio *</Label>
                  <Input
                    id="venue_name"
                    value={formData.venue_name || ''}
                    onChange={(e) => handleChange('venue_name', e.target.value)}
                    placeholder="Es: Galleria d'Arte Moderna"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="venue_type">Tipo</Label>
                  <select
                    id="venue_type"
                    value={formData.venue_type || ''}
                    onChange={(e) => handleChange('venue_type', e.target.value)}
                    className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Seleziona tipo</option>
                    {VENUE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={5}
                    placeholder="Descrizione dello spazio espositivo..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_name">Nome Referente</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_name || ''}
                      onChange={(e) => handleChange('contact_name', e.target.value)}
                      placeholder="Mario Rossi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Email Referente</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email || ''}
                      onChange={(e) => handleChange('contact_email', e.target.value)}
                      placeholder="mario@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefono</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+39 123 456 7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Location */}
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Localizzazione</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Indirizzo</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Via Roma, 123"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Città</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Milano"
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Quartiere</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood || ''}
                      onChange={(e) => handleChange('neighborhood', e.target.value)}
                      placeholder="Centro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postal_code">CAP</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code || ''}
                      onChange={(e) => handleChange('postal_code', e.target.value)}
                      placeholder="20100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Paese</Label>
                    <Input
                      id="country"
                      value={formData.country || ''}
                      onChange={(e) => handleChange('country', e.target.value)}
                      placeholder="Italia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <Label htmlFor="latitude">Latitudine</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) =>
                        handleChange('latitude', parseFloat(e.target.value) || null)
                      }
                      placeholder="45.4642"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="longitude">Longitudine</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) =>
                        handleChange('longitude', parseFloat(e.target.value) || null)
                      }
                      placeholder="9.1900"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={handleGeocode} className="w-full">
                      <MapPin className="h-4 w-4 mr-2" />
                      Trova GPS
                    </Button>
                  </div>
                </div>

                {formData.latitude && formData.longitude && (
                  <div className="mt-4">
                    <Label>Anteprima Mappa</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <MapWrapper
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        venueName={formData.venue_name || 'Spazio'}
                        address={formData.address || ''}
                        height="300px"
                        zoom={15}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Specs */}
          <TabsContent value="specs">
            <Card>
              <CardHeader>
                <CardTitle>Specifiche Tecniche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="size_sqm">Dimensione (m²)</Label>
                    <Input
                      id="size_sqm"
                      type="number"
                      value={formData.size_sqm || ''}
                      onChange={(e) =>
                        handleChange('size_sqm', parseFloat(e.target.value) || null)
                      }
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ceiling_height">Altezza soffitto (m)</Label>
                    <Input
                      id="ceiling_height"
                      type="number"
                      step="0.1"
                      value={formData.ceiling_height || ''}
                      onChange={(e) =>
                        handleChange('ceiling_height', parseFloat(e.target.value) || null)
                      }
                      placeholder="3.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number_of_rooms">N. Sale</Label>
                    <Input
                      id="number_of_rooms"
                      type="number"
                      value={formData.number_of_rooms || ''}
                      onChange={(e) =>
                        handleChange('number_of_rooms', parseInt(e.target.value) || null)
                      }
                      placeholder="3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacità (persone)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity || ''}
                      onChange={(e) =>
                        handleChange('capacity', parseInt(e.target.value) || null)
                      }
                      placeholder="50"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="natural_light"
                      checked={formData.natural_light || false}
                      onCheckedChange={(checked) =>
                        handleChange('natural_light', checked)
                      }
                    />
                    <Label htmlFor="natural_light">Luce naturale</Label>
                  </div>
                </div>

                <div>
                  <Label>Servizi e Dotazioni</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {AMENITIES.map((amenity) => (
                      <div key={amenity.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.value}
                          checked={(formData.amenities || []).includes(amenity.value)}
                          onCheckedChange={() => handleAmenityToggle(amenity.value)}
                        />
                        <Label htmlFor={amenity.value} className="text-sm font-normal">
                          {amenity.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Pricing */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pricing_model">Modello di Pricing</Label>
                  <select
                    id="pricing_model"
                    value={formData.pricing_model || ''}
                    onChange={(e) => handleChange('pricing_model', e.target.value)}
                    className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Seleziona modello</option>
                    {PRICING_MODELS.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="rental_fee">Canone/Tariffa (€)</Label>
                  <Input
                    id="rental_fee"
                    type="number"
                    value={formData.rental_fee || ''}
                    onChange={(e) =>
                      handleChange('rental_fee', parseFloat(e.target.value) || null)
                    }
                    placeholder="500"
                  />
                </div>

                <div>
                  <Label htmlFor="additional_costs">Costi Aggiuntivi</Label>
                  <Textarea
                    id="additional_costs"
                    value={formData.additional_costs || ''}
                    onChange={(e) => handleChange('additional_costs', e.target.value)}
                    rows={3}
                    placeholder="Es: pulizie, assicurazione, cauzione..."
                  />
                </div>

                <div>
                  <Label htmlFor="cancellation_policy">Politica di Cancellazione</Label>
                  <Textarea
                    id="cancellation_policy"
                    value={formData.cancellation_policy || ''}
                    onChange={(e) => handleChange('cancellation_policy', e.target.value)}
                    rows={3}
                    placeholder="Termini e condizioni di cancellazione..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: Images */}
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Immagini</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {id && existingImages.length > 0 && (
                  <div className="space-y-3">
                    <Label>Immagini Esistenti ({existingImages.length})</Label>
                    <ImageManager
                      images={existingImages}
                      onImagesChange={handleExistingImagesChange}
                      itemId={id}
                      tableName="venue_images"
                      storageBucket="venue-images"
                      autoSave={false}
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Label>
                    Carica Nuove Immagini
                    {id && ` (max ${20 - existingImages.length})`}
                  </Label>
                  <ImageUpload
                    images={images}
                    onImagesChange={handleImagesChange}
                    maxImages={id ? 20 - existingImages.length : 20}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Le nuove immagini verranno caricate quando salvi lo spazio.</strong>
                    <br />
                    Puoi riordinare le immagini esistenti trascinandole.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4 mt-6 flex justify-end gap-3 z-10 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/app/venues')}
            disabled={saving}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={saving || !formData.venue_name?.trim()}
          >
            {saving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {id ? 'Aggiorna Spazio' : 'Crea Spazio'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}