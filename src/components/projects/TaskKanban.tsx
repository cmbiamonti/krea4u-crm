import { useState } from 'react'
import { Task } from '@/types/project'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Calendar, Flag, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

interface AssignedUser {
  id: string
  first_name: string
  last_name: string
}

interface TaskWithExtras extends Task {
  checklist?: ChecklistItem[]
  assigned_user?: AssignedUser
}

interface TaskKanbanProps {
  tasks: TaskWithExtras[]
  onTaskClick: (task: TaskWithExtras) => void
  onAddTask: (status: Task['status']) => void
  onTaskMove: (taskId: string, newStatus: Task['status']) => void
}

export default function TaskKanban({
  tasks,
  onTaskClick,
  onAddTask,
  onTaskMove,
}: TaskKanbanProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const columns: { status: Task['status']; label: string; color: string }[] = [
    { status: 'todo', label: 'Da Fare', color: 'bg-neutral-100' },
    { status: 'in_progress', label: 'In Corso', color: 'bg-blue-50' },
    { status: 'done', label: 'Completato', color: 'bg-green-50' },
  ]

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter((t) => t.status === status)
  }

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: Task['status']) => {
    if (draggedTask) {
      onTaskMove(draggedTask, status)
      setDraggedTask(null)
    }
  }

  const getPriorityConfig = (priority: Task['priority']) => {
    const priorityMap: Record<string, { value: string; label: string; color: string }> = {
      low: { value: 'low', label: 'Bassa', color: 'text-blue-500' },
      medium: { value: 'medium', label: 'Media', color: 'text-yellow-500' },
      high: { value: 'high', label: 'Alta', color: 'text-red-500' },
    }
    return priorityMap[priority] || priorityMap.medium
  }

  const getChecklistProgress = (checklist?: ChecklistItem[]) => {
    if (!checklist || checklist.length === 0) return 0
    const completed = checklist.filter((item) => item.completed).length
    return (completed / checklist.length) * 100
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status)

        return (
          <div key={column.status} className="space-y-4">
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-neutral-900">{column.label}</h3>
                <Badge variant="secondary">{columnTasks.length}</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddTask(column.status)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Drop Zone */}
            <div
              className={cn(
                'min-h-[400px] rounded-lg p-4 space-y-3',
                column.color
              )}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.status)}
            >
              {columnTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-neutral-500 text-sm">
                  Nessuna task
                </div>
              ) : (
                columnTasks.map((task) => {
                  const priorityConfig = getPriorityConfig(task.priority)
                  const checklistProgress = getChecklistProgress(task.checklist)

                  return (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className="cursor-move hover:shadow-md transition-shadow"
                      onClick={() => onTaskClick(task)}
                    >
                      <CardContent className="p-4 space-y-3">
                        {/* Title & Priority */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm line-clamp-2 flex-1">
                            {task.title}
                          </h4>
                          <Flag
                            className={cn(
                              'h-4 w-4 flex-shrink-0',
                              priorityConfig.color
                            )}
                          />
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-xs text-neutral-600 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Checklist Progress */}
                        {task.checklist && task.checklist.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-600">Checklist</span>
                              <span className="font-semibold">
                                {task.checklist.filter((i) => i.completed).length}/
                                {task.checklist.length}
                              </span>
                            </div>
                            <Progress value={checklistProgress} className="h-1" />
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          {/* Due Date */}
                          {task.due_date && (
                            <div className="flex items-center gap-1 text-xs text-neutral-600">
                              <Calendar className="h-3 w-3" />
                              {formatDate(task.due_date)}
                            </div>
                          )}

                          {/* Assigned User */}
                          {task.assigned_user && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary text-white text-xs">
                                {task.assigned_user.first_name.charAt(0)}
                                {task.assigned_user.last_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}