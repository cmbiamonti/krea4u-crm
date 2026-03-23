// src/components/projects/TaskModal.tsx

import { useState, useEffect } from 'react'
import { Task, TaskPriority, TaskStatus } from '@/types/project'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Trash2, User, Calendar, AlertCircle } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

// ✅ Costanti per priorità e status
const TASK_PRIORITIES = [
  { value: 'low', label: 'Bassa', color: 'text-blue-600' },
  { value: 'medium', label: 'Media', color: 'text-yellow-600' },
  { value: 'high', label: 'Alta', color: 'text-red-600' },
] as const

const TASK_STATUSES = [
  { value: 'todo', label: 'Da fare' },
  { value: 'in_progress', label: 'In corso' },
  { value: 'done', label: 'Completato' },
] as const

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

interface TaskFormData extends Partial<Task> {
  checklist?: ChecklistItem[]
  status?: TaskStatus
}

// ✅ Interfaccia aggiornata per team members (da project_participants)
interface TeamMember {
  id: string
  name: string
  type?: 'curator' | 'artist' | 'venue' | 'collaborator'
  avatar?: string | null
}

interface TaskModalProps {
  open: boolean
  onClose: () => void
  task: Task | null
  onSave: (task: Partial<Task>) => void
  onDelete?: (taskId: string) => void
  teamMembers?: TeamMember[]
}

export default function TaskModal({
  open,
  onClose,
  task,
  onSave,
  onDelete,
  teamMembers = [],
}: TaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    assigned_to: null,
    checklist: [],
  })

  const [newChecklistItem, setNewChecklistItem] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        checklist: (task as any).checklist || [],
        status: task.status || 'todo',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        due_date: '',
        assigned_to: null,
        checklist: [],
      })
    }
  }, [task, open])

  const handleSave = () => {
    if (!formData.title?.trim()) return
    onSave(formData)
    onClose()
  }

  const handleDelete = () => {
    if (task && task.id && onDelete) {
      if (confirm('Sei sicuro di voler eliminare questa task?')) {
        onDelete(task.id)
        onClose()
      }
    }
  }

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    
    setFormData({
      ...formData,
      checklist: [
        ...(formData.checklist || []),
        { id: uuidv4(), text: newChecklistItem, completed: false },
      ],
    })
    setNewChecklistItem('')
  }

  const toggleChecklistItem = (itemId: string) => {
    setFormData({
      ...formData,
      checklist: formData.checklist?.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    })
  }

  const removeChecklistItem = (itemId: string) => {
    setFormData({
      ...formData,
      checklist: formData.checklist?.filter((item) => item.id !== itemId),
    })
  }

  // ✅ Calcola progresso checklist
  const checklistProgress = formData.checklist && formData.checklist.length > 0
    ? Math.round((formData.checklist.filter(i => i.completed).length / formData.checklist.length) * 100)
    : 0

  // ✅ Trova il team member assegnato
  const assignedMember = teamMembers.find(m => m.id === formData.assigned_to)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {task ? 'Modifica Task' : 'Nuova Task'}
            {task && (
              <Badge variant={task.status === 'done' ? 'default' : 'secondary'}>
                {TASK_STATUSES.find(s => s.value === task.status)?.label || task.status}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Gestisci i dettagli della task del progetto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              Titolo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Es: Preparazione spazio espositivo"
              className="text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Dettagli della task..."
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Priorità
              </Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status || 'todo'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as TaskStatus,
                  })
                }
                className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Scadenza
              </Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date || ''}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="text-sm"
              />
            </div>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assigned_to" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Assegnato a
            </Label>
            {teamMembers.length > 0 ? (
              <div className="space-y-2">
                <select
                  id="assigned_to"
                  value={formData.assigned_to || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, assigned_to: e.target.value || null })
                  }
                  className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Non assegnato</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.type ? `(${member.type})` : ''}
                    </option>
                  ))}
                </select>
                {assignedMember && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <User className="h-4 w-4" />
                    <span>Assegnato a: <strong>{assignedMember.name}</strong></span>
                    {assignedMember.type && (
                      <Badge variant="outline" className="text-xs">
                        {assignedMember.type}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Nessun membro del team disponibile per l'assegnazione
              </p>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Checklist</Label>
              {formData.checklist && formData.checklist.length > 0 && (
                <Badge variant="secondary">
                  {formData.checklist.filter(i => i.completed).length}/{formData.checklist.length} completati
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            {formData.checklist && formData.checklist.length > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progresso</span>
                  <span>{checklistProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Checklist Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3 bg-gray-50">
              {formData.checklist && formData.checklist.length > 0 ? (
                formData.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 py-1">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleChecklistItem(item.id)}
                    />
                    <span
                      className={`flex-1 text-sm ${
                        item.completed ? 'line-through text-neutral-500' : 'text-gray-700'
                      }`}
                    >
                      {item.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChecklistItem(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-2">
                  Nessun item nella checklist
                </p>
              )}
            </div>

            {/* Add Checklist Item */}
            <div className="flex gap-2">
              <Input
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Aggiungi nuovo item..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addChecklistItem()
                  }
                }}
                className="text-sm"
              />
              <Button 
                type="button" 
                onClick={addChecklistItem}
                disabled={!newChecklistItem.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Aggiungi
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex justify-between w-full">
            {task && task.id && onDelete && (
              <Button variant="destructive" onClick={handleDelete} size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onClose} size="sm">
                Annulla
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!formData.title?.trim()}
                size="sm"
              >
                {task ? 'Aggiorna' : 'Crea'} Task
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}