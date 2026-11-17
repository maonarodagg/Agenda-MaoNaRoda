import { useCallback, useState } from 'react'
import { CalendarFilters } from '../components/calendar/CalendarFilters'
import { TeamCalendar } from '../components/calendar/TeamCalendar'
import { EventDialog, type EventDialogState } from '../components/events/EventDialog'
import { Button } from '../components/ui/Button'
import { FormMessage } from '../components/ui/FormMessage'
import { draftFromSelection, emptyDraft } from '../domain/eventDraft'
import type { DateRange } from '../domain/events'
import { DEFAULT_FILTER, matchesFilter, type CalendarFilter } from '../domain/filters'
import { useAuth } from '../hooks/useAuth'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { useCategories } from '../hooks/useCategories'
import { useTeamMembers } from '../hooks/useTeamMembers'
import styles from './CalendarPage.module.css'

export function CalendarPage() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const { categories, error: categoriesError } = useCategories()
  const { members } = useTeamMembers()
  const { fetchEvents, error: eventsError } = useCalendarEvents()
  const [filter, setFilter] = useState<CalendarFilter>(DEFAULT_FILTER)
  const [dialog, setDialog] = useState<EventDialogState | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const error = eventsError ?? categoriesError

  // Mudou o filtro -> nova função -> o calendário busca de novo já filtrado.
  const fetchFiltered = useCallback(
    async (range: DateRange) => (await fetchEvents(range)).filter((e) => matchesFilter(e, filter, userId)),
    [fetchEvents, filter, userId],
  )

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>Agenda</h1>
        <div className={styles.actions}>
          <Button variant="soft" onClick={() => setRefreshKey((k) => k + 1)} aria-label="Atualizar agenda">
            ↻ Atualizar
          </Button>
          <Button onClick={() => setDialog({ mode: 'create', draft: emptyDraft() })}>+ Novo evento</Button>
        </div>
      </div>
      <CalendarFilters
        filter={filter}
        members={members}
        categories={categories}
        currentUserId={userId}
        onChange={setFilter}
      />
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <TeamCalendar
        categories={categories}
        fetchEvents={fetchFiltered}
        refreshKey={refreshKey}
        onSelectSlot={(sel) => setDialog({ mode: 'create', draft: draftFromSelection(sel) })}
        onEventClick={(event) => setDialog({ mode: 'view', event })}
      />
      {dialog && (
        <EventDialog
          // key: cada abertura começa do zero
          key={dialog.mode === 'view' ? dialog.event.id : `new-${dialog.draft.startDate}-${dialog.draft.startTime}`}
          state={dialog}
          categories={categories}
          members={members}
          onClose={() => setDialog(null)}
          onChanged={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  )
}
