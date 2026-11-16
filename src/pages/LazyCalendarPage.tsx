import { lazy, Suspense } from 'react'
import { LoadingScreen } from '../components/ui/LoadingScreen'

// O calendário é pesado (FullCalendar + Temporal): só carrega quando a agenda abre.
const CalendarPage = lazy(() => import('./CalendarPage').then((m) => ({ default: m.CalendarPage })))

export function LazyCalendarPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CalendarPage />
    </Suspense>
  )
}
