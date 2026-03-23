// src/components/maps/AddressGeocoder.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { geocodeAddress } from '@/services/geocoding.service'

interface AddressGeocoderProps {
  onCoordinatesFound: (
    lat: number,
    lng: number,
    formattedAddress: string
  ) => void
  initialAddress?: string
  cityHint?: string
}

export default function AddressGeocoder({
  onCoordinatesFound,
  initialAddress = '',
  cityHint,
}: AddressGeocoderProps) {
  const [address, setAddress] = useState(initialAddress)
  const [isGeocoding, setIsGeocoding] = useState(false)

  const handleGeocode = async () => {
    if (!address.trim()) {
      toast.error('Please enter an address')
      return
    }

    setIsGeocoding(true)
    toast.loading('Finding coordinates...')

    try {
      const result = await geocodeAddress(address, cityHint)

      toast.dismiss()

      if (result) {
        onCoordinatesFound(result.lat, result.lng, result.formatted_address)
        
        // Aggiorna input con indirizzo formattato
        setAddress(result.formatted_address)
        
        toast.success('Coordinates found!')
      } else {
        toast.error('Could not find location for this address')
      }
    } catch (error: any) {
      toast.dismiss()
      console.error('Geocoding error:', error)
      toast.error(error.message || 'Failed to geocode address')
    } finally {
      setIsGeocoding(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="geocode-address">Address</Label>
      <div className="flex gap-2">
        <Input
          id="geocode-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Via Example 123, Milan, Italy"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleGeocode()
            }
          }}
          disabled={isGeocoding}
        />
        <Button
          onClick={handleGeocode}
          disabled={isGeocoding || !address.trim()}
          type="button"
          variant="outline"
        >
          {isGeocoding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Click the pin button to get coordinates from address
      </p>
    </div>
  )
}