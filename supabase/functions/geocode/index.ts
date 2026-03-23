// supabase/functions/geocode/index.ts

// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore
serve(async (req: any) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const address = body.address

    if (!address || address.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Address is required', success: false }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // @ts-ignore
    const GOOGLE_MAPS_KEY = Deno.env.get('GOOGLE_MAPS_SERVER_KEY')

    if (!GOOGLE_MAPS_KEY) {
      console.error('GOOGLE_MAPS_SERVER_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Server configuration error', success: false }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${GOOGLE_MAPS_KEY}`

    console.log('Geocoding address:', address)

    const response = await fetch(geocodeUrl)
    const data = await response.json()

    console.log('Google API status:', data.status)

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0]
      const location = result.geometry.location

      return new Response(
        JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          success: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else if (data.status === 'ZERO_RESULTS') {
      return new Response(
        JSON.stringify({
          error: 'Location not found',
          status: data.status,
          success: false,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else {
      console.error('Google API error:', data)
      return new Response(
        JSON.stringify({
          error: data.error_message || 'Geocoding failed',
          status: data.status,
          success: false,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (err) {
    console.error('Geocoding error:', err)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})