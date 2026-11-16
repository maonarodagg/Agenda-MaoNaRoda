import FullCalendar, { type EventSourceFuncInfo } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import timeGridPlugin from '@fullcalendar/react/timegrid'
import ptBrLocale from '@fullcalendar/react/locales/pt-br'
import classicThemePlugin from '@fullcalendar/react/themes/classic'
import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/classic/theme.css'
import './calendarTheme.css'
import { useCallback, useMemo } from 'react'
import { APP_TIME_ZONE } from '../../domain/dates'
import type { CalendarEvent, Category, DateRange } from '../../domain/events'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { toEventInput } from './toEventInput'
import styles from './TeamCalendar.module.css'

const VIEWS = 'dayGridMonth,timeGridWeek,timeGridDay'

interface TeamCalendarProps {
  categories: Category[]
  fetchEvents: (range: DateRange) => Promise<CalendarEvent[]>
}

// Calendário da equipe: mês, semana e dia (RF-07), em pt-BR e no fuso de Brasília.
export function TeamCalendar({ categories, fetchEvents }: TeamCalendarProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const loadEvents = useCallback(
    async (info: EventSourceFuncInfo) => {
      const events = await fetchEvents({ start: info.start, end: info.end })
      return events.map((e) => toEventInput(e, categoriesById))
    },
    [fetchEvents, categoriesById],
  )

  return (
    <div className={`agenda-calendar ${styles.wrapper}`}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, classicThemePlugin]}
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
        events={loadEvents}
      />
    </div>
  )
}
