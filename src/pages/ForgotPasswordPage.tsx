import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { usePasswordResetRequest } from '../hooks/useAuthActions'
import { Button } from '../components/ui/Button'
import { CenteredCard } from '../components/ui/CenteredCard'
import { FormMessage } from '../components/ui/FormMessage'
import { TextField } from '../components/ui/TextField'
import styles from '../components/auth/AuthForm.module.css'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const { run, loading, error, done } = usePasswordResetRequest()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void run(email.trim(), `${window.location.origin}/nova-senha`)
  }

  return (
    <CenteredCard title="Esqueci minha senha" showLogo>
      {done ? (
        // Mesma mensagem exista a conta ou não, pra não revelar quem tem cadastro.
        <FormMessage tone="success">
          Se existir uma conta com <strong>{email}</strong>, enviamos um link para criar uma nova senha.
        </FormMessage>
      ) : (
        <form className={styles.form} onSubmit={onSubmit}>
          <p>Informe seu e-mail. Vamos enviar um link para você criar uma nova senha.</p>
          <TextField label="E-mail" type="email" value={email} onChange={setEmail} required autoComplete="email" />
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <Button type="submit" loading={loading}>
            Enviar link
          </Button>
        </form>
      )}
      <div className={styles.links}>
        <Link to="/entrar">Voltar para o login</Link>
      </div>
    </CenteredCard>
  )
}
