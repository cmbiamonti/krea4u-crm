// src/components/maps/ReverseGeocoder.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { reverseGeocode } from '@/services/geocoding.service'

interface ReverseGeocoderProps {
  latitude: number
  longitude: number
  onAddressFound: (
    address: string,
    components: any
  ) => void
}

export default function ReverseGeocoder({
  latitude,
  longitude,
  onAddressFound,
}: ReverseGeocoderProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleReverseGeocode = async () => {
    setIsLoading(true)
    toast.loading('Finding address...')

    try {
      const result = await reverseGeocode(latitude, longitude)

      toast.dismiss()

      if (result) {
        onAddressFound(
          result.formatted_address,
          result.address_components
        )
        toast.success('Address found!')
      } else {
        toast.error('Could not find address for these coordinates')
      }
    } catch (error: any) {
      toast.dismiss()
      console.error('Reverse geocoding error:', error)
      toast.error(error.message || 'Failed to find address')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleReverseGeocode}
      disabled={isLoading || !latitude || !longitude}
      type="button"
      variant="outline"
      size="sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Finding address...
        </>
      ) : (
        <>
          <Search className="h-4 w-4 mr-2" />
          Get address from coordinates
        </>
      )}
    </Button>
  )
}