import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { MIN_PASSWORD_LENGTH, validateNewPassword } from '../domain/password'
import { useAuth } from '../hooks/useAuth'
import { useUpdatePassword } from '../hooks/useAuthActions'
import { Button } from '../components/ui/Button'
import { CenteredCard } from '../components/ui/CenteredCard'
import { FormMessage } from '../components/ui/FormMessage'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { TextField } from '../components/ui/TextField'
import styles from '../components/auth/AuthForm.module.css'

// Aberta pelo link de redefinição: o Supabase já loga a pessoa e aqui ela define a senha nova.
export function ResetPasswordPage() {
  const { status } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const { run, loading, error, done, setError } = useUpdatePassword()

  if (status === 'loading') return <LoadingScreen />
  if (done) return <Navigate to="/" replace />

  if (status === 'signed_out') {
    return (
      <CenteredCard title="Link inválido ou expirado" showLogo>
        <p>Peça um novo link para redefinir a senha.</p>
        <div className={styles.links}>
          <Link to="/esqueci-senha">Pedir novo link</Link>
        </div>
      </CenteredCard>
    )
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const problem = validateNewPassword(password, confirmation)
    if (problem) {
      setError(problem)
      return
    }
    void run(password)
  }

  return (
    <CenteredCard title="Nova senha" showLogo>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextField
          label={`Nova senha (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}
          type="password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="new-password"
        />
        <TextField
          label="Confirmar nova senha"
          type="password"
          value={confirmation}
          onChange={setConfirmation}
          required
          autoComplete="new-password"
        />
        {error && <FormMessage tone="error">{error}</FormMessage>}
        <Button type="submit" loading={loading}>
          Salvar nova senha
        </Button>
      </form>
    </CenteredCard>
  )
}
