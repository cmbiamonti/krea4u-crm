import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe } from 'lucide-react'

export function WebScraperImporter() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Web Scraper</CardTitle>
        <CardDescription>
          Importa dati da siti web esterni
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Globe className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
          <p className="text-neutral-600 mb-2">
            Funzionalità Web Scraper in arrivo
          </p>
          <p className="text-sm text-neutral-500">
            Potrai importare dati da siti web automaticamente
          </p>
        </div>
      </CardContent>
    </Card>
  )
}