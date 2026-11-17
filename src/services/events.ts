import type { EventPayload } from '../domain/eventDraft'
import type { CalendarEvent, DateRange } from '../domain/events'
import { supabase } from '../lib/supabase'

const EVENT_COLUMNS =
  'id, title, description, start_at, end_at, all_day, location, category_id, visibility, created_by, participants:event_participants(user_id, left_at), links:event_links(url, title, position)'

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
    links: [...row.links].sort((a, b) => a.position - b.position).map((l) => ({ url: l.url, title: l.title })),
  }))
}

// Cria ou atualiza o evento com participantes e links (uma transação no banco).
export async function saveEvent(p: EventPayload): Promise<string> {
  const { data, error } = await supabase.rpc('save_event', {
    p_id: p.id ?? undefined,
    p_title: p.title,
    p_description: p.description ?? undefined,
    p_start_at: p.startAt,
    p_end_at: p.endAt,
    p_all_day: p.allDay,
    p_location: p.location ?? undefined,
    p_category_id: p.categoryId ?? undefined,
    p_visibility: p.visibility,
    p_participant_ids: p.participantIds,
    p_links: p.links,
  })
  if (error) throw error
  return data
}

// Exclui de vez (a lixeira entra na Fase 4). Se nada foi apagado, não tinha permissão.
export async function deleteEvent(eventId: string): Promise<void> {
  const { data, error } = await supabase.from('events').delete().eq('id', eventId).select('id')
  if (error) throw error
  if (data.length === 0) throw new Error('not_allowed')
}
