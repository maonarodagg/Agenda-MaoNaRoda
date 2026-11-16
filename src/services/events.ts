import type { CalendarEvent, DateRange } from '../domain/events'
import { supabase } from '../lib/supabase'

const EVENT_COLUMNS =
  'id, title, description, start_at, end_at, all_day, location, category_id, visibility, created_by, participants:event_participants(user_id, left_at)'

// Eventos que cruzam o intervalo [start, end). A RLS já filtra o que a pessoa pode ver.
export async function listEventsInRange(range: DateRange): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .lt('start_at', range.end.toISOString())
    .gt('end_at', range.start.toISOString())
    .order('start_at')
  if (error) throw error

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    startAt: row.start_at,
    endAt: row.end_at,
    allDay: row.all_day,
    location: row.location,
    categoryId: row.category_id,
    visibility: row.visibility,
    createdBy: row.created_by,
    participantIds: row.participants.filter((p) => p.left_at === null).map((p) => p.user_id),
  }))
}
