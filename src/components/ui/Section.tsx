import type { ReactNode } from 'react'
import styles from './Section.module.css'

interface SectionProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

// Cartão com título, usado nas telas internas.
export function Section({ title, description, action, children }: SectionProps) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
