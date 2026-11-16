import { toAccessState, type AccessState } from '../domain/access'
import { displayName, type Member, type Team } from '../domain/team'
import { supabase } from '../lib/supabase'

export async function getAccessState(): Promise<AccessState> {
  const { data, error } = await supabase.rpc('get_access_state')
  if (error) throw error
  return toAccessState(data)
}

export async function createTeam(name: string): Promise<void> {
  const { error } = await supabase.rpc('create_team', { p_name: name })
  if (error) throw error
}

export async function getTeam(): Promise<Team> {
  const { data, error } = await supabase.from('team').select('id, name, owner_id').single()
  if (error) throw error
  return { id: data.id, name: data.name, ownerId: data.owner_id }
}

export async function listMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('user_id, joined_at, profile:profiles!team_members_user_id_fkey(full_name, email)')
    .order('joined_at')
  if (error) throw error
  return data.map((row) => ({
    userId: row.user_id,
    joinedAt: row.joined_at,
    email: row.profile.email,
    name: displayName(row.profile.full_name, row.profile.email),
  }))
}

// Remove um membro. A RLS só deixa o dono; se nada foi apagado, não tinha permissão.
export async function removeMember(userId: string): Promise<void> {
  const { data, error } = await supabase.from('team_members').delete().eq('user_id', userId).select('user_id')
  if (error) throw error
  if (data.length === 0) throw new Error('not_allowed')
}
