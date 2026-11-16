import { useState } from 'react'
import { Button } from '../ui/Button'
import styles from './NewInviteLink.module.css'

interface NewInviteLinkProps {
  link: string
  onClose: () => void
}

// Mostra o link recém-gerado. Ele não aparece de novo depois (o banco guarda só o hash).
export function NewInviteLink({ link, onClose }: NewInviteLinkProps) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))
  }

  return (
    <div className={styles.box} role="status">
      <p className={styles.title}>Convite gerado</p>
      <p className={styles.hint}>
        Copie e envie para a pessoa. Por segurança, este link <strong>só aparece agora</strong>. Vale por 7 dias e para
        uma pessoa só.
      </p>
      <input className={styles.input} value={link} readOnly aria-label="Link do convite" onFocus={(e) => e.target.select()} />
      <div className={styles.actions}>
        <Button onClick={copy}>{copied ? 'Copiado!' : 'Copiar link'}</Button>
        <Button variant="ghost" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  )
}
