import { useState, type FormEvent } from 'react'
import { validateDraft, type EventDraft } from '../../domain/eventDraft'
import type { Category } from '../../domain/events'
import type { Member } from '../../domain/team'
import { Button } from '../ui/Button'
import { FormMessage } from '../ui/FormMessage'
import { DateTimeFields } from './DateTimeFields'
import { LinksEditor } from './LinksEditor'
import { ParticipantPicker } from './ParticipantPicker'
import { VisibilityField } from './VisibilityField'
import styles from './EventForm.module.css'

interface EventFormProps {
  initial: EventDraft
  categories: Category[]
  otherMembers: Member[] // membros que podem ser participantes (sem o criador)
  saving: boolean
  error: string | null
  onSubmit: (draft: EventDraft) => void
  onCancel: () => void
}

// Formulário de criar/editar evento (RF-10).
export function EventForm({ initial, categories, otherMembers, saving, error, onSubmit, onCancel }: EventFormProps) {
  const [draft, setDraft] = useState<EventDraft>(initial)
  const [validation, setValidation] = useState<string | null>(null)
  const change = (patch: Partial<EventDraft>) => setDraft((d) => ({ ...d, ...patch }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const problem = validateDraft(draft)
    setValidation(problem)
    if (!problem) onSubmit(draft)
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <label className={styles.field}>
        <span className={styles.label}>Título</span>
        <input
          className={styles.input}
          value={draft.title}
          maxLength={200}
          required
          autoFocus
          onChange={(e) => change({ title: e.target.value })}
        />
      </label>

      <DateTimeFields draft={draft} onChange={change} />

      <label className={styles.field}>
        <span className={styles.label}>Categoria</span>
        <select
          className={styles.select}
          value={draft.categoryId ?? ''}
          onChange={(e) => change({ categoryId: e.target.value || null })}
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <VisibilityField value={draft.visibility} onChange={(visibility) => change({ visibility })} />

      {draft.visibility !== 'personal' && (
        <ParticipantPicker
          members={otherMembers}
          selected={draft.participantIds}
          required={draft.visibility === 'group'}
          onChange={(participantIds) => change({ participantIds })}
        />
      )}

      <label className={styles.field}>
        <span className={styles.label}>Local ou link da reunião</span>
        <input
          className={styles.input}
          value={draft.location}
          maxLength={500}
          placeholder="Ex.: Sala 3, ou https://meet.google.com/..."
          onChange={(e) => change({ location: e.target.value })}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Descrição</span>
        <textarea
          className={styles.textarea}
          value={draft.description}
          maxLength={5000}
          onChange={(e) => change({ description: e.target.value })}
        />
      </label>

      <LinksEditor links={draft.links} onChange={(links) => change({ links })} />

      {(validation ?? error) && <FormMessage tone="error">{validation ?? error}</FormMessage>}

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Salvar
        </Button>
      </div>
    </form>
  )
}
