import { Temporal } from 'temporal-polyfill'
import { APP_LOCALE, APP_TIME_ZONE } from './dates'
import type { CalendarEvent } from './events'

const dayFormat = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const timeFormat = new Intl.DateTimeFormat(APP_LOCALE, { timeZone: APP_TIME_ZONE, hour: '2-digit', minute: '2-digit' })

// Texto do período do evento, ex.: "seg., 16/11/2026, 09:00 – 09:30".
export function formatEventPeriod(e: CalendarEvent): string {
  const start = new Date(e.startAt)
  const end = new Date(e.endAt)

  if (e.allDay) {
    // Fim exclusivo: o último dia é o dia anterior ao fim.
    const lastDay = new Date(
      Temporal.Instant.from(e.endAt).toZonedDateTimeISO(APP_TIME_ZONE).subtract({ days: 1 }).epochMilliseconds,
    )
    const first = dayFormat.format(start)
    const last = dayFormat.format(lastDay)
    return first === last ? `${first} (dia inteiro)` : `${first} até ${last} (dia inteiro)`
  }

  const startDay = dayFormat.format(start)
  const endDay = dayFormat.format(end)
  if (startDay === endDay) return `${startDay}, ${timeFormat.format(start)} – ${timeFormat.format(end)}`
  return `${startDay}, ${timeFormat.format(start)} até ${endDay}, ${timeFormat.format(end)}`
}
