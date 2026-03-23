import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Venue } from '@/types/venue'
import { formatCurrency } from '@/lib/utils'
import PageHeader from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { mapVenues } from '@/utils/typeMappers';
import {
  ArrowLeft,
  Download,
  Check,
  X,
  MapPin,
  Maximize,
  Users,
  Ruler,
  Euro,
} from 'lucide-react'

export default function VenuesComparison() {
  const [searchParams] = useSearchParams()
  const ids = searchParams.get('ids')?.split(',') || []
  
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ids.length > 0) {
      fetchVenues()
    }
  }, [ids])

  const fetchVenues = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('venues')
        .select(`
          *,
          images:venue_images(*)
        `)
        .in('id', ids)

      if (error) throw error
      setVenues(mapVenues(data || []))
    } catch (error) {
      console.error('Error fetching venues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    // Export comparison as PDF
    alert('Export PDF funzionalità in arrivo')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 mb-4">Nessuno spazio da confrontare</p>
        <Button asChild>
          <Link to="/app/venues">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla ricerca
          </Link>
        </Button>
      </div>
    )
  }

  const comparisonRows = [
    {
      label: 'Immagine',
      render: (venue: Venue) => (
        <div className="w-full h-32 bg-neutral-100 rounded overflow-hidden">
          {venue.images?.[0] ? (
            <img
              src={venue.images[0].image_url}
              alt={venue.venue_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-8 w-8 text-neutral-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      label: 'Nome',
      render: (venue: Venue) => (
        <Link
          to={`/app/venues/${venue.id}`}
          className="font-semibold hover:text-primary"
        >
          {venue.venue_name}
        </Link>
      ),
    },
    {
      label: 'Tipologia',
      render: (venue: Venue) => <Badge variant="secondary">{venue.venue_type}</Badge>,
    },
    {
      label: 'Città',
      render: (venue: Venue) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-neutral-500" />
          {venue.city}
        </div>
      ),
    },
    {
      label: 'Dimensione',
      render: (venue: Venue) =>
        venue.size_sqm ? (
          <div className="flex items-center gap-2">
            <Maximize className="h-4 w-4 text-neutral-500" />
            {venue.size_sqm} m²
          </div>
        ) : (
          <span className="text-neutral-500">-</span>
        ),
    },
    {
      label: 'Sale',
      render: (venue: Venue) =>
        venue.number_of_rooms ? (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-neutral-500" />
            {venue.number_of_rooms}
          </div>
        ) : (
          <span className="text-neutral-500">-</span>
        ),
    },
    {
      label: 'Altezza',
      render: (venue: Venue) =>
        venue.ceiling_height ? (
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-neutral-500" />
            {venue.ceiling_height} m
          </div>
        ) : (
          <span className="text-neutral-500">-</span>
        ),
    },
    {
      label: 'Luce Naturale',
      render: (venue: Venue) =>
        venue.natural_light ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <X className="h-5 w-5 text-error" />
        ),
    },
    {
      label: 'Tariffa',
      render: (venue: Venue) =>
        venue.rental_fee ? (
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-neutral-500" />
            <span className="font-semibold text-primary">
              {formatCurrency(venue.rental_fee)}
            </span>
          </div>
        ) : (
          <span className="text-neutral-500">Su richiesta</span>
        ),
    },
    {
      label: 'WiFi',
      render: (venue: Venue) =>
        venue.amenities?.includes('wifi') ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <X className="h-5 w-5 text-error" />
        ),
    },
    {
      label: 'Parcheggio',
      render: (venue: Venue) =>
        venue.amenities?.includes('parking') ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <X className="h-5 w-5 text-error" />
        ),
    },
    {
      label: 'Climatizzazione',
      render: (venue: Venue) =>
        venue.amenities?.includes('climate_control') ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <X className="h-5 w-5 text-error" />
        ),
    },
    {
      label: 'Illuminazione Pro',
      render: (venue: Venue) =>
        venue.amenities?.includes('professional_lighting') ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <X className="h-5 w-5 text-error" />
        ),
    },
    {
      label: 'Sicurezza',
      render: (venue: Venue) =>
        venue.amenities?.includes('security') ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <X className="h-5 w-5 text-error" />
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Confronto Spazi"
        description={`Confronto tra ${venues.length} spazi selezionati`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Spazi', href: '/appvenues' },
          { label: 'Confronto' },
        ]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Esporta PDF
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app/venues">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla ricerca
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 bg-white z-10 p-4 text-left font-semibold border-r">
                    Caratteristica
                  </th>
                  {venues.map((venue) => (
                    <th key={venue.id} className="p-4 text-left font-semibold min-w-[200px]">
                      {/* Header handled in first row */}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-neutral-50">
                    <td className="sticky left-0 bg-white z-10 p-4 font-medium border-r">
                      {row.label}
                    </td>
                    {venues.map((venue) => (
                      <td key={venue.id} className="p-4">
                        {row.render(venue)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-center gap-3">
        {venues.map((venue) => (
          <Button key={venue.id} asChild>
            <Link to={`/app/venues/${venue.id}`}>Visualizza {venue.venue_name}</Link>
          </Button>
        ))}
      </div>
    </div>
  )
}