import { useTheme } from '../../hooks/useTheme'
import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { resolved, toggle } = useTheme()
  const label = resolved === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'

  return (
    <button type="button" className={styles.button} onClick={toggle} aria-label={label} title={label}>
      <span aria-hidden="true">{resolved === 'dark' ? '☀' : '☾'}</span>
    </button>
  )
}
