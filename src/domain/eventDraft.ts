import type { CalendarEvent, Visibility } from './events'
import { addDays, compareDates, instantToZoned, todayInAppZone, zonedToInstant } from './zonedTime'

// Estado do formulário de evento. Datas e horas em Brasília, como a pessoa vê.

export interface LinkDraft {
  url: string
  title: string
}

export interface EventDraft {
  id: string | null
  title: string
  description: string
  allDay: boolean
  startDate: string
  startTime: string
  endDate: string // no dia inteiro, é o último dia (inclusivo)
  endTime: string
  location: string
  categoryId: string | null
  visibility: Visibility
  participantIds: string[]
  links: LinkDraft[]
}

export interface EventPayload {
  id: string | null
  title: string
  description: string | null
  startAt: string
  endAt: string
  allDay: boolean
  location: string | null
  categoryId: string | null
  visibility: Visibility
  participantIds: string[]
  links: { url: string; title: string | null }[]
}

const BASE: Omit<EventDraft, 'startDate' | 'endDate'> = {
  id: null,
  title: '',
  description: '',
  allDay: false,
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  categoryId: null,
  visibility: 'team',
  participantIds: [],
  links: [],
}

export function emptyDraft(): EventDraft {
  const today = todayInAppZone()
  return { ...BASE, startDate: today, endDate: today }
}

// Seleção no calendário: instantes (horário) ou datas AAAA-MM-DD com fim exclusivo (dia inteiro).
export interface Selection {
  allDay: boolean
  startIso: string
  endIso: string
  startDate: string
  endDate: string
}

export function draftFromSelection(sel: Selection): EventDraft {
  if (sel.allDay) {
    return { ...BASE, allDay: true, startDate: sel.startDate, endDate: addDays(sel.endDate, -1) }
  }
  const start = instantToZoned(sel.startIso)
  const end = instantToZoned(sel.endIso)
  return { ...BASE, startDate: start.date, startTime: start.time, endDate: end.date, endTime: end.time }
}

export function draftFromEvent(e: CalendarEvent): EventDraft {
  const start = instantToZoned(e.startAt)
  const end = instantToZoned(e.endAt)
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? '',
    allDay: e.allDay,
    startDate: start.date,
    startTime: e.allDay ? BASE.startTime : start.time,
    endDate: e.allDay ? addDays(end.date, -1) : end.date,
    endTime: e.allDay ? BASE.endTime : end.time,
    location: e.location ?? '',
    categoryId: e.categoryId,
    visibility: e.visibility,
    participantIds: e.participantIds,
    links: e.links.map((l) => ({ url: l.url, title: l.title ?? '' })),
  }
}

function isHttpUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

// Devolve a primeira mensagem de erro, ou null se o rascunho está ok.
export function validateDraft(d: EventDraft): string | null {
  if (!d.title.trim()) return 'Informe um título.'
  if (!d.startDate || !d.endDate) return 'Informe as datas.'
  if (d.allDay) {
    if (compareDates(d.endDate, d.startDate) < 0) return 'O último dia não pode ser antes do primeiro.'
  } else {
    if (!d.startTime || !d.endTime) return 'Informe os horários.'
    if (zonedToInstant(d.endDate, d.endTime) < zonedToInstant(d.startDate, d.startTime)) {
      return 'O fim não pode ser antes do início.'
    }
  }
  if (d.visibility === 'group' && d.participantIds.length === 0) {
    return 'Evento de grupo precisa de pelo menos uma pessoa além de você.'
  }
  const badLink = d.links.find((l) => l.url.trim() && !isHttpUrl(l.url.trim()))
  if (badLink) return `Link inválido: "${badLink.url}". Use um endereço começando com https://`
  return null
}

export function draftToPayload(d: EventDraft): EventPayload {
  const startAt = d.allDay ? zonedToInstant(d.startDate, '00:00') : zonedToInstant(d.startDate, d.startTime)
  // Dia inteiro: fim exclusivo = meia-noite do dia seguinte ao último.
  const endAt = d.allDay ? zonedToInstant(addDays(d.endDate, 1), '00:00') : zonedToInstant(d.endDate, d.endTime)
  return {
    id: d.id,
    title: d.title.trim(),
    description: d.description.trim() || null,
    startAt,
    endAt,
    allDay: d.allDay,
    location: d.location.trim() || null,
    categoryId: d.categoryId,
    visibility: d.visibility,
    participantIds: d.visibility === 'personal' ? [] : d.participantIds,
    links: d.links
      .filter((l) => l.url.trim())
      .map((l) => ({ url: l.url.trim(), title: l.title.trim() || null })),
  }
}
