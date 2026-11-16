// Tipos e regras da equipe, membros e convites (sem React, sem Supabase).

export interface Team {
  id: string
  name: string
  ownerId: string
}

export interface Member {
  userId: string
  name: string
  email: string
  joinedAt: string
}

export interface PendingInvite {
  id: string
  createdAt: string
  expiresAt: string
  createdByName: string | null
}

export type InviteStatus = 'ok' | 'invalid' | 'expired' | 'used' | 'revoked' | 'already_member'

export function toInviteStatus(value: unknown): InviteStatus {
  switch (value) {
    case 'ok':
    case 'expired':
    case 'used':
    case 'revoked':
    case 'already_member':
      return value
    default:
      return 'invalid'
  }
}

export const INVITE_STATUS_MESSAGES: Record<Exclude<InviteStatus, 'ok'>, string> = {
  invalid: 'Este link de convite não existe. Confira se copiou o link inteiro.',
  expired: 'Este convite expirou (vale 7 dias). Peça um novo link a alguém da equipe.',
  used: 'Este convite já foi usado. Cada link vale para uma pessoa só; peça um novo.',
  revoked: 'Este convite foi cancelado. Peça um novo link a alguém da equipe.',
  already_member: 'Você já faz parte da equipe.',
}

export function buildInviteUrl(origin: string, token: string): string {
  return `${origin}/convite/${encodeURIComponent(token)}`
}

// Nome pra mostrar: nome do perfil ou, se vazio, o e-mail.
export function displayName(fullName: string | null, email: string): string {
  return fullName?.trim() ? fullName.trim() : email
}
