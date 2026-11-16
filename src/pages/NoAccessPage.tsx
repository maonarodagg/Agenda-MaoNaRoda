import { Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { CenteredCard } from '../components/ui/CenteredCard'
import { LoadingScreen } from '../components/ui/LoadingScreen'

// Logado no Google, mas sem convite aceito (RF-05).
export function NoAccessPage() {
  const { status, access, user, logout } = useAuth()

  if (status === 'loading' || (status === 'signed_in' && access === null)) return <LoadingScreen />
  if (status === 'signed_out') return <Navigate to="/entrar" replace />
  if (access === 'member') return <Navigate to="/" replace />
  if (access === 'can_create_team') return <Navigate to="/criar-equipe" replace />

  return (
    <CenteredCard title="Você precisa de um convite" showLogo>
      <p>
        A conta <strong>{user?.email}</strong> ainda não faz parte da equipe. Peça a um membro um link de convite e abra
        o link com esta conta.
      </p>
      <Button variant="outline" onClick={() => void logout()}>
        Entrar com outra conta
      </Button>
    </CenteredCard>
  )
}
