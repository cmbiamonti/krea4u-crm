// src/components/templates/TemplateExport.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Gestisce TUTTE le esportazioni del sistema template:
//
//   exportTemplateAsJson()    → Template (struttura)      → .json
//   generateDocumentPDF()     → TemplateDocument compilato → .pdf  (testo completo)
//   exportDocumentToDocx()    → TemplateDocument compilato → .docx (testo completo)
//
// LOGICA CHIAVE:
//   1. Recupera template.content.contract_text dal DB
//   2. Sostituisce {{placeholder}} con i valori in document.data
//   3. Stampa il documento completo (non il riassunto campi)
// ─────────────────────────────────────────────────────────────────────────────

import { Button }   from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast }    from 'sonner'
import jsPDF        from 'jspdf'
import {
  Document    as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  HeadingLevel,
  PageBreak,
} from 'docx'
import { saveAs }           from 'file-saver'
import { supabase }         from '@/lib/supabase'
import type {
  Template,
  TemplateDocument,
  TemplateContent,
} from '@/types/template.types'

// ─────────────────────────────────────────────────────────────────────────────
// COSTANTI
// ─────────────────────────────────────────────────────────────────────────────

const PDF = {
  pR: 30,  pG: 64,  pB: 175,   // blu primario
  sR: 80,  sG: 80,  sB: 80,    // grigio testo
  bR: 200, bG: 200, bB: 200,   // bordi
}

const DOCX = {
  primary:   '1e40af',
  secondary: '505050',
  border:    'cccccc',
}

const STATUS_IT: Record<string, string> = {
  draft:     'Bozza',
  completed: 'Completato',
  signed:    'Firmato',
  archived:  'Archiviato',
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — recupera template content dal DB se non già disponibile
// ─────────────────────────────────────────────────────────────────────────────

async function resolveTemplateContent(
  doc: TemplateDocument
): Promise<TemplateContent | null> {

  // 1. Già presente nel documento (join)
  if ((doc as any).template_content) {
    return (doc as any).template_content as TemplateContent
  }

  // 2. Recupera dal DB tramite template_id
  if (doc.template_id) {
    const { data, error } = await supabase
      .from('templates')
      .select('content, name')
      .eq('id', doc.template_id)
      .single()

    if (!error && data?.content) {
      // ✅ FIX: doppio cast via unknown per compatibilità con tipo Json di Supabase
      return data.content as unknown as TemplateContent
    }
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — sostituisce {{placeholder}} con i valori compilati
// ─────────────────────────────────────────────────────────────────────────────

function fillPlaceholders(
  text: string,
  data: Record<string, any>
): string {
  let filled = text

  // Sostituisce ogni {{fieldId}} con il valore compilato
  Object.entries(data).forEach(([fieldId, value]) => {
    const regex = new RegExp(`\\{\\{${fieldId}\\}\\}`, 'g')
    const display = formatFieldValue(value)
    filled = filled.replace(regex, display)
  })

  // Segna i placeholder non compilati
  filled = filled.replace(
    /\{\{([^}]+)\}\}/g,
    (_match, fieldId) => `[${fieldId} — NON COMPILATO]`
  )

  return filled
}

function formatFieldValue(value: any): string {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'boolean') return value ? 'Sì' : 'No'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString('it-IT')
  }
  return String(value)
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — costruisce il testo completo del documento
// Se non c'è contract_text, genera un documento strutturato dai campi
// ─────────────────────────────────────────────────────────────────────────────

function buildDocumentText(
  content: TemplateContent,
  data: Record<string, any>
): string[] {
  // ── Caso A: testo contratto con placeholder ──────────────────────────────
  if (content.contract_text) {
    const filled = fillPlaceholders(content.contract_text, data)
    return filled.split('\n')
  }

  // ── Caso B: nessun testo contratto → genera da campi ────────────────────
  const lines: string[] = []
  content.sections.forEach(section => {
    lines.push(`\n${section.title.toUpperCase()}\n`)
    section.fields.forEach(field => {
      if (field.type === 'section') return
      const value = data[field.id]
      if (value === undefined || value === null || value === '') return
      const display =
        field.type === 'checkbox' ? (value ? 'Sì' : 'No') :
        field.type === 'currency' ? `€ ${value}`           :
        formatFieldValue(value)
      lines.push(`${field.label}: ${display}`)
    })
  })
  return lines
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT 1 — Template struttura → JSON
// ─────────────────────────────────────────────────────────────────────────────

export function exportTemplateAsJson(template: Template): void {
  try {
    const blob = new Blob(
      [JSON.stringify({
        name:        template.name,
        description: template.description,
        category:    template.category_name,
        tags:        template.tags,
        content:     template.content,
        version:     template.version,
        exported_at: new Date().toISOString(),
      }, null, 2)],
      { type: 'application/json' }
    )
    const url  = URL.createObjectURL(blob)
    const link = Object.assign(window.document.createElement('a'), {
      href:     url,
      download: `${template.name.replace(/\s+/g, '_')}_template.json`,
    })
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Template esportato come JSON')
  } catch (err) {
    console.error('JSON export error:', err)
    toast.error("Errore durante l'esportazione JSON")
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT 2 — Documento compilato → PDF completo
// ─────────────────────────────────────────────────────────────────────────────

export async function generateDocumentPDF(
  document: TemplateDocument,
  templateName?: string
): Promise<void> {

  // ── 1. Recupera template content ─────────────────────────────────────────
  const content = await resolveTemplateContent(document)

  const docName  = document.name  || 'Documento'
  const tmplName = templateName
    || (document as any).template?.name
    || document.template_name
    || 'Template'

  // ── 2. Costruisce il testo con placeholder risolti ────────────────────────
  const textLines = content
    ? buildDocumentText(content, document.data || {})
    : Object.entries(document.data || {}).map(
        ([k, v]) => `${k.replace(/_/g, ' ')}: ${formatFieldValue(v)}`
      )

  // ── 3. Setup jsPDF ────────────────────────────────────────────────────────
  const pdf    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW  = pdf.internal.pageSize.getWidth()
  const pageH  = pdf.internal.pageSize.getHeight()
  const mL     = 20
  const mR     = 20
  const mT     = 20
  const mB     = 20
  const usableW = pageW - mL - mR
  let   y       = mT

  // ── Helper check pagina ───────────────────────────────────────────────────
  const checkPage = (needed: number) => {
    if (y + needed > pageH - mB - 15) {
      addFooter()
      pdf.addPage()
      y = mT
    }
  }

  // ── Helper footer ─────────────────────────────────────────────────────────
  const addFooter = () => {
    const pg = (pdf.internal as any).getNumberOfPages?.() ?? 1
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(PDF.sR, PDF.sG, PDF.sB)
    pdf.setDrawColor(PDF.bR, PDF.bG, PDF.bB)
    pdf.line(mL, pageH - mB + 2, pageW - mR, pageH - mB + 2)
    pdf.text(
      `${docName} — ${STATUS_IT[document.status] || document.status}`,
      mL, pageH - mB + 7
    )
    pdf.text(
      `Pag. ${pg}`,
      pageW - mR, pageH - mB + 7,
      { align: 'right' }
    )
    pdf.setTextColor(0, 0, 0)
  }

  // ── 4. Intestazione ───────────────────────────────────────────────────────
  // Rettangolo header
  pdf.setFillColor(PDF.pR, PDF.pG, PDF.pB)
  pdf.rect(0, 0, pageW, 40, 'F')

  // Titolo documento
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.setTextColor(255, 255, 255)
  pdf.text(docName, pageW / 2, 17, { align: 'center' })

  // Sottotitolo
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(200, 215, 255)
  pdf.text(`Template: ${tmplName}`, pageW / 2, 26, { align: 'center' })
  pdf.text(
    `Generato il ${new Date().toLocaleDateString('it-IT', {
      day: '2-digit', month: 'long', year: 'numeric',
    })}   |   Stato: ${STATUS_IT[document.status] || document.status}`,
    pageW / 2, 34,
    { align: 'center' }
  )

  y = 50
  pdf.setTextColor(0, 0, 0)

  // ── 5. Corpo documento ────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10.5)

  textLines.forEach((line) => {
    const trimmed = line ?? ''

    // Riga vuota → spazio verticale
    if (trimmed.trim() === '') {
      y += 3
      return
    }

    // Titolo articolo (es: "ART. 1 — OGGETTO")
    const isArticle = /^(art\.\s*\d+|articolo\s+\d+|\d+\s*[.)—])/i.test(trimmed.trim())
    const isSection = trimmed.trim() === trimmed.trim().toUpperCase() &&
                      trimmed.trim().length > 3 &&
                      trimmed.trim().length < 80

    if (isArticle || isSection) {
      checkPage(14)
      y += 4
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10.5)
      pdf.text(trimmed.trim(), mL, y)
      y += 6
      pdf.setFont('helvetica', 'normal')
      return
    }

    // Testo normale — va a capo automaticamente
    const lines   = pdf.splitTextToSize(trimmed.trim(), usableW)
    const blockH  = lines.length * 5.5
    checkPage(blockH)
    pdf.text(lines, mL, y)
    y += blockH + 1.5
  })

  // ── 6. Footer ultima pagina ───────────────────────────────────────────────
  addFooter()

  // ── 7. Download ───────────────────────────────────────────────────────────
  const fileName = `${docName.replace(/\s+/g, '_')}_${
    new Date().toISOString().slice(0, 10)
  }.pdf`
  pdf.save(fileName)
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT 3 — Documento compilato → DOCX completo
// ─────────────────────────────────────────────────────────────────────────────

export async function exportDocumentToDocx(
  document: TemplateDocument,
  templateName?: string
): Promise<void> {

  // ── 1. Recupera template content ─────────────────────────────────────────
  const content = await resolveTemplateContent(document)

  const docName  = document.name || 'Documento'
  const tmplName = templateName
    || (document as any).template?.name
    || document.template_name
    || 'Template'

  // ── 2. Costruisce il testo con placeholder risolti ────────────────────────
  const textLines = content
    ? buildDocumentText(content, document.data || {})
    : Object.entries(document.data || {}).map(
        ([k, v]) => `${k.replace(/_/g, ' ')}: ${formatFieldValue(v)}`
      )

  // ── 3. Converte le righe di testo in paragrafi DOCX ───────────────────────
  const bodyParagraphs: Paragraph[] = []

  textLines.forEach((line) => {
    const trimmed = line ?? ''

    // Riga vuota
    if (trimmed.trim() === '') {
      bodyParagraphs.push(
        new Paragraph({ children: [new TextRun('')], spacing: { after: 60 } })
      )
      return
    }

    // Titolo articolo
    const isArticle = /^(art\.\s*\d+|articolo\s+\d+|\d+\s*[.)—])/i.test(trimmed.trim())
    const isSection = trimmed.trim() === trimmed.trim().toUpperCase() &&
                      trimmed.trim().length > 3 &&
                      trimmed.trim().length < 80

    if (isArticle) {
      bodyParagraphs.push(
        new Paragraph({
          spacing: { before: 280, after: 120 },
          children: [
            new TextRun({
              text:  trimmed.trim(),
              bold:  true,
              size:  22,
              color: DOCX.primary,
              font:  'Calibri',
            }),
          ],
        })
      )
      return
    }

    if (isSection) {
      bodyParagraphs.push(
        new Paragraph({
          spacing: { before: 400, after: 160 },
          children: [
            new TextRun({
              text:  trimmed.trim(),
              bold:  true,
              size:  24,
              color: DOCX.primary,
              font:  'Calibri',
              allCaps: true,
            }),
          ],
        })
      )
      return
    }

    // Testo normale
    bodyParagraphs.push(
      new Paragraph({
        spacing: { after: 100, line: 276 },  // interlinea 1.15
        children: [
          new TextRun({
            text:  trimmed.trim(),
            size:  21,
            font:  'Calibri',
            color: '1a1a1a',
          }),
        ],
      })
    )
  })

  // ── 4. Intestazione ───────────────────────────────────────────────────────
  const headerParagraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { after: 160 },
      children:  [
        new TextRun({
          text:  docName,
          bold:  true,
          size:  40,
          color: DOCX.primary,
          font:  'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { after: 100 },
      children:  [
        new TextRun({
          text:    `Template: ${tmplName}`,
          size:    20,
          color:   DOCX.secondary,
          italics: true,
          font:    'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { after: 100 },
      children:  [
        new TextRun({
          text:  `Stato: ${STATUS_IT[document.status] || document.status}`,
          size:  18,
          color: DOCX.secondary,
          font:  'Calibri',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing:   { after: 400 },
      children:  [
        new TextRun({
          text:  `Generato il ${new Date().toLocaleDateString('it-IT', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}`,
          size:  18,
          color: DOCX.secondary,
          font:  'Calibri',
        }),
      ],
    }),
    // Separatore
    new Paragraph({
      spacing: { after: 320 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size:  2,
          color: DOCX.primary,
        },
      },
      children: [new TextRun('')],
    }),
  ]

  // ── 5. Footer ─────────────────────────────────────────────────────────────
  const footerParagraph = new Paragraph({
    spacing: { before: 480 },
    border: {
      top: {
        style: BorderStyle.SINGLE,
        size:  1,
        color: DOCX.border,
      },
    },
    children: [
      new TextRun({
        text:  `${docName}   |   Stato: ${STATUS_IT[document.status] || document.status}   |   ID: ${document.id}`,
        size:  16,
        color: DOCX.secondary,
        font:  'Calibri',
      }),
    ],
  })

  // ── 6. Assembla documento ─────────────────────────────────────────────────
  const doc = new DocxDocument({
    creator:     'Krea4u CRM',
    title:       docName,
    description: `Documento generato da template: ${tmplName}`,
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 21,
          },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top:    1440,   // 1 inch
            bottom: 1440,
            left:   1440,
            right:  1440,
          },
        },
      },
      children: [
        ...headerParagraphs,
        ...bodyParagraphs,
        footerParagraph,
      ],
    }],
  })

  // ── 7. Download ───────────────────────────────────────────────────────────
  const buffer   = await Packer.toBlob(doc)
  const fileName = `${docName.replace(/\s+/g, '_')}_${
    new Date().toISOString().slice(0, 10)
  }.docx`
  saveAs(buffer, fileName)
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE UI — pulsante esporta JSON per TemplateList
// ─────────────────────────────────────────────────────────────────────────────

interface TemplateExportProps {
  template: Template
}

export default function TemplateExport({ template }: TemplateExportProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => exportTemplateAsJson(template)}
    >
      <Download className="h-4 w-4 mr-2" />
      Esporta JSON
    </Button>
  )
}