import { useCallback, useState } from 'react'
import { createTeam } from '../services/team'
import { useAuth } from './useAuth'

const ERRORS: Record<string, string> = {
  not_allowed: 'Só o dono configurado pode criar a equipe.',
  team_exists: 'A equipe já existe. Peça um convite a um membro.',
}

export function useCreateTeam() {
  const { refreshAccess } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async (name: string) => {
      setLoading(true)
      setError(null)
      try {
        await createTeam(name)
        await refreshAccess()
      } catch (e) {
        const code = e instanceof Error ? e.message : ''
        setError(ERRORS[code] ?? 'Não foi possível criar a equipe. Tente de novo.')
      } finally {
        setLoading(false)
      }
    },
    [refreshAccess],
  )

  return { submit, loading, error }
}
