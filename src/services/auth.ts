import type { AuthError, Session } from '@supabase/supabase-js'
import type { CurrentUser } from '../domain/access'
import { AuthFailure } from '../domain/authErrors'
import { supabase } from '../lib/supabase'

function fail(error: AuthError): never {
  throw new AuthFailure(error.code ?? 'unknown')
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) fail(error)
  return data.session
}

// Avisa quando o login muda. Devolve a função pra cancelar.
export function onSessionChange(callback: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) fail(error)
}

// Cria a conta. O Supabase manda o link de confirmação, que volta em redirectTo.
export async function signUp(name: string, email: string, password: string, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo, data: { full_name: name } },
  })
  if (error) fail(error)
}

// Envia o link de redefinição de senha.
export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) fail(error)
}

// Troca a senha do usuário logado (usado depois do link de redefinição).
export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) fail(error)
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) fail(error)
}

export function toCurrentUser(session: Session): CurrentUser {
  const meta: Record<string, unknown> = session.user.user_metadata
  const email = session.user.email ?? ''
  const fullName = meta['full_name']
  return {
    id: session.user.id,
    email,
    name: typeof fullName === 'string' && fullName.trim() ? fullName.trim() : email,
    avatarUrl: null,
  }
}
