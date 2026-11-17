import { useState } from 'react'
import { draftFromEvent, draftToPayload, type EventDraft } from '../../domain/eventDraft'
import { canEditEvent, type CalendarEvent, type Category } from '../../domain/events'
import type { Member } from '../../domain/team'
import { useAuth } from '../../hooks/useAuth'
import { useDeleteEvent, useSaveEvent } from '../../hooks/useEventActions'
import { Modal } from '../ui/Modal'
import { EventDetails } from './EventDetails'
import { EventForm } from './EventForm'

export type EventDialogState = { mode: 'create'; draft: EventDraft } | { mode: 'view'; event: CalendarEvent }

interface EventDialogProps {
  state: EventDialogState
  categories: Category[]
  members: Member[]
  onClose: () => void
  onChanged: () => void // salvou ou excluiu: recarregar o calendário
}

// Abre os detalhes, o formulário de edição ou o de criação.
export function EventDialog({ state, categories, members, onClose, onChanged }: EventDialogProps) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const save = useSaveEvent()
  const remove = useDeleteEvent()
  const userId = user?.id ?? ''

  const nameOf = (id: string) => members.find((m) => m.userId === id)?.name ?? 'ex-membro'

  // Depois de salvar/excluir com sucesso, recarrega o calendário e fecha.
  const finish = (ok: boolean) => {
    if (!ok) return
    onChanged()
    onClose()
  }
  const submit = async (draft: EventDraft) => finish(await save.run(draftToPayload(draft)))
  const confirmDelete = async (eventId: string) => finish(await remove.run(eventId))

  if (state.mode === 'create' || editing) {
    const isCreate = state.mode === 'create'
    const initial = isCreate ? state.draft : draftFromEvent(state.event)
    const creatorId = isCreate ? userId : state.event.createdBy
    return (
      <Modal title={isCreate ? 'Novo evento' : 'Editar evento'} onClose={onClose}>
        <EventForm
          initial={initial}
          categories={categories}
          otherMembers={members.filter((m) => m.userId !== creatorId)}
          saving={save.loading}
          error={save.error}
          onSubmit={(d) => void submit(d)}
          onCancel={isCreate ? onClose : () => setEditing(false)}
        />
      </Modal>
    )
  }

  const { event } = state
  return (
    <Modal title={event.title} onClose={onClose}>
      <EventDetails
        event={event}
        category={categories.find((c) => c.id === event.categoryId) ?? null}
        creatorName={event.createdBy === userId ? 'você' : nameOf(event.createdBy)}
        participantNames={event.participantIds.map((id) => (id === userId ? 'você' : nameOf(id)))}
        canEdit={canEditEvent(event, userId)}
        deleting={remove.loading}
        error={remove.error}
        onEdit={() => setEditing(true)}
        onDelete={() => void confirmDelete(event.id)}
      />
    </Modal>
  )
}
