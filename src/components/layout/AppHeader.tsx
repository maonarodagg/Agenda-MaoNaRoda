import { NavLink } from 'react-router'
import { ThemeToggle } from '../ui/ThemeToggle'
import { Logo } from './Logo'
import { NAV_ITEMS } from './navItems'
import styles from './AppHeader.module.css'

export function AppHeader() {
  return (
    <header className={styles.header}>
      <NavLink to="/" className={styles.brand} aria-label="Agenda MãoNaRoda, início">
        <Logo />
      </NavLink>
      <nav className={styles.nav} aria-label="Principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.actions}>
        <ThemeToggle />
      </div>
    </header>
  )
}
