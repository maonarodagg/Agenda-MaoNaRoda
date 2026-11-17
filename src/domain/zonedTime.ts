import { Temporal } from 'temporal-polyfill'
import { APP_TIME_ZONE } from './dates'

// Conversões entre instante UTC e data/hora "de parede" em Brasília.

export interface ZonedParts {
  date: string // AAAA-MM-DD
  time: string // HH:MM
}

export function instantToZoned(iso: string): ZonedParts {
  const zdt = Temporal.Instant.from(iso).toZonedDateTimeISO(APP_TIME_ZONE)
  return {
    date: zdt.toPlainDate().toString(),
    time: zdt.toPlainTime().toString({ smallestUnit: 'minute' }),
  }
}

// Data + hora em Brasília -> ISO em UTC.
export function zonedToInstant(date: string, time: string): string {
  return Temporal.PlainDateTime.from(`${date}T${time}`)
    .toZonedDateTime(APP_TIME_ZONE)
    .toInstant()
    .toString()
}

export function addDays(date: string, days: number): string {
  return Temporal.PlainDate.from(date).add({ days }).toString()
}

export function compareDates(a: string, b: string): number {
  return Temporal.PlainDate.compare(Temporal.PlainDate.from(a), Temporal.PlainDate.from(b))
}

export function todayInAppZone(): string {
  return Temporal.Now.plainDateISO(APP_TIME_ZONE).toString()
}
