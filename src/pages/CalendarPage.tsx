import { TeamCalendar } from '../components/calendar/TeamCalendar'
import { FormMessage } from '../components/ui/FormMessage'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { useCategories } from '../hooks/useCategories'

export function CalendarPage() {
  const { categories, error: categoriesError } = useCategories()
  const { fetchEvents, error: eventsError } = useCalendarEvents()
  const error = eventsError ?? categoriesError

  return (
    <>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <TeamCalendar categories={categories} fetchEvents={fetchEvents} />
    </>
  )
}
