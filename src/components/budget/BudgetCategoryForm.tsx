// src/components/budget/BudgetCategoryForm.tsx

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from '@/components/ui/accordion'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { getTemplateForProjectType } from '@/utils/budgetTemplates'
import type { BudgetCategory, BudgetItem, ProjectType } from '@/types/budget.types'

interface BudgetCategoryFormProps {
  category: BudgetCategory
  currency: string
  projectType: ProjectType
  onChange: (category: BudgetCategory) => void
  onDelete: () => void
}

export default function BudgetCategoryForm({
  category,
  currency,
  projectType,
  onChange,
  onDelete,
}: BudgetCategoryFormProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const template = getTemplateForProjectType(projectType)
  const categoryTemplate = template.categories.find(c => c.name === category.name)

  const addItem = () => {
    const newItem: BudgetItem = {
      id: `item-${Date.now()}`,
      category: category.name,
      subcategory: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
      notes: '',
    }

    const updatedCategory = {
      ...category,
      items: [...category.items, newItem],
    }
    onChange(updatedCategory)
  }

  const addFromTemplate = (templateItem: any) => {
    const newItem: BudgetItem = {
      id: `item-${Date.now()}`,
      category: category.name,
      subcategory: templateItem.subcategory,
      description: templateItem.description,
      quantity: 1,
      unit_price: 0,
      total: 0,
      notes: '',
    }

    const updatedCategory = {
      ...category,
      items: [...category.items, newItem],
    }
    onChange(updatedCategory)
  }

  const updateItem = (itemId: string, field: keyof BudgetItem, value: any) => {
    const updatedItems = category.items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value }
        
        // Ricalcola totale se cambiano quantità o prezzo
        if (field === 'quantity' || field === 'unit_price') {
          updated.total = updated.quantity * updated.unit_price
        }
        
        return updated
      }
      return item
    })

    // Ricalcola subtotale categoria
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0)

    onChange({
      ...category,
      items: updatedItems,
      subtotal,
    })
  }

  const deleteItem = (itemId: string) => {
    const updatedItems = category.items.filter(item => item.id !== itemId)
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0)

    onChange({
      ...category,
      items: updatedItems,
      subtotal,
    })
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div
        className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{category.icon}</span>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {category.name}
                <Badge variant="secondary" className="text-xs">
                  {category.items.length} voci
                </Badge>
              </h3>
              <p className="text-sm text-gray-500">
                Subtotale: {currency} {category.subtotal.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              title="Elimina categoria"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Template Items */}
          {categoryTemplate && categoryTemplate.common_items.length > 0 && (
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">
                Voci Suggerite
              </Label>
              <div className="flex flex-wrap gap-2">
                {categoryTemplate.common_items.map((templateItem, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => addFromTemplate(templateItem)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {templateItem.description}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Budget Items */}
          <div className="space-y-3">
            {category.items.map((item, index) => (
              <Card key={item.id} className="p-4 bg-gray-50">
                <div className="space-y-3">
                  {/* Row 1: Subcategory and Description */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Sottocategoria</Label>
                      <Input
                        value={item.subcategory}
                        onChange={(e) => updateItem(item.id, 'subcategory', e.target.value)}
                        placeholder="es. Materiali"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Descrizione *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="es. Pannelli espositivi"
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Row 2: Quantity, Unit Price, Total */}
                  <div className="grid grid-cols-4 gap-3 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantità</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Prezzo Unit. ({currency})</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Totale</Label>
                      <div className="h-9 px-3 rounded-md border bg-gray-100 flex items-center font-medium">
                        {currency} {item.total.toFixed(2)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="h-9"
                      title="Elimina voce"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>

                  {/* Row 3: Notes */}
                  <div className="space-y-1">
                    <Label className="text-xs">Note (opzionale)</Label>
                    <Input
                      value={item.notes || ''}
                      onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                      placeholder="Note aggiuntive..."
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </Card>
            ))}

            {category.items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Nessuna voce aggiunta</p>
                <p className="text-xs mt-1">
                  Clicca su "Aggiungi Voce" o scegli dalle voci suggerite
                </p>
              </div>
            )}
          </div>

          {/* Add Item Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Voce Personalizzata
          </Button>
        </div>
      )}
    </Card>
  )
}