import { createContext } from 'react'
import type { AuthState } from './useAuthState'

export const AuthContext = createContext<AuthState | null>(null)
