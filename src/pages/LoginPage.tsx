import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useSignIn } from '../hooks/useAuthActions'
import { Button } from '../components/ui/Button'
import { CenteredCard } from '../components/ui/CenteredCard'
import { FormMessage } from '../components/ui/FormMessage'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { TextField } from '../components/ui/TextField'
import styles from '../components/auth/AuthForm.module.css'

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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { run, loading, error } = useSignIn()

  if (status === 'loading') return <LoadingScreen />
  if (status === 'signed_in') return <Navigate to={from} replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void run(email.trim(), password)
  }

  return (
    <CenteredCard title="Agenda MãoNaRoda" showLogo>
      <form className={styles.form} onSubmit={onSubmit}>
        <TextField label="E-mail" type="email" value={email} onChange={setEmail} required autoComplete="email" />
        <TextField
          label="Senha"
          type="password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
        />
        {error && <FormMessage tone="error">{error}</FormMessage>}
        <Button type="submit" loading={loading}>
          Entrar
        </Button>
      </form>
      <div className={styles.links}>
        <Link to="/esqueci-senha">Esqueci minha senha</Link>
        <span>Não tem conta? Peça um link de convite a alguém da equipe.</span>
      </div>
    </CenteredCard>
  )
}
