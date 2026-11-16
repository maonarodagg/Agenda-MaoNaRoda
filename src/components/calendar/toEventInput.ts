import type { EventInput } from '@fullcalendar/react'
import { toZonedDateString } from '../../domain/dates'
import type { CalendarEvent, Category } from '../../domain/events'

const DEFAULT_COLOR = 'var(--color-brand)'

// Converte nosso evento no formato do FullCalendar.
export function toEventInput(event: CalendarEvent, categoriesById: Map<string, Category>): EventInput {
  const category = event.categoryId ? categoriesById.get(event.categoryId) : undefined
  const base = {
    id: event.id,
    title: event.title,
    color: category?.color ?? DEFAULT_COLOR,
    contrastColor: '#ffffff',
    extendedProps: { visibility: event.visibility },
  }

  // Dia inteiro: datas sem hora, no fuso de Brasília (fim exclusivo).
  if (event.allDay) {
    return { ...base, allDay: true, start: toZonedDateString(event.startAt), end: toZonedDateString(event.endAt) }
  }
  return { ...base, allDay: false, start: event.startAt, end: event.endAt }
}
