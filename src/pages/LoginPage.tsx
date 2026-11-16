import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useGoogleSignIn } from '../hooks/useGoogleSignIn'
import { Button } from '../components/ui/Button'
import { CenteredCard } from '../components/ui/CenteredCard'
import { LoadingScreen } from '../components/ui/LoadingScreen'

function readFrom(state: unknown): string {
  if (state && typeof state === 'object' && 'from' in state && typeof state.from === 'string') {
    return state.from
  }
  return '/'
}

export function LoginPage() {
  const { status } = useAuth()
  const location = useLocation()
  const from = readFrom(location.state)
  const { signIn, loading, error } = useGoogleSignIn()
  const [clicked, setClicked] = useState(false)

  if (status === 'loading') return <LoadingScreen />
  if (status === 'signed_in') return <Navigate to={from} replace />

  return (
    <CenteredCard title="Agenda MãoNaRoda" showLogo>
      <p>Calendário e compromissos da equipe. Entre com sua conta Google.</p>
      <Button
        loading={loading || clicked}
        onClick={() => {
          setClicked(true)
          void signIn(from).finally(() => setClicked(false))
        }}
      >
        Entrar com Google
      </Button>
      {error && <p role="alert">{error}</p>}
    </CenteredCard>
  )
}
