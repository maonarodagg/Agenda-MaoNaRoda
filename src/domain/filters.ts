import type { CalendarEvent } from './events'

// Filtros do calendário (RF-08). Só escolhem o que mostrar entre o que a RLS já liberou.

export type FilterScope = 'all' | 'mine' | 'person'

export const NO_CATEGORY = 'none'

export interface CalendarFilter {
  scope: FilterScope
  personId: string | null // usado quando scope = 'person'
  categoryIds: string[] // vazio = todas; NO_CATEGORY = eventos sem categoria
}

export const DEFAULT_FILTER: CalendarFilter = { scope: 'all', personId: null, categoryIds: [] }

// A pessoa "está" no evento se criou ou participa.
function involves(event: CalendarEvent, userId: string): boolean {
  return event.createdBy === userId || event.participantIds.includes(userId)
}

export function matchesFilter(event: CalendarEvent, filter: CalendarFilter, currentUserId: string): boolean {
  if (filter.scope === 'mine' && !involves(event, currentUserId)) return false
  if (filter.scope === 'person' && filter.personId && !involves(event, filter.personId)) return false

  if (filter.categoryIds.length > 0) {
    const key = event.categoryId ?? NO_CATEGORY
    if (!filter.categoryIds.includes(key)) return false
  }
  return true
}

export function isFilterActive(filter: CalendarFilter): boolean {
  return filter.scope !== 'all' || filter.categoryIds.length > 0
}
