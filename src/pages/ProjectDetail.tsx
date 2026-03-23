// src/pages/ProjectDetail.tsx - VERSIONE COMPLETA CON ParticipantSelector

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useLoadData } from '@/hooks/useLoadData'
import { logger } from '@/lib/logger'
import { Task, TaskPriority, TaskStatus, ProjectDocument } from '@/types/project'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { mapTasks } from '@/utils/typeMappers'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Upload,
  FileText,
  UserPlus,
  Mail,
  Phone,
  Instagram,
  Download,
  ExternalLink,
  MessageCircle,
  Facebook,
  Calculator,
  MessageSquare
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ParticipantSelector } from '@/components/projects/ParticipantSelector'
import { useSearchParams } from 'react-router-dom'

type ProjectStatus = 'planning' | 'active' | 'completed' | 'archived' | 'cancelled'

const PROJECT_STATUS: Array<{ value: ProjectStatus; label: string; color: string }> = [
  { value: 'planning', label: 'In Planning', color: 'bg-blue-500' },
  { value: 'active', label: 'Attivo', color: 'bg-green-500' },
  { value: 'completed', label: 'Completato', color: 'bg-purple-500' },
  { value: 'archived', label: 'Archiviato', color: 'bg-gray-500' },
  { value: 'cancelled', label: 'Cancellato', color: 'bg-red-500' }
]

const TASK_PRIORITIES: Array<{ value: TaskPriority; label: string; color: string }> = [
  { value: 'low', label: 'Bassa', color: 'text-gray-500' },
  { value: 'medium', label: 'Media', color: 'text-yellow-500' },
  { value: 'high', label: 'Alta', color: 'text-red-500' }
]

interface ProjectParticipant {
  id: string
  participant_type: 'curator' | 'artist' | 'venue' | 'collaborator'
  participant_id: string
  display_name: string
  email: string | null
  phone: string | null
  instagram_handle: string | null
  whatsapp_number: string | null
  facebook_profile: string | null
  profile_photo_url: string | null
  role_in_project: string | null
  added_at: string
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [project, setProject] = useState<any | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [participants, setParticipants] = useState<ProjectParticipant[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [documentDescription, setDocumentDescription] = useState('')
  
  const [activeTab, setActiveTab] = useState('overview')

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: ''
  })

  // Gestione tab da URL params
  useEffect(() => {
    const tab = searchParams.get('tab')
    const taskId = searchParams.get('taskId')

    if (tab) {
      logger.log('📍 Setting active tab from URL:', tab)
      setActiveTab(tab)
    }

    if (taskId && tab === 'tasks') {
      setTimeout(() => {
        const taskElement = document.getElementById(`task-${taskId}`)
        if (taskElement) {
          taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          taskElement.classList.add('ring-2', 'ring-blue-500', 'animate-pulse')
          setTimeout(() => {
            taskElement.classList.remove('ring-2', 'ring-blue-500', 'animate-pulse')
          }, 3000)
        }
      }, 500)
    }
  }, [searchParams])

  const loadProjectData = async () => {
    if (!id || !user?.id) {
      logger.warn('⚠️ ProjectDetail: Missing id or user, redirecting')
      navigate('/app/projects')
      return
    }

    logger.log('🔄 ProjectDetail: Loading project:', id)

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          venue:venues(
            venue_name,
            city,
            address
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        logger.error('❌ ProjectDetail: Error loading project:', error)
        throw error
      }

      logger.log('✅ ProjectDetail: Project loaded:', data)
      setProject(data)

      await Promise.all([
        loadParticipants(),
        loadTasks(),
        loadDocuments()
      ])

      logger.log('✅ ProjectDetail: All data loaded')
    } catch (error: any) {
      logger.error('❌ ProjectDetail: Error loading project data:', error)
      throw error
    }
  }

  const loadParticipants = async () => {
    if (!id) {
      logger.warn('⚠️ loadParticipants: No project ID')
      return
    }

    setLoadingParticipants(true)
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.log('👥 LOADING PARTICIPANTS for project:', id)

    try {
      const { data: rawData, error, count } = await supabase
        .from('project_participants')
        .select('*', { count: 'exact' })
        .eq('project_id', id)
        .order('added_at', { ascending: false })

      logger.log('📊 Query result:', { 
        success: !error,
        count, 
        dataLength: rawData?.length,
        error: error?.message 
      })

      if (error) {
        logger.error('❌ Supabase error:', error)
        throw error
      }

      if (!rawData || rawData.length === 0) {
        logger.warn('⚠️ No participants found')
        setParticipants([])
        return
      }

      logger.log('✅ Raw data:', rawData)
      
      const validParticipants = rawData
        .filter((p: any) => {
          const hasName = p.display_name && 
                         p.display_name.trim() !== '' && 
                         p.display_name !== 'Nome non disponibile'
          
          if (!hasName) {
            logger.warn('⚠️ Invalid participant:', p)
          }
          
          return hasName
        })
        .map((p: any) => ({
          id: p.id,
          participant_type: p.participant_type,
          participant_id: p.participant_id,
          display_name: p.display_name,
          email: p.email,
          phone: p.phone,
          instagram_handle: p.instagram_handle,
          whatsapp_number: p.whatsapp_number,
          facebook_profile: p.facebook_profile,
          profile_photo_url: p.profile_photo_url,
          role_in_project: p.role_in_project,
          added_at: p.added_at
        }))

      logger.log(`✅ Valid participants: ${validParticipants.length}`)
      logger.log('📋 By type:', {
        curator: validParticipants.filter(p => p.participant_type === 'curator').length,
        artist: validParticipants.filter(p => p.participant_type === 'artist').length,
        venue: validParticipants.filter(p => p.participant_type === 'venue').length,
        collaborator: validParticipants.filter(p => p.participant_type === 'collaborator').length,
      })
      
      setParticipants(validParticipants as ProjectParticipant[])
      logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    } catch (error: any) {
      logger.error('❌ Error loading participants:', error)
      toast.error('Errore nel caricamento dei partecipanti')
      setParticipants([])
    } finally {
      setLoadingParticipants(false)
    }
  }

  const handleParticipantsAdded = async () => {
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.log('🎉 PARTICIPANTS ADDED - Refreshing...')
    
    try {
      setShowAddParticipantModal(false)
      await loadParticipants()
      
      if (activeTab !== 'team') {
        setActiveTab('team')
      }
      
      toast.success('Partecipanti aggiunti con successo!')
      logger.log('✅ Refresh completed')
      logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
    } catch (error: any) {
      logger.error('❌ Error refreshing participants:', error)
      toast.error('Errore nell\'aggiornamento della lista')
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questo membro dal team?')) return

    try {
      logger.log('🗑️ Removing participant:', participantId)

      const { error } = await supabase
        .from('project_participants')
        .delete()
        .eq('id', participantId)

      if (error) throw error

      setParticipants(prev => prev.filter(p => p.id !== participantId))
      toast.success('Membro rimosso dal team')
      
      await loadParticipants()
    } catch (error: any) {
      logger.error('❌ Error removing participant:', error)
      toast.error('Errore nella rimozione del membro')
    }
  }

  const { loading, error: loadError } = useLoadData(loadProjectData, {
    deps: [id, user?.id],
    enabled: !!id && !!user?.id,
    onError: (err) => {
      toast.error('Errore nel caricamento del progetto')
      logger.error('Load project error:', err)
    }
  })

  const loadTasks = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error

      logger.log('✅ ProjectDetail: Tasks loaded:', data?.length || 0)
      setTasks(mapTasks(data || []))
    } catch (error: any) {
      logger.error('❌ ProjectDetail: Error loading tasks:', error)
    }
  }

  const loadDocuments = async () => {
    if (!id) return

    setLoadingDocuments(true)
    logger.log('📄 ProjectDetail: Loading documents for project:', id)

    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('❌ ProjectDetail: Error loading documents:', error)
        throw error
      }

      logger.log('✅ ProjectDetail: Documents loaded:', data?.length || 0)
      setDocuments(data || [])
    } catch (error: any) {
      logger.error('❌ ProjectDetail: Error loading documents:', error)
      toast.error('Errore nel caricamento dei documenti')
      setDocuments([])
    } finally {
      setLoadingDocuments(false)
    }
  }

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project || !project.id) return

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus } as unknown as never)
        .eq('id', project.id)

      if (error) throw error

      setProject({ ...project, status: newStatus })
      toast.success('Status aggiornato con successo')
    } catch (error: any) {
      logger.error('❌ ProjectDetail: Error updating status:', error)
      toast.error("Errore nell'aggiornamento dello status")
    }
  }

  const handleCreateTask = async () => {
    if (!project || !project.id || !newTask.title?.trim() || !user) {
      toast.error('Il titolo del task è obbligatorio')
      return
    }

    try {
      if (editingTask && editingTask.id) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: newTask.title.trim(),
            description: newTask.description?.trim() || null,
            priority: newTask.priority || 'medium',
            status: newTask.status || 'todo',
            due_date: newTask.due_date || null,
          } as unknown as never)
          .eq('id', editingTask.id)

        if (error) throw error

        toast.success('Task aggiornato con successo')
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert({
            project_id: project.id,
            title: newTask.title.trim(),
            description: newTask.description?.trim() || null,
            priority: newTask.priority || 'medium',
            status: newTask.status || 'todo',
            due_date: newTask.due_date || null,
            assigned_to: null,
            created_by: user.id,
          } as unknown as never)

        if (error) throw error

        toast.success('Task creato con successo')
      }

      setIsTaskModalOpen(false)
      setEditingTask(null)
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        due_date: ''
      })
      
      await loadTasks()
    } catch (error: any) {
      logger.error('❌ ProjectDetail: Save task error:', error)
      toast.error(error.message || 'Errore nel salvataggio del task')
    }
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus } as unknown as never)
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
      toast.success('Status task aggiornato')
    } catch (error: any) {
      logger.error('❌ ProjectDetail: Error updating task status:', error)
      toast.error("Errore nell'aggiornamento")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo task?')) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.filter(t => t.id !== taskId))
      toast.success('Task eliminato')
    } catch (error: any) {
      logger.error('❌ ProjectDetail: Error deleting task:', error)
      toast.error("Errore nell'eliminazione del task")
    }
  }

  const handleDeleteProject = async () => {
    if (!project || !project.id) return
    
    if (!confirm('Sei sicuro di voler eliminare questo progetto? Questa azione è irreversibile.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)

      if (error) throw error

      toast.success('Progetto eliminato con successo')
      navigate('/app/projects')
    } catch (error: any) {
      logger.error('❌ ProjectDetail: Error deleting project:', error)
      toast.error("Errore nell'eliminazione del progetto")
    }
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0 || !project || !user) return

    setUploadingDocument(true)

    try {
      for (const file of files) {
        const maxSize = 50 * 1024 * 1024
        if (file.size > maxSize) {
          toast.error(`${file.name} supera i 50MB`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${user.id}/${project.id}/${fileName}`

        logger.log('📤 Uploading document:', filePath)

        const { error: uploadError } = await supabase.storage
          .from('project-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          logger.error('❌ Upload error:', uploadError)
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('project-documents')
          .getPublicUrl(filePath)

        const documentData: any = {
          project_id: project.id,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          description: documentDescription || null,
          uploaded_by: user.id,
        }

        logger.log('💾 Saving document to DB:', documentData)

        const { error: dbError } = await supabase
          .from('project_documents')
          .insert(documentData)

        if (dbError) {
          logger.error('❌ DB insert error:', dbError)
          throw dbError
        }

        logger.log('✅ Document uploaded successfully')
      }

      toast.success(`${files.length} documento/i caricato/i con successo`)
      setDocumentDescription('')
      setIsDocumentModalOpen(false)
      await loadDocuments()
    } catch (error: any) {
      logger.error('❌ ProjectDetail: Error uploading document:', error)
      toast.error(error.message || 'Errore nel caricamento del documento')
    } finally {
      setUploadingDocument(false)
    }
  }

  const handleDeleteDocument = async (documentId: string, fileUrl: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) return

    try {
      logger.log('🗑️ Deleting document:', documentId)

      const { error: dbError } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', documentId)

      if (dbError) throw dbError

      const filePath = fileUrl.split('/app').slice(-3).join('/app')
      logger.log('🗑️ Deleting file from storage:', filePath)

      await supabase.storage
        .from('project-documents')
        .remove([filePath])

      toast.success('Documento eliminato')
      await loadDocuments()
    } catch (error: any) {
      logger.error('❌ ProjectDetail: Error deleting document:', error)
      toast.error('Errore nell\'eliminazione del documento')
    }
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'N/D'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleOpenDocument = (doc: ProjectDocument) => {
    const url      = doc.file_url
    const fileType = doc.file_type || ''
    const fileName = doc.file_name || ''

    // ── PDF → apri direttamente nel browser ───────────────────────────────────
    if (fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      // Supabase Storage: aggiunge ?download=false per forzare visualizzazione inline
      const viewUrl = url.includes('?')
        ? `${url}&download=false`
        : `${url}?download=false`
      window.open(viewUrl, '_blank', 'noopener,noreferrer')
      return
    }

    // ── Immagini → apri direttamente ──────────────────────────────────────────
    if (fileType.startsWith('image/')) {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    // ── File Office (Word, Excel, PowerPoint) → Google Docs Viewer ───────────
    // Google Docs Viewer supporta: .docx .xlsx .pptx .doc .xls .ppt
    const officeTypes = [
      'application/vnd.openxmlformats-officedocument',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
      'application/vnd.oasis',
    ]
    const officeExtensions = ['.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.odt', '.ods']
    const lowerName = fileName.toLowerCase()

    const isOffice =
      officeTypes.some(t => fileType.includes(t)) ||
      officeExtensions.some(ext => lowerName.endsWith(ext))

    if (isOffice) {
      // Google Docs Viewer — apre il documento senza scaricarlo
      const encodedUrl = encodeURIComponent(url)
      const viewerUrl  = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=false`
      window.open(viewerUrl, '_blank', 'noopener,noreferrer')
      return
    }

    // ── Testo, CSV, HTML → apri direttamente ─────────────────────────────────
    if (
      fileType.startsWith('text/') ||
      fileType.includes('json') ||
      fileType.includes('csv')
    ) {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    // ── Fallback → prova ad aprire, se non funziona scarica ──────────────────
    window.open(url, '_blank', 'noopener,noreferrer')
}

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-8 w-8 text-gray-400" />
    
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-8 w-8 text-blue-500" />
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FileText className="h-8 w-8 text-green-500" />
    if (fileType.includes('image')) return <FileText className="h-8 w-8 text-purple-500" />
    
    return <FileText className="h-8 w-8 text-gray-400" />
  }

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task)
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      due_date: task.due_date || ''
    })
    setIsTaskModalOpen(true)
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(t => t.status === status)
  }

  const calculateProgress = () => {
    if (tasks.length === 0) return 0
    const completedTasks = tasks.filter(t => t.status === 'done').length
    return Math.round((completedTasks / tasks.length) * 100)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento progetto...</p>
          </div>
        </div>
      </div>
    )
  }

  if (loadError || !project) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 text-center border-red-200 bg-red-50">
          <p className="text-red-600 mb-4">
            {loadError ? 'Errore nel caricamento del progetto' : 'Progetto non trovato'}
          </p>
          <Button onClick={() => ('/app/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai progetti
          </Button>
        </Card>
      </div>
    )
  }

  const participantsByType = {
    curator: participants.filter(p => p.participant_type === 'curator'),
    artist: participants.filter(p => p.participant_type === 'artist'),
    venue: participants.filter(p => p.participant_type === 'venue'),
    collaborator: participants.filter(p => p.participant_type === 'collaborator'),
  }

  const typeLabels: Record<string, string> = {
    curator: 'Curatori',
    artist: 'Artisti',
    venue: 'Venue',
    collaborator: 'Collaboratori',
  }

  const typeColors: Record<string, string> = {
    curator: 'bg-purple-100 text-purple-700',
    artist: 'bg-blue-100 text-blue-700',
    venue: 'bg-green-100 text-green-700',
    collaborator: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/app/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.project_name}</h1>
            <p className="text-gray-500">{project.project_type}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/app/messages`)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Messaggistica
          </Button>

          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
            className="flex h-10 items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            {PROJECT_STATUS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={() => navigate(`/app/projects/${project.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifica
          </Button>
          <Button variant="destructive" onClick={handleDeleteProject}>
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina
          </Button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Data Inizio</p>
              <p className="font-semibold">{project.start_date ? formatDate(project.start_date) : 'N/D'}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Data Fine</p>
              <p className="font-semibold">{project.end_date ? formatDate(project.end_date) : 'N/D'}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Venue</p>
              <p className="font-semibold">{project.venue?.venue_name || 'TBD'}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Partecipanti</p>
              <p className="font-semibold">{participants.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="team">Team ({participants.length})</TabsTrigger>
          <TabsTrigger value="documents">Documenti ({documents.length})</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        {/* TAB OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Comunicazioni Progetto
              </h3>
              <Button 
                variant="outline"
                onClick={() => navigate(`/app/messages`)}
                className="text-blue-600 hover:text-blue-700"
              >
                Apri Messaggistica
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Canali Disponibili</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    📧 Email
                  </Badge>
                  
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Partecipanti Attivi</p>
                <p className="text-2xl font-bold text-green-600">
                  {participants.length}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Invia messaggi ai membri del team tramite Email (SendGrid).
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Descrizione</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {project.description || 'Nessuna descrizione disponibile'}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Budget</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Budget Pianificato</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(project.budget_planned || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget Attuale</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(project.budget_actual || 0)}
                </p>
              </div>
            </div>
            {project.budget_planned && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Utilizzo Budget</span>
                  <span>
                    {Math.round(((project.budget_actual || 0) / project.budget_planned) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(((project.budget_actual || 0) / project.budget_planned) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Progresso Tasks</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completamento</span>
                <span className="font-semibold">{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-500">To Do</p>
                  <p className="font-bold text-lg">{getTasksByStatus('todo').length}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">In Progress</p>
                  <p className="font-bold text-lg">{getTasksByStatus('in_progress').length}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Done</p>
                  <p className="font-bold text-lg">{getTasksByStatus('done').length}</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB TASKS */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestione Tasks</h3>
            <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingTask(null)
                  setNewTask({
                    title: '',
                    description: '',
                    priority: 'medium',
                    status: 'todo',
                    due_date: ''
                  })
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingTask ? 'Modifica Task' : 'Nuovo Task'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  handleCreateTask()
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="task-title">Titolo *</Label>
                      <Input
                        id="task-title"
                        value={newTask.title || ''}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Titolo del task"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-description">Descrizione</Label>
                      <Textarea
                        id="task-description"
                        value={newTask.description || ''}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Descrizione dettagliata"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-priority">Priorità</Label>
                      <select
                        id="task-priority"
                        value={newTask.priority || 'medium'}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                      >
                        {TASK_PRIORITIES.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="task-status">Status</Label>
                      <select
                        id="task-status"
                        value={newTask.status || 'todo'}
                        onChange={(e) => setNewTask({ ...newTask, status: e.target.value as TaskStatus })}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="task-due-date">Scadenza</Label>
                      <Input
                        id="task-due-date"
                        type="date"
                        value={newTask.due_date || ''}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      />
                    </div>
                                    
                    <div className="flex gap-2 justify-end pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsTaskModalOpen(false)
                          setEditingTask(null)
                        }}
                      >
                        Annulla
                      </Button>
                      <Button 
                        type="submit"
                        disabled={!newTask.title?.trim()}
                      >
                        {editingTask ? 'Aggiorna' : 'Crea'}
                      </Button>
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-3 gap-4">
            {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((status) => {
              const statusTasks = getTasksByStatus(status)
              const statusLabels = {
                todo: 'To Do',
                in_progress: 'In Progress',
                done: 'Done'
              }
              
              return (
                <Card key={status} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{statusLabels[status]}</h4>
                    <Badge variant="secondary">{statusTasks.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {statusTasks.map((task) => {
                      const priority = TASK_PRIORITIES.find(p => p.value === task.priority)
                      
                      return (
                        <Card key={task.id} id={`task-${task.id}`} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-sm">{task.title}</h5>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditTaskModal(task)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-medium ${priority?.color}`}>
                              {priority?.label}
                            </span>
                            {task.due_date && (
                              <span className="text-gray-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(task.due_date)}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex gap-1">
                            {status !== 'todo' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => handleTaskStatusChange(task.id, 'todo')}
                              >
                                To Do
                              </Button>
                            )}
                            {status !== 'in_progress' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                              >
                                In Progress
                              </Button>
                            )}
                            {status !== 'done' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => handleTaskStatusChange(task.id, 'done')}
                              >
                                Done
                              </Button>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                    {statusTasks.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        Nessun task
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* TAB TEAM - CON ParticipantSelector */}
        <TabsContent value="team">
          <div className="space-y-6">
            {/* Header con pulsante Aggiungi */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Team del Progetto
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {loadingParticipants ? 'Caricamento...' : `${participants.length} membri totali`}
                </p>
              </div>
              <Button 
                onClick={() => {
                  logger.log('🔘 Opening Add Participant Modal')
                  setShowAddParticipantModal(true)
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Aggiungi Membri
              </Button>
            </div>

            {/* Lista Partecipanti Attuali */}
            {loadingParticipants ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Caricamento team...</p>
                </div>
              </div>
            ) : participants.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">Nessun membro nel team</p>
                <Button onClick={() => setShowAddParticipantModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Aggiungi Primi Membri
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(participantsByType).map(([type, members]) => {
                  if (members.length === 0) return null

                  return (
                    <Card key={type} className="p-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                        {typeLabels[type]} ({members.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {members.map(participant => (
                          <Card key={participant.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                              {/* Avatar */}
                              {participant.profile_photo_url ? (
                                <img
                                  src={participant.profile_photo_url}
                                  alt={participant.display_name}
                                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                  }}
                                />
                              ) : null}
                              <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow ${participant.profile_photo_url ? 'hidden' : ''}`}>
                                {participant.display_name.charAt(0).toUpperCase()}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 truncate">
                                      {participant.display_name}
                                    </h4>
                                    <Badge className={`text-xs mt-1 ${typeColors[type]}`}>
                                      {typeLabels[type].slice(0, -1)}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveParticipant(participant.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                {participant.role_in_project && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {participant.role_in_project}
                                  </p>
                                )}

                                {/* Contatti */}
                                <div className="flex flex-wrap gap-3 mt-3">
                                  {participant.email && (
                                    <a
                                      href={`mailto:${participant.email}`}
                                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600"
                                      title="Email"
                                    >
                                      <Mail className="h-3 w-3" />
                                      <span className="truncate max-w-[150px]">{participant.email}</span>
                                    </a>
                                  )}
                                  {participant.phone && (
                                    <a
                                      href={`tel:${participant.phone}`}
                                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600"
                                      title="Telefono"
                                    >
                                      <Phone className="h-3 w-3" />
                                      <span>{participant.phone}</span>
                                    </a>
                                  )}
                                  {participant.whatsapp_number && (
                                    <a
                                      href={`https://wa.me/${participant.whatsapp_number.replace(/[^0-9]/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-green-600"
                                      title="WhatsApp"
                                    >
                                      <MessageCircle className="h-3 w-3" />
                                      <span>{participant.whatsapp_number}</span>
                                    </a>
                                  )}
                                  {participant.instagram_handle && (
                                    <a
                                      href={`https://instagram.com/${participant.instagram_handle.replace('@', '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-pink-600"
                                      title="Instagram"
                                    >
                                      <Instagram className="h-3 w-3" />
                                      <span>{participant.instagram_handle}</span>
                                    </a>
                                  )}
                                  {participant.facebook_profile && (
                                    <a
                                      href={participant.facebook_profile}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-700"
                                      title="Facebook"
                                    >
                                      <Facebook className="h-3 w-3" />
                                      <span>Facebook</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* MODAL CON ParticipantSelector */}
          <Dialog open={showAddParticipantModal} onOpenChange={setShowAddParticipantModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Aggiungi Membri al Team
                </DialogTitle>
              </DialogHeader>
              
              {/* ParticipantSelector Component */}
              {id && (
                <ParticipantSelector
                  projectId={id}
                  onParticipantsAdded={handleParticipantsAdded}
                />
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB DOCUMENTS */}
        <TabsContent value="documents">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Documenti del Progetto
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {loadingDocuments ? 'Caricamento...' : `${documents.length} documenti totali`}
                </p>
              </div>
              <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Carica Documento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Carica Nuovo Documento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="document-description">Descrizione (opzionale)</Label>
                      <Textarea
                        id="document-description"
                        value={documentDescription}
                        onChange={(e) => setDocumentDescription(e.target.value)}
                        placeholder="Descrivi il documento..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="document-file">File (max 50MB)</Label>
                      <Input
                        id="document-file"
                        type="file"
                        onChange={handleDocumentUpload}
                        multiple
                        disabled={uploadingDocument}
                      />
                    </div>
                    {uploadingDocument && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Caricamento in corso...</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loadingDocuments ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Caricamento documenti...</p>
                </div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Nessun documento caricato</p>
                <Button onClick={() => setIsDocumentModalOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Carica Primo Documento
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className="font-semibold text-sm truncate mb-1"
                          title={doc.file_name}
                        >
                          {doc.file_name}
                        </h4>

                        {doc.description && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {doc.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(doc.created_at)}</span>
                        </div>

                        <div className="flex gap-2">
                          {/* ✅ APRI — usa handleOpenDocument invece di window.open diretto */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleOpenDocument(doc)}
                            title={
                              doc.file_type?.includes('pdf')
                                ? 'Apri PDF nel browser'
                                : doc.file_type?.startsWith('image/')
                                ? 'Visualizza immagine'
                                : 'Apri con Google Docs Viewer'
                            }
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Apri
                          </Button>

                          {/* SCARICA — comportamento invariato */}
                          <Button
                            size="sm"
                            variant="outline"
                            title="Scarica file"
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href     = doc.file_url
                              link.download = doc.file_name
                              // ✅ forza download anche per PDF
                              link.setAttribute('download', doc.file_name)
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>

                          {/* ELIMINA — comportamento invariato */}
                          <Button
                            size="sm"
                            variant="outline"
                            title="Elimina documento"
                            onClick={() => handleDeleteDocument(doc.id, doc.file_url)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* TAB BUDGET */}
        <TabsContent value="budget">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Gestione Budget</h3>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/app/budget?tab=billing')}
                  className="bg-[#2B4C7E] hover:bg-[#1A2E4C]"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Budget
                </Button>

                <Button 
                  onClick={() => navigate(`/app/messages`)}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Messaggistica
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Budget Pianificato</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(project.budget_planned || 0)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Speso</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(project.budget_actual || 0)}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Rimanente</p>
                <p className="text-3xl font-bold">
                  {formatCurrency((project.budget_planned || 0) - (project.budget_actual || 0))}
                </p>
              </div>

              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">
                  Visualizza dettagli del Budget creato per questo progetto
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Usa il Budget Creator per generare preventivi professionali
                </p>
                <Button 
                  onClick={() => navigate('/app/budget?tab=billing')}
                  className="bg-[#2B4C7E] hover:bg-[#1A2E4C]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Vai a Budget Creator
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}