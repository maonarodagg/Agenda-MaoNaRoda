import type { EventDraft } from '../../domain/eventDraft'
import styles from './EventForm.module.css'

interface DateTimeFieldsProps {
  draft: EventDraft
  onChange: (patch: Partial<EventDraft>) => void
}

// Início/fim e "dia inteiro". Horários sempre em Brasília.
export function DateTimeFields({ draft, onChange }: DateTimeFieldsProps) {
  return (
    <>
      <label className={styles.check}>
        <input type="checkbox" checked={draft.allDay} onChange={(e) => onChange({ allDay: e.target.checked })} />
        Dia inteiro
      </label>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>{draft.allDay ? 'Primeiro dia' : 'Data de início'}</span>
          <input
            className={styles.input}
            type="date"
            value={draft.startDate}
            required
            onChange={(e) => {
              // Ao mudar o início, o fim acompanha se ficaria antes.
              const startDate = e.target.value
              onChange(startDate > draft.endDate ? { startDate, endDate: startDate } : { startDate })
            }}
          />
        </label>
        {!draft.allDay && (
          <label className={styles.field}>
            <span className={styles.label}>Hora de início</span>
            <input
              className={styles.input}
              type="time"
              value={draft.startTime}
              required
              onChange={(e) => onChange({ startTime: e.target.value })}
            />
          </label>
        )}
        <label className={styles.field}>
          <span className={styles.label}>{draft.allDay ? 'Último dia' : 'Data de fim'}</span>
          <input
            className={styles.input}
            type="date"
            value={draft.endDate}
            required
            onChange={(e) => onChange({ endDate: e.target.value })}
          />
        </label>
        {!draft.allDay && (
          <label className={styles.field}>
            <span className={styles.label}>Hora de fim</span>
            <input
              className={styles.input}
              type="time"
              value={draft.endTime}
              required
              onChange={(e) => onChange({ endTime: e.target.value })}
            />
          </label>
        )}
      </div>
      <p className={styles.hint}>Horário de Brasília.</p>
    </>
  )
}
