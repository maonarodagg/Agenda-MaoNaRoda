import { useState } from 'react'
import { TeamCalendar } from '../components/calendar/TeamCalendar'
import { EventDialog, type EventDialogState } from '../components/events/EventDialog'
import { Button } from '../components/ui/Button'
import { FormMessage } from '../components/ui/FormMessage'
import { draftFromSelection, emptyDraft } from '../domain/eventDraft'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { useCategories } from '../hooks/useCategories'
import { useTeamMembers } from '../hooks/useTeamMembers'
import styles from './CalendarPage.module.css'

export function CalendarPage() {
  const { categories, error: categoriesError } = useCategories()
  const { members } = useTeamMembers()
  const { fetchEvents, error: eventsError } = useCalendarEvents()
  const [dialog, setDialog] = useState<EventDialogState | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const error = eventsError ?? categoriesError

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>Agenda</h1>
        <Button onClick={() => setDialog({ mode: 'create', draft: emptyDraft() })}>+ Novo evento</Button>
      </div>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <TeamCalendar
        categories={categories}
        fetchEvents={fetchEvents}
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
