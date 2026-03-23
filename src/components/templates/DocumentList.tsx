// src/components/templates/DocumentList.tsx
// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// ICONE: tutte SVG inline — nessuna dipendenza da lucide-react
// Motivo: lucide-react in alcuni bundle si renderizza come testo invece di SVG
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState }      from 'react'
import { Badge }                from '@/components/ui/badge'
import { Button }               from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { templateService }      from '@/services/templateService'
import {
  generateDocumentPDF,
  exportDocumentToDocx,
} from '@/components/templates/TemplateExport'
import { formatDistanceToNow }  from 'date-fns'
import { it }                   from 'date-fns/locale'
import { toast }                from 'sonner'
import type { TemplateDocument } from '@/types/template.types'

// ─────────────────────────────────────────────────────────────────────────────
// SVG ICONS — tutte inline, nessun import da librerie esterne
// stroke="currentColor" → eredita il colore dal parent CSS
// ─────────────────────────────────────────────────────────────────────────────

const SVG_PROPS = {
  xmlns:           'http://www.w3.org/2000/svg',
  width:           '16',
  height:          '16',
  viewBox:         '0 0 24 24',
  fill:            'none',
  stroke:          'currentColor',
  strokeWidth:     '2',
  strokeLinecap:   'round' as const,
  strokeLinejoin:  'round' as const,
}

const SVG_SM = { ...SVG_PROPS, width: '14', height: '14' }

/** Documento / FileText */
const IconFileText = () => (
  <svg {...SVG_PROPS}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

/** Scarica / FileDown — per PDF */
const IconFileDown = ({ size = 14 }: { size?: number }) => (
  <svg {...SVG_PROPS} width={size} height={size}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="18" x2="12" y2="12"/>
    <polyline points="9 15 12 18 15 15"/>
  </svg>
)

/** File Word — per DOCX */
const IconDocx = ({ size = 14 }: { size?: number }) => (
  <svg {...SVG_PROPS} width={size} height={size}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8"  y2="13"/>
    <line x1="16" y1="17" x2="8"  y2="17"/>
    <line x1="10" y1="9"  x2="8"  y2="9"/>
  </svg>
)

/** Tre puntini verticali / MoreVertical */
const IconMoreVertical = () => (
  <svg {...SVG_PROPS}>
    <circle cx="12" cy="5"  r="1"/>
    <circle cx="12" cy="12" r="1"/>
    <circle cx="12" cy="19" r="1"/>
  </svg>
)

/** Matita / Edit */
const IconEdit = () => (
  <svg {...SVG_SM}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

/** Cestino / Trash2 */
const IconTrash = () => (
  <svg {...SVG_SM}>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

/** Spinner / Loader */
const IconLoader = () => (
  <svg
    {...SVG_SM}
    className="animate-spin"
    style={{ animation: 'spin 1s linear infinite' }}
  >
    <line x1="12" y1="2"  x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93"  y1="4.93"  x2="7.76"  y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2"  y1="12" x2="6"  y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93"  y1="19.07" x2="7.76"  y2="16.24"/>
    <line x1="16.24" y1="7.76"  x2="19.07" y2="4.93"/>
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────
// BADGE STATO
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const cfg: Record<string, { label: string; cls: string }> = {
    draft:     { label: 'Bozza',      cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    completed: { label: 'Completato', cls: 'bg-green-100  text-green-800  border-green-200'  },
    signed:    { label: 'Firmato',    cls: 'bg-blue-100   text-blue-800   border-blue-200'   },
    archived:  { label: 'Archiviato', cls: 'bg-gray-100   text-gray-600   border-gray-200'   },
  }
  const c = cfg[status] ?? cfg.draft
  return (
    <Badge variant="outline" className={`text-xs font-medium ${c.cls}`}>
      {c.label}
    </Badge>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONA DOCUMENTO (avatar colorato con lettera iniziale)
// NON usa emoji — usa lettera + colore per evitare problemi di rendering
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: '#e0e7ff', text: '#3730a3' },  // indigo
  { bg: '#d1fae5', text: '#065f46' },  // emerald
  { bg: '#fee2e2', text: '#991b1b' },  // red
  { bg: '#fef9c3', text: '#854d0e' },  // yellow
  { bg: '#f3e8ff', text: '#6b21a8' },  // purple
  { bg: '#ffedd5', text: '#9a3412' },  // orange
  { bg: '#cffafe', text: '#155e75' },  // cyan
]

const DocAvatar = ({
  name,
  categoryName,
}: {
  name?:         string
  categoryName?: string
}) => {
  // Usa il nome della categoria o del documento per scegliere colore
  const seed   = (categoryName || name || 'D').charCodeAt(0)
  const color  = AVATAR_COLORS[seed % AVATAR_COLORS.length]
  const letter = (categoryName || name || 'D').charAt(0).toUpperCase()

  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 select-none"
      style={{ backgroundColor: color.bg }}
    >
      <span
        className="text-sm font-bold"
        style={{ color: color.text }}
      >
        {letter}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

interface DocumentListProps {
  documents:  TemplateDocument[]
  onEdit:     (document: TemplateDocument) => void
  onRefresh:  () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onEdit,
  onRefresh,
}) => {
  const [loadingId,   setLoadingId]   = useState<string | null>(null)
  const [loadingPdf,  setLoadingPdf]  = useState<string | null>(null)
  const [loadingDocx, setLoadingDocx] = useState<string | null>(null)

  // ── Export PDF ──────────────────────────────────────────────────────────
  const handleExportPdf = async (
    e: React.MouseEvent,
    doc: TemplateDocument
  ) => {
    e.stopPropagation()
    try {
      setLoadingPdf(doc.id)
      const templateName =
        (doc as any).template?.name || doc.template_name
      await generateDocumentPDF(doc, templateName)
      toast.success('PDF esportato con successo')
    } catch (err: any) {
      console.error('PDF error:', err)
      toast.error(`Errore PDF: ${err.message}`)
    } finally {
      setLoadingPdf(null)
    }
  }

  // ── Export DOCX ─────────────────────────────────────────────────────────
  const handleExportDocx = async (
    e: React.MouseEvent,
    doc: TemplateDocument
  ) => {
    e.stopPropagation()
    try {
      setLoadingDocx(doc.id)
      const templateName =
        (doc as any).template?.name || doc.template_name
      await exportDocumentToDocx(doc, templateName)
      toast.success('Word esportato con successo')
    } catch (err: any) {
      console.error('DOCX error:', err)
      toast.error(`Errore DOCX: ${err.message}`)
    } finally {
      setLoadingDocx(null)
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (
    e: React.MouseEvent,
    doc: TemplateDocument
  ) => {
    e.stopPropagation()
    if (!window.confirm('Eliminare questo documento?')) return
    try {
      setLoadingId(doc.id)
      await templateService.deleteDocument(doc.id)
      toast.success('Documento eliminato')
      onRefresh()
    } catch (err: any) {
      toast.error('Errore eliminazione')
    } finally {
      setLoadingId(null)
    }
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 text-muted-foreground">
            <IconFileText />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Nessun documento</h3>
        <p className="text-sm text-muted-foreground">
          Crea un documento compilando uno dei template disponibili
        </p>
      </div>
    )
  }

  // ── Lista ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Stile per spinner — necessario perché non usiamo Tailwind animate-spin
          su elementi SVG creati inline                                        */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div className="space-y-2">
        {documents.map((doc) => {
          const templateName  = (doc as any).template?.name
            || doc.template_name
            || 'Template'
          const categoryName  = (doc as any).template?.category?.name || ''

          const isPdfLoading  = loadingPdf  === doc.id
          const isDocxLoading = loadingDocx === doc.id
          const isRowLoading  = loadingId   === doc.id

          const updatedAgo = (() => {
            try {
              return formatDistanceToNow(new Date(doc.updated_at), {
                addSuffix: true,
                locale:    it,
              })
            } catch {
              return ''
            }
          })()

          return (
            <div
              key={doc.id}
              className={[
                'flex items-center gap-4 p-4 rounded-lg border bg-card',
                'hover:bg-accent/30 transition-colors cursor-pointer',
                isRowLoading ? 'opacity-50 pointer-events-none' : '',
              ].join(' ')}
              onClick={() => onEdit(doc)}
            >
              {/* Avatar colorato */}
              <DocAvatar
                name={templateName}
                categoryName={categoryName}
              />

              {/* Info testo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm truncate">
                    {doc.name}
                  </span>
                  <StatusBadge status={doc.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Template: {templateName}
                  {categoryName && (
                    <span className="ml-2 text-primary/70">
                      {categoryName}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Modificato {updatedAgo}
                </p>
              </div>

              {/* ── Pulsanti export ────────────────────────────────────── */}
              <div
                className="flex items-center gap-1.5 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* PDF */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPdfLoading || isDocxLoading}
                  onClick={(e) => handleExportPdf(e, doc)}
                  className="h-8 px-2.5 gap-1.5 text-xs font-medium"
                  title="Esporta documento completo in PDF"
                >
                  {isPdfLoading
                    ? <IconLoader />
                    : <IconFileDown />
                  }
                  <span>PDF</span>
                </Button>

                {/* DOCX */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPdfLoading || isDocxLoading}
                  onClick={(e) => handleExportDocx(e, doc)}
                  className={[
                    'h-8 px-2.5 gap-1.5 text-xs font-medium',
                    'text-blue-600 border-blue-200',
                    'hover:bg-blue-50 hover:border-blue-400',
                  ].join(' ')}
                  title="Esporta documento completo in Word (.docx)"
                >
                  {isDocxLoading
                    ? <IconLoader />
                    : <IconDocx />
                  }
                  <span>DOCX</span>
                </Button>

                {/* Menu azioni */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isRowLoading}
                      title="Altre azioni"
                    >
                      <IconMoreVertical />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onEdit(doc)}>
                      <span className="mr-2 inline-flex">
                        <IconEdit />
                      </span>
                      Modifica
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => handleExportPdf(e, doc)}
                      disabled={isPdfLoading}
                    >
                      <span className="mr-2 inline-flex">
                        <IconFileDown />
                      </span>
                      Esporta PDF
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => handleExportDocx(e, doc)}
                      disabled={isDocxLoading}
                    >
                      <span className="mr-2 inline-flex text-blue-600">
                        <IconDocx />
                      </span>
                      Esporta Word (.docx)
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={(e) => handleDelete(e, doc)}
                      className="text-destructive focus:text-destructive"
                      disabled={isRowLoading}
                    >
                      <span className="mr-2 inline-flex">
                        <IconTrash />
                      </span>
                      Elimina
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default DocumentList