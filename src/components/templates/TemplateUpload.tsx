// src/components/templates/TemplateUpload.tsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileJson, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { templateService } from '@/services/templateService'
import { TemplateCategory, TemplateContent } from '@/types/template.types'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface TemplateUploadProps {
  categories: TemplateCategory[]
  onSuccess?: () => void
}

export default function TemplateUpload({ categories, onSuccess }: TemplateUploadProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    tags: ''
  })
  const [jsonFile, setJsonFile] = useState<File | null>(null)
  const [jsonContent, setJsonContent] = useState<TemplateContent | null>(null)
  const [jsonError, setJsonError] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setJsonError('Il file deve essere in formato JSON')
      return
    }

    setJsonFile(file)
    setJsonError('')

    // Read and validate JSON
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = JSON.parse(event.target?.result as string)
        
        // Validate structure
        if (!content.sections || !Array.isArray(content.sections)) {
          throw new Error('Il JSON deve contenere un array "sections"')
        }

        setJsonContent(content)
        toast.success('File JSON valido caricato')
      } catch (error: any) {
        setJsonError(error.message || 'JSON non valido')
        setJsonContent(null)
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!jsonContent) {
      toast.error('Carica un file JSON valido')
      return
    }

    if (!formData.category_id || !formData.name) {
      toast.error('Compila tutti i campi obbligatori')
      return
    }

    setLoading(true)

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)

      await templateService.createTemplate({
        category_id: formData.category_id,
        name: formData.name,
        description: formData.description || undefined,
        content: jsonContent,
        tags: tagsArray
      })

      toast.success('Template caricato con successo')
      
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/app/settings?tab=templates')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Errore durante il caricamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carica Nuovo Template</CardTitle>
        <CardDescription>
          Importa un template personalizzato da file JSON
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Template *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="es: Contratto Artista Personalizzato"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Breve descrizione del template"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="contratto, artista, mostra (separate da virgola)"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="json-file">File JSON Template *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="json-file"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="flex-1"
                required
              />
              {jsonFile && !jsonError && (
                <div className="flex items-center text-green-600">
                  <FileJson className="h-5 w-5 mr-1" />
                  <span className="text-sm">{jsonFile.name}</span>
                </div>
              )}
            </div>
            
            {jsonError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{jsonError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Structure Info */}
          {jsonContent && (
            <Alert>
              <FileJson className="h-4 w-4" />
              <AlertDescription>
                Template caricato: {jsonContent.sections.length} sezioni,{' '}
                {jsonContent.sections.reduce((sum, s) => sum + s.fields.length, 0)} campi totali
              </AlertDescription>
            </Alert>
          )}

          {/* Example JSON */}
          <details className="text-sm text-neutral-600">
            <summary className="cursor-pointer font-medium mb-2">
              Vedi esempio struttura JSON
            </summary>
            <pre className="bg-neutral-50 p-4 rounded-lg overflow-x-auto">
{`{
  "sections": [
    {
      "id": "section1",
      "title": "Sezione 1",
      "description": "Descrizione opzionale",
      "collapsible": true,
      "defaultExpanded": true,
      "fields": [
        {
          "id": "field1",
          "label": "Campo 1",
          "type": "text",
          "required": true,
          "placeholder": "Inserisci valore"
        }
      ]
    }
  ]
}`}
            </pre>
          </details>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !jsonContent}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Caricamento...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Carica Template
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/app/settings?tab=templates')}
            >
              Annulla
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}