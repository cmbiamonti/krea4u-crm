import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import ImportCSV from '@/components/artists/ImportCSV'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function ArtistsImport() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        title="Importa Artisti"
        description="Carica artisti in batch da file CSV"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Artisti', href: '/app/artists' },
          { label: 'Importa' },
        ]}
        action={
          <Button variant="outline" onClick={() => ('/app/artists')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla lista
          </Button>
        }
      />

      <ImportCSV onImportComplete={() => navigate('/app/artists')} />
    </div>
  )
}