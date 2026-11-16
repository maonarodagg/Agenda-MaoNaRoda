import { useCallback, useState } from 'react'
import { buildInviteUrl } from '../domain/team'
import { createInvite, listPendingInvites, revokeInvite } from '../services/invites'
import { useAsyncAction } from './useAsyncAction'
import { useAsyncData } from './useAsyncData'

const createErrorMessage = () => 'Não foi possível gerar o convite. Tente de novo.'
const revokeErrorMessage = () => 'Não foi possível revogar. O convite pode já ter sido usado.'

// Convites pendentes, geração de link novo e revogação.
export function useInvites() {
  const { data, error, loading, reload } = useAsyncData(listPendingInvites, 'Não foi possível carregar os convites.')
  // Link recém-gerado: só existe na memória desta tela.
  const [newLink, setNewLink] = useState<string | null>(null)

  const generate = useCallback(async () => {
    const token = await createInvite()
    setNewLink(buildInviteUrl(window.location.origin, token))
    reload()
  }, [reload])

  const revokeAndReload = useCallback(
    async (inviteId: string) => {
      await revokeInvite(inviteId)
      reload()
    },
    [reload],
  )

  const create = useAsyncAction(generate, createErrorMessage)
  const revoke = useAsyncAction(revokeAndReload, revokeErrorMessage)

  return {
    invites: data ?? [],
    loading,
    error: error ?? create.error ?? revoke.error,
    newLink,
    clearNewLink: () => setNewLink(null),
    generate: create.run,
    generating: create.loading,
    revoke: revoke.run,
    revoking: revoke.loading,
  }
}
