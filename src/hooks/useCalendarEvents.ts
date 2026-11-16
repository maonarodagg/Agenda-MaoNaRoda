import { useCallback, useState } from 'react'
import type { CalendarEvent, DateRange } from '../domain/events'
import { listEventsInRange } from '../services/events'

// Busca eventos por intervalo (o calendário chama quando muda de período).
export function useCalendarEvents() {
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async (range: DateRange): Promise<CalendarEvent[]> => {
    try {
      const events = await listEventsInRange(range)
      setError(null)
      return events
    } catch (e) {
      setError('Não foi possível carregar os eventos. Tente de novo.')
      throw e
    }
  }, [])

  return { fetchEvents, error }
}
