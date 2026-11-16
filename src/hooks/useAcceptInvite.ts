import { useCallback, useState } from 'react'
import type { InviteStatus } from '../domain/team'
import { acceptInvite } from '../services/invites'
import { useAuth } from './useAuth'

// Usa o convite e, se deu certo, atualiza o acesso (vira membro).
export function useAcceptInvite(token: string) {
  const { refreshAccess } = useAuth()
  const [status, setStatus] = useState<InviteStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const accept = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await acceptInvite(token)
      setStatus(result)
      if (result === 'ok' || result === 'already_member') await refreshAccess()
    } catch {
      setError('Não foi possível usar o convite. Tente de novo.')
    } finally {
      setLoading(false)
    }
  }, [token, refreshAccess])

  return { accept, status, loading, error }
}
