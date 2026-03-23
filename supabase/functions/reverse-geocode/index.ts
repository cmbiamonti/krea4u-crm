// supabase/functions/reverse-geocode/index.ts

// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore
serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { latitude, longitude } = await req.json()

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Coordinates required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // @ts-ignore
    const GOOGLE_MAPS_KEY = Deno.env.get('GOOGLE_MAPS_SERVER_KEY')

    if (!GOOGLE_MAPS_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`
    const response = await fetch(geocodeUrl)
    const data = await response.json()

    if (data.status === 'OK' && data.results?.[0]) {
      const result = data.results[0]
      // @ts-ignore
      const addressComponents: any = {}
      
      // @ts-ignore
      result.address_components.forEach((component: any) => {
        if (component.types.includes('locality')) {
          // @ts-ignore
          addressComponents.city = component.long_name
        }
        if (component.types.includes('country')) {
          // @ts-ignore
          addressComponents.country = component.long_name
        }
        if (component.types.includes('postal_code')) {
          // @ts-ignore
          addressComponents.postal_code = component.long_name
        }
        if (component.types.includes('route')) {
          // @ts-ignore
          addressComponents.street = component.long_name
        }
        if (component.types.includes('street_number')) {
          // @ts-ignore
          addressComponents.street_number = component.long_name
        }
      })

      return new Response(
        JSON.stringify({
          formatted_address: result.formatted_address,
          address_components: addressComponents,
          place_id: result.place_id,
          success: true,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Address not found', success: false }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})