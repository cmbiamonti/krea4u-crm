import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Download, 
  FileText, 
  Table as TableIcon, 
  FileJson,
  Loader2 
} from 'lucide-react'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'
import type { EmailThread, EmailMessage } from '@/types/email.types'

interface EmailExportProps {
  threads: EmailThread[]
  selectedThreads?: string[]
}

export default function EmailExport({ threads, selectedThreads }: EmailExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json'>('pdf')
  const [includeAttachments, setIncludeAttachments] = useState(false)

  const getExportData = () => {
    if (selectedThreads && selectedThreads.length > 0) {
      return threads.filter(t => selectedThreads.includes(t.thread_id))
    }
    return threads
  }

  const exportToPDF = async () => {
    try {
      const data = getExportData()
      const doc = new jsPDF()

      // Title
      doc.setFontSize(20)
      doc.text('Email Export - La Stanza dell\'Arte', 14, 20)

      doc.setFontSize(10)
      doc.text(`Esportato il ${new Date().toLocaleDateString('it-IT')}`, 14, 30)
      doc.text(`Totale conversazioni: ${data.length}`, 14, 35)

      let yPos = 45

      // Per ogni thread
      data.forEach((thread, index) => {
        if (yPos > 260) {
          doc.addPage()
          yPos = 20
        }

        // Thread header
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        
        // Trunc subject if too long
        const subject = thread.subject.length > 60 
          ? thread.subject.substring(0, 57) + '...'
          : thread.subject
        
        doc.text(`${index + 1}. ${subject}`, 14, yPos)
        yPos += 7

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.text(`Partecipanti: ${thread.participants.slice(0, 3).join(', ')}`, 14, yPos)
        yPos += 5
        doc.text(`Messaggi: ${thread.message_count}`, 14, yPos)
        yPos += 10

        // Messages
        thread.messages.forEach((msg) => {
          if (yPos > 260) {
            doc.addPage()
            yPos = 20
          }

          // Message header
          doc.setFillColor(245, 245, 245)
          doc.rect(14, yPos, 182, 8, 'F')

          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.text(msg.sender_name || msg.sender_email, 16, yPos + 5)

          doc.setFont('helvetica', 'normal')
          const dateStr = new Date(msg.created_at).toLocaleDateString('it-IT')
          doc.text(dateStr, 160, yPos + 5)

          yPos += 10

          // Body (first 100 chars)
          const bodyText = msg.body_text.substring(0, 100).replace(/\n/g, ' ')
          const bodyLines = doc.splitTextToSize(bodyText, 170)
          doc.text(bodyLines.slice(0, 2), 16, yPos)
          yPos += (Math.min(bodyLines.length, 2) * 5) + 8
        })

        yPos += 5
      })

      // Save
      doc.save(`email-export-${Date.now()}.pdf`)
      toast.success('PDF esportato con successo')
    } catch (error: any) {
      console.error('Error exporting PDF:', error)
      toast.error('Errore nell\'export PDF')
    }
  }

  const exportToCSV = async () => {
    try {
      const data = getExportData()
      const messages: EmailMessage[] = data.flatMap(t => t.messages)

      const headers = [
        'Data',
        'Mittente',
        'Email Mittente',
        'Destinatari',
        'Oggetto',
        'Corpo',
        'Status',
        'Direzione'
      ]

      const rows = messages.map(m => [
        new Date(m.created_at).toLocaleString('it-IT'),
        m.sender_name || '',
        m.sender_email,
        m.to_emails.join('; '),
        m.subject || 'N/D',
        m.body_text.replace(/"/g, '""').replace(/\n/g, ' ').substring(0, 200),
        m.status || 'N/D',
        m.direction
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `email-export-${Date.now()}.csv`
      link.click()

      toast.success('CSV esportato con successo')
    } catch (error: any) {
      console.error('Error exporting CSV:', error)
      toast.error('Errore nell\'export CSV')
    }
  }

  const exportToJSON = async () => {
    try {
      const data = getExportData()

      const exportData = {
        exported_at: new Date().toISOString(),
        total_threads: data.length,
        total_messages: data.reduce((sum, t) => sum + t.message_count, 0),
        threads: data.map(thread => ({
          thread_id: thread.thread_id,
          subject: thread.subject,
          participants: thread.participants,
          message_count: thread.message_count,
          messages: thread.messages.map(m => ({
            id: m.id,
            sender_email: m.sender_email,
            sender_name: m.sender_name,
            to_emails: m.to_emails,
            cc_emails: m.cc_emails,
            subject: m.subject,
            body_text: m.body_text,
            body_html: m.body_html,
            status: m.status ,
            direction: m.direction,
            sent_at: m.sent_at,
            delivered_at: m.delivered_at,
            opened_at: m.opened_at,
            created_at: m.created_at,
            attachments: includeAttachments ? (m.attachments || []) : []
          }))
        }))
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `email-export-${Date.now()}.json`
      link.click()

      toast.success('JSON esportato con successo')
    } catch (error: any) {
      console.error('Error exporting JSON:', error)
      toast.error('Errore nell\'export JSON')
    }
  }

  const handleExport = async () => {
    setExporting(true)

    try {
      switch (format) {
        case 'pdf':
          await exportToPDF()
          break
        case 'csv':
          await exportToCSV()
          break
        case 'json':
          await exportToJSON()
          break
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExporting(false)
    }
  }

  const exportCount = selectedThreads?.length || threads.length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Esporta
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Esporta Email</DialogTitle>
          <DialogDescription>
            Esporta {exportCount} conversazion{exportCount > 1 ? 'i' : 'e'} in vari formati
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Formato</Label>
            <div className="grid grid-cols-3 gap-2">
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  format === 'pdf' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setFormat('pdf')}
              >
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="font-medium text-sm">PDF</div>
                  <div className="text-xs text-gray-500">Documento</div>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-all ${
                  format === 'csv' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setFormat('csv')}
              >
                <div className="text-center">
                  <TableIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-medium text-sm">CSV</div>
                  <div className="text-xs text-gray-500">Tabella</div>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-all ${
                  format === 'json' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setFormat('json')}
              >
                <div className="text-center">
                  <FileJson className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium text-sm">JSON</div>
                  <div className="text-xs text-gray-500">Dati raw</div>
                </div>
              </Card>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Opzioni</Label>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attachments"
                  checked={includeAttachments}
                  onCheckedChange={(checked) => setIncludeAttachments(checked as boolean)}
                />
                <label
                  htmlFor="attachments"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Includi informazioni allegati
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Gli allegati non vengono scaricati, solo le informazioni
              </p>
            </Card>
          </div>

          {/* Summary */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-sm space-y-1">
              <div className="font-semibold text-blue-900">Riepilogo Export:</div>
              <div className="text-blue-800">
                • Conversazioni: {exportCount}
              </div>
              <div className="text-blue-800">
                • Messaggi totali: {threads.reduce((sum, t) => sum + t.message_count, 0)}
              </div>
              <div className="text-blue-800">
                • Formato: {format.toUpperCase()}
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annulla
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Esportazione...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Esporta {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}