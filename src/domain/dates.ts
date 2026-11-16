// Datas: guardadas em UTC, mostradas no fuso de Brasília (RN-07).
export const APP_TIME_ZONE = 'America/Sao_Paulo'
export const APP_LOCALE = 'pt-BR'

const dateTimeFormat = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const dateFormat = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso))
}

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso))
}

// en-CA formata como AAAA-MM-DD.
const isoDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// Data (AAAA-MM-DD) do instante no fuso de Brasília.
export function toZonedDateString(iso: string): string {
  return isoDateFormat.format(new Date(iso))
}
