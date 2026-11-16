import { useCallback, useEffect, useState } from 'react'
import type { AccessState, CurrentUser } from '../domain/access'
import { getSession, onSessionChange, signOut, toCurrentUser } from '../services/auth'
import { getAccessState } from '../services/team'

export type AuthStatus = 'loading' | 'signed_out' | 'signed_in'

export interface AuthState {
  status: AuthStatus
  user: CurrentUser | null
  access: AccessState | null
  error: string | null
  refreshAccess: () => Promise<void>
  logout: () => Promise<void>
}

// Acompanha a sessão e o estado de acesso (membro, pode criar equipe, sem acesso).
export function useAuthState(): AuthState {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [accessEntry, setAccessEntry] = useState<{ userId: string; access: AccessState } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getSession()
      .then((session) => {
        if (!active) return
        setUser(session ? toCurrentUser(session) : null)
        setStatus(session ? 'signed_in' : 'signed_out')
      })
      .catch(() => {
        if (active) setStatus('signed_out')
      })

    const unsubscribe = onSessionChange((session) => {
      setUser((prev) => {
        const next = session ? toCurrentUser(session) : null
        // Evita re-render quando só o token foi renovado.
        return prev?.id === next?.id ? prev : next
      })
      setStatus(session ? 'signed_in' : 'signed_out')
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const userId = user?.id ?? null
  // O acesso fica guardado junto do usuário a que pertence; trocou de usuário, volta a null.
  const access = accessEntry && accessEntry.userId === userId ? accessEntry.access : null

  const refreshAccess = useCallback(async () => {
    if (!userId) return
    try {
      const next = await getAccessState()
      setAccessEntry({ userId, access: next })
      setError(null)
    } catch {
      setError('Não foi possível verificar seu acesso. Tente de novo.')
    }
  }, [userId])

  // Consulta o acesso sempre que o usuário logado muda.
  useEffect(() => {
    if (!userId) return
    let active = true
    getAccessState()
      .then((next) => {
        if (!active) return
        setAccessEntry({ userId, access: next })
        setError(null)
      })
      .catch(() => {
        if (active) setError('Não foi possível verificar seu acesso. Tente de novo.')
      })
    return () => {
      active = false
    }
  }, [userId])

  const logout = useCallback(async () => {
    await signOut()
  }, [])

  return { status, user, access, error, refreshAccess, logout }
}
