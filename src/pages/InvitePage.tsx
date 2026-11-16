import { Link, Navigate, useParams } from 'react-router'
import { INVITE_STATUS_MESSAGES } from '../domain/team'
import { useAcceptInvite } from '../hooks/useAcceptInvite'
import { useAuth } from '../hooks/useAuth'
import { SignUpForm } from '../components/auth/SignUpForm'
import { Button } from '../components/ui/Button'
import { CenteredCard } from '../components/ui/CenteredCard'
import { FormMessage } from '../components/ui/FormMessage'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import styles from '../components/auth/AuthForm.module.css'

// Página do link de convite (RF-04). É o único lugar onde dá pra criar conta.
export function InvitePage() {
  const { token = '' } = useParams()
  const path = `/convite/${encodeURIComponent(token)}`
  const { status: authStatus, access, user, logout } = useAuth()
  const { accept, status, loading, error } = useAcceptInvite(token)

  if (authStatus === 'loading') return <LoadingScreen />

  if (authStatus === 'signed_out') {
    return (
      <CenteredCard title="Você foi convidado para a equipe" showLogo>
        <p>Crie sua conta para entrar na Agenda MãoNaRoda. Depois de confirmar o e-mail, você volta para este link.</p>
        <SignUpForm returnPath={path} />
        <div className={styles.links}>
          <Link to="/entrar" state={{ from: path }}>
            Já tenho conta: entrar
          </Link>
        </div>
      </CenteredCard>
    )
  }

  if (status === 'ok') return <Navigate to="/" replace />
  if (access === null) return <LoadingScreen />

  if (access === 'member') {
    return (
      <CenteredCard title="Você já faz parte da equipe" showLogo>
        <Link to="/">Ir para a agenda</Link>
      </CenteredCard>
    )
  }

  if (status) {
    return (
      <CenteredCard title="Não foi possível usar o convite" showLogo>
        <FormMessage tone="error">{INVITE_STATUS_MESSAGES[status]}</FormMessage>
        <Button variant="outline" onClick={() => void logout()}>
          Sair
        </Button>
      </CenteredCard>
    )
  }

  return (
    <CenteredCard title="Entrar na equipe" showLogo>
      <p>
        Você vai entrar na equipe com a conta <strong>{user?.email}</strong>.
      </p>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <Button onClick={() => void accept()} loading={loading}>
        Aceitar convite
      </Button>
      <Button variant="ghost" onClick={() => void logout()}>
        Não é você? Sair
      </Button>
    </CenteredCard>
  )
}
