// src/lib/exportVenuePDF.ts
import { Venue } from '@/types/venue'
import {
  createPDF,
  addHeader,
  addSection,
  addField,
  addMultilineText,
  checkPageBreak,
  addFooters,
  formatCurrency,
} from './pdfExport'

export const exportVenueToPDF = async (venue: Venue) => {
  const doc = createPDF({
    title: `Scheda Tecnica - ${venue.venue_name}`,
    author: 'Krea4u',
  })

  // === HEADER ===
  let yPos = addHeader(doc, venue.venue_name, venue.venue_type || undefined)

  // === LOCALIZZAZIONE ===
  yPos = checkPageBreak(doc, yPos)
  yPos = addSection(doc, 'LOCALIZZAZIONE', yPos)

  if (venue.address) yPos = addField(doc, 'Indirizzo', venue.address, yPos)
  if (venue.city) yPos = addField(doc, 'Città', venue.city, yPos)
  if (venue.neighborhood)
    yPos = addField(doc, 'Quartiere', venue.neighborhood, yPos)
  if (venue.postal_code) yPos = addField(doc, 'CAP', venue.postal_code, yPos)
  if (venue.country) yPos = addField(doc, 'Paese', venue.country, yPos)

  // GPS coordinates
  if (venue.latitude && venue.longitude) {
    doc.setTextColor(100)
    doc.setFontSize(9)
    doc.text(`GPS: ${venue.latitude}, ${venue.longitude}`, 14, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setTextColor(0)
  }

  yPos += 5

  // === CONTATTI ===
  yPos = checkPageBreak(doc, yPos)
  yPos = addSection(doc, 'CONTATTI', yPos)

  if (venue.contact_name)
    yPos = addField(doc, 'Referente', venue.contact_name, yPos)
  if (venue.contact_email || venue.email)
    yPos = addField(doc, 'Email', venue.contact_email || venue.email || '', yPos)
  if (venue.contact_phone || venue.phone)
    yPos = addField(doc, 'Telefono', venue.contact_phone || venue.phone || '', yPos)
  if (venue.website) yPos = addField(doc, 'Website', venue.website, yPos)

  yPos += 5

  // === SPECIFICHE TECNICHE ===
  yPos = checkPageBreak(doc, yPos)
  yPos = addSection(doc, 'SPECIFICHE TECNICHE', yPos)

  if (venue.size_sqm) yPos = addField(doc, 'Dimensione', `${venue.size_sqm} m²`, yPos)
  if (venue.exhibition_space_sqm)
    yPos = addField(
      doc,
      'Spazio espositivo',
      `${venue.exhibition_space_sqm} m²`,
      yPos
    )
  if (venue.ceiling_height)
    yPos = addField(doc, 'Altezza soffitti', `${venue.ceiling_height} m`, yPos)
  if (venue.number_of_rooms)
    yPos = addField(doc, 'Numero sale', `${venue.number_of_rooms}`, yPos)
  if (venue.natural_light !== null)
    yPos = addField(doc, 'Luce naturale', venue.natural_light ? 'Sì' : 'No', yPos)
  if (venue.capacity)
    yPos = addField(doc, 'Capacità', `${venue.capacity} persone`, yPos)

  yPos += 5

  // === SERVIZI E DOTAZIONI ===
  if (venue.amenities && venue.amenities.length > 0) {
    yPos = checkPageBreak(doc, yPos, 30)
    yPos = addSection(doc, 'SERVIZI E DOTAZIONI', yPos)

    // Split into 2 columns
    const half = Math.ceil(venue.amenities.length / 2)
    const leftColumn = venue.amenities.slice(0, half)
    const rightColumn = venue.amenities.slice(half)

    leftColumn.forEach((amenity) => {
      doc.text(`• ${amenity}`, 14, yPos)
      yPos += 5
    })

    let yPosRight = yPos - leftColumn.length * 5
    rightColumn.forEach((amenity) => {
      doc.text(`• ${amenity}`, 110, yPosRight)
      yPosRight += 5
    })

    yPos = Math.max(yPos, yPosRight) + 5
  }

  // === PRICING ===
  if (venue.rental_fee || venue.pricing_model) {
    yPos = checkPageBreak(doc, yPos)
    yPos = addSection(doc, 'INFORMAZIONI PRICING', yPos)

    if (venue.pricing_model)
      yPos = addField(doc, 'Modello', venue.pricing_model, yPos)

    if (venue.rental_fee) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(59, 130, 246)
      doc.text(`Tariffa: ${formatCurrency(venue.rental_fee)}`, 14, yPos)
      doc.setTextColor(0)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      yPos += 10
    }

    if (venue.additional_costs) {
      doc.text('Costi aggiuntivi:', 14, yPos)
      yPos += 5
      doc.setTextColor(100)
      yPos = addMultilineText(doc, venue.additional_costs, yPos)
      doc.setTextColor(0)
      yPos += 5
    }

    if (venue.cancellation_policy) {
      doc.text('Politica di cancellazione:', 14, yPos)
      yPos += 5
      doc.setTextColor(100)
      yPos = addMultilineText(doc, venue.cancellation_policy, yPos)
      doc.setTextColor(0)
      yPos += 5
    }
  }

  // === DESCRIZIONE ===
  if (venue.description) {
    yPos = checkPageBreak(doc, yPos, 40)
    yPos = addSection(doc, 'DESCRIZIONE', yPos)
    yPos = addMultilineText(doc, venue.description, yPos)
    yPos += 10
  }

  // === REQUISITI TECNICI ===
  if (venue.technical_requirements) {
    yPos = checkPageBreak(doc, yPos, 40)
    yPos = addSection(doc, 'REQUISITI TECNICI', yPos)
    yPos = addMultilineText(doc, venue.technical_requirements, yPos)
    yPos += 10
  }

  // === ACCESSIBILITÀ ===
  if (venue.accessibility_features) {
    yPos = checkPageBreak(doc, yPos, 40)
    yPos = addSection(doc, 'ACCESSIBILITÀ', yPos)
    yPos = addMultilineText(doc, venue.accessibility_features, yPos)
    yPos += 10
  }

  // === REGOLAMENTO ===
  if (venue.house_rules) {
    yPos = checkPageBreak(doc, yPos, 40)
    yPos = addSection(doc, 'REGOLAMENTO', yPos)
    yPos = addMultilineText(doc, venue.house_rules, yPos)
    yPos += 10
  }

  // === DISPONIBILITÀ ===
  if (venue.available_from || venue.available_to) {
    yPos = checkPageBreak(doc, yPos)
    yPos = addSection(doc, 'DISPONIBILITÀ', yPos)

    if (venue.available_from)
      yPos = addField(
        doc,
        'Disponibile da',
        new Date(venue.available_from).toLocaleDateString('it-IT'),
        yPos
      )

    if (venue.available_to)
      yPos = addField(
        doc,
        'Disponibile fino a',
        new Date(venue.available_to).toLocaleDateString('it-IT'),
        yPos
      )
  }

  // === GALLERY ===
  if (venue.images && venue.images.length > 0) {
    doc.addPage()
    yPos = 20

    yPos = addSection(doc, 'GALLERY', yPos)
    doc.text(`Totale immagini: ${venue.images.length}`, 14, yPos)
    yPos += 10

    venue.images.forEach((image, index) => {
      yPos = checkPageBreak(doc, yPos)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`Immagine ${index + 1}`, 14, yPos)
      yPos += 6
      doc.setFont('helvetica', 'normal')

      if (image.caption) {
        yPos = addMultilineText(doc, image.caption, yPos)
        yPos += 3
      }

      doc.setTextColor(100)
      doc.setFontSize(9)
      doc.text(image.image_url, 14, yPos)
      doc.setFontSize(10)
      doc.setTextColor(0)
      yPos += 8
    })
  }

  // === MAPPA ===
  if (venue.latitude && venue.longitude) {
    yPos = checkPageBreak(doc, yPos)
    yPos = addSection(doc, 'RIFERIMENTO MAPPA', yPos)

    const googleMapsUrl = `https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`
    doc.text('Link Google Maps:', 14, yPos)
    yPos += 5
    doc.setTextColor(59, 130, 246)
    doc.setFontSize(9)
    yPos = addMultilineText(doc, googleMapsUrl, yPos, 180)
    doc.setTextColor(0)
    doc.setFontSize(10)
  }

  // === FOOTER ===
  addFooters(doc, `Scheda tecnica: ${venue.venue_name}`)

  // === SAVE ===
  const fileName = `venue-${venue.venue_name
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`

  doc.save(fileName)

  return fileName
}