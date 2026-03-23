import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  FileText, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { EmailService } from '@/services/email.service'
import type { EmailTemplate, EmailVariable } from '@/types/email.types'

interface TemplateManagerProps {
  onSelectTemplate?: (template: EmailTemplate) => void
}

export default function TemplateManager({ onSelectTemplate }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body_html: '',
    body_text: '',
    variables: [] as EmailVariable[]
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await EmailService.getTemplates()
      setTemplates(data)
    } catch (error: any) {
      console.error('Error loading templates:', error)
      toast.error('Errore nel caricamento dei template')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        name: template.name,
        subject: template.subject,
        body_html: template.body_html,
        body_text: template.body_text || '',
        variables: template.variables
      })
    } else {
      setEditingTemplate(null)
      setFormData({
        name: '',
        subject: '',
        body_html: '',
        body_text: '',
        variables: []
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.body_html) {
      toast.error('Compila tutti i campi obbligatori')
      return
    }

    try {
      setLoading(true)

      if (editingTemplate) {
        // Update (richiede implementazione service)
        toast.error('Modifica template non ancora implementata')
      } else {
        // Create
        await EmailService.saveTemplate(formData)
        toast.success('Template salvato con successo')
      }

      setIsDialogOpen(false)
      loadTemplates()
    } catch (error: any) {
      console.error('Error saving template:', error)
      toast.error(error.message || 'Errore nel salvataggio')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo template?')) return

    try {
      await EmailService.deleteTemplate(id)
      toast.success('Template eliminato')
      loadTemplates()
    } catch (error: any) {
      console.error('Error deleting template:', error)
      toast.error('Errore nell\'eliminazione')
    }
  }

  const handleUseTemplate = (template: EmailTemplate) => {
    onSelectTemplate?.(template)
    toast.success('Template caricato')
  }

  const addVariable = () => {
    setFormData({
      ...formData,
      variables: [
        ...formData.variables,
        { name: '', placeholder: '', description: '' }
      ]
    })
  }

  const updateVariable = (index: number, field: keyof EmailVariable, value: string) => {
    const newVariables = [...formData.variables]
    newVariables[index] = { ...newVariables[index], [field]: value }
    setFormData({ ...formData, variables: newVariables })
  }

  const removeVariable = (index: number) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Template Email
          </h2>
          <p className="text-sm text-gray-500">
            Gestisci i tuoi template riutilizzabili
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Template
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Modifica Template' : 'Nuovo Template'}
              </DialogTitle>
              <DialogDescription>
                Crea template riutilizzabili con variabili personalizzabili
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label>Nome Template *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Es: Proposta collaborazione"
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label>Oggetto *</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Es: Proposta di collaborazione per {{project_name}}"
                />
                <p className="text-xs text-gray-500">
                  Usa {`{{variable_name}}`} per variabili dinamiche
                </p>
              </div>

              {/* Body HTML */}
              <div className="space-y-2">
                <Label>Corpo Email (HTML) *</Label>
                <Textarea
                  value={formData.body_html}
                  onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                  placeholder="<p>Gentile {{recipient_name}},</p>..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              {/* Body Text */}
              <div className="space-y-2">
                <Label>Corpo Email (Testo)</Label>
                <Textarea
                  value={formData.body_text}
                  onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                  placeholder="Versione testuale (fallback)"
                  rows={6}
                />
              </div>

              {/* Variables */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Variabili</Label>
                  <Button variant="outline" size="sm" onClick={addVariable}>
                    <Plus className="h-3 w-3 mr-1" />
                    Aggiungi Variabile
                  </Button>
                </div>

                {formData.variables.map((variable, index) => (
                  <Card key={index} className="p-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Nome (es: recipient_name)"
                        value={variable.name}
                        onChange={(e) => updateVariable(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Placeholder (es: {{recipient_name}})"
                        value={variable.placeholder}
                        onChange={(e) => updateVariable(index, 'placeholder', e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Descrizione"
                          value={variable.description}
                          onChange={(e) => updateVariable(index, 'description', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariable(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {formData.variables.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nessuna variabile definita
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  'Salva Template'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-2">Nessun template</p>
          <p className="text-sm text-gray-400">
            Crea il tuo primo template per velocizzare l'invio di email
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.subject}</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Usa Template
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenDialog(template)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Elimina
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Variables */}
              {template.variables.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.variables.map((variable, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {variable.placeholder}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Preview */}
              <div className="text-xs text-gray-500 line-clamp-3 bg-gray-50 p-2 rounded">
                {template.body_text || 'Nessuna anteprima disponibile'}
              </div>

              {/* Footer */}
              <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs text-gray-500">
                <span>
                  Creato {new Date(template.created_at).toLocaleDateString('it-IT')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUseTemplate(template)}
                >
                  Usa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}