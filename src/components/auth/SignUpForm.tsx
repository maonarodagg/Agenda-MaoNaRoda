import { useState, type FormEvent } from 'react'
import { MIN_PASSWORD_LENGTH, validateNewPassword } from '../../domain/password'
import { useSignUp } from '../../hooks/useAuthActions'
import { Button } from '../ui/Button'
import { FormMessage } from '../ui/FormMessage'
import { TextField } from '../ui/TextField'
import styles from './AuthForm.module.css'

interface SignUpFormProps {
  // Caminho pra onde o link de confirmação leva (ex.: /convite/<token>).
  returnPath: string
}

// Cadastro com nome, e-mail e senha. Só aparece no convite e na criação da equipe.
export function SignUpForm({ returnPath }: SignUpFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const { run, loading, error, done, setError } = useSignUp()

  if (done) {
    return (
      <FormMessage tone="success">
        Enviamos um link de confirmação para <strong>{email}</strong>. Abra o link para ativar a conta e continuar.
      </FormMessage>
    )
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const problem = validateNewPassword(password, confirmation)
    if (problem) {
      setError(problem)
      return
    }
    void run(name.trim(), email.trim(), password, `${window.location.origin}${returnPath}`)
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <TextField label="Nome" value={name} onChange={setName} maxLength={80} required autoComplete="name" />
      <TextField label="E-mail" type="email" value={email} onChange={setEmail} required autoComplete="email" />
      <TextField
        label={`Senha (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}
        type="password"
        value={password}
        onChange={setPassword}
        minLength={MIN_PASSWORD_LENGTH}
        required
        autoComplete="new-password"
      />
      <TextField
        label="Confirmar senha"
        type="password"
        value={confirmation}
        onChange={setConfirmation}
        required
        autoComplete="new-password"
      />
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <Button type="submit" loading={loading} disabled={!name.trim() || !email.trim()}>
        Criar conta
      </Button>
    </form>
  )
}
