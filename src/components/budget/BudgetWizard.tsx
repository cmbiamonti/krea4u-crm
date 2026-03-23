// src/components/budget/BudgetWizard.tsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Download,
  Plus,
  Trash2,
  Calculator,
} from 'lucide-react'
import { toast } from 'sonner'
import BudgetCategoryForm from './BudgetCategoryForm'
import BudgetSummary from './BudgetSummary'
import { BudgetService } from '@/services/budget.service'
import { getTemplateForProjectType } from '@/utils/budgetTemplates'
import type { Budget, BudgetCategory, ProjectType } from '@/types/budget.types'

interface BudgetWizardProps {
  projectId: string
  existingBudget?: Budget
  onClose: () => void
}

export default function BudgetWizard({ projectId, existingBudget, onClose }: BudgetWizardProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Budget data
  const [projectType, setProjectType] = useState<ProjectType>(existingBudget?.project_type || 'exhibition')
  const [title, setTitle] = useState(existingBudget?.title || '')
  const [description, setDescription] = useState(existingBudget?.description || '')
  const [categories, setCategories] = useState<BudgetCategory[]>(existingBudget?.categories || [])
  const [contingencyPercentage, setContingencyPercentage] = useState(existingBudget?.contingency_percentage || 10)
  const [currency, setCurrency] = useState(existingBudget?.currency || 'EUR')

  const totalSteps = 4

  // Load template when project type changes
  const loadTemplate = () => {
    const template = getTemplateForProjectType(projectType)
    const newCategories: BudgetCategory[] = template.categories.map((cat, index) => ({
      id: `cat-${Date.now()}-${index}`,
      name: cat.name,
      icon: cat.icon,
      items: [],
      subtotal: 0,
    }))
    setCategories(newCategories)
    toast.success(`Template "${projectTypeLabels[projectType]}" caricato`)
  }

  // Calculate totals
  const totalCost = categories.reduce((sum, cat) => sum + cat.subtotal, 0)
  const contingencyAmount = (totalCost * contingencyPercentage) / 100
  const grandTotal = totalCost + contingencyAmount

  // Save budget
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Inserisci un titolo per il budget')
      return
    }

    setSaving(true)
    try {
      const budgetData: Partial<Budget> = {
        project_id: projectId,
        project_type: projectType,
        title,
        description,
        categories,
        total_cost: totalCost,
        contingency_percentage: contingencyPercentage,
        contingency_amount: contingencyAmount,
        grand_total: grandTotal,
        currency,
      }

      if (existingBudget) {
        await BudgetService.updateBudget(existingBudget.id, budgetData)
        toast.success('Budget aggiornato')
      } else {
        await BudgetService.createBudget(budgetData as Budget)
        toast.success('Budget creato')
      }

      onClose()
    } catch (error: any) {
      toast.error('Errore nel salvataggio: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Export PDF
  const handleExportPDF = async () => {
    try {
      await BudgetService.exportToPDF({
        project_id: projectId,
        project_type: projectType,
        title,
        description,
        categories,
        total_cost: totalCost,
        contingency_percentage: contingencyPercentage,
        contingency_amount: contingencyAmount,
        grand_total: grandTotal,
        currency,
      } as Budget)
      toast.success('PDF esportato')
    } catch (error: any) {
      toast.error('Errore export: ' + error.message)
    }
  }

  const projectTypeLabels: Record<ProjectType, string> = {
    exhibition: 'Mostra d\'Arte',
    concert: 'Concerto',
    workshop: 'Workshop',
    festival: 'Festival',
    other: 'Altro',
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {existingBudget ? 'Modifica Budget' : 'Crea Nuovo Budget'}
          </DialogTitle>
          <DialogDescription>
            Step {step} di {totalSteps}: {
              step === 1 ? 'Informazioni Generali' :
              step === 2 ? 'Template e Categorie' :
              step === 3 ? 'Voci di Costo' :
              'Riepilogo e Salvataggio'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full ${
                index < step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-1">
          {/* Step 1: General Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Tipo di Progetto *</Label>
                <Select value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exhibition">🎨 Mostra d'Arte</SelectItem>
                    <SelectItem value="concert">🎤 Concerto</SelectItem>
                    <SelectItem value="workshop">👨‍🏫 Workshop</SelectItem>
                    <SelectItem value="festival">🎭 Festival</SelectItem>
                    <SelectItem value="other">📋 Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Titolo Budget *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="es. Budget Mostra Primavera 2025"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrizione</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrizione dettagliata del budget..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contingenza (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={contingencyPercentage}
                    onChange={(e) => setContingencyPercentage(Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Percentuale per imprevisti (consigliato: 10-15%)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Valuta</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">€ Euro</SelectItem>
                      <SelectItem value="USD">$ Dollaro</SelectItem>
                      <SelectItem value="GBP">£ Sterlina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Template */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Carica Template</h3>
                  <p className="text-sm text-gray-500">
                    Template predefinito per: {projectTypeLabels[projectType]}
                  </p>
                </div>
                <Button onClick={loadTemplate} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Carica Template
                </Button>
              </div>

              {categories.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-500 mb-4">
                    Nessuna categoria caricata. Carica un template per iniziare.
                  </p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Card key={category.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            <p className="text-sm text-gray-500">
                              {category.items.length} voci
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {currency} {category.subtotal.toFixed(2)}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Budget Items */}
          {step === 3 && (
            <div className="space-y-6">
              {categories.map((category, categoryIndex) => (
                <BudgetCategoryForm
                  key={category.id}
                  category={category}
                  currency={currency}
                  projectType={projectType}
                  onChange={(updatedCategory) => {
                    const newCategories = [...categories]
                    newCategories[categoryIndex] = updatedCategory
                    setCategories(newCategories)
                  }}
                  onDelete={() => {
                    setCategories(categories.filter((_, i) => i !== categoryIndex))
                  }}
                />
              ))}

              {categories.length === 0 && (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">
                    Torna allo step precedente per caricare un template
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <BudgetSummary
              budget={{
                project_type: projectType,
                title,
                description,
                categories,
                total_cost: totalCost,
                contingency_percentage: contingencyPercentage,
                contingency_amount: contingencyAmount,
                grand_total: grandTotal,
                currency,
              } as Budget}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {step === 4 && (
              <>
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Esporta PDF
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    'Salvataggio...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salva Budget
                    </>
                  )}
                </Button>
              </>
            )}
            {step < totalSteps && (
              <Button onClick={() => setStep(step + 1)}>
                Avanti
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}