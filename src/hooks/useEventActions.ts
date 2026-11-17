import type { EventPayload } from '../domain/eventDraft'
import { deleteEvent, saveEvent } from '../services/events'
import { useAsyncAction } from './useAsyncAction'

const saveMessage = () => 'Não foi possível salvar o evento. Confira os dados e tente de novo.'
const deleteMessage = () => 'Não foi possível excluir. Só quem criou ou participa pode excluir.'

async function save(payload: EventPayload): Promise<void> {
  await saveEvent(payload)
}

export function useSaveEvent() {
  return useAsyncAction(save, saveMessage)
}

export function useDeleteEvent() {
  return useAsyncAction(deleteEvent, deleteMessage)
}
