// src/lib/pdfExport.ts
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export interface PDFOptions {
  title: string
  subtitle?: string
  author?: string
}

/**
 * Crea un nuovo documento PDF con header base
 */
export const createPDF = (options: PDFOptions): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Metadata
  doc.setProperties({
    title: options.title,
    author: options.author || 'Krea4u CRM',
    creator: 'Krea4u CRM - Sistema Gestionale Curatoriale',
    subject: options.subtitle || options.title,
  })

  return doc
}

/**
 * Aggiunge header al documento
 */
export const addHeader = (
  doc: jsPDF,
  title: string,
  subtitle?: string
): number => {
  let yPos = 20

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text(title, 14, yPos)
  yPos += 12

  // Subtitle
  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(subtitle, 14, yPos)
    yPos += 10
    doc.setTextColor(0)
  }

  // Divider line
  doc.setDrawColor(200)
  doc.line(14, yPos, 196, yPos)
  yPos += 10

  return yPos
}

/**
 * Aggiunge una sezione al documento
 */
export const addSection = (
  doc: jsPDF,
  title: string,
  yPos: number
): number => {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(title, 14, yPos)
  yPos += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  return yPos
}

/**
 * Aggiunge un sub-heading
 */
export const addSubHeading = (
  doc: jsPDF,
  title: string,
  yPos: number
): number => {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(title, 14, yPos)
  yPos += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  return yPos
}

/**
 * Aggiunge testo multilinea
 */
export const addMultilineText = (
  doc: jsPDF,
  text: string,
  yPos: number,
  maxWidth: number = 180
): number => {
  const splitText = doc.splitTextToSize(text, maxWidth)
  doc.text(splitText, 14, yPos)
  return yPos + splitText.length * 5
}

/**
 * Aggiunge un campo key-value
 */
export const addField = (
  doc: jsPDF,
  label: string,
  value: string | number,
  yPos: number,
  bold: boolean = false
): number => {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(`${label}:`, 14, yPos)

  doc.setFont('helvetica', bold ? 'bold' : 'normal')
  doc.text(String(value), 60, yPos)

  doc.setFont('helvetica', 'normal')
  return yPos + 6
}

/**
 * Aggiunge un box informativo
 */
export const addInfoBox = (
  doc: jsPDF,
  content: { label: string; value: string }[],
  yPos: number,
  width: number = 180
): number => {
  const boxHeight = content.length * 6 + 6
  
  // Draw box
  doc.setDrawColor(200)
  doc.setFillColor(245, 245, 245)
  doc.rect(14, yPos, width, boxHeight, 'FD')

  yPos += 6
  content.forEach((item) => {
    yPos = addField(doc, item.label, item.value, yPos)
  })

  return yPos + 4
}

/**
 * Aggiunge una lista puntata
 */
export const addBulletList = (
  doc: jsPDF,
  items: string[],
  yPos: number,
  bulletChar: string = '•'
): number => {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  items.forEach((item) => {
    doc.text(`${bulletChar} ${item}`, 18, yPos)
    yPos += 5
  })

  return yPos + 3
}

/**
 * Aggiunge una tabella semplice (wrapper per autoTable)
 */
export const addTable = (
  doc: jsPDF,
  headers: string[],
  rows: (string | number)[][],
  yPos: number
): number => {
  // @ts-ignore - jspdf-autotable aggiunge questo metodo
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: yPos,
    theme: 'striped',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
    },
    margin: { left: 14, right: 14 },
  })

  // @ts-ignore
  return doc.lastAutoTable.finalY + 10
}

/**
 * Controlla se serve una nuova pagina
 */
export const checkPageBreak = (
  doc: jsPDF,
  currentY: number,
  requiredSpace: number = 30
): number => {
  const pageHeight = doc.internal.pageSize.height
  if (currentY > pageHeight - requiredSpace) {
    doc.addPage()
    return 20
  }
  return currentY
}

/**
 * Aggiunge footer a tutte le pagine
 */
export const addFooters = (
  doc: jsPDF,
  leftText: string,
  includeDate: boolean = true
) => {
  const pageCount = doc.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)

    // Left footer
    doc.text(leftText, 14, doc.internal.pageSize.height - 10)

    // Right footer
    const rightText = includeDate
      ? `Pagina ${i} di ${pageCount} - ${new Date().toLocaleDateString('it-IT')}`
      : `Pagina ${i} di ${pageCount}`

    doc.text(
      rightText,
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    )

    doc.setTextColor(0)
  }
}

/**
 * Aggiunge un watermark
 */
export const addWatermark = (
  doc: jsPDF,
  text: string,
  opacity: number = 0.1
) => {
  const pageCount = doc.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.saveGraphicsState()
    doc.setGState(new (doc as any).GState({ opacity }))
    
    doc.setFontSize(60)
    doc.setTextColor(150)
    doc.setFont('helvetica', 'bold')
    
    // Ruota testo a 45 gradi
    const angle = -45 * (Math.PI / 180)
    doc.text(text, pageWidth / 2, pageHeight / 2, {
      angle,
      align: 'center',
    })
    
    doc.restoreGraphicsState()
  }
}

// ============================================
// FORMATTING HELPERS
// ============================================

/**
 * Formatta data in italiano
 */
export const formatDateIT = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/D'
  try {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return 'Data non valida'
  }
}

/**
 * Formatta data e ora in italiano
 */
export const formatDateTimeIT = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/D'
  try {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Data non valida'
  }
}

/**
 * Formatta valuta
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/D'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

/**
 * Formatta numero
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/D'
  return new Intl.NumberFormat('it-IT').format(value)
}

/**
 * Formatta percentuale
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/D'
  return `${Math.round(value)}%`
}

/**
 * Trunca testo lungo
 */
export const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
  if (!text) return 'N/D'
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

/**
 * Capitalizza prima lettera
 */
export const capitalize = (text: string | null | undefined): string => {
  if (!text) return 'N/D'
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Formatta tipo partecipante per PDF
 */
export const formatParticipantType = (type: string | null | undefined): string => {
  if (!type) return 'N/D'
  
  const types: Record<string, string> = {
    curator: 'Curatore',
    artist: 'Artista',
    venue: 'Venue',
    collaborator: 'Collaboratore',
  }
  
  return types[type] || capitalize(type)
}

/**
 * Formatta status progetto per PDF
 */
export const formatProjectStatus = (status: string | null | undefined): string => {
  if (!status) return 'N/D'
  
  const statuses: Record<string, string> = {
    planning: 'In Pianificazione',
    active: 'Attivo',
    in_progress: 'In Corso',
    completed: 'Completato',
    archived: 'Archiviato',
    cancelled: 'Annullato',
    on_hold: 'In Pausa',
  }
  
  return statuses[status] || capitalize(status)
}

/**
 * Formatta priorità task per PDF
 */
export const formatTaskPriority = (priority: string | null | undefined): string => {
  if (!priority) return 'Media'
  
  const priorities: Record<string, string> = {
    low: 'Bassa',
    medium: 'Media',
    high: 'Alta',
  }
  
  return priorities[priority] || capitalize(priority)
}

/**
 * Formatta status task per PDF
 */
export const formatTaskStatus = (status: string | null | undefined): string => {
  if (!status) return 'Da fare'
  
  const statuses: Record<string, string> = {
    todo: 'Da fare',
    in_progress: 'In corso',
    done: 'Completato',
  }
  
  return statuses[status] || capitalize(status)
}

// ============================================
// EXPORT HELPERS PER PROJECT_PARTICIPANTS
// ============================================

/**
 * Formatta lista partecipanti per PDF
 */
export const formatParticipantsList = (
  participants: Array<{ display_name: string; participant_type: string }> | null | undefined
): string[] => {
  if (!participants || participants.length === 0) {
    return ['Nessun partecipante']
  }
  
  return participants.map(p => 
    `${p.display_name} (${formatParticipantType(p.participant_type)})`
  )
}

/**
 * Conta partecipanti per tipo
 */
export const countParticipantsByType = (
  participants: Array<{ participant_type: string }> | null | undefined,
  type: string
): number => {
  if (!participants) return 0
  return participants.filter(p => p.participant_type === type).length
}

/**
 * Ottieni partecipanti per tipo
 */
export const getParticipantsByType = (
  participants: Array<{ display_name: string; participant_type: string }> | null | undefined,
  type: string
): string[] => {
  if (!participants) return []
  return participants
    .filter(p => p.participant_type === type)
    .map(p => p.display_name)
}