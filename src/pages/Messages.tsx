// pages/Messages.tsx
// ✅ Archive → archived_at timestamp su Supabase
// ✅ Delete  → deleted_at  timestamp su Supabase (soft delete)
// ✅ Rimozione immediata dallo state locale dopo azione
// ✅ Sidebar con contatori archiviati e cestino
// ✅ Folder switching (inbox/sent/archived/trash)

import { useState, useEffect, useRef } from 'react'
import {
  Mail,
  Send,
  Inbox,
  Archive,
  Trash2,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Reply,
  MoreVertical,
  RotateCcw,
} from 'lucide-react'
import { EmailService } from '@/services/email.service'
import type { EmailThread } from '@/types/email.types'
import { EmailComposer } from '@/components/email/EmailComposer'
import { useAuth } from '@/contexts/AuthContext'

type ViewMode = 'inbox' | 'sent' | 'archived' | 'trash' | 'compose' | 'thread'
type Folder   = 'inbox' | 'archived' | 'trash' | 'all'

// ── Dropdown Menu ─────────────────────────────────────────────────────────────
interface ThreadActionsMenuProps {
  onArchive:  () => void
  onDelete:   () => void
  onRestore?: () => void
  onClose:    () => void
  folder:     Folder
}

function ThreadActionsMenu({
  onArchive, onDelete, onRestore, onClose, folder
}: ThreadActionsMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 z-50 w-48 bg-white rounded-lg shadow-lg
                 border border-gray-200 py-1"
    >
      {/* Ripristina — visibile solo in archived o trash */}
      {(folder === 'archived' || folder === 'trash') && onRestore && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onRestore() }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-indigo-600
                       hover:bg-indigo-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Ripristina in Inbox
          </button>
          <div className="my-1 border-t border-gray-100" />
        </>
      )}

      {/* Archivia — visibile solo in inbox */}
      {folder === 'inbox' && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onArchive() }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700
                       hover:bg-gray-50 transition-colors"
          >
            <Archive className="w-4 h-4 text-gray-500" />
            Archivia
          </button>
          <div className="my-1 border-t border-gray-100" />
        </>
      )}

      {/* Elimina — sempre visibile */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600
                   hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        {folder === 'trash' ? 'Elimina definitivamente' : 'Elimina'}
      </button>
    </div>
  )
}

// ── Dialog di conferma ────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open:      boolean
  title:     string
  message:   string
  onConfirm: () => void
  onCancel:  () => void
  danger?:   boolean
}

function ConfirmDialog({
  open, title, message, onConfirm, onCancel, danger = false
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6 whitespace-pre-line">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white
                       border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principale ─────────────────────────────────────────────────────
export default function Messages() {
  const { user } = useAuth()

  const [viewMode, setViewMode]             = useState<ViewMode>('inbox')
  const [currentFolder, setCurrentFolder]   = useState<Folder>('inbox')
  const [threads, setThreads]               = useState<EmailThread[]>([])
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null)
  const [loading, setLoading]               = useState(true)
  const [searchQuery, setSearchQuery]       = useState('')
  const [showFilters, setShowFilters]       = useState(false)
  const [menuOpen, setMenuOpen]             = useState(false)
  const [archiveDialog, setArchiveDialog]   = useState(false)
  const [deleteDialog, setDeleteDialog]     = useState(false)
  const [restoreDialog, setRestoreDialog]   = useState(false)
  const [actionLoading, setActionLoading]   = useState(false)
  const [toast, setToast]                   = useState<{
    message: string; type: 'success' | 'error'
  } | null>(null)
  const [stats, setStats] = useState({
    total: 0, unread: 0, sent: 0, archived: 0, trash: 0
  })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Caricamento threads per folder ───────────────────────────────────────
  const loadThreads = async (folder: Folder = currentFolder) => {
    try {
      setLoading(true)
      const data = await EmailService.getThreads(50, folder)
      setThreads(data)
    } catch (error) {
      console.error('❌ Error fetching threads:', error)
      setThreads([])
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await EmailService.getStats()
      setStats({
        total:    data.total,
        unread:   data.unread,
        sent:     data.sent,
        archived: data.archived,
        trash:    data.trash,
      })
    } catch (error) {
      console.error('❌ Error loading stats:', error)
    }
  }

  useEffect(() => {
    loadThreads('inbox')
    loadStats()
  }, [])

  // ── Cambio folder dalla sidebar ──────────────────────────────────────────
  const handleFolderChange = (folder: Folder, mode: ViewMode) => {
    setCurrentFolder(folder)
    setViewMode(mode)
    setSelectedThread(null)
    setMenuOpen(false)
    loadThreads(folder)
  }

  const handleThreadClick = async (thread: EmailThread) => {
    setSelectedThread(thread)
    setViewMode('thread')
    setMenuOpen(false)

    const lastMessage = thread.messages[thread.messages.length - 1]
    if (lastMessage && !lastMessage.read_at) {
      try {
        await EmailService.markAsRead(lastMessage.id)
        loadStats()
      } catch (error) {
        console.error('Error marking as read:', error)
      }
    }
  }

  const handleCompose = () => {
    setSelectedThread(null)
    setViewMode('compose')
  }

  const handleSendSuccess = async () => {
    setViewMode('inbox')
    setCurrentFolder('inbox')
    await loadThreads('inbox')
    await loadStats()
  }

  const handleBack = () => {
    setSelectedThread(null)
    setViewMode(currentFolder === 'inbox' ? 'inbox' : currentFolder as ViewMode)
    setMenuOpen(false)
  }

  // ── Rimuovi thread dallo state e torna alla lista ─────────────────────────
  const removeThreadFromState = (threadId: string) => {
    setThreads(prev => prev.filter(t => t.thread_id !== threadId))
    setSelectedThread(null)
    setViewMode(currentFolder === 'inbox' ? 'inbox' : currentFolder as ViewMode)
  }

  // ── ARCHIVIA — imposta archived_at su Supabase ───────────────────────────
  const handleArchiveConfirm = async () => {
    if (!selectedThread) return
    setActionLoading(true)

    try {
      const now = new Date().toISOString()
      console.log(`📦 Archiving thread ${selectedThread.thread_id} at ${now}`)

      await Promise.all(
        selectedThread.messages.map(msg => EmailService.archiveEmail(msg.id))
      )

      // ✅ Rimuovi immediatamente dalla lista
      removeThreadFromState(selectedThread.thread_id)

      showToast('Thread archiviato ✓ — visibile in "Archiviate"')
      setArchiveDialog(false)

      // Aggiorna stats in background
      loadStats()

    } catch (error: any) {
      console.error('❌ Archive error:', error)
      showToast(`Errore archiviazione: ${error.message}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // ── ELIMINA — imposta deleted_at su Supabase (soft delete) ───────────────
  const handleDeleteConfirm = async () => {
    if (!selectedThread) return
    setActionLoading(true)

    const isPermanent = currentFolder === 'trash'

    try {
      const now = new Date().toISOString()
      console.log(
        `🗑️ ${isPermanent ? 'Hard' : 'Soft'} deleting thread`,
        selectedThread.thread_id,
        'at', now
      )

      if (isPermanent) {
        // Dal cestino → eliminazione definitiva (hard delete)
        await Promise.all(
          selectedThread.messages.map(msg =>
            EmailService.deleteEmailPermanently(msg.id)
          )
        )
        showToast('Thread eliminato definitivamente ✓')
      } else {
        // Da inbox/archivio → soft delete (imposta deleted_at)
        await Promise.all(
          selectedThread.messages.map(msg => EmailService.deleteEmail(msg.id))
        )
        showToast('Thread spostato nel Cestino ✓ — visibile in "Cestino"')
      }

      // ✅ Rimuovi immediatamente dalla lista
      removeThreadFromState(selectedThread.thread_id)
      setDeleteDialog(false)

      // Aggiorna stats in background
      loadStats()

    } catch (error: any) {
      console.error('❌ Delete error:', error)
      showToast(`Errore eliminazione: ${error.message}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // ── RIPRISTINA — azzera deleted_at e archived_at ─────────────────────────
  const handleRestoreConfirm = async () => {
    if (!selectedThread) return
    setActionLoading(true)

    try {
      console.log(`♻️ Restoring thread ${selectedThread.thread_id}`)

      await Promise.all(
        selectedThread.messages.map(msg => EmailService.restoreEmail(msg.id))
      )

      // ✅ Rimuovi dalla lista corrente (archived/trash)
      removeThreadFromState(selectedThread.thread_id)

      showToast('Thread ripristinato in Inbox ✓')
      setRestoreDialog(false)

      loadStats()

    } catch (error: any) {
      console.error('❌ Restore error:', error)
      showToast(`Errore ripristino: ${error.message}`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredThreads = threads.filter(thread => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      thread.subject.toLowerCase().includes(query) ||
      thread.participants.some(p => p.toLowerCase().includes(query))
    )
  })

  // ── Titolo folder corrente ────────────────────────────────────────────────
  const folderTitle: Record<Folder, string> = {
    inbox:    'Inbox',
    archived: 'Archiviate',
    trash:    'Cestino',
    all:      'Tutti i messaggi',
  }

  // ── Render Composer ───────────────────────────────────────────────────────
  if (viewMode === 'compose') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setViewMode('inbox')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Torna alla inbox</span>
            </button>
          </div>
          <EmailComposer
            onSendSuccess={handleSendSuccess}
            onCancel={() => setViewMode('inbox')}
            replyTo={selectedThread?.messages[selectedThread.messages.length - 1]}
          />
        </div>
      </div>
    )
  }

  // ── Render Thread View ────────────────────────────────────────────────────
  if (viewMode === 'thread' && selectedThread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Torna a {folderTitle[currentFolder]}</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Rispondi — solo in inbox */}
              {currentFolder === 'inbox' && (
                <button
                  onClick={() => setViewMode('compose')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                             text-gray-700 bg-white border border-gray-300 rounded-lg
                             hover:bg-gray-50"
                >
                  <Reply className="w-4 h-4" />
                  <span>Rispondi</span>
                </button>
              )}

              {/* Menu tre puntini */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  className={`p-2 rounded-lg border transition-colors ${
                    menuOpen
                      ? 'bg-gray-100 border-gray-300 text-gray-700'
                      : 'text-gray-400 hover:text-gray-600 border-transparent hover:border-gray-300'
                  }`}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {menuOpen && (
                  <ThreadActionsMenu
                    folder={currentFolder}
                    onArchive={() => { setMenuOpen(false); setArchiveDialog(true) }}
                    onDelete={() => { setMenuOpen(false); setDeleteDialog(true) }}
                    onRestore={() => { setMenuOpen(false); setRestoreDialog(true) }}
                    onClose={() => setMenuOpen(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Thread Messages */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {selectedThread.subject}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{selectedThread.participants.join(', ')}</span>
                <span>•</span>
                <span>{selectedThread.message_count} messaggi</span>
                {/* Badge folder */}
                {currentFolder !== 'inbox' && (
                  <>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      currentFolder === 'archived'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {folderTitle[currentFolder]}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {selectedThread.messages.map((message) => (
                <div key={message.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-100
                                      flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">
                          {message.sender_name?.charAt(0) ||
                           message.sender_email?.charAt(0) || '?'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {message.sender_name || message.sender_email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {message.sender_email}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString('it-IT')}
                        </p>
                      </div>

                      <div className="mt-4 prose prose-sm max-w-none">
                        {message.body_html ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: message.body_html }}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap">{message.body_text}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick action bar */}
          <div className="mt-4 flex items-center justify-between p-4 bg-gray-50
                          rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">
              {selectedThread.message_count} messaggio
              {selectedThread.message_count !== 1 ? 'i' : ''} in questo thread
            </p>
            <div className="flex items-center gap-2">

              {/* Ripristina — solo in archived/trash */}
              {(currentFolder === 'archived' || currentFolder === 'trash') && (
                <button
                  onClick={() => setRestoreDialog(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm
                             text-indigo-600 bg-white border border-indigo-200
                             rounded-lg hover:bg-indigo-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Ripristina
                </button>
              )}

              {/* Archivia — solo in inbox */}
              {currentFolder === 'inbox' && (
                <button
                  onClick={() => setArchiveDialog(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600
                             bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Archive className="w-4 h-4" />
                  Archivia
                </button>
              )}

              {/* Elimina — sempre visibile */}
              <button
                onClick={() => setDeleteDialog(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600
                           bg-white border border-red-200 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                {currentFolder === 'trash' ? 'Elimina definitivamente' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Dialogs ── */}
        <ConfirmDialog
          open={archiveDialog}
          title="Archivia thread"
          message={`Vuoi archiviare "${selectedThread.subject}"?\nSarà spostato in "Archiviate" e potrai ripristinarlo in qualsiasi momento.`}
          onConfirm={handleArchiveConfirm}
          onCancel={() => setArchiveDialog(false)}
        />

        <ConfirmDialog
          open={deleteDialog}
          title={currentFolder === 'trash' ? 'Elimina definitivamente' : 'Sposta nel Cestino'}
          message={
            currentFolder === 'trash'
              ? `Eliminare definitivamente "${selectedThread.subject}"?\nQuesta azione non può essere annullata.`
              : `Spostare "${selectedThread.subject}" nel Cestino?\nPotrai ripristinarlo o eliminarlo definitivamente in seguito.`
          }
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialog(false)}
          danger
        />

        <ConfirmDialog
          open={restoreDialog}
          title="Ripristina thread"
          message={`Ripristinare "${selectedThread.subject}" nella Inbox?`}
          onConfirm={handleRestoreConfirm}
          onCancel={() => setRestoreDialog(false)}
        />

        {/* Loading overlay */}
        {actionLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl p-6 shadow-xl flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent
                              rounded-full animate-spin" />
              <span className="text-sm font-medium text-gray-700">
                Operazione in corso...
              </span>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg
                          text-sm font-medium text-white ${
                            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
            {toast.message}
          </div>
        )}
      </div>
    )
  }

  // ── Render Inbox/List View ────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messaggi</h1>
            <p className="mt-1 text-gray-600">
              {folderTitle[currentFolder]}
              {currentFolder === 'inbox' && stats.unread > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium
                                 bg-indigo-100 text-indigo-700 rounded-full">
                  {stats.unread} da leggere
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleCompose}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white
                       rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nuova Email</span>
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">

          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-1">
                {[
                  {
                    folder:  'inbox'    as Folder,
                    mode:    'inbox'    as ViewMode,
                    icon:    Inbox,
                    label:   'Ricevute',
                    count:   stats.unread > 0 ? stats.unread : null,
                    badge:   'unread',
                  },
                  {
                    folder:  'all'      as Folder,
                    mode:    'sent'     as ViewMode,
                    icon:    Send,
                    label:   'Inviate',
                    count:   stats.sent > 0 ? stats.sent : null,
                    badge:   'neutral',
                  },
                  {
                    folder:  'archived' as Folder,
                    mode:    'archived' as ViewMode,
                    icon:    Archive,
                    label:   'Archiviate',
                    count:   stats.archived > 0 ? stats.archived : null,
                    badge:   'neutral',
                  },
                  {
                    folder:  'trash'    as Folder,
                    mode:    'trash'    as ViewMode,
                    icon:    Trash2,
                    label:   'Cestino',
                    count:   stats.trash > 0 ? stats.trash : null,
                    badge:   'danger',
                  },
                ].map(({ folder, mode, icon: Icon, label, count, badge }) => (
                  <button
                    key={mode}
                    onClick={() => handleFolderChange(folder, mode)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                transition-colors ${
                      currentFolder === folder
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left text-sm">{label}</span>
                    {count !== null && count !== undefined && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        badge === 'unread' ? 'bg-indigo-100 text-indigo-700' :
                        badge === 'danger' ? 'bg-red-100   text-red-700'    :
                                             'bg-gray-100  text-gray-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase
                               tracking-wider mb-3">
                  Riepilogo
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inbox attivi</span>
                    <span className="font-medium text-gray-900">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Da leggere</span>
                    <span className="font-medium text-indigo-600">{stats.unread}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Archiviati</span>
                    <span className="font-medium text-blue-600">{stats.archived}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nel cestino</span>
                    <span className="font-medium text-red-500">{stats.trash}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">

              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2
                                       w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Cerca in ${folderTitle[currentFolder].toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300
                                 rounded-lg focus:outline-none focus:ring-2
                                 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 border rounded-lg transition-colors ${
                      showFilters
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                        : 'text-gray-400 hover:text-gray-600 border-gray-300'
                    }`}
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Thread List */}
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-indigo-600
                                    border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Caricamento...</p>
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div className="p-12 text-center">
                    <Mail className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">
                      {searchQuery
                        ? 'Nessun risultato trovato'
                        : `Nessun messaggio in ${folderTitle[currentFolder].toLowerCase()}`
                      }
                    </p>
                    {!searchQuery && currentFolder === 'inbox' && (
                      <button
                        onClick={handleCompose}
                        className="mt-4 text-indigo-600 hover:text-indigo-700
                                   font-medium text-sm"
                      >
                        Scrivi il primo messaggio →
                      </button>
                    )}
                  </div>
                ) : (
                  filteredThreads.map((thread) => {
                    const lastMessage = thread.messages[thread.messages.length - 1]
                    const isUnread    = lastMessage && !lastMessage.read_at

                    return (
                      <button
                        key={thread.thread_id}
                        onClick={() => handleThreadClick(thread)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center
                                             justify-center text-sm font-medium ${
                              currentFolder === 'trash'
                                ? 'bg-red-100 text-red-600'
                                : currentFolder === 'archived'
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-gray-200 text-gray-600'
                            }`}>
                              {lastMessage?.sender_name?.charAt(0) ||
                               lastMessage?.sender_email?.charAt(0) || '?'}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`text-sm truncate ${
                                isUnread
                                  ? 'font-semibold text-gray-900'
                                  : 'font-medium text-gray-600'
                              }`}>
                                {thread.participants.join(', ')}
                              </p>
                              <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                {new Date(thread.last_message_at)
                                  .toLocaleDateString('it-IT')}
                              </p>
                            </div>

                            <p className={`text-sm mb-1 truncate ${
                              isUnread
                                ? 'font-semibold text-gray-900'
                                : 'text-gray-600'
                            }`}>
                              {thread.subject}
                            </p>

                            <p className="text-xs text-gray-400 truncate">
                              {lastMessage?.body_text?.substring(0, 120)}...
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                              {isUnread && currentFolder === 'inbox' && (
                                <span className="inline-flex items-center px-2 py-0.5
                                                 rounded text-xs font-medium
                                                 bg-indigo-100 text-indigo-700">
                                  Nuovo
                                </span>
                              )}
                              {thread.message_count > 1 && (
                                <span className="text-xs text-gray-400">
                                  {thread.message_count} messaggi
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast globale */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg
                        text-sm font-medium text-white transition-all ${
                          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}