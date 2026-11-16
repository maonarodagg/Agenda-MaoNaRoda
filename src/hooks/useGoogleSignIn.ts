import { useCallback, useState } from 'react'
import { signInWithGoogle } from '../services/auth'

// Inicia o login Google e volta pro caminho informado.
export function useGoogleSignIn() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(async (returnPath: string) => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle(`${window.location.origin}${returnPath}`)
    } catch {
      setError('Não foi possível abrir o login do Google. Tente de novo.')
      setLoading(false)
    }
  }, [])

  return { signIn, loading, error }
}
