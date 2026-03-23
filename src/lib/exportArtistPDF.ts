import { Artist } from '@/types/artist'
import {
  createPDF,
  addHeader,
  addSection,
  addField,
  addMultilineText,
  checkPageBreak,
  addFooters,
  formatDateIT,
  formatCurrency,
} from './pdfExport'

export const exportArtistToPDF = async (artist: Artist) => {
  const doc = createPDF({
    title: `Portfolio - ${artist.first_name} ${artist.last_name}`,
    author: 'Krea4U CRM',
  })

  const displayName = artist.artist_name || `${artist.first_name} ${artist.last_name}`

  // === HEADER ===
  let yPos = addHeader(
    doc,
    displayName,
    artist.artist_name ? `${artist.first_name} ${artist.last_name}` : undefined
  )

  // Medium subtitle
  if (artist.medium && artist.medium.length > 0) {
    doc.setTextColor(100)
    doc.setFontSize(11)
    doc.text(artist.medium.join(', '), 14, yPos)
    yPos += 10
    doc.setTextColor(0)
  }

  // === CONTATTI ===
  yPos = checkPageBreak(doc, yPos)
  yPos = addSection(doc, 'CONTATTI', yPos)

  if (artist.email) yPos = addField(doc, 'Email', artist.email, yPos)
  if (artist.phone) yPos = addField(doc, 'Telefono', artist.phone, yPos)
  if (artist.website) yPos = addField(doc, 'Website', artist.website, yPos)
  if (artist.instagram_handle)
    yPos = addField(doc, 'Instagram', artist.instagram_handle, yPos)

  yPos += 5

  // === LOCALIZZAZIONE ===
  if (artist.nationality || artist.city || artist.birth_date) {
    yPos = checkPageBreak(doc, yPos)
    yPos = addSection(doc, 'LOCALIZZAZIONE E DATI', yPos)

    if (artist.nationality)
      yPos = addField(doc, 'Nazionalità', artist.nationality, yPos)
    if (artist.city) yPos = addField(doc, 'Città', artist.city, yPos)
    if (artist.birth_date)
      yPos = addField(doc, 'Data di nascita', formatDateIT(artist.birth_date), yPos)

    yPos += 5
  }

  // === INFORMAZIONI ARTISTICHE ===
  yPos = checkPageBreak(doc, yPos)
  yPos = addSection(doc, 'INFORMAZIONI ARTISTICHE', yPos)

  if (artist.medium && artist.medium.length > 0)
    yPos = addField(doc, 'Medium', artist.medium.join(', '), yPos)

  if (artist.style_tags && artist.style_tags.length > 0)
    yPos = addField(doc, 'Stili', artist.style_tags.join(', '), yPos)

  if (artist.price_range)
    yPos = addField(doc, 'Fascia prezzo', artist.price_range, yPos)

  if (artist.availability_status) {
    const statusLabels: Record<string, string> = {
      available: 'Disponibile',
      busy: 'Impegnato',
      on_hold: 'In Pausa',
    }
    yPos = addField(
      doc,
      'Disponibilità',
      statusLabels[artist.availability_status] || artist.availability_status,
      yPos
    )
  }

  if (artist.insurance_value)
    yPos = addField(
      doc,
      'Valore assicurato',
      formatCurrency(artist.insurance_value),
      yPos
    )

  yPos += 5

  // === BIOGRAFIA ===
  if (artist.bio) {
    yPos = checkPageBreak(doc, yPos, 40)
    yPos = addSection(doc, 'BIOGRAFIA', yPos)
    yPos = addMultilineText(doc, artist.bio, yPos)
    yPos += 10
  }

  // === ARTIST STATEMENT ===
  if (artist.artist_statement) {
    yPos = checkPageBreak(doc, yPos, 40)
    yPos = addSection(doc, 'ARTIST STATEMENT', yPos)
    doc.setTextColor(80)
    yPos = addMultilineText(doc, artist.artist_statement, yPos)
    doc.setTextColor(0)
    yPos += 10
  }

  // === STORIA ESPOSITIVA ===
  if (artist.exhibition_history) {
    yPos = checkPageBreak(doc, yPos, 40)
    yPos = addSection(doc, 'STORIA ESPOSITIVA', yPos)
    yPos = addMultilineText(doc, artist.exhibition_history, yPos)
    yPos += 10
  }

  // === LOGISTICA ===
  if (artist.shipping_preferences) {
    yPos = checkPageBreak(doc, yPos, 40)
    yPos = addSection(doc, 'LOGISTICA E SPEDIZIONE', yPos)
    yPos = addMultilineText(doc, artist.shipping_preferences, yPos)
    yPos += 10
  }

  // === PORTFOLIO IMMAGINI ===
  if (artist.images && artist.images.length > 0) {
    doc.addPage()
    yPos = 20

    yPos = addSection(doc, 'PORTFOLIO', yPos)
    doc.text(`Totale opere: ${artist.images.length}`, 14, yPos)
    yPos += 10

    artist.images.forEach((image, index) => {
      yPos = checkPageBreak(doc, yPos)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`Opera ${index + 1}`, 14, yPos)
      yPos += 6
      doc.setFont('helvetica', 'normal')

      if (image.caption) {
        yPos = addMultilineText(doc, image.caption, yPos)
      }

      doc.setTextColor(100)
      doc.text(`URL: ${image.image_url}`, 14, yPos)
      yPos += 5
      doc.setTextColor(0)

      yPos += 8
    })
  }

  // === SOCIAL MEDIA ===
  if (artist.instagram_handle) {
    yPos = checkPageBreak(doc, yPos)
    yPos = addSection(doc, 'SOCIAL MEDIA', yPos)

    doc.text(`Instagram: ${artist.instagram_handle}`, 14, yPos)
    yPos += 4
    doc.setTextColor(100)
    doc.setFontSize(9)
    doc.text(
      `https://instagram.com/${artist.instagram_handle.replace('@', '')}`,
      14,
      yPos
    )
    doc.setFontSize(10)
    doc.setTextColor(0)
    yPos += 10
  }

  // === FOOTER ===
  addFooters(doc, `Portfolio di ${displayName}`)

  // === SAVE ===
  const fileName = `portfolio-${artist.first_name}-${artist.last_name}-${
    new Date().toISOString().split('T')[0]
  }.pdf`

  doc.save(fileName)

  return fileName
}