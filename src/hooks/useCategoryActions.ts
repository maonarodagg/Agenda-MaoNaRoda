import { useCallback } from 'react'
import { CategoryError, createCategory, deleteCategory, updateCategory } from '../services/categories'
import { useAsyncAction } from './useAsyncAction'

const toMessage = (e: unknown) => (e instanceof CategoryError ? e.message : 'Algo deu errado. Tente de novo.')

// Criar, editar e excluir categorias; chama onChanged depois pra recarregar a lista.
export function useCategoryActions(onChanged: () => void) {
  const create = useCallback(
    async (name: string, color: string) => {
      await createCategory(name, color)
      onChanged()
    },
    [onChanged],
  )
  const update = useCallback(
    async (id: string, name: string, color: string) => {
      await updateCategory(id, name, color)
      onChanged()
    },
    [onChanged],
  )
  const remove = useCallback(
    async (id: string) => {
      await deleteCategory(id)
      onChanged()
    },
    [onChanged],
  )

  const createAction = useAsyncAction(create, toMessage)
  const updateAction = useAsyncAction(update, toMessage)
  const removeAction = useAsyncAction(remove, toMessage)

  // Uma ação nova apaga o erro antigo das outras (só um erro na tela por vez).
  const clearAll = () => {
    createAction.setError(null)
    updateAction.setError(null)
    removeAction.setError(null)
  }

  const runCreate = (name: string, color: string) => {
    clearAll()
    return createAction.run(name, color)
  }
  const runUpdate = (id: string, name: string, color: string) => {
    clearAll()
    return updateAction.run(id, name, color)
  }
  const runRemove = (id: string) => {
    clearAll()
    return removeAction.run(id)
  }

  return {
    create: { ...createAction, run: runCreate },
    update: { ...updateAction, run: runUpdate },
    remove: { ...removeAction, run: runRemove },
  }
}
