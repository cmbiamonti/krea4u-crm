// src/components/email/EmailComposer.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, Paperclip, Image, Smile } from 'lucide-react'
import { EmailService } from '@/services/email.service'
import type { EmailMessage, SendEmailRequest } from '@/types/email.types'
import { useAuth } from '@/contexts/AuthContext'

// ─────────────────────────────────────────────────────────────────────────────
// TIPI LOCALI
// ─────────────────────────────────────────────────────────────────────────────

interface Attachment {
  id:       string       // uuid locale per la key React
  file:     File
  name:     string
  size:     number
  type:     string
  preview?: string       // data-url per immagini
}

// ─────────────────────────────────────────────────────────────────────────────
// EMOJI — griglia nativa, zero dipendenze
// Suddivisa in categorie comuni
// ─────────────────────────────────────────────────────────────────────────────

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: 'Sorrisi',
    emojis: [
      '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃',
      '😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚',
      '😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭',
      '🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄',
      '😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕',
    ],
  },
  {
    label: 'Gesti',
    emojis: [
      '👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉',
      '👆','☝️','👇','✋','🤚','🖐️','🖖','👋','🤏','✍️',
      '💪','🦾','🖕','🙏','🤝','👏','🙌','🤲','💅','🫶',
    ],
  },
  {
    label: 'Oggetti',
    emojis: [
      '📧','📨','📩','📤','📥','📦','📫','📪','📬','📭',
      '📮','🗳️','✏️','✒️','🖊️','📝','📁','📂','🗂️','📋',
      '📌','📍','📎','🖇️','📏','📐','✂️','🗃️','🗄️','🗑️',
      '🔒','🔓','🔑','🗝️','🔨','⚙️','🔧','🔩','🖥️','💻',
    ],
  },
  {
    label: 'Simboli',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
      '❣️','💕','💞','💓','💗','💖','💘','💝','✅','❌',
      '❓','❗','⭐','🌟','💫','✨','🔥','⚡','💥','🎉',
      '🎊','🏆','🥇','🎯','💡','🔔','📢','⚠️','🚀','🌈',
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — formatta dimensione file
// ─────────────────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─────────────────────────────────────────────────────────────────────────────
// EMOJI PICKER — componente inline
// ─────────────────────────────────────────────────────────────────────────────

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose:  () => void
}

function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const ref                         = useRef<HTMLDivElement>(null)
  const [activeCategory, setActive] = useState(0)

  // Chiudi al click esterno
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute bottom-12 left-0 z-50 w-72 bg-white rounded-xl
                 shadow-2xl border border-gray-200 overflow-hidden"
    >
      {/* Tab categorie */}
      <div className="flex border-b border-gray-100 bg-gray-50">
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => setActive(idx)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeCategory === idx
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Griglia emoji */}
      <div className="p-2 h-52 overflow-y-auto">
        <div className="grid grid-cols-8 gap-0.5">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg
                         hover:bg-gray-100 rounded-lg transition-colors
                         select-none"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTACHMENT ITEM — singolo allegato nella lista
// ─────────────────────────────────────────────────────────────────────────────

interface AttachmentItemProps {
  attachment: Attachment
  onRemove:   (id: string) => void
  disabled:   boolean
}

function AttachmentItem({ attachment, onRemove, disabled }: AttachmentItemProps) {
  const isImage = attachment.type.startsWith('image/')

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border
                    border-blue-200 rounded-lg group">
      {/* Anteprima o icona */}
      {isImage && attachment.preview ? (
        <img
          src={attachment.preview}
          alt={attachment.name}
          className="w-8 h-8 object-cover rounded flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 bg-blue-100 rounded flex items-center
                        justify-center flex-shrink-0">
          <Paperclip className="w-3.5 h-3.5 text-blue-600" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-blue-800 truncate">
          {attachment.name}
        </p>
        <p className="text-xs text-blue-500">
          {formatFileSize(attachment.size)}
        </p>
      </div>

      {/* Rimuovi */}
      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        disabled={disabled}
        className="p-0.5 hover:bg-blue-200 rounded-full transition-colors
                   opacity-0 group-hover:opacity-100 flex-shrink-0"
        title="Rimuovi allegato"
      >
        <X className="w-3 h-3 text-blue-700" />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS EmailComposer
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailComposerProps {
  onCancel:        () => void
  onSendSuccess?:  () => void | Promise<void>
  replyTo?:        EmailMessage
  forwardMessage?: EmailMessage
  initialTo?:      string[]
  initialSubject?: string
  initialBody?:    string
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

export function EmailComposer({
  onCancel,
  onSendSuccess,
  replyTo,
  forwardMessage,
  initialTo      = [],
  initialSubject = '',
  initialBody    = '',
}: EmailComposerProps) {
  const { user, profile } = useAuth()

  // ── Form state ─────────────────────────────────────────────────────────────
  const [to,       setTo]       = useState<string[]>(initialTo)
  const [cc,       setCc]       = useState<string[]>([])
  const [bcc,      setBcc]      = useState<string[]>([])
  const [subject,  setSubject]  = useState(initialSubject)
  const [body,     setBody]     = useState(initialBody)
  const [showCc,   setShowCc]   = useState(false)
  const [showBcc,  setShowBcc]  = useState(false)
  const [sending,  setSending]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  // ── Allegati ───────────────────────────────────────────────────────────────
  const [attachments,    setAttachments]    = useState<Attachment[]>([])
  const fileInputRef                        = useRef<HTMLInputElement>(null)
  const imageInputRef                       = useRef<HTMLInputElement>(null)

  // ── Emoji ──────────────────────────────────────────────────────────────────
  const [showEmoji,      setShowEmoji]      = useState(false)

  // ── Ref textarea per inserire emoji alla posizione cursore ─────────────────
  const textareaRef                         = useRef<HTMLTextAreaElement>(null)
  const cursorPosRef                        = useRef<number>(0)

  // ─────────────────────────────────────────────────────────────────────────
  // Setup reply / forward
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!replyTo) return
    setTo([replyTo.sender_email])
    setSubject(
      replyTo.subject.startsWith('Re: ')
        ? replyTo.subject
        : `Re: ${replyTo.subject}`
    )
    const dateStr = new Date(replyTo.created_at).toLocaleString('it-IT')
    setBody(
      `\n\n---\nIl ${dateStr}, ${replyTo.sender_email} ha scritto:\n${replyTo.body_text}`
    )
  }, [replyTo])

  useEffect(() => {
    if (!forwardMessage) return
    setSubject(
      forwardMessage.subject.startsWith('Fwd: ')
        ? forwardMessage.subject
        : `Fwd: ${forwardMessage.subject}`
    )
    const dateStr = new Date(forwardMessage.created_at).toLocaleString('it-IT')
    setBody(
      `\n\n---\nMessaggio inoltrato:\nDa: ${forwardMessage.sender_email}\n` +
      `Data: ${dateStr}\nOggetto: ${forwardMessage.subject}\n\n${forwardMessage.body_text}`
    )
  }, [forwardMessage])

  // ─────────────────────────────────────────────────────────────────────────
  // Recipient helpers
  // ─────────────────────────────────────────────────────────────────────────

  const addRecipient = (type: 'to' | 'cc' | 'bcc', email: string) => {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) return
    const [current, setter] =
      type === 'to'  ? [to,  setTo]  :
      type === 'cc'  ? [cc,  setCc]  :
                       [bcc, setBcc]
    if (!current.includes(trimmed)) setter([...current, trimmed])
  }

  const removeRecipient = (type: 'to' | 'cc' | 'bcc', email: string) => {
    const [current, setter] =
      type === 'to'  ? [to,  setTo]  :
      type === 'cc'  ? [cc,  setCc]  :
                       [bcc, setBcc]
    setter(current.filter(e => e !== email))
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: 'to' | 'cc' | 'bcc'
  ) => {
    if (['Enter', ',', ' ', 'Tab'].includes(e.key)) {
      e.preventDefault()
      const target = e.currentTarget
      addRecipient(type, target.value)
      target.value = ''
    }
  }

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    type: 'to' | 'cc' | 'bcc'
  ) => {
    if (e.target.value.trim()) {
      addRecipient(type, e.target.value)
      e.target.value = ''
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ALLEGATI — gestione file generici
  // ─────────────────────────────────────────────────────────────────────────

  const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024   // 10 MB per file
  const MAX_TOTAL_SIZE      = 25 * 1024 * 1024   // 25 MB totale

  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newAttachments: Attachment[] = []

    for (const file of Array.from(files)) {
      // Controlla dimensione singolo file
      if (file.size > MAX_ATTACHMENT_SIZE) {
        setError(`"${file.name}" supera il limite di 10 MB`)
        continue
      }

      // Controlla dimensione totale
      const currentTotal = attachments.reduce((sum, a) => sum + a.size, 0)
      const newTotal     = newAttachments.reduce((sum, a) => sum + a.size, 0)
      if (currentTotal + newTotal + file.size > MAX_TOTAL_SIZE) {
        setError('Dimensione totale allegati supera 25 MB')
        break
      }

      // Genera preview per immagini
      let preview: string | undefined
      if (file.type.startsWith('image/')) {
        preview = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      }

      newAttachments.push({
        id:      crypto.randomUUID(),
        file,
        name:    file.name,
        size:    file.size,
        type:    file.type,
        preview,
      })
    }

    setAttachments(prev => [...prev, ...newAttachments])
  }, [attachments])

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  // ── Handler bottone Allega ─────────────────────────────────────────────────
  const handleAttachClick = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    // Reset input per permettere di ri-selezionare lo stesso file
    e.target.value = ''
  }

  // ─────────────────────────────────────────────────────────────────────────
  // IMMAGINI — inserisce nel corpo del messaggio come base64 inline
  // ─────────────────────────────────────────────────────────────────────────

  const handleImageClick = () => {
    setError(null)
    imageInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" supera il limite di 5 MB per immagini inline`)
        continue
      }

      // Leggi come data-url e inserisci nel testo alla posizione cursore
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload  = (ev) => resolve(ev.target?.result as string)
        reader.readAsDataURL(file)
      })

      // Inserisci riferimento testuale (il client di posta mostrerà l'allegato)
      // Per textarea plain-text inseriamo un marcatore
      const marker = `[Immagine: ${file.name}]`
      insertAtCursor(marker)

      // Aggiungi anche come allegato così viene inviato
      setAttachments(prev => [
        ...prev,
        {
          id:      crypto.randomUUID(),
          file,
          name:    file.name,
          size:    file.size,
          type:    file.type,
          preview: dataUrl,
        },
      ])
    }

    e.target.value = ''
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EMOJI — inserisce alla posizione cursore nella textarea
  // ─────────────────────────────────────────────────────────────────────────

  const handleEmojiSelect = (emoji: string) => {
    insertAtCursor(emoji)
    setShowEmoji(false)
    textareaRef.current?.focus()
  }

  // ── Inserisce testo alla posizione cursore nella textarea ──────────────────
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setBody(prev => prev + text)
      return
    }

    const start = textarea.selectionStart ?? body.length
    const end   = textarea.selectionEnd   ?? body.length

    const newBody =
      body.substring(0, start) + text + body.substring(end)

    setBody(newBody)

    // Ripristina posizione cursore dopo il testo inserito
    requestAnimationFrame(() => {
      textarea.focus()
      const newPos = start + text.length
      textarea.setSelectionRange(newPos, newPos)
    })
  }

  // Salva posizione cursore quando la textarea perde il focus
  const handleTextareaBlur = () => {
    cursorPosRef.current = textareaRef.current?.selectionStart ?? body.length
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Drag & Drop sulla textarea
  // ─────────────────────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INVIO
  // ─────────────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    setError(null)

    if (to.length === 0)  { setError('Aggiungi almeno un destinatario'); return }
    if (!subject.trim())  { setError('Inserisci un oggetto');            return }
    if (!body.trim())     { setError('Inserisci un messaggio');          return }
    if (!user?.email)     { setError('Devi essere autenticato');         return }

    setSending(true)
    try {
      const senderName =
        (profile as any)?.curator_name ||
        (profile as any)?.company_name ||
        user.email.split('@')[0]

      // Converti allegati in base64 per l'invio
      const attachmentData = await Promise.all(
        attachments.map(async (att) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              const result = e.target?.result as string
              // Rimuove il prefisso "data:...;base64,"
              resolve(result.split(',')[1] || '')
            }
            reader.readAsDataURL(att.file)
          })
          return {
            filename:    att.name,
            content:     base64,
            content_type: att.type,
            size:        att.size,
          }
        })
      )

      const request: SendEmailRequest = {
        to,
        cc:          cc.length  > 0 ? cc  : undefined,
        bcc:         bcc.length > 0 ? bcc : undefined,
        subject:     subject.trim(),
        body_text:   body.trim(),
        html:        EmailService.textToHtml(body.trim()),
        from:        user.email,
        sender_name: senderName,
        reply_to:    user.email,
        // ✅ Allegati serializzati
        attachments: attachmentData.length > 0 ? attachmentData : undefined,
      }

      console.log('📧 Sending email with', attachmentData.length, 'attachments')

      await EmailService.sendEmail(request)
      console.log('✅ Email sent successfully')

      if (onSendSuccess) await onSendSuccess()
      onCancel()

    } catch (err: any) {
      console.error('Error sending email:', err)
      setError(err.message || "Errore durante l'invio dell'email")
    } finally {
      setSending(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — campo destinatari (riutilizzabile)
  // ─────────────────────────────────────────────────────────────────────────

  const RecipientField = ({
    type, label, list,
  }: { type: 'to' | 'cc' | 'bcc'; label: string; list: string[] }) => (
    <div className="flex items-start gap-2 py-2 border-b border-gray-100">
      <label className="text-sm font-medium text-gray-600 w-14 pt-1 flex-shrink-0">
        {label}
      </label>
      <div className="flex-1 flex flex-wrap gap-1.5">
        {list.map(email => (
          <span
            key={email}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100
                       text-blue-700 rounded-full text-xs font-medium"
          >
            {email}
            <button
              onClick={() => removeRecipient(type, email)}
              className="hover:bg-blue-200 rounded-full p-0.5"
              disabled={sending}
              type="button"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <input
          type="email"
          placeholder={list.length === 0 ? 'Aggiungi indirizzo...' : ''}
          className="flex-1 min-w-[180px] outline-none text-sm py-0.5"
          onKeyDown={e => handleKeyDown(e, type)}
          onBlur={e => handleBlur(e, type)}
          disabled={sending}
        />
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────────

  const totalAttachmentSize = attachments.reduce((sum, a) => sum + a.size, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh]
                      flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4
                        border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {replyTo        ? '↩ Rispondi'         :
               forwardMessage ? '↪ Inoltra'           :
                                '✉ Nuovo Messaggio'}
            </h2>
            {user?.email && (
              <p className="text-xs text-gray-500 mt-0.5">
                Da:{' '}
                <span className="font-medium">
                  {(profile as any)?.curator_name || user.email.split('@')[0]}
                </span>{' '}
                <span className="text-gray-400">(risposta a: {user.email})</span>
              </p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={sending}
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ── Errore ─────────────────────────────────────────────────────── */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200
                          rounded-lg text-red-700 text-sm flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto flex-shrink-0"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">

          {/* To */}
          <div className="flex items-start gap-2 py-2 border-b border-gray-100">
            <label className="text-sm font-medium text-gray-600 w-14 pt-1 flex-shrink-0">
              A:
            </label>
            <div className="flex-1 flex flex-wrap gap-1.5">
              {to.map(email => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100
                             text-blue-700 rounded-full text-xs font-medium"
                >
                  {email}
                  <button
                    onClick={() => removeRecipient('to', email)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                    disabled={sending}
                    type="button"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <input
                type="email"
                placeholder={to.length === 0 ? 'Aggiungi destinatario...' : ''}
                className="flex-1 min-w-[200px] outline-none text-sm py-0.5"
                onKeyDown={e => handleKeyDown(e, 'to')}
                onBlur={e => handleBlur(e, 'to')}
                disabled={sending}
              />
            </div>
            <div className="flex gap-1 flex-shrink-0 pt-0.5">
              <button
                onClick={() => setShowCc(!showCc)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  showCc
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                type="button"
                disabled={sending}
              >
                Cc
              </button>
              <button
                onClick={() => setShowBcc(!showBcc)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  showBcc
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                type="button"
                disabled={sending}
              >
                Ccn
              </button>
            </div>
          </div>

          {showCc  && <RecipientField type="cc"  label="Cc:"  list={cc}  />}
          {showBcc && <RecipientField type="bcc" label="Ccn:" list={bcc} />}

          {/* Oggetto */}
          <div className="flex items-center gap-2 py-2 border-b border-gray-100">
            <label className="text-sm font-medium text-gray-600 w-14 flex-shrink-0">
              Oggetto:
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Oggetto del messaggio..."
              className="flex-1 outline-none text-sm"
              disabled={sending}
            />
          </div>

          {/* Corpo + Drag & Drop */}
          <div
            className="pt-2"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <textarea
              ref={textareaRef}
              value={body}
              onChange={e => setBody(e.target.value)}
              onBlur={handleTextareaBlur}
              placeholder="Scrivi il tuo messaggio... (puoi trascinare file qui)"
              className="w-full h-52 p-3 border border-gray-200 rounded-lg
                         resize-none focus:outline-none focus:ring-2
                         focus:ring-blue-500 text-sm leading-relaxed"
              disabled={sending}
            />
            <p className="text-xs text-gray-400 mt-1">
              💡 La tua firma verrà aggiunta automaticamente •
              Trascina file per allegarli
            </p>
          </div>

          {/* ── Lista allegati ──────────────────────────────────────────── */}
          {attachments.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">
                  Allegati ({attachments.length})
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(totalAttachmentSize)} / 25 MB
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map(att => (
                  <AttachmentItem
                    key={att.id}
                    attachment={att}
                    onRemove={removeAttachment}
                    disabled={sending}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4
                        border-t border-gray-200 bg-gray-50 rounded-b-xl">

          {/* Toolbar sinistra */}
          <div className="flex gap-1 relative">

            {/* ── Allega file ── */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={sending}
              // Tutti i tipi di file (PDF, Word, immagini, ecc.)
              accept="*/*"
            />
            <button
              type="button"
              onClick={handleAttachClick}
              disabled={sending}
              className={`p-2 rounded-lg transition-colors ${
                attachments.length > 0
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
              title={
                attachments.length > 0
                  ? `${attachments.length} allegato${attachments.length > 1 ? 'i' : ''}`
                  : 'Aggiungi allegato'
              }
            >
              <Paperclip className="w-4 h-4" />
              {attachments.length > 0 && (
                <span className="sr-only">{attachments.length}</span>
              )}
            </button>

            {/* ── Inserisci immagine ── */}
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={sending}
            />
            <button
              type="button"
              onClick={handleImageClick}
              disabled={sending}
              className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
              title="Inserisci immagine"
            >
              <Image className="w-4 h-4" />
            </button>

            {/* ── Emoji picker ── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmoji(prev => !prev)}
                disabled={sending}
                className={`p-2 rounded-lg transition-colors ${
                  showEmoji
                    ? 'text-yellow-600 bg-yellow-50'
                    : 'text-gray-500 hover:bg-gray-200'
                }`}
                title="Inserisci emoji"
              >
                <Smile className="w-4 h-4" />
              </button>

              {showEmoji && (
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmoji(false)}
                />
              )}
            </div>

          </div>

          {/* Pulsanti destra */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200
                         rounded-lg transition-colors"
              disabled={sending}
              type="button"
            >
              Annulla
            </button>
            <button
              onClick={handleSend}
              disabled={
                sending              ||
                to.length === 0      ||
                !subject.trim()      ||
                !body.trim()
              }
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white
                         text-sm font-medium rounded-lg hover:bg-blue-700
                         transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed"
              type="button"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white
                                  border-t-transparent rounded-full animate-spin" />
                  Invio in corso...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Invia{attachments.length > 0
                    ? ` (+${attachments.length})`
                    : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}