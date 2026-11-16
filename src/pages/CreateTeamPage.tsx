import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useCreateTeam } from '../hooks/useCreateTeam'
import { Button } from '../components/ui/Button'
import { CenteredCard } from '../components/ui/CenteredCard'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { TextField } from '../components/ui/TextField'

export function CreateTeamPage() {
  const { status, access } = useAuth()
  const { submit, loading, error } = useCreateTeam()
  const [name, setName] = useState('MãoNaRoda')

  if (status === 'loading' || (status === 'signed_in' && access === null)) return <LoadingScreen />
  if (status === 'signed_out') return <Navigate to="/entrar" replace />
  if (access === 'member') return <Navigate to="/" replace />
  if (access === 'no_access') return <Navigate to="/sem-acesso" replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim()) void submit(name.trim())
  }

  return (
    <CenteredCard title="Criar a equipe" showLogo>
      <p>Você é o dono. Depois de criar, gere convites para o resto da equipe.</p>
      <form onSubmit={onSubmit}>
        <TextField label="Nome da equipe" value={name} onChange={setName} maxLength={80} required />
        <Button type="submit" loading={loading}>
          Criar equipe
        </Button>
      </form>
      {error && <p role="alert">{error}</p>}
    </CenteredCard>
  )
}
