import { toAccessState, type AccessState } from '../domain/access'
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
