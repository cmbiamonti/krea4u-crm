// src/lib/exportDashboardPDF.ts
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface DashboardStats {
  totalArtists: number
  totalProjects: number
  activeProjects: number
  totalVenues: number
}

interface RecentProject {
  id: string
  project_name: string
  status: string
  start_date: string | null
  venue?: {
    venue_name: string
  } | null
}

interface DashboardData {
  stats: DashboardStats
  recentProjects: RecentProject[]
  recentArtists?: any[]
  upcomingEvents?: any[]
}

export const exportDashboardToPDF = async (data: DashboardData) => {
  const doc = new jsPDF()
  let yPos = 20

  // === HEADER ===
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text('Dashboard Report', 14, yPos)
  yPos += 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generato il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}`, 14, yPos)
  yPos += 15
  doc.setTextColor(0)

  // Divider
  doc.setDrawColor(200)
  doc.line(14, yPos, 196, yPos)
  yPos += 10

  // === STATISTICHE GENERALI ===
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('STATISTICHE GENERALI', 14, yPos)
  yPos += 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)

  // Box per ogni statistica
  const statsData = [
    { label: 'Totale Artisti', value: data.stats.totalArtists, color: [59, 130, 246] },
    { label: 'Totale Progetti', value: data.stats.totalProjects, color: [16, 185, 129] },
    { label: 'Progetti Attivi', value: data.stats.activeProjects, color: [245, 158, 11] },
    { label: 'Totale Venues', value: data.stats.totalVenues, color: [139, 92, 246] },
  ]

  const boxWidth = 43
  const boxHeight = 25
  const spacing = 5
  let xPos = 14

  statsData.forEach((stat, _index) => {
    // Background box
    doc.setFillColor(stat.color[0], stat.color[1], stat.color[2])
    doc.roundedRect(xPos, yPos, boxWidth, boxHeight, 3, 3, 'F')

    // Label
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.text(stat.label, xPos + boxWidth / 2, yPos + 8, { align: 'center' })

    // Value
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(stat.value.toString(), xPos + boxWidth / 2, yPos + 18, { align: 'center' })
    doc.setFont('helvetica', 'normal')

    xPos += boxWidth + spacing
    doc.setTextColor(0)
  })

  yPos += boxHeight + 15

  // === PROGETTI RECENTI ===
  if (data.recentProjects && data.recentProjects.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('PROGETTI RECENTI', 14, yPos)
    yPos += 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    data.recentProjects.slice(0, 10).forEach((project, _index) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }

      // Project box
      doc.setDrawColor(200)
      doc.rect(14, yPos - 3, 182, 18)

      // Project name
      doc.setFont('helvetica', 'bold')
      doc.text(project.project_name.substring(0, 50), 16, yPos + 3)
      doc.setFont('helvetica', 'normal')

      // Status badge
      const statusColors: Record<string, number[]> = {
        planning: [59, 130, 246],
        active: [16, 185, 129],
        in_progress: [245, 158, 11],
        completed: [139, 92, 246],
        cancelled: [239, 68, 68],
      }

      const statusColor = statusColors[project.status] || [156, 163, 175]
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
      doc.roundedRect(16, yPos + 6, 20, 6, 1, 1, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.text(project.status.toUpperCase(), 26, yPos + 10, { align: 'center' })
      doc.setTextColor(0)
      doc.setFontSize(10)

      // Venue
      if (project.venue) {
        doc.setTextColor(100)
        doc.text(`Venue: ${project.venue.venue_name}`, 40, yPos + 10)
        doc.setTextColor(0)
      }

      // Date
      if (project.start_date) {
        doc.setTextColor(100)
        const dateStr = new Date(project.start_date).toLocaleDateString('it-IT')
        doc.text(dateStr, 170, yPos + 10)
        doc.setTextColor(0)
      }

      yPos += 20
    })

    yPos += 5
  }

  // === ARTISTI RECENTI ===
  if (data.recentArtists && data.recentArtists.length > 0) {
    if (yPos > 200) {
      doc.addPage()
      yPos = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('ARTISTI AGGIUNTI DI RECENTE', 14, yPos)
    yPos += 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    data.recentArtists.slice(0, 5).forEach((artist) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }

      doc.text(`• ${artist.first_name} ${artist.last_name}`, 14, yPos)
      yPos += 5

      if (artist.artist_name) {
        doc.setTextColor(100)
        doc.setFontSize(9)
        doc.text(`  "${artist.artist_name}"`, 14, yPos)
        yPos += 5
        doc.setFontSize(10)
        doc.setTextColor(0)
      }

      if (artist.city && artist.nationality) {
        doc.setTextColor(100)
        doc.text(`  ${artist.city}, ${artist.nationality}`, 14, yPos)
        yPos += 5
        doc.setTextColor(0)
      }

      yPos += 3
    })
  }

  // === SUMMARY ===
  if (yPos > 240) {
    doc.addPage()
    yPos = 20
  }

  yPos += 10
  doc.setDrawColor(200)
  doc.line(14, yPos, 196, yPos)
  yPos += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('RIEPILOGO', 14, yPos)
  yPos += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const summary = [
    `Database contiene ${data.stats.totalArtists} artisti`,
    `${data.stats.totalProjects} progetti totali (${data.stats.activeProjects} attivi)`,
    `${data.stats.totalVenues} spazi espositivi catalogati`,
    `Report generato il ${new Date().toLocaleDateString('it-IT')}`,
  ]

  summary.forEach((line) => {
    doc.text(`• ${line}`, 14, yPos)
    yPos += 6
  })

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)

    doc.text(
      'Dashboard Report - Krea4u',
      14,
      doc.internal.pageSize.height - 10
    )

    doc.text(
      `Pagina ${i} di ${pageCount}`,
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    )

    doc.setTextColor(0)
  }

  // === SAVE ===
  const fileName = `dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)

  return fileName
}