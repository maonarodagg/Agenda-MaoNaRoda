import { formatEventPeriod } from '../../domain/eventFormat'
import { VISIBILITY_SHORT, type CalendarEvent, type Category } from '../../domain/events'
import { Button } from '../ui/Button'
import { ConfirmButton } from '../ui/ConfirmButton'
import { FormMessage } from '../ui/FormMessage'
import styles from './EventDetails.module.css'

interface EventDetailsProps {
  event: CalendarEvent
  category: Category | null
  creatorName: string
  participantNames: string[]
  canEdit: boolean
  deleting: boolean
  error: string | null
  onEdit: () => void
  onDelete: () => void
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

// Detalhes do evento (RF-09). Editar/Excluir só aparecem pra criador e participantes.
export function EventDetails(props: EventDetailsProps) {
  const { event, category, creatorName, participantNames, canEdit, deleting, error, onEdit, onDelete } = props

  return (
    <div className={styles.details}>
      <p className={styles.period}>{formatEventPeriod(event)}</p>

      <div className={styles.tags}>
        {category && (
          <span className={styles.tag}>
            <span className={styles.dot} style={{ background: category.color }} aria-hidden="true" />
            {category.name}
          </span>
        )}
        <span className={styles.tag}>{VISIBILITY_SHORT[event.visibility]}</span>
      </div>

      {event.location && (
        <p>
          <strong>Local: </strong>
          {isHttpUrl(event.location) ? (
            <a href={event.location} target="_blank" rel="noopener noreferrer">
              {event.location}
            </a>
          ) : (
            event.location
          )}
        </p>
      )}

      {event.description && <p className={styles.description}>{event.description}</p>}

      {event.links.length > 0 && (
        <div>
          <strong>Links</strong>
          <ul className={styles.links}>
            {event.links.map((l, i) => (
              <li key={i}>
                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.title ?? l.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className={styles.meta}>
        Criado por {creatorName}
        {participantNames.length > 0 && <> · Participantes: {participantNames.join(', ')}</>}
      </p>

      {error && <FormMessage tone="error">{error}</FormMessage>}

      {canEdit && (
        <div className={styles.actions}>
          <ConfirmButton label="Excluir" confirmLabel="Excluir de vez" onConfirm={onDelete} disabled={deleting} />
          <Button onClick={onEdit}>Editar</Button>
        </div>
      )}
    </div>
  )
}
