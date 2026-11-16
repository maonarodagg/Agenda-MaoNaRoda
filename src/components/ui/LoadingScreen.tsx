import styles from './LoadingScreen.module.css'

export function LoadingScreen() {
  return (
    <div className={styles.screen} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>Carregando…</span>
    </div>
  )
}
