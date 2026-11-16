// Estado de acesso devolvido pelo banco (get_access_state).
export type AccessState = 'member' | 'can_create_team' | 'no_access'

export function toAccessState(value: unknown): AccessState {
  if (value === 'member' || value === 'can_create_team') return value
  return 'no_access'
}

// Dados mínimos do usuário logado.
export interface CurrentUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}
