import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ParsedArtist {
  first_name: string
  last_name: string
  artist_name?: string
  email?: string
  phone?: string
  nationality?: string
  city?: string
  medium?: string[]
  price_range?: string
  availability_status?: string
  valid: boolean
  errors: string[]
}

export default function ImportCSV({ onImportComplete }: { onImportComplete: () => void }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [parsedData, setParsedData] = useState<ParsedArtist[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [importing, setImporting] = useState(false)

  const downloadTemplate = () => {
    const template = `Nome,Cognome,Nome Artistico,Email,Telefono,Nazionalità,Città,Medium,Fascia Prezzo,Status
Mario,Rossi,Mario R.,mario.rossi@email.com,+39 340 1234567,Italiana,Milano,"Pittura;Scultura",5000-15000,available
Giulia,Bianchi,G. Bianchi,giulia@email.com,+39 348 9876543,Italiana,Roma,Fotografia,2000-8000,available`

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'template-artisti.csv')
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const parseCSV = (text: string): ParsedArtist[] => {
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    return lines.slice(1).map((line, _index) => {
      const values = parseCSVLine(line)
      const artist: any = {}
      const errors: string[] = []

      headers.forEach((header, i) => {
        const value = values[i]?.trim()
        
        switch (header) {
          case 'nome':
            artist.first_name = value
            if (!value) errors.push('Nome obbligatorio')
            break
          case 'cognome':
            artist.last_name = value
            if (!value) errors.push('Cognome obbligatorio')
            break
          case 'nome artistico':
            artist.artist_name = value || null
            break
          case 'email':
            artist.email = value || null
            if (value && !isValidEmail(value)) {
              errors.push('Email non valida')
            }
            break
          case 'telefono':
            artist.phone = value || null
            break
          case 'nazionalità':
            artist.nationality = value || null
            break
          case 'città':
            artist.city = value || null
            break
          case 'medium':
            artist.medium = value ? value.split(';').map(m => m.trim()) : []
            break
          case 'fascia prezzo':
            artist.price_range = value || null
            break
          case 'status':
            artist.availability_status = value || 'available'
            break
        }
      })

      return {
        ...artist,
        valid: errors.length === 0,
        errors,
      }
    })
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const parsed = parseCSV(text)
      setParsedData(parsed)
      setShowPreview(true)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!user) return

    const validArtists = parsedData.filter(a => a.valid)
    if (validArtists.length === 0) {
      toast({
        title: 'Errore',
        description: 'Nessun artista valido da importare',
        variant: 'destructive',
      })
      return
    }

    setImporting(true)

    try {
      const artistsToInsert = validArtists.map(artist => ({
        created_by: user.id,
        first_name: artist.first_name,
        last_name: artist.last_name,
        artist_name: artist.artist_name || null,
        email: artist.email || null,
        phone: artist.phone || null,
        nationality: artist.nationality || null,
        city: artist.city || null,
        medium: artist.medium?.length ? artist.medium : null,
        price_range: artist.price_range || null,
        availability_status: artist.availability_status || 'available',
      }))

      const { error } = await supabase
        .from('artists')
        .insert(artistsToInsert as any) 

      if (error) throw error

      toast({
        title: 'Successo',
        description: `${validArtists.length} artisti importati con successo`,
      })

      setShowPreview(false)
      setParsedData([])
      onImportComplete()
    } catch (error) {
      console.error('Error importing artists:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile importare gli artisti',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
    }
  }

  const validCount = parsedData.filter(a => a.valid).length
  const invalidCount = parsedData.length - validCount

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importa Artisti da CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={downloadTemplate}
            >
              <Download className="h-4 w-4 mr-2" />
              Scarica Template
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Carica CSV
            </Button>
          </div>

          <div className="text-sm text-neutral-600">
            <p className="font-medium mb-2">Istruzioni:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Scarica il template CSV</li>
              <li>Compila il file con i dati degli artisti</li>
              <li>Carica il file compilato</li>
              <li>Verifica l'anteprima e conferma l'importazione</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Anteprima Importazione</AlertDialogTitle>
            <AlertDialogDescription>
              Verifica i dati prima di procedere con l'importazione
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            {/* Stats */}
            <div className="flex gap-4">
              <Badge variant="default" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                {validCount} Validi
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  {invalidCount} Non validi
                </Badge>
              )}
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cognome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Città</TableHead>
                    <TableHead>Errori</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((artist, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {artist.valid ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-error" />
                        )}
                      </TableCell>
                      <TableCell>{artist.first_name}</TableCell>
                      <TableCell>{artist.last_name}</TableCell>
                      <TableCell>{artist.email || '-'}</TableCell>
                      <TableCell>{artist.city || '-'}</TableCell>
                      <TableCell>
                        {artist.errors.length > 0 && (
                          <div className="flex items-start gap-1 text-error text-xs">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{artist.errors.join(', ')}</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleImport}
              disabled={validCount === 0 || importing}
            >
              {importing ? 'Importazione...' : `Importa ${validCount} artisti`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}