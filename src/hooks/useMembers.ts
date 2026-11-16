import { useCallback } from 'react'
import type { Member, Team } from '../domain/team'
import { getTeam, listMembers, removeMember } from '../services/team'
import { useAsyncAction } from './useAsyncAction'
import { useAsyncData } from './useAsyncData'

interface MembersData {
  team: Team
  members: Member[]
}

async function loadMembers(): Promise<MembersData> {
  const [team, members] = await Promise.all([getTeam(), listMembers()])
  return { team, members }
}

const removeErrorMessage = () => 'Não foi possível remover. Só o dono da equipe remove membros.'

// Lista de membros + remoção (só o dono consegue; a RLS garante).
export function useMembers() {
  const { data, error, loading, reload } = useAsyncData(loadMembers, 'Não foi possível carregar os membros.')

  const removeAndReload = useCallback(
    async (userId: string) => {
      await removeMember(userId)
      reload()
    },
    [reload],
  )
  const remove = useAsyncAction(removeAndReload, removeErrorMessage)

  return {
    team: data?.team ?? null,
    members: data?.members ?? [],
    loading,
    error,
    remove: remove.run,
    removing: remove.loading,
    removeError: remove.error,
  }
}
