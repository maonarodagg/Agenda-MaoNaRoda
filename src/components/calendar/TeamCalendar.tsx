import FullCalendar, {
  type CalendarRef,
  type DateSelectInfo,
  type EventClickInfo,
  type EventSourceFuncInfo,
} from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import interactionPlugin from '@fullcalendar/react/interaction'
import timeGridPlugin from '@fullcalendar/react/timegrid'
import ptBrLocale from '@fullcalendar/react/locales/pt-br'
import classicThemePlugin from '@fullcalendar/react/themes/classic'
import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/classic/theme.css'
import './calendarTheme.css'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { APP_TIME_ZONE } from '../../domain/dates'
import type { Selection } from '../../domain/eventDraft'
import type { CalendarEvent, Category, DateRange } from '../../domain/events'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { toEventInput } from './toEventInput'
import styles from './TeamCalendar.module.css'

const VIEWS = 'dayGridMonth,timeGridWeek,timeGridDay'

interface TeamCalendarProps {
  categories: Category[]
  fetchEvents: (range: DateRange) => Promise<CalendarEvent[]>
  refreshKey: number // muda -> recarrega os eventos
  onSelectSlot: (selection: Selection) => void
  onEventClick: (event: CalendarEvent) => void
}

// Calendário da equipe: mês, semana e dia (RF-07), em pt-BR e no fuso de Brasília.
// Clicar num horário vazio cria; clicar num evento abre os detalhes (RF-09).
export function TeamCalendar({ categories, fetchEvents, refreshKey, onSelectSlot, onEventClick }: TeamCalendarProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const calendarRef = useRef<CalendarRef>(null)
  // Últimos eventos carregados, pra achar o evento clicado.
  const loadedRef = useRef(new Map<string, CalendarEvent>())

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const loadEvents = useCallback(
    async (info: EventSourceFuncInfo) => {
      const events = await fetchEvents({ start: info.start, end: info.end })
      loadedRef.current = new Map(events.map((e) => [e.id, e]))
      return events.map((e) => toEventInput(e, categoriesById))
    },
    [fetchEvents, categoriesById],
  )

  useEffect(() => {
    if (refreshKey > 0) calendarRef.current?.getApi().refetchEvents()
  }, [refreshKey])

  const handleSelect = (info: DateSelectInfo) => {
    onSelectSlot({
      allDay: info.allDay,
      startIso: info.start.toISOString(),
      endIso: info.end.toISOString(),
      startDate: info.startStr.slice(0, 10),
      endDate: info.endStr.slice(0, 10),
    })
    calendarRef.current?.getApi().unselect()
  }

  const handleEventClick = (info: EventClickInfo) => {
    const event = loadedRef.current.get(info.event.id)
    if (event) onEventClick(event)
  }

  return (
    <div className={`agenda-calendar ${styles.wrapper}`}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, classicThemePlugin]}
        locale={ptBrLocale}
        timeZone={APP_TIME_ZONE}
        firstDay={0}
        initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
        headerToolbar={
          isMobile
            ? { start: 'prev,next', center: 'title', end: 'today' }
            : { start: 'prev,next today', center: 'title', end: VIEWS }
        }
        footerToolbar={isMobile ? { center: VIEWS } : false}
        // Título curto no celular pra caber numa linha (ex.: "16 de nov.")
        titleFormat={isMobile ? { day: 'numeric', month: 'short' } : undefined}
        views={isMobile ? { dayGridMonth: { titleFormat: { month: 'short', year: 'numeric' } } } : undefined}
        height="100%"
        nowIndicator
        dayMaxEvents
        scrollTime="07:00:00"
        selectable
        selectLongPressDelay={300}
        select={handleSelect}
        eventClick={handleEventClick}
        events={loadEvents}
      />
    </div>
  )
}
