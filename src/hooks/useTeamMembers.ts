import { listMembers } from '../services/team'
import { useAsyncData } from './useAsyncData'

// Só a lista de membros (pra escolher participantes e mostrar nomes).
export function useTeamMembers() {
  const { data, error } = useAsyncData(listMembers, 'Não foi possível carregar os membros.')
  return { members: data ?? [], error }
}
