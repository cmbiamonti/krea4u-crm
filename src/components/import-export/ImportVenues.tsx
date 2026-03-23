import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'

export function ImportVenues() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Importa Spazi</CardTitle>
        <CardDescription>
          Importa i tuoi spazi espositivi da file CSV o Excel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
          <p className="text-neutral-600 mb-2">
            Importazione spazi in arrivo
          </p>
          <p className="text-sm text-neutral-500">
            Potrai caricare massivamente i dati degli spazi espositivi
          </p>
        </div>
      </CardContent>
    </Card>
  )
}