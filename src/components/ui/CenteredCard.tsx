import type { ReactNode } from 'react'
import styles from './CenteredCard.module.css'

interface CenteredCardProps {
  title: string
  children: ReactNode
  showLogo?: boolean
}

// Cartão centralizado pras telas fora do app (login, convite, sem acesso).
export function CenteredCard({ title, children, showLogo = false }: CenteredCardProps) {
  return (
    <div className={styles.page}>
      <section className={styles.card}>
        {showLogo && <span className={styles.logo} role="img" aria-label="MãoNaRoda" />}
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.body}>{children}</div>
      </section>
    </div>
  )
}
