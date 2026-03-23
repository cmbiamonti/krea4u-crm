import { supabase } from '@/lib/supabase'
import { Project, Task, TaskPriority } from '@/types/project'
import { addDays, format } from 'date-fns'

// Definisci TASK_TEMPLATES localmente
const TASK_TEMPLATES = {
  exhibition: [
    { title: 'Ricerca location', phase: 'Pianificazione', priority: 'high', daysFromStart: 0 },
    { title: 'Contatta artisti', phase: 'Pianificazione', priority: 'high', daysFromStart: 7 },
    { title: 'Budget planning', phase: 'Pianificazione', priority: 'medium', daysFromStart: 14 },
    { title: 'Installazione opere', phase: 'Esecuzione', priority: 'high', daysFromStart: 60 },
    { title: 'Opening event', phase: 'Esecuzione', priority: 'high', daysFromStart: 90 },
  ],
  residency: [
    { title: 'Selezione artisti', phase: 'Pianificazione', priority: 'high', daysFromStart: 0 },
    { title: 'Preparazione spazi', phase: 'Pianificazione', priority: 'medium', daysFromStart: 30 },
    { title: 'Accoglienza artisti', phase: 'Esecuzione', priority: 'high', daysFromStart: 60 },
    { title: 'Open studio', phase: 'Esecuzione', priority: 'medium', daysFromStart: 120 },
  ],
  workshop: [
    { title: 'Definizione programma', phase: 'Pianificazione', priority: 'high', daysFromStart: 0 },
    { title: 'Promozione', phase: 'Pianificazione', priority: 'medium', daysFromStart: 14 },
    { title: 'Iscrizioni', phase: 'Pianificazione', priority: 'medium', daysFromStart: 30 },
    { title: 'Svolgimento workshop', phase: 'Esecuzione', priority: 'high', daysFromStart: 60 },
  ],
  basic: [
    { title: 'Pianificazione iniziale', phase: 'Pianificazione', priority: 'high', daysFromStart: 0 },
    { title: 'Ricerca e sviluppo', phase: 'Pianificazione', priority: 'medium', daysFromStart: 7 },
    { title: 'Esecuzione', phase: 'Esecuzione', priority: 'high', daysFromStart: 30 },
    { title: 'Revisione finale', phase: 'Chiusura', priority: 'medium', daysFromStart: 60 },
  ],
}

interface TaskWithOrder extends Task {
  order_index?: number
}

export const calculateProjectProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  return Math.round((completedTasks / tasks.length) * 100)
}

export const getProjectStatus = (project: Project): string => {
  const now = new Date()
  const startDate = project.start_date ? new Date(project.start_date) : null
  const endDate = project.end_date ? new Date(project.end_date) : null

  if (project.status === 'completed' || project.status === 'archived') {
    return project.status
  }

  if (startDate && endDate) {
    if (now < startDate) {
      return 'planning'
    } else if (now >= startDate && now <= endDate) {
      return 'active'
    } else if (now > endDate) {
      return 'overdue'
    }
  }

  return project.status
}

export const generateTasksFromTemplate = (
  projectType: string,
  startDate: Date,
  projectId: string
): Partial<TaskWithOrder>[] => {
  const templateKey = projectType as keyof typeof TASK_TEMPLATES
  const template = TASK_TEMPLATES[templateKey] || TASK_TEMPLATES.basic

  return template.map((taskTemplate: any, index: number) => ({
    project_id: projectId,
    title: taskTemplate.title,
    description: `${taskTemplate.phase} phase task`,
    status: 'todo' as const,
    priority: taskTemplate.priority as TaskPriority,
    due_date: format(addDays(startDate, taskTemplate.daysFromStart), 'yyyy-MM-dd'),
    order_index: index,
  }))
}

export const uploadProjectFile = async (
  projectId: string,
  file: File,
  folder: string,
  userId: string
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${projectId}/${folder}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from('project-files').getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    return null
  }
}

export const exportProjectToPDF = (project: Project) => {
  // Placeholder for PDF export
  console.log('Exporting project to PDF:', project)
  // In production, use library like jsPDF or pdfmake
}

export const getBudgetVariance = (planned: number, actual: number): {
  amount: number
  percentage: number
  isOver: boolean
} => {
  const variance = actual - planned
  const percentage = planned > 0 ? (variance / planned) * 100 : 0

  return {
    amount: Math.abs(variance),
    percentage: Math.abs(percentage),
    isOver: variance > 0,
  }
}

export const getTimelineData = (projects: Project[]) => {
  return projects
    .filter((p) => p.start_date && p.end_date)
    .map((project) => ({
      id: project.id,
      name: project.project_name,
      start: new Date(project.start_date!),
      end: new Date(project.end_date!),
      status: project.status,
      progress: project.progress || 0,
    }))
}

export const sortTasksByPriority = (tasks: TaskWithOrder[]): TaskWithOrder[] => {
  const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }
  
  return [...tasks].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    // Se order_index non è definito, usa 0 come default
    const orderA = a.order_index ?? 0
    const orderB = b.order_index ?? 0
    return orderA - orderB
  })
}

// Esporta TASK_TEMPLATES se necessario
export { TASK_TEMPLATES }