import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export function GoogleContactsImporter() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Contacts</CardTitle>
        <CardDescription>
          Importa contatti da Google
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
          <p className="text-neutral-600 mb-2">
            Integrazione Google Contacts in arrivo
          </p>
          <p className="text-sm text-neutral-500">
            Potrai sincronizzare i tuoi contatti Google
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
