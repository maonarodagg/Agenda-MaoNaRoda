import type { Session } from '@supabase/supabase-js'
import type { CurrentUser } from '../domain/access'
import { supabase } from '../lib/supabase'

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// Avisa quando o login muda. Devolve a função pra cancelar.
export function onSessionChange(callback: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

// Redireciona pro Google e volta em redirectTo.
export async function signInWithGoogle(redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

function readString(meta: Record<string, unknown>, key: string): string | null {
  const value = meta[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

export function toCurrentUser(session: Session): CurrentUser {
  const meta: Record<string, unknown> = session.user.user_metadata
  const email = session.user.email ?? ''
  return {
    id: session.user.id,
    email,
    name: readString(meta, 'full_name') ?? readString(meta, 'name') ?? email,
    avatarUrl: readString(meta, 'avatar_url') ?? readString(meta, 'picture'),
  }
}
