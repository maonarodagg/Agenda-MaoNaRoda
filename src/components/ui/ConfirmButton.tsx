import { useState } from 'react'
import { Button } from './Button'
import styles from './ConfirmButton.module.css'

interface ConfirmButtonProps {
  label: string
  confirmLabel: string
  onConfirm: () => void
  disabled?: boolean
}

// Ação perigosa em dois cliques: primeiro pede confirmação, depois executa.
export function ConfirmButton({ label, confirmLabel, onConfirm, disabled }: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false)

  if (!asking) {
    return (
      <Button variant="ghost" className={styles.small} onClick={() => setAsking(true)} disabled={disabled}>
        {label}
      </Button>
    )
  }

  return (
    <span className={styles.group}>
      <Button
        variant="danger"
        className={styles.small}
        disabled={disabled}
        onClick={() => {
          setAsking(false)
          onConfirm()
        }}
      >
        {confirmLabel}
      </Button>
      <Button variant="ghost" className={styles.small} onClick={() => setAsking(false)}>
        Cancelar
      </Button>
    </span>
  )
}
