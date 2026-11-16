import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useCreateTeam } from '../hooks/useCreateTeam'
import { SignUpForm } from '../components/auth/SignUpForm'
import { Button } from '../components/ui/Button'
import { CenteredCard } from '../components/ui/CenteredCard'
import { FormMessage } from '../components/ui/FormMessage'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { TextField } from '../components/ui/TextField'
import styles from '../components/auth/AuthForm.module.css'

const PATH = '/criar-equipe'

export function CreateTeamPage() {
  const { status, access } = useAuth()
  const { submit, loading, error } = useCreateTeam()
  const [name, setName] = useState('MãoNaRoda')

  if (status === 'loading' || (status === 'signed_in' && access === null)) return <LoadingScreen />

  // Deslogado: cadastro do dono. Só o e-mail configurado no banco consegue criar a equipe depois.
  if (status === 'signed_out') {
    return (
      <CenteredCard title="Primeiro acesso do dono" showLogo>
        <p>Crie a sua conta com o e-mail de dono da equipe. Depois de confirmar o e-mail, você cria a equipe.</p>
        <SignUpForm returnPath={PATH} />
        <div className={styles.links}>
          <Link to="/entrar" state={{ from: PATH }}>
            Já tenho conta: entrar
          </Link>
        </div>
      </CenteredCard>
    )
  }

  if (access === 'member') return <Navigate to="/" replace />
  if (access === 'no_access') return <Navigate to="/sem-acesso" replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim()) void submit(name.trim())
  }

  return (
    <CenteredCard title="Criar a equipe" showLogo>
      <p>Você é o dono. Depois de criar, gere convites para o resto da equipe.</p>
      <form className={styles.form} onSubmit={onSubmit}>
        <TextField label="Nome da equipe" value={name} onChange={setName} maxLength={80} required />
        {error && <FormMessage tone="error">{error}</FormMessage>}
        <Button type="submit" loading={loading}>
          Criar equipe
        </Button>
      </form>
    </CenteredCard>
  )
}
