import { displayName, toInviteStatus, type InviteStatus, type PendingInvite } from '../domain/team'
import { supabase } from '../lib/supabase'

// Gera convite e devolve o token puro (só aparece agora; o banco guarda o hash).
export async function createInvite(): Promise<string> {
  const { data, error } = await supabase.rpc('create_invite')
  if (error) throw error
  return data
}

// Convites ainda válidos: não usados, não revogados e dentro do prazo.
export async function listPendingInvites(): Promise<PendingInvite[]> {
  const { data, error } = await supabase
    .from('invites')
    .select('id, created_at, expires_at, creator:profiles!invites_created_by_fkey(full_name, email)')
    .is('used_at', null)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    createdByName: row.creator ? displayName(row.creator.full_name, row.creator.email) : null,
  }))
}

export async function revokeInvite(inviteId: string): Promise<void> {
  const { error } = await supabase.rpc('revoke_invite', { p_invite_id: inviteId })
  if (error) throw error
}

export async function acceptInvite(token: string): Promise<InviteStatus> {
  const { data, error } = await supabase.rpc('accept_invite', { p_token: token })
  if (error) throw error
  return toInviteStatus(data)
}
