// src/components/dashboard/CalendarView.tsx

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'project' | 'task'
  status?: string | null
  priority?: string
  projectName?: string
  projectId?: string // ← AGGIUNGI
}

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
}

export default function CalendarView({ events = [], onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const getEventColor = (event: CalendarEvent) => {
    if (event.type === 'project') {
      switch (event.status) {
        case 'planning': return 'bg-blue-500'
        case 'active': return 'bg-green-500'
        case 'in_progress': return 'bg-yellow-500'
        case 'completed': return 'bg-purple-500'
        case 'archived': return 'bg-gray-500'
        case 'cancelled': return 'bg-red-500'
        default: return 'bg-gray-500'
      }
    } else {
      // Task
      if (event.status === 'done') return 'bg-green-500'
      if (event.status === 'in_progress') return 'bg-yellow-500'
      
      switch (event.priority) {
        case 'high': return 'bg-red-500'
        case 'medium': return 'bg-yellow-500'
        case 'low': return 'bg-gray-500'
        default: return 'bg-blue-500'
      }
    }
  }

  const getEventIcon = (event: CalendarEvent) => {
    if (event.type === 'project') {
      return <CalendarIcon className="h-3 w-3" />
    } else {
      // Task icons based on status and priority
      if (event.status === 'done') {
        return <CheckCircle2 className="h-3 w-3" />
      }
      if (event.status === 'in_progress') {
        return <Circle className="h-3 w-3 fill-current" />
      }
      if (event.priority === 'high') {
        return <AlertCircle className="h-3 w-3" />
      }
      return <Circle className="h-3 w-3" />
    }
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isPastDate = (day: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const checkDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )
    
    return checkDate < today
  }

  const days = []
  
  // Empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 border border-gray-100 bg-gray-50" />)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day)
    const isTodayDate = isToday(day)
    const isPast = isPastDate(day)

    days.push(
      <div
        key={day}
        className={`min-h-24 p-2 border border-gray-100 hover:bg-gray-50 transition-colors ${
          isTodayDate ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : ''
        } ${isPast && !isTodayDate ? 'bg-gray-50 opacity-60' : ''}`}
      >
        <div className={`text-sm font-semibold mb-1 ${
          isTodayDate ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-700'
        }`}>
          {day}
          {isTodayDate && (
            <Badge variant="default" className="ml-1 text-[10px] px-1 py-0">
              Oggi
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick?.(event)}
              className={`text-xs px-2 py-1 rounded cursor-pointer text-white ${getEventColor(event)} hover:opacity-80 transition-opacity flex items-center gap-1 shadow-sm`}
              title={
                event.type === 'task' 
                  ? `📋 ${event.title}\n` +
                    `📁 ${event.projectName || 'Senza Progetto'}\n` +
                    `⚡ Priorità: ${event.priority?.toUpperCase() || 'N/D'}\n` +
                    `✓ Status: ${event.status === 'done' ? 'Completato' : event.status === 'in_progress' ? 'In Corso' : 'Da Fare'}\n` +
                    `📅 Scadenza: ${event.date.toLocaleDateString('it-IT')}\n` +
                    `🖱️ Click per aprire`
                  : `📌 ${event.title}\n` +
                    `Status: ${event.status || 'N/D'}\n` +
                    `📅 ${event.date.toLocaleDateString('it-IT')}\n` +
                    `🖱️ Click per aprire`
              }
            >
              {getEventIcon(event)}
              <span className="truncate flex-1">{event.title}</span>
            </div>
          ))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-gray-500 px-2 font-medium">
              +{dayEvents.length - 3} altro/i
            </div>
          )}
        </div>
      </div>
    )
  }

  // ✅ Calcola statistiche del mese corrente
  const currentMonthEvents = events.filter(e => {
    const eventDate = new Date(e.date)
    return (
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    )
  })

  const projectsCount = currentMonthEvents.filter(e => e.type === 'project').length
  const tasksCount = currentMonthEvents.filter(e => e.type === 'task').length
  const completedTasksCount = currentMonthEvents.filter(e => e.type === 'task' && e.status === 'done').length

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-heading font-semibold">
          Calendario Eventi
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Oggi
          </Button>
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold min-w-48 text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 mb-4 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-blue-500" />
          <span className="text-gray-600">Progetto</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-yellow-500" />
          <span className="text-gray-600">Task da fare</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-gray-600">Task completato</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-gray-600">Alta priorità</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
        {/* Day headers */}
        {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day) => (
          <div
            key={day}
            className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-600"
          >
            {day}
          </div>
        ))}
        {/* Days */}
        {days}
      </div>

      {/* Event count summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{projectsCount}</div>
            <div className="text-gray-600">Progetti</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{tasksCount}</div>
            <div className="text-gray-600">Tasks totali</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedTasksCount}</div>
            <div className="text-gray-600">Tasks completati</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{currentMonthEvents.length}</div>
            <div className="text-gray-600">Eventi totali</div>
          </div>
        </div>
      </div>

      {/* No events message */}
      {currentMonthEvents.length === 0 && (
        <div className="mt-4 text-center text-gray-500 py-8">
          <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>Nessun evento programmato per questo mese</p>
        </div>
      )}
    </Card>
  )
}