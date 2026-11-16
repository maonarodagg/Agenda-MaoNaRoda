// Tipos de evento e categoria (sem React, sem Supabase).

export type Visibility = 'personal' | 'group' | 'team'

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  personal: 'Pessoal (só eu)',
  group: 'Grupo (eu + pessoas escolhidas)',
  team: 'Equipe (todos os membros)',
}

export interface Category {
  id: string
  name: string
  color: string
}

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startAt: string // ISO em UTC
  endAt: string // ISO em UTC (exclusivo no dia inteiro)
  allDay: boolean
  location: string | null
  categoryId: string | null
  visibility: Visibility
  createdBy: string
  participantIds: string[]
}

export interface DateRange {
  start: Date
  end: Date
}
