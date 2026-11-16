import { useContext } from 'react'
import { AuthContext } from './authContext'
import type { AuthState } from './useAuthState'

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
