// src/components/templates/TemplateEditor.tsx
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Save, Loader2, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { templateService } from '@/services/templateService'
import type {
  Template,
  TemplateDocument,
  TemplateStatus,
  CreateDocumentDTO,
  UpdateDocumentDTO,
} from '@/types/template.types'

interface DocumentEditorProps {
  template?: Template
  document?: TemplateDocument
  onClose: () => void
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  template,
  document,
  onClose,
}) => {
  const [activeTab, setActiveTab]   = useState('edit')

  // ✅ metadata RIMOSSO dallo state — non esiste nel DB
  const [formData, setFormData] = useState<{
    name:        string
    status:      TemplateStatus
    template_id: string
    data:        Record<string, any>
  }>({
    name:        '',
    status:      'draft',
    template_id: '',
    data:        {},
  })

  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [templateContent, setTemplateContent] = useState(
    template?.content || (document as any)?.template_content
  )

  useEffect(() => {
    if (document) {
      setFormData({
        name:        document.name,
        status:      document.status,
        template_id: document.template_id || '',
        data:        document.data || {},
        // ✅ metadata RIMOSSO
      })
      setTemplateContent((document as any).template_content ?? null)

    } else if (template) {
      const initialData: Record<string, any> = {}
      template.content.sections.forEach(section => {
        section.fields.forEach(field => {
          initialData[field.id] = ''
        })
      })
      setFormData({
        name:        `${template.name} - ${new Date().toLocaleDateString('it-IT')}`,
        status:      'draft',
        template_id: template.id,
        data:        initialData,
        // ✅ metadata RIMOSSO
      })
      setTemplateContent(template.content)
    }
  }, [template, document])

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      data: { ...prev.data, [fieldId]: value },
    }))
  }

  // ── Salva ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      if (!formData.name.trim()) {
        setError('Il nome del documento è obbligatorio')
        setSaving(false)
        return
      }

      if (document) {
        // ✅ UpdateDocumentDTO senza metadata
        const updateData: UpdateDocumentDTO = {
          name:   formData.name,
          status: formData.status,
          data:   formData.data,
          // ❌ metadata rimosso
        }
        await templateService.updateDocument(document.id, updateData)
        toast.success('Documento aggiornato con successo')

      } else {
        // ✅ CreateDocumentDTO senza metadata
        const createData: CreateDocumentDTO = {
          template_id:      formData.template_id,
          name:             formData.name,
          status:           formData.status,
          data:             formData.data,
          // Passa nome e versione direttamente per evitare query extra
          template_name:    template?.name    || '',
          template_version: template?.version || '1.0',
          // ❌ metadata rimosso
        }
        await templateService.createDocument(createData)
        toast.success('Documento creato con successo')
      }

      onClose()
    } catch (err: any) {
      console.error('Error saving document:', err)
      setError(err.message || 'Errore nel salvataggio del documento')
      toast.error('Errore nel salvataggio del documento')
    } finally {
      setSaving(false)
    }
  }

  const handleExportPDF = () => {
    toast.info('Funzionalità Export PDF in arrivo!')
  }

  // ── Render campo ───────────────────────────────────────────────────────────
  const renderField = (field: any) => {
    const value = formData.data[field.id] ?? ''

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows={4}
            />
          </div>
        )

      case 'number':
      case 'currency':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="relative">
              {field.type === 'currency' && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  €
                </span>
              )}
              <Input
                id={field.id}
                type="number"
                value={value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className={field.type === 'currency' ? 'pl-7' : ''}
              />
            </div>
          </div>
        )

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        )

      case 'email':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="email"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        )

      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="tel"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Seleziona...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value === true}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id} className="cursor-pointer">
              {field.label}
            </Label>
          </div>
        )

      case 'section':
        return (
          <div key={field.id} className="pt-4">
            <h3 className="text-lg font-semibold">{field.label}</h3>
            <Separator className="mt-2" />
          </div>
        )

      default: // text
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        )
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {document ? 'Modifica Documento' : 'Nuovo Documento'}
        </DialogTitle>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="edit">Modifica</TabsTrigger>
          <TabsTrigger value="preview">Anteprima</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ── Tab Modifica ─────────────────────────────────────────────────── */}
        <TabsContent value="edit" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="docName">Nome Documento *</Label>
            <Input
              id="docName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Es: Contratto Mario Rossi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Stato</Label>
            <Select
              value={formData.status}
              onValueChange={(value: TemplateStatus) =>
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Bozza</SelectItem>
                <SelectItem value="completed">Completato</SelectItem>
                <SelectItem value="signed">Firmato</SelectItem>
                <SelectItem value="archived">Archiviato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {templateContent && templateContent.sections.map((section) => (
            <div key={section.id} className="space-y-4">
              <h3 className="text-lg font-semibold mt-4">{section.title}</h3>
              {section.fields.map((field) => renderField(field))}
            </div>
          ))}
        </TabsContent>

        {/* ── Tab Anteprima ────────────────────────────────────────────────── */}
        <TabsContent value="preview" className="mt-4">
          <div className="border rounded-lg p-6 bg-muted/50 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{formData.name}</h2>
              <p className="text-sm text-muted-foreground">
                Stato:{' '}
                {formData.status === 'draft'     && 'Bozza'}
                {formData.status === 'completed' && 'Completato'}
                {formData.status === 'signed'    && 'Firmato'}
                {formData.status === 'archived'  && 'Archiviato'}
              </p>
            </div>

            <Separator />

            {templateContent && templateContent.sections.map((section) => (
              <div key={section.id}>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                  {section.title}
                </h3>
                <div className="space-y-3 pl-4">
                  {section.fields.map((field) => {
                    const value = formData.data[field.id]
                    if (!value || field.type === 'section') return null
                    return (
                      <div key={field.id}>
                        <p className="text-sm text-muted-foreground">
                          {field.label}:
                        </p>
                        <p className="font-medium">
                          {field.type === 'checkbox'
                            ? (value ? '✓ Sì' : '✗ No')
                            : field.type === 'currency'
                            ? `€ ${value}`
                            : value}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab Info ─────────────────────────────────────────────────────── */}
        <TabsContent value="info" className="mt-4 space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Stato</p>
              <p className="font-medium">
                {formData.status === 'draft'     && 'Bozza'}
                {formData.status === 'completed' && 'Completato'}
                {formData.status === 'signed'    && 'Firmato'}
                {formData.status === 'archived'  && 'Archiviato'}
              </p>
            </div>

            {document && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Creato il</p>
                  <p className="font-medium">
                    {new Date(document.created_at).toLocaleString('it-IT')}
                  </p>
                </div>

                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Ultima modifica</p>
                  <p className="font-medium">
                    {new Date(document.updated_at).toLocaleString('it-IT')}
                  </p>
                </div>

                {document.completed_at && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Completato il</p>
                      <p className="font-medium">
                        {new Date(document.completed_at).toLocaleString('it-IT')}
                      </p>
                    </div>
                  </>
                )}

                {document.signed_at && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Firmato il</p>
                      <p className="font-medium">
                        {new Date(document.signed_at).toLocaleString('it-IT')}
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={handleExportPDF} disabled={saving}>
          <FileDown className="mr-2 h-4 w-4" />
          Esporta PDF
        </Button>
        <Button variant="outline" onClick={onClose}>
          Annulla
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvataggio...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salva
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

export default DocumentEditor